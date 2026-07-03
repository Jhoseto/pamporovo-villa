import fs from "node:fs";
import path from "node:path";
import { EXPERIENCE_PANELS } from "../../client/src/data/experiencePanels";
import {
  AMENITIES,
  CONTACT,
  DISTANCES,
  EXTRA_FEES,
  HOUSE_RULES,
  OFFERS,
  PRICING_NOTES,
  PRICING_TIERS,
  SITE,
  VIP_PROGRAM,
  VILLA_ABOUT,
  VILLA_FEATURES,
  VILLAS,
} from "../../client/src/data/siteContent";
import { PAMPOROVO_PAGE_META } from "../../client/src/data/pamporovoContent";
import { HOME_FAQ } from "../homeFaq";
import { PAMPOROVO_FAQ } from "../pamporovoFaq";
import { PAMPOROVO_SPOKES } from "../pamporovoSpokes";
import { VILLA_PAGE_CONFIGS } from "../villaPages";
import { extractGuide } from "./extractGuide";
import { extractLegal } from "./extractLegal";

const BG_DIR = path.join(process.cwd(), "shared/locales/bg");

function writeJson(name: string, data: unknown): void {
  fs.mkdirSync(BG_DIR, { recursive: true });
  fs.writeFileSync(path.join(BG_DIR, `${name}.json`), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function extractExperience(): void {
  const panels: Record<string, unknown> = {};
  for (const p of EXPERIENCE_PANELS) {
    panels[p.id] = {
      room: p.room,
      title: p.title,
      subtitle: p.subtitle,
      description: p.description,
      imageAlt: p.imageAlt,
      highlights: p.highlights,
    };
  }
  writeJson("experience", {
    sectionEyebrow: "Виртуална разходка",
    sectionTitle: "Влезте, преди да сте дошли",
    sectionSubtitle: "Превъртете и обиколете вилите стая по стая",
    ariaLabel: "Виртуална разходка",
    ariaLabel3d: "Виртуална 3D разходка",
    skipUp: "Продължете нагоре",
    skipDown: "Продължете надолу",
    skipUpAria: "Пропусни разходката нагоре",
    skipDownAria: "Пропусни разходката надолу",
    highlightsLabel: "Акценти",
    panels,
  });
}

function extractAmenities(): void {
  writeJson("amenities", {
    items: AMENITIES.map((a) => ({ title: a.title, description: a.description })),
  });
}

function extractPolicy(): void {
  writeJson("policy", {
    checkInLabel: "Настаняване",
    checkOutLabel: "Напускане",
    checkIn: HOUSE_RULES.checkIn,
    checkOut: HOUSE_RULES.checkOut,
    stayHeading: "Настаняване и престой",
    stayIntro:
      "Искаме престоят ви да е лек и безгрижен — затова държим нещата прости и прозрачни.",
    avoidHeading: "Молим ви да избягвате",
    footer:
      "Благодарим ви, че избрахте Pamporovo Villa. Грижата за дома е взаимна — пазейки го, го пазим хубав за всеки следващ гост. Имате въпрос? Винаги сме насреща.",
    highlights: [...HOUSE_RULES.highlights],
    prohibited: [...HOUSE_RULES.prohibited],
  });
}

function extractVip(): void {
  writeJson("vip", {
    eyebrow: "VIP програма",
    badge: "Ексклузивни привилегии",
    title: VIP_PROGRAM.title,
    intro: VIP_PROGRAM.intro,
    benefits: [...VIP_PROGRAM.benefits],
  });
}

function extractOffers(): void {
  const items: Record<string, unknown> = {};
  for (const o of OFFERS) {
    items[o.id] = {
      title: o.title,
      period: o.period,
      description: o.description,
      includes: o.includes,
    };
  }
  writeJson("offers", {
    eyebrow: "Ексклузивни пакети",
    title: "Топ оферти",
    subtitle:
      "Подбрани пакети за ски и лятна почивка на специална цена. Периодите са ограничени — а най-хубавите дати си отиват първи.",
    loading: "Зареждане...",
    empty: "В момента няма активни оферти.",
    oldPrice: "стара цена",
    includes: "Включва",
    bookOffer: "Резервирай офертата",
    badge: "Оферта",
    claimCta: "Възползвай се",
    footer: "Офертите са валидни за посочените периоди · за резервация — секция „Резервирай“",
    items,
  });
}

function extractPricing(): void {
  const tiers: Record<string, string> = {};
  for (const t of PRICING_TIERS) {
    tiers[t.id] = t.label;
  }
  writeJson("pricing", {
    tableNights: "Брой нощувки",
    winterSeason: "Зимен сезон",
    winterRange: "септември – март",
    summerSeason: "Летен сезон",
    summerRange: "април – август",
    winterShort: "Зима",
    summerShort: "Лято",
    winterLegend: "Зима · септ. – март",
    summerLegend: "Лято · апр. – авг.",
    bestValue: "Най-изгодно при по-дълъг престой",
    loading: "Цените скоро ще бъдат публикувани.",
    cta: "Проверете свободни дати",
    tiers,
    notes: [...PRICING_NOTES],
    breakdown: {
      night: "нощувка",
      nights: "нощувки",
      perNightWinter: "/нощ (зима)",
      perNightSummer: "/нощ (лято)",
    },
  });
}

function extractBooking(): void {
  writeJson("booking", {
    calendarTitle: "Изберете период за {villa}",
    clearDates: "Изчисти датите",
    calendarHint: "Кликнете начална и крайна дата· Минимум една нощувка",
    occupiedHint:
      "Зачертаните дати са заети — проверете дали друга вила е свободна за същия период.",
    priceLabel: "Цена",
    priceNote: "Цяла вила · до 6 гости · без изхранване · тарифа „{tier}“",
    priceEmpty: "Изберете дати за пристигане и напускане, за да видите цената.",
    priceLoading: "Цените се зареждат...",
    formTitle: "Данни за резервация",
    checkIn: "Дата на пристигане",
    checkOut: "Дата на заминаване",
    villa: "Вила",
    villaPlaceholder: "Изберете вила",
    guests: "Брой гости",
    name: "Име",
    email: "Имейл",
    phone: "Телефон",
    note: "Бележка",
    notePlaceholder: "Напишете ако имате уточняваща информация към резервацията...",
    termsPrefix: "Запознах се и приемам",
    termsLink: "Общите условия",
    privacyLink: "Политиката за поверителност",
    termsSuffix: "и правилата за ползване на вилата.",
    submit: "Изпрати резервация",
    submitting: "Изпращане...",
    thisVilla: "тази вила",
    toast: {
      datesOccupiedVilla:
        "Избраните дати са заети за тази вила — моля, изберете нов период.",
      dateOccupied:
        "Тази дата е заета за {villa}. Сменете вилата от формата — възможно е друга да е свободна за същия период.",
      minOneNight: "Минимум една нощувка — настаняване и напускане не могат да са в един ден.",
      rangeOccupied:
        "Периодът включва заети дати за {villa}. Изберете свободен интервал или проверете друга вила.",
      pickDates: "Моля, изберете дати за настаняване и напускане.",
      rangeHasOccupied: "Избраният период включва заети дати за тази вила. Моля, изберете друг.",
      success: "Резервацията е изпратена успешно! Ще ви свържем скоро.",
      error: "Възникна грешка при изпращане на резервацията.",
    },
  });
}

function extractReviews(): void {
  writeJson("reviews", {
    form: {
      name: "Име",
      namePlaceholder: "Вашето име",
      email: "Имейл",
      emailPlaceholder: "по избор",
      rating: "Оценка",
      ratingAria: "{star} звезди",
      villa: "Вила",
      villaPlaceholder: "Изберете",
      villaUnknown: "Не съм сигурен/а",
      period: "Период",
      periodPlaceholder: "напр. Март 2025",
      body: "Вашият отзив",
      bodyPlaceholder: "Какво запомнихте от престоя си при нас...",
      submit: "Изпрати отзив",
      submitting: "Изпращане...",
    },
    toast: {
      success: "Благодарим за отзива! Ще го публикуваме след преглед.",
      error: "Възникна грешка при изпращане на отзива.",
    },
    carousel: {
      readMore: "Прочети повече",
      readFull: "Целият отзив",
      open: "Отвори",
      readFullAria: "Прочети целия отзив",
      openAria: "Отвори отзива",
      close: "Затвори",
      emptyTitle: "Все още няма публикувани отзиви",
      emptyBody: "Бъдете първи — споделете впечатленията си отдолу.",
      pause: "Пауза на автоматичното превъртане",
      resume: "Продължи автоматичното превъртане",
      prev: "Предишен отзив",
      next: "Следващ отзив",
      navLabel: "Отзиви",
      reviewN: "Отзив {n}",
      photoCount: "{count} снимки",
      googleSource: "Google",
      siteSource: "Сайт",
    },
    modal: {
      close: "Затвори",
    },
  });
}

function extractCookies(): void {
  writeJson("cookies", {
    bannerTitle: "Бисквитки и поверителност",
    bannerBody:
      "Използваме необходими бисквитки за работа на сайта. С ваше съгласие активираме Google Analytics и Google Maps.",
    policyLink: "Политика за бисквитки",
    settings: "Настройки",
    accept: "Приемам",
    manage: "Управление на бисквитки",
    modalTitle: "Настройки за бисквитки",
    modalBody: "Изберете кои категории да разрешите. Необходимите бисквитки винаги са активни.",
    necessary: "Необходими",
    necessaryDesc: "Запазват избора ви за бисквитки и осигуряват основната работа на сайта.",
    analytics: "Аналитични",
    analyticsDesc:
      "Google Analytics 4 — анонимна статистика за посещения и поведение на сайта.",
    functional: "Функционални / трети страни",
    functionalDesc: "Google Maps — интерактивна карта с локацията на вилите.",
    reject: "Само необходими",
    save: "Запази избора",
    acceptAll: "Приемам всички",
  });
}

function extractHub(): void {
  writeJson("hub", {
    title: PAMPOROVO_PAGE_META.title,
    description: PAMPOROVO_PAGE_META.description,
    eyebrow: "Родопите · к.к. Пампорово",
    h1: "Пампорово и околностите",
    subtitle:
      "Пълен гид за курорта и региона — 37+ км писти, лифтове, еко пътеки, пещери и автентични села на един планински ден пътуване от вилите.",
    usefulPages: "Полезни страници",
    exploreCta: "Разгледайте гида",
    bookCta: "Резервирай вила",
    moreOnTopic: "Още по темата",
    questionsTopic: "Въпроси по темата",
    faqDefault: "Често задавани въпроси",
    faqSubtitle:
      "Бързи отговори за настаняване, писти и практични детайли — полезно за търсене и планиране на почивка.",
    recommendedNearby: "Препоръчано наблизо",
    pisteTable: "Таблица с писти",
    liftTable: "Ски лифтове в Пампорово",
    stickyReserve: "Резервирай",
    backToGuide: "Пълен гид за Пампорово",
    villaCtaTitle: "Pamporovo Villa — наем на вила",
    villaCtaBody:
      "3 самостоятелни вили на Райковски ливади · 2 km от центъра · камина · BBQ · до 6 гости",
    villaCtaFrom: "от",
    villaCtaPerNight: "/ нощ",
    seeRent: "Виж /rent",
    rentPage: "Страница за наем",
    bookVilla: "Резервирай вила",
    winterCta: "Зима — писти и лифтове",
    summerCta: "Лято — еко маршрути",
    heroAlt: "Писта Стената и кулата Снежанка — Пампорово",
  });
}

function extractVilla(): void {
  const pages: Record<string, unknown> = {};
  for (const cfg of VILLA_PAGE_CONFIGS) {
    const v = VILLAS.find((x) => x.id === cfg.id);
    pages[cfg.id] = {
      name: v?.name ?? cfg.h1,
      tagline: cfg.tagline,
      description: v?.description ?? "",
      seoTitle: cfg.seoTitle,
      seoDescription: cfg.seoDescription,
      seoKeywords: cfg.seoKeywords,
      h1: cfg.h1,
    };
  }
  writeJson("villa", {
    backToRent: "← Наем на вила",
    featuresHeading: "Удобства и възможности",
    pricingHeading: "Цени",
    pricingHeadingFor: "Цени за {villa}",
    pricingFrom: "от",
    pricingPerNight: "/ нощ",
    summerFrom: "Лято от",
    winterFrom: "Зима от",
    wholeVillaNote: "Цяла вила · до 6 гости",
    bookCta: "Резервирай",
    bookVilla: "Резервирай {villa}",
    guideLink: "Гид Пампорово",
    amenitiesHeading: "Удобства",
    otherVillas: "Другите ни вили",
    contactHeading: "Контакт и резервация",
    features: [...VILLA_FEATURES],
    pricingNotes: [
      "Цените са на вечер, на цяла вила (до 6 гости).",
      "Включена курортна такса.",
      "Дърва за камина — 10 € за торба, по заявка.",
      "Ски карти не са включени.",
    ],
    pages,
    about: { ...VILLA_ABOUT },
    distances: DISTANCES.map((d) => ({ value: d.value, label: d.label })),
    contact: {
      phone: CONTACT.phoneDisplay,
      email: CONTACT.email,
      address: CONTACT.address,
    },
    firewoodNote: `Дърва за камината — ${EXTRA_FEES.firewoodPerBag} € за торба, по заявка или при настаняване.`,
  });
}

function extractSpokes(): void {
  const spokesOut: Record<string, unknown> = {};
  for (const spoke of PAMPOROVO_SPOKES) {
    spokesOut[spoke.slug] = {
      eyebrow: spoke.eyebrow,
      h1: spoke.h1,
      intro: spoke.intro,
      seoTitle: spoke.seoTitle,
      seoDescription: spoke.seoDescription,
      seoKeywords: spoke.seoKeywords,
      sections: spoke.sections.map((s) => ({
        heading: s.heading,
        paragraphs: s.paragraphs,
        bullets: s.bullets ?? [],
      })),
    };
  }
  writeJson("spokes", spokesOut);
}

function extractFaq(): void {
  const home: Record<string, { question: string; answer: string }> = {};
  for (const f of HOME_FAQ) {
    home[f.id] = { question: f.question, answer: f.answer };
  }
  const pamporovo: Record<string, { question: string; answer: string }> = {};
  for (const f of PAMPOROVO_FAQ) {
    pamporovo[f.id] = { question: f.question, answer: f.answer };
  }
  writeJson("faq", { home, pamporovo });
}

function extractWeather(): void {
  writeJson("weather", {
    resortName: "Пампорово",
    elevation: "1 650 m",
    variable: "Променливо",
    wind: {
      calm: "тих",
      light: "лек полъх",
      gentle: "слаб",
      moderate: "умерен",
      strong: "силен",
    },
    codes: {
      "0": { label: "Ясно", short: "Ясно" },
      "1": { label: "Предимно ясно", short: "Ясно" },
      "2": { label: "Частична облачност", short: "Облачно" },
      "3": { label: "Облачно", short: "Облачно" },
      "45": { label: "Мъгла", short: "Мъгла" },
      "48": { label: "Силна мъгла", short: "Мъгла" },
      "51": { label: "Лек ръмеж", short: "Ръмеж" },
      "53": { label: "Ръмеж", short: "Ръмеж" },
      "55": { label: "Силен ръмеж", short: "Ръмеж" },
      "56": { label: "Лек леден ръмеж", short: "Ръмеж" },
      "57": { label: "Леден ръмеж", short: "Ръмеж" },
      "61": { label: "Слаб дъжд", short: "Дъжд" },
      "63": { label: "Дъжд", short: "Дъжд" },
      "65": { label: "Силен дъжд", short: "Дъжд" },
      "66": { label: "Лек леден дъжд", short: "Дъжд" },
      "67": { label: "Леден дъжд", short: "Дъжд" },
      "71": { label: "Слаб сняг", short: "Сняг" },
      "73": { label: "Сняг", short: "Сняг" },
      "75": { label: "Силен сняг", short: "Сняг" },
      "77": { label: "Снежни зърна", short: "Сняг" },
      "80": { label: "Кратък дъжд", short: "Валежи" },
      "81": { label: "Валежи", short: "Валежи" },
      "82": { label: "Силни валежи", short: "Валежи" },
      "85": { label: "Слаб сняг", short: "Сняг" },
      "86": { label: "Силен сняг", short: "Сняг" },
      "95": { label: "Гръмотевици", short: "Буря" },
      "96": { label: "Градушка", short: "Буря" },
      "99": { label: "Силна градушка", short: "Буря" },
    },
  });
}

function patchHomeGallery(): void {
  const homePath = path.join(BG_DIR, "home.json");
  if (!fs.existsSync(homePath)) return;
  const home = JSON.parse(fs.readFileSync(homePath, "utf8")) as Record<string, unknown>;
  const gallery = (home.gallery ?? {}) as Record<string, string>;
  const about = (home.about ?? {}) as Record<string, string>;
  gallery.photoCount = "{count} снимки";
  about.imageForestAlt = "Вила в боровата гора на Райковски ливади";
  about.imageInteriorAlt = "Интериор с каменна стена и дърво";
  about.badgeLocation = "Райковски ливади";
  about.badgeResort = "Пампорово";
  if (!about.layout) {
    about.layout = VILLA_ABOUT.layout;
  }
  home.distances = DISTANCES.map((d) => ({ value: d.value, label: d.label }));
  home.gallery = gallery;
  home.about = about;
  fs.writeFileSync(homePath, `${JSON.stringify(home, null, 2)}\n`, "utf8");
}

function patchHomeAbout(): void {
  patchHomeGallery();
}

function patchCommonSite(): void {
  const commonPath = path.join(BG_DIR, "common.json");
  const common = fs.existsSync(commonPath)
    ? (JSON.parse(fs.readFileSync(commonPath, "utf8")) as Record<string, string>)
    : {};
  common.siteName = SITE.name;
  common.tagline = SITE.tagline;
  common.location = SITE.location;
  common.address = CONTACT.address;
  fs.writeFileSync(commonPath, `${JSON.stringify(common, null, 2)}\n`, "utf8");
}

function patchRent(): void {
  const rentPath = path.join(BG_DIR, "rent.json");
  const rent = fs.existsSync(rentPath)
    ? (JSON.parse(fs.readFileSync(rentPath, "utf8")) as Record<string, string>)
    : {};
  rent.villaPageLink = "{villa} страница →";
  fs.writeFileSync(rentPath, `${JSON.stringify(rent, null, 2)}\n`, "utf8");
}

/** Regenerate all BG locale JSON from TypeScript source content. */
export function extractAllToBg(): void {
  extractExperience();
  extractAmenities();
  extractPolicy();
  extractVip();
  extractOffers();
  extractPricing();
  extractBooking();
  extractReviews();
  extractCookies();
  extractHub();
  extractVilla();
  extractGuide(writeJson);
  extractLegal(writeJson);
  extractWeather();
  extractSpokes();
  extractFaq();
  patchHomeAbout();
  patchCommonSite();
  patchRent();
}
