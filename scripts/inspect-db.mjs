import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

async function columns(table) {
  const [rows] = await conn.query(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION",
    [table]
  );
  return rows.map(r => r.COLUMN_NAME);
}

async function tableExists(name) {
  const [rows] = await conn.query(
    "SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? LIMIT 1",
    [name]
  );
  return rows.length > 0;
}

console.log("admin_users:", (await columns("admin_users")).join(", "));
console.log("booking_requests:", (await columns("booking_requests")).join(", "));
console.log("admin_reminder_log exists:", await tableExists("admin_reminder_log"));
console.log("blocked_dates exists:", await tableExists("blocked_dates"));

await conn.end();
