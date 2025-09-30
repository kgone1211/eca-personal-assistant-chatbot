import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { grok, GrokTrendAnalysis } from "@/lib/grok";
import { authUser } from "../_utils";

export async function GET(req: NextRequest) {
  try {
    console.log("Trend analysis API called");
    const { user } = await authUser(req);
    console.log("Auth result:", { user: user ? { id: user.id, licenseKey: user.licenseKey } : null });
    
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    console.log("Fetching data for user:", user.id);
    // Fetch all relevant data for trend analysis
    console.log("Fetching transcripts, training blobs, and insights...");
    const [transcripts, trainingBlobs, insights] = await Promise.all([
      // Get transcripts with analysis
      prisma.transcript.findMany({
        where: { project: { userId: user.id } },
        include: { analysis: true },
        orderBy: { createdAt: "desc" },
        take: 50 // Last 50 transcripts for analysis
      }),
      
      // Get training data
      prisma.trainingBlob.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20 // Last 20 training blobs
      }),
      
      // Get project insights
      prisma.projectInsight.findMany({
        where: { project: { userId: user.id } },
        orderBy: { createdAt: "desc" },
        take: 30 // Last 30 insights
      })
    ]);

    console.log("Data fetched:", {
      transcripts: transcripts.length,
      trainingBlobs: trainingBlobs.length,
      insights: insights.length
    });

    // Prepare data for Grok analysis
    const analysisData = {
      transcripts: transcripts.map(t => ({
        content: t.content,
        callDate: t.callDate.toISOString(),
        participants: t.participants || undefined,
        analysis: t.analysis
      })),
      trainingBlobs: trainingBlobs.map(b => ({
        content: b.content,
        createdAt: b.createdAt.toISOString(),
        voiceVersion: b.voiceVersion
      })),
      insights: insights.map(i => ({
        type: i.type,
        title: i.title,
        description: i.description,
        severity: i.severity,
        createdAt: i.createdAt.toISOString()
      }))
    };

    // Get trend analysis from Grok
    console.log("Calling Grok analysis...");
    const trends: GrokTrendAnalysis = await grok.analyzeTrends(analysisData);
    console.log("Grok analysis completed");

    // Store trend analysis results for caching
    console.log("Storing trend analysis results...");
    await prisma.trendAnalysis.create({
      data: {
        userId: user.id,
        analysisData: JSON.stringify(trends),
        createdAt: new Date()
      }
    });
    console.log("Trend analysis stored successfully");

    return NextResponse.json({
      trends,
      metadata: {
        transcriptsAnalyzed: transcripts.length,
        trainingDataPoints: trainingBlobs.length,
        insightsProcessed: insights.length,
        analysisDate: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in trend analysis:', error);
    return NextResponse.json(
      { error: "Failed to analyze trends" }, 
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { user } = await authUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action, data } = body;

    switch (action) {
      case 'generate_insight':
        // Generate new insight based on trend analysis
        const insight = await generateInsightFromTrends(user.id, data);
        return NextResponse.json({ insight });

      case 'update_trends':
        // Force refresh of trend analysis
        const trends = await refreshTrendAnalysis(user.id);
        return NextResponse.json({ trends });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in trend analysis POST:', error);
    return NextResponse.json(
      { error: "Failed to process trend analysis request" }, 
      { status: 500 }
    );
  }
}

async function generateInsightFromTrends(userId: number, trendData: any) {
  // Generate actionable insight based on trend analysis
  const { openai } = await import('@/lib/openai');
  
  const prompt = `
    Based on this trend analysis data, generate a specific, actionable insight for a coach:
    
    ${JSON.stringify(trendData, null, 2)}
    
    Provide:
    1. A clear, specific insight
    2. The category (pain_point, opportunity, success_pattern, or risk)
    3. Severity level
    4. Recommended action
    5. Expected impact
    
    Format as JSON.
  `;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an expert coaching consultant analyzing trends to generate actionable insights.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.4
  });

  return JSON.parse(completion.choices[0].message?.content || '{}');
}

async function refreshTrendAnalysis(userId: number) {
  // Force refresh trend analysis by clearing cache and re-analyzing
  await prisma.trendAnalysis.deleteMany({
    where: { userId }
  });

  // This would trigger a new analysis
  // Implementation depends on your caching strategy
  return { message: "Trend analysis refreshed" };
}
