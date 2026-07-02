import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const heroWebp = path.join(root, "client/public/photos/hero.webp");
const heroMobile = path.join(root, "client/public/photos/hero-mobile.webp");

const meta = await sharp(heroWebp).metadata();
await sharp(heroWebp)
  .resize({ width: 828, withoutEnlargement: true })
  .webp({ quality: 78, effort: 6 })
  .toFile(heroMobile);

const { size } = await import("node:fs/promises").then(fs => fs.stat(heroMobile));
console.log(`hero-mobile.webp: ${meta.width}x${meta.height} → 828w, ${Math.round(size / 1024)} KB`);
