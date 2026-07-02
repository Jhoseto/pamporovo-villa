/**
 * One-off script: insert 12 curated guest reviews if the table is empty.
 * Usage: pnpm seed:reviews
 */
import "dotenv/config";
import * as db from "../server/db";
import { SEED_REVIEWS } from "../server/seedReviews";

async function main() {
  const count = await db.countAllReviews();
  if (count > 0) {
    console.log(
      `customer_reviews already has ${count} row(s) — skipping. Clear the table first for a fresh seed.`
    );
    return;
  }

  for (const review of SEED_REVIEWS) {
    await db.insertReview({
      guestName: review.guestName,
      guestEmail: review.guestEmail,
      rating: review.rating,
      body: review.body,
      villaId: review.villaId,
      stayPeriod: review.stayPeriod,
      isPublished: true,
      source: "admin",
    });
  }

  console.log(`Inserted ${SEED_REVIEWS.length} guest reviews.`);
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
