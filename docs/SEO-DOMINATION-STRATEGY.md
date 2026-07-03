# SEO / AEO / GEO / AIO / SXO — Стратегия за доминация

> **Домейн:** `https://pamporovovilla.com` — **LIVE**  
> **Цел:** #1 видимост в България (и EU tourists) за наем на вила в Пампорово, „къде да преспя“, локално търсене и AI citations.  
> **Актив:** Старият сайт вече rank-ва добре — **запазваме и усилваме** Google equity, не започваме от нулата.

---

## 0. Реалността (честно)

| Фактор | Статус |
|--------|--------|
| Същият домейн `pamporovovilla.com` | ✅ Google вече познава бранда |
| Google Business Profile + отзиви | ✅ Най-силният off-site актив |
| Стар Drupal сайт — топ позиции | ✅ Link equity + история на домейна |
| Нов SPA сайт — по-модерен UX | ✅ По-добър за конверсии |
| Техническо SEO на новия сайт | ❌ Почти липсва |
| 301 от стари URL | ❌ **Критичен пропуск** |
| sitemap.xml | ❌ Връща SPA HTML (не е sitemap) |
| Per-route meta за ботове | ❌ Всички URL = един index.html |
| JSON-LD structured data | ❌ Липсва |

**Извод:** Google ви „познава“, но новият сайт **не предава** ranking сигналите правилно. Без Phase 0 (migration) може да загубите позиции за 4–8 седмици. С правилна имплементация — **превъзходите** стария сайт за 2–4 месеца.

---

## 1. Какво Google вече разпознава (запазваме)

### Entity signals (не променяйте!)

| Сигнал | Стойност | Действие |
|--------|----------|----------|
| Домейн | `pamporovovilla.com` | Запазен ✅ |
| Име | Pamporovo Villa / Вила Пампорово | NAP еднакъв навсякъде |
| Телефон | +359 879 501 660 | Идентичен в footer, GBP, JSON-LD |
| Адрес | Райковски ливади, к.к. Пампорово | Идентичен |
| GBP Place ID | `/g/11hz6s597c` | `sameAs` в schema |
| Социални | FB, IG, YouTube | `sameAs` в schema |
| Ключови думи (legacy) | „вила под наем Пампорово“, „Pamporovo Villa“ | Запази в H1, title, FAQ |

### Какво НЕ трябва да се прави

- ❌ Смяна на домейн или бранд име
- ❌ Различен телефон/адрес на сайта vs GBP
- ❌ Изтриване на стари URL без 301
- ❌ `noindex` на homepage по време на migration
- ❌ Дублиране на GBP Review schema на сайта (само site reviews в JSON-LD)

---

## 2. Phase 0 — Migration SEO (ПРИОРИТЕТ #1, Week 1 Day 1)

> **Проблем днес:** `/цени`, `/вила-пампорово`, `/bg/ceni`, `/sitemap.xml` → HTTP 200, но всички връщат **същия SPA homepage**. Google вижда duplicate content + soft 404.

### 2.1 Карта на 301 redirects (задължително)

Имплементирай в `server/_core/redirects.ts` **преди** static catch-all:

| Стар URL (Drupal) | Нов URL | Anchor / секция |
|-------------------|---------|-----------------|
| `/вила-пампорово` | `/` | `#about` |
| `/vila-pamporovo` | `/` | `#about` |
| `/цени` | `/` | `#pricing` |
| `/bg/ceni` | `/` | `#pricing` |
| `/контакт` | `/` | `#contact` |
| `/bg/kontakt` | `/` | `#contact` |
| `/галерия` | `/` | `#gallery` |
| `/оферти` | `/` | `#pricing` (или offers modal) |
| `/политика-на-вила-пампорово` | `/legal` | |
| `/bg/politika` | `/legal` | |
| `/sites/default/files/*` | 410 Gone или CDN mirror | Стари Drupal images — не SPA |

**Нови SEO URL-и (301 от hash-only към real pages):**

