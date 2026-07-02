/**
 * Generate admin PWA icons + iOS splash screens.
 * House mark: client/public/admin/icons/pwa-house-source.png
 * Usage: pnpm pwa:icons
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const houseIconPath = path.join(root, "client/public/admin/icons/pwa-house-source.png");
const bannerLogoPath = path.join(root, "client/public/logo.png");
const iconsDir = path.join(root, "client/public/admin/icons");
const splashDir = path.join(root, "client/public/admin/splash");
const publicDir = path.join(root, "client/public");
const SPLASH_BG = "#efeae1";

if (!fs.existsSync(houseIconPath)) {
  console.error("Missing pwa-house-source.png — add the house icon to client/public/admin/icons/");
  process.exit(1);
}

fs.mkdirSync(iconsDir, { recursive: true });
fs.mkdirSync(splashDir, { recursive: true });

const houseSource = await sharp(houseIconPath).trim({ threshold: 15 }).png().toBuffer();

await sharp(houseSource).toFile(path.join(iconsDir, "logo-house-source.png"));

/** Dark pixels → transparent (for favicon without square halo). */
async function houseTransparent(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const threshold = 40;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r <= threshold && g <= threshold && b <= threshold) {
      data[i + 3] = 0;
    }
  }
  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

const faviconHouseSource = await houseTransparent(houseSource);

