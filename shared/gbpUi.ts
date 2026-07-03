import type { SiteLocale } from "./i18n/locales";
import { SOURCE_LOCALE } from "./i18n/locales";

type GbpUiCopy = {
  reviewLink: string;
  reviewShort: string;
  reviewToast: string;
  reviewToastAction: string;
  directions: string;
};

const GBP_UI: Record<"bg" | "en", GbpUiCopy> = {
  bg: {
    reviewLink: "Оставете отзив в Google",
    reviewShort: "Google отзив",
    reviewToast: "Споделете и в Google — помага на други гости да ни открият.",
    reviewToastAction: "Google отзив",
    directions: "Навигирай до нас",
  },
  en: {
    reviewLink: "Leave a Google review",
    reviewShort: "Google review",
    reviewToast: "Share on Google too — it helps other guests find us.",
    reviewToastAction: "Google review",
    directions: "Get directions",
  },
};

export function gbpUi(lang: SiteLocale): GbpUiCopy {
  if (lang === SOURCE_LOCALE) return GBP_UI.bg;
  return GBP_UI.en;
}

export { GBP_UI };
