import fs from "fs";
import path from "path";
import { sendSmtpMail } from "../server/_core/smtpSend.ts";

const envPath = path.join(process.cwd(), ".env");
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i < 1) continue;
  process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}

const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const fromEmail = process.env.MAIL_FROM_EMAIL || "pamporovovilla@gmail.com";
if (!user || !pass) {
  console.error("missing SMTP_USER/SMTP_PASS");
  process.exit(1);
}

await sendSmtpMail({
  host: process.env.SMTP_HOST || "pamporovovilla.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  user,
  pass,
  from: `Pamporovo Villa <${fromEmail}>`,
  envelopeFrom: user,
  sender: `Pamporovo Villa <${user}>`,
  to: "pamporovovilla@gmail.com",
  replyTo: process.env.SMTP_REPLY_TO || fromEmail,
  subject: "Pamporovo Villa SMTP test",
  text: "Test from production.",
});

console.log("sent ok");
