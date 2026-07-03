import {
  absoluteUrl,
  getSeoVillaFacts,
  getSiteUrl,
  SEO_OG,
  SEO_PATHS,
  SEO_SITE,
  SEO_SOCIAL,
  SEO_VIDEO,
  spokeOgPath,
  villaOgPath,
} from "../shared/seoConstants";
import { PAMPOROVO_SPOKES, spokePath, getSpokeBySlug, type PamporovoSpoke } from "../shared/pamporovoSpokes";
import { faqToSchema, getFaqByTags } from "../shared/pamporovoFaq";
import { HOME_FAQ, homeFaqToSchema } from "../shared/homeFaq";
import {
  VILLA_PAGE_CONFIGS,
  villaPath,
  isVillaId,
  type VillaPageConfig,
} from "../shared/villaPages";
import { VILLA_LABELS } from "../shared/villas";
import { EN_SEO, HREFLANG_PATHS, localizedUrl, type SeoLang } from "../shared/seoEnMeta";
import type { PamporovoSpokeSlug } from "../shared/pamporovoSpokeTypes";
import { localizeSpoke } from "../shared/en/localizeSpoke";
import { getVillaPageEn } from "../shared/en/villaPagesEn";
import { LIFT_FACTS, PISTE_FACTS } from "../shared/pamporovoSkiData";
import { galleryImagesForSitemap, homepageGalleryImagesForSitemap, villaGalleryImagesForSitemap } from "../shared/seoGalleryImages";
import { getCachedReviewSchema } from "./seoReviewsCache";

export type RouteSeoBundle = {
  title: string;
  description: string;
  keywords?: string;
  canonical: string;
  ogType: string;
  ogImage: string;
  ogImageWidth: number;
  ogImageHeight: number;
  ogImageAlt: string;
  ogLocale: string;
  jsonLd: Record<string, unknown>[];
  noscriptHtml: string;
};

export function normalizePathname(rawPathname: string): string {
  try {
    const decoded = decodeURIComponent(rawPathname.split("?")[0] ?? "/");
    if (!decoded || decoded === "") return "/";
    const withSlash = decoded.startsWith("/") ? decoded : `/${decoded}`;
    if (withSlash.length > 1 && withSlash.endsWith("/")) {
      return withSlash.slice(0, -1);
    }
    return withSlash;
  } catch {
    return "/";
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ogImageUrl(relativePath: string): string {
  return absoluteUrl(relativePath);
}

function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${getSiteUrl()}/#organization`,
    name: SEO_SITE.name,
    url: getSiteUrl(),
    email: SEO_SITE.email,
    telephone: SEO_SITE.phone,
    sameAs: [SEO_SOCIAL.googleMaps, SEO_SOCIAL.facebook, SEO_SOCIAL.instagram, SEO_SOCIAL.youtube],
    knowsAbout: [
      "Pamporovo ski resort",
      "Pamporovo villa rental",
      "vacation rental Bulgaria",
      "Rhodope Mountains",
      "ski holidays Bulgaria",
    ],
    makesOffer: {
      "@type": "Offer",
      priceCurrency: SEO_SITE.priceCurrency,
      lowPrice: String(SEO_SITE.priceMinEur),
      highPrice: String(SEO_SITE.priceMaxEur),
      url: absoluteUrl(SEO_PATHS.rent),
    },
  };
}

function lodgingBusinessJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "@id": `${getSiteUrl()}/#business`,
    name: SEO_SITE.name,
    description: SEO_SITE.description,
    url: getSiteUrl(),
    email: SEO_SITE.email,
    telephone: SEO_SITE.phone,
    priceRange: "€€",
    hasMap: SEO_SOCIAL.googleMaps,
    address: {
      "@type": "PostalAddress",
      streetAddress: SEO_SITE.address,
      addressLocality: SEO_SITE.locality,
      addressRegion: SEO_SITE.region,
      postalCode: SEO_SITE.postalCode,
      addressCountry: "BG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SEO_SITE.lat,
      longitude: SEO_SITE.lng,
    },
    sameAs: [SEO_SOCIAL.googleMaps, SEO_SOCIAL.facebook, SEO_SOCIAL.instagram],
  };
}

