import fs from "fs";

const photosPath = "client/src/data/photos.ts";
const text = fs.readFileSync(photosPath, "utf8");

type PhotoEntry = { path: string; title: string };

const entries: PhotoEntry[] = [];
const lineRe = /src: `\$\{P\}\/([^`]+)`, alt: "([^"]+)"/g;
let match: RegExpExecArray | null;
while ((match = lineRe.exec(text)) !== null) {
  entries.push({ path: `/photos/${match[1]}`, title: match[2] });
}

const genericOnly = /^Pamporovo Villa( — интериор)?$/;
const weak = entries.filter((e) => genericOnly.test(e.title));

console.log(`Photos parsed: ${entries.length}`);
console.log(`Generic alt (needs improvement): ${weak.length}`);
if (weak.length) {
  console.log("\nGeneric alt samples:");
  for (const w of weak.slice(0, 15)) {
    console.log(`  ${w.path} → "${w.title}"`);
  }
  if (weak.length > 15) console.log(`  … and ${weak.length - 15} more`);
}

const hubPaths = new Set(
  fs
    .readFileSync("shared/seoGalleryImages.ts", "utf8")
    .match(/path: "(\/photos\/[^"]+)"/g)
    ?.map((s) => s.replace('path: "', "").replace('"', "")) ?? []
);

const villaOnly = entries.filter((e) => !hubPaths.has(e.path) && e.path.startsWith("/photos/"));
console.log(`\nVilla gallery images not in SEO hub list: ${villaOnly.length}`);

if (process.argv.includes("--check")) {
  let ok = true;
  if (entries.length < 55) {
    console.error("FAIL: expected at least 55 gallery photos");
    ok = false;
  }
  if (weak.length > 20) {
    console.warn(`WARN: ${weak.length} images still have generic alt text`);
  }
  process.exit(ok ? 0 : 1);
}
