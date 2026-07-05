import { VILLA_IDS, VILLA_LABELS, type VillaId } from "./villas";

export interface VillaPageConfig {
  id: VillaId;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  h1: string;
  tagline: string;
}

export function villaPath(id: VillaId): string {
  return `/villa/${id}`;
}

export const VILLA_PAGE_CONFIGS: VillaPageConfig[] = [
  {
    id: "villa-1",
    seoTitle: "Вила 1 Пампорово под наем | 2 спални, камина — Pamporovo Villa",
    seoDescription:
      "Наемете Вила 1 в Пампорово — уют за семейства, 2 спални, 1 баня, камина, BBQ, до 6 гости. Райковски ливади, 2 km от пистите. Резервация онлайн.",
    seoKeywords: "Вила 1 Пампорово, наем вила Пампорово, вила семейство, Pamporovo Villa",
    h1: "Вила 1 — наем в Пампорово",
    tagline: "Уют за цялото семейство",
  },
  {
    id: "villa-2",
    seoTitle: "Вила 2 Пампорово под наем | 2 спални, BBQ веранда",
    seoDescription:
      "Наемете Вила 2 в Пампорово — светла вила с панорама, 2 спални, камина, барbecue, до 6 гости. Официален наем — Pamporovo Villa.",
    seoKeywords: "Вила 2 Пампорово, наем вила, вила с BBQ Пампорово",
    h1: "Вила 2 — наем в Пампорово",
    tagline: "Слънце от изгрев до залез",
  },
  {
    id: "villa-deluxe",
    seoTitle: "Вила Deluxe Пампорово | Луксозен наем, камина, 6 гости",
    seoDescription:
      "Вила Deluxe в Пампорово — най-представителната от трите вили, 2 спални, камина, BBQ, до 6 гости. Резервирайте онлайн.",
    seoKeywords: "Вила Deluxe Пампорово, лукс вила Пампорово, deluxe наем",
    h1: "Вила Deluxe — наем в Пампорово",
    tagline: "Малко повече лукс",
  },
];

export function getVillaPageConfig(id: string): VillaPageConfig | undefined {
  return VILLA_PAGE_CONFIGS.find((v) => v.id === id);
}

export function isVillaId(id: string): id is VillaId {
  return (VILLA_IDS as readonly string[]).includes(id);
}

export function getAllVillaPaths(): string[] {
  return VILLA_IDS.map(villaPath);
}

export function villaDisplayName(id: VillaId): string {
  return VILLA_LABELS[id];
}
