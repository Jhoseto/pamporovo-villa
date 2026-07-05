import type { VillaId } from "../villas";
import type { VillaPageConfig } from "../villaPages";

type VillaEnFields = Pick<
  VillaPageConfig,
  "seoTitle" | "seoDescription" | "seoKeywords" | "h1" | "tagline"
> & { description: string };

export const VILLA_PAGES_EN: Record<VillaId, VillaEnFields> = {
  "villa-1": {
    seoTitle: "Villa 1 for Rent in Pamporovo | 2 Bedrooms, Fireplace — Pamporovo Villa",
    seoDescription:
      "Rent Villa 1 in Pamporovo — cosy family chalet, 2 bedrooms, 1 bathroom, fireplace, BBQ, up to 6 guests. Raykovski Livadi, 2 km from pistes. Book online.",
    seoKeywords: "Villa 1 Pamporovo, family chalet Bulgaria, Pamporovo Villa rental",
    h1: "Villa 1 — rent in Pamporovo",
    tagline: "Cosy for the whole family",
    description:
      "Warm and welcoming — two bedrooms, one bathroom, and a large living room where the fireplace crackles and BBQ awaits on the veranda. A favourite for families with children.",
  },
  "villa-2": {
    seoTitle: "Villa 2 for Rent in Pamporovo | 2 Bedrooms, BBQ Terrace",
    seoDescription:
      "Rent Villa 2 in Pamporovo — bright villa with panorama, 2 bedrooms, fireplace, BBQ, up to 6 guests. Official rental — Pamporovo Villa.",
    seoKeywords: "Villa 2 Pamporovo, chalet rental, BBQ terrace Pamporovo",
    h1: "Villa 2 — rent in Pamporovo",
    tagline: "Sun from dawn to dusk",
    description:
      "Bright and spacious with two bedrooms, one bathroom, and a living room open to the mountains. The BBQ veranda is made for long evenings with friends.",
  },
  "villa-deluxe": {
    seoTitle: "Villa Deluxe Pamporovo | Premium Chalet Rental",
    seoDescription:
      "Villa Deluxe in Pamporovo — our finest chalet, 2 bedrooms, fireplace, BBQ, up to 6 guests. Book online at Pamporovo Villa.",
    seoKeywords: "Villa Deluxe Pamporovo, luxury chalet Bulgaria, premium rental",
    h1: "Villa Deluxe — rent in Pamporovo",
    tagline: "A little more luxury",
    description:
      "The most refined of the three — same comfort with two bedrooms, one bathroom, and a large living room, but with extra attention to detail and atmosphere. For those who want something special.",
  },
};

export function getVillaPageEn(id: VillaId) {
  return VILLA_PAGES_EN[id];
}
