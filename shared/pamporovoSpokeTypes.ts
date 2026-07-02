import type { PamporovoFaqTag } from "./pamporovoFaq";

export type PamporovoSpokeSlug =
  | "pisti"
  | "kude-da-spim"
  | "hotel-vs-vila"
  | "naem-vila"
  | "vila-s-kamina"
  | "naem-zima"
  | "lato"
  | "zima"
  | "yagodinska-pechtera"
  | "shiroka-laka"
  | "eco-pateki"
  | "kak-da-stignem"
  | "vila-za-dvoika"
  | "vila-za-grupa"
  | "naem-lqto"
  | "rajkovski-livadi"
  | "naem-ot-110-evro"
  | "semeen-otpusk"
  | "praznici"
  | "team-building"
  | "dalga-pochivka"
  | "oferti"
  | "liftove"
  | "rozhen"
  | "chudnite-mostove"
  | "dyavolskoto-garlo"
  | "trigradsko-zhdrelo"
  | "uhlovitsa"
  | "kanion-vodopadi"
  | "smolyanski-ezera"
  | "nevyastata"
  | "orpheus-rocks"
  | "momchilovtsi"
  | "gela"
  | "smolyan"
  | "nochno-karane"
  | "stenata"
  | "vruh-snezhanka"
  | "ski-karti"
  | "bunovsko-zhdrelo"
  | "chepelare";

export interface SpokeSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface PamporovoSpoke {
  slug: PamporovoSpokeSlug;
  eyebrow: string;
  h1: string;
  intro: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  sections: SpokeSection[];
  relatedSlugs: PamporovoSpokeSlug[];
  faqTags: PamporovoFaqTag[];
  showPisteTable?: boolean;
  showLiftTable?: boolean;
  emphasizeVillaCta?: boolean;
  featuredAttractionIds?: string[];
  /** Inject TouristAttraction JSON-LD (uses featured attraction or spoke title) */
  touristAttraction?: boolean;
}
