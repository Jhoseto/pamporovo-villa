# Pamporovo Villa - Website TODO

## Project Phases

### Phase 1 — Planning & Design ✅
- [x] Create comprehensive todo.md with all features and requirements
- [x] Generate hero and property showcase images
- [x] Build premium design system, layout structure, and core pages

### Phase 2 — Backend & Booking ✅
- [x] Implement booking system, database schema, and backend procedures
- [x] Booking requests table (`booking_requests`)
- [x] Inquiry messages table (`inquiries`)
- [x] tRPC procedures: `booking.createRequest`, `inquiry.submit`
- [x] Owner notification integration (graceful fallback when service unavailable)
- [x] Date validation on backend

### Phase 3 — Feature Sections ✅
- [x] Hero section with parallax and CTA
- [x] Property details with animated stats
- [x] Photo gallery with lightbox and thumbnails
- [x] Amenities showcase with staggered scroll animations
- [x] Location section with Google Map and distances
- [x] Pricing packages with booking CTAs
- [x] Guest reviews carousel with auto-rotation
- [x] Booking form with interactive calendar (date range)
- [x] Contact section with click-to-call and inquiry form
- [x] Sticky header with mobile menu

### Phase 4 — Animations & Polish ✅
- [x] Scroll-driven reveal animations (`ScrollReveal`, `useScrollReveal`)
- [x] Hero parallax with `prefers-reduced-motion` support
- [x] Staggered card entrances
- [x] Smooth scroll navigation
- [x] Header background transition on scroll
- [x] Hover interactions on cards and gallery

### Phase 5 — Testing ✅
- [x] Unit tests for booking validation (tRPC + Zod)
- [x] Unit tests for inquiry validation
- [x] Mocked DB and notification in integration tests
- [x] Notification graceful-fallback test

### Phase 6 — Delivery ✅
- [x] SEO meta tags (title, description, Open Graph)
- [x] Modular component architecture under `client/src/components/site/`
- [x] Centralized content in `client/src/data/siteContent.ts`
- [x] Final checkpoint — website ready for deployment

---

## Core Features (Reference)

| Section | Status |
|---------|--------|
| Hero | ✅ |
| Booking | ✅ |
| Property Details | ✅ |
| Gallery + Lightbox | ✅ |
| Amenities | ✅ |
| Location + Map | ✅ |
| Pricing | ✅ |
| Reviews | ✅ |
| Contact | ✅ |
| Navigation | ✅ |

## Content & Assets

- [x] Hero background image
- [x] Property interior/exterior images
- [x] Bulgarian copy throughout
- [x] Contact information (phone, email, address)

## Performance & SEO

- [x] Image lazy loading in gallery
- [x] Meta tags and SEO optimization
- [x] Mobile responsive layout
- [ ] Analytics (configured via env vars when deployed)
- [ ] Production image CDN optimization (optional)

## Run Locally

```bash
pnpm install
pnpm db:push      # requires DATABASE_URL
pnpm dev          # http://localhost:3000
pnpm test         # run vitest suite
pnpm build        # production build
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | MySQL connection for bookings/inquiries |
| `BUILT_IN_FORGE_API_URL` | Owner notification service |
| `BUILT_IN_FORGE_API_KEY` | Notification API key |
| `VITE_FRONTEND_FORGE_API_KEY` | Google Maps proxy key |

---

*Last updated: June 2026 — All planned phases complete.*
