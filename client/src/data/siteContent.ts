import type { LucideIcon } from "lucide-react";
import {
  ChefHat,
  Flame,
  Home,
  MapPin,
  Mountain,
  Sun,
  Trees,
  UtensilsCrossed,
  Wifi,
} from "lucide-react";
import { GBP } from "@shared/gbpLinks";

export function formatPriceEur(amount: number): string {
  return `${amount.toLocaleString("bg-BG")} €`;
}

export type { HeroPhoto, SitePhoto } from "./photos";
export { GALLERY_IMAGES, HERO_PHOTO, VILLA_PHOTOS } from "./photos";
export type { VillaGallery } from "./galleryContent";
export { VILLA_GALLERIES, getVillaGallery } from "./galleryContent";

export const SITE = {
  name: "Pamporovo Villa",
  nameBg: "Pamporovo Villa",
  tagline: "3 вили под наем",
  location: "к.к. Пампорово · местност Райковски ливади",
  logo: "/logo.png",
  website: "https://pamporovovilla.com",
  websiteLabel: "pamporovovilla.com",
  email: "pamporovovilla@gmail.com",
} as const;

export const SOCIAL = {
  facebook: "https://www.facebook.com/PamporovoVilla/",
  instagram: "https://www.instagram.com/pamporovo_villa/",
  youtube: "https://www.youtube.com/channel/UC5zCKG7LpovT_Y6wKab9wfg",
} as const;

export const VILLA_FEATURES = [
  "2 спални за спокоен сън",
  "2 бани с топла вода",
  "Голяма всекидневна с камина",
  "Напълно оборудвана кухня",
  "Веранда с барбекю",
  "До 6 гости на вила",
] as const;

export type Villa = {
  id: string;
  name: string;
  nameEn: string;
  tagline: string;
  description: string;
  accent: string;
};

export const VILLAS: Villa[] = [
  {
    id: "villa-1",
    name: "Вила 1",
    nameEn: "Villa 1",
    tagline: "Уют за цялото семейство",
    description:
      "Топла и приветлива — с две спални, две бани и голяма всекидневна, в която камината пука, а на верандата ви чака барбекю. Любимата на семействата с деца.",
    accent: "oklch(0.72 0.12 75)",
  },
  {
    id: "villa-2",
    name: "Вила 2",
    nameEn: "Villa 2",
    tagline: "Слънце от изгрев до залез",
    description:
      "Светла и просторна, с две спални, две бани и всекидневна, отворена към планината. Верандата с барбекю е създадена за дълги вечери с приятели.",
    accent: "oklch(0.68 0.14 55)",
  },
  {
    id: "villa-deluxe",
    name: "Вила Deluxe",
    nameEn: "Villa Deluxe",
    tagline: "Малко повече лукс",
    description:
      "Най-представителната от трите — със същия комфорт от две спални, две бани и голяма всекидневна, но с допълнително внимание към детайла и атмосферата. За тези, които искат нещо специално.",
    accent: "oklch(0.65 0.08 280)",
  },
];

export const VILLA_ABOUT = {
  intro:
    "Радваме се, че ни откривате. Предлагаме ви три самостоятелни вили, сгушени в боровата гора на Райковски ливади — там, където градският шум остава далеч, а денят започва с песен на птици и аромат на смола.",
  details:
    "Вила 1, Вила 2 и Вила Deluxe са обзаведени така, както бихме искали да изглежда собственият ни дом в планината — с истинско дърво, мек текстил и онези малки детайли, които карат едно място да се усеща топло. Тук не сте просто гости; чувствайте се у дома.",
  layout:
    "Всяка вила е на две нива и разполага с две спални, две бани, напълно оборудвана кухня с трапезария и голяма всекидневна с камина на дърва. Отвън ви очакват тераса с панорама към Родопите и веранда с барбекю — мястото, където се раждат най-хубавите вечери.",
  hosts:
    "Като домакини сме на една ръка разстояние. Помагаме за изненади и тържества, насочваме ви към най-хубавите писти и пътеки, подсказваме къде се яде вкусно — а ако нещо ви трябва, просто звъннете. Нашата цел е една: да си тръгнете с желание да се върнете.",
} as const;

