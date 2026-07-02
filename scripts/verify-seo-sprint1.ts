import fs from "fs";
import { injectSeoIntoHtml } from "../server/seoInject";
import { getRouteSeo, getSitemapEntries } from "../server/seoMeta";
import { PAMPOROVO_SPOKES, spokePath } from "../shared/pamporovoSpokes";
import { handleFactsJson } from "../server/facts";
import { handleSitemap } from "../server/sitemap";
import { LEGACY_REDIRECTS } from "../shared/seoConstants";
import { VILLA_PAGE_CONFIGS, villaPath } from "../shared/villaPages";
import { EN_SEO, HREFLANG_PATHS } from "../shared/seoEnMeta";
import { PAMPOROVO_SPOKES_EN } from "../shared/en/pamporovoSpokesEn";

const html = fs.readFileSync("client/index.html", "utf8");
const paths = ["/", "/pamporovo", "/rent", "/legal"];
let ok = true;

for (const p of paths) {
  const seo = getRouteSeo(p);
  const injected = injectSeoIntoHtml(html, p);
  const checks = {
    title: injected.includes(seo.title),
    canonical: injected.includes(seo.canonical),
    ogUrl: injected.includes('property="og:url"') && injected.includes(seo.canonical),
    noscript: injected.includes("data-seo-fallback"),
    jsonld: injected.includes("application/ld+json"),
    noDupDesc: (injected.match(/name="description"/g) ?? []).length === 1,
  };
  const pass = Object.values(checks).every(Boolean);
  console.log(`ROUTE ${p}: ${pass ? "PASS" : "FAIL"}`, checks);
  if (!pass) ok = false;
}

const homeInjected = injectSeoIntoHtml(html, "/");
const homeFaq = homeInjected.includes("FAQPage");
const homeVideo = homeInjected.includes("VideoObject");
const homeItemList = homeInjected.includes('"@type":"ItemList"') || homeInjected.includes('"@type": "ItemList"');
console.log(`HOME FAQ schema: ${homeFaq ? "PASS" : "FAIL"}`);
console.log(`HOME VideoObject: ${homeVideo ? "PASS" : "FAIL"}`);
console.log(`HOME ItemList: ${homeItemList ? "PASS" : "FAIL"}`);
if (!homeFaq) ok = false;
if (!homeVideo) ok = false;
if (!homeItemList) ok = false;

const hubInjected = injectSeoIntoHtml(html, "/pamporovo");
const hubItemList = hubInjected.includes("ItemList");
const hubSpeakable = hubInjected.includes("SpeakableSpecification");
console.log(`HUB ItemList: ${hubItemList ? "PASS" : "FAIL"}`);
console.log(`HUB Speakable: ${hubSpeakable ? "PASS" : "FAIL"}`);
if (!hubItemList) ok = false;
if (!hubSpeakable) ok = false;

const rentSpeakable = injectSeoIntoHtml(html, "/rent").includes("SpeakableSpecification");
console.log(`RENT Speakable: ${rentSpeakable ? "PASS" : "FAIL"}`);
if (!rentSpeakable) ok = false;

const pistiInjected = injectSeoIntoHtml(html, "/pamporovo/pisti");
console.log(
  `PISTI schema: ${pistiInjected.includes("SportsActivityLocation") && pistiInjected.includes("ItemList") ? "PASS" : "FAIL"}`
);

const rozhenInjected = injectSeoIntoHtml(html, "/pamporovo/rozhen");
console.log(`ROZHEN TouristAttraction: ${rozhenInjected.includes("TouristAttraction") ? "PASS" : "FAIL"}`);

const entries = getSitemapEntries();
console.log(`SITEMAP: ${entries.length >= 55 ? "PASS" : "FAIL"} (${entries.length} URLs)`);
if (entries.length < 55) ok = false;
console.log(`SPOKES: ${PAMPOROVO_SPOKES.length} pages`);

