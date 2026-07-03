import type { TargetLocale } from "./locales";

/**
 * Terms that keep the same spelling in every locale (brand, URLs, ids).
 */
export const UNIVERSAL_GLOSSARY = [
  "Pamporovo Villa",
  "Pamporovo",
  "pamporovovilla.com",
  "pamporovovilla@gmail.com",
  "+359 879 501 660",
  "+359879501660",
  "villa-1",
  "villa-2",
  "villa-deluxe",
] as const;

/**
 * BG source spelling → Latin brand spelling in all non-BG locales.
 * Order does not matter; protect sorts by length (longest first).
 */
export const LOCALIZED_GLOSSARY_PAIRS = [
  { bg: "Райковски ливади", latin: "Raykovski Livadi" },
  { bg: "Вила Deluxe", latin: "Villa Deluxe" },
  { bg: "Вила 1", latin: "Villa 1" },
  { bg: "Вила 2", latin: "Villa 2" },
] as const;

/** @deprecated Use UNIVERSAL_GLOSSARY — kept for any external references */
export const GLOSSARY_TERMS = [
  ...UNIVERSAL_GLOSSARY,
  ...LOCALIZED_GLOSSARY_PAIRS.flatMap((p) => [p.latin, p.bg]),
] as const;

const PAIRS_SORTED = LOCALIZED_GLOSSARY_PAIRS.map((pair, i) => ({ pair, i })).sort(
  (a, b) => b.pair.bg.length - a.pair.bg.length
);

/** Wrap glossary terms before sending to DeepL. */
export function protectGlossary(text: string): string {
  let out = text;

  for (let i = 0; i < UNIVERSAL_GLOSSARY.length; i++) {
    out = out.split(UNIVERSAL_GLOSSARY[i]).join(`⟦G${i}⟧`);
  }

  for (const { pair, i } of PAIRS_SORTED) {
    const ph = `⟦P${i}⟧`;
    out = out.split(pair.bg).join(ph);
    out = out.split(pair.latin).join(ph);
  }

  return out;
}

/** Restore glossary placeholders after translation. */
export function restoreGlossary(text: string, locale?: TargetLocale | "bg"): string {
  let out = text;
  const useLatin = locale !== "bg";

  for (let i = 0; i < UNIVERSAL_GLOSSARY.length; i++) {
    out = out.split(`⟦G${i}⟧`).join(UNIVERSAL_GLOSSARY[i]);
  }

  for (let i = 0; i < LOCALIZED_GLOSSARY_PAIRS.length; i++) {
    const pair = LOCALIZED_GLOSSARY_PAIRS[i];
    const term = useLatin ? pair.latin : pair.bg;
    out = out.split(`⟦P${i}⟧`).join(term);
  }

  return out;
}

/** Replace any remaining Cyrillic glossary terms (safety net for older sync output). */
export function normalizeLatinGlossaryInText(text: string): string {
  let out = text;
  for (const { pair } of PAIRS_SORTED) {
    out = out.split(pair.bg).join(pair.latin);
  }
  return out;
}

/** Normalize all values in a flat message map for a target locale. */
export function normalizeLocaleGlossaryFlat(
  flat: Record<string, string>,
  locale: TargetLocale | "bg"
): Record<string, string> {
  if (locale === "bg") return flat;

  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(flat)) {
    out[key] = normalizeLatinGlossaryInText(value);
  }
  return out;
}
