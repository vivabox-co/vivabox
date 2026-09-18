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

$200.000 COP

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

Question:

¿Cómo quieres recibirla?

Options:

• Envío a domicilio

Shows:

- delivery cost
- estimated delivery delay

Example:

Envío a domicilio

$15.000

2–4 días hábiles

↓

Small reassurance:

"Puedes tener el envío incluido con un código o si es tu primera compra."

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

↓

Envío incluido

Promotional codes are used for:

- influencers
- partners
- campaigns
- attribution

Only one promotion per purchase.

---

# First Purchase Benefit

Displayed immediately below promotional code.

Question:

¿Es tu primera compra?

↓

Button:

OBTENER ENVÍO INCLUIDO

Click opens a small bottom sheet.

No page navigation.

---

Bottom Sheet

Fields:

Email

Checkbox

Consent to receive Vivabox communications.

No password.

No account creation.

No login.

---

After validation

The bottom sheet closes automatically.

The checkout updates.

Example:

✓ Beneficio de primera compra aplicado

↓

Envío incluido

The email is automatically reused later.

The consent checkbox is never shown again.

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

If the email was already entered through the first purchase benefit,

it is automatically prefilled.

Never request information twice.

---

Order Summary

Displayed on the same screen.

Not on a separate screen.

Contains:

Vivabox

Box included

Delivery

Promotion

Final total

Example:

Vivabox

$200.000

Caja física

Incluida

Envío

$15.000

Beneficio

−$15.000

Total

$200.000

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

> **Temporary mode (Sept 2026) — manual Bre-B payment.** While the Wompi
> account is not active, the payment step shows Vivabox's Bre-B llave
> (Bancolombia, "Vivabox Colombia Sas"), the exact amount and a short
> reference (`VB-XXXXXX`, from the venta id) instead of the Wompi widget.
> The buyer transfers, taps "Ya hice el pago" and waits on
> `/checkout/pago/pendiente`. Nothing is activated on the buyer's word:
> staff verify the money in Bancolombia and click "Confirmar pago" in
> vivabox-operativo (Pedidos → Pagos), which marks the venta paid and
> generates the activation code; the buyer's waiting page then moves on to
> Step 3 by itself. Config in `src/services/manualPayment.ts`. Switch back
> to Wompi with `NEXT_PUBLIC_PAYMENT_PROVIDER=wompi` on Vercel (redeploy) —
> the webhook/verify routes are untouched.

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

Contains:

Step indicator

Payment method selection

Compact order summary

Final amount

CTA

Example

PAGAR $200.000

Footer:

Pago seguro con Wompi

---

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

Only one promotion per purchase.

Promotional code

OR

First purchase benefit

Never both.

---

# Reuse of Data

Vivabox never requests information twice.

Examples:

Email entered in the first purchase popup

↓

Automatically reused later.

Consent already given

↓

Never requested again.

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

✓ First purchase benefit

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

- Delivery pricing.

- Tracking page after purchase.

- Logistics integration.

- Order status notifications.

- Digital version final strategy.

---

End of document.