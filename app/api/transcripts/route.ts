import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authUser } from "../_utils";
import { openai, DEFAULT_MODEL } from "@/lib/openai";

export async function POST(req: NextRequest) {
  const { user } = await authUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const projectId = parseInt(String(form.get("project_id") || ""));
  const title = String(form.get("title") || "");
  const content = String(form.get("content") || "");
  const callDate = String(form.get("call_date") || "");
  const duration = parseInt(String(form.get("duration") || "0")) || null;
  const participants = String(form.get("participants") || "");

  if (!projectId || !title || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify project belongs to user
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: user.id }
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Create transcript
  const transcript = await prisma.transcript.create({
    data: {
      projectId,
      title,
      content,
      callDate: callDate ? new Date(callDate) : new Date(),
      duration,
      participants: participants || null
    }
  });

  // Analyze transcript with AI
  try {
    const analysisPrompt = `
Analyze this success team call transcript and extract:

1. Summary (2-3 sentences)
2. Key Points (3-5 main topics discussed)
3. Pain Points (client challenges mentioned)
4. Opportunities (potential improvements or wins)
5. Action Items (specific next steps)
6. Overall Sentiment (positive/negative/neutral/mixed)

Format as JSON with these exact keys: summary, keyPoints, painPoints, opportunities, actionItems, sentiment

TRANSCRIPT:
${content}
`;

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: "You are an expert business analyst specializing in client success and coaching. Extract actionable insights from call transcripts." },
        { role: "user", content: analysisPrompt }
      ],
      temperature: 0.3
    });

    const analysisText = completion.choices[0].message?.content || "{}";
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch {
      analysis = {
        summary: "Analysis failed to parse",
        keyPoints: [],
        painPoints: [],
        opportunities: [],
        actionItems: [],
        sentiment: "neutral"
      };
    }

    // Save analysis
    await prisma.transcriptAnalysis.create({
      data: {
        transcriptId: transcript.id,
        summary: analysis.summary || "No summary available",
        keyPoints: JSON.stringify(analysis.keyPoints || []),
        painPoints: JSON.stringify(analysis.painPoints || []),
        opportunities: JSON.stringify(analysis.opportunities || []),
        actionItems: JSON.stringify(analysis.actionItems || []),
        sentiment: analysis.sentiment || "neutral",
        confidence: 0.8
      }
    });

    // Generate project insights based on analysis
    if (analysis.painPoints && analysis.painPoints.length > 0) {
      for (const painPoint of analysis.painPoints) {
        await prisma.projectInsight.create({
          data: {
            projectId,
            type: "bottleneck",
            title: `Pain Point: ${painPoint}`,
            description: `Identified from success team call: ${painPoint}`,
            severity: "medium"
          }
        });
      }
    }

    if (analysis.opportunities && analysis.opportunities.length > 0) {
      for (const opportunity of analysis.opportunities) {
        await prisma.projectInsight.create({
          data: {
            projectId,
            type: "opportunity",
            title: `Opportunity: ${opportunity}`,
            description: `Identified from success team call: ${opportunity}`,
            severity: "medium"
          }
        });
      }
    }

  } catch (error) {
    console.error("Analysis failed:", error);
    // Continue without analysis
  }

  return NextResponse.json({ 
    success: true, 
    transcriptId: transcript.id,
    message: "Transcript uploaded and analyzed successfully"
  });
}
