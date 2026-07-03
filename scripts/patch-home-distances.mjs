import fs from "node:fs";
import path from "node:path";

const genDir = path.join(process.cwd(), "shared/locales/generated");

for (const locale of fs.readdirSync(genDir)) {
  const villaPath = path.join(genDir, locale, "villa.json");
  const homePath = path.join(genDir, locale, "home.json");
  if (!fs.existsSync(villaPath) || !fs.existsSync(homePath)) continue;

  const villa = JSON.parse(fs.readFileSync(villaPath, "utf8"));
  if (!villa.distances) continue;

  const home = JSON.parse(fs.readFileSync(homePath, "utf8"));
  home.distances = villa.distances;
  fs.writeFileSync(homePath, `${JSON.stringify(home, null, 2)}\n`);
  console.log(`[patch] home.distances ← villa.distances (${locale})`);
}
