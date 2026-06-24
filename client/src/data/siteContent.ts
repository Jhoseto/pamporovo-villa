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

export type { HeroPhoto, SitePhoto } from "./photos";
export { GALLERY_IMAGES, HERO_PHOTO, VILLA_PHOTOS } from "./photos";

export const SITE = {
  name: "Pamporovo Villa",
  nameBg: "Pamporovo Villa",
  tagline: "3 вили под наем",
  location: "к.к. Пампорово · местност Райковски ливади",
  logo: "/logo.png",
  email: "pamporovovilla@gmail.com",
} as const;

export const SOCIAL = {
  facebook: "https://www.facebook.com/PamporovoVilla/",
  instagram: "https://www.instagram.com/pamporovo_villa/",
  youtube: "https://www.youtube.com/channel/UC5zCKG7LpovT_Y6wKab9wfg",
} as const;

export const VILLA_FEATURES = [
  "2 спални · 2 бани",
  "До 6 гости",
  "Кухня с трапезария",
  "Хол с камина на дърва",
  "Тераса с гледка",
  "Верanda с барбекю",
] as const;

export type Villa = {
  id: string;
  name: string;
  nameEn: string;
  accent: string;
};

export const VILLAS: Villa[] = [
  {
    id: "villa-edno",
    name: "Вила едно",
    nameEn: "Villa One",
    accent: "oklch(0.72 0.12 75)",
  },
  {
    id: "villa-dve",
    name: "Вила две",
    nameEn: "Villa Two",
    accent: "oklch(0.68 0.14 55)",
  },
  {
    id: "villa-tri",
    name: "Вила три",
    nameEn: "Villa Three",
    accent: "oklch(0.65 0.08 280)",
  },
];

export const VILLA_ABOUT = {
  intro:
    "Добре дошли в Pamporovo Villa — три луксозни вили в к.к. Пампорово, в тиха борова гора, в най-слънчевия курорт в България. Подходящи както за зимна, така и за незабравима лятна почивка.",
  details:
    "Посрещаме гостите си целогодишно. Всяка вила е напълно обзаведена с много любов и внимание към всеки детайл, за да се чувствате уютно като вкъщи.",
  layout:
    "Всяка вила разполага с две спални, две бани, коридор, напълно оборудвана кухня с трапезария, хол с камина на дърва, голяма тераса с невероятна гледка и веранда за прохладните вечери с барбекю.",
  hosts:
    "Като домакини ще се постараем да не липсва нищо за една пълноценна почивка. Можем да ви съдействаме за организиране на изненади, семейни тържества, фирмени мероприятия, тиймбилдинг и различни забавления в комплекса и околностите.",
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
    title: "3 вили",
    description: "Вила 1, Вила 2 и Вила 3 — всяка с 2 спални и до 6 гости",
  },
  {
    icon: Flame,
    title: "Камина на дърва",
    description: "Уютен хол с камина — дърва: 15 лв. на торба по заявка",
  },
  {
    icon: ChefHat,
    title: "Оборудвана кухня",
    description: "Напълно оборудвана кухня с трапезария",
  },
  {
    icon: UtensilsCrossed,
    title: "Барбекю веранда",
    description: "Верanda за прохладните вечери с барбекю",
  },
  {
    icon: Mountain,
    title: "Планинска гледка",
    description: "Голяма тераса с невероятна гледка към планината",
  },
  {
    icon: Sun,
    title: "Най-слънчев курорт",
    description: "Пампорово — най-слънчевият планински курорт в България",
  },
  {
    icon: Trees,
    title: "Борова гора",
    description: "Тиха локация в борова гора, далеч от шума",
  },
  {
    icon: Wifi,
    title: "Интернет и паркинг",
    description: "Безжичен интернет и паркиране при настаняване",
  },
];

export const PROPERTY_STATS = [
  { label: "Вили", value: 3, suffix: "3" },
  { label: "Гости", value: 6, suffix: "6" },
  { label: "Спални", value: 2, suffix: "2" },
];

export type Offer = {
  id: string;
  title: string;
  price: string;
  oldPrice: string;
  period: string;
  description: string;
  includes: string[];
};

