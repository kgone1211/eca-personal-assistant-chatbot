import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { QUESTIONS } from "@/lib/questions";
import { authUser } from "../../_utils";

export async function POST(req: NextRequest) {
  const { user } = await authUser(req);
  if (!user) return NextResponse.json({ error:"Unauthorized" }, { status:401 });

  const answers = await prisma.trainingAnswer.findMany({ where: { userId: user.id }, orderBy: { qId: "asc" } });
  const combined = answers.map(a => `Q${a.qId}: ${QUESTIONS[a.qId-1]}\nA${a.qId}: ${a.answer.trim()}\n`).join("\n").trim() || "No answers provided.";

  const blobs = await prisma.trainingBlob.findMany({ where: { userId: user.id } });
  const maxV = blobs.length ? Math.max(...blobs.map(b=> b.voiceVersion)) + 1 : 1;

  await prisma.trainingBlob.create({
    data: { userId: user.id, kind: "qa", content: combined, voiceVersion: maxV }
  });
  await prisma.user.update({ where: { id: user.id }, data: { lastTrainedAt: new Date() } });

  return NextResponse.json({ ok:true, voice_version: maxV });
}
