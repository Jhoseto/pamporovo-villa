/**
 * Idempotent schema sync for partially applied manual SQL.
 * Usage: pnpm db:sync
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const root = path.resolve(import.meta.dirname, "..");

async function columnExists(conn, table, column) {
  const [rows] = await conn.query(
    "SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1",
    [table, column]
  );
  return rows.length > 0;
}

async function tableExists(conn, table) {
  const [rows] = await conn.query(
    "SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? LIMIT 1",
    [table]
  );
  return rows.length > 0;
}

async function statusEnumHasCompleted(conn) {
  const [rows] = await conn.query(
    "SELECT COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'booking_requests' AND COLUMN_NAME = 'status' LIMIT 1"
  );
  const columnType = rows[0]?.COLUMN_TYPE ?? "";
  return String(columnType).includes("completed");
}

async function indexExists(conn, table, index) {
  const [rows] = await conn.query(
    "SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ? LIMIT 1",
    [table, index]
  );
  return rows.length > 0;
}

function normalizePhoneDigits(phone) {
  if (!phone) return null;
  let digits = String(phone).replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("359")) return digits.length >= 11 ? digits.slice(0, 12) : digits;
  if (digits.startsWith("0") && digits.length >= 10) return `359${digits.slice(1)}`;
  return digits;
}

async function backfillGuestPhoneNormalized(conn) {
  const [rows] = await conn.query(
    "SELECT id, guest_phone FROM booking_requests WHERE guest_phone IS NOT NULL AND guest_phone_normalized IS NULL"
  );
  let updated = 0;
  for (const row of rows) {
    const normalized = normalizePhoneDigits(row.guest_phone);
    if (!normalized) continue;
    await conn.query("UPDATE booking_requests SET guest_phone_normalized = ? WHERE id = ?", [
      normalized,
      row.id,
    ]);
    updated++;
  }
  return updated;
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL липсва в .env");
  process.exit(1);
}

const conn = await mysql.createConnection(url);
const steps = [];

try {
  if (!(await columnExists(conn, "admin_users", "token_version"))) {
    await conn.query(
      "ALTER TABLE `admin_users` ADD COLUMN `token_version` int NOT NULL DEFAULT 0"
    );
    steps.push("admin_users.token_version");
  }

  if (!(await tableExists(conn, "blocked_dates"))) {
    await conn.query(`
      CREATE TABLE blocked_dates (
        id int NOT NULL AUTO_INCREMENT,
        villa_id varchar(32) NOT NULL,
        start_date date NOT NULL,
        end_date date NOT NULL,
        note varchar(255) DEFAULT NULL,
        created_by_admin_id int DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY blocked_villa_dates_idx (villa_id, start_date)
      )
    `);
    steps.push("blocked_dates table");
  } else if (!(await indexExists(conn, "blocked_dates", "blocked_villa_dates_idx"))) {
    await conn.query("CREATE INDEX blocked_villa_dates_idx ON blocked_dates (villa_id, start_date)");
    steps.push("blocked_dates index");
  }

  if (!(await tableExists(conn, "admin_reminder_log"))) {
    await conn.query(`
      CREATE TABLE admin_reminder_log (
        id int NOT NULL AUTO_INCREMENT,
        reminder_key varchar(64) NOT NULL,
        sent_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY admin_reminder_log_reminder_key_unique (reminder_key)
      )
    `);
    steps.push("admin_reminder_log table");
  }

  if (!(await columnExists(conn, "booking_requests", "admin_tags_json"))) {
    await conn.query(
      "ALTER TABLE `booking_requests` ADD COLUMN `admin_tags_json` text NOT NULL DEFAULT ('[]') AFTER `admin_note`"
    );
    steps.push("booking_requests.admin_tags_json");
  }

  if (!(await statusEnumHasCompleted(conn))) {
    await conn.query(
      "ALTER TABLE `booking_requests` MODIFY COLUMN `status` enum('pending','confirmed','completed','rejected') NOT NULL DEFAULT 'pending'"
    );
    steps.push("booking_requests.status completed enum");
  }

  if (!(await columnExists(conn, "booking_requests", "guest_phone_normalized"))) {
    await conn.query(
      "ALTER TABLE `booking_requests` ADD COLUMN `guest_phone_normalized` varchar(32) DEFAULT NULL AFTER `guest_phone`"
    );
    steps.push("booking_requests.guest_phone_normalized");
  }

  if (!(await columnExists(conn, "booking_requests", "total_amount_eur"))) {
    await conn.query(
      "ALTER TABLE `booking_requests` ADD COLUMN `total_amount_eur` int DEFAULT NULL AFTER `admin_tags_json`"
    );
    steps.push("booking_requests.total_amount_eur");
  }

  if (!(await columnExists(conn, "booking_requests", "deposit_paid_eur"))) {
    await conn.query(
      "ALTER TABLE `booking_requests` ADD COLUMN `deposit_paid_eur` int NOT NULL DEFAULT 0 AFTER `total_amount_eur`"
    );
    steps.push("booking_requests.deposit_paid_eur");
  }

  if (!(await indexExists(conn, "booking_requests", "booking_guest_phone_norm_idx"))) {
    await conn.query("CREATE INDEX booking_guest_phone_norm_idx ON booking_requests (guest_phone_normalized)");
    steps.push("booking_requests.booking_guest_phone_norm_idx");
  }

  if (!(await tableExists(conn, "client_contacts"))) {
    await conn.query(`
      CREATE TABLE client_contacts (
        id int NOT NULL AUTO_INCREMENT,
        full_name varchar(255) NOT NULL,
        phone varchar(32) DEFAULT NULL,
        phone_normalized varchar(32) DEFAULT NULL,
        email varchar(320) DEFAULT NULL,
        notes text DEFAULT NULL,
        is_vip tinyint(1) NOT NULL DEFAULT 0,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY client_contacts_phone_idx (phone_normalized),
        KEY client_contacts_name_idx (full_name)
      )
    `);
    steps.push("client_contacts table");
  }

  if (!(await columnExists(conn, "client_contacts", "is_vip"))) {
    await conn.query(
      "ALTER TABLE `client_contacts` ADD COLUMN `is_vip` tinyint(1) NOT NULL DEFAULT 0 AFTER `notes`"
    );
    steps.push("client_contacts.is_vip");
  }

  for (const [table, index, cols] of [
    ["booking_requests", "booking_villa_status_idx", "(villa_id, status)"],
    ["booking_requests", "booking_dates_idx", "(check_in_date, check_out_date)"],
    ["booking_requests", "booking_status_idx", "(status)"],
  ]) {
    if (!(await indexExists(conn, table, index))) {
      await conn.query(`CREATE INDEX ${index} ON ${table} ${cols}`);
      steps.push(`${table}.${index}`);
    }
  }

  const migrationFile = path.join(root, "drizzle", "0003_moaning_karma.sql");
  if (fs.existsSync(migrationFile)) {
    const hash = crypto.createHash("sha256").update(fs.readFileSync(migrationFile)).digest("hex");
    const [applied] = await conn.query(
      "SELECT 1 FROM __drizzle_migrations WHERE hash = ? LIMIT 1",
      [hash]
    );
    if (applied.length === 0) {
    const journal = JSON.parse(
      fs.readFileSync(path.join(root, "drizzle/meta/_journal.json"), "utf8")
    ).entries.find(e => e.tag === "0003_moaning_karma");
    const createdAt = journal?.when ?? Date.now();
      await conn.query("INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)", [
        hash,
        createdAt,
      ]);
      steps.push("drizzle migration 0003 marked applied");
    }
  }

  if (steps.length === 0) {
    console.log("OK — схемата вече е актуална, нищо не беше нужно.");
  } else {
    console.log("Приложени промени:");
    for (const step of steps) console.log("  +", step);
  }

  const backfilled = await backfillGuestPhoneNormalized(conn);
  if (backfilled > 0) {
    console.log(`  + backfill guest_phone_normalized (${backfilled} rows)`);
  }
} catch (error) {
  console.error("Грешка:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await conn.end();
}