function iconBackgroundSvg(size, variant = "app") {
  const radius = variant === "badge" ? 16 : Math.round(size * 0.19);
  const bg =
    variant === "badge"
      ? `
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#b8924f"/>
            <stop offset="100%" stop-color="#8f6a32"/>
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" rx="${radius}" fill="url(#bg)"/>
      `
      : `
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f7f4ee"/>
            <stop offset="48%" stop-color="#efeae1"/>
            <stop offset="100%" stop-color="#e4ddd1"/>
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="38%" r="58%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="${size}" height="${size}" rx="${radius}" fill="url(#bg)"/>
        <rect width="${size}" height="${size}" rx="${radius}" fill="url(#glow)"/>
        <rect x="1.5" y="1.5" width="${size - 3}" height="${size - 3}" rx="${radius - 2}" fill="none" stroke="#d8cdb8" stroke-width="1.5" opacity="0.55"/>
      `;

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${bg}</svg>`
  );
}

async function composeIcon(size, { maskable = false, badge = false } = {}) {
  const variant = badge ? "badge" : "app";
  const bg = await sharp(iconBackgroundSvg(size, variant)).png().toBuffer();
  const houseMeta = await sharp(houseSource).metadata();
  const houseAspect = (houseMeta.width ?? 1) / (houseMeta.height ?? 1);
  const houseScale = badge ? 0.68 : maskable ? 0.66 : 0.76;
  const maxHouse = Math.round(size * houseScale);
  const houseWidth = houseAspect >= 1 ? maxHouse : Math.round(maxHouse * houseAspect);
  const houseHeight = houseAspect >= 1 ? Math.round(maxHouse / houseAspect) : maxHouse;

  const house = await sharp(houseSource)
    .resize(houseWidth, houseHeight, { fit: "contain", background: SPLASH_BG })
    .flatten({ background: badge ? "#b8924f" : SPLASH_BG })
    .png()
    .toBuffer();

  const offsetX = Math.round((size - houseWidth) / 2);
  const offsetY = Math.round((size - houseHeight) / 2);

  return sharp(bg)
    .composite([{ input: house, top: offsetY, left: offsetX }])
    .flatten({ background: badge ? "#b8924f" : SPLASH_BG })
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();
}

const iconOutputs = [
  { out: "icon-152.png", size: 152 },
  { out: "icon-167.png", size: 167 },
  { out: "icon-180.png", size: 180 },
  { out: "icon-192.png", size: 192 },
  { out: "icon-512.png", size: 512 },
  { out: "icon-512-maskable.png", size: 512, maskable: true },
  { out: "badge-72.png", size: 72, badge: true },
];

for (const item of iconOutputs) {
  const buf = await composeIcon(item.size, { maskable: item.maskable, badge: item.badge });
  await sharp(buf).toFile(path.join(iconsDir, item.out));
  console.log(`Wrote ${path.join(iconsDir, item.out)}`);
}

async function createSplash(width, height) {
  const iconSize = Math.round(Math.min(width, height) * 0.34);
  const houseMeta = await sharp(houseSource).metadata();
  const houseAspect = (houseMeta.width ?? 1) / (houseMeta.height ?? 1);
  const houseWidth = houseAspect >= 1 ? iconSize : Math.round(iconSize * houseAspect);
  const houseHeight = houseAspect >= 1 ? Math.round(iconSize / houseAspect) : iconSize;

  const house = await sharp(houseSource)
    .resize(houseWidth, houseHeight, { fit: "contain", background: SPLASH_BG })
    .flatten({ background: SPLASH_BG })
    .png()
    .toBuffer();

  const logoWidth = Math.round(width * 0.62);
  const logoHeight = Math.max(1, Math.round(logoWidth * (250 / 1024)));
  const banner = await sharp(bannerLogoPath).resize(logoWidth, logoHeight, { fit: "inside" }).png().toBuffer();
  const bannerMeta = await sharp(banner).metadata();

  const bannerY = Math.round(height * 0.36);
  const bannerX = Math.round((width - (bannerMeta.width ?? logoWidth)) / 2);
  const houseY = bannerY - houseHeight - Math.round(height * 0.04);
  const houseX = Math.round((width - houseWidth) / 2);

  return sharp({
    create: { width, height, channels: 3, background: SPLASH_BG },
  })
    .composite([
      { input: house, top: Math.max(0, houseY), left: houseX },
      { input: banner, top: bannerY, left: bannerX },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

const splashOutputs = [
  { file: "launch-1170x2532.png", width: 1170, height: 2532 },
  { file: "launch-1284x2778.png", width: 1284, height: 2778 },
  { file: "launch-750x1334.png", width: 750, height: 1334 },
];

for (const splash of splashOutputs) {
  const buf = await createSplash(splash.width, splash.height);
  await sharp(buf).toFile(path.join(splashDir, splash.file));
  console.log(`Wrote ${path.join(splashDir, splash.file)}`);
}

// ── Favicon (32×32 and 16×16) — house only, transparent background ───────────
async function composeFavicon(size) {
  const houseMeta = await sharp(faviconHouseSource).metadata();
  const houseAspect = (houseMeta.width ?? 1) / (houseMeta.height ?? 1);
  const padding = Math.max(1, Math.round(size * 0.06));
  const maxDim = size - padding * 2;
  const houseWidth = houseAspect >= 1 ? maxDim : Math.round(maxDim * houseAspect);
  const houseHeight = houseAspect >= 1 ? Math.round(maxDim / houseAspect) : maxDim;

  const house = await sharp(faviconHouseSource)
    .resize(houseWidth, houseHeight, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const offsetX = Math.round((size - houseWidth) / 2);
  const offsetY = Math.round((size - houseHeight) / 2);

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: house, top: offsetY, left: offsetX }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

const favicon32 = await composeFavicon(32);
await sharp(favicon32).toFile(path.join(publicDir, "favicon-32x32.png"));
console.log(`Wrote ${path.join(publicDir, "favicon-32x32.png")}`);

const favicon16 = await composeFavicon(16);
await sharp(favicon16).toFile(path.join(publicDir, "favicon-16x16.png"));
console.log(`Wrote ${path.join(publicDir, "favicon-16x16.png")}`);

// 180×180 Apple Touch Icon for the main site (same as admin)
await sharp(await composeIcon(180)).toFile(path.join(publicDir, "apple-touch-icon.png"));
console.log(`Wrote ${path.join(publicDir, "apple-touch-icon.png")}`);

console.log("Done — PWA icons + favicons from pwa-house-source.png");
