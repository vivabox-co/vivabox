# Vivabox — Technical Architecture

## Overview

Clean, scalable, maintainable codebase supporting: marketing pages, product pages, checkout, and integration with the (separate) activation platform.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | React |
| Deployment | Vercel (or similar edge hosting) |

## Project Structure

```
src/
  app/          → pages & routes
  ui/           → low-level visual primitives (Button, Input, Badge, Container, Heading, Text)
  components/   → reusable composed UI (Header, Footer, Navbar, MobileMenu, Card, Carousel)
  sections/     → page sections (Hero, HowItWorks, Boxes, ExperiencesPreview, Moments, GiftIdeas, WhyVivabox, Companies, FAQ)
  features/     → business logic modules (cart, checkout, vivabox)
  data/         → static data (boxes, experiences, faq, testimonials)
  services/     → external integrations (payment providers, checkout APIs, analytics)
  utils/        → small reusable functions (formatPrice, slugify, validators)

public/
  images/ (boxes, experiences, hero) · videos/ · icons/
```

Routes example: `app/{cajas, experiencias, empresas, aliados, checkout}`

## Component Philosophy

Small · Reusable · Focused. Single responsibility per component; break up large ones. Design-system primitives (Button, Card, Input) implement the visual identity in `03_visual-identity.md`.

## Performance

- **Images:** WebP/AVIF, always set width/height, lazy-load below the fold.
- **Video:** 5–7s max, muted autoplay, loop, ~2MB max, non-blocking.
- **JS:** avoid heavy libraries; dynamic imports for carousels, video players, checkout modules.
- **Fonts:** Next.js font optimization, `swap` strategy.

## SEO & Accessibility

- Proper title tags, meta descriptions, semantic HTML, clean URLs.
- Alt text on all images; keyboard-navigable interactive elements; sufficient color contrast.

## Scalability

Architecture should flex for: additional cities, expanded experience catalog, loyalty programs, new product formats.

## Deployment

Edge-first hosting (Vercel), continuous deployment for rapid updates.

## Backend

- **Ventas (orders):** Supabase (PostgreSQL), table `ventas` — created/read/updated exclusively from Next.js API routes (`src/app/api/checkout/*`) via a service-role client (`src/services/supabase.ts`). RLS enabled with no public policies; the browser never talks to Supabase directly. Schema lives in `supabase/schema.sql`.
- **Activation codes:** table `activation_codes`, one row per `venta`. Generated in `src/features/checkout/finalizeVentaPayment.ts` right when a `venta` transitions to `paid` (`src/features/activation/generateActivationCode.ts`), valid 6 months from purchase. This is the unique code printed inside the physical box — format `VIVA-XXXXXXXX`, 8 random chars (32⁸ ≈ 1.1×10¹² combinations; the alphabet excludes visually ambiguous characters), sized to resist brute-force guessing against a rate-limited endpoint.
- **Payments (Wompi):** `src/services/wompi.ts` (integrity/checksum signing, transaction lookup) + `src/features/checkout/finalizeVentaPayment.ts` (idempotent `reserved`/`expired` → `paid` transition, atomic via `WHERE status IN (...)`). Flow: `POST /api/checkout/pay` builds the signed Web Checkout Widget params (never marks anything paid); the buyer completes payment in the Wompi widget (`checkout.wompi.co/widget.js`, loaded on `/checkout/[slug]/pago`); `POST /api/checkout/webhook/wompi` is the source of truth — Wompi calls it with a signed `transaction.updated` event, verified against `WOMPI_EVENTS_SECRET` before finalizing; the widget's `redirectUrl`/close-callback only sends the buyer to `/checkout/pago/retorno`, which calls `POST /api/checkout/verify` to confirm against the Wompi transactions API and finalize as a fallback if the webhook hasn't landed yet (never trusts the redirect alone, per Wompi's own guidance). The webhook URL must be registered in the Wompi Dashboard once a deployment URL exists.
- **Activation, sessions & bookings:** `src/app/api/activation/{activate,verify,bookings}` + tables `activation_sessions` (hashed token, real 7-day expiry) and `bookings` (one active booking per code, enforced by a partial unique index) in `supabase/schema.sql`. Rate limiting (`rate_limit_attempts` + `check_rate_limit()`) runs three checks per request — by IP, by the attempted code, and a generous system-wide ceiling (100/10min) that catches a sweep spread across rotating IPs/codes without ever tripping on normal traffic. Every rejected `activate`/`verify` attempt is logged (`console.warn`, IP + normalized code) so Vercel's built-in log capture gives a free forensic trail with no extra infra.
- **Boxes (product catalog):** stays static/local data (`src/data/boxes.ts`) — no need for a database table at this stage.
- **Activation platform:** separate app (recipient-facing), shares this same Supabase project. It can either call the `activation/*` routes above or query the same tables directly via its own service-role client, server-side only — same access pattern as this site, no public RLS policy is ever added.
- **AppScript (retired):** `AppScript/` was the previous Google Apps Script + Sheets backend for checkout and activation. It's fully replaced by the above — see `AppScript/DEPRECATED.md`. The live Google deployment (if still active) must be disabled manually; this repo can't reach it.

## Roadmap (post-MVP)

- Backend-validated promo codes / first-purchase benefit (currently mocked client-side — `promo_codes` table exists but nothing validates/redeems a code server-side yet).
- Supabase CLI-managed migrations instead of hand-applying `supabase/schema.sql` in the SQL editor.
- Activation security, deferred because they need a new dependency/account (none of this exists yet, so genuinely $0 today but not $0-setup): notify the buyer by email when their code is activated (no email provider is wired into the project at all yet), CAPTCHA (Cloudflare Turnstile, free tier) on repeated `activate`/`verify` failures, bot protection at the infra layer (Vercel Attack Challenge Mode / Cloudflare in front).
