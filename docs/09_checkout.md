# VIVABOX_CHECKOUT_DECISIONS.md

> Last update: July 2026
> Status: UX Architecture Validated
> Scope: Complete purchase journey after clicking **"REGALAR UNA VIVABOX"**
> Version: MVP

---

# Purpose of this document

This document is the reference for the entire Vivabox checkout experience.

It is intended for AI assistants, designers and developers so that they understand the intended UX, the philosophy behind every decision, and the complete purchase flow.

This is **not** a technical specification.

It is a UX, conversion and product architecture document.

---

# Global Principles

The checkout must respect the Vivabox philosophy.

## Simplicity

The customer should never wonder:

- What happens next?
- Why am I being asked this?
- Did I forget something?

Every screen has one clear purpose.

---

## Reliability

Vivabox should feel trustworthy.

The customer should know before paying:

- exactly what is being purchased;
- the final amount;
- where the Vivabox will be delivered;
- what happens after payment.

No hidden costs.

No surprises.

---

## Warmth

Vivabox is not selling logistics.

It is helping someone prepare a gift.

The checkout should therefore progressively move from:

Transaction

↓

Gift

↓

Emotion

---

## Mobile First

Every decision must first be designed for mobile.

Desktop adapts to the mobile experience.

Never the opposite.

---

## Minimum Friction

The goal is NOT to have the fewest possible screens.

The goal is to have:

- no unnecessary question;
- no duplicated information;
- no question asked at the wrong moment.

---

## Buyer ≠ Recipient

The checkout must always distinguish:

Buyer

↓

Recipient

↓

Delivery recipient

These three people are not necessarily the same.

---

# Global Checkout Structure

Homepage

↓

REGALAR UNA VIVABOX

↓

Checkout

↓

Step 1 — Tu regalo

↓

Step 2 — Pago

↓

Step 3 — Listo

---

# STEP 1 — TU REGALO

Purpose:

Prepare the purchase before payment.

This step contains two screens.

Although two screens exist, they represent a single mental step.

---

# Screen 1A

## Product

Compact horizontal card.

Contains:

- Vivabox image
- Product name
- Price
- Quantity selector
- "Caja física incluida"

No long sales copy.

The homepage already sold the product.

---

## Price

Public price:

$199.000 COP — shipping included.

The physical box is INCLUDED.

The box is not treated as an optional accessory.

---

## Quantity

Displayed as:

− 1 +

Default:

1

---

## Personal message

The customer is NOT asked to write the message before payment.

Instead, a reassurance is displayed.

Example:

"Podrás agregar tu mensaje personal después del pago."

This avoids anxiety without creating friction.

---

## Delivery Method

Home delivery only (MVP). The shipping price comes from a single source of
truth, `deliveryPriceFor(quantity)` in `src/features/checkout/delivery.ts`,
imported by both the checkout UI and `POST /api/checkout/start`.

Today `DELIVERY_PRICE_COP = 0`: shipping is **included** in the box price.
The delivery line reads:

"Envío incluido · 1–2 días hábiles" (Bogotá) / "2–4 días hábiles" (elsewhere)

No struck-through price, no "Gratis". The estimated delay depends on the city;
the price never does.

If `DELIVERY_PRICE_COP` is raised above 0, shipping is charged per order and
becomes free from `FREE_DELIVERY_FROM_QUANTITY` boxes (ready for campaigns).
Do not hardcode a delivery amount anywhere else.

---

## Envío el mismo día (optional, +$10.000)

A checkbox in the delivery card, shown only for Bogotá (an empty city is
assumed to be Bogotá, like the delivery delay). Rules live in
`src/features/checkout/sameDay.ts` (single source of truth, imported by the UI,
`POST /api/checkout/start` and `finalizeVentaPayment`):

- Monday to Saturday, excluding Colombian holidays, before **2:00 p. m.**
  (Bogotá time). Otherwise the option stays visible but greyed out with
  "Disponible de lunes a sábado, antes de las 2:00 p. m."
- Promise shown to the buyer: "Llega hoy antes de las 8:00 p. m."
- The +$10.000 is added to the total after promotions: a promo code never
  reduces it. It is saved as `ventas.delivery_speed = 'same_day'` and included
  in `delivery_price`.