| Нов route | Цел |
|-----------|-----|
| `/villa/villa-1` | Long-tail: „вила 1 пампорово“ |
| `/villa/villa-2` | Long-tail |
| `/villa/villa-deluxe` | Long-tail + premium |
| `/pamporovo` | Informational hub (вече съществува) |
| `/legal` | Trust / policies |

### 2.2 Search Console migration checklist

1. Verify `pamporovovilla.com` в [Google Search Console](https://search.google.com/search-console)
2. **URL Inspection** → test `/`, `/pamporovovilla`, стар `/цени` (трябва 301)
3. Submit **нов** `sitemap.xml` (динамичен, не SPA)
4. **Removals** — НЕ махай стари URL; само 301
5. Monitor **Coverage** + **Core Web Vitals** 2 седмици
6. GBP → Website = `https://pamporovovilla.com` (verify match)

### 2.3 Запазване на keyword equity

Старият сайт rank-ва за **единична вила** narrative. Новият е **3 вили** — това е по-силно, но title/H1 трябва да включват и legacy фрази:

- „Pamporovo Villa — 3 вили под наем в Пампорово“
- „Вила под наем · Райковски ливади · до 6 гости“
- FAQ: „Колко вили има Pamporovo Villa?“ → „Три самостоятелни вили…“

---

## 3. Phase 1 — Bot-visible SEO engine (Week 1)

### Архитектура

```
GET /villa/villa-1
  → server/seoMeta.ts (route meta + JSON-LD + noscript)
  → inject в index.html преди </head>
  → sendFile
```

**Файлове:** `server/seoMeta.ts`, `shared/seoConstants.ts`, modify `server/_core/static.ts`

### Per-route meta pack

| Route | Title pattern | og:image |
|-------|---------------|----------|
| `/` | Pamporovo Villa \| 3 вили под наем в Пампорово | `/og-image.jpg` ✅ |
| `/pamporovo` | Пълен гид за Пампорово 2026 \| Pamporovo Villa | `/og/pamporovo.jpg` |
| `/villa/villa-1` | Вила 1 под наем в Пампорово \| от 110 €/нощ | `/og/villa-1.jpg` |
| `/legal` | Политика и правна информация | `/og-image.jpg` |

### Noscript fallback (AIO + SPA fix)

Inject per-route `<noscript>` с 300+ думи видим текст — ChatGPT, Perplexity, Gemini **не изпълняват JS**.

---

## 4. Phase 2 — JSON-LD Structured Data (Week 1–2)

### Homepage graph (7 блока)

1. `LodgingBusiness` — Local Pack candidate
2. `Organization` + `sameAs` (GBP, FB, IG, YT)
3. `WebSite` + `SearchAction`
4. `ItemList` — 3 вили с URL
5. `AggregateRating` — **само** от `customer_reviews` DB (published)
6. `Review[]` — до 5 visible reviews
7. `FAQPage` — 20+ Q&A

### Per villa — `VacationRental` + `Offer`

```json
{
  "@type": "VacationRental",
  "name": "Вила 1 — Pamporovo Villa",
  "numberOfBedrooms": 2,
  "occupancy": { "maxValue": 6 },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "EUR",
    "price": "110",
    "unitText": "NIGHT"
  }
}
```

### /pamporovo — content hub

- `Article` + `TouristDestination`
- `ItemList` — писти, пещери, атракции
- `SpeakableSpecification` — voice search
- `BreadcrumbList`

**Резултат в SERP:** stars, prices, FAQ expandos, sitelinks.

---

## 5. Phase 3 — AEO (Answer Engine Optimization)

### Featured Snippet targets

| Query (BG) | Answer location |
|------------|-----------------|
| колко струва вила в пампорово | FAQ + meta description |
| вила под наем пампорово цени | `/` pricing schema |
| колко писти има в пампорovo | `/pamporovo` fact box |
| къде да спя в пампorovo | FAQ + LodgingBusiness |
| pamporovo villa rental | EN meta + hreflang |

### FAQ секция — 20+ въпроса

Категории: резервация, вили, локация, цени, правила, Пампорovo сезони.

**Правило:** Всяко Q&A = и в UI, и в JSON-LD (identical text).

---

## 6. Phase 4 — GEO (Local Domination)

### Google Business Profile (ВЕЧЕ ИМА ОТЗИВИ)

**Weekly actions:**
- 2–4 нови GBP отзива от гости (SMS/email follow-up)
- GBP Posts — сезонни оферти (ски, лято)
- 20+ снимки sync с gallery
- Q&A в GBP = copy от site FAQ
- Website URL = production domain

### Local Pack keywords (primary)

- pamporovo villa
- вила под наем пампorovo
- настаняване пампorovo
- къща за гости пампorovo
- райковски ливади

### Entity merge

```
Website JSON-LD sameAs → GBP URL
GBP website field → pamporovovilla.com
→ Google Knowledge Graph consolidation
```

---

## 7. Phase 5 — AIO (AI Engine Optimization)

### llms.txt + ai.txt

Machine-readable brand facts за GPTBot, Google-Extended, PerplexityBot:

```
name: Pamporovo Villa
type: vacation_rental (3 units)
location: Pamporovo, Rhodope Mountains, Bulgaria
price_range: 110-180 EUR/night per villa
capacity: 6 guests per villa
contact: +359879501660
website: https://pamporovovilla.com
```

### robots.txt — ALLOW AI crawlers

```
User-agent: GPTBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: PerplexityBot
Allow: /
Sitemap: https://pamporovovilla.com/sitemap.xml
```

### Citation-friendly content

На `/pamporovo` — fact boxes с точни числа (37 km pistes, 1650m, 260+ sunny days).

---

## 8. Phase 6 — Villa Landing Pages (SEO leverage)

**Защо:** 3 URL-а = 3x long-tail surface area vs 1 homepage.

Всяка `/villa/*` page:
- Unique H1 + 300+ думи
- Gallery за вилата
- Pricing + CTA `#booking?villa=...`
- VacationRental schema
- Internal links ↔ `/pamporovo`, `/`, reviews

---

## 9. Phase 7–10 — Technical + SXO + IndexNow

| Phase | Action |
|-------|--------|
| Image SEO | 30+ images in sitemap, keyword alt texts |
| OG per route | 1200×630 for /, /pamporovo, each villa |
| Core Web Vitals | Cache headers, image dimensions, LCP < 2.5s |
| IndexNow | Instant Bing/Copilot indexing on deploy |
| Internal linking | Contextual anchors in body copy |
| Breadcrumbs | UI + BreadcrumbList schema |
| 404 page | Links to /, /pamporovo, /villa/villa-1, #booking |

---

## 10. Keyword Domination Map

### Tier 1 — Money keywords (BG, must win)

| Keyword | Primary page | Support |
|---------|--------------|---------|
| вила под наем пампorovo | `/` + GBP | `/villa/*`, FAQ |
| pamporovo villa | `/` | GBP, sameAs |
| наем вила пампorovo | `/` | schema Offer |
| къща под наем пампorovo | `/` | noscript, FAQ |
| вила пампorovo цени | `/#pricing` → `/` | Offer schema |
| райковски ливади наем | `/` | geo meta, map |

### Tier 2 — Long-tail (villa pages)

- вила 1 пампorovo / villa 1 pamporovo
- вила deluxe пампorovo
- вила с камина пампorovo
- вила с барбекю родопи

### Tier 3 — Informational (AEO, /pamporovo)

- какво да видя в пампorovo
- колко писти има в пампorovo
- най-добрите писти пампorovo
- pamporovo ski guide

### Tier 4 — EU tourists (EN)

- pamporovo villa rental
- holiday home pamporovo bulgaria
- ski chalet pamporovo
- rhodope mountains accommodation

**EN layer:** hreflang + server-side `Accept-Language` meta variants (без full bilingual site).

---

## 11. Off-Site Domination (не код, но 50% от #1)

### Month 1

- [ ] Google Search Console verified + sitemap
- [ ] GBP website URL updated
- [ ] Bing Webmaster Tools + IndexNow
- [ ] TripAdvisor listing (if not exists)
- [ ] 5 directory backlinks (tourism.bg, visitbulgaria.net, smolyan.bg)

### Ongoing

- GBP reviews: target 2/month minimum
- Site reviews: encourage post-stay (schema on site)
- Facebook/Instagram posts → deep links to `/villa/*`
- YouTube video embed (existing `_B1k20hd_yY`) — VideoObject schema
- Seasonal PR: ski season opener, summer hiking guides

### Dual review loop

```
Guest → GBP review → Local Pack ranking
Guest → Site review → SERP stars (JSON-LD)
sameAs entity link → Knowledge Graph merge
```

---

## 12. Implementation Roadmap

### Sprint 1 (Days 1–3) — STOP THE BLEEDING

| # | Task | Impact |
|---|------|--------|
| 1 | 301 redirects от всички стари Drupal URL | 🔴 Critical |
| 2 | Dynamic `sitemap.xml` (не SPA) | 🔴 Critical |
| 3 | `server/seoMeta.ts` + HTML injection | 🔴 Critical |
| 4 | robots.txt + Sitemap line + AI bots | 🟠 High |
| 5 | Canonical + geo meta на всички routes | 🟠 High |

### Sprint 2 (Days 4–7) — STRUCTURED DATA BOMB

| # | Task |
|---|------|
| 6 | JSON-LD full pack (homepage) |
| 7 | FAQ section 20+ Q&A |
| 8 | llms.txt + ai.txt |
| 9 | Search Console submit + URL inspection |

### Sprint 3 (Week 2) — EXPAND SURFACE

| # | Task |
|---|------|
| 10 | Villa landing pages × 3 |
| 11 | OG images per route |
| 12 | Review schema from DB |
| 13 | IndexNow on deploy |

### Sprint 4 (Week 3–4) — OFF-SITE + POLISH

| # | Task |
|---|------|
| 14 | GBP sync + review CTAs on site |
| 15 | hreflang EN layer |
| 16 | Image sitemap + alt audit |
| 17 | Directory backlinks |

---

## 13. KPI Targets

| Metric | Month 1 | Month 3 | Month 6 |
|--------|---------|---------|---------|
| Indexed pages (GSC) | 8+ | 15+ | 25+ |
| „pamporovo villa“ position | Top 5 | Top 3 | **#1** |
| „вила под наем пампorovo“ | Top 10 | Top 5 | **Top 3** |
| GBP Local Pack | Visible | Top 3 | **#1–2** |
| Rich results (FAQ/stars) | Live | Stable | Expanded |
| AI citations (manual check) | llms.txt indexed | Occasional | Regular |
| Organic sessions | Baseline +20% | +50% | +100% |

---

## 14. Какво вече е готово ✅

- Домейн live на JetHost
- Cookie banner + GA4 Consent Mode (`G-6W50FH0F0D`)
- og:image homepage (`/og-image.jpg`)
- GBP съществува + координати в код
- NAP консистентен в `siteContent.ts`
- `/pamporovo` content hub
- 61 оптимизирани снимки
- Reviews система (DB)

---

## 15. Следваща стъпка

**Sprint 4 (off-site + polish)** — виж [`docs/SPRINT4-OFFSITE.md`](./SPRINT4-OFFSITE.md):

1. GBP weekly sync + review follow-up SMS/email  
2. GSC sitemap submit + URL inspection  
3. Directory backlinks (NAP citations)  
4. Deploy + `pnpm seo:verify` + `verify-live-production.ts`

Sprint 1–3 (301, sitemap, JSON-LD, spokes, hreflang) са имплементирани в кода.

---

*Свързан план (Cursor): `full-stack_seo_domination_db8f4205.plan.md`*  
*Последна актуализация: юли 2026 — домейн live*
