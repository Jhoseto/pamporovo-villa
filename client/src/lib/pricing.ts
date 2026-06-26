import { TIER_KEYS, type TierKey } from "@shared/villas";
import { formatPriceEur } from "@/data/siteContent";

export type Season = "winter" | "summer";

export type PricingGridRow = {
  villaId: string;
  tierKey: string;
  tierLabel: string;
  winterPerNight: number;
  summerPerNight: number;
  sortOrder: number;
};

export type StayPriceQuote = {
  nights: number;
  total: number;
  tier: { key: string; label: string };
  villaId: string;
  winterNights: number;
  summerNights: number;
  winterRate: number;
  summerRate: number;
};

function startOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export function countStayNights(checkIn: Date, checkOut: Date): number {
  const ms = startOfDay(checkOut).getTime() - startOfDay(checkIn).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function getSeasonForDate(date: Date): Season {
  const month = date.getMonth() + 1;
  return month >= 4 && month <= 8 ? "summer" : "winter";
}

export function getTierKeyForNights(stayNights: number): TierKey {
  if (stayNights <= 3) return TIER_KEYS[0]!;
  if (stayNights === 4) return TIER_KEYS[1]!;
  if (stayNights === 5) return TIER_KEYS[2]!;
  return TIER_KEYS[3]!;
}

export function getVillaPricingRows(rows: PricingGridRow[], villaId: string): PricingGridRow[] {
  return rows.filter(r => r.villaId === villaId).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getTierRowForStay(
  rows: PricingGridRow[],
  villaId: string,
  stayNights: number
): PricingGridRow | null {
  const tierKey = getTierKeyForNights(stayNights);
  const villaRows = getVillaPricingRows(rows, villaId);
  return villaRows.find(r => r.tierKey === tierKey) ?? villaRows[0] ?? null;
}

export function getPerNightRateFromGrid(row: PricingGridRow, season: Season): number {
  return season === "winter" ? row.winterPerNight : row.summerPerNight;
}

export function calculateStayPriceFromGrid(
  checkIn: Date,
  checkOut: Date,
  villaId: string,
  rows: PricingGridRow[]
): StayPriceQuote | null {
  const nights = countStayNights(checkIn, checkOut);
  if (nights < 1) return null;

  const tierRow = getTierRowForStay(rows, villaId, nights);
  if (!tierRow) return null;

  const winterRate = tierRow.winterPerNight;
  const summerRate = tierRow.summerPerNight;
  let total = 0;
  let winterNights = 0;
  let summerNights = 0;

  for (let index = 0; index < nights; index += 1) {
    const nightDate = new Date(checkIn);
    nightDate.setDate(nightDate.getDate() + index);

    if (getSeasonForDate(nightDate) === "winter") {
      total += winterRate;
      winterNights += 1;
    } else {
      total += summerRate;
      summerNights += 1;
    }
  }

  return {
    nights,
    total,
    tier: { key: tierRow.tierKey, label: tierRow.tierLabel },
    villaId,
    winterNights,
    summerNights,
    winterRate,
    summerRate,
  };
}

export function formatStayPriceBreakdown(quote: StayPriceQuote): string {
  const { nights, winterNights, summerNights, winterRate, summerRate } = quote;
  const parts: string[] = [`${nights} ${nights === 1 ? "нощувка" : "нощувки"}`];

  if (winterNights > 0) {
    parts.push(`${formatPriceEur(winterRate)}/нощ (зима) × ${winterNights}`);
  }

  if (summerNights > 0) {
    parts.push(`${formatPriceEur(summerRate)}/нощ (лято) × ${summerNights}`);
  }

  return parts.join(" · ");
}