- `start` re-checks city and time; if the option is no longer available it
  answers `SAME_DAY_UNAVAILABLE` and the UI unchecks it.

Payment time decides what staff must do (`sameDayOutcome`, from `paid_at`):

| Paid | Outcome | Staff alert |
|---|---|---|
| before 2:00 p. m. | `on_time` | "ENVÍO HOY" email |
| 2:00–2:30 p. m. | `grace` — delivered today anyway | "ENVÍO HOY URGENTE" email |
| after 2:30 p. m., Sunday or holiday | `missed` | "NO LLEGA HOY" email: staff decide (deliver anyway, or next working day + refund the $10.000) |

The alert goes to `contact@vivabox.com.co` (`sendSameDayAlertEmail`), best
effort. The buyer's "paid" email only promises "hoy" for `on_time`/`grace`; for
`missed` it says staff will write to confirm.

vivabox-operativo should show a prominent badge on any venta with
`delivery_speed = 'same_day'` (and flag `missed` ones using `paid_at`).

---

Second option:

Retiro

Sin costo

---

Digital version

Not displayed as the primary option.

If kept in the MVP, it should appear as a secondary alternative for urgent gifting.

The physical Vivabox remains the reference product.

---

# Promotional Code

Visible on Screen 1A.

Question:

¿Tienes un código promocional?

↓

Input

↓

Aplicar

When valid:

✓ Código aplicado

Promotional codes are used for:

- influencers
- partners
- campaigns
- attribution

Their only built-in benefit used to be free shipping. While shipping is
included, a code changes no amount (the discount equals the delivery price,
i.e. 0); it is kept for attribution and for the test-price code.

Only one promotion per purchase.

---

# First Purchase Benefit

Removed. Shipping is already included, and the email is collected in Screen 1B
anyway, so the "email for free shipping" offer added nothing.
`WelcomeShippingModal` and `/api/checkout/welcome` remain in the codebase but
are no longer called from the checkout.

---

# Screen 1B

Purpose:

Collect only the information necessary to execute the order.

---

Delivery destination

Question:

¿Dónde la enviamos?

Choices:

• En mi dirección

or

• Directamente a quien la recibe

---

Delivery Information

Collect only:

- Name
- WhatsApp
- Address
- City

Additional delivery instructions remain optional.

---

Buyer Information

Collect only what is necessary.

Typically:

- email

The email is asked once, here.

Never request information twice.

---

Order Summary

Displayed on the same screen.

Not on a separate screen.

Contains:

Vivabox

Box included

Delivery

Final total

Example (1 box):

Vivabox

$199.000

Caja física

Incluida

Envío

Incluido

Total

$199.000

With 2 boxes the total is $398.000. The summary and the sticky bottom bar
share one calculation (`useDisplayPricing`), so they always show the same total.

CTA

IR A PAGAR

---

# Validated Principle

Delivery information is collected BEFORE payment.

Reason:

The customer should know before paying:

- where the Vivabox goes;
- delivery price;
- final total.

The personal message is intentionally postponed.

---

# STEP 2 — PAGO

Purpose

Complete payment.

Nothing else.

No delivery.

No message.

No personalization.

---

Payment Provider

Wompi

Used as the single payment provider for the MVP.

---

Supported Methods

Primary:

Nequi

PSE

Credit / Debit Card

Bancolombia

Optional:

Daviplata

Other methods supported by Wompi.

---

Architecture

Vivabox remains responsible for the purchase flow.

Wompi handles the payment flow.

Avoid rebuilding payment forms if Wompi widgets already provide them.

---

Payment Screen

The Wompi widget opens **automatically** on arrival at `/checkout/[slug]/pago`.
No intermediate screen, no method list, no "Pagar" button to press first:
the customer goes straight from "IR A PAGAR" to Wompi's own method selection
(Tarjeta, Nequi, PSE...).

Behind the widget, only the step indicator and the Vivabox loader are shown.
The widget already displays the amount, so no summary card is rendered behind
it (it would duplicate what the customer sees).

---

If the customer closes the widget without paying (or an error occurs), a
card appears (compact order summary + retry):

"Tu pago no se completó. Tu pedido sigue reservado."

Primary CTA: Reintentar el pago

