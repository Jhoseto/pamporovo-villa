import { useMemo } from "react";
import {
  CAVES,
  ECO_TRAILS,
  LANDMARKS,
  PISTES,
  PISTE_DIFFICULTY_LABELS,
  RESORT_STATS,
  SKI_EXTRAS,
  SKI_LIFTS,
  SUMMER_ACTIVITIES,
  WINTER_ACTIVITIES,
  type Attraction,
  type Piste,
  type PisteDifficulty,
  type ResortStat,
  type SkiLift,
} from "@/data/pamporovoContent";
import { LIFT_FACTS, type LiftFact } from "@shared/pamporovoSkiData";
import { useTranslation } from "@/contexts/LocaleContext";

const SECTION_IDS = ["intro", "winter", "summer", "landmarks", "caves"] as const;
const NAV_KEYS = ["intro", "winter", "summer", "landmarks", "caves"] as const;

export function useGuideNavSections() {
  const { t } = useTranslation();
  return useMemo(
    () =>
      SECTION_IDS.map((key, i) => ({
        id: `pamporovo-${key === "intro" ? "intro" : key}`,
        label: t(`guide.nav.${NAV_KEYS[i]}`, ""),
      })),
    [t]
  );
}

export function useGuideSection(key: (typeof SECTION_IDS)[number]) {
  const { t } = useTranslation();
  return useMemo(
    () => ({
      eyebrow: t(`guide.sections.${key}.eyebrow`, ""),
      title: t(`guide.sections.${key}.title`, ""),
      subtitle: t(`guide.sections.${key}.subtitle`, ""),
      panoramaAlt: key === "intro" ? t("guide.sections.intro.panoramaAlt", "") : undefined,
      towerAlt: key === "intro" ? t("guide.sections.intro.towerAlt", "") : undefined,
      skiAlt: key === "winter" ? t("guide.sections.winter.skiAlt", "") : undefined,
      summerAlt: key === "summer" ? t("guide.sections.summer.summerAlt", "") : undefined,
      p1: key === "intro" ? t("guide.sections.intro.p1", "") : undefined,
      p2: key === "intro" ? t("guide.sections.intro.p2", "") : undefined,
      cta: key === "intro" ? t("guide.sections.intro.cta", "") : key === "caves" ? t("guide.sections.caves.cta", "") : undefined,
      footer: key === "caves" ? t("guide.sections.caves.footer", "") : undefined,
      pistesHeading: key === "winter" ? t("guide.sections.winter.pistesHeading", "") : undefined,
      liftsHeading: key === "winter" ? t("guide.sections.winter.liftsHeading", "") : undefined,
      activitiesHeading:
        key === "winter"
          ? t("guide.sections.winter.activitiesHeading", "")
          : key === "summer"
            ? t("guide.sections.summer.activitiesHeading", "")
            : undefined,
    }),
    [key, t]
  );
}

export function useGuideUi() {
  const { t } = useTranslation();
  return useMemo(
    () => ({
      pisteNumber: t("guide.ui.pisteNumber", "№"),
      pisteName: t("guide.ui.pisteName", "Писта"),
      difficulty: t("guide.ui.difficulty", "Трудност"),
      length: t("guide.ui.length", "Дължина"),
      note: t("guide.ui.note", "Бележка"),
      dash: t("guide.ui.dash", "—"),
      meters: t("guide.ui.meters", "м"),
      route: t("guide.ui.route", "Маршрут"),
      liftType: t("guide.ui.liftType", "Тип"),
      capacity: t("guide.ui.capacity", "Капацитет/ч"),
      capacityPerHour: t("guide.ui.capacityPerHour", "Капацитет/час"),
      navAria: t("guide.nav.ariaLabel", "Секции на страницата"),
      stickyBook: t("guide.sticky.book", "Резервирай"),
      stickyRent: t("guide.sticky.rent", "Наем · цени"),
    }),
    [t]
  );
}

export function useGuideStats(): ResortStat[] {
  const { t } = useTranslation();
  return useMemo(
    () =>
      RESORT_STATS.map((s, i) => ({
        value: s.value,
        label: t(`guide.stats.${i}.label`, s.label),
      })),
    [t]
  );
}

export function useGuideDifficultyLabels(): Record<PisteDifficulty, string> {
  const { t } = useTranslation();
  return useMemo(
    () => ({
      green: t("guide.difficulty.green", PISTE_DIFFICULTY_LABELS.green),
      blue: t("guide.difficulty.blue", PISTE_DIFFICULTY_LABELS.blue),
      red: t("guide.difficulty.red", PISTE_DIFFICULTY_LABELS.red),
      black: t("guide.difficulty.black", PISTE_DIFFICULTY_LABELS.black),
    }),
    [t]
  );
}

