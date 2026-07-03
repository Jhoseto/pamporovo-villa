import { protectGlossary, restoreGlossary } from "./glossary";
import { LOCALE_META, type TargetLocale } from "./locales";

const DEEPL_FREE = "https://api-free.deepl.com/v2/translate";
const DEEPL_PRO = "https://api.deepl.com/v2/translate";

export type DeeplConfig = {
  apiKey: string;
  useFreeApi?: boolean;
};

function apiUrl(useFree: boolean): string {
  return useFree ? DEEPL_FREE : DEEPL_PRO;
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
    throw new Error(`DeepL API ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as { translations: Array<{ text: string }> };
  return data.translations.map((tr) => restoreGlossary(tr.text));
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
      await sleep(250);
    }
  }
  return out;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
