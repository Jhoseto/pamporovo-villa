import { VILLA_IDS, VILLA_LABELS, type VillaId } from "./villas";

/** Canonical SEO / NAP facts — single source for server meta, facts.json, llms.txt */
export const SEO_SITE = {
  name: "Pamporovo Villa",
  nameBg: "Pamporovo Villa",
  tagline: "3 вили под наем",
  description:
    "Pamporovo Villa — три самостоятелни вили под наем в к.к. Пампорово, местност Райковски ливади. 2 спални, 2 бани, камина, барбекю, до 6 гости.",
  email: "pamporovovilla@gmail.com",
  phone: "+359879501660",
  phoneDisplay: "+359 879 501 660",
  address: "к.к. Пампорово, местност Райковски ливади",
  postalCode: "4870",
  locality: "Pamporovo",
  region: "Smolyan",
  country: "Bulgaria",
  lat: 41.6218681,
  lng: 24.7136265,
  priceMinEur: 110,
  priceMaxEur: 180,
  priceCurrency: "EUR",
  maxGuestsPerVilla: 6,
  bedrooms: 2,
  bathrooms: 2,
} as const;

export function getSiteUrl(): string {
  const fromEnv = process.env.SITE_URL?.replace(/\/$/, "");
  return fromEnv || "https://pamporovovilla.com";
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path || path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export const SEO_PATHS = {
  home: "/",
  rent: "/rent",
  pamporovo: "/pamporovo",
  legal: "/legal",
  booking: "/#booking",
  pricing: "/#pricing",
} as const;

export const SEO_OG = {
  default: "/og-image.jpg",
  pamporovo: "/og/pamporovo.jpg",
  rent: "/og/rent.jpg",
  width: 1200,
  height: 630,
} as const;

export function spokeOgPath(slug: string): string {
  return `/og/spokes/${slug}.jpg`;
}

export function villaOgPath(id: string): string {
  return `/og/${id}.jpg`;
}

/** Featured YouTube tour — VideoObject schema on homepage */
export const SEO_VIDEO = {
  youtubeId: "_B1k20hd_yY",
  name: "Pamporovo Villa — villa tour in the Rhodope Mountains",
  description:
    "Video tour of Pamporovo Villa — three private chalets for rent in Pamporovo, Bulgaria. Fireplace, BBQ, 2 km from ski center.",
  uploadDate: "2019-06-01",
} as const;

/** IndexNow API key — also served at /{INDEXNOW_KEY}.txt */
export const INDEXNOW_KEY = "pamporovo-villa-indexnow-key-2026";

export const SEO_SOCIAL = {
  facebook: "https://www.facebook.com/PamporovoVilla/",
  instagram: "https://www.instagram.com/pamporovo_villa/",
  youtube: "https://www.youtube.com/channel/UC5zCKG7LpovT_Y6wKab9wfg",
  googleMaps:
    "https://www.google.com/maps/place/Pamporovo+Villa/@41.6218681,24.7136265,17z/data=!4m8!3m7!1s0x14ac59a187021781:0x12efd0d28f70a9bc!8m2!3d41.6218681!4d24.7136265!16s%2Fg%2F11hz6s597c",
} as const;

export type SeoVillaFact = {
  id: VillaId;
  name: string;
  nameEn: string;
  url: string;
  fromPriceEur: number;
  maxGuests: number;
};

export function getSeoVillaFacts(): SeoVillaFact[] {
  return VILLA_IDS.map((id) => ({
    id,
    name: VILLA_LABELS[id],
    nameEn: id === "villa-deluxe" ? "Villa Deluxe" : id === "villa-1" ? "Villa 1" : "Villa 2",
    url: absoluteUrl(`/villa/${id}`),
    fromPriceEur: SEO_SITE.priceMinEur,
    maxGuests: SEO_SITE.maxGuestsPerVilla,
  }));
}

export const LEGACY_REDIRECTS: ReadonlyArray<{ from: string; to: string }> = [
  { from: "/вила-пампорово", to: "/#about" },
  { from: "/vila-pamporovo", to: "/#about" },
  { from: "/цени", to: "/#pricing" },
  { from: "/bg/ceni", to: "/#pricing" },
  { from: "/контакт", to: "/#contact" },
  { from: "/bg/kontakt", to: "/#contact" },
  { from: "/галерия", to: "/#gallery" },
  { from: "/оферти", to: "/#pricing" },
  { from: "/политика-на-вила-пампорово", to: "/legal" },
  { from: "/bg/politika", to: "/legal" },
];
