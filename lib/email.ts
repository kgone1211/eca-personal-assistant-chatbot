import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY || "";
const sender = process.env.SENDER_EMAIL || "no-reply@example.com";

export async function sendEmail(to: string, subject: string, text: string) {
  if (!resendKey) {
    console.warn(`[EMAIL -> ${to}] ${subject}\n${text}`);
    return;
  }
  const resend = new Resend(resendKey);
  await resend.emails.send({ from: sender, to, subject, text });
}
