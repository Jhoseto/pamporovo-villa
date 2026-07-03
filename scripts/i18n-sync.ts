import fs from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import { deeplTranslateAll } from "../shared/i18n/deepl";
import { flattenObject, loadBgFlat, writeAllGenerated } from "../shared/i18n/messages";
import { TARGET_LOCALES, type TargetLocale } from "../shared/i18n/locales";
import { PAMPOROVO_SPOKES } from "../shared/pamporovoSpokes";
import { EN_SEO } from "../shared/seoEnMeta";
import { RENT_PAGE_EN } from "../shared/rentPageEn";
import { HOME_FAQ } from "../shared/homeFaq";
import { HOME_FAQ_EN } from "../shared/en/homeFaqEn";

loadEnv({ path: path.join(process.cwd(), ".env") });

const MANIFEST_PATH = path.join(process.cwd(), ".i18n/manifest.json");
const LLMS_DIR = path.join(process.cwd(), "client/public");

type Manifest = Record<string, string>;

function readManifest(): Manifest {
  if (!fs.existsSync(MANIFEST_PATH)) return {};
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) as Manifest;
}

function writeManifest(m: Manifest): void {
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(m, null, 2)}\n`, "utf8");
}

function hashString(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16);
}

function extractSpokesToBg(): void {
  const spokesOut: Record<string, unknown> = {};
  for (const spoke of PAMPOROVO_SPOKES) {
    spokesOut[spoke.slug] = {
      h1: spoke.h1,
      seoTitle: spoke.seoTitle,
      seoDescription: spoke.seoDescription,
      seoKeywords: spoke.seoKeywords,
      sections: spoke.sections.map((s) => ({
        heading: s.heading,
        paragraphs: s.paragraphs,
        bullets: s.bullets ?? [],
      })),
    };
  }
  const outPath = path.join(process.cwd(), "shared/locales/bg/spokes.json");
  fs.writeFileSync(outPath, `${JSON.stringify(spokesOut, null, 2)}\n`, "utf8");
}

function extractFaqToBg(): void {
  const faqOut = {
    home: HOME_FAQ.map((f) => ({ id: f.id, question: f.question, answer: f.answer })),
  };
  const outPath = path.join(process.cwd(), "shared/locales/bg/faq.json");
  fs.writeFileSync(outPath, `${JSON.stringify(faqOut, null, 2)}\n`, "utf8");
}

function seedEnOverrides(flat: Record<string, string>): Record<string, string> {
  const out = { ...flat };

  for (const [route, seo] of Object.entries(EN_SEO)) {
    out[`seo.routes.${route}.title`] = seo.title;
    out[`seo.routes.${route}.description`] = seo.description;
    if (seo.keywords) out[`seo.routes.${route}.keywords`] = seo.keywords;
  }

  const rentMap: Record<string, string> = {
    "rent.eyebrow": RENT_PAGE_EN.eyebrow,
    "rent.h1": RENT_PAGE_EN.h1,
    "rent.intro": RENT_PAGE_EN.intro,
    "rent.villasHeading": RENT_PAGE_EN.villasHeading,
    "rent.pricingHeading": RENT_PAGE_EN.pricingHeading,
    "rent.pricingFrom": RENT_PAGE_EN.pricingFrom,
    "rent.pricingPerNight": RENT_PAGE_EN.pricingPerNight,
    "rent.pricingNote": RENT_PAGE_EN.pricingNote,
    "rent.bookOnline": RENT_PAGE_EN.bookOnline,
    "rent.guideLink": RENT_PAGE_EN.guideLink,
    "rent.footerNote": RENT_PAGE_EN.footerNote,
    "rent.villaPageLinkSuffix": "page →",
  };
  for (const [i, note] of RENT_PAGE_EN.pricingNotes.entries()) {
    rentMap[`rent.pricingNotes.${i}`] = note;
  }
  Object.assign(out, rentMap);

  for (const item of HOME_FAQ_EN) {
    out[`faq.home.${item.id}.question`] = item.question;
    out[`faq.home.${item.id}.answer`] = item.answer;
  }

  return out;
}

function loadExistingGenerated(locale: TargetLocale): Record<string, string> {
  const dir = path.join(process.cwd(), "shared/locales/generated", locale);
  if (!fs.existsSync(dir)) return {};
  const flat: Record<string, string> = {};
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const ns = file.replace(/\.json$/, "");
    const content = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")) as Record<
      string,
      unknown
    >;
    const nested = flattenObject(content);
    for (const [k, v] of Object.entries(nested)) {
      flat[`${ns}.${k}`] = v;
    }
  }
  return flat;
}

function generateLlmsFiles(): void {
  const base = process.env.SITE_URL?.replace(/\/$/, "") || "https://pamporovovilla.com";
  for (const lang of TARGET_LOCALES) {
    const suffix = lang === "en" ? "-en" : `-${lang}`;
    const lines = [
      `# Pamporovo Villa — ${lang.toUpperCase()} index for AI assistants`,
      "",
      `[Homepage](${base}/?lang=${lang})`,
      `[Rent a villa](${base}/rent?lang=${lang})`,
      `[Pamporovo guide](${base}/pamporovo?lang=${lang})`,
      `[Facts JSON](${base}/facts.json?lang=${lang})`,
      "",
    ];
    fs.writeFileSync(path.join(LLMS_DIR, `llms${suffix}.txt`), lines.join("\n"), "utf8");
  }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  const extractOnly = process.argv.includes("--extract-only");
  const force = process.argv.includes("--force");

  console.log("[i18n] Extracting spokes + FAQ to BG locale...");
  extractSpokesToBg();
  extractFaqToBg();

  const bgFlat = loadBgFlat();
  const faqPath = path.join(process.cwd(), "shared/locales/bg/faq.json");
  if (fs.existsSync(faqPath)) {
    Object.assign(bgFlat, flattenObject({ faq: JSON.parse(fs.readFileSync(faqPath, "utf8")) }));
  }
  const spokesPath = path.join(process.cwd(), "shared/locales/bg/spokes.json");
  if (fs.existsSync(spokesPath)) {
    Object.assign(
      bgFlat,
      flattenObject({ spokes: JSON.parse(fs.readFileSync(spokesPath, "utf8")) })
    );
  }

  const manifest = readManifest();
  const changedKeys: string[] = [];
  const newManifest: Manifest = { ...manifest };

  for (const [key, value] of Object.entries(bgFlat)) {
    const h = hashString(value);
    newManifest[key] = h;
    if (manifest[key] !== h) {
      changedKeys.push(key);
    }
  }

  console.log(`[i18n] BG keys: ${Object.keys(bgFlat).length}, changed/new: ${changedKeys.length}`);

  if (extractOnly) {
    writeManifest(newManifest);
    console.log("[i18n] Extract only — done.");
    return;
  }

  const apiKey = process.env.DEEPL_API_KEY?.trim();
  if (!apiKey && !dryRun) {
    console.error("[i18n] DEEPL_API_KEY missing in .env — add key or use --dry-run");
    process.exit(1);
  }

  for (const locale of TARGET_LOCALES) {
    console.log(`[i18n] Syncing ${locale}...`);
    let merged = loadExistingGenerated(locale);

    const keysToTranslate = force
      ? Object.keys(bgFlat)
      : changedKeys.length > 0
        ? changedKeys
        : Object.keys(bgFlat).filter((k) => !(k in merged));

    if (keysToTranslate.length === 0) {
      console.log(`[i18n] ${locale}: up to date`);
      continue;
    }

    const texts = keysToTranslate.map((k) => bgFlat[k] ?? "");

    if (locale === "en") {
      const seeded = seedEnOverrides(Object.fromEntries(keysToTranslate.map((k, i) => [k, texts[i]])));
      for (const k of keysToTranslate) {
        merged[k] = seeded[k] ?? merged[k] ?? texts[keysToTranslate.indexOf(k)];
      }
    } else if (dryRun) {
      for (let i = 0; i < keysToTranslate.length; i++) {
        merged[keysToTranslate[i]] = `[${locale.toUpperCase()}] ${texts[i]}`;
      }
    } else {
      const translated = await deeplTranslateAll(texts, locale, { apiKey: apiKey! });
      for (let i = 0; i < keysToTranslate.length; i++) {
        merged[keysToTranslate[i]] = translated[i];
      }
    }

    if (locale === "en") {
      merged = { ...merged, ...seedEnOverrides(merged) };
    }

    writeAllGenerated(locale, merged);
    console.log(`[i18n] ${locale}: updated ${keysToTranslate.length} keys`);
  }

  writeManifest(newManifest);
  generateLlmsFiles();
  console.log("[i18n] Sync complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
