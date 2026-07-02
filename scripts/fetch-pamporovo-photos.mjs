/**
 * Curated Wikimedia Commons photos for /pamporovo — exact file titles
 * to avoid wrong search matches. Converts to optimized WebP.
 *
 * Usage: node scripts/fetch-pamporovo-photos.mjs [slug ...]
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.resolve(import.meta.dirname, "..", "client", "public", "photos", "pamporovo");
const RAW_DIR = path.resolve(import.meta.dirname, "..", ".photo-cache");
const TARGET_WIDTH = 1600;
const WEBP_QUALITY = 72;

/** slug -> exact Commons file title */
const CURATED = {
  "hero-winter": "Pamporovo 01.jpg",
  "pamporovo-ski": "Pamporovo 05.jpg",
  "pamporovo-lift": "Pamporovo 07.jpg",
  "snezhanka-tower": "Pamporovo-kula-Snejanka.jpg",
  "pamporovo-summer": "Vruh Snejanka.jpg",
  "smolyan-lakes": "Smolyan Lakes 01.jpg",
  "canyon-waterfalls":
    "Ecopath ``Waterfalls canyon`` in Rhodopa Mountain Smolyan Bulgaria (9913186823).jpg",
  "nevyastata": "Смолян Невястата 2702326413 a0331a0230 o.jpg",
  "orpheus-rocks": "Смолянски езера, Тревисто езеро и Орфееви скали.jpg",
  "shiroka-laka": "Bulgaria Shiroka laka.jpg",
  "rozhen-observatory": "Rozhen Observatory Bulgaria (9912347424).jpg",
  "rozhen-meadows": ".green fields in Rhodope mountain.jpg",
  "wonderful-bridges": "Marvelous Bridges Rhodope Mountains1.jpg",
  "trigrad-gorge": "Road to Trigrad (48891163981).jpg",
  "devils-throat": "Devil's Throat Cave 40.jpg",
  "yagodina-cave": "Yagodina cave P0078.JPG",
  "uhlovitsa-cave": "Uhlovitsa1.jpg",
  "smolyan-town": "Smolyan-Livingston.jpg",
  "gela-village": "Bulgaria Gela 02.jpg",
  "momchilovtsi": "Mom4ilovci ot Dupchov kamuk.jpg",
  "rhodope-panorama": "Rhodope Mountains.JPG",
};

/** Fallback search if curated file missing */
const SEARCH_FALLBACK = {
  "hero-winter": "Pamporovo ski slope snow",
  "pamporovo-ski": "Pamporovo ski resort",
  "pamporovo-lift": "Pamporovo chairlift",
  "rozhen-meadows": "Rozhen Bulgaria meadow",
  "canyon-waterfalls": "Waterfalls canyon Smolyan Bulgaria",
  "wonderful-bridges": "Chudnite mostove Wonderful Bridges",
  "yagodina-cave": "Yagodina cave interior Bulgaria",
  "uhlovitsa-cave": "Uhlovitsa cave Bulgaria",
  "rhodope-panorama": "Rhodope Mountains Bulgaria panorama",
};

const API = "https://commons.wikimedia.org/w/api.php";
const UA = { "User-Agent": "PamporovoVillaSite/1.0 (curated photo fetch)" };

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchWithRetry(url, tries = 5) {
  for (let i = 1; i <= tries; i++) {
    const res = await fetch(url, { headers: UA });
    if (res.status !== 429) return res;
    await sleep(i * 12_000);
  }
  throw new Error("rate limited");
}

async function getBatchFileInfo(titles) {
  if (!titles.length) return new Map();
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    titles: titles.map(t => (t.startsWith("File:") ? t : `File:${t}`)).join("|"),
    prop: "imageinfo",
    iiprop: "url|size|extmetadata|mime",
    iiurlwidth: String(TARGET_WIDTH * 1.25),
  });
  const res = await fetchWithRetry(`${API}?${params}`);
  const json = await res.json();
  const out = new Map();
  for (const page of Object.values(json?.query?.pages ?? {})) {
    const info = page.imageinfo?.[0];
    if (!info) continue;
    const meta = info.extmetadata ?? {};
    out.set(page.title, {
      title: page.title,
      thumbUrl: info.thumburl || info.url,
      width: info.width,
      height: info.height,
      license: meta.LicenseShortName?.value ?? "",
      artist: (meta.Artist?.value ?? "").replace(/<[^>]+>/g, "").trim(),
    });
  }
  return out;
}