function homeNoscript(): string {
  return `<article>
<h1>${escapeHtml(SEO_SITE.name)} — ${escapeHtml(SEO_SITE.tagline)}</h1>
<p>${escapeHtml(SEO_SITE.description)}</p>
<p>Цени от ${SEO_SITE.priceMinEur} €/нощ за цяла вила. Резервация: ${escapeHtml(absoluteUrl(SEO_PATHS.booking))}</p>
<p>Телефон: ${escapeHtml(SEO_SITE.phoneDisplay)} · Имейл: ${escapeHtml(SEO_SITE.email)}</p>
<p><a href="${escapeHtml(absoluteUrl(SEO_PATHS.pamporovo))}">Пълен гид за Пампорово</a> · <a href="${escapeHtml(absoluteUrl(SEO_PATHS.rent))}">Наем на вила</a></p>
</article>`;
}

function pamporovoNoscript(): string {
  return `<article>
<h1>Пампорово — пълен гид за курорта и региона</h1>
<p>37+ км ски писти, 6 лифта, нощно каране на писта Стената, еко пътеки, пещери и забележителности около Смолян. Надморска височина 1650 м.</p>
<p>Къде да спите: ${escapeHtml(SEO_SITE.name)} предлага 3 самостоятелни вили на Райковски ливади — от ${SEO_SITE.priceMinEur} €/нощ, до ${SEO_SITE.maxGuestsPerVilla} гости, камина и барbecue.</p>
<p>Резервация: ${escapeHtml(absoluteUrl(SEO_PATHS.booking))} · ${escapeHtml(absoluteUrl(SEO_PATHS.rent))}</p>
<p>Телефон: ${escapeHtml(SEO_SITE.phoneDisplay)}</p>
</article>`;
}

function rentNoscript(): string {
  const villas = getSeoVillaFacts()
    .map((v) => `${v.name} (${v.nameEn}) — до ${v.maxGuests} гости, от ${v.fromPriceEur} €/нощ`)
    .join(". ");
  return `<article>
<h1>Наем на вила в Пампорово — ${escapeHtml(SEO_SITE.name)}</h1>
<p>3 самостоятелни вили под наем в к.к. Пампорово, местност Райковски ливади. Всяка вила: ${SEO_SITE.bedrooms} спални, ${SEO_SITE.bathrooms} бани, камина на дърва, барbecue, Wi-Fi, паркинг. ${villas}.</p>
<p>Цени: ${SEO_SITE.priceMinEur}–${SEO_SITE.priceMaxEur} €/нощ за цяла вила (до ${SEO_SITE.maxGuestsPerVilla} гости). 2 км от центъра на Пампорово.</p>
<p>Резервирайте онлайн: ${escapeHtml(absoluteUrl(SEO_PATHS.booking))}</p>
<p>Телефон: ${escapeHtml(SEO_SITE.phoneDisplay)} · Имейл: ${escapeHtml(SEO_SITE.email)}</p>
</article>`;
}

function homeEnNoscript(): string {
  return `<article>
<h1>${escapeHtml(SEO_SITE.name)} — Rent private villas in Pamporovo, Bulgaria</h1>
<p>${escapeHtml(EN_SEO["/"]?.description ?? SEO_SITE.description)}</p>
<p>From ${SEO_SITE.priceMinEur} €/night for a whole villa. Book: ${escapeHtml(absoluteUrl(SEO_PATHS.booking))}</p>
<p>Phone: ${escapeHtml(SEO_SITE.phoneDisplay)} · Email: ${escapeHtml(SEO_SITE.email)}</p>
<p><a href="${escapeHtml(localizedUrl(SEO_PATHS.pamporovo, "en"))}">Pamporovo travel guide</a> · <a href="${escapeHtml(localizedUrl(SEO_PATHS.rent, "en"))}">Rent a villa</a></p>
</article>`;
}

