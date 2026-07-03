/**
 * Terms that must NOT be translated — replaced with placeholders during DeepL,
 * then restored after translation.
 */
export const GLOSSARY_TERMS = [
  "Pamporovo Villa",
  "Pamporovo",
  "Raykovski Livadi",
  "Райковски ливади",
  "pamporovovilla.com",
  "pamporovovilla@gmail.com",
  "+359 879 501 660",
  "+359879501660",
  "Villa 1",
  "Villa 2",
  "Villa Deluxe",
  "Вила 1",
  "Вила 2",
  "Вила Deluxe",
  "villa-1",
  "villa-2",
  "villa-deluxe",
] as const;

/** Wrap glossary terms before sending to DeepL. */
export function protectGlossary(text: string): string {
  let out = text;
  for (let i = 0; i < GLOSSARY_TERMS.length; i++) {
    const term = GLOSSARY_TERMS[i];
    out = out.split(term).join(`⟦G${i}⟧`);
  }
  return out;
}

/** Restore glossary placeholders after translation. */
export function restoreGlossary(text: string): string {
  let out = text;
  for (let i = 0; i < GLOSSARY_TERMS.length; i++) {
    out = out.split(`⟦G${i}⟧`).join(GLOSSARY_TERMS[i]);
  }
  return out;
}
