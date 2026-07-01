/**
 * Generate PNG PWA icons from SVG sources.
 * Usage: node scripts/generate-admin-pwa-icons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const iconsDir = path.resolve("client/public/admin/icons");
const appIcon = path.join(iconsDir, "icon-512.svg");
const badgeIcon = path.join(iconsDir, "badge-72.svg");

const outputs = [
  { src: appIcon, out: "icon-180.png", size: 180 },
  { src: appIcon, out: "icon-192.png", size: 192 },
  { src: appIcon, out: "icon-512.png", size: 512 },
  { src: appIcon, out: "icon-512-maskable.png", size: 512, maskable: true },
  { src: badgeIcon, out: "badge-72.png", size: 72 },
];

for (const item of outputs) {
  let pipeline = sharp(item.src).resize(item.size, item.size);

  if (item.maskable) {
    const inner = Math.round(item.size * 0.8);
    const padding = Math.round((item.size - inner) / 2);
    const innerBuf = await sharp(item.src).resize(inner, inner).png().toBuffer();
    pipeline = sharp({
      create: {
        width: item.size,
        height: item.size,
        channels: 4,
        background: "#f8f6f2",
      },
    }).composite([{ input: innerBuf, top: padding, left: padding }]);
  }

  const outPath = path.join(iconsDir, item.out);
  await pipeline.png({ compressionLevel: 9 }).toFile(outPath);
  console.log(`Wrote ${outPath}`);
}
