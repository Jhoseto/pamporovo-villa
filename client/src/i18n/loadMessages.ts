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

const generatedLoaders = import.meta.glob<NestedMessages>(
  "@shared/locales/generated/*/*.json",
  { import: "default" }
);

const localeCache = new Map<SiteLocale, FlatMessages>();

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

function findLoader(
  loaders: Record<string, () => Promise<NestedMessages>>,
  suffix: string
): (() => Promise<NestedMessages>) | undefined {
  for (const [path, loader] of Object.entries(loaders)) {
    if (path.replace(/\\/g, "/").endsWith(suffix)) return loader;
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

export async function loadClientMessagesAsync(locale: SiteLocale): Promise<FlatMessages> {
  if (locale === SOURCE_LOCALE) return bgFlat;

  const cached = localeCache.get(locale);
  if (cached) return cached;

  const flat: FlatMessages = {};
  await Promise.all(
    LOCALE_NAMESPACES.map(async (ns) => {
      const loader = findLoader(generatedLoaders, `/generated/${locale}/${ns}.json`);
      if (!loader) return;
      const mod = await loader();
      Object.assign(flat, flattenObject(prefixNamespace(ns, mod)));
    })
  );

  localeCache.set(locale, flat);
  return flat;
}

/** Sync access — BG only; other locales use cache after async load. */
export function loadClientMessages(locale: SiteLocale): FlatMessages {
  if (locale === SOURCE_LOCALE) return bgFlat;
  return localeCache.get(locale) ?? {};
}

export function resolveMessage(messages: FlatMessages, key: string): string | undefined {
  return messages[key];
}