export const OFFERS: Offer[] = [
  {
    id: "ski-family",
    title: "Семейна ски ваканция!",
    price: "250 лв.",
    oldPrice: "330 лв.",
    period: "01.03.2025 – 30.03.2025",
    description:
      "Ако искате да прекарате незабравима семейна ваканция на ски — посетете Pamporovo Villa! Не пропускайте да споделите най-чаканата от децата ви ваканция заедно при нас!",
    includes: [
      "Наем на цялата вила на нощ за 6 души",
      "Паркинг",
      "Интернет",
      "Курортна такса",
    ],
  },
  {
    id: "pay-9-stay-10",
    title: "Платете 9, останете 10 нощувки!",
    price: "1 950 лв.",
    oldPrice: "2 500 лв.",
    period: "01.06.2025 – 10.07.2025",
    description:
      "Изкарайте една страхотна лятна ваканция с вашето семейство! На чист въздух, сред природата, далеч от стрес и проблеми. Наемете самостоятелна вила и се почувствайте уютно като вкъщи!",
    includes: [
      "10-та нощувка безплатно при резервация за 9 нощи",
      "Напълно оборудвана кухня, хол, 2 спални, 2 бани",
      "Верanda с барбекю и камина на дърва",
    ],
  },
];

export type PricingRow = {
  nights: string;
  winter: string;
  summer: string;
};

export const PRICING_TABLE: PricingRow[] = [
  { nights: "2 нощувки", winter: "320 лв.", summer: "270 лв." },
  { nights: "3 нощувки", winter: "320 лв.", summer: "270 лв." },
  { nights: "4 нощувки", winter: "300 лв.", summer: "270 лв." },
  { nights: "5 нощувки", winter: "270 лв.", summer: "240 лв." },
  { nights: "6 нощувки", winter: "250 лв.", summer: "220 лв." },
  { nights: "7 нощувки", winter: "250 лв.", summer: "220 лв." },
];

export const PRICING_NOTES = [
  "Посочените цени са за една вила (настаняване до 6 човека), на вечер, според броя нощувки, на база настаняване (без включено изхранване). Трите вили са еднотипни — Вила едно, Вила две и Вила три.",
  "Посочените цени са стандартни и не важат за празнични и почивни дни!",
];

export const VIP_PROGRAM = {
  title: "Стани наш VIP клиент!",
  intro:
    "Бъдете наши гости три пъти за една календарна година и ще получите VIP карта!",
  benefits: [
    "10% отстъпка от редовната цена",
    "При възможност ранно настаняване във вилата",
    "При възможност късно освобождаване на вилата",
    "Комплимент пресни плодове или домашна лимонада при настаняването",
  ],
} as const;

export const HOUSE_RULES = {
  checkIn: "След 15:00",
  checkOut: "До 11:00",
  highlights: [
    "Вилата работи 24/7, целогодишно. При настаняване е необходим документ за самоличност.",
    "Късно освобождаване след 11:00 е безплатно при налична възможност.",
    "Дърва за камината: 10 евро на торба — по заявка или при настаняване.",
    "Тихи часове: 23:00 – 07:00. Пушене във вилата е забранено (освен на двете тераси) — глоба 50 евро",
    "Без домашни любимци. На терена има видеонаблюдение.",
  ],
  prohibited: [
    "Лични електрически и газови уреди",
    "Нерегистрирани гости",
    "Преместване на мебели между стаите",
    "Агресивно поведение и нарушаване на покоя",
  ],
} as const;

export const NAV_LINKS = [
  { href: "#about", label: "За нас" },
  { href: "#experience", label: "Разходка" },
  { href: "#gallery", label: "Галерия" },
  { href: "#offers-modal", label: "Оферти" },
  { href: "#pricing", label: "Цени" },
  { href: "#contact", label: "Контакт" },
];

export const CONTACT = {
  phone: "+359879501660",
  phoneDisplay: "+359 879 501 660",
  email: SITE.email,
  address: "к.к. Пампорово, местност Райковски ливади",
};

export const PROPERTY_LOCATION = {
  lat: 41.6425,
  lng: 24.6925,
  label: "Pamporovo Villa — Райковски ливади",
};

export const DISTANCES = [
  { value: "2 км", label: "До центъра на Пампорово" },
  { value: "10 км", label: "От Смолян" },
  { value: "85 км", label: "От Пловдив" },
  { value: "220 км", label: "От София" },
];

export const PAMPOROVO_INFO =
  "Пампорово е най-слънчевият планински курорт в България — на 1 650 m в Родопите, с 37 km ски писти, нощно каране и богати летни маршрути сред природата.";