Secondary: WhatsApp help link

The widget is auto-opened only once per visit; reopening is always the
customer's choice. The reservation (`ventaId`) stays alive.

No long summary.

The customer already validated everything before entering payment.

---

# STEP 3 — LISTO

Purpose

Transition from transaction

↓

to emotion.

This step contains two screens.

---

# Screen 3A

Payment Confirmation

Large success state.

Example:

✓ Pago confirmado

Tu compra está confirmada.

---

Personal Message

Now the customer is invited to personalize the gift.

Title

Ahora dale tu toque personal

Fields

Para

De

Mensaje

The message remains optional.

Primary CTA

Guardar mensaje

Secondary CTA

Continuar sin mensaje

---

Reason

Writing a personal message requires emotional effort.

It should never block payment.

---

# Screen 3B

Final Confirmation

Large illustration.

Example:

¡Tu Vivabox está lista!

Very little text.

Focus on reassurance.

---

Information displayed

✓ Payment confirmed

✓ Confirmation email sent

✓ Vivabox preparation

✓ Delivery updates

Order summary

Total paid

CTA

Ver mi pedido

Secondary

Seguir comprando

---

Footer

Warm brand message.

Example:

Gracias por elegir Vivabox.

Ahora empieza la mejor parte.

---

# Buyer emails

Two automatic emails go to the **buyer** (never to the recipient), from
`Vivabox <notificaciones@notify.vivabox.com.co>` with Reply-To
`contact@vivabox.com.co`. Content lives in `src/services/buyerEmail.ts`.

| Moment | Trigger | Subject |
|---|---|---|
| Payment confirmed | Wompi webhook / `/verify` (`finalizeVentaPayment`) | Pago confirmado — gracias por regalar una Vivabox |
| Box shipped | staff marks it shipped in vivabox-operativo | Tu Vivabox ya salió |

- The "shipped" email is requested by vivabox-operativo through
  `POST /api/internal/buyer-email` (header `x-internal-secret`,
  `INTERNAL_API_SECRET` in both projects; `VIVABOX_SITE_URL` in operativo).
- Best-effort: a Resend failure never blocks checkout or back-office.
- No duplicates: Resend idempotency key `buyer-<kind>-<ventaId>` (24 h) on top
  of the atomic status transitions that trigger them.
- The send only happens if the venta's real state matches the email (a "paid"
  email never leaves for an unpaid venta).
- The activation code is never put in an email (bearer key, see `email.ts`).
- The root domain `vivabox.com.co` is **not** verified in Resend; only the
  `notify.` subdomain is. Override the sender with `BUYER_EMAIL_FROM`.

---

# Checkout Header

Simplified.

Contains only:

Back

Vivabox

Compra segura

Removed:

Hamburger menu

Activation button

Shopping cart

General navigation

Reason:

The customer should not leave the checkout once engaged.

---

# Promotional Rules

Only one promotion per purchase (a promotional code).

---

# Reuse of Data

Vivabox never requests information twice.

Examples:

Email entered in Screen 1B

↓

Reused for the payment, the receipt and the buyer emails.

---

# UX Principles Validated

The checkout should never feel like filling forms.

Each screen answers one question.

Step 1

What am I buying?

How will I receive it?

Where should it go?

How much will I pay?

↓

Step 2

How do I pay?

↓

Step 3

How do I make the gift personal?

↓

Finished.

---

# Important Decisions

Validated

✓ Three checkout steps

✓ Two screens inside Step 1

✓ Wompi as payment provider

✓ Delivery before payment

✓ Personal message after payment

✓ Promotional codes

✓ Shipping included in the price

✓ No account creation

✓ Mobile first

✓ Compact product card

✓ Physical box included in product

✓ Checkout-specific header

✓ No duplicated information

✓ Warm emotional confirmation

---

# Pending Decisions

Still to validate in future work:

- Intermediate "/regalar" page:
  - keep,
  - simplify,
  - or remove completely.

- Exact visual UI.

- Microcopy.

- Delivery pricing beyond "included" (Christmas multi-box campaign: see `delivery.ts`).

- Tracking page after purchase.

- Logistics integration.

- Order status notifications.

- Digital version final strategy.

---

End of document.