function pamporovoEnNoscript(): string {
  return `<article>
<h1>Pamporovo — complete resort and region guide</h1>
<p>37+ km of ski runs, 6 lifts, night skiing on Stenata, eco trails, caves, and sights around Smolyan. Altitude 1,650 m.</p>
<p>Where to stay: ${escapeHtml(SEO_SITE.name)} offers 3 private chalets on Raykovski Livadi — from ${SEO_SITE.priceMinEur} €/night, up to ${SEO_SITE.maxGuestsPerVilla} guests, fireplace and BBQ.</p>
<p>Book: ${escapeHtml(absoluteUrl(SEO_PATHS.booking))} · <a href="${escapeHtml(localizedUrl(SEO_PATHS.rent, "en"))}">Rent a villa</a></p>
<p>Phone: ${escapeHtml(SEO_SITE.phoneDisplay)}</p>
</article>`;
}

function rentEnNoscript(): string {
  const villas = getSeoVillaFacts()
    .map((v) => `${v.nameEn} — up to ${v.maxGuests} guests, from ${v.fromPriceEur} €/night`)
    .join(". ");
  return `<article>
<h1>Rent a villa in Pamporovo — ${escapeHtml(SEO_SITE.name)}</h1>
<p>3 private chalets for rent in Pamporovo, Raykovski Livadi. Each villa: ${SEO_SITE.bedrooms} bedrooms, ${SEO_SITE.bathrooms} bathrooms, wood fireplace, BBQ, Wi‑Fi, parking. ${villas}.</p>
<p>Prices: ${SEO_SITE.priceMinEur}–${SEO_SITE.priceMaxEur} €/night for whole villa (up to ${SEO_SITE.maxGuestsPerVilla} guests). 2 km from resort centre.</p>
<p>Book online: ${escapeHtml(absoluteUrl(SEO_PATHS.booking))}</p>
<p>Phone: ${escapeHtml(SEO_SITE.phoneDisplay)} · Email: ${escapeHtml(SEO_SITE.email)}</p>
</article>`;
}

function spokeEnNoscript(spoke: PamporovoSpoke): string {
  const body = spoke.sections
    .map((section) => {
      const paras = section.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
      const bullets = section.bullets?.length
        ? `<ul>${section.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`
        : "";
      return `<h2>${escapeHtml(section.heading)}</h2>${paras}${bullets}`;
    })
    .join("");
  return `<article>
<h1>${escapeHtml(spoke.h1)}</h1>
<p>${escapeHtml(spoke.intro)}</p>
${body}
<p><a href="${escapeHtml(localizedUrl(SEO_PATHS.rent, "en"))}">Rent a villa</a> · ${escapeHtml(absoluteUrl(SEO_PATHS.booking))}</p>
<p>Phone: ${escapeHtml(SEO_SITE.phoneDisplay)}</p>
</article>`;
}

function villaEnNoscript(config: VillaPageConfig): string {
  const en = getVillaPageEn(config.id);
  const h1 = en?.h1 ?? config.h1;
  const desc = en?.seoDescription ?? config.seoDescription;
  return `<article>
<h1>${escapeHtml(h1)}</h1>
<p>${escapeHtml(desc)}</p>
<p>${escapeHtml(VILLA_LABELS[config.id])} — 2 bedrooms, 2 bathrooms, fireplace, BBQ, up to ${SEO_SITE.maxGuestsPerVilla} guests.</p>
<p>Book: ${escapeHtml(absoluteUrl(SEO_PATHS.booking))}</p>
<p>Phone: ${escapeHtml(SEO_SITE.phoneDisplay)}</p>
</article>`;
}

