import type { PamporovoSpoke, PamporovoSpokeSlug } from "../pamporovoSpokeTypes";
import type { SiteLocale } from "../i18n/locales";
import { SOURCE_LOCALE } from "../i18n/locales";
import { PAMPOROVO_SPOKES_EN, type SpokeEnBundle } from "./pamporovoSpokesEn";

export type { SpokeEnBundle };

export function getSpokeEn(slug: PamporovoSpokeSlug): SpokeEnBundle | undefined {
  return PAMPOROVO_SPOKES_EN[slug];
}

/** Uses EN bundle as fallback for all non-BG locales until generated spokes.json is wired in UI. */
export function localizeSpoke(spoke: PamporovoSpoke, lang: SiteLocale): PamporovoSpoke {
  if (lang === SOURCE_LOCALE) return spoke;
  const en = getSpokeEn(spoke.slug);
  if (!en) return spoke;
  return {
    ...spoke,
    eyebrow: en.eyebrow,
    h1: en.h1,
    intro: en.intro,
    seoTitle: en.seoTitle,
    seoDescription: en.seoDescription,
    seoKeywords: en.seoKeywords,
    sections: en.sections,
  };
}

export function spokeSeoTitle(spoke: PamporovoSpoke, lang: SiteLocale): string {
  if (lang === SOURCE_LOCALE) return spoke.seoTitle;
  return getSpokeEn(spoke.slug)?.seoTitle ?? spoke.seoTitle;
}

export function spokeSeoDescription(spoke: PamporovoSpoke, lang: SiteLocale): string {
  if (lang === SOURCE_LOCALE) return spoke.seoDescription;
  return getSpokeEn(spoke.slug)?.seoDescription ?? spoke.seoDescription;
}
