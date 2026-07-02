import type { Request, Response } from "express";
import {
  absoluteUrl,
  getSeoVillaFacts,
  getSiteUrl,
  SEO_PATHS,
  SEO_SITE,
  SEO_SOCIAL,
} from "../shared/seoConstants";
import { parseSeoLang } from "../shared/seoEnMeta";

export function handleFactsJson(req: Request, res: Response): void {
  const rawUrl = req.url ?? "";
  const lang = parseSeoLang(rawUrl.includes("?") ? rawUrl.slice(rawUrl.indexOf("?")) : "");
  const en = lang === "en";

  const payload = {
    business: SEO_SITE.name,
    type: "vacation_rental",
    website: getSiteUrl(),
    rentPage: en ? absoluteUrl(`${SEO_PATHS.rent}?lang=en`) : absoluteUrl(SEO_PATHS.rent),
    bookingUrl: absoluteUrl(SEO_PATHS.booking),
    guideUrl: en ? absoluteUrl(`${SEO_PATHS.pamporovo}?lang=en`) : absoluteUrl(SEO_PATHS.pamporovo),
    pricingUrl: absoluteUrl(SEO_PATHS.pricing),
    villas: getSeoVillaFacts(),
    units: getSeoVillaFacts().length,
    priceRange: {
      currency: SEO_SITE.priceCurrency,
      min: SEO_SITE.priceMinEur,
      max: SEO_SITE.priceMaxEur,
      unit: "night",
      note: en ? "Per whole villa, up to 6 guests" : "Цяла вила, до 6 гости",
    },
    amenities: en
      ? [
          "2 bedrooms",
          "2 bathrooms",
          "fireplace",
          "BBQ veranda",
          "fully equipped kitchen",
          "Wi-Fi",
          "free parking",
        ]
      : [
          "2 спални",
          "2 бани",
          "камина",
          "BBQ веранда",
          "оборудвана кухня",
          "Wi-Fi",
          "безплатен паркинг",
        ],
    contact: {
      phone: SEO_SITE.phone,
      phoneDisplay: SEO_SITE.phoneDisplay,
      email: SEO_SITE.email,
    },
    location: {
      address: SEO_SITE.address,
      locality: SEO_SITE.locality,
      region: SEO_SITE.region,
      country: SEO_SITE.country,
      lat: SEO_SITE.lat,
      lng: SEO_SITE.lng,
      distanceToResortCenter: "2 km",
    },
    sameAs: [
      SEO_SOCIAL.googleMaps,
      SEO_SOCIAL.facebook,
      SEO_SOCIAL.instagram,
      SEO_SOCIAL.youtube,
    ],
    languages: ["bg", "en"],
    lang,
    updatedAt: new Date().toISOString(),
  };

  res.set("Cache-Control", "public, max-age=86400");
  res.json(payload);
}

export function registerFactsRoute(app: { get: (path: string, handler: (req: Request, res: Response) => void) => void }): void {
  app.get("/facts.json", handleFactsJson);
}
