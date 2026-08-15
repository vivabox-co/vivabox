# Vivabox — Project Instructions

Mandatory rules for working on the Vivabox project. These override generic defaults.

Detailed context lives in `docs/`. Don't load a doc unless the current task touches that area — open it yourself when relevant, rather than treating this file as the whole picture.

## Non-negotiables

1. **Hierarchy:** Gift → Box → Experience, always. Never present Vivabox as an activity catalogue/marketplace. → `docs/00_foundation.md`
2. **Audience:** Speak to the **buyer** first. Recipient experience is handled by the separate activation platform. → `docs/00_foundation.md`
3. **Experiences are examples, not guarantees.** Always use "Ejemplos de experiencias." → `docs/02_brand-voice.md`
4. **Language:** Colombian Spanish, natural and friendly, never bureaucratic. → `docs/02_brand-voice.md`
5. **Words to avoid:** exclusivo, lujo, condiciones. → `docs/02_brand-voice.md`
6. **Design feel:** minimal, elegant, warm, bright, generous white space — never cluttered. → `docs/03_visual-identity.md`
7. **Decision priority when in doubt:** Simplicity > Emotional clarity > Trust/reliability. Never prioritize complexity. → `docs/00_foundation.md`

## When to open which doc

### Strategy & brand (apply everywhere)

| Working on... | Open |
|---|---|
| Positioning, personality, audience, general "does this fit the brand" questions | `docs/00_foundation.md` |
| Pricing, box contents, experience categories, product logic | `docs/01_product.md` |
| Copy, messaging, brand tone, or anything user-facing text | `docs/02_brand-voice.md` |
| Colors, imagery/photo direction, typography, `ui/` components | `docs/03_visual-identity.md` |
| Pages, routing, navigation — site-wide overview | `docs/04_website-ux.md` |
| Stack, folder conventions, performance, deployment | `docs/05_technical.md` |
| Why a message/page should be framed a certain way, objection handling, persuasion logic | `docs/06_sales-psychology.md` |

### Page-by-page detailed specs (validated UX architecture)

| Building/editing... | Open |
|---|---|
| Homepage sections (Hero, "¿Qué incluye?", "Ejemplos de experiencias"...) | `docs/07_homepage-sections.md` |
| Product page (`/regalar`) | `docs/08_product-page.md` |
| Checkout flow (steps, screens, Wompi integration) | `docs/09_checkout.md` |
| "Nuestra historia" page | `docs/10_nuestra-historia.md` |
| Le CTA "Activar" et tout ce qui touche à la transition vers la web app bénéficiaire (projet séparé) | `docs/11_webapp-handoff.md` |
| Writing or editing experience content (`descripcion_corta`/`shortDescription`, `nota_vivabox`/"La elegimos") | `docs/editorial/experiencias.md` |

`docs/04_website-ux.md` gives the site-wide map (which pages exist, nav, overall flow). Docs `07-10` are the detailed, section-by-section specs for the pages that already have validated architecture — open the specific one instead of relying on `04` alone when actually building a page.

## Build & Conventions

- Stack: Next.js + TypeScript + Tailwind + React. Full details in `docs/05_technical.md`.
- Structure: `src/{app,ui,components,sections,features,data,services,utils}`, `public/{images,videos,icons}`.
- Keep components small, reusable, single-responsibility.
