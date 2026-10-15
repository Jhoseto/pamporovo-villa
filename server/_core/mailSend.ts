import { ENV } from "./env";
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
  bcc?: string[];
};

export type EmailProvider = "smtp" | null;

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

export function isSmtpConfigured(): boolean {
  return Boolean(ENV.smtpHost && ENV.smtpUser && ENV.smtpPass && mailFromAddress().email);
}

export function getEmailProvider(): EmailProvider {
  if (isSmtpConfigured()) return "smtp";
  return null;
}

export function isEmailConfigured(): boolean {
  return getEmailProvider() !== null;
}

function mergeBcc(to: string, extra?: string[]): string[] {
  const seen = new Set<string>([to.trim().toLowerCase()]);
  const out: string[] = [];
  const add = (raw: string) => {
    const email = raw.trim();
    if (!email) return;
    const key = email.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(email);
  };
  for (const e of extra ?? []) add(e);
  if (ENV.mailBcc) add(ENV.mailBcc);
  if (ENV.smtpUser) add(ENV.smtpUser);
  return out;
}

export async function sendMail(payload: SendMailPayload): Promise<void> {
  if (!isSmtpConfigured()) {
    throw new Error("Email provider not configured");
  }

  const from = mailFromAddress();
  const replyTo = payload.replyTo ?? ENV.smtpReplyTo;
  const fromHeader = from.name ? `${from.name} <${from.email}>` : from.email;
  const envelopeFrom = ENV.smtpUser;
  const fromEmailLower = from.email.toLowerCase();
  const userLower = ENV.smtpUser.toLowerCase();
  const sender =
    fromEmailLower !== userLower
      ? from.name
        ? `${from.name} <${ENV.smtpUser}>`
        : ENV.smtpUser
      : undefined;

  await sendSmtpMail({
    host: ENV.smtpHost,
    port: ENV.smtpPort,
    secure: ENV.smtpSecure,
    user: ENV.smtpUser,
    pass: ENV.smtpPass,
    from: fromHeader,
    envelopeFrom,
    sender,
    replyTo,
    to: payload.to,
    bcc: mergeBcc(payload.to, payload.bcc),
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
    attachments: payload.attachments,
  });
}
