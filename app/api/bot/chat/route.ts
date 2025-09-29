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
  const { user } = await authUser(req);
  if (!user) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  const form = await req.formData();
  const message = String(form.get("message") || "");
  const coachName = String(form.get("coach_name") || "Coach");

  const system = buildSystemPrompt(coachName, await latestCoachNotes(user.id));
  const completion = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      { role:"system", content: system },
      { role:"user", content: message }
    ],
    temperature: 0.6
  });
  const reply = completion.choices[0].message?.content || "";

  await prisma.messageLog.create({ data: { userId: user.id, role:"user", content: message }});
  await prisma.messageLog.create({ data: { userId: user.id, role:"assistant", content: reply }});

  return NextResponse.json({ reply });
}
