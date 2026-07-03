import fs from "node:fs";
import path from "node:path";

const MYMEMORY = "https://api.mymemory.translated.net/get";
const BG_PATH = path.join(process.cwd(), "shared/locales/bg/legal.json");
const EN_PATH = path.join(process.cwd(), "shared/locales/en/legal.json");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function translateText(text) {
  if (!text.trim()) return text;
  if (/^https?:\/\//.test(text)) return text;
  if (/^[\d\s.+@:;,/-]+$/.test(text)) return text;

  const maxChunk = 450;
  const parts = [];
  let rest = text;
  while (rest.length > 0) {
    let cut = Math.min(maxChunk, rest.length);
    if (cut < rest.length) {
      const slice = rest.slice(0, cut);
      const lastSpace = slice.lastIndexOf(" ");
      if (lastSpace > maxChunk * 0.4) cut = lastSpace;
    }
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }

  const out = [];
  for (const part of parts) {
    const url = `${MYMEMORY}?q=${encodeURIComponent(part)}&langpair=bg|en`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`MyMemory ${res.status}`);
    const data = await res.json();
    if (data.responseStatus && data.responseStatus !== 200) {
      throw new Error(`MyMemory status ${data.responseStatus}: ${part.slice(0, 60)}`);
    }
    out.push(data.responseData?.translatedText ?? part);
    await sleep(350);
  }
  return out.join(" ");
}

async function translateValue(value) {
  if (typeof value === "string") return translateText(value);
  if (Array.isArray(value)) {
    const arr = [];
    for (const item of value) arr.push(await translateValue(item));
    return arr;
  }
  if (value && typeof value === "object") {
    const obj = {};
    for (const [k, v] of Object.entries(value)) {
      obj[k] = await translateValue(v);
      process.stdout.write(".");
    }
    return obj;
  }
  return value;
}

async function main() {
  if (fs.existsSync(EN_PATH)) {
    console.log("[legal-en] shared/locales/en/legal.json already exists — skip");
    return;
  }

  const bg = JSON.parse(fs.readFileSync(BG_PATH, "utf8"));
  console.log("[legal-en] Translating BG → EN via MyMemory…");
  const en = await translateValue(bg);
  fs.mkdirSync(path.dirname(EN_PATH), { recursive: true });
  fs.writeFileSync(EN_PATH, `${JSON.stringify(en, null, 2)}\n`);
  console.log("\n[legal-en] Wrote", EN_PATH);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
