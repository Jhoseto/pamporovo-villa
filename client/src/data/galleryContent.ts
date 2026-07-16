import type { SitePhoto } from "./photos";
import { VILLA_PHOTOS } from "./photos";

const P = "/photos" as const;

export type VillaGallery = {
  id: string;
  name: string;
  tagline: string;
  accent: string;
  cover: SitePhoto;
  images: SitePhoto[];
};

const VILLA_1_PHOTOS: SitePhoto[] = [
  { src: `${P}/villa-1/01.jpg`, alt: "Екстериор на Вила 1 през лятото — градина, люлка и барбекю" },
  { src: `${P}/villa-1/02.jpg`, alt: "Вила 1 под сняг в Пампорово — зимен екстериор" },
  { src: `${P}/villa-1/03.jpg`, alt: "Хол с ъглов диван, камина и стълбище — Вила 1" },
  { src: `${P}/villa-1/04.jpg`, alt: "Кухня, камина и дневна зона — Вила 1" },
  { src: `${P}/villa-1/05.jpg`, alt: "Трапезария, кухня и камина с огън — Вила 1" },
  { src: `${P}/villa-1/06.jpg`, alt: "Трапезария с маса за шестима — Вила 1" },
  { src: `${P}/villa-1/07.jpg`, alt: "Трапезария с прозорци и гледка към градината — Вила 1" },
  { src: `${P}/villa-1/08.jpg`, alt: "Камина с горящ огън — Вила 1" },
  { src: `${P}/villa-1/09.jpg`, alt: "Спалня с дървена табла и две легла — Вила 1" },
  { src: `${P}/villa-1/10.jpg`, alt: "Спалня с подготвени хавлии — Вила 1" },
  { src: `${P}/villa-1/11.jpg`, alt: "Спалня с огледало и дървени рафтове — Вила 1" },
  { src: `${P}/villa-1/12.jpg`, alt: "Баня с дървено огледало и умивалник — Вила 1" },
  { src: `${P}/villa-1/13.jpg`, alt: "Баня с дървен умивалник и плетени кошници — Вила 1" },
  { src: `${P}/villa-1/14.jpg`, alt: "Вътрешен коридор с каменни стени — Вила 1" },
];

const VILLA_2_PHOTOS: SitePhoto[] = [
  { src: `${P}/villa-2/01.jpg`, alt: "Вила 2 под сняг в Пампорово — зимен екстериор" },
  { src: `${P}/villa-2/02.jpg`, alt: "Вила 2 през зимата — балкон и каменен фасад" },
  { src: `${P}/villa-2/03.jpg`, alt: "Зимна тераса с барбекю и дървена маса — Вила 2" },
  { src: `${P}/villa-2/04.jpg`, alt: "Гледка от балкона към заснежени вили и гора — Вила 2" },
  { src: `${P}/villa-2/05.jpg`, alt: "Панорама от балкона към планинските вили — Вила 2" },
  { src: `${P}/villa-2/06.jpg`, alt: "Зимен изглед от терасата към комплекса — Вила 2" },
  { src: `${P}/villa-2/07.jpg`, alt: "Дневна с диван, камина и винтово стълбище — Вила 2" },
  { src: `${P}/villa-2/08.jpg`, alt: "Трапезария и дневна с каменна стена — Вила 2" },
  { src: `${P}/villa-2/09.jpg`, alt: "Отворен план — диван, трапезария и каменна стена — Вила 2" },
  { src: `${P}/villa-2/10.jpg`, alt: "Отворено пространство отгоре — кухня, трапезария и хол — Вила 2" },
  { src: `${P}/villa-2/11.jpg`, alt: "Дневна и кухня — гледка от стълбището — Вила 2" },
  { src: `${P}/villa-2/12.jpg`, alt: "Партер с камина, кухня и дървено стълбище — Вила 2" },
  { src: `${P}/villa-2/13.jpg`, alt: "Трапезария, кухня и камина с огън — Вила 2" },
  { src: `${P}/villa-2/14.jpg`, alt: "Кухня и камина с горящ огън — Вила 2" },
  { src: `${P}/villa-2/15.jpg`, alt: "Оборудвана кухня с дървени шкафове — Вила 2" },
  { src: `${P}/villa-2/16.jpg`, alt: "Хол с ъглов диван и каменна стена — Вила 2" },
  { src: `${P}/villa-2/17.jpg`, alt: "Трапезария с дървена маса и винтова стълба — Вила 2" },
  { src: `${P}/villa-2/18.jpg`, alt: "Коридор с гледка към двете спални — Вила 2" },
  { src: `${P}/villa-2/19.jpg`, alt: "Спалня с дървена табла и цветно спално бельо — Вила 2" },
  { src: `${P}/villa-2/20.jpg`, alt: "Спалня с двойно легло и балкон — Вила 2" },
  { src: `${P}/villa-2/21.jpg`, alt: "Спалня с дървена табла и карирано спално бельо — Вила 2" },
  { src: `${P}/villa-2/22.jpg`, alt: "Спалня с двойно легло и плетено осветление — Вила 2" },
  { src: `${P}/villa-2/23.jpg`, alt: "Спалня с огледало и дървена табла — Вила 2" },
  { src: `${P}/villa-2/24.jpg`, alt: "Стая с две легла и дървена стенна табла — Вила 2" },
  { src: `${P}/villa-2/25.jpg`, alt: "Баня с дървен умивалник и душ кабина — Вила 2" },
  { src: `${P}/villa-2/26.jpg`, alt: "Традиционен коридор с каменни стени — Вила 2" },
];

