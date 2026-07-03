import { useMemo } from "react";
import { EXPERIENCE_PANELS, type ExperiencePanel } from "@/data/experiencePanels";
import {
  AMENITIES,
  CONTACT,
  DISTANCES,
  HOUSE_RULES,
  OFFERS,
  PRICING_NOTES,
  VIP_PROGRAM,
  VILLA_FEATURES,
  VILLAS,
  type Amenity,
  type Offer,
} from "@/data/siteContent";
import { useTranslation } from "@/contexts/LocaleContext";
import { PAMPOROVO_FAQ, type PamporovoFaqTag } from "@shared/pamporovoFaq";
import {
  getSpokeBySlug,
  PAMPOROVO_SPOKES,
  type PamporovoSpoke,
  type PamporovoSpokeSlug,
} from "@shared/pamporovoSpokes";
import { getVillaPageConfig, type VillaPageConfig } from "@shared/villaPages";
import type { VillaId } from "@shared/villas";
import { formatPriceEur } from "@/data/siteContent";
import type { StayPriceQuote } from "@/lib/pricing";

export function interpolate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, v),
    template
  );
}

export function useExperiencePanels(): ExperiencePanel[] {
  const { t } = useTranslation();
  const villaNames = useMemo(
    () => VILLAS.map((v) => t(`villa.pages.${v.id}.name`, v.name)).join(" · "),
    [t]
  );
  return useMemo(
    () =>
      EXPERIENCE_PANELS.map((p) => ({
        ...p,
        room: t(`experience.panels.${p.id}.room`, p.room),
        title: t(`experience.panels.${p.id}.title`, p.title),
        subtitle:
          p.id === "exterior-summer"
            ? villaNames
            : t(`experience.panels.${p.id}.subtitle`, p.subtitle),
        description: t(`experience.panels.${p.id}.description`, p.description),
        imageAlt: t(`experience.panels.${p.id}.imageAlt`, p.imageAlt),
        highlights: p.highlights.map((h, i) =>
          t(`experience.panels.${p.id}.highlights.${i}`, h)
        ),
      })),
    [t, villaNames]
  );
}

export function useAmenities(): Amenity[] {
  const { t } = useTranslation();
  return useMemo(
    () =>
      AMENITIES.map((a, i) => ({
        ...a,
        title: t(`amenities.items.${i}.title`, a.title),
        description: t(`amenities.items.${i}.description`, a.description),
      })),
    [t]
  );
}

export function useHouseRules() {
  const { t } = useTranslation();
  return useMemo(() => {
    const highlights: string[] = [];
    const prohibited: string[] = [];
    for (let i = 0; i < 10; i++) {
      const h = t(`policy.highlights.${i}`, "");
      if (h) highlights.push(h);
      const p = t(`policy.prohibited.${i}`, "");
      if (p) prohibited.push(p);
    }
    return {
      checkIn: t("policy.checkIn", "След 15:00"),
      checkOut: t("policy.checkOut", "До 11:00"),
      checkInLabel: t("policy.checkInLabel", "Настаняване"),
      checkOutLabel: t("policy.checkOutLabel", "Напускане"),
      stayHeading: t("policy.stayHeading", "Настаняване и престой"),
      stayIntro: t(
        "policy.stayIntro",
        "Искаме престоят ви да е лек и безгрижен — затова държим нещата прости и прозрачни."
      ),
      avoidHeading: t("policy.avoidHeading", "Молим ви да избягвате"),
      footer: t(
        "policy.footer",
        "Благодарим ви, че избрахте Pamporovo Villa. Грижата за дома е взаимна — пазейки го, го пазим хубав за всеки следващ гост. Имате въпрос? Винаги сме насреща."
      ),
      highlights: highlights.length ? highlights : [...HOUSE_RULES.highlights],
      prohibited: prohibited.length ? prohibited : [...HOUSE_RULES.prohibited],
    };
  }, [t]);
}

