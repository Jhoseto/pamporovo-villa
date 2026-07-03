import { protectGlossary, restoreGlossary } from "./glossary";
import { LOCALE_META, type TargetLocale } from "./locales";

const DEEPL_FREE = "https://api-free.deepl.com/v2/translate";
const DEEPL_PRO = "https://api.deepl.com/v2/translate";
const MYMEMORY = "https://api.mymemory.translated.net/get";

/** ISO 639-1 codes for MyMemory fallback (DeepL quota exceeded). */
const MYMEMORY_LANG: Partial<Record<TargetLocale, string>> = {
  en: "en",
  de: "de",
  fr: "fr",
  it: "it",
  es: "es",
  pl: "pl",
  nl: "nl",
  ro: "ro",
  el: "el",
  cs: "cs",
  hu: "hu",
  ru: "ru",
  tr: "tr",
  pt: "pt",
};

export type DeeplConfig = {
  apiKey: string;
  useFreeApi?: boolean;
  /** Use MyMemory when DeepL returns quota/rate errors. */
  allowFallback?: boolean;
};

function apiUrl(useFree: boolean): string {
  return useFree ? DEEPL_FREE : DEEPL_PRO;
}

async function mymemoryTranslateOne(text: string, target: TargetLocale): Promise<string> {
  const lang = MYMEMORY_LANG[target];
  if (!lang) throw new Error(`No MyMemory code for ${target}`);

  const protectedText = protectGlossary(text);
  const maxChunk = 450;
  if (protectedText.length <= maxChunk) {
    return mymemoryRequest(protectedText, lang);
  }

  const parts: string[] = [];
  let rest = protectedText;
  while (rest.length > 0) {
    let cut = Math.min(maxChunk, rest.length);
    if (cut < rest.length) {
      const slice = rest.slice(0, cut);
      const lastSpace = slice.lastIndexOf(" ");
      if (lastSpace > maxChunk * 0.5) cut = lastSpace;
    }
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }

  const translated = await Promise.all(parts.map((p) => mymemoryRequest(p, lang)));
  return restoreGlossary(translated.join(" "), target);
}

async function mymemoryRequest(text: string, targetLang: string): Promise<string> {
  const url = `${MYMEMORY}?q=${encodeURIComponent(text)}&langpair=bg|${targetLang}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`MyMemory API ${res.status}`);
  }
  const data = (await res.json()) as {
    responseData?: { translatedText?: string };
    responseStatus?: number;
  };
  if (data.responseStatus && data.responseStatus !== 200) {
    throw new Error(`MyMemory status ${data.responseStatus}`);
  }
  return data.responseData?.translatedText ?? text;
}

/** Translate batch of strings BG → target locale. Preserves order. */
export async function deeplTranslateBatch(
  texts: string[],
  target: TargetLocale,
  config: DeeplConfig
): Promise<string[]> {
  if (texts.length === 0) return [];

  const targetLang = LOCALE_META[target].deeplCode;
  if (!targetLang) throw new Error(`No DeepL code for ${target}`);

  const protectedTexts = texts.map(protectGlossary);
  const url = apiUrl(config.useFreeApi ?? config.apiKey.endsWith(":fx"));

  const body = new URLSearchParams();
  for (const t of protectedTexts) {
    body.append("text", t);
  }
  body.set("source_lang", "BG");
  body.set("target_lang", targetLang);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${config.apiKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const errText = await res.text();
    const quotaHit = res.status === 456 || res.status === 429;
    if (quotaHit && config.allowFallback !== false && MYMEMORY_LANG[target]) {
      console.warn(`[i18n] DeepL ${res.status} — falling back to MyMemory for ${texts.length} strings`);
      const results: string[] = [];
      for (const t of texts) {
        results.push(await mymemoryTranslateOne(t, target));
        await sleep(300);
      }
      return results;
    }
    throw new Error(`DeepL API ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as { translations: Array<{ text: string }> };
  return data.translations.map((tr) => restoreGlossary(tr.text, target));
}

/** Chunk large batches (DeepL limit ~50 texts per request). */
export async function deeplTranslateAll(
  texts: string[],
  target: TargetLocale,
  config: DeeplConfig,
  chunkSize = 40
): Promise<string[]> {
  const out: string[] = [];
  for (let i = 0; i < texts.length; i += chunkSize) {
    const chunk = texts.slice(i, i + chunkSize);
    const translated = await deeplTranslateBatch(chunk, target, config);
    out.push(...translated);
    if (i + chunkSize < texts.length) {
      await sleep(config.allowFallback !== false ? 350 : 250);
    }
  }
  return out;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