function buildEnNoscript(pathname: string): string | undefined {
  if (pathname === "/") return homeEnNoscript();
  if (pathname === SEO_PATHS.pamporovo) return pamporovoEnNoscript();
  if (pathname === SEO_PATHS.rent) return rentEnNoscript();
  if (pathname.startsWith("/pamporovo/")) {
    const slug = pathname.slice("/pamporovo/".length) as PamporovoSpokeSlug;
    const bg = getSpokeBySlug(slug);
    if (bg) return spokeEnNoscript(localizeSpoke(bg, "en"));
  }
  if (pathname.startsWith("/villa/")) {
    const id = pathname.slice("/villa/".length);
    if (isVillaId(id)) {
      const config = VILLA_PAGE_CONFIGS.find((v) => v.id === id);
      if (config) return villaEnNoscript(config);
    }
  }
  return undefined;
}

function legalNoscript(): string {
  return `<article>
<h1>Правна информация — ${escapeHtml(SEO_SITE.name)}</h1>
<p>Политика за поверителност, бисквитки, условия за наем и GDPR информация за ${escapeHtml(SEO_SITE.name)}.</p>
<p><a href="${escapeHtml(getSiteUrl())}">Към началната страница</a></p>
</article>`;
}

function spokeBreadcrumbJsonLd(spoke: PamporovoSpoke): Record<string, unknown> {
  const path = spokePath(spoke.slug);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Начало", item: getSiteUrl() },
      { "@type": "ListItem", position: 2, name: "Пампорово", item: absoluteUrl(SEO_PATHS.pamporovo) },
      { "@type": "ListItem", position: 3, name: spoke.h1, item: absoluteUrl(path) },
    ],
  };
}

function spokeNoscript(spoke: PamporovoSpoke): string {
  const body = spoke.sections
    .map((section) => {
      const paras = section.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
      const bullets = section.bullets?.length
        ? `<ul>${section.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`
        : "";
      return `<h2>${escapeHtml(section.heading)}</h2>${paras}${bullets}`;
    })
    .join("");
  return `<article>
<h1>${escapeHtml(spoke.h1)}</h1>
<p>${escapeHtml(spoke.intro)}</p>
${body}
<p><a href="${escapeHtml(absoluteUrl(SEO_PATHS.rent))}">Наем на вила</a> · ${escapeHtml(absoluteUrl(SEO_PATHS.booking))}</p>
<p>Телефон: ${escapeHtml(SEO_SITE.phoneDisplay)}</p>
</article>`;
}

function websiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SEO_SITE.name,
    url: getSiteUrl(),
    potentialAction: {
      "@type": "SearchAction",
      target: `${getSiteUrl()}/pamporovo?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

function videoObjectJsonLd(): Record<string, unknown> {
  const embedUrl = `https://www.youtube.com/embed/${SEO_VIDEO.youtubeId}`;
  const contentUrl = `https://www.youtube.com/watch?v=${SEO_VIDEO.youtubeId}`;
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: SEO_VIDEO.name,
    description: SEO_VIDEO.description,
    thumbnailUrl: `https://img.youtube.com/vi/${SEO_VIDEO.youtubeId}/maxresdefault.jpg`,
    uploadDate: SEO_VIDEO.uploadDate,
    contentUrl,
    embedUrl,
    publisher: { "@type": "Organization", name: SEO_SITE.name, url: getSiteUrl() },
  };
}

function speakableJsonLd(summary: string, url: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#speakable`,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "[data-seo-fallback] p"],
    },
    description: summary,
    url,
  };
}

function villasItemListJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Villas for rent at Pamporovo Villa",
    itemListElement: VILLA_PAGE_CONFIGS.map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: VILLA_LABELS[v.id],
      url: absoluteUrl(villaPath(v.id)),
    })),
  };
}

function hubSpokesItemListJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Pamporovo travel guide pages",
    numberOfItems: PAMPOROVO_SPOKES.length,
    itemListElement: PAMPOROVO_SPOKES.slice(0, 30).map((spoke, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: spoke.h1,
      url: absoluteUrl(spokePath(spoke.slug)),
    })),
  };
}

function pistesItemListJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ski runs in Pamporovo",
    itemListElement: PISTE_FACTS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${p.name} (${p.difficulty}, ${p.lengthM} m)`,
    })),
  };
}

function liftsItemListJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ski lifts in Pamporovo",
    itemListElement: LIFT_FACTS.map((lift, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${lift.route} — ${lift.type}, ${lift.capacity}/h`,
    })),
  };
}

function sportsActivityLocationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: "Pamporovo Ski Resort",
    description: "37+ km ski runs, night skiing on Stenata, lifts to Snezhanka peak.",
    url: absoluteUrl(spokePath("pisti")),
    geo: {
      "@type": "GeoCoordinates",
      latitude: 41.654,
      longitude: 24.682,
    },
  };
}

function touristAttractionJsonLd(spoke: PamporovoSpoke, imagePath: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: spoke.h1.split("—")[0]?.trim() ?? spoke.h1,
    description: spoke.seoDescription,
    url: absoluteUrl(spokePath(spoke.slug)),
    image: ogImageUrl(imagePath),
    touristType: "Sightseeing",
  };
}

function spokeExtraSchemas(spoke: PamporovoSpoke, path: string): Record<string, unknown>[] {
  const extra: Record<string, unknown>[] = [];
  if (spoke.slug === "pisti") {
    extra.push(pistesItemListJsonLd(), sportsActivityLocationJsonLd());
  }
  if (spoke.slug === "liftove") {
    extra.push(liftsItemListJsonLd());
  }
  if (spoke.touristAttraction) {
    extra.push(touristAttractionJsonLd(spoke, spokeOgImagePath(spoke.slug)));
  }
  if (spoke.slug === "kude-da-spim") {
    extra.push(speakableJsonLd(spoke.seoDescription, absoluteUrl(path)));
    extra.push(lodgingBusinessJsonLd());
  }
  return extra;
}

function lodgingBusinessWithReviews(): Record<string, unknown> {
  const base = lodgingBusinessJsonLd();
  const { aggregateRating, reviews } = getCachedReviewSchema();
  if (!aggregateRating) return base;
  return { ...base, aggregateRating, review: reviews };
}

function applyDynamicJsonLd(pathname: string, jsonLd: Record<string, unknown>[]): Record<string, unknown>[] {
  if (pathname !== "/") return jsonLd;
  return jsonLd.map((node) => {
    if (node["@type"] === "LodgingBusiness") {
      return lodgingBusinessWithReviews();
    }
    return node;
  });
}

function spokeOgImagePath(slug: PamporovoSpokeSlug): string {
  return spokeOgPath(slug);
}

function buildSpokeRouteEntries(): Record<
  string,
  Omit<RouteSeoBundle, "canonical" | "ogImage" | "ogLocale"> & { ogImagePath: string }
> {
  const entries: Record<
    string,
    Omit<RouteSeoBundle, "canonical" | "ogImage" | "ogLocale"> & { ogImagePath: string }
  > = {};

  for (const spoke of PAMPOROVO_SPOKES) {
    const path = spokePath(spoke.slug);
    const faqItems = getFaqByTags(spoke.faqTags).slice(0, 10);
    entries[path] = {
      title: spoke.seoTitle,
      description: spoke.seoDescription,
      keywords: spoke.seoKeywords,
      ogType: "article",
      ogImagePath: spokeOgImagePath(spoke.slug),
      ogImageWidth: SEO_OG.width,
      ogImageHeight: SEO_OG.height,
      ogImageAlt: spoke.h1,
      jsonLd: [
        organizationJsonLd(),
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: spoke.h1,
          description: spoke.seoDescription,
          author: { "@type": "Organization", name: SEO_SITE.name },
          publisher: { "@type": "Organization", name: SEO_SITE.name },
          mainEntityOfPage: absoluteUrl(path),
          image: ogImageUrl(spokeOgImagePath(spoke.slug)),
        },
        spokeBreadcrumbJsonLd(spoke),
        faqToSchema(faqItems),
        ...spokeExtraSchemas(spoke, path),
      ],
      noscriptHtml: spokeNoscript(spoke),
    };
  }

  return entries;
}

