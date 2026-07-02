import type { PamporovoSpoke, PamporovoSpokeSlug } from "../pamporovoSpokeTypes";
import type { SeoLang } from "../seoEnMeta";
import { PAMPOROVO_SPOKES_EN, type SpokeEnBundle } from "./pamporovoSpokesEn";

export type { SpokeEnBundle };

export function getSpokeEn(slug: PamporovoSpokeSlug): SpokeEnBundle | undefined {
  return PAMPOROVO_SPOKES_EN[slug];
}

export function localizeSpoke(spoke: PamporovoSpoke, lang: SeoLang): PamporovoSpoke {
  if (lang !== "en") return spoke;
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

export function spokeSeoTitle(spoke: PamporovoSpoke, lang: SeoLang): string {
  if (lang === "en") return getSpokeEn(spoke.slug)?.seoTitle ?? spoke.seoTitle;
  return spoke.seoTitle;
}

export function spokeSeoDescription(spoke: PamporovoSpoke, lang: SeoLang): string {
  if (lang === "en") return getSpokeEn(spoke.slug)?.seoDescription ?? spoke.seoDescription;
  return spoke.seoDescription;
}
