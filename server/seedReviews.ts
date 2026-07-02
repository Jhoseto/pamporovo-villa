import type { InsertCustomerReview } from "../drizzle/schema";
import type { VillaId } from "@shared/villas";
import { REVIEW_BODY_MAX } from "@shared/reviewLimits";

type SeedReview = Omit<InsertCustomerReview, "isPublished" | "source"> & {
  villaId: VillaId | null;
};

/** Curated guest reviews — seeded once when the table is empty. */
export const SEED_REVIEWS: SeedReview[] = [
  {
    guestName: "Мария и Георги Петрови",
    guestEmail: null,
    rating: 5,
    body: "Взехме Вила 1 за седмица с двете деца през януари и още в първата вечер разбрахме, че сме попаднали на правилното място. Камината не е за картичка а реално топли. Сутрин е толкова тихо, че чуваш снега как пада от боровете. Домакините отговориха веднага, когато попитахме за допълнителна чанта дърва — донесоха я без да трябва да повтаряме.",
    villaId: "villa-1",
    stayPeriod: "януари 2025",
  },
  {
    guestName: "James & Sarah Mitchell",
    guestEmail: null,
    rating: 5,
    body: "We stayed in Villa 2 for ten days in July — two couples from Manchester, first time in the Rhodopes. The kitchen actually had everything we needed for proper dinners, not just the basics. Most evenings we ended up on the covered veranda with the barbecue going until midnight; the forest smell when it gets cooler is something you don't forget. Parking right outside the door made unpacking easy. Already looking at dates for next summer.",
    villaId: "villa-2",
    stayPeriod: "юли 2024",
  },
  {
    guestName: "Елена Димитрова",
    guestEmail: null,
    rating: 5,
    body: "Deluxe вилата я избрах за 40-ия си рожден ден — малка изненада, която организирахме с помощта на домакините. Без да става театрално, просто ни подсказаха къде да поръчаме торта от Смолян и дори провериха дали стигаме с часовете за настаняване. Самата вила е по-спокойна и „подредена“ от снимките, а гледката от терасата на залез — онзи момент, в който всички замлъкнаха с чашите в ръка.",
    villaId: "villa-deluxe",
    stayPeriod: "март 2025",
  },
  {
    guestName: "Thomas Weber",
    guestEmail: null,
    rating: 5,
    body: "Ski trip with three friends, Villa 1, four nights in February. Left the car in the parking spot and took the resort bus — centre and lifts are close enough that it worked every day. Coming back to a warm living room after icy slopes was the best part. Wi‑Fi was stable enough for one of us to join a work call without drama. Small thing, but the boot room area near the entrance saved our hallway from melting snow.",
    villaId: "villa-1",
    stayPeriod: "февруари 2025",
  },
  {
    guestName: "Кристина Nikolova",
    guestEmail: null,
    rating: 5,
    body: "Работя дистанционно и търсех тишина, не хотел със сутрешни събирания в коридора. Вила 2 през септември беше точно това — сутрешно кафе на терасата с мъгла в долината, следобед пътека до водопадите без да сме карали колата до центъра. Интернетът издържа видео разговори цяла седмица. Единственото „лошо“ — свикнах толкова с тишината, че София ми се стори шумна още на втория ден след връщане.",
    villaId: "villa-2",
    stayPeriod: "септември 2024",
  },
  {
    guestName: "David & Emma Clarke",
    guestEmail: null,
    rating: 5,
    body: "Christmas week in Villa Deluxe — our first winter in Bulgaria. Hosts sent clear directions before we left Sofia, which mattered because we arrived after dark in snow. The fireplace was lit-ready, beds made, kitchen stocked with the essentials. They pointed us to a family tavern in Smolyan where we had the best patatnik of the trip. Felt looked after without anyone hovering.",
    villaId: "villa-deluxe",
    stayPeriod: "декември 2024",
  },
  {
    guestName: "Иван и Стефка Тодорови",
    guestEmail: null,
    rating: 5,
    body: "Останахме с трите внуци на Великден — Вила 1, шест нощувки. Двете спални са удобно разделени: ние отдолу, децата горе — всеки си спи спокойно. Верандата стана мястото за яйцата и барбекюто, а валяка в събота само ни вкара по-рано вътре край камината. Домакините ни помогнаха с високото детско столче, макар да не бяхме питали предварително.",
    villaId: "villa-1",
    stayPeriod: "април 2025",
  },
  {
    guestName: "Sophie Martin",
    guestEmail: null,
    rating: 5,
    body: "Villa 2 in August — hiking holiday with my sister. Hosts recommended the trail toward Orpheus rocks and where to leave the car so we wouldn't walk on the main road. After long days we cooked simple pasta in the kitchen (good pots, sharp knives — sounds silly, but it matters). Evening barbecue on the veranda, crickets, pine trees. Quiet area, but Pamporovo centre still reachable for groceries.",
    villaId: "villa-2",
    stayPeriod: "август 2024",
  },
  {
    guestName: "Николай и Перизат Хасан",
    guestEmail: null,
    rating: 5,
    body: "Новата година в Deluxe — искахме празник без шумните купони в центъра на курорта. В 23:50 бяхме на терасата с искри и чаши, чухме съседите чак на километър. На 1-ви януари закусвахме със слънце във всекидневната, а следобед минахме пеш до пистите. Обслужването беше лично: един разговор, един телефон, всичко решено.",
    villaId: "villa-deluxe",
    stayPeriod: "януари 2025",
  },
  {
    guestName: "Michael O'Brien",
    guestEmail: null,
    rating: 5,
    body: "Four nights in Villa 1, mid-June — mountain biking with two mates from Dublin. Garage space for bikes, hose outside to wash mud off before bringing them in. Mornings were cool enough for long rides, afternoons lazy on the terrace. Host replied within minutes when we locked ourselves out — sent someone with a spare key in twenty minutes. That kind of response sticks with you.",
    villaId: "villa-1",
    stayPeriod: "юни 2024",
  },
  {
    guestName: "Десислава и Martin Georgiev",
    guestEmail: null,
    rating: 5,
    body: "Есенен уикенд, Вила 2 — златни борове и мъгла, която идва и си отива като завеса. Взехме допълнителна чанта дърва от менюто с екстрите — 8 евро и си заслужаваше, горяхме камината до късно. Кухнята е достатъчно голяма за нас двамата и още двама приятели, които дойдоха за една вечер. Чисто, топло, без излишен лукс, но с характер.",
    villaId: "villa-2",
    stayPeriod: "октомври 2024",
  },
  {
    guestName: "Anna Kowalski",
    guestEmail: null,
    rating: 5,
    body: "Girls' trip from Sofia — three of us, Villa Deluxe, long weekend in March. Two-hour drive, easy check-in, whole villa to ourselves. We used both bedrooms, fought over the bigger bathroom (joking), and spent hours in the living room with wine and the fire. Host suggested a day trip to the Smolyan lakes — snow still on the paths, views worth the cold fingers. Will repeat when we need to reset without flying anywhere.",
    villaId: "villa-deluxe",
    stayPeriod: "март 2024",
  },
];

export async function seedReviewsIfEmpty(
  insert: (data: InsertCustomerReview) => Promise<number>,
  countExisting: () => Promise<number>
) {
  const existing = await countExisting();
  if (existing > 0) return false;

  for (const review of SEED_REVIEWS) {
    const body =
      review.body.length <= REVIEW_BODY_MAX
        ? review.body
        : `${review.body.slice(0, REVIEW_BODY_MAX - 1).trimEnd()}…`;

    await insert({
      guestName: review.guestName,
      guestEmail: review.guestEmail,
      rating: review.rating,
      body,
      villaId: review.villaId,
      stayPeriod: review.stayPeriod,
      isPublished: true,
      source: "admin",
    });
  }

  return true;
}