export type { ExperiencePanel } from "./experiencePanels";
export { EXPERIENCE_PANELS } from "./experiencePanels";

export type Amenity = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const AMENITIES: Amenity[] = [
  {
    icon: Home,
    title: "Три самостоятелни вили",
    description:
      "Вила 1, Вила 2 и Вила Deluxe — наемате цялата вила само за вас, с по 2 спални и място за до 6 гости.",
  },
  {
    icon: Flame,
    title: "Камина на дърва",
    description:
      "Истинска камина в сърцето на всекидневната — за вечерите, когато навън вали сняг.",
  },
  {
    icon: ChefHat,
    title: "Кухня като у дома",
    description:
      "Напълно оборудвана кухня с трапезария — плита, фурна, хладилник, кафемашина и всичко за домашна вечеря.",
  },
  {
    icon: UtensilsCrossed,
    title: "Веранда с барбекю",
    description:
      "Покрита веранда с барбекю — за дълги вечери на открито, независимо от времето навън.",
  },
  {
    icon: Mountain,
    title: "Гледка към Родопите",
    description:
      "Tераса с панорама към планината — сутрешно кафе със слънце и залези, които спират дъха.",
  },
  {
    icon: Sun,
    title: "260+ слънчеви дни",
    description:
      "Пампорово е най-слънчевият планински курорт в България — на 1 650 м, с мек климат и чист въздух.",
  },
  {
    icon: Trees,
    title: "Тишина сред боровете",
    description:
      "Райковски ливади — спокойна борова гора далеч от тълпите, но на минути от пистите и центъра.",
  },
  {
    icon: Wifi,
    title: "Wi-Fi и паркинг",
    description:
      "Безплатен безжичен интернет и паркинг до вратата — пристигате с колата и оставате свързани.",
  },
];

export type Offer = {
  id: string;
  title: string;
  priceEur: number;
  oldPriceEur: number;
  period: string;
  description: string;
  includes: string[];
};

export const OFFERS: Offer[] = [
  {
    id: "ski-family",
    title: "Семейна ски ваканция",
    priceEur: 128,
    oldPriceEur: 169,
    period: "01.03.2026 – 31.03.2026",
    description:
      "Подарете на децата спомен, който ще пазят цял живот. Цяла вила само за вашето семейство, на минути от пистите — а вечер камината и топлата вечеря ви чакат у дома.",
    includes: [
      "Наем на цялата вила за нощувка (до 6 души)",
      "Безплатен паркинг до вратата",
      "Безплатен Wi-Fi",
      "Включена курортна такса",
    ],
  },
  {
    id: "pay-9-stay-10",
    title: "Платете 9, останете 10 нощувки",
    priceEur: 998,
    oldPriceEur: 1279,
    period: "01.06.2026 – 10.07.2026",
    description:
      "Лятото в планината е различно — прохладни утрини, дълги дни сред природата и вечери на верандата с барбекю. Останете по-дълго при нас и подарете си една нощувка от нас.",
    includes: [
      "10-та нощувка е изцяло безплатна (при 9 платени)",
      "Цяла вила: 2 спални, 2 бани, кухня и всекидневна",
      "Веранда с барбекю и камина на дърва",
    ],
  },
];

export type PricingTier = {
  id: string;
  label: string;
  winterPerNight: number;
  summerPerNight: number;
};

export const PRICING_TIERS: PricingTier[] = [
  { id: "up-to-3", label: "До 3 нощувки", winterPerNight: 160, summerPerNight: 140 },
  { id: "4-nights", label: "4 нощувки", winterPerNight: 150, summerPerNight: 140 },
  { id: "5-nights", label: "5 нощувки", winterPerNight: 120, summerPerNight: 120 },
  { id: "over-5", label: "Над 5 нощувки", winterPerNight: 120, summerPerNight: 110 },
];

