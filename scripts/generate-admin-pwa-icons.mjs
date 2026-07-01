/**
 * Generate admin PWA icons from the house mark in logo.png.
 * Usage: pnpm pwa:icons
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const logoPath = path.join(root, "client/public/logo.png");
const iconsDir = path.join(root, "client/public/admin/icons");

fs.mkdirSync(iconsDir, { recursive: true });

const logoMeta = await sharp(logoPath).metadata();
const cropSize = Math.min(logoMeta.height ?? 250, logoMeta.width ?? 1024);

const houseSource = await sharp(logoPath)
  .extract({ left: 0, top: 0, width: cropSize, height: cropSize })
  .png()
  .toBuffer();

await sharp(houseSource).toFile(path.join(iconsDir, "logo-house-source.png"));

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
  const houseScale = badge ? 0.62 : maskable ? 0.64 : 0.72;
  const houseSize = Math.round(size * houseScale);
  const house = await sharp(houseSource).resize(houseSize, houseSize, { fit: "contain" }).png().toBuffer();
  const offset = Math.round((size - houseSize) / 2);

  return sharp(bg)
    .composite([{ input: house, top: offset, left: offset }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

const outputs = [
  { out: "icon-180.png", size: 180 },
  { out: "icon-192.png", size: 192 },
  { out: "icon-512.png", size: 512 },
  { out: "icon-512-maskable.png", size: 512, maskable: true },
  { out: "badge-72.png", size: 72, badge: true },
];

for (const item of outputs) {
  const buf = await composeIcon(item.size, { maskable: item.maskable, badge: item.badge });
  const outPath = path.join(iconsDir, item.out);
  await sharp(buf).toFile(outPath);
  console.log(`Wrote ${outPath}`);
}

// Update SVG fallbacks for dev tools
const houseSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Pamporovo Villa">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f7f4ee"/>
      <stop offset="100%" stop-color="#e4ddd1"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <image href="/admin/icons/logo-house-source.png" x="72" y="72" width="368" height="368"/>
</svg>`;

fs.writeFileSync(path.join(iconsDir, "icon-512.svg"), houseSvg);
fs.writeFileSync(
  path.join(iconsDir, "icon-192.svg"),
  houseSvg.replace('width="512" height="512"', 'width="192" height="192"').replace('rx="96"', 'rx="36"')
);

console.log("Done — house icon extracted from logo.png");
