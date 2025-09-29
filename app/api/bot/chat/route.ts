import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { openai, DEFAULT_MODEL } from "@/lib/openai";
import { buildSystemPrompt } from "@/lib/prompt";
import { authUser } from "../../_utils";

async function latestCoachNotes(userId: number){
  const blobs = await prisma.trainingBlob.findMany({ where: { userId }, orderBy: { createdAt: "desc" }});
  if (!blobs.length) return "No coach notes provided yet.";
  const maxV = Math.max(...blobs.map(b=> b.voiceVersion));
  const newest = blobs.filter(b=> b.voiceVersion === maxV);
  const text = newest.map(b=> b.content).join("\n\n");
  return text.slice(0, 10000);
}

export async function POST(req: NextRequest) {
  try {
    console.log("Chat API called");
    const { user } = await authUser(req);
    console.log("Auth result:", { user: user ? { id: user.id, licenseKey: user.licenseKey } : null });
    if (!user) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
    
    const form = await req.formData();
    const message = String(form.get("message") || "");
    const coachName = String(form.get("coach_name") || "Coach");

    console.log("Getting coach notes...");
    const coachNotes = await latestCoachNotes(user.id);
    console.log("Coach notes length:", coachNotes.length);

    console.log("Building system prompt...");
    const system = buildSystemPrompt(coachName, coachNotes);
    console.log("System prompt length:", system.length);

    console.log("Calling OpenAI API...");
    console.log("OpenAI API Key exists:", !!process.env.OPENAI_API_KEY);
    console.log("Default model:", DEFAULT_MODEL);
    
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role:"system", content: system },
        { role:"user", content: message }
      ],
      temperature: 0.6
    });
    
    console.log("OpenAI API response received");
    const reply = completion.choices[0].message?.content || "";

    console.log("Saving message logs...");
    await prisma.messageLog.create({ data: { userId: user.id, role:"user", content: message }});
    await prisma.messageLog.create({ data: { userId: user.id, role:"assistant", content: reply }});

    console.log("Chat API completed successfully");
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