export function useVipProgram() {
  const { t } = useTranslation();
  return useMemo(() => {
    const benefits: string[] = [];
    for (let i = 0; i < 8; i++) {
      const b = t(`vip.benefits.${i}`, "");
      if (b) benefits.push(b);
    }
    return {
      eyebrow: t("vip.eyebrow", "VIP програма"),
      badge: t("vip.badge", "Ексклузивни привилегии"),
      title: t("vip.title", "Станете наш VIP гост"),
      intro: t(
        "vip.intro",
        "Тези, които се връщат при нас, заслужават повече. Бъдете наши гости три пъти в рамките на една година и получавате персонална VIP карта с трайни привилегии."
      ),
      benefits: benefits.length ? benefits : [...VIP_PROGRAM.benefits],
    };
  }, [t]);
}

export function useLocalizedOffer(offer: {
  id: string;
  title: string;
  period: string;
  description: string;
  includes: string[];
}) {
  const { t } = useTranslation();
  const seed = OFFERS.find((o) => o.id === offer.id);
  const includes = offer.includes.map((item, i) =>
    t(`offers.items.${offer.id}.includes.${i}`, seed?.includes[i] ?? item)
  );
  return {
    title: t(`offers.items.${offer.id}.title`, seed?.title ?? offer.title),
    period: t(`offers.items.${offer.id}.period`, seed?.period ?? offer.period),
    description: t(`offers.items.${offer.id}.description`, seed?.description ?? offer.description),
    includes,
  };
}

export function usePricingNotes(): string[] {
  const { t } = useTranslation();
  return useMemo(() => {
    const notes: string[] = [];
    for (let i = 0; i < 8; i++) {
      const n = t(`pricing.notes.${i}`, "");
      if (n) notes.push(n);
    }
    return notes.length ? notes : [...PRICING_NOTES];
  }, [t]);
}

export function usePricingTierLabel(tierKey: string, fallback: string): string {
  const { t } = useTranslation();
  return t(`pricing.tiers.${tierKey}`, fallback);
}

export function useContactAddress(): string {
  const { t } = useTranslation();
  return t("common.address", CONTACT.address);
}

export function useVillaName(villaId: string, bgName: string): string {
  const { t } = useTranslation();
  return t(`villa.pages.${villaId}.name`, bgName);
}

export function useVillasLocalized() {
  const { t } = useTranslation();
  return useMemo(
    () =>
      VILLAS.map((v) => ({
        ...v,
        name: t(`villa.pages.${v.id}.name`, v.name),
        tagline: t(`villa.pages.${v.id}.tagline`, v.tagline),
        description: t(`villa.pages.${v.id}.description`, v.description),
      })),
    [t]
  );
}

export function useVillaPageConfigLocalized(id: string): VillaPageConfig | undefined {
  const { t } = useTranslation();
  const bg = getVillaPageConfig(id);
  if (!bg || !isVillaIdSafe(id)) return bg;
  return {
    ...bg,
    seoTitle: t(`villa.pages.${id}.seoTitle`, bg.seoTitle),
    seoDescription: t(`villa.pages.${id}.seoDescription`, bg.seoDescription),
    seoKeywords: t(`villa.pages.${id}.seoKeywords`, bg.seoKeywords),
    h1: t(`villa.pages.${id}.h1`, bg.h1),
    tagline: t(`villa.pages.${id}.tagline`, bg.tagline),
  };
}

function isVillaIdSafe(id: string): id is VillaId {
  return id === "villa-1" || id === "villa-2" || id === "villa-deluxe";
}

export function useVillaFeatures(): string[] {
  const { t } = useTranslation();
  return useMemo(() => {
    const features: string[] = [];
    for (let i = 0; i < 12; i++) {
      const f = t(`villa.features.${i}`, "");
      if (f) features.push(f);
    }
    return features.length ? features : [...VILLA_FEATURES];
  }, [t]);
}

export function useVillaPricingNotes(): string[] {
  const { t } = useTranslation();
  return useMemo(() => {
    const notes: string[] = [];
    for (let i = 0; i < 8; i++) {
      const n = t(`villa.pricingNotes.${i}`, "");
      if (n) notes.push(n);
    }
    return notes;
  }, [t]);
}

