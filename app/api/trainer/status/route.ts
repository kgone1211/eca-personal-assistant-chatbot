import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authUser } from "../../_utils";

export async function GET(req: NextRequest) {
  const { user } = await authUser(req);
  if (!user) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  const answers = await prisma.trainingAnswer.findMany({ where: { userId: user.id } });
  const answeredIds = answers.filter(a=> a.answer.trim().length>0).map(a=> a.qId).sort((a,b)=>a-b);
  return NextResponse.json({
    answered_count: answeredIds.length,
    answered_ids: answeredIds,
    last_trained_at: user.lastTrainedAt
  });
}
