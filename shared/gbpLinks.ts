import { SEO_SOCIAL } from "./seoConstants";

/**
 * Google Business Profile — same entity as JSON-LD `sameAs` / `hasMap`.
 * Keep NAP identical to GBP dashboard (phone, address, website).
 */
export const GBP = {
  /** Decimal CID from Maps listing (hex 0x12efd0d28f70a9bc) */
  cid: "1364538814884784572",
  /** Google feature id — /g/11hz6s597c */
  featureId: "11hz6s597c",
  mapsUrl: SEO_SOCIAL.googleMaps,
  /** Reviews tab on the verified listing — “Write a review” is one tap away */
  reviewUrl:
    "https://www.google.com/maps/place/Pamporovo+Villa/reviews/@41.6218681,24.7136265,17z/data=!4m8!3m7!1s0x14ac59a187021781:0x12efd0d28f70a9bc!8m2!3d41.6218681!4d24.7136265!16s%2Fg%2F11hz6s597c",
  /** CID shortcut — same listing, useful in SMS / print */
  mapsCidUrl: "https://www.google.com/maps?cid=1364538814884784572",
} as const;

export function googleReviewUrl(): string {
  return GBP.reviewUrl;
}