function villaVacationRentalJsonLd(config: VillaPageConfig): Record<string, unknown> {
  const path = villaPath(config.id);
  return {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    name: config.h1,
    description: config.seoDescription,
    url: absoluteUrl(path),
    image: ogImageUrl(SEO_OG.default),
    numberOfRooms: SEO_SITE.bedrooms,
    occupancy: {
      "@type": "QuantitativeValue",
      maxValue: SEO_SITE.maxGuestsPerVilla,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: SEO_SITE.address,
      addressLocality: SEO_SITE.locality,
      addressCountry: "BG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SEO_SITE.lat,
      longitude: SEO_SITE.lng,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: SEO_SITE.priceCurrency,
      lowPrice: String(SEO_SITE.priceMinEur),
      url: absoluteUrl(path),
    },
  };
}

function villaNoscript(config: VillaPageConfig): string {
  return `<article>
<h1>${escapeHtml(config.h1)}</h1>
<p>${escapeHtml(config.seoDescription)}</p>
<p>${escapeHtml(VILLA_LABELS[config.id])} — 2 спални, 2 бани, камина, BBQ, до ${SEO_SITE.maxGuestsPerVilla} гости.</p>
<p>Резервация: ${escapeHtml(absoluteUrl(SEO_PATHS.booking))}</p>
<p>Телефон: ${escapeHtml(SEO_SITE.phoneDisplay)}</p>
</article>`;
}

function buildVillaRouteEntries(): Record<
  string,
  Omit<RouteSeoBundle, "canonical" | "ogImage" | "ogLocale"> & { ogImagePath: string }
> {
  const entries: Record<
    string,
    Omit<RouteSeoBundle, "canonical" | "ogImage" | "ogLocale"> & { ogImagePath: string }
  > = {};

  for (const config of VILLA_PAGE_CONFIGS) {
    const path = villaPath(config.id);
    const ogPath = villaOgPath(config.id);
    entries[path] = {
      title: config.seoTitle,
      description: config.seoDescription,
      keywords: config.seoKeywords,
      ogType: "website",
      ogImagePath: ogPath,
      ogImageWidth: SEO_OG.width,
      ogImageHeight: SEO_OG.height,
      ogImageAlt: config.h1,
      jsonLd: [
        organizationJsonLd(),
        lodgingBusinessJsonLd(),
        villaVacationRentalJsonLd(config),
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Начало", item: getSiteUrl() },
            { "@type": "ListItem", position: 2, name: "Наем", item: absoluteUrl(SEO_PATHS.rent) },
            {
              "@type": "ListItem",
              position: 3,
              name: VILLA_LABELS[config.id],
              item: absoluteUrl(path),
            },
          ],
        },
      ],
      noscriptHtml: villaNoscript(config),
    };
  }

  return entries;
}

const HUB_FAQ = getFaqByTags(["general", "ski", "sleep", "rent", "practical"]).slice(0, 15);
const HOME_FAQ_SCHEMA = homeFaqToSchema(HOME_FAQ.slice(0, 15));

