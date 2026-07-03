import { absoluteUrl } from "./seoConstants";
import { PAMPOROVO_SPOKES, spokePath } from "./pamporovoSpokes";
import { PAMPOROVO_SPOKES_EN } from "./en/pamporovoSpokesEn";
import { VILLA_PAGE_CONFIGS, villaPath } from "./villaPages";
import { VILLA_PAGES_EN } from "./en/villaPagesEn";

export {
  parseSiteLocale,
  parseSiteLocale as parseSeoLang,
} from "./i18n/parseLocale";

export type { SiteLocale, SiteLocale as SeoLang } from "./i18n/locales";

export {
  HREFLANG_PATHS,
  localizedUrl,
  hreflangTagsForPath,
  ogLocaleFor,
  allLocalizedSitemapUrls,
} from "./i18n/localeMeta";

/** English SEO overrides — seeded into generated/en via i18n-sync */
export type EnSeoEntry = {
  title: string;
  description: string;
  keywords?: string;
};

const CORE_EN_SEO: Record<string, EnSeoEntry> = {
  "/": {
    title: "Pamporovo Villa | 3 Private Villas for Rent in Pamporovo, Bulgaria",
    description:
      "Rent a whole villa in Pamporovo — 3 private chalets on Raykovski Livadi. 2 bedrooms, fireplace, BBQ, up to 6 guests. Book direct.",
    keywords: "Pamporovo villa rental, Bulgaria ski chalet, Rhodope mountains",
  },
  "/rent": {
    title: "Rent a Villa in Pamporovo | 3 Villas from €110/night — Pamporovo Villa",
    description:
      "Official rental page: 3 private villas in Pamporovo, Bulgaria. Whole villa for your group — fireplace, BBQ, 2 km from ski center. Book online.",
    keywords: "rent villa Pamporovo, Pamporovo chalet rental, Bulgaria holiday home",
  },
  "/pamporovo": {
    title: "Pamporovo Travel Guide 2026 | Ski, Hiking, Caves — Pamporovo Villa",
    description:
      "Complete guide to Pamporovo resort: 37+ km ski runs, eco trails, caves, villages. Where to stay — 3 villas from €110/night.",
    keywords: "Pamporovo guide, ski Bulgaria, Rhodope travel",
  },
};

function buildSpokeEnSeo(): Record<string, EnSeoEntry> {
  const entries: Record<string, EnSeoEntry> = {};
  for (const spoke of PAMPOROVO_SPOKES) {
    const en = PAMPOROVO_SPOKES_EN[spoke.slug];
    if (!en) continue;
    entries[spokePath(spoke.slug)] = {
      title: en.seoTitle,
      description: en.seoDescription,
      keywords: en.seoKeywords,
    };
  }
  return entries;
}

function buildVillaEnSeo(): Record<string, EnSeoEntry> {
  const entries: Record<string, EnSeoEntry> = {};
  for (const config of VILLA_PAGE_CONFIGS) {
    const en = VILLA_PAGES_EN[config.id];
    if (!en) continue;
    entries[villaPath(config.id)] = {
      title: en.seoTitle,
      description: en.seoDescription,
      keywords: en.seoKeywords,
    };
  }
  return entries;
}

export const EN_SEO: Record<string, EnSeoEntry> = {
  ...CORE_EN_SEO,
  ...buildSpokeEnSeo(),
  ...buildVillaEnSeo(),
};
