export const VILLA_IDS = ["villa-1", "villa-2", "villa-deluxe"] as const;
export type VillaId = (typeof VILLA_IDS)[number];

export const TIER_KEYS = ["up-to-3", "4-nights", "5-nights", "over-5"] as const;
export type TierKey = (typeof TIER_KEYS)[number];

export const VILLA_LABELS: Record<VillaId, string> = {
  "villa-1": "Вила 1",
  "villa-2": "Вила 2",
  "villa-deluxe": "Вила Deluxe",
};

export const DEFAULT_TIER_LABELS: Record<TierKey, string> = {
  "up-to-3": "До 3 нощувки",
  "4-nights": "4 нощувки",
  "5-nights": "5 нощувки",
  "over-5": "Над 5 нощувки",
};
