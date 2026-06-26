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
  masterAdminPassword: process.env.MASTER_ADMIN_PASSWORD ?? "Admin2626",
};