const VILLA_DELUXE_PHOTOS: SitePhoto[] = [
  { src: `${P}/villa-deluxe/01.jpg`, alt: "Вила Deluxe под сняг в Пампорово — зимен екстериор" },
  { src: `${P}/villa-deluxe/02.jpg`, alt: "Гледка от балкона към заснежените вили — Вила Deluxe" },
  { src: `${P}/villa-deluxe/03.jpg`, alt: "Зимна панорама от терасата към гората — Вила Deluxe" },
  { src: `${P}/villa-deluxe/04.jpg`, alt: "Изглед от балкона с дървена колона — Вила Deluxe" },
  { src: `${P}/villa-deluxe/05.jpg`, alt: "Гледка през стъклото към заснежена тераса — Вила Deluxe" },
  { src: `${P}/villa-deluxe/06.jpg`, alt: "Затворена веранда с палет мебели и гледка към сняг — Вила Deluxe" },
  { src: `${P}/villa-deluxe/07.jpg`, alt: "Трапезария с гледка към заснежена тераса — Вила Deluxe" },
  { src: `${P}/villa-deluxe/08.jpg`, alt: "Дневна и трапезария с каменна стена — Вила Deluxe" },
  { src: `${P}/villa-deluxe/09.jpg`, alt: "Отворен план с диван, трапезария и стълбище — Вила Deluxe" },
  { src: `${P}/villa-deluxe/10.jpg`, alt: "Дневна с камина и винтово стълбище — Вила Deluxe" },
  { src: `${P}/villa-deluxe/11.jpg`, alt: "Хол с диван, камина и дървено стълбище — Вила Deluxe" },
  { src: `${P}/villa-deluxe/12.jpg`, alt: "Хол с ъглов диван и каменна стена — Вила Deluxe" },
  { src: `${P}/villa-deluxe/13.jpg`, alt: "Трапезария с дървена маса и каменна стена — Вила Deluxe" },
  { src: `${P}/villa-deluxe/14.jpg`, alt: "Кухня, камина и телевизор — Вила Deluxe" },
  { src: `${P}/villa-deluxe/15.jpg`, alt: "Кухня и камина с горящ огън — Вила Deluxe" },
  { src: `${P}/villa-deluxe/16.jpg`, alt: "Отворено пространство — кухня, трапезария и стълбище — Вила Deluxe" },
  { src: `${P}/villa-deluxe/17.jpg`, alt: "Дневна зона с дървено стълбище — Вила Deluxe" },
  { src: `${P}/villa-deluxe/18.jpg`, alt: "Трапезария и кухня с камина — Вила Deluxe" },
  { src: `${P}/villa-deluxe/19.jpg`, alt: "Кухня и дневна с прозорци — Вила Deluxe" },
  { src: `${P}/villa-deluxe/20.jpg`, alt: "Дневна с каменна стена и диван — Вила Deluxe" },
  { src: `${P}/villa-deluxe/21.jpg`, alt: "Трапезария с маса за шестима — Вила Deluxe" },
  { src: `${P}/villa-deluxe/22.jpg`, alt: "Хол с диван и каменна стена — Вила Deluxe" },
  { src: `${P}/villa-deluxe/23.jpg`, alt: "Отворен план — дневна и трапезария — Вила Deluxe" },
  { src: `${P}/villa-deluxe/24.jpg`, alt: "Спалня с огледало и две легла — Вила Deluxe" },
  { src: `${P}/villa-deluxe/25.jpg`, alt: "Спалня с дървена табла и балкон — Вила Deluxe" },
  { src: `${P}/villa-deluxe/26.jpg`, alt: "Спалня с три легла и дървена стена — Вила Deluxe" },
  { src: `${P}/villa-deluxe/27.jpg`, alt: "Спалня с дървена табла и карирано бельо — Вила Deluxe" },
  { src: `${P}/villa-deluxe/28.jpg`, alt: "Спалня с огледало и комод — Вила Deluxe" },
  { src: `${P}/villa-deluxe/29.jpg`, alt: "Стая с две легла и дървена стенна табла — Вила Deluxe" },
  { src: `${P}/villa-deluxe/30.jpg`, alt: "Баня с дървен умивалник и душ кабина — Вила Deluxe" },
  { src: `${P}/villa-deluxe/31.jpg`, alt: "Баня с душ и дървени акценти — Вила Deluxe" },
];

/** Per-villa photo albums — add images to `photos` when villa packs are ready. */
const VILLA_GALLERY_META = [
  {
    id: "villa-1",
    name: "Вила 1",
    tagline: "Уют за цялото семейство",
    accent: "oklch(0.72 0.12 75)",
    coverKey: "villa-edno" as const,
    photos: VILLA_1_PHOTOS,
  },
  {
    id: "villa-2",
    name: "Вила 2",
    tagline: "Слънце от изгрев до залез",
    accent: "oklch(0.68 0.14 55)",
    coverKey: "villa-dve" as const,
    photos: VILLA_2_PHOTOS,
  },
  {
    id: "villa-deluxe",
    name: "Вила Deluxe",
    tagline: "Малко повече лукс",
    accent: "oklch(0.65 0.08 280)",
    coverKey: "villa-tri" as const,
    photos: VILLA_DELUXE_PHOTOS,
  },
] as const;

export const VILLA_GALLERIES: VillaGallery[] = VILLA_GALLERY_META.map(meta => {
  const cover = VILLA_PHOTOS[meta.coverKey];
  return {
    id: meta.id,
    name: meta.name,
    tagline: meta.tagline,
    accent: meta.accent,
    cover,
    images: [...meta.photos],
  };
});

export function getVillaGallery(villaId: string): VillaGallery | undefined {
  return VILLA_GALLERIES.find(g => g.id === villaId);
}
