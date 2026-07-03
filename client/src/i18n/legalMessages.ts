import { SOURCE_LOCALE } from "@shared/i18n/locales";
import { resolveMessage, type FlatMessages } from "@/i18n/loadMessages";
import bgLegalJson from "@shared/locales/bg/legal.json";
import enLegalJson from "@shared/locales/en/legal.json";

type NestedMessages = Record<string, unknown>;

function flattenObject(obj: NestedMessages, prefix = ""): FlatMessages {
  const out: FlatMessages = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        const itemKey = `${fullKey}.${i}`;
        if (typeof item === "string") {
          out[itemKey] = item;
        } else if (Array.isArray(item)) {
          for (let j = 0; j < item.length; j++) {
            const cell = item[j];
            if (typeof cell === "string") {
              out[`${itemKey}.${j}`] = cell;
            }
          }
        } else if (item !== null && typeof item === "object") {
          Object.assign(out, flattenObject(item as NestedMessages, itemKey));
        }
      }
    } else if (value !== null && typeof value === "object") {
      Object.assign(out, flattenObject(value as NestedMessages, fullKey));
    } else if (typeof value === "string") {
      out[fullKey] = value;
    }
  }
  return out;
}

const bgLegalFlat = flattenObject(bgLegalJson as NestedMessages, "legal");
const enLegalFlat = flattenObject(enLegalJson as NestedMessages, "legal");

if (import.meta.env.DEV && Object.keys(enLegalFlat).length === 0) {
  console.error("[legal] EN legal messages failed to load");
}

/** Legal pages: BG source, English for every other site locale. */
export function resolveLegalMessage(
  locale: string,
  key: string,
  fallback?: string
): string | undefined {
  const isBg = locale === SOURCE_LOCALE;
  const flat = isBg ? bgLegalFlat : enLegalFlat;
  const resolved = resolveMessage(flat, key);
  if (resolved !== undefined) return resolved;
  return isBg ? fallback : undefined;
}

export function isLegalBgLocale(locale: string): boolean {
  return locale === SOURCE_LOCALE;
}