export function useGuidePistes(): Piste[] {
  const { t } = useTranslation();
  return useMemo(
    () =>
      PISTES.map((p, i) => ({
        ...p,
        name: t(`guide.pistes.${i}.name`, p.name),
        note: p.note ? t(`guide.pistes.${i}.note`, p.note) : undefined,
      })),
    [t]
  );
}

export function useGuideSkiLifts(): SkiLift[] {
  const { t } = useTranslation();
  return useMemo(
    () =>
      SKI_LIFTS.map((l, i) => ({
        ...l,
        route: t(`guide.skiLifts.${i}.route`, l.route),
        type: t(`guide.skiLifts.${i}.type`, l.type),
        note: l.note ? t(`guide.skiLifts.${i}.note`, l.note) : undefined,
      })),
    [t]
  );
}

export function useGuideLiftFacts(): LiftFact[] {
  const { t } = useTranslation();
  return useMemo(
    () =>
      LIFT_FACTS.map((l, i) => ({
        ...l,
        route: t(`guide.liftFacts.${i}.route`, l.route),
        type: t(`guide.liftFacts.${i}.type`, l.type),
      })),
    [t]
  );
}

export function useGuideSkiExtras(): string[] {
  const { t } = useTranslation();
  return useMemo(
    () => SKI_EXTRAS.map((e, i) => t(`guide.skiExtras.${i}`, e)),
    [t]
  );
}

export function useGuideWinterActivities() {
  const { t } = useTranslation();
  return useMemo(
    () =>
      WINTER_ACTIVITIES.map((a, i) => ({
        title: t(`guide.winterActivities.${i}.title`, a.title),
        description: t(`guide.winterActivities.${i}.description`, a.description),
      })),
    [t]
  );
}

export function useGuideSummerActivities() {
  const { t } = useTranslation();
  return useMemo(
    () =>
      SUMMER_ACTIVITIES.map((a, i) => ({
        title: t(`guide.summerActivities.${i}.title`, a.title),
        description: t(`guide.summerActivities.${i}.description`, a.description),
      })),
    [t]
  );
}

function localizeAttraction(item: Attraction, t: (key: string, fallback?: string) => string): Attraction {
  const base = `guide.attractions.${item.id}`;
  return {
    ...item,
    title: t(`${base}.title`, item.title),
    distance: t(`${base}.distance`, item.distance),
    duration: item.duration ? t(`${base}.duration`, item.duration) : undefined,
    description: t(`${base}.description`, item.description),
    highlights: item.highlights.map((h, i) => t(`${base}.highlights.${i}`, h)),
  };
}

export function useGuideEcoTrails(): Attraction[] {
  const { t } = useTranslation();
  return useMemo(() => ECO_TRAILS.map((a) => localizeAttraction(a, t)), [t]);
}

export function useGuideLandmarks(): Attraction[] {
  const { t } = useTranslation();
  return useMemo(() => LANDMARKS.map((a) => localizeAttraction(a, t)), [t]);
}

export function useGuideCaves(): Attraction[] {
  const { t } = useTranslation();
  return useMemo(() => CAVES.map((a) => localizeAttraction(a, t)), [t]);
}

export function useGuideAttractionById(id: string): Attraction | undefined {
  const { t } = useTranslation();
  return useMemo(() => {
    const raw = [...ECO_TRAILS, ...LANDMARKS, ...CAVES].find((a) => a.id === id);
    return raw ? localizeAttraction(raw, t) : undefined;
  }, [id, t]);
}

export function useLocalizedWindSpeed() {
  const { t } = useTranslation();
  return (speedKmh: number) => {
    if (speedKmh < 1) return t("weather.wind.calm", "тих");
    if (speedKmh < 6) return t("weather.wind.light", "лек полъх");
    if (speedKmh < 12) return t("weather.wind.gentle", "слаб");
    if (speedKmh < 20) return t("weather.wind.moderate", "умерен");
    return t("weather.wind.strong", "силен");
  };
}

export function useLocalizedWeatherCondition() {
  const { t } = useTranslation();
  return (weatherCode: number) => {
    const key = String(weatherCode);
    const label = t(`weather.codes.${key}.label`, "");
    const short = t(`weather.codes.${key}.short`, "");
    if (label) return { label, short: short || label };
    return {
      label: t("weather.variable", "Променливо"),
      short: t("weather.variable", "Променливо"),
    };
  };
}
