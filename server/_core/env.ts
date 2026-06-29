import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.env");
dotenv.config({ path: envPath, quiet: true });

export const ENV = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  isProduction: process.env.NODE_ENV === "production",
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY ?? "",
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY ?? "",
  vapidSubject: process.env.VAPID_SUBJECT ?? "mailto:pamporovovilla@gmail.com",
  masterAdminUsername: process.env.MASTER_ADMIN_USERNAME ?? "Rado",
  masterAdminPassword: process.env.MASTER_ADMIN_PASSWORD ?? "",
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: Number(process.env.SMTP_PORT ?? "587"),
  smtpSecure: process.env.SMTP_SECURE === "1" || process.env.SMTP_PORT === "465",
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  smtpFrom: process.env.SMTP_FROM ?? "Pamporovo Villa <pamporovovilla@gmail.com>",
  siteUrl: process.env.SITE_URL ?? "http://localhost:3000",
};

export function validateEnv(): void {
  if (!ENV.databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }
  if (!ENV.jwtSecret || ENV.jwtSecret.length < 16) {
    throw new Error("JWT_SECRET must be set and at least 16 characters");
  }
  if (ENV.isProduction) {
    if (!ENV.masterAdminPassword) {
      throw new Error("MASTER_ADMIN_PASSWORD is required in production");
    }
    if (!ENV.vapidPublicKey || !ENV.vapidPrivateKey) {
      console.warn("[Env] VAPID keys missing — push notifications disabled");
    }
  }
}
