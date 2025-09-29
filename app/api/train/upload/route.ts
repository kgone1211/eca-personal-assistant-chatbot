import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authUser } from "../../_utils";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { user } = await authUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status:401 });
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status:400 });

  const ab = Buffer.from(await file.arrayBuffer());
  let text = "";
  if (file.name.toLowerCase().endsWith(".docx")) {
    // For now, return empty for docx files to keep minimal
    text = "";
  } else {
    text = ab.toString("utf-8");
  }

  await prisma.trainingBlob.create({
    data: { userId: user.id, kind: "otter", content: text }
  });
  return NextResponse.json({ ok:true, saved_chars: text.length });
}
