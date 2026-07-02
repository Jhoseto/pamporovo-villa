import { HOME_FAQ, homeFaqToSchema, type HomeFaqItem } from "../homeFaq";
import {
  PAMPOROVO_FAQ,
  type PamporovoFaqItem,
  type PamporovoFaqTag,
  faqToSchema,
} from "../pamporovoFaq";
import type { SeoLang } from "../seoEnMeta";
import { HOME_FAQ_EN } from "./homeFaqEn";
import { PAMPOROVO_FAQ_EN } from "./pamporovoFaqEn";

export function getLocalizedHomeFaq(lang: SeoLang): HomeFaqItem[] {
  return lang === "en" ? HOME_FAQ_EN : HOME_FAQ;
}

export function getLocalizedPamporovoFaq(lang: SeoLang, tags?: PamporovoFaqTag[]): PamporovoFaqItem[] {
  const source = lang === "en" ? PAMPOROVO_FAQ_EN : PAMPOROVO_FAQ;
  if (!tags?.length) return source;
  return source.filter((item) => item.tags.some((t) => tags.includes(t)));
}

export function localizedHomeFaqSchema(lang: SeoLang, items: HomeFaqItem[]) {
  return homeFaqToSchema(items);
}

export function localizedFaqSchema(items: PamporovoFaqItem[]) {
  return faqToSchema(items);
}
