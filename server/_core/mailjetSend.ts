import { ENV } from "./env";
import type { MailAttachment, SendMailPayload } from "./mailSend";

const MAILJET_SEND_URL = "https://api.mailjet.com/v3.1/send";

type MailjetSendInput = SendMailPayload & {
  from: { email: string; name: string };
  replyTo?: string;
};

export function buildMailjetBody(input: MailjetSendInput) {
  const message: Record<string, unknown> = {
    From: {
      Email: input.from.email,
      Name: input.from.name || "Pamporovo Villa",
    },
    To: [{ Email: input.to }],
    Subject: input.subject,
    TextPart: input.text,
    HTMLPart: input.html ?? input.text,
  };

  if (input.replyTo) {
    message.ReplyTo = { Email: input.replyTo };
  }

  if (input.attachments?.length) {
    message.Attachments = input.attachments.map((file: MailAttachment) => ({
      ContentType: file.contentType,
      Filename: file.filename,
      Base64Content: file.content.toString("base64"),
    }));
  }

  return { Messages: [message] };
}

export async function sendMailjetMail(input: MailjetSendInput): Promise<void> {
  const body = buildMailjetBody(input);
  const auth = Buffer.from(`${ENV.mailjetApiKey}:${ENV.mailjetApiSecret}`).toString("base64");

  const res = await fetch(MAILJET_SEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json().catch(() => null)) as {
    Messages?: { Status?: string; Errors?: { ErrorMessage?: string }[] }[];
    ErrorMessage?: string;
  } | null;

  if (!res.ok) {
    const detail =
      json?.ErrorMessage ??
      json?.Messages?.[0]?.Errors?.[0]?.ErrorMessage ??
      res.statusText;
    throw new Error(`Mailjet send failed (${res.status}): ${detail}`);
  }

  const status = json?.Messages?.[0]?.Status;
  if (status && status !== "success") {
    const detail = json?.Messages?.[0]?.Errors?.[0]?.ErrorMessage ?? status;
    throw new Error(`Mailjet send rejected: ${detail}`);
  }
}
