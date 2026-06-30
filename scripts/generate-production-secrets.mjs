#!/usr/bin/env node
/**
 * Generates production secrets and writes .env.production.local (gitignored).
 * Usage: node scripts/generate-production-secrets.mjs [--print]
 */
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import webpush from "web-push";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const examplePath = path.join(root, ".env.production.example");
const outputPath = path.join(root, ".env.production.local");
const deployEnvPath = path.join(root, ".deploy.env");

function readDeployOverrides() {
  if (!fs.existsSync(deployEnvPath)) return {};
  const out = {};
  for (const line of fs.readFileSync(deployEnvPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    out[key] = value;
  }
  return out;
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

const overrides = readDeployOverrides();
const jwtSecret = crypto.randomBytes(32).toString("hex");
const vapid = webpush.generateVAPIDKeys();
const adminPassword = overrides.MASTER_ADMIN_PASSWORD || randomPassword(20);

let template = fs.readFileSync(examplePath, "utf8");

const replacements = {
  JWT_SECRET: jwtSecret,
  VAPID_PUBLIC_KEY: vapid.publicKey,
  VAPID_PRIVATE_KEY: vapid.privateKey,
  MASTER_ADMIN_PASSWORD: adminPassword,
  SITE_URL: overrides.SITE_URL || "https://YOUR-TEMP-URL-HERE",
  DATABASE_URL: overrides.DATABASE_URL || "mysql://DB_USER:DB_PASSWORD@localhost:3306/DB_NAME",
};

for (const [key, value] of Object.entries(replacements)) {
  const lineRe = new RegExp(`^(${key}=).*$`, "m");
  if (lineRe.test(template)) {
    template = template.replace(lineRe, `$1${value}`);
  }
}

const printOnly = process.argv.includes("--print");
if (printOnly) {
  console.log(template);
  process.exit(0);
}

const hadFile = fs.existsSync(outputPath);
if (hadFile) {
  const backup = `${outputPath}.${Date.now()}.bak`;
  fs.copyFileSync(outputPath, backup);
  console.log(`Backed up existing file to ${path.basename(backup)}`);
}

fs.writeFileSync(outputPath, template, "utf8");

console.log("Wrote .env.production.local");
console.log("");
console.log("Generated credentials (save these):");
console.log(`  MASTER_ADMIN_PASSWORD=${adminPassword}`);
console.log(`  JWT_SECRET=${jwtSecret.slice(0, 8)}...`);
console.log("");
console.log("Still required in .deploy.env before remote deploy:");
console.log("  JETHOST_SSH_HOST, JETHOST_SSH_USER, DATABASE_URL, SITE_URL");
