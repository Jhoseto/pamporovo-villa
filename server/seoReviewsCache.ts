import type { CustomerReview } from "../drizzle/schema";
import { getPublishedReviews } from "./db";

export type ReviewSchemaBundle = {
  aggregateRating: Record<string, unknown> | null;
  reviews: Record<string, unknown>[];
};

const EMPTY: ReviewSchemaBundle = { aggregateRating: null, reviews: [] };

let cached: ReviewSchemaBundle = EMPTY;
let cachedAt = 0;
const TTL_MS = 5 * 60 * 1000;

function buildReviewSchema(reviews: CustomerReview[]): ReviewSchemaBundle {
  if (reviews.length === 0) return EMPTY;

  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = Math.round((sum / reviews.length) * 10) / 10;

  const aggregateRating: Record<string, unknown> = {
    "@type": "AggregateRating",
    ratingValue: String(avg),
    reviewCount: String(reviews.length),
    bestRating: "5",
    worstRating: "1",
  };

  const reviewNodes = reviews.slice(0, 10).map((r) => ({
    "@type": "Review",
    author: { "@type": "Person", name: r.guestName },
    reviewRating: {
      "@type": "Rating",
      ratingValue: String(r.rating),
      bestRating: "5",
      worstRating: "1",
    },
    reviewBody: r.body,
    datePublished: r.createdAt instanceof Date ? r.createdAt.toISOString().slice(0, 10) : undefined,
  }));

  return { aggregateRating, reviews: reviewNodes };
}

export async function refreshReviewSchemaCache(): Promise<void> {
  try {
    const rows = await getPublishedReviews();
    cached = buildReviewSchema(rows);
    cachedAt = Date.now();
  } catch {
    cached = EMPTY;
    cachedAt = Date.now();
  }
}

export function getCachedReviewSchema(): ReviewSchemaBundle {
  if (Date.now() - cachedAt > TTL_MS) {
    void refreshReviewSchemaCache();
  }
  return cached;
}

export function initReviewSchemaCache(): void {
  void refreshReviewSchemaCache();
  setInterval(() => void refreshReviewSchemaCache(), TTL_MS);
}
