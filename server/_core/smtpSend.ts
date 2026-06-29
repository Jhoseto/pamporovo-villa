import net from "net";
import tls from "tls";

type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
};

type SendMailOptions = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: MailAttachment[];
};

function encodeBase64(value: string): string {
  return Buffer.from(value, "utf8").toString("base64");
}

function buildMessage(options: SendMailOptions): string {
  const hasAttachments = (options.attachments?.length ?? 0) > 0;
  const mixedBoundary = `pv-mixed-${Date.now()}`;
  const altBoundary = `pv-alt-${Date.now()}`;

  const headers = [
    `From: ${options.from}`,
    `To: ${options.to}`,
    `Subject: =?UTF-8?B?${encodeBase64(options.subject)}?=`,
    "MIME-Version: 1.0",
    hasAttachments
      ? `Content-Type: multipart/mixed; boundary="${mixedBoundary}"`
      : `Content-Type: multipart/alternative; boundary="${altBoundary}"`,
  ];

  const parts: string[] = [];

  if (hasAttachments) {
    parts.push(`--${mixedBoundary}`);
    parts.push(`Content-Type: multipart/alternative; boundary="${altBoundary}"`, "");
    parts.push(`--${altBoundary}`);
    parts.push('Content-Type: text/plain; charset="UTF-8"', "Content-Transfer-Encoding: 8bit", "", options.text);
    if (options.html) {
      parts.push(
        `--${altBoundary}`,
        'Content-Type: text/html; charset="UTF-8"',
        "Content-Transfer-Encoding: 8bit",
        "",
        options.html
      );
    }
    parts.push(`--${altBoundary}--`);

    for (const attachment of options.attachments ?? []) {
      parts.push(
        `--${mixedBoundary}`,
        `Content-Type: ${attachment.contentType}; name="${attachment.filename}"`,
        "Content-Transfer-Encoding: base64",
        `Content-Disposition: attachment; filename="${attachment.filename}"`,
        "",
        attachment.content.toString("base64")
      );
    }
    parts.push(`--${mixedBoundary}--`, "");
  } else {
    parts.push(
      `--${altBoundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: 8bit",
      "",
      options.text
    );
    if (options.html) {
      parts.push(
        `--${altBoundary}`,
        'Content-Type: text/html; charset="UTF-8"',
        "Content-Transfer-Encoding: 8bit",
        "",
        options.html
      );
    }
    parts.push(`--${altBoundary}--`, "");
  }

  return [...headers, "", ...parts].join("\r\n");
}

function readResponse(socket: net.Socket): Promise<string> {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const onData = (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split("\r\n").filter(Boolean);
      const last = lines.at(-1);
      if (!last || last.length < 4 || last[3] === "-") return;
      cleanup();
      resolve(buffer);
    };
    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };
    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
    };
    socket.on("data", onData);
    socket.on("error", onError);
  });
}

async function sendCommand(socket: net.Socket, command: string): Promise<string> {
  socket.write(`${command}\r\n`);
  const response = await readResponse(socket);
  const code = Number(response.slice(0, 3));
  if (Number.isNaN(code) || code >= 400) {
    throw new Error(`SMTP command failed (${command}): ${response.trim()}`);
  }
  return response;
}

function connectSocket(host: string, port: number, secure: boolean): Promise<net.Socket> {
  return new Promise((resolve, reject) => {
    if (secure) {
      const socket = tls.connect({ host, port, servername: host }, () => resolve(socket));
      socket.once("error", reject);
      return;
    }
    const socket = net.connect({ host, port }, () => resolve(socket));
    socket.once("error", reject);
  });
}

export async function sendSmtpMail(options: SendMailOptions): Promise<void> {
  let socket = await connectSocket(options.host, options.port, options.secure);
  await readResponse(socket);
  await sendCommand(socket, `EHLO ${options.host}`);

  if (!options.secure) {
    await sendCommand(socket, "STARTTLS");
    socket = tls.connect({ socket, servername: options.host });
    await readResponse(socket);
    await sendCommand(socket, `EHLO ${options.host}`);
  }

  await sendCommand(socket, "AUTH LOGIN");
  await sendCommand(socket, encodeBase64(options.user));
  await sendCommand(socket, encodeBase64(options.pass));
  await sendCommand(socket, `MAIL FROM:<${extractAddress(options.from)}>`);
  await sendCommand(socket, `RCPT TO:<${options.to}>`);
  await sendCommand(socket, "DATA");

  const message = buildMessage(options);
  socket.write(`${message}\r\n.\r\n`);
  await readResponse(socket);
  await sendCommand(socket, "QUIT");
  socket.end();
}

function extractAddress(value: string): string {
  const match = value.match(/<([^>]+)>/);
  return match?.[1] ?? value.trim();
}
