/**
 * Generate Open Graph share image (1200×630) with full logo + premium branding.
 * Usage: pnpm og:image
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const publicDir = path.join(root, "client/public");
const logoPath = path.join(publicDir, "logo.png");
const outJpg = path.join(publicDir, "og-image.jpg");
const outWebp = path.join(publicDir, "og-image.webp");

const WIDTH = 1200;
const HEIGHT = 630;

const backgroundCandidates = [
  path.join(publicDir, "photos/hero.webp"),
  path.join(publicDir, "photos/hero.jpg"),
  path.join(publicDir, "photos/pamporovo/hero-winter.webp"),
  path.join(publicDir, "photos/pamporovo/rhodope-panorama.webp"),
  path.join(publicDir, "photos/pamporovo/pamporovo-ski.webp"),
];

const backgroundPath = backgroundCandidates.find((candidate) => fs.existsSync(candidate));

if (!fs.existsSync(logoPath)) {
  console.error("Missing logo.png at client/public/logo.png");
  process.exit(1);
}

function overlaySvg() {
  return Buffer.from(
    `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="vignette" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0f0c08" stop-opacity="0.55"/>
          <stop offset="45%" stop-color="#0f0c08" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#0f0c08" stop-opacity="0.82"/>
        </linearGradient>
        <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#8f6a32" stop-opacity="0"/>
          <stop offset="18%" stop-color="#c9a962"/>
          <stop offset="50%" stop-color="#e8d5a8"/>
          <stop offset="82%" stop-color="#c9a962"/>
          <stop offset="100%" stop-color="#8f6a32" stop-opacity="0"/>
        </linearGradient>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="18" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#vignette)"/>
      <rect x="72" y="72" width="${WIDTH - 144}" height="${HEIGHT - 144}" rx="28" fill="#0a0907" fill-opacity="0.28" stroke="#c9a962" stroke-opacity="0.35" stroke-width="1.5"/>
      <rect x="120" y="518" width="960" height="2" fill="url(#goldLine)" opacity="0.95"/>
      <text x="600" y="552" text-anchor="middle" fill="#f5efe4" font-family="Georgia, 'Times New Roman', serif" font-size="28" letter-spacing="4">3 ВИЛИ ПОД НАЕМ · ПАМПОРОВО</text>
      <text x="600" y="586" text-anchor="middle" fill="#c9a962" font-family="Georgia, 'Times New Roman', serif" font-size="22" letter-spacing="6">pamporovovilla.com</text>
    </svg>`,
  );
}

async function buildBackground() {
  if (backgroundPath) {
    return sharp(backgroundPath)
      .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" })
      .blur(2)
      .modulate({ brightness: 0.72, saturation: 0.88 })
      .toBuffer();
  }

  return sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 3,
      background: { r: 18, g: 16, b: 12 },
    },
  })
    .jpeg()
    .toBuffer();
}

const logoMeta = await sharp(logoPath).metadata();
const logoTargetWidth = Math.min(WIDTH - 160, Math.round(WIDTH * 0.78));
const logoTargetHeight = Math.round((logoMeta.height / logoMeta.width) * logoTargetWidth);
const logoTop = Math.round((HEIGHT - logoTargetHeight) / 2 - 36);

const logoBuffer = await sharp(logoPath)
  .resize(logoTargetWidth, logoTargetHeight, { fit: "inside" })
  .png()
  .toBuffer();

const background = await buildBackground();

const composed = await sharp(background)
  .composite([
    { input: overlaySvg(), top: 0, left: 0 },
    {
      input: logoBuffer,
      top: logoTop,
      left: Math.round((WIDTH - logoTargetWidth) / 2),
    },
  ])
  .jpeg({ quality: 90, mozjpeg: true })
  .toBuffer();

await sharp(composed).toFile(outJpg);
await sharp(composed).webp({ quality: 88 }).toFile(outWebp);

const stats = fs.statSync(outJpg);
console.log(`OG image: ${outJpg} (${Math.round(stats.size / 1024)} KB)`);
console.log(`OG image: ${outWebp}`);
if (backgroundPath) {
  console.log(`Background: ${path.relative(root, backgroundPath)}`);
} else {
  console.log("Background: solid fallback (no hero photo found)");
}
