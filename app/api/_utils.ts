import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";
import { verifyLicense } from "@/lib/whop";

export async function authUser(req: NextRequest) {
  const key = req.headers.get("x-license-key") || "";
  const ok = await verifyLicense(key);
  if (!ok) return { user: null, key };
  let user = await prisma.user.findUnique({ where: { licenseKey: key } });
  if (!user) user = await prisma.user.create({ data: { licenseKey: key } });
  return { user, key };
}
