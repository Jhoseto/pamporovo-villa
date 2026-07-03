# SEO Sprint 4 — Off-site + Polish

> **Цел:** Local Pack + review velocity + EN discoverability + image indexing  
> **Сайт:** https://pamporovovilla.com  
> **GBP:** [Pamporovo Villa on Google Maps](https://www.google.com/maps/place/Pamporovo+Villa/@41.6218681,24.7136265,17z/data=!4m8!3m7!1s0x14ac59a187021781:0x12efd0d28f70a9bc!8m2!3d41.6218681!4d24.7136265!16s%2Fg%2F11hz6s597c)

---

## Какво е имплементирано в кода ✅

| # | Задача | Статус |
|---|--------|--------|
| 14 | GBP review CTAs на сайта | ✅ Reviews, Contact, Location, Footer + GA event `google_review_click` |
| 15 | hreflang EN layer | ✅ Server injection + `LangSwitcher` (Sprint 2–3) |
| 16 | Image sitemap + alt audit | ✅ Villa gallery в sitemap; `pnpm seo:alt-audit` |
| 17 | Directory backlinks | 📋 Checklist по-долу (ръчна работа) |

**Централни файлове:** `shared/gbpLinks.ts`, `client/src/components/site/GoogleReviewCta.tsx`, `shared/seoGalleryImages.ts`

---

## 14. Google Business Profile — weekly sync

### NAP (трябва да съвпада 1:1)

| Поле | Стойност на сайта |
|------|-------------------|
| Име | Pamporovo Villa |
| Телефон | +359 879 501 660 |
| Адрес | к.к. Пампорово, местност Райковски ливади |
| Уебсайт | https://pamporovovilla.com |
| Имейл | pamporovovilla@gmail.com |

### GBP dashboard checklist (15 мин/седмица)

- [ ] **Website URL** = `https://pamporovovilla.com` (без www, без trailing slash)
- [ ] **Primary category:** Vacation home rental agency / Holiday home
- [ ] **Secondary:** Ski resort, Lodge, Chalet (ако са налични)
- [ ] **Hours:** 24/7 или „By appointment“ — същото като на сайта
- [ ] **Attributes:** Wi‑Fi, parking, fireplace, BBQ — match amenities на сайта
- [ ] **Photos:** качете 5–10 нови от `/photos/` gallery (seasonal rotation)
- [ ] **Posts:** 1 post/седмица — зима (ски), пролет (eco trails), лято (BBQ)
- [ ] **Q&A:** копирайте 5–10 FAQ от homepage `/` и `/pamporovo/kude-da-spim`
- [ ] **Review link:** GBP → „Ask for reviews“ → сравнете с `shared/gbpLinks.ts` → `GBP.reviewUrl`

### Review follow-up (след checkout)

1. Ден 1 след напускане: SMS/Viber с линк `GBP.reviewUrl` или `GBP.mapsCidUrl`
2. Ден 3: имейл „Споделете опита си“ + site review form + Google CTA
3. Цел: **2–4 нови Google отзива / месец** (не само site reviews)

### Site ↔ GBP entity merge

JSON-LD на homepage вече включва `sameAs` → Google Maps URL. Не добавяйте GBP Review schema на сайта (само site reviews в JSON-LD).

---

## 15. hreflang EN — verification

```bash
pnpm seo:verify
pnpm run check
```

Live check (след deploy):

```bash
pnpm exec tsx scripts/verify-live-production.ts
```

Тествайте ръчно:

- `/?lang=en` — EN title + `hreflang="en"`
- `/rent?lang=en`, `/pamporovo?lang=en`, `/villa/villa-1?lang=en`
- `LangSwitcher` в header (desktop + mobile menu)

---

## 16. Image sitemap + alt audit

### Sitemap

- `/sitemap.xml` включва `<image:image>` за homepage, `/pamporovo`, villa pages
- Villa gallery photos се четат автоматично от `client/src/data/photos.ts`

```bash
pnpm seo:verify          # image count ≥ 55
pnpm seo:alt-audit       # report generic alts
pnpm seo:alt-check       # CI gate (photo count)
```

### Alt text polish (optional)

Снимки с generic alt „Pamporovo Villa“ — подобрете в `scripts/prepare_photos.py` / source CSV и re-run photo pipeline.

---

## 17. Directory backlinks (off-site)

**Цел:** 10–15 качествени citations с еднакъв NAP за Local Pack.

### Приоритет A (BG travel / ski)

| Директория | Действие |
|------------|----------|
| [BulgariaTravel](https://www.bulgariatravel.org/) | Листинг / partner inquiry |
| [Tourism.bg](https://www.tourism.bg/) | Регион Смолян / настаняване |
| [Ski.bg / ski portals](https://www.skibg.com/) | Pamporovo accommodation |
| [Booking.com / Airbnb](https://www.booking.com/) | Ако имате листинг — NAP + link към official site |
| Google Hotels / Vacation Rentals | Свързване с GBP |

### Приоритет B (EU / EN tourists)

| Директория | Действие |
|------------|----------|
| TripAdvisor | Business listing + link to site |
| J2Ski / ski accommodation directories | EN description + `/rent?lang=en` |
| Wikidata / Wikipedia (Rhodopes) | `sameAs` entity — long-term |

### NAP template (copy-paste)

```
Pamporovo Villa
к.к. Пампорово, местност Райковски ливади, 4870, Bulgaria
+359 879 501 660
pamporovovilla@gmail.com
https://pamporovovilla.com
```

**Правило:** един и същ телефон, адрес и домейн навсякъде. Без „Pamporovo Vila“, „Villa Pamporovo“ и т.н.

---

## Google Search Console (след deploy)

1. Property: `https://pamporovovilla.com`
2. Sitemaps → Submit `https://pamporovovilla.com/sitemap.xml`
3. URL Inspection → `/`, `/rent`, `/pamporovo`, `/villa/villa-1`
4. Monitor: indexed pages, FAQ rich results, average position „pamporovo villa“

---

## IndexNow (technical)

След deploy на нови spoke pages:

```bash
pnpm indexnow
```

---

## KPI (Sprint 4)

| Metric | Target (30 days) |
|--------|------------------|
| New Google reviews | +4 |
| GBP posts published | 4 |
| Directory citations live | 5+ |
| GSC indexed URLs | 15+ |
| Image sitemap images | 55+ |
| `google_review_click` GA events | track baseline |

---

*Последна актуализация: юли 2026*
