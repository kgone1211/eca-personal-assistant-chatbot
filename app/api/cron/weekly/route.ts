import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function GET() {
  const now = new Date();
  const seven = new Date(now.getTime() - 7*24*60*60*1000);
  const users = await prisma.user.findMany();
  for (const u of users) {
    if (!u.lastTrainedAt || u.lastTrainedAt <= seven) {
      const to = u.email || "you@example.com";
      const link = `${process.env.APP_BASE_URL}/trainer`;
      await sendEmail(to, "Weekly AI tune-up", `Time to retrain your assistant.\nOpen ${link} and answer the 30 questions or upload a fresh Otter transcript.`);
    }
  }
  return Response.json({ ok:true, notified: users.length });
}
