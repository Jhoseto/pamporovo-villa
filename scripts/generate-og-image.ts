/**
 * Generate Open Graph share images (1200×630).
 * Usage: pnpm og:image
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { PAMPOROVO_SPOKES } from "../shared/pamporovoSpokes";
import { VILLA_PAGE_CONFIGS } from "../shared/villaPages";

const root = path.resolve(import.meta.dirname, "..");
const publicDir = path.join(root, "client/public");
const ogDir = path.join(publicDir, "og");
const spokesDir = path.join(ogDir, "spokes");
const logoPath = path.join(publicDir, "logo.png");

const WIDTH = 1200;
const HEIGHT = 630;

const backgrounds = {
  home: [path.join(publicDir, "photos/hero.webp"), path.join(publicDir, "photos/hero.jpg")],
  pamporovo: [
    path.join(publicDir, "photos/pamporovo/hero-winter.webp"),
    path.join(publicDir, "photos/pamporovo/pamporovo-ski.webp"),
    path.join(publicDir, "photos/pamporovo/rhodope-panorama.webp"),
  ],
  rent: [path.join(publicDir, "photos/hero.webp"), path.join(publicDir, "photos/hero.jpg")],
};

const SKI_SPOKES = new Set([
  "pisti",
  "naem-zima",
  "zima",
  "semeen-otpusk",
  "hotel-vs-vila",
  "naem-vila",
]);

function pickBackground(keys: string[]) {
  for (const key of keys) {
    const found = backgrounds[key as keyof typeof backgrounds]?.find((candidate) =>
      fs.existsSync(candidate)
    );
    if (found) return found;
  }
  return null;
}

function spokeSubtitle(h1: string): string {
  const short = h1.split("—")[0]?.trim() ?? h1;
  return short.length > 52 ? `${short.slice(0, 49)}…` : short;
}

function overlaySvg(subtitle: string, tagline = "pamporovovilla.com", withLogo = true) {
  const logoBlock = withLogo
    ? ""
    : `<text x="600" y="300" text-anchor="middle" fill="#f5efe4" font-family="Georgia, serif" font-size="52" font-weight="bold">PAMPOROVO VILLA</text>`;

  const safeSubtitle = subtitle
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

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
      </defs>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#vignette)"/>
      <rect x="72" y="72" width="${WIDTH - 144}" height="${HEIGHT - 144}" rx="28" fill="#0a0907" fill-opacity="0.28" stroke="#c9a962" stroke-opacity="0.35" stroke-width="1.5"/>
      ${logoBlock}
      <rect x="120" y="518" width="960" height="2" fill="url(#goldLine)" opacity="0.95"/>
      <text x="600" y="552" text-anchor="middle" fill="#f5efe4" font-family="Georgia, 'Times New Roman', serif" font-size="26" letter-spacing="3">${safeSubtitle.toUpperCase()}</text>
      <text x="600" y="586" text-anchor="middle" fill="#c9a962" font-family="Georgia, 'Times New Roman', serif" font-size="22" letter-spacing="6">${tagline}</text>
    </svg>`
  );
}

async function buildBackground(backgroundPath: string | null) {
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

async function composeVariant({
  name,
  backgroundKey,
  subtitle,
  outPath,
  withLogo = true,
}: {
  name: string;
  backgroundKey: string;
  subtitle: string;
  outPath: string;
  withLogo?: boolean;
}) {
  const backgroundPath = pickBackground([backgroundKey]);
  const background = await buildBackground(backgroundPath);

  const composites: sharp.OverlayOptions[] = [
    { input: overlaySvg(subtitle, "pamporovovilla.com", withLogo), top: 0, left: 0 },
  ];

  if (withLogo && fs.existsSync(logoPath)) {
    const logoMeta = await sharp(logoPath).metadata();
    const logoTargetWidth = Math.min(WIDTH - 160, Math.round(WIDTH * 0.72));
    const logoTargetHeight = Math.round(
      ((logoMeta.height ?? 1) / (logoMeta.width ?? 1)) * logoTargetWidth
    );
    const logoTop = Math.round((HEIGHT - logoTargetHeight) / 2 - 48);
    const logoBuffer = await sharp(logoPath)
      .resize(logoTargetWidth, logoTargetHeight, { fit: "inside" })
      .png()
      .toBuffer();
    composites.push({
      input: logoBuffer,
      top: logoTop,
      left: Math.round((WIDTH - logoTargetWidth) / 2),
    });
  }

  const composed = await sharp(background)
    .composite(composites)
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();

  await fs.promises.mkdir(path.dirname(outPath), { recursive: true });
  await sharp(composed).toFile(outPath);
  const stats = fs.statSync(outPath);
  console.log(`OG ${name}: ${outPath} (${Math.round(stats.size / 1024)} KB)`);
}

if (!fs.existsSync(logoPath)) {
  console.error("Missing logo.png at client/public/logo.png");
  process.exit(1);
}

await composeVariant({
  name: "home",
  backgroundKey: "home",
  subtitle: "3 ВИЛИ ПОД НАЕМ · ПАМПОРОВО",
  outPath: path.join(publicDir, "og-image.jpg"),
});

await composeVariant({
  name: "pamporovo",
  backgroundKey: "pamporovo",
  subtitle: "ПЪЛЕН ГИД ЗА ПАМПОРОВО · 2026",
  outPath: path.join(ogDir, "pamporovo.jpg"),
  withLogo: false,
});

await composeVariant({
  name: "rent",
  backgroundKey: "rent",
  subtitle: "НАЕМ НА ВИЛА · ОТ 110 €/НОЩ",
  outPath: path.join(ogDir, "rent.jpg"),
});

for (const spoke of PAMPOROVO_SPOKES) {
  await composeVariant({
    name: spoke.slug,
    backgroundKey: SKI_SPOKES.has(spoke.slug) ? "pamporovo" : "home",
    subtitle: spokeSubtitle(spoke.h1),
    outPath: path.join(spokesDir, `${spoke.slug}.jpg`),
    withLogo: false,
  });
}

for (const villa of VILLA_PAGE_CONFIGS) {
  await composeVariant({
    name: villa.id,
    backgroundKey: "home",
    subtitle: villa.h1,
    outPath: path.join(ogDir, `${villa.id}.jpg`),
    withLogo: false,
  });
}