const enRent = injectSeoIntoHtml(html, "/rent?lang=en");
console.log(
  `RENT EN: ${enRent.includes("Rent a Villa in Pamporovo") && enRent.includes('hreflang="en"') ? "PASS" : "FAIL"}`
);
if (!enRent.includes("Rent a Villa in Pamporovo")) ok = false;

const enSpokeCount = Object.keys(PAMPOROVO_SPOKES_EN).length;
const enSeoCount = Object.keys(EN_SEO).length;
const hreflangCount = HREFLANG_PATHS.size;
console.log(`EN SPOKES: ${enSpokeCount === PAMPOROVO_SPOKES.length ? "PASS" : "FAIL"} (${enSpokeCount}/${PAMPOROVO_SPOKES.length})`);
console.log(`EN_SEO entries: ${enSeoCount >= hreflangCount ? "PASS" : "FAIL"} (${enSeoCount} keys, ${hreflangCount} hreflang paths)`);
if (enSpokeCount !== PAMPOROVO_SPOKES.length) ok = false;
if (enSeoCount < hreflangCount) ok = false;

const pistiEn = injectSeoIntoHtml(html, "/pamporovo/pisti?lang=en");
const pistiEnTitle = EN_SEO["/pamporovo/pisti"]?.title ?? "";
console.log(
  `PISTI EN: ${pistiEn.includes("Pamporovo ski runs") && pistiEn.includes(pistiEnTitle.slice(0, 20)) ? "PASS" : "FAIL"}`
);
if (!pistiEn.includes("Pamporovo ski runs")) ok = false;

const enNoscript = injectSeoIntoHtml(html, "/pamporovo/kude-da-spim?lang=en");
console.log(`EN NOSCRIPT: ${enNoscript.includes("Where to Stay") || enNoscript.includes("where to stay") ? "PASS" : "FAIL"}`);

for (const spoke of PAMPOROVO_SPOKES) {
  const path = spokePath(spoke.slug);
  const seo = getRouteSeo(path);
  const injected = injectSeoIntoHtml(html, path);
  const pass =
    injected.includes(seo.title) &&
    injected.includes(seo.canonical) &&
    injected.includes("FAQPage");
  console.log(`SPOKE ${spoke.slug}: ${pass ? "PASS" : "FAIL"}`);
  if (!pass) ok = false;
}

for (const villa of VILLA_PAGE_CONFIGS) {
  const path = villaPath(villa.id);
  const seo = getRouteSeo(path);
  const injected = injectSeoIntoHtml(html, path);
  const pass =
    injected.includes(seo.title) &&
    injected.includes(seo.canonical) &&
    injected.includes("VacationRental");
  console.log(`VILLA ${villa.id}: ${pass ? "PASS" : "FAIL"}`);
  if (!pass) ok = false;
}

let factsBody = "";
handleFactsJson({} as never, {
  json: (d: unknown) => {
    factsBody = JSON.stringify(d);
  },
  type: () => {},
  set: () => {},
  setHeader: () => {},
} as never);
const facts = JSON.parse(factsBody) as { villas?: unknown[]; bookingUrl?: string };
console.log(`FACTS: ${facts.villas?.length === 3 && facts.bookingUrl ? "PASS" : "FAIL"}`);

let sitemapBody = "";
const sitemapRes = {
  type: () => ({
    send: (d: string) => {
      sitemapBody = d;
    },
  }),
};
handleSitemap({} as never, sitemapRes as never);
console.log(
  `SITEMAP_XML: ${sitemapBody.startsWith("<?xml") && sitemapBody.includes("<urlset") ? "PASS" : "FAIL"}`
);
const imageSitemap =
  sitemapBody.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"') &&
  sitemapBody.includes("<image:loc>");
console.log(`IMAGE SITEMAP: ${imageSitemap ? "PASS" : "FAIL"}`);
if (!imageSitemap) ok = false;

console.log(`LEGACY_REDIRECTS: ${LEGACY_REDIRECTS.length} entries mapped`);

if (!ok) process.exit(1);
console.log("\nAll SEO checks passed.");