async function getFileInfo(title) {
  const fileTitle = title.startsWith("File:") ? title : `File:${title}`;
  const batch = await getBatchFileInfo([fileTitle]);
  return batch.get(fileTitle) ?? null;
}

async function searchBest(query) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `filetype:bitmap ${query}`,
    gsrnamespace: "6",
    gsrlimit: "12",
    prop: "imageinfo",
    iiprop: "url|size|extmetadata|mime",
    iiurlwidth: String(TARGET_WIDTH * 1.25),
  });
  const res = await fetchWithRetry(`${API}?${params}`);
  const json = await res.json();
  const pages = Object.values(json?.query?.pages ?? {})
    .map(p => {
      const info = p.imageinfo?.[0];
      if (!info) return null;
      const meta = info.extmetadata ?? {};
      return {
        title: p.title,
        index: p.index ?? 999,
        width: info.width,
        height: info.height,
        mime: info.mime,
        thumbUrl: info.thumburl || info.url,
        license: meta.LicenseShortName?.value ?? "",
        artist: (meta.Artist?.value ?? "").replace(/<[^>]+>/g, "").trim(),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.index - b.index);

  return (
    pages.find(p => p.mime === "image/jpeg" && p.width >= 1400 && p.width > p.height) ??
    pages.find(p => p.mime === "image/jpeg" && p.width >= 1000) ??
    pages[0] ??
    null
  );
}

async function download(url) {
  const res = await fetchWithRetry(url);
  if (!res.ok) throw new Error(`download ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function processImage(slug, buf) {
  const outPath = path.join(OUT_DIR, `${slug}.webp`);
  let pipeline = sharp(buf).rotate(); // auto EXIF orientation

  // Observatory photo often uploaded sideways
  if (slug === "rozhen-observatory") {
    pipeline = pipeline.rotate(90);
  }

  await pipeline
    .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toFile(outPath);

  return Math.round(fs.statSync(outPath).size / 1024);
}

async function fetchOne(slug, preloaded) {
  let info = null;
  const curated = CURATED[slug];
  if (curated) {
    const fileTitle = curated.startsWith("File:") ? curated : `File:${curated}`;
    info = preloaded?.get(fileTitle) ?? null;
    if (!info) console.warn(`  curated miss: ${curated}`);
  }
  if (!info && SEARCH_FALLBACK[slug]) {
    info = await searchBest(SEARCH_FALLBACK[slug]);
  }
  if (!info) {
    console.warn(`[skip] ${slug}: no source`);
    return null;
  }

  const rawPath = path.join(RAW_DIR, `${slug}.jpg`);
  fs.mkdirSync(RAW_DIR, { recursive: true });
  const buf = await download(info.thumbUrl);
  fs.writeFileSync(rawPath, buf);

  const kb = await processImage(slug, buf);
  console.log(`[ok] ${slug}.webp (${kb} KB) <- ${info.title} [${info.license}]`);
  return { file: info.title, license: info.license, artist: info.artist };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const only = process.argv.slice(2);
  const slugs = only.length ? only : Object.keys(CURATED);

  const creditsPath = path.join(OUT_DIR, "credits.json");
  const credits = fs.existsSync(creditsPath)
    ? JSON.parse(fs.readFileSync(creditsPath, "utf8"))
    : {};

  const curatedTitles = slugs.map(slug => CURATED[slug]).filter(Boolean);
  console.log(`Resolving ${curatedTitles.length} curated files (1 API call)...`);
  await sleep(8000);
  const preloaded = await getBatchFileInfo(curatedTitles);

  for (const slug of slugs) {
    await sleep(2000);
    try {
      const meta = await fetchOne(slug, preloaded);
      if (meta) {
        credits[slug] = meta;
        fs.writeFileSync(creditsPath, JSON.stringify(credits, null, 2));
      }
    } catch (e) {
      console.error(`[err] ${slug}: ${e.message}`);
    }
  }
  console.log("Done.");
}

main();
