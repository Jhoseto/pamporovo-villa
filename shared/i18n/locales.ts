/** Bulgarian is the source locale — never listed in TARGET_LOCALES. */
export const SOURCE_LOCALE = "bg" as const;

/** European tourist + RU + TR — auto-translated from BG via i18n-sync. */
export const TARGET_LOCALES = [
  "en",
  "de",
  "fr",
  "it",
  "es",
  "pl",
  "nl",
  "ro",
  "el",
  "cs",
  "hu",
  "ru",
  "tr",
  "pt",
] as const;

export type TargetLocale = (typeof TARGET_LOCALES)[number];
export type SiteLocale = typeof SOURCE_LOCALE | TargetLocale;

export const ALL_LOCALES: SiteLocale[] = [SOURCE_LOCALE, ...TARGET_LOCALES];

export type LocaleMeta = {
  code: SiteLocale;
  label: string;
  nativeName: string;
  ogLocale: string;
  deeplCode: string | null;
  hreflang: string;
};

export const LOCALE_META: Record<SiteLocale, LocaleMeta> = {
  bg: {
    code: "bg",
    label: "Bulgarian",
    nativeName: "Български",
    ogLocale: "bg_BG",
    deeplCode: null,
    hreflang: "bg",
  },
  en: {
    code: "en",
    label: "English",
    nativeName: "English",
    ogLocale: "en_GB",
    deeplCode: "EN",
    hreflang: "en",
  },
  de: {
    code: "de",
    label: "German",
    nativeName: "Deutsch",
    ogLocale: "de_DE",
    deeplCode: "DE",
    hreflang: "de",
  },
  fr: {
    code: "fr",
    label: "French",
    nativeName: "Français",
    ogLocale: "fr_FR",
    deeplCode: "FR",
    hreflang: "fr",
  },
  it: {
    code: "it",
    label: "Italian",
    nativeName: "Italiano",
    ogLocale: "it_IT",
    deeplCode: "IT",
    hreflang: "it",
  },
  es: {
    code: "es",
    label: "Spanish",
    nativeName: "Español",
    ogLocale: "es_ES",
    deeplCode: "ES",
    hreflang: "es",
  },
  pl: {
    code: "pl",
    label: "Polish",
    nativeName: "Polski",
    ogLocale: "pl_PL",
    deeplCode: "PL",
    hreflang: "pl",
  },
  nl: {
    code: "nl",
    label: "Dutch",
    nativeName: "Nederlands",
    ogLocale: "nl_NL",
    deeplCode: "NL",
    hreflang: "nl",
  },
  ro: {
    code: "ro",
    label: "Romanian",
    nativeName: "Română",
    ogLocale: "ro_RO",
    deeplCode: "RO",
    hreflang: "ro",
  },
  el: {
    code: "el",
    label: "Greek",
    nativeName: "Ελληνικά",
    ogLocale: "el_GR",
    deeplCode: "EL",
    hreflang: "el",
  },
  cs: {
    code: "cs",
    label: "Czech",
    nativeName: "Čeština",
    ogLocale: "cs_CZ",
    deeplCode: "CS",
    hreflang: "cs",
  },
  hu: {
    code: "hu",
    label: "Hungarian",
    nativeName: "Magyar",
    ogLocale: "hu_HU",
    deeplCode: "HU",
    hreflang: "hu",
  },
  ru: {
    code: "ru",
    label: "Russian",
    nativeName: "Русский",
    ogLocale: "ru_RU",
    deeplCode: "RU",
    hreflang: "ru",
  },
  tr: {
    code: "tr",
    label: "Turkish",
    nativeName: "Türkçe",
    ogLocale: "tr_TR",
    deeplCode: "TR",
    hreflang: "tr",
  },
  pt: {
    code: "pt",
    label: "Portuguese",
    nativeName: "Português",
    ogLocale: "pt_PT",
    deeplCode: "PT-PT",
    hreflang: "pt",
  },
};

export const LOCALE_NAMESPACES = [
  "common",
  "nav",
  "home",
  "footer",
  "gbp",
  "seo",
  "rent",
  "booking",
  "reviews",
  "faq",
  "spokes",
] as const;

export type LocaleNamespace = (typeof LOCALE_NAMESPACES)[number];

export function isSiteLocale(value: string): value is SiteLocale {
  return (ALL_LOCALES as string[]).includes(value);
}

export function isTargetLocale(value: string): value is TargetLocale {
  return (TARGET_LOCALES as readonly string[]).includes(value);
}