const ROUTES: Record<string, Omit<RouteSeoBundle, "canonical" | "ogImage" | "ogLocale"> & { ogImagePath: string }> = {
  "/": {
    title: "Pamporovo Villa | 3 вили под наем в Пампорово",
    description: SEO_SITE.description,
    keywords: "Pamporovo Villa, вила под наем, Пампорово, Райковски ливади, резервация",
    ogType: "website",
    ogImagePath: SEO_OG.default,
    ogImageWidth: SEO_OG.width,
    ogImageHeight: SEO_OG.height,
    ogImageAlt: "Pamporovo Villa — 3 вили под наем в к.к. Пампорово",
    jsonLd: [
      organizationJsonLd(),
      lodgingBusinessJsonLd(),
      websiteJsonLd(),
      villasItemListJsonLd(),
      videoObjectJsonLd(),
      HOME_FAQ_SCHEMA,
    ],
    noscriptHtml: homeNoscript(),
  },
  [SEO_PATHS.pamporovo]: {
    title: "Пампорово — пълен гид 2026 | 37+ км писти, пещери, еко маршрути",
    description:
      "Всичко за курорта Пампорово: писти, лифтове, нощно каране, Широка лъка, Ягодинска пещера. Къде да спите — 3 вили на Райковски ливади от 110 €/нощ.",
    keywords: "Пампорово, писти, ски, еко пътеки, пещери, гид, настаняване",
    ogType: "article",
    ogImagePath: SEO_OG.pamporovo,
    ogImageWidth: SEO_OG.width,
    ogImageHeight: SEO_OG.height,
    ogImageAlt: "Пълен гид за курорта Пампорово",
    jsonLd: [
      organizationJsonLd(),
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Пампорово — пълен гид за курорта и региона",
        description:
          "37+ км ски писти, лифтове, нощно каране, еко пътеки, пещери и забележителности около Пампорово.",
        author: { "@type": "Organization", name: SEO_SITE.name },
        publisher: { "@type": "Organization", name: SEO_SITE.name },
        mainEntityOfPage: absoluteUrl(SEO_PATHS.pamporovo),
        image: ogImageUrl(SEO_OG.pamporovo),
      },
      {
        "@context": "https://schema.org",
        "@type": "TouristDestination",
        name: "Pamporovo",
        description: "Най-старият ски курорт в България — 37+ км писти на 1650 m.",
        geo: {
          "@type": "GeoCoordinates",
          latitude: 41.654,
          longitude: 24.682,
        },
        containedInPlace: { "@type": "Place", name: "Rhodope Mountains, Bulgaria" },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Начало", item: getSiteUrl() },
          { "@type": "ListItem", position: 2, name: "Пампорово гид", item: absoluteUrl(SEO_PATHS.pamporovo) },
        ],
      },
      faqToSchema(HUB_FAQ),
      hubSpokesItemListJsonLd(),
      speakableJsonLd(
        "Complete guide to Pamporovo ski resort — pistes, caves, eco trails, where to stay.",
        absoluteUrl(SEO_PATHS.pamporovo)
      ),
      videoObjectJsonLd(),
    ],
    noscriptHtml: pamporovoNoscript(),
  },
  [SEO_PATHS.rent]: {
    title: "Наем на вила в Пампорово | 3 вили от 110 €/нощ — Pamporovo Villa",
    description:
      "Наемете цяла вила в Пампорово — 3 самостоятелни вили с 2 спални, камина, барbecue, до 6 гости. Райковски ливади, 2 км от центъра. Резервация онлайн.",
    keywords: "наем вила Пампорово, вила под наем, къде да спя Пампорово, Pamporovo Villa",
    ogType: "website",
    ogImagePath: SEO_OG.rent,
    ogImageWidth: SEO_OG.width,
    ogImageHeight: SEO_OG.height,
    ogImageAlt: "Наем на вила в Пампорово — Pamporovo Villa",
    jsonLd: [
      organizationJsonLd(),
      lodgingBusinessJsonLd(),
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Наем на вила в Пампорово",
        url: absoluteUrl(SEO_PATHS.rent),
        description: "Official rental page for 3 private villas in Pamporovo, Bulgaria.",
      },
      speakableJsonLd(
        "Rent a whole villa in Pamporovo from €110/night — 3 private chalets, fireplace, BBQ, up to 6 guests.",
        absoluteUrl(SEO_PATHS.rent)
      ),
    ],
    noscriptHtml: rentNoscript(),
  },
  [SEO_PATHS.legal]: {
    title: `Правна информация — ${SEO_SITE.name}`,
    description: `Политика за поверителност, бисквитки и условия за наем на ${SEO_SITE.name}.`,
    ogType: "website",
    ogImagePath: SEO_OG.default,
    ogImageWidth: SEO_OG.width,
    ogImageHeight: SEO_OG.height,
    ogImageAlt: SEO_SITE.name,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Правна информация",
        url: absoluteUrl(SEO_PATHS.legal),
      },
    ],
    noscriptHtml: legalNoscript(),
  },
  ...buildSpokeRouteEntries(),
  ...buildVillaRouteEntries(),
};

