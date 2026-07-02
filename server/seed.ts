import {
  DEFAULT_TIER_LABELS,
  TIER_KEYS,
  VILLA_IDS,
  type TierKey,
  type VillaId,
} from "@shared/villas";
import * as db from "./db";
import { ENV } from "./_core/env";
import { hashPassword } from "./_core/auth";
import { seedReviewsIfEmpty } from "./seedReviews";

const SEED_OFFERS = [
  {
    slug: "ski-family",
    title: "Семейна ски ваканция",
    priceEur: 128,
    oldPriceEur: 169,
    period: "01.03.2026 – 31.03.2026",
    description:
      "Подарете на децата спомен, който ще пазят цял живот. Цяла вила само за вашето семейство, на минути от пистите.",
    includes: [
      "Наем на цялата вила за нощувка (до 6 души)",
      "Безплатен паркинг до вратата",
      "Безплатен Wi-Fi",
      "Включена курортна такса",
    ],
  },
  {
    slug: "pay-9-stay-10",
    title: "Платете 9, останете 10 нощувки",
    priceEur: 998,
    oldPriceEur: 1279,
    period: "01.06.2026 – 10.07.2026",
    description:
      "Лятото в планината е различно — останете по-дълго при нас и подарете си една нощувка от нас.",
    includes: [
      "10-та нощувка е изцяло безплатна (при 9 платени)",
      "Цяла вила: 2 спални, 2 бани, кухня и всекидневна",
      "Веранда с барбекю и камина на дърва",
    ],
  },
] as const;

const VILLA_BASE_PRICES: Record<VillaId, Record<TierKey, { winter: number; summer: number }>> = {
  "villa-1": {
    "up-to-3": { winter: 160, summer: 140 },
    "4-nights": { winter: 150, summer: 140 },
    "5-nights": { winter: 120, summer: 120 },
    "over-5": { winter: 120, summer: 110 },
  },
  "villa-2": {
    "up-to-3": { winter: 160, summer: 140 },
    "4-nights": { winter: 150, summer: 140 },
    "5-nights": { winter: 120, summer: 120 },
    "over-5": { winter: 120, summer: 110 },
  },
  "villa-deluxe": {
    "up-to-3": { winter: 180, summer: 150 },
    "4-nights": { winter: 170, summer: 150 },
    "5-nights": { winter: 140, summer: 130 },
    "over-5": { winter: 140, summer: 120 },
  },
};

export async function runSeedIfNeeded() {
  try {
    const adminCount = await db.countAdminUsers();
    if (adminCount === 0) {
      const seedPassword = ENV.masterAdminPassword || (ENV.isProduction ? "" : "Admin2626");
      if (!seedPassword) {
        console.warn("[Seed] No MASTER_ADMIN_PASSWORD — skipping master admin creation");
      } else {
        if (!ENV.masterAdminPassword) {
          console.warn("[Seed] Using dev-only default master password — set MASTER_ADMIN_PASSWORD for production");
        }
        const passwordHash = await hashPassword(seedPassword);
        await db.createAdminUser({
          username: ENV.masterAdminUsername,
          passwordHash,
          isMaster: true,
        });
        console.log(`[Seed] Created master admin: ${ENV.masterAdminUsername}`);
      }
    }

    const pricing = await db.getAllVillaPricing();
    if (pricing.length === 0) {
      const rows = VILLA_IDS.flatMap((villaId, villaIndex) =>
        TIER_KEYS.map((tierKey, tierIndex) => ({
          villaId,
          tierKey,
          tierLabel: DEFAULT_TIER_LABELS[tierKey],
          winterPerNight: VILLA_BASE_PRICES[villaId][tierKey].winter,
          summerPerNight: VILLA_BASE_PRICES[villaId][tierKey].summer,
          sortOrder: villaIndex * 10 + tierIndex,
        }))
      );
      await db.upsertVillaPricingRows(rows);
      console.log("[Seed] Villa pricing seeded");
    }

    const extras = await db.getPricingExtras();
    if (extras.length === 0) {
      await db.upsertPricingExtra("firewood", "Дърва за камина (чанта)", 8);
      await db.upsertPricingExtra("smoking_fine", "Глоба за пушене във вилата", 26);
      console.log("[Seed] Pricing extras seeded");
    }

    const existingOffers = await db.listOffers();
    if (existingOffers.length === 0) {
      for (let i = 0; i < SEED_OFFERS.length; i++) {
        const offer = SEED_OFFERS[i]!;
        await db.insertOffer({
          slug: offer.slug,
          title: offer.title,
          priceEur: offer.priceEur,
          oldPriceEur: offer.oldPriceEur,
          period: offer.period,
          description: offer.description,
          includesJson: JSON.stringify(offer.includes),
          isPublished: true,
          sortOrder: i,
        });
      }
      console.log("[Seed] Offers seeded");
    }

    const reviewsSeeded = await seedReviewsIfEmpty(db.insertReview, db.countAllReviews);
    if (reviewsSeeded) {
      console.log(`[Seed] ${12} guest reviews seeded`);
    }
  } catch (error) {
    console.warn("[Seed] Skipped (database may be unavailable):", error);
  }
}
