import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyLicense } from "@/lib/whop";

export async function POST(req: Request) {
  const form = await req.formData();
  const licenseKey = String(form.get("license_key") || "");
  if (!(await verifyLicense(licenseKey))) return NextResponse.json({ ok:false }, { status:400 });
  const user = await prisma.user.upsert({
    where: { licenseKey }, update: {}, create: { licenseKey }
  });
  return NextResponse.json({ ok:true, userId: user.id });
}
