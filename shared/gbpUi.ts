import type { SeoLang } from "./seoEnMeta";

/** UI copy for GBP review CTAs — shared between site components */
export const GBP_UI: Record<
  SeoLang,
  {
    reviewLink: string;
    reviewShort: string;
    reviewToast: string;
    reviewToastAction: string;
    directions: string;
  }
> = {
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

export function gbpUi(lang: SeoLang) {
  return GBP_UI[lang];
}
