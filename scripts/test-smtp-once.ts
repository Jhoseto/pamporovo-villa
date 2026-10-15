import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { sendSmtpMail } from "../server/_core/smtpSend";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env") });

async function main() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromEmail = process.env.MAIL_FROM_EMAIL || "pamporovovilla@gmail.com";
  if (!user || !pass) {
    console.error("SMTP_USER/SMTP_PASS missing");
    process.exit(1);
  }
  await sendSmtpMail({
    host: process.env.SMTP_HOST || "mail.pamporovovilla.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: (process.env.SMTP_PORT ?? "465") === "465" || process.env.SMTP_SECURE === "1",
    user,
    pass,
    from: `Pamporovo Villa <${fromEmail}>`,
    envelopeFrom: user,
    sender: `Pamporovo Villa <${user}>`,
    to: process.env.SMTP_TEST_TO || "pamporovovilla@gmail.com",
    replyTo: process.env.SMTP_REPLY_TO || fromEmail,
    subject: "Pamporovo Villa — SMTP тест",
    text: "Тестово съобщение от JetHost SMTP.",
  });
  console.log("OK");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
