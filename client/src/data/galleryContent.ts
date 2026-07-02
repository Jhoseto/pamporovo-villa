import type { SitePhoto } from "./photos";
import { GALLERY_IMAGES, VILLA_PHOTOS } from "./photos";

export type VillaGallery = {
  id: string;
  name: string;
  tagline: string;
  accent: string;
  cover: SitePhoto;
  images: SitePhoto[];
};

function chunkGallery(images: SitePhoto[], parts: number): SitePhoto[][] {
  const size = Math.ceil(images.length / parts);
  return Array.from({ length: parts }, (_, i) => images.slice(i * size, (i + 1) * size));
}

function withCover(cover: SitePhoto, images: SitePhoto[]): SitePhoto[] {
  const rest = images.filter(img => img.src !== cover.src);
  return [cover, ...rest];
}

const [villa1Photos, villa2Photos, villaDeluxePhotos] = chunkGallery(GALLERY_IMAGES, 3);

/** Per-villa photo albums — replace `photos` when villa-specific packs are ready. */
const VILLA_GALLERY_META = [
  {
    id: "villa-1",
    name: "Вила 1",
    tagline: "Уют за цялото семейство",
    accent: "oklch(0.72 0.12 75)",
    coverKey: "villa-edno" as const,
    photos: villa1Photos,
  },
  {
    id: "villa-2",
    name: "Вила 2",
    tagline: "Слънце от изгрев до залез",
    accent: "oklch(0.68 0.14 55)",
    coverKey: "villa-dve" as const,
    photos: villa2Photos,
  },
  {
    id: "villa-deluxe",
    name: "Вила Deluxe",
    tagline: "Малко повече лукс",
    accent: "oklch(0.65 0.08 280)",
    coverKey: "villa-tri" as const,
    photos: villaDeluxePhotos,
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
    images: withCover(cover, [...meta.photos]),
  };
});

export function getVillaGallery(villaId: string): VillaGallery | undefined {
  return VILLA_GALLERIES.find(g => g.id === villaId);
}
