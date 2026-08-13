# Vivabox — Visual Identity

> Source of truth for: color, imagery, typography, and the box's visual role.
> Category color hex codes → see `01_product.md` (not repeated here).

## Design Feel

Minimal · Elegant · Warm · Bright. Generous white space. Never crowded.

## Color Philosophy

- Color is **functional, not decorative**.
- Dominant background: white / cream / natural paper.
- Accent colors used sparingly, mainly to tag experience categories (see table in `01_product.md`).
- Avoid visual overload — accents highlight, they don't dominate.
- **Dark anchor tone:** `--color-ink` is a warm near-black (coffee/espresso, `#18140F`), not navy. Used for the footer plus two deliberate "dark anchor" sections on the homepage — **Por qué confiar en Vivabox** and the price block — to punctuate the page rather than let every section sit on the same cream. Never a cold or corporate blue-black, and not meant to spread further than these anchor moments.

## Brand Ribbon (signature device)

A thin 4-color bar — orange (`--color-primary`), red, green, blue (`--color-accent-red/green/blue`) — pulled directly from the gift-box icon in the logo. Two implementations:

- **`BrandRibbon`** — a persistent 4px strip pinned to the very top edge of every page.
- **`BrandDots`** — the same 4 colors as small dots, used as a quiet signature mark above a section heading (e.g. "Por qué confiar en Vivabox", the price block, "Ejemplos de experiencias").

Use sparingly — one mark per section at most, never as a repeating pattern or border.

## Typography

Modern sans-serif. Must feel clean, elegant, readable — and stay highly legible on mobile.

## Photography (Imagery)

**Philosophy:** images are proof, not decoration. Goal: the user thinks *"I can see myself there."*

| Show | Avoid |
|---|---|
| Real people, real experiences | Overly staged images |
| Natural emotions | Generic stock photos |
| Warm light, colorful, natural environments | Artificial smiles |
| Slight imperfection (it reads as authentic) | — |

**Composition:** human-centered, action-oriented, context visible.

## Neumorphic Surface System (`vb-*`)

> Implemented in `src/app/globals.css` (search "Vivabox — neumorphic surface system"). Originated in the checkout, meant to be the shared standard anywhere on the site that needs cards, inputs, or buttons with real depth — not just the checkout.

**Core idea:** the page sits on a deeper warm-neutral base (`--color-base`, #F1EAE0); cards/inputs/buttons float on `--color-card` (#FFFCF9, near-white) — a lighter plane than the base. Depth reads from that real lightness contrast *first*, and from a soft warm-gray shadow *second*. Shadow tokens (`--nm-light`, `--nm-dark`, `--nm-dark-strong`, `--nm-border`) are neutral, based on `--color-ink` at low opacity — never a brown/tan tint, which reads muddy and "beige soup" rather than premium. Color (brand orange, `--color-accent-tint`, category colors) stays the only place saturation shows up; the neumorphic surfaces themselves are always neutral.

**Radius family** — keep every new component on this scale, don't invent a new radius:
`26px` cards (`.vb-card`) → `18-20px` inputs/buttons/choices (`.vb-input`, `.vb-btn-*`, `.vb-choice`) → `16px` thumbnails (`.vb-thumb`) → `13px` pills (`.vb-step`) → `11px` small icon badges (`.vb-choice-icon`).

**Classes available:** `.vb-surface-base` (page bg), `.vb-card`, `.vb-thumb`, `.vb-divider-top` (flat 1px separator, not an engraved groove — those read as visual noise when stacked), `.vb-well` (the one deliberately colored/tinted surface, `--color-accent-tint` bg), `.vb-input` (raised at rest, inset only on `:focus` — never inset by default, it reads as permanently "pressed" and heavy), `.vb-choice` (radio/checkbox cards — raised idle, inset + tinted bg when checked), `.vb-steps` / `.vb-step` (progress trackers).

**CTA hierarchy — 3 tiers, learned the hard way:**
1. `.vb-btn-primary` — the one true conversion action per screen. Gradient fill (`--color-primary` → a deep orange-red, currently `#E8491F`), richest shadow, richest state is `:active` (thumb-press) not `:hover` (mobile-first — hover is invisible to most users). **Stays on the same 18px radius as everything else** — do not turn it into a pill or any silhouette that breaks from the rest of the page, that reads as a foreign component bolted onto the design instead of the same system turned up in intensity.
2. `.vb-btn-secondary` — funnel actions that aren't the main conversion (get a benefit, receive a code, apply it). Solid flat `--color-primary` fill, white text, light shadow. **Must be a solid saturated fill, never a pale tint** — a pale `--color-accent-tint` button placed inside an already-tinted `.vb-well` visually disappears into its own container.
3. `.vb-btn-soft` — ghost/utility actions (apply a promo code, copy something). Near-white fill, thin colored border, colored text.

Only ever differentiate tiers by **color intensity and shadow depth** — never by breaking the shared radius/shape language.

## Role of the Physical Box

The box is a central visual element — it represents the moment of gifting and should appear frequently across visuals to reinforce the emotional impact of giving (per the Gift → Box → Experience hierarchy in `00_foundation.md`).
