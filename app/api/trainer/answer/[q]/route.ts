import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authUser } from "../../../_utils";

export async function GET(req: NextRequest, ctx: { params: { q: string }}) {
  const { user } = await authUser(req);
  if (!user) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  const qId = Number(ctx.params.q);
  const row = await prisma.trainingAnswer.findUnique({ where: { userId_qId: { userId: user.id, qId } } });
  return NextResponse.json({ q_id: qId, answer: row?.answer || "" });
}

export async function POST(req: NextRequest, ctx: { params: { q: string }}) {
  const { user } = await authUser(req);
  if (!user) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  const qId = Number(ctx.params.q);
  const { answer } = await req.json();
  await prisma.trainingAnswer.upsert({
    where: { userId_qId: { userId: user.id, qId } },
    create: { userId: user.id, qId, answer },
    update: { answer }
  });
  return NextResponse.json({ ok:true });
}
