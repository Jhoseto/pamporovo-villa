import { absoluteUrl, getSiteUrl } from "./seoConstants";

/** Gallery photos for image sitemap — pamporovo guide + hero assets */
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

export function galleryImagesForSitemap(): Array<{ loc: string; title: string }> {
  return SEO_GALLERY_IMAGES.map((img) => ({
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
