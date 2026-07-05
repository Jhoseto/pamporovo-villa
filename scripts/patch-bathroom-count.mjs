/**
 * Patch generated locale JSON: 2 bathrooms → 1 bathroom per villa.
 * Run after updating BG sources when DeepL sync is unavailable.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const GENERATED = join(ROOT, "shared/locales/generated");

/** Longer phrases first to avoid partial replacements. */
const REPLACEMENTS = [
  // English
  [/two bathrooms/gi, "one bathroom"],
  [/2 bedrooms, 2 bathrooms/g, "2 bedrooms, 1 bathroom"],
  [/2 bedrooms \+ 2 bathrooms/g, "2 bedrooms + 1 bathroom"],
  [/2 bathrooms with hot water/g, "1 bathroom with hot water"],
  [/2 bathrooms/g, "1 bathroom"],
  // Bulgarian (if any slip through)
  [/две бани/g, "една баня"],
  [/2 спални \+ 2 бани/g, "2 спални + 1 баня"],
  [/2 спални, 2 бани/g, "2 спални, 1 баня"],
  [/2 бани с топла вода/g, "1 баня с топла вода"],
  [/2 бани/g, "1 баня"],
  // German
  [/2 Schlafzimmer \+ 2 Badezimmer/g, "2 Schlafzimmer + 1 Badezimmer"],
  [/2 Schlafzimmer, 2 Badezimmer/g, "2 Schlafzimmer, 1 Badezimmer"],
  [/2 Badezimmer mit Warmwasser/g, "1 Badezimmer mit Warmwasser"],
  [/2 Badezimmer/g, "1 Badezimmer"],
  // French
  [/2 chambres \+ 2 salles de bains/g, "2 chambres + 1 salle de bains"],
  [/2 chambres, 2 salles de bains/g, "2 chambres, 1 salle de bains"],
  [/2 salles de bains avec eau chaude/g, "1 salle de bains avec eau chaude"],
  [/2 salles de bains/g, "1 salle de bains"],
  // Spanish
  [/2 dormitorios, 2 baños/g, "2 dormitorios, 1 baño"],
  [/2 baños con agua caliente/g, "1 baño con agua caliente"],
  [/2 baños/g, "1 baño"],
  // Italian (common DeepL patterns)
  [/2 camere da letto, 2 bagni/g, "2 camere da letto, 1 bagno"],
  [/2 bagni/g, "1 bagno"],
  // Dutch
  [/2 slaapkamers \+ 2 badkamers/g, "2 slaapkamers + 1 badkamer"],
  [/2 slaapkamers, 2 badkamers/g, "2 slaapkamers, 1 badkamer"],
  [/2 badkamers met warm water/g, "1 badkamer met warm water"],
  [/2 badkamers/g, "1 badkamer"],
  // Polish
  [/2 sypialnie \+ 2 łazienki/g, "2 sypialnie + 1 łazienka"],
  [/2 sypialnie, 2 łazienki/g, "2 sypialnie, 1 łazienka"],
  [/2 łazienki z ciepłą wodą/g, "1 łazienka z ciepłą wodą"],
  [/2 łazienki/g, "1 łazienka"],
  // Hungarian
  [/2 hálószoba \+ 2 fürdőszoba/g, "2 hálószoba + 1 fürdőszoba"],
  [/2 hálószoba, 2 fürdőszoba/g, "2 hálószoba, 1 fürdőszoba"],
  [/2 fürdőszoba meleg vízzel/g, "1 fürdőszoba meleg vízzel"],
  [/2 fürdőszobával/g, "1 fürdőszobával"],
  [/2 fürdőszoba/g, "1 fürdőszoba"],
  [/2 fürdőszobával/g, "1 fürdőszobával"],
  // Greek
  [/2 υπνοδωμάτια \+ 2 μπάνια/g, "2 υπνοδωμάτια + 1 μπάνιο"],
  [/2 υπνοδωμάτια, 2 μπάνια/g, "2 υπνοδωμάτια, 1 μπάνιο"],
  [/2 μπάνια με ζεστό νερό/g, "1 μπάνιο με ζεστό νερό"],
  [/2 μπάνια/g, "1 μπάνιο"],
  // Russian
  [/2 спальни, 2 ванные комнаты/g, "2 спальни, 1 ванная комната"],
  [/2 ванные комнаты/g, "1 ванная комната"],
  // Turkish
  [/2 yatak odası, 2 banyo/g, "2 yatak odası, 1 banyo"],
  [/2 banyo/g, "1 banyo"],
  // Romanian
  [/2 dormitoare, 2 băi/g, "2 dormitoare, 1 baie"],
  [/2 băi/g, "1 baie"],
  // Czech
  [/2 ložnice, 2 koupelny/g, "2 ložnice, 1 koupelna"],
  [/2 koupelny/g, "1 koupelna"],
  // Portuguese
  [/2 quartos, 2 casas de banho/g, "2 quartos, 1 casa de banho"],
  [/2 casas de banho/g, "1 casa de banho"],
];

function walkJsonFiles(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkJsonFiles(p, files);
    else if (name.endsWith(".json")) files.push(p);
  }
  return files;
}

let changed = 0;
for (const file of walkJsonFiles(GENERATED)) {
  const original = readFileSync(file, "utf8");
  let text = original;
  for (const [pattern, replacement] of REPLACEMENTS) {
    text = text.replace(pattern, replacement);
  }
  if (text !== original) {
    writeFileSync(file, text, "utf8");
    changed++;
    console.log("patched:", file.replace(ROOT + "\\", "").replace(ROOT + "/", ""));
  }
}

console.log(`Done. ${changed} file(s) updated.`);
