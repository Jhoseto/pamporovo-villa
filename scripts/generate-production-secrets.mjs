#!/usr/bin/env node
/**
 * Generates missing production secrets into .env (single app config file).
 * Preserves existing values (DATABASE_URL, Mailjet keys, etc.).
 *
 * Usage: node scripts/generate-production-secrets.mjs [--print]
 */
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import webpush from "web-push";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const examplePath = path.join(root, ".env.example");
const outputPath = path.join(root, ".env");

function parseEnv(content) {
  const lines = content.split(/\r?\n/);
  const map = new Map();
  const order = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!map.has(key)) order.push(key);
    map.set(key, value);
  }
  return { lines, map, order };
}

function isPlaceholder(value) {
  if (!value?.trim()) return true;
  return /CHANGE|YOUR-TEMP|local-dev|do-not-use-in-production|DB_USER|DB_PASSWORD|app-password|^$/.test(
    value,
  );
}

function randomPassword(length = 20) {
  const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#";
  let result = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

function upsertLine(content, key, value) {
  const lineRe = new RegExp(`^(${key}=).*$`, "m");
  if (lineRe.test(content)) {
    return content.replace(lineRe, `$1${value}`);
  }
  return `${content.trimEnd()}\n${key}=${value}\n`;
}

let content = fs.existsSync(outputPath)
  ? fs.readFileSync(outputPath, "utf8")
  : fs.readFileSync(examplePath, "utf8");

const parsed = parseEnv(content);
const vapid = webpush.generateVAPIDKeys();

const generated = {
  JWT_SECRET: crypto.randomBytes(32).toString("hex"),
  VAPID_PUBLIC_KEY: vapid.publicKey,
  VAPID_PRIVATE_KEY: vapid.privateKey,
  MASTER_ADMIN_PASSWORD: isPlaceholder(parsed.map.get("MASTER_ADMIN_PASSWORD"))
    ? randomPassword(20)
    : parsed.map.get("MASTER_ADMIN_PASSWORD"),
};

for (const [key, value] of Object.entries(generated)) {
  const current = parsed.map.get(key);
  if (isPlaceholder(current)) {
    content = upsertLine(content, key, value);
  }
}

const printOnly = process.argv.includes("--print");
if (printOnly) {
  console.log(content);
  process.exit(0);
}

const hadFile = fs.existsSync(outputPath);
if (hadFile) {
  const backup = `${outputPath}.${Date.now()}.bak`;
  fs.copyFileSync(outputPath, backup);
  console.log(`Backed up existing .env to ${path.basename(backup)}`);
}

fs.writeFileSync(outputPath, content, "utf8");

console.log("Updated .env with generated secrets (empty/placeholder fields only).");
console.log("");
console.log("Verify these in .env before deploy:");
console.log(`  DATABASE_URL`);
console.log(`  SITE_URL`);
console.log(`  MASTER_ADMIN_PASSWORD=${generated.MASTER_ADMIN_PASSWORD}`);
console.log(`  MAILJET_API_KEY / MAILJET_API_SECRET (for email)`);
console.log("");
console.log("SSH deploy: fill .deploy.env (copy from .deploy.env.example)");
