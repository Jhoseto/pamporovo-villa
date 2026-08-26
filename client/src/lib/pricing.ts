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

export type SpecialRatePeriod = {
  villaId: string;
  startDate: string;
  endDate: string;
  pricePerNight: number;
  label?: string | null;
};

export type SpecialRateBreakdown = {
  nights: number;
  rate: number;
  total: number;
  label?: string | null;
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
  specialNights: number;
  specialTotal: number;
  hasSpecialRates: boolean;
  specialLabels: string[];
  specialBreakdown: SpecialRateBreakdown[];
};

function startOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

export function getSpecialRateForNight(
  date: Date,
  villaId: string,
  periods: SpecialRatePeriod[]
): SpecialRatePeriod | null {
  const key = formatDateKey(date);
  return (
    periods.find(
      period => period.villaId === villaId && key >= period.startDate && key < period.endDate
    ) ?? null
  );
}

export function isDateInSpecialRatePeriod(
  date: Date,
  villaId: string,
  periods: SpecialRatePeriod[]
): boolean {
  return getSpecialRateForNight(date, villaId, periods) != null;
}

function specialBreakdownKey(rate: number, label?: string | null): string {
  return `${rate}:${label ?? ""}`;
}

export function calculateStayPriceFromGrid(
  checkIn: Date,
  checkOut: Date,
  villaId: string,
  rows: PricingGridRow[],
  specialRates: SpecialRatePeriod[] = []
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
  let specialNights = 0;
  let specialTotal = 0;
  const specialLabels = new Set<string>();
  const specialBreakdownMap = new Map<string, SpecialRateBreakdown>();

  for (let index = 0; index < nights; index += 1) {
    const nightDate = new Date(checkIn);
    nightDate.setDate(nightDate.getDate() + index);

    const special = getSpecialRateForNight(nightDate, villaId, specialRates);
    if (special) {
      total += special.pricePerNight;
      specialNights += 1;
      specialTotal += special.pricePerNight;
      if (special.label?.trim()) {
        specialLabels.add(special.label.trim());
      }
      const key = specialBreakdownKey(special.pricePerNight, special.label);
      const existing = specialBreakdownMap.get(key);
      if (existing) {
        existing.nights += 1;
        existing.total += special.pricePerNight;
      } else {
        specialBreakdownMap.set(key, {
          nights: 1,
          rate: special.pricePerNight,
          total: special.pricePerNight,
          label: special.label?.trim() || null,
        });
      }
      continue;
    }

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
    specialNights,
    specialTotal,
    hasSpecialRates: specialNights > 0,
    specialLabels: Array.from(specialLabels),
    specialBreakdown: Array.from(specialBreakdownMap.values()),
  };
}

export function formatStayPriceBreakdown(quote: StayPriceQuote): string {
  const { nights, winterNights, summerNights, winterRate, summerRate, specialBreakdown } = quote;
  const parts: string[] = [`${nights} ${nights === 1 ? "нощувка" : "нощувки"}`];

  for (const special of specialBreakdown) {
    const labelSuffix = special.label ? ` (${special.label})` : "";
    parts.push(`${formatPriceEur(special.rate)}/нощ${labelSuffix} × ${special.nights}`);
  }

  if (winterNights > 0) {
    parts.push(`${formatPriceEur(winterRate)}/нощ (зима) × ${winterNights}`);
  }

  if (summerNights > 0) {
    parts.push(`${formatPriceEur(summerRate)}/нощ (лято) × ${summerNights}`);
  }

  return parts.join(" · ");
}

export function countSpecialNightsInRange(
  checkIn: Date,
  checkOut: Date,
  villaId: string,
  periods: SpecialRatePeriod[]
): number {
  const nights = countStayNights(checkIn, checkOut);
  if (nights < 1) return 0;

  let count = 0;
  for (let index = 0; index < nights; index += 1) {
    const nightDate = new Date(checkIn);
    nightDate.setDate(nightDate.getDate() + index);
    if (isDateInSpecialRatePeriod(nightDate, villaId, periods)) {
      count += 1;
    }
  }
  return count;
}