export const VILLA_DELUXE_ID = "villa-deluxe";

const DELUXE_WINTER_SURCHARGE = 20;
const DELUXE_SUMMER_SURCHARGE = 10;

export const EXTRA_FEES = {
  firewoodPerBag: 10,
  smokingFine: 50,
} as const;

export function getDeluxeWinterRate(standardWinterPerNight: number): number {
  return standardWinterPerNight + DELUXE_WINTER_SURCHARGE;
}

export function getDeluxeSummerRate(standardSummerPerNight: number): number {
  return standardSummerPerNight + DELUXE_SUMMER_SURCHARGE;
}

export const PRICING_NOTES = [
  "Цените са на вечер, на цяла вила (до 6 гости).",
  "Цените са стандартни и не важат за празнични и почивни дни. За тези периоди се свържете с нас — ще ви предложим най-доброто.",
];

export const VIP_PROGRAM = {
  title: "Станете наш VIP гост",
  intro:
    "Тези, които се връщат при нас, заслужават повече. Бъдете наши гости три пъти в рамките на една година и получавате персонална VIP карта с трайни привилегии.",
  benefits: [
    "10% постоянна отстъпка от редовната цена",
    "Ранно настаняване при възможност — започнете почивката по-рано",
    "Късно освобождаване при възможност — без бързане в последния ден",
    "Комплимент при пристигане — пресни плодове или домашна лимонада",
  ],
} as const;

export const HOUSE_RULES = {
  checkIn: "След 15:00",
  checkOut: "До 11:00",
  highlights: [
    "Посрещаме гости целогодишно, 24/7. При настаняване носете документ за самоличност.",
    "Бързате ли в последния ден? Късно освобождаване след 11:00 е безплатно, когато имаме възможност.",
    `Дърва за камината — ${EXTRA_FEES.firewoodPerBag} € за торба, по заявка или при настаняване.`,
    `Тихи часове: 23:00 – 07:00, за спокойствието на всички. Пушенето е разрешено само на двете тераси (глоба ${EXTRA_FEES.smokingFine} € в помещенията).`,
    "Без домашни любимци. За вашата сигурност на терена има видеонаблюдение.",
  ],
  prohibited: [
    "Внасяне на лични електрически и газови уреди",
    "Настаняване на нерегистрирани гости",
    "Преместване на мебели между стаите",
    "Поведение, което нарушава спокойствието на съседните вили",
  ],
} as const;

export const NAV_LINKS = [
  { href: "#about", label: "За нас" },
  { href: "#experience", label: "Разходка" },
  { href: "#gallery", label: "Галерия" },
  { href: "#amenities", label: "Удобства" },
  { href: "#location", label: "Локация" },
  { href: "#pricing", label: "Цени" },
  { href: "#contact", label: "Контакт" },
  { href: "#reviews", label: "Отзиви" },
  { href: "/pamporovo", label: "Пампорово", page: true },
];

export const CONTACT = {
  phone: "+359879501660",
  phoneDisplay: "+359 879 501 660",
  email: SITE.email,
  address: "к.к. Пампорово, местност Райковски ливади",
};

export const PROPERTY_LOCATION = {
  lat: 41.6218681,
  lng: 24.7136265,
  zoom: 14,
  label: "Pamporovo Villa — Райковски ливади",
  googleMapsUrl: GBP.mapsUrl,
  directionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=41.6218681,24.7136265&travelmode=driving",
} as const;

export const DISTANCES = [
  { value: "2 км", label: "До центъра на Пампорово" },
  { value: "10 км", label: "От Смолян" },
  { value: "85 км", label: "От Пловдив" },
  { value: "220 км", label: "От София" },
];

export const PAMPOROVO_INFO =
  "Пампорово е най-слънчевият планински курорт в България — на 1 650 м в сърцето на Родопите. Зимата носи 37 км перфектно поддържани писти и нощно каране, а лятото — еко пътеки, водопади и въздух, който лекува. А нашите вили са вашата тиха база сред всичко това.";
