import { ENV } from "./env";
import { sendMailjetMail } from "./mailjetSend";
import { sendSmtpMail } from "./smtpSend";

export type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
};

export type SendMailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  attachments?: MailAttachment[];
};

export type EmailProvider = "mailjet" | "smtp" | null;

export function parseMailAddress(value: string): { email: string; name: string } {
  const match = value.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) return { name: match[1].trim(), email: match[2].trim() };
  return { name: "", email: value.trim() };
}

export function mailFromAddress(): { email: string; name: string } {
  if (ENV.mailFromEmail) {
    return { email: ENV.mailFromEmail, name: ENV.mailFromName || "Pamporovo Villa" };
  }
  return parseMailAddress(ENV.smtpFrom);
}

export function isMailjetConfigured(): boolean {
  return Boolean(ENV.mailjetApiKey && ENV.mailjetApiSecret && mailFromAddress().email);
}

export function isSmtpConfigured(): boolean {
  return Boolean(ENV.smtpHost && ENV.smtpUser && ENV.smtpPass && ENV.smtpFrom);
}

export function getEmailProvider(): EmailProvider {
  if (isMailjetConfigured()) return "mailjet";
  if (isSmtpConfigured()) return "smtp";
  return null;
}

export function isEmailConfigured(): boolean {
  return getEmailProvider() !== null;
}

export async function sendMail(payload: SendMailPayload): Promise<void> {
  const from = mailFromAddress();
  const replyTo = payload.replyTo ?? ENV.smtpReplyTo;

  if (isMailjetConfigured()) {
    await sendMailjetMail({
      ...payload,
      from,
      replyTo,
    });
    return;
  }

  if (isSmtpConfigured()) {
    const fromHeader = from.name ? `${from.name} <${from.email}>` : from.email;
    await sendSmtpMail({
      host: ENV.smtpHost,
      port: ENV.smtpPort,
      secure: ENV.smtpSecure,
      user: ENV.smtpUser,
      pass: ENV.smtpPass,
      from: fromHeader,
      replyTo,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
      attachments: payload.attachments,
    });
    return;
  }

  throw new Error("Email provider not configured");
}
