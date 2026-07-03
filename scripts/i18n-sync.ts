import fs from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import { normalizeLocaleGlossaryFlat } from "../shared/i18n/glossary";
import { deeplTranslateAll } from "../shared/i18n/deepl";
import { flattenObject, loadBgFlat, writeAllGenerated } from "../shared/i18n/messages";
import { TARGET_LOCALES, type TargetLocale } from "../shared/i18n/locales";
import { extractAllToBg } from "../shared/i18n/extractBg";
import { EN_SEO } from "../shared/seoEnMeta";
import { RENT_PAGE_EN } from "../shared/rentPageEn";
import { HOME_FAQ_EN } from "../shared/en/homeFaqEn";
import { EN_UI } from "../shared/en/commonUi";
import { PAMPOROVO_SPOKES_EN } from "../shared/en/pamporovoSpokesEn";
import { PAMPOROVO_HUB_EN } from "../shared/en/pamporovoHubEn";
import { PAMPOROVO_FAQ_EN } from "../shared/en/pamporovoFaqEn";
import { VILLA_PAGES_EN } from "../shared/en/villaPagesEn";
import type { SpokeSection } from "../shared/pamporovoSpokeTypes";
import type { VillaId } from "../shared/villas";

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

function seedSpokesEn(flat: Record<string, string>): Record<string, string> {
  const out = { ...flat };
  for (const [slug, en] of Object.entries(PAMPOROVO_SPOKES_EN)) {
    out[`spokes.${slug}.eyebrow`] = en.eyebrow;
    out[`spokes.${slug}.h1`] = en.h1;
    out[`spokes.${slug}.intro`] = en.intro;
    out[`spokes.${slug}.seoTitle`] = en.seoTitle;
    out[`spokes.${slug}.seoDescription`] = en.seoDescription;
    out[`spokes.${slug}.seoKeywords`] = en.seoKeywords;
    en.sections.forEach((sec: SpokeSection, i: number) => {
      out[`spokes.${slug}.sections.${i}.heading`] = sec.heading;
      sec.paragraphs.forEach((p, j) => {
        out[`spokes.${slug}.sections.${i}.paragraphs.${j}`] = p;
      });
      (sec.bullets ?? []).forEach((b, j) => {
        out[`spokes.${slug}.sections.${i}.bullets.${j}`] = b;
      });
    });
  }
  return out;
}

function seedUiEn(flat: Record<string, string>): Record<string, string> {
  const out = { ...flat };
  Object.assign(out, {
    "common.siteName": "Pamporovo Villa",
    "common.tagline": "3 villas for rent",
    "common.location": "Pamporovo resort · Raykovski Livadi",
    "common.offersCta": "Top offers",
    "common.book": EN_UI.book,
    "common.bookOnline": EN_UI.bookOnline,
    "common.loading": "Loading...",
    "common.submit": "Submit",
    "common.close": "Close",
    "common.phone": "Phone",
    "common.email": "Email",
    "common.address": "Pamporovo resort, Raykovski Livadi",
    "common.langLabel": "Language",
    "common.openMenu": "Open menu",
    "common.mainNav": "Main navigation",
    "common.mobileNav": "Mobile navigation",
    "nav.about": "About",
    "nav.experience": "Experience",
    "nav.gallery": EN_UI.gallery,
    "nav.amenities": EN_UI.amenities,
    "nav.location": "Location",
    "nav.pricing": EN_UI.pricing,
    "nav.contact": EN_UI.contact,
    "nav.reviews": "Reviews",
    "nav.pamporovo": "Pamporovo",
    "nav.booking": "Booking",
    "nav.policy": "Policy",
    "nav.offers": "Offers",
    "nav.privacy": "Privacy",
    "nav.terms": "Terms",
    "nav.cookies": "Cookies",
    "footer.contactHeading": EN_UI.contact,
    "footer.navHeading": "Navigation",
    "footer.socialHeading": "Social",
    "footer.socialBody":
      "Join us in the mountains and online — photos, seasonal offers, and moments from Pamporovo Villa.",
    "footer.copyright": "All rights reserved.",
    "footer.booking": "Booking",
    "gbp.reviewLink": EN_UI.googleReview,
    "gbp.reviewShort": EN_UI.googleReviewShort,
    "gbp.reviewToast": "Share on Google too — it helps other guests find us.",
    "gbp.reviewToastAction": EN_UI.googleReviewShort,
    "gbp.directions": EN_UI.directions,
    "gbp.maps": EN_UI.googleMaps,
    "gbp.banner.eyebrow": "Google reviews",
    "gbp.banner.title": "Enjoyed your stay? Share on Google",
    "gbp.banner.body":
      "Google Business Profile reviews help other guests find us in Pamporovo. It takes under a minute.",
    "home.faq.eyebrow": EN_UI.homeFaqEyebrow,
    "home.faq.title": EN_UI.homeFaqTitle,
    "home.faq.subtitle": EN_UI.homeFaqSubtitle,
    "experience.highlightsLabel": "Highlights",
  });
  return out;
}

