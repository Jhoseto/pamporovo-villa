import fs from "node:fs";
import path from "node:path";
import { absoluteUrl, getSiteUrl } from "./seoConstants";

/** Pamporovo guide + hero assets */
export const SEO_GALLERY_IMAGES: Array<{ path: string; title: string }> = [
  { path: "/photos/pamporovo/hero-winter.webp", title: "Pamporovo ski resort winter" },
  { path: "/photos/pamporovo/pamporovo-ski.webp", title: "Ski slopes Pamporovo" },
  { path: "/photos/pamporovo/rhodope-panorama.webp", title: "Rhodope Mountains panorama" },
  { path: "/photos/pamporovo/pamporovo-summer.webp", title: "Pamporovo summer" },
  { path: "/photos/pamporovo/pamporovo-lift.webp", title: "Ski lift Pamporovo" },
  { path: "/photos/pamporovo/snezhanka-tower.webp", title: "Snezhanka peak tower" },
  { path: "/photos/pamporovo/shiroka-laka.webp", title: "Shiroka Laka village" },
  { path: "/photos/pamporovo/rozhen-observatory.webp", title: "Rozhen observatory" },
  { path: "/photos/pamporovo/rozhen-meadows.webp", title: "Rozhen meadows" },
  { path: "/photos/pamporovo/wonderful-bridges.webp", title: "Wonderful Bridges" },
  { path: "/photos/pamporovo/yagodina-cave.webp", title: "Yagodina Cave" },
  { path: "/photos/pamporovo/devils-throat.webp", title: "Devil's Throat cave" },
  { path: "/photos/pamporovo/trigrad-gorge.webp", title: "Trigrad Gorge" },
  { path: "/photos/pamporovo/uhlovitsa-cave.webp", title: "Uhlovitsa Cave" },
  { path: "/photos/pamporovo/canyon-waterfalls.webp", title: "Canyon of Waterfalls eco trail" },
  { path: "/photos/pamporovo/smolyan-lakes.webp", title: "Smolyan Lakes" },
  { path: "/photos/pamporovo/nevyastata.webp", title: "Nevyastata eco trail" },
  { path: "/photos/pamporovo/orpheus-rocks.webp", title: "Orpheus Rocks" },
  { path: "/photos/pamporovo/momchilovtsi.webp", title: "Momchilovtsi village" },
  { path: "/photos/pamporovo/gela-village.webp", title: "Gela village" },
  { path: "/photos/pamporovo/smolyan-town.webp", title: "Smolyan town" },
  { path: "/photos/hero.webp", title: "Pamporovo Villa exterior" },
];

const HUB_PATHS = new Set(SEO_GALLERY_IMAGES.map((img) => img.path));

let cachedVillaPhotos: Array<{ path: string; title: string }> | null = null;

/** Reads villa gallery alts from auto-generated photos.ts (server-only). */
export function loadVillaGalleryPhotos(): Array<{ path: string; title: string }> {
  if (cachedVillaPhotos) return cachedVillaPhotos;

  try {
    const photosPath = path.join(process.cwd(), "client/src/data/photos.ts");
    const text = fs.readFileSync(photosPath, "utf8");
    const entries: Array<{ path: string; title: string }> = [];
    const lineRe = /src: `\$\{P\}\/([^`]+)`, alt: "([^"]+)"/g;
    let match: RegExpExecArray | null;
    while ((match = lineRe.exec(text)) !== null) {
      const photoPath = `/photos/${match[1]}`;
      if (HUB_PATHS.has(photoPath) || photoPath.includes("/pamporovo/")) continue;
      entries.push({ path: photoPath, title: match[2] });
    }
    cachedVillaPhotos = entries;
    return entries;
  } catch {
    cachedVillaPhotos = [];
    return [];
  }
}

function chunk<T>(items: T[], parts: number): T[][] {
  const size = Math.ceil(items.length / parts);
  return Array.from({ length: parts }, (_, i) => items.slice(i * size, (i + 1) * size));
}

const VILLA_IDS = ["villa-1", "villa-2", "villa-deluxe"] as const;

export function villaGalleryImagesForSitemap(villaId: string): Array<{ loc: string; title: string }> {
  const photos = loadVillaGalleryPhotos();
  const index = VILLA_IDS.indexOf(villaId as (typeof VILLA_IDS)[number]);
  if (index < 0) return [];
  const slice = chunk(photos, 3)[index] ?? [];
  return slice.map((img) => ({ loc: absoluteUrl(img.path), title: img.title }));
}

export function galleryImagesForSitemap(): Array<{ loc: string; title: string }> {
  const villa = loadVillaGalleryPhotos();
  const merged = [...SEO_GALLERY_IMAGES, ...villa];
  return merged.map((img) => ({
    loc: absoluteUrl(img.path),
    title: img.title,
  }));
}

export function hubGalleryImageUrls(): string[] {
  return SEO_GALLERY_IMAGES.slice(0, 12).map((img) => absoluteUrl(img.path));
}

export function pamporovoHubPageUrl(): string {
  return `${getSiteUrl()}/pamporovo`;
}

export function homepageGalleryImagesForSitemap(limit = 24): Array<{ loc: string; title: string }> {
  return galleryImagesForSitemap().slice(0, limit);
}