export function useHomeDistances() {
  const { t } = useTranslation();
  return useMemo(
    () =>
      DISTANCES.map((d, i) => ({
        value: t(`home.distances.${i}.value`, d.value),
        label: t(`home.distances.${i}.label`, d.label),
      })),
    [t]
  );
}

export function useDistances() {
  return useHomeDistances();
}

export type LocalizedSpoke = PamporovoSpoke & { slug: PamporovoSpokeSlug };

export function useSpokeContent(slug: PamporovoSpokeSlug): LocalizedSpoke | undefined {
  const { t } = useTranslation();
  const bg = getSpokeBySlug(slug);

  return useMemo(() => {
    if (!bg) return undefined;

    const sections = bg.sections.map((sec, i) => ({
      ...sec,
      heading: t(`spokes.${slug}.sections.${i}.heading`, sec.heading),
      paragraphs: sec.paragraphs.map((p, j) =>
        t(`spokes.${slug}.sections.${i}.paragraphs.${j}`, p)
      ),
      bullets: (sec.bullets ?? []).map((b, j) =>
        t(`spokes.${slug}.sections.${i}.bullets.${j}`, b)
      ),
    }));

    return {
      ...bg,
      eyebrow: t(`spokes.${slug}.eyebrow`, bg.eyebrow),
      h1: t(`spokes.${slug}.h1`, bg.h1),
      intro: t(`spokes.${slug}.intro`, bg.intro),
      seoTitle: t(`spokes.${slug}.seoTitle`, bg.seoTitle),
      seoDescription: t(`spokes.${slug}.seoDescription`, bg.seoDescription),
      seoKeywords: t(`spokes.${slug}.seoKeywords`, bg.seoKeywords),
      sections,
    };
  }, [bg, slug, t]);
}

export function useFormatStayBreakdown() {
  const { t } = useTranslation();
  return (quote: StayPriceQuote) => {
    const { nights, winterNights, summerNights, winterRate, summerRate } = quote;
    const nightWord =
      nights === 1
        ? t("pricing.breakdown.night", "нощувка")
        : t("pricing.breakdown.nights", "нощувки");
    const parts: string[] = [`${nights} ${nightWord}`];

    if (winterNights > 0) {
      parts.push(
        `${formatPriceEur(winterRate)}${t("pricing.breakdown.perNightWinter", "/нощ (зима)")} × ${winterNights}`
      );
    }
    if (summerNights > 0) {
      parts.push(
        `${formatPriceEur(summerRate)}${t("pricing.breakdown.perNightSummer", "/нощ (лято)")} × ${summerNights}`
      );
    }
    return parts.join(" · ");
  };
}

export function usePamporovoFaqItems(tags?: PamporovoFaqTag[]) {
  const { t } = useTranslation();
  const items = PAMPOROVO_FAQ.filter(
    item => !tags?.length || item.tags.some(tag => tags.includes(tag))
  );
  return items.map(item => ({
    id: item.id,
    question: t(`faq.pamporovo.${item.id}.question`, item.question),
    answer: t(`faq.pamporovo.${item.id}.answer`, item.answer),
    tags: item.tags,
  }));
}

export function useAllSpokesLocalized() {
  const { t } = useTranslation();
  return useMemo(
    () =>
      PAMPOROVO_SPOKES.map(s => ({
        slug: s.slug,
        h1: t(`spokes.${s.slug}.h1`, s.h1),
      })),
    [t]
  );
}

export function useOfferCatalog(): Offer[] {
  const { t } = useTranslation();
  return useMemo(
    () =>
      OFFERS.map((o) => ({
        ...o,
        title: t(`offers.items.${o.id}.title`, o.title),
        period: t(`offers.items.${o.id}.period`, o.period),
        description: t(`offers.items.${o.id}.description`, o.description),
        includes: o.includes.map((item, i) =>
          t(`offers.items.${o.id}.includes.${i}`, item)
        ),
      })),
    [t]
  );
}
