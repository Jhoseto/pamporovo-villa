/**
 * Create or sync master admin password from .env (MASTER_ADMIN_USERNAME / MASTER_ADMIN_PASSWORD).
 * Usage on server: node scripts/reset-master-admin.mjs
 */
import path from "node:path";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config({ path: path.resolve(import.meta.dirname, "..", ".env") });

const url = process.env.DATABASE_URL;
const username = process.env.MASTER_ADMIN_USERNAME || "Rado";
const password = process.env.MASTER_ADMIN_PASSWORD;

if (!url) {
  console.error("DATABASE_URL липсва в .env");
  process.exit(1);
}

if (!password) {
  console.warn("[reset-master-admin] MASTER_ADMIN_PASSWORD липсва — пропускам");
  process.exit(0);
}

const conn = await mysql.createConnection(url);

try {
  const [tables] = await conn.query(
    "SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admin_users' LIMIT 1"
  );
  if (tables.length === 0) {
    console.error("[reset-master-admin] Таблица admin_users липсва — първо пусни apply-pending-schema.mjs");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [rows] = await conn.query("SELECT id FROM admin_users WHERE username = ? LIMIT 1", [username]);

  if (rows.length === 0) {
    await conn.query(
      "INSERT INTO admin_users (username, password_hash, is_master, token_version) VALUES (?, ?, 1, 0)",
      [username, passwordHash]
    );
    console.log(`[reset-master-admin] Създаден master admin: ${username}`);
  } else {
    await conn.query("UPDATE admin_users SET password_hash = ?, is_master = 1 WHERE username = ?", [
      passwordHash,
      username,
    ]);
    console.log(`[reset-master-admin] Паролата е синхронизирана за: ${username}`);
  }
} finally {
  await conn.end();
}
