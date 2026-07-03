/**
 * Live production verification for pamporovovilla.com
 * Run: pnpm exec tsx scripts/verify-live-production.ts
 */

const BASE = process.env.LIVE_BASE_URL ?? "https://pamporovovilla.com";
const TIMEOUT_MS = 25_000;

type Result = { name: string; status: "PASS" | "FAIL"; detail?: string };

const results: Result[] = [];
let pass = 0;
let fail = 0;

function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    pass++;
    results.push({ name, status: "PASS", detail: detail || undefined });
  } else {
    fail++;
    results.push({ name, status: "FAIL", detail: detail || undefined });
  }
}

async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchText(url: string, init: RequestInit = {}) {
  const res = await fetchWithTimeout(url, init);
  const text = await res.text();
  return { res, text };
}

async function main() {
  console.log(`\n=== Live production tests: ${BASE} ===\n`);

  // --- Static assets ---
  for (const path of ["/robots.txt", "/llms.txt", "/llms-en.txt", "/ai.txt", "/facts.json", "/sitemap.xml"]) {
    const { res, text } = await fetchText(`${BASE}${path}`);
    check(`GET ${path}`, res.status === 200, `status=${res.status}`);

    if (path === "/facts.json") {
      const j = JSON.parse(text) as {
        villas?: unknown[];
        units?: number;
        languages?: string[];
        googleReviewUrl?: string;
        googleMapsUrl?: string;
      };
      check("facts.json villas=3", j.villas?.length === 3, `units=${j.units}`);
      check("facts.json languages bg+en", Boolean(j.languages?.includes("bg") && j.languages?.includes("en")));
      check("facts.json languages 15 total", j.languages?.length === 15, `count=${j.languages?.length}`);
      check("facts.json googleReviewUrl", Boolean(j.googleReviewUrl?.includes("google.com/maps")));
      check("facts.json googleMapsUrl", Boolean(j.googleMapsUrl?.includes("google.com/maps")));
    }
    if (path === "/sitemap.xml") {
      const urlCount = (text.match(/<loc>/g) ?? []).length;
      check("sitemap >= 600 URLs", urlCount >= 600, `count=${urlCount}`);
      check("sitemap has lang=en URLs", text.includes("lang=en"));
      check("sitemap has lang=de URLs", text.includes("lang=de"));
      check("sitemap image namespace", text.includes("xmlns:image"));
    }
    if (path === "/llms-en.txt") check("llms-en rent EN URL", text.includes("/rent?lang=en"));
    if (path === "/llms.txt") {
      check("llms.txt links llms-en", text.includes("llms-en"));
      check("llms.txt H1", /^# /m.test(text));
      check("llms.txt markdown links", /\[[^\]]+\]\(https:\/\//.test(text));
    }
    if (path === "/llms-en.txt") {
      check("llms-en markdown links", /\[[^\]]+\]\(https:\/\//.test(text));
    }
    if (path === "/ai.txt") check("ai.txt rent_url_en", text.includes("rent_url_en="));
  }

  const { res: factsEnRes, text: factsEnText } = await fetchText(`${BASE}/facts.json?lang=en`);
  check("GET /facts.json?lang=en", factsEnRes.status === 200);
  try {
    const j = JSON.parse(factsEnText) as { lang?: string; rentPage?: string };
    check("facts EN lang=en", j.lang === "en");
    check("facts EN rentPage", Boolean(j.rentPage?.includes("lang=en")));
  } catch {
    check("facts EN JSON parse", false);
  }

  // --- Legacy redirects (from shared/seoConstants) ---
  const legacyRedirects: Array<{ from: string; expectInLocation: string }> = [
    { from: "/vila-pamporovo", expectInLocation: "/#about" },
    { from: "/bg/ceni", expectInLocation: "/#pricing" },
    { from: "/bg/kontakt", expectInLocation: "/#contact" },
    { from: "/bg/politika", expectInLocation: "/legal" },
  ];

  for (const { from, expectInLocation } of legacyRedirects) {
    const res = await fetchWithTimeout(`${BASE}${from}`, { redirect: "manual" });
    const loc = res.headers.get("location") ?? "";
    check(
      `redirect ${from}`,
      res.status >= 301 && res.status <= 308 && loc.includes(expectInLocation),
      `${res.status} -> ${loc}`
    );
  }

  // --- HTML SEO pages ---
  const pages: Array<{ path: string; must: string[]; en?: boolean; hreflang?: boolean }> = [
    { path: "/", must: ["Pamporovo Villa", "application/ld+json", "FAQPage", "data-seo-fallback"], hreflang: true },
    { path: "/?lang=en", must: ["Private Villas", 'hreflang="en"', "en_GB"], en: true, hreflang: true },
    { path: "/rent", must: ["Наем на вила", "SpeakableSpecification"], hreflang: true },
    {
      path: "/rent?lang=en",
      must: ["Rent a Villa in Pamporovo", 'hreflang="en"', "Rent a villa in Pamporovo"],
      en: true,
      hreflang: true,
    },
    { path: "/pamporovo", must: ["пълен гид", "ItemList", "TouristDestination"], hreflang: true },
    {
      path: "/pamporovo?lang=en",
      must: ["Pamporovo Travel Guide", 'hreflang="en"', "complete resort"],
      en: true,
      hreflang: true,
    },
    { path: "/pamporovo/pisti", must: ["писти", "SportsActivityLocation", "FAQPage"], hreflang: true },
    {
      path: "/pamporovo/pisti?lang=en",
      must: ["Pamporovo ski runs", 'hreflang="en"', "night skiing"],
      en: true,
      hreflang: true,
    },
    { path: "/pamporovo/kude-da-spim", must: ["FAQPage"], hreflang: true },
    { path: "/pamporovo/kude-da-spim?lang=en", must: ["Where to Stay", 'hreflang="en"'], en: true, hreflang: true },
    { path: "/villa/villa-1", must: ["Вила 1", "VacationRental"], hreflang: true },
    {
      path: "/villa/villa-1?lang=en",
      must: ["Villa 1", 'hreflang="en"', "Rent Villa 1"],
      en: true,
      hreflang: true,
    },
    { path: "/villa/villa-deluxe?lang=en", must: ["Villa Deluxe", 'hreflang="en"'], en: true, hreflang: true },
    { path: "/pamporovo/rozhen", must: ["TouristAttraction"], hreflang: true },
    { path: "/pamporovo/chepelare?lang=en", must: ['hreflang="en"', "Chepelare"], en: true, hreflang: true },
    { path: "/legal", must: ["Правна информация"], hreflang: false },
  ];

  for (const p of pages) {
    const { res, text } = await fetchText(`${BASE}${p.path}`);
    check(`HTTP ${p.path}`, res.status === 200, `status=${res.status}`);
    for (const m of p.must) {
      check(`${p.path} has "${m.slice(0, 50)}"`, text.includes(m), text.includes(m) ? "" : "missing");
    }
    const descCount = (text.match(/name="description"/g) ?? []).length;
    check(`${p.path} single description meta`, descCount === 1, `count=${descCount}`);
    check(`${p.path} noscript fallback`, text.includes("data-seo-fallback"));
    if (p.en) {
      check(`${p.path} canonical lang=en`, text.includes('rel="canonical"') && text.includes("lang=en"));
    }
    if (p.hreflang) {
      check(`${p.path} hreflang bg`, text.includes('hreflang="bg"'));
      check(`${p.path} hreflang en`, text.includes('hreflang="en"'));
    }
  }

  // --- Sample all 41 spokes exist (HTTP 200) ---
  const spokeSlugs = [
    "pisti", "kude-da-spim", "hotel-vs-vila", "naem-vila", "vila-s-kamina", "naem-zima", "lato", "zima",
    "yagodinska-pechtera", "shiroka-laka", "eco-pateki", "kak-da-stignem", "vila-za-dvoika", "vila-za-grupa",
    "naem-lqto", "rajkovski-livadi", "naem-ot-110-evro", "semeen-otpusk", "praznici", "team-building",
    "dalga-pochivka", "oferti", "liftove", "rozhen", "chudnite-mostove", "dyavolskoto-garlo",
    "trigradsko-zhdrelo", "uhlovitsa", "kanion-vodopadi", "smolyanski-ezera", "nevyastata", "orpheus-rocks",
    "momchilovtsi", "gela", "smolyan", "nochno-karane", "stenata", "vruh-snezhanka", "ski-karti",
    "bunovsko-zhdrelo", "chepelare",
  ];
  let spokeOk = 0;
  for (const slug of spokeSlugs) {
    const { res } = await fetchText(`${BASE}/pamporovo/${slug}`);
    if (res.status === 200) spokeOk++;
  }
  check(`all ${spokeSlugs.length} spokes HTTP 200`, spokeOk === spokeSlugs.length, `${spokeOk}/${spokeSlugs.length}`);

  // --- OG images for sample spokes ---
  for (const og of ["/og/spokes/pisti.jpg", "/og/spokes/kude-da-spim.jpg", "/og/spokes/rozhen.jpg"]) {
    const res = await fetchWithTimeout(`${BASE}${og}`, { method: "HEAD" });
    check(`OG image ${og}`, res.status === 200, `status=${res.status}`);
  }

  // --- SPA shell still loads ---
  const { text: homeHtml } = await fetchText(`${BASE}/`);
  check("SPA root div", homeHtml.includes('id="root"') || homeHtml.includes('id="app"'));

  console.log(`\n--- Summary: ${pass} passed, ${fail} failed, ${pass + fail} total ---\n`);
  for (const r of results.filter((x) => x.status === "FAIL")) {
    console.log(`FAIL: ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
  }
  if (fail === 0) {
    console.log("All live production checks PASSED.\n");
  } else {
    console.log(`${fail} check(s) FAILED.\n`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Live test runner error:", err);
  process.exit(1);
});