function seedEnOverrides(flat: Record<string, string>): Record<string, string> {
  let out = { ...flat };

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

  for (const item of PAMPOROVO_FAQ_EN) {
    out[`faq.pamporovo.${item.id}.question`] = item.question;
    out[`faq.pamporovo.${item.id}.answer`] = item.answer;
  }

  const hubMap: Record<string, string> = {
    "hub.title": PAMPOROVO_HUB_EN.title,
    "hub.description": PAMPOROVO_HUB_EN.description,
    "hub.eyebrow": PAMPOROVO_HUB_EN.eyebrow,
    "hub.h1": PAMPOROVO_HUB_EN.h1,
    "hub.subtitle": PAMPOROVO_HUB_EN.subtitle,
    "hub.usefulPages": PAMPOROVO_HUB_EN.usefulPages,
    "hub.exploreCta": PAMPOROVO_HUB_EN.exploreCta,
    "hub.bookCta": PAMPOROVO_HUB_EN.bookCta,
    "hub.moreOnTopic": EN_UI.moreOnTopic,
    "hub.questionsTopic": EN_UI.questionsTopic,
    "hub.faqDefault": EN_UI.faqDefault,
    "hub.faqSubtitle": EN_UI.faqSubtitle,
    "hub.recommendedNearby": EN_UI.recommendedNearby,
    "hub.pisteTable": EN_UI.pisteTable,
    "hub.liftTable": EN_UI.liftTable,
    "hub.stickyReserve": EN_UI.stickyReserve,
    "hub.backToGuide": EN_UI.backToGuide,
    "hub.villaCtaTitle": EN_UI.villaCtaTitle,
    "hub.villaCtaBody": EN_UI.villaCtaBody,
    "hub.villaCtaFrom": EN_UI.villaCtaFrom,
    "hub.villaCtaPerNight": EN_UI.villaCtaPerNight,
    "hub.seeRent": EN_UI.seeRent,
  };
  Object.assign(out, hubMap);

  for (const [id, en] of Object.entries(VILLA_PAGES_EN) as [VillaId, (typeof VILLA_PAGES_EN)[VillaId]][]) {
    out[`villa.pages.${id}.name`] = en.h1.replace(/ — rent in Pamporovo$/, "").trim();
    out[`villa.pages.${id}.tagline`] = en.tagline;
    out[`villa.pages.${id}.description`] = en.description;
    out[`villa.pages.${id}.seoTitle`] = en.seoTitle;
    out[`villa.pages.${id}.seoDescription`] = en.seoDescription;
    out[`villa.pages.${id}.seoKeywords`] = en.seoKeywords;
    out[`villa.pages.${id}.h1`] = en.h1;
  }

  out = seedUiEn(out);
  out = seedSpokesEn(out);
  return out;
}

function finalizeLocaleFlat(
  flat: Record<string, string>,
  locale: TargetLocale
): Record<string, string> {
  let out = flat;
  if (locale === "en") {
    out = seedEnOverrides(out);
  }
  return normalizeLocaleGlossaryFlat(out, locale);
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
  const normalizeGlossaryOnly = process.argv.includes("--normalize-glossary");
  const localeArg = process.argv.find((a) => a.startsWith("--locale="))?.split("=")[1];
  const prefixArg = process.argv.find((a) => a.startsWith("--prefix="))?.split("=")[1];
  const localesToSync = localeArg
    ? TARGET_LOCALES.filter((l) => l === localeArg)
    : [...TARGET_LOCALES];
  if (localeArg && localesToSync.length === 0) {
    console.error(`[i18n] Unknown locale: ${localeArg}`);
    process.exit(1);
  }

  console.log("[i18n] Extracting all BG locale content from source...");
  extractAllToBg();

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

  if (normalizeGlossaryOnly) {
    for (const locale of localesToSync) {
      const merged = finalizeLocaleFlat(loadExistingGenerated(locale), locale);
      writeAllGenerated(locale, merged);
      console.log(`[i18n] ${locale}: glossary normalized`);
    }
    console.log("[i18n] Glossary normalization complete.");
    return;
  }

  const apiKey = process.env.DEEPL_API_KEY?.trim();
  if (!apiKey && !dryRun) {
    console.error("[i18n] DEEPL_API_KEY missing in .env — add key or use --dry-run");
    process.exit(1);
  }

  for (const locale of localesToSync) {
    console.log(`[i18n] Syncing ${locale}...`);
    let merged = loadExistingGenerated(locale);

    const keysToTranslate = (force
      ? Object.keys(bgFlat)
      : changedKeys.length > 0
        ? changedKeys
        : Object.keys(bgFlat).filter((k) => !(k in merged))
    )
      .filter((k) => !k.startsWith("legal."))
      .filter((k) => (prefixArg ? k.startsWith(prefixArg) : true));

    if (prefixArg) {
      console.log(`[i18n] ${locale}: prefix "${prefixArg}" → ${keysToTranslate.length} keys`);
    }

    if (keysToTranslate.length === 0) {
      console.log(`[i18n] ${locale}: up to date`);
      continue;
    }

    const texts = keysToTranslate.map((k) => bgFlat[k] ?? "");

    if (dryRun) {
      for (let i = 0; i < keysToTranslate.length; i++) {
        merged[keysToTranslate[i]] = `[${locale.toUpperCase()}] ${texts[i]}`;
      }
    } else {
      const translated = await deeplTranslateAll(texts, locale, { apiKey: apiKey! }, prefixArg?.startsWith("legal") ? 10 : 40);
      for (let i = 0; i < keysToTranslate.length; i++) {
        merged[keysToTranslate[i]] = translated[i];
      }
    }

    merged = finalizeLocaleFlat(merged, locale);

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
