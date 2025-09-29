import { NextRequest, NextResponse } from "next/server";
import { authUser } from "../../_utils";
import { prisma } from "@/lib/db";
import { QUESTIONS } from "@/lib/questions";
import { openai, DEFAULT_MODEL } from "@/lib/openai";
import { truncate } from "@/lib/text";

export const runtime = "nodejs";

async function latestOtterText(userId: number) {
  const row = await prisma.trainingBlob.findFirst({ where: { userId, kind: "otter" }, orderBy: { createdAt: "desc" }});
  return row?.content || "";
}

export async function POST(req: NextRequest) {
  const { user } = await authUser(req);
  if (!user) return NextResponse.json({ error:"Unauthorized" }, { status:401 });

  const url = new URL(req.url);
  const useLatest = url.searchParams.get("use_latest") === "true";
  let source = "";

  if (useLatest) {
    source = await latestOtterText(user.id);
    if (!source) return NextResponse.json({ error: "No previous Otter transcript found" }, { status:400 });
  } else {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "Provide a file or set use_latest=true" }, { status:400 });
    const ab = Buffer.from(await file.arrayBuffer());
    source = ab.toString("utf-8");
  }

  const system = "Extract coaching knowledge from transcript to fill 30 brand questions. Answer concisely in the coach's voice using only the source. If unknown, return empty string. Return JSON with integer keys 1..30 and string values.";
  const prompt = `SOURCE START
${truncate(source)}
SOURCE END

QUESTIONS:
${QUESTIONS.join("\n")}

Return JSON with keys 1..30.`

  const resp = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [{ role:"system", content: system }, { role:"user", content: prompt }],
    temperature: 0.2
  });

  const raw = resp.choices[0].message?.content || "{}";
  let obj: Record<string,string> = {};
  try {
    const m = raw.match(/\{[\s\S]*\}/);
    obj = JSON.parse(m ? m[0] : raw);
  } catch { obj = {}; }

  let filled = 0;
  for (let i=1;i<=30;i++){
    const qId = i;
    const ans = typeof obj[String(i)] === "string" ? obj[String(i)] : "";
    if (ans.trim()) filled++;
    await prisma.trainingAnswer.upsert({
      where: { userId_qId: { userId: user.id, qId } },
      create: { userId: user.id, qId, answer: ans },
      update: { answer: ans }
    });
  }
  return NextResponse.json({ ok:true, filled });
}
