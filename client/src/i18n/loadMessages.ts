import {
  LOCALE_NAMESPACES,
  SOURCE_LOCALE,
  type LocaleNamespace,
  type SiteLocale,
} from "@shared/i18n/locales";

type NestedMessages = Record<string, unknown>;
export type FlatMessages = Record<string, string>;

const bgModules = import.meta.glob<NestedMessages>("@shared/locales/bg/*.json", {
  eager: true,
  import: "default",
});

const generatedModules = import.meta.glob<NestedMessages>(
  "@shared/locales/generated/*/*.json",
  { eager: true, import: "default" }
);

function flattenObject(obj: NestedMessages, prefix = ""): FlatMessages {
  const out: FlatMessages = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(out, flattenObject(value as NestedMessages, fullKey));
    } else if (typeof value === "string") {
      out[fullKey] = value;
    }
  }
  return out;
}

function prefixNamespace(ns: LocaleNamespace, obj: NestedMessages): NestedMessages {
  const out: NestedMessages = {};
  for (const [key, value] of Object.entries(obj)) {
    out[`${ns}.${key}`] = value;
  }
  return out;
}

function findModule(
  modules: Record<string, NestedMessages>,
  suffix: string
): NestedMessages | undefined {
  for (const [path, mod] of Object.entries(modules)) {
    if (path.replace(/\\/g, "/").endsWith(suffix)) return mod;
  }
  return undefined;
}

function loadBgFlat(): FlatMessages {
  let flat: FlatMessages = {};
  for (const ns of LOCALE_NAMESPACES) {
    const mod = findModule(bgModules, `/bg/${ns}.json`);
    if (mod) {
      flat = { ...flat, ...flattenObject(prefixNamespace(ns, mod)) };
    }
  }
  return flat;
}

const bgFlat = loadBgFlat();

export function loadClientMessages(locale: SiteLocale): FlatMessages {
  if (locale === SOURCE_LOCALE) return bgFlat;

  const out: FlatMessages = { ...bgFlat };
  for (const ns of LOCALE_NAMESPACES) {
    const mod = findModule(generatedModules, `/generated/${locale}/${ns}.json`);
    if (mod) {
      Object.assign(out, flattenObject(prefixNamespace(ns, mod)));
    }
  }
  return out;
}

export function resolveMessage(messages: FlatMessages, key: string): string | undefined {
  return messages[key];
}