export function getRouteSeo(pathname: string, lang: SeoLang = "bg"): RouteSeoBundle {
  const route = ROUTES[pathname] ?? ROUTES["/"];
  const en = EN_SEO[pathname];
  const useEn = lang === "en" && en;
  const canonical =
    useEn ? localizedUrl(pathname, "en") : pathname === "/" ? absoluteUrl("/") : absoluteUrl(pathname);

  return {
    title: useEn ? en.title : route.title,
    description: useEn ? en.description : route.description,
    keywords: useEn ? en.keywords : route.keywords,
    canonical,
    ogType: route.ogType,
    ogImage: ogImageUrl(route.ogImagePath),
    ogImageWidth: route.ogImageWidth,
    ogImageHeight: route.ogImageHeight,
    ogImageAlt: useEn ? en.title : route.ogImageAlt,
    ogLocale: useEn ? "en_GB" : "bg_BG",
    jsonLd: applyDynamicJsonLd(pathname, route.jsonLd),
    noscriptHtml: useEn ? (buildEnNoscript(pathname) ?? route.noscriptHtml) : route.noscriptHtml,
  };
}

export function getSitemapEntries(): Array<{
  loc: string;
  changefreq: string;
  priority: string;
  images?: Array<{ loc: string; title: string }>;
}> {
  const gallery = galleryImagesForSitemap();

  const spokeEntries = PAMPOROVO_SPOKES.map((spoke) => ({
    loc: absoluteUrl(spokePath(spoke.slug)),
    changefreq: "weekly",
    priority: spoke.slug === "kude-da-spim" ? "0.9" : "0.85",
    images: [
      {
        loc: ogImageUrl(spokeOgImagePath(spoke.slug)),
        title: spoke.h1,
      },
    ],
  }));

  const villaEntries = VILLA_PAGE_CONFIGS.map((v) => ({
    loc: absoluteUrl(villaPath(v.id)),
    changefreq: "weekly",
    priority: "0.9",
    images: [
      { loc: ogImageUrl(villaOgPath(v.id)), title: v.h1 },
      ...villaGalleryImagesForSitemap(v.id).slice(0, 12),
    ],
  }));

  const enEntries = Array.from(HREFLANG_PATHS).map((p) => ({
    loc: localizedUrl(p, "en"),
    changefreq: "monthly",
    priority: p === "/rent" ? "0.94" : p === "/" ? "0.98" : "0.84",
  }));

  return [
    {
      loc: absoluteUrl("/"),
      changefreq: "weekly",
      priority: "1.0",
      images: [
        { loc: ogImageUrl(SEO_OG.default), title: SEO_SITE.name },
        ...homepageGalleryImagesForSitemap(20),
      ],
    },
    {
      loc: absoluteUrl(SEO_PATHS.rent),
      changefreq: "weekly",
      priority: "0.95",
      images: [{ loc: ogImageUrl(SEO_OG.rent), title: "Наем на вила в Пампорово" }],
    },
    {
      loc: absoluteUrl(SEO_PATHS.pamporovo),
      changefreq: "weekly",
      priority: "0.95",
      images: [
        { loc: ogImageUrl(SEO_OG.pamporovo), title: "Пампорово — пълен гид" },
        ...gallery.slice(0, 20),
      ],
    },
    ...spokeEntries,
    ...villaEntries,
    { loc: absoluteUrl(SEO_PATHS.legal), changefreq: "monthly", priority: "0.3" },
    ...enEntries,
  ];
}
