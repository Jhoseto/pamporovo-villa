import type { Request, Response } from "express";
import {
  absoluteUrl,
  getSeoVillaFacts,
  getSiteUrl,
  SEO_PATHS,
  SEO_SITE,
  SEO_SOCIAL,
} from "../shared/seoConstants";
import { parseSiteLocale } from "../shared/i18n/parseLocale";
import { ALL_LOCALES, SOURCE_LOCALE } from "../shared/i18n/locales";
import { localizedUrl } from "../shared/i18n/localeMeta";
import { GBP } from "../shared/gbpLinks";

export function handleFactsJson(req: Request, res: Response): void {
  const rawUrl = req.url ?? "";
  const lang = parseSiteLocale(rawUrl.includes("?") ? rawUrl.slice(rawUrl.indexOf("?")) : "");
  const en = lang !== SOURCE_LOCALE;

  const payload = {
    business: SEO_SITE.name,
    type: "vacation_rental",
    website: getSiteUrl(),
    rentPage: en ? localizedUrl(SEO_PATHS.rent, lang) : absoluteUrl(SEO_PATHS.rent),
    bookingUrl: absoluteUrl(SEO_PATHS.booking),
    guideUrl: en ? localizedUrl(SEO_PATHS.pamporovo, lang) : absoluteUrl(SEO_PATHS.pamporovo),
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
          "1 bathroom",
          "fireplace",
          "BBQ veranda",
          "fully equipped kitchen",
          "Wi-Fi",
          "free parking",
        ]
      : [
          "2 спални",
          "1 баня",
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
    googleReviewUrl: GBP.reviewUrl,
    googleMapsUrl: GBP.mapsUrl,
    languages: ALL_LOCALES,
    lang,
    updatedAt: new Date().toISOString(),
  };

  res.set("Cache-Control", "public, max-age=86400");
  res.json(payload);
}

export function registerFactsRoute(app: { get: (path: string, handler: (req: Request, res: Response) => void) => void }): void {
  app.get("/facts.json", handleFactsJson);
}
