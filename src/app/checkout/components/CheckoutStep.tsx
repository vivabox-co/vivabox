"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { formatPrice } from "@/utils/formatPrice"
import { useCheckoutStore } from "@/features/checkout/checkoutStore"
import { deliveryPriceFor } from "@/features/checkout/delivery"
import {
  SAME_DAY_PRICE_COP,
  SAME_DAY_SPEED,
  SAME_DAY_PROMISE,
  SAME_DAY_AVAILABILITY_HINT,
  isSameDayAvailable,
} from "@/features/checkout/sameDay"
import { useDisplayPricing } from "@/features/checkout/useDisplayPricing"

import { Truck, Zap, Home, Gift, ArrowRight, Lock, Check, CheckCircle2, Loader2, Pencil } from "lucide-react"

type CheckoutBox = {
  slug: string
  name: string
  price: number
  image?: string
}

type Props = {
  box: CheckoutBox
}

// ======================
// SMALL UI PIECES
// ======================

function Field({
  label,
  className = "",
  ...input
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`flex flex-col gap-1.5 text-[13px] font-semibold text-ink/80 min-w-0 ${className}`}>
      {label}
      <input className="vb-input font-normal" {...input} />
    </label>
  )
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6A5A48]">{children}</p>
  )
}

function TileRadio() {
  return (
    <span className="vb-tile-radio">
      <Check size={13} strokeWidth={3} />
    </span>
  )
}

export default function CheckoutStep({ box }: Props) {
  const router = useRouter()
  const [promoInput, setPromoInput] = useState("")
  const [promoChecking, setPromoChecking] = useState(false)
  const [promoError, setPromoError] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [promoOpen, setPromoOpen] = useState(false)
  // null hasta montar: la disponibilidad depende de la hora, no se calcula en el SSR.
  const [now, setNow] = useState<Date | null>(null)

  // ======================
  // STORE
  // ======================

  const quantity = useCheckoutStore(s => s.quantity)
  const setBox = useCheckoutStore(s => s.setBox)
  const setDeliveryMethod = useCheckoutStore(s => s.setDeliveryMethod)

  const deliveryDestination = useCheckoutStore(s => s.deliveryDestination)
  const setDestination = useCheckoutStore(s => s.setDestination)

  const recipientName = useCheckoutStore(s => s.recipientName)
  const recipientPhone = useCheckoutStore(s => s.recipientPhone)
  const setRecipientInfo = useCheckoutStore(s => s.setRecipientInfo)

  const address = useCheckoutStore(s => s.address)
  const city = useCheckoutStore(s => s.city)
  const addressExtra = useCheckoutStore(s => s.addressExtra)
  const setAddressInfo = useCheckoutStore(s => s.setAddressInfo)

  const buyerName = useCheckoutStore(s => s.buyerName)
  const buyerPhone = useCheckoutStore(s => s.buyerPhone)
  const buyerEmail = useCheckoutStore(s => s.buyerEmail)
  const setBuyer = useCheckoutStore(s => s.setBuyer)

  const promoCode = useCheckoutStore(s => s.promoCode)
  const promoApplied = useCheckoutStore(s => s.promoApplied)
  const setPromo = useCheckoutStore(s => s.setPromo)

  const sameDay = useCheckoutStore(s => s.sameDay)
  const setSameDay = useCheckoutStore(s => s.setSameDay)

  const setVentaId = useCheckoutStore(s => s.setVentaId)
  const setPricing = useCheckoutStore(s => s.setPricing)

  // ======================
  // INIT
  // ======================

  useEffect(() => {
    setBox(box)
    // MVP: caja física por domicilio única opción
    setDeliveryMethod("domicilio")
  }, [box, setBox, setDeliveryMethod])

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  // ======================
  // PROMO
  // ======================

  const PROMO_ERROR_LABEL: Record<string, string> = {
    INVALID_CODE: "Código inválido",
    EXPIRED: "Este código expiró",
    USED_UP: "Este código ya no está disponible",
    TOO_MANY_ATTEMPTS: "Demasiados intentos, intenta más tarde",
    SERVER_ERROR: "No pudimos validar el código",
  }

  // Chequeo temprano (el email del comprador aún no existe en este paso —
  // la validación completa, con verificación de propiedad, ocurre en
  // start/route.ts al enviar la compra).
  async function handleApplyPromo() {
    const code = promoInput.trim()
    if (!code || promoChecking) return

    setPromoChecking(true)
    setPromoError("")

    try {
      const res = await fetch("/api/checkout/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })

      const data = await res.json()

      if (!data.ok) {
        setPromoError(PROMO_ERROR_LABEL[data.error] || "Código inválido")
        return
      }

      setPromo(code, true)
    } catch {
      setPromoError("No pudimos validar el código")
    } finally {
      setPromoChecking(false)
    }
  }

  // ======================
  // SUBMIT
  // ======================

  const needsAddress = true // MVP: domicilio única opción

  const deliveryIncluded = deliveryPriceFor(quantity) === 0

  const normalizedCity = city
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
  // La mayoría de los clientes son de Bogotá — se asume Bogotá por defecto
  // hasta que la ciudad escrita demuestre lo contrario.
  const isOutsideBogota = normalizedCity.length > 0 && !normalizedCity.includes("bogota")
  const deliveryEstimate = isOutsideBogota ? "2–4 días hábiles" : "1–2 días hábiles"

  // Envío el mismo día : opción solo en Bogotá (sin ciudad escrita se asume
  // Bogotá, como arriba) ; el servidor revalida con la ciudad real.
  const sameDayOffered = !isOutsideBogota
  const sameDayAvailable = sameDayOffered && now !== null && isSameDayAvailable("Bogotá", now)
  const sameDaySelected = sameDay && sameDayAvailable

  // ======================
  // ESTIMATED PRICING
  // ======================

  // Un código ofrece el envío de base ; nunca el suplemento « mismo día ».
  const baseDelivery = deliveryPriceFor(quantity)
  const sameDaySurcharge = sameDaySelected ? SAME_DAY_PRICE_COP : 0
  const subtotal = box.price * quantity
  const estimatedPricing = {
    subtotal,
    delivery: baseDelivery + sameDaySurcharge,
    total: subtotal + baseDelivery + sameDaySurcharge,
    discount: promoApplied ? baseDelivery : 0,
  }
  const { delivery, discount, displayTotal, hasBenefit } = useDisplayPricing(estimatedPricing)

  const missingFields: string[] = []
  if (!buyerName) missingFields.push("tu nombre")
  if (!buyerEmail) missingFields.push("tu email")
  if (needsAddress) {
    if (!deliveryDestination) missingFields.push("dónde la enviamos")
    if (!address) missingFields.push("la dirección")
    if (!city) missingFields.push("la ciudad")
    if (deliveryDestination === "recipient") {
      if (!recipientName) missingFields.push("el nombre de quien la recibe")
      if (!recipientPhone) missingFields.push("el WhatsApp de quien la recibe")
    } else if (deliveryDestination === "self") {
      if (!buyerPhone) missingFields.push("tu WhatsApp")
    }
  }

  const canSubmit = missingFields.length === 0

  const activePromoCode = promoApplied ? promoCode : null

  async function handleGoToPayment() {
    if (loading) return

    if (!canSubmit) {
      setSubmitAttempted(true)
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/checkout/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          box: box.slug,
          quantity,
          buyer: {
            name: buyerName.trim(),
            email: buyerEmail.trim(),
            phone: buyerPhone.trim(),
          },
          delivery: { type: "physical", speed: sameDaySelected ? SAME_DAY_SPEED : null },
          destination: deliveryDestination,
          recipient: {
            name: recipientName.trim(),
            phone: recipientPhone.trim(),
          },
          address: {
            address: address.trim(),
            city: city.trim(),
            addressExtra: addressExtra.trim(),
          },
          promoCode: activePromoCode || undefined,
        }),
      })

      const data = await res.json()

      if (data.error === "SAME_DAY_UNAVAILABLE") {
        setSameDay(false)
        alert("El envío el mismo día ya no está disponible. Puedes continuar con el envío normal.")
        setLoading(false)
        return
      }

      if (!data.ok || !data.pricing || !data.ventaId) {
        alert("No pudimos iniciar la compra")
        setLoading(false)
        return
      }

      // Le code n'a pas survécu à la validation finale (expiré, épuisé...) —
      // on ne bloque jamais l'achat pour ça, mais l'UI ne doit plus prétendre
      // qu'une remise s'applique.
      if (activePromoCode && !data.promoApplied) {
        setPromo("", false)
        alert("Tu código ya no es válido — continuamos sin el descuento.")
      }

      setVentaId(data.ventaId)
      setPricing(data.pricing)

      router.push(`/checkout/${box.slug}/pago`)

    } catch (err) {
      console.error("START ERROR:", err)
      alert("Error iniciando compra")
      setLoading(false)
    }
  }

  // ======================
  // UI
  // ======================

  const setBuyerField = (patch: Partial<{ name: string; email: string; phone: string }>) =>
    setBuyer({ name: buyerName, email: buyerEmail, phone: buyerPhone, ...patch })
  const setRecipientField = (patch: Partial<{ name: string; phone: string }>) =>
    setRecipientInfo({ name: recipientName, phone: recipientPhone, ...patch })
  const setAddressField = (patch: Partial<{ address: string; city: string; addressExtra: string }>) =>
    setAddressInfo({ address, city, addressExtra, ...patch })

  const cityField = (
    <Field
      label="Ciudad"
      placeholder="Bogotá"
      autoComplete="address-level2"
      value={city}
      onChange={(e) => setAddressField({ city: e.target.value })}
    />
  )
  const addressFields = (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {cityField}
        <Field
          label="Dirección"
          placeholder="Calle, número, apto"
          autoComplete="street-address"
          value={address}
          onChange={(e) => setAddressField({ address: e.target.value })}
        />
      </div>
      <Field
        label="Detalles (opcional)"
        placeholder="Torre, portería, horario"
        value={addressExtra}
        onChange={(e) => setAddressField({ addressExtra: e.target.value })}
      />
    </>
  )

  const promoBlock = promoApplied ? (
    <div className="text-xs text-green-700">✓ Código aplicado</div>
  ) : promoOpen ? (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Código"
          value={promoInput}
          onChange={(e) => {
            setPromoInput(e.target.value)
            if (promoError) setPromoError("")
          }}
          onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
          className="vb-input flex-1 text-sm"
          autoFocus
        />
        <button
          onClick={handleApplyPromo}
          disabled={promoChecking || !promoInput.trim()}
          className="vb-btn-soft px-4 text-sm"
        >
          {promoChecking ? "..." : "Aplicar"}
        </button>
      </div>
      {promoError && <p className="text-xs text-accent-red mt-1.5">{promoError}</p>}
    </div>
  ) : (
    <button
      onClick={() => setPromoOpen(true)}
      className="text-xs text-[#6B6B6B] underline block"
    >
      ¿Tienes un código promocional?
    </button>
  )

  const missingMessage = submitAttempted && missingFields.length > 0 && (
    <p className="text-[11px] text-accent-red text-center mt-1.5">
      Falta completar: {missingFields.join(", ")}.
    </p>
  )

  const payLabel = loading ? (
    <>
      Procesando...
      <Loader2 size={18} strokeWidth={2} className="animate-spin" />
    </>
  ) : (
    <>
      Ir a pagar
      <ArrowRight size={18} strokeWidth={2} className="vb-cta-icon" />
    </>
  )

  return (
    <section className="pt-2 pb-28 lg:pb-12">
      <div className="checkout-container">
        <div className="max-w-[1050px] mx-auto">

        <Link href={`/cajas/${box.slug}`} className="text-sm text-[#6B6B6B] mb-3 inline-block">
          ← Volver
        </Link>

        <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-4 lg:gap-8 items-start">

          {/* LEFT — la caja primero */}
          <div className="space-y-4 lg:space-y-6 lg:sticky lg:top-24 animate-step">

            <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-6">
              {box.image && (
                <Image
                  src={box.image}
                  alt="Caja Vivabox"
                  width={420}
                  height={420}
                  priority
                  className="w-[132px] h-[132px] sm:w-[160px] sm:h-[160px] lg:w-full lg:h-auto lg:max-w-[360px] lg:self-center object-contain shrink-0 -rotate-3 drop-shadow-[6px_10px_14px_rgba(24,20,15,0.2)]"
                />
              )}
              <div className="min-w-0 space-y-2 lg:space-y-3">
                <h1 className="text-[26px] lg:text-[40px] leading-[1.05] font-extrabold tracking-tight text-ink">
                  Tu Vivabox
                </h1>
                <p className="text-sm lg:text-base leading-snug text-ink/75">
                  Una caja de regalo. Quien la recibe elige su experiencia.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {deliveryIncluded && (
                    <span className="vb-pill"><Truck size={14} strokeWidth={2} />Envío incluido</span>
                  )}
                  <span className="vb-pill"><Pencil size={14} strokeWidth={2} />Tu mensaje, después</span>
                </div>
              </div>
            </div>

            <div className="vb-card px-5 py-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-ink">Vivabox × {quantity}</p>
                <Link href={`/cajas/${box.slug}`} className="text-xs text-[#6B6B6B] underline">
                  Modificar cantidad
                </Link>
              </div>
              <span className="text-[22px] lg:text-[26px] font-extrabold tracking-tight text-ink shrink-0">
                ${formatPrice(subtotal)}
              </span>
            </div>
          </div>

          {/* RIGHT — una sola página : dónde, tipo de envío, total */}
          <div className="space-y-4 animate-step" style={{ animationDelay: "120ms" }}>

            {/* ¿DÓNDE LA ENVIAMOS? */}
            <div className="vb-card p-4 sm:p-5 space-y-3">
              <h2 className="text-lg font-bold text-ink tracking-tight px-0.5">¿Dónde la enviamos?</h2>

              <div className="grid grid-cols-2 gap-2.5">
                <label className="vb-tile">
                  <input
                    type="radio"
                    name="destination"
                    checked={deliveryDestination === "self"}
                    onChange={() => setDestination("self")}
                  />
                  <span className="vb-tile-icon"><Home size={17} strokeWidth={1.85} /></span>
                  <span className="text-sm font-bold text-ink leading-tight">En mi dirección</span>
                </label>
                <label className="vb-tile">
                  <input
                    type="radio"
                    name="destination"
                    checked={deliveryDestination === "recipient"}
                    onChange={() => setDestination("recipient")}
                  />
                  <span className="vb-tile-icon"><Gift size={17} strokeWidth={1.85} /></span>
                  <span className="text-sm font-bold text-ink leading-tight">A quien la recibe</span>
                </label>
              </div>

              {/* ANIMATED EXPAND — CSS grid-rows accordion, no JS height calc needed */}
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  deliveryDestination ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  {deliveryDestination === "self" && (
                    <div className="vb-panel space-y-3">
                      <GroupLabel>Tus datos</GroupLabel>
                      <Field
                        label="Nombre completo"
                        placeholder="Tu nombre"
                        autoComplete="name"
                        value={buyerName}
                        onChange={(e) => setBuyerField({ name: e.target.value })}
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field
                          label="WhatsApp"
                          type="tel"
                          placeholder="300 123 4567"
                          autoComplete="tel"
                          value={buyerPhone}
                          onChange={(e) => setBuyerField({ phone: e.target.value })}
                        />
                        <Field
                          label="Email"
                          type="email"
                          placeholder="tu@email.com"
                          autoComplete="email"
                          value={buyerEmail}
                          onChange={(e) => setBuyerField({ email: e.target.value })}
                        />
                      </div>
                      <div className="pt-2"><GroupLabel>Dirección de entrega</GroupLabel></div>
                      {addressFields}
                    </div>
                  )}

                  {deliveryDestination === "recipient" && (
                    <div className="vb-panel space-y-3">
                      <GroupLabel>Quien la recibe</GroupLabel>
                      <div className="grid grid-cols-2 gap-3">
                        <Field
                          label="Su nombre"
                          placeholder="Nombre"
                          value={recipientName}
                          onChange={(e) => setRecipientField({ name: e.target.value })}
                        />
                        <Field
                          label="Su WhatsApp"
                          type="tel"
                          placeholder="300 123 4567"
                          value={recipientPhone}
                          onChange={(e) => setRecipientField({ phone: e.target.value })}
                        />
                      </div>
                      {addressFields}
                      <p className="text-xs text-[#6B6B6B] leading-relaxed">
                        Su WhatsApp es solo para coordinar la entrega. No le contamos nada de la sorpresa.
                      </p>

                      <div className="pt-2"><GroupLabel>Tus datos</GroupLabel></div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field
                          label="Tu nombre"
                          placeholder="Nombre completo"
                          autoComplete="name"
                          value={buyerName}
                          onChange={(e) => setBuyerField({ name: e.target.value })}
                        />
                        <Field
                          label="Tu email"
                          type="email"
                          placeholder="tu@email.com"
                          autoComplete="email"
                          value={buyerEmail}
                          onChange={(e) => setBuyerField({ email: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TIPO DE ENVÍO */}
            <div className="vb-card p-4 sm:p-5 space-y-2.5">
              <h2 className="text-lg font-bold text-ink tracking-tight px-0.5 pb-0.5">Tipo de envío</h2>

              <label className="vb-tile">
                <input
                  type="radio"
                  name="speed"
                  checked={!sameDaySelected}
                  onChange={() => setSameDay(false)}
                />
                <span className="vb-tile-icon"><Truck size={17} strokeWidth={1.85} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-ink">Envío estándar</span>
                  <span className="block text-xs text-[#6B6B6B] mt-0.5">
                    {deliveryEstimate} · {deliveryIncluded ? "Incluido" : `$${formatPrice(baseDelivery)}`}
                  </span>
                </span>
                <TileRadio />
              </label>

              {sameDayOffered ? (
                <label className="vb-tile">
                  <input
                    type="radio"
                    name="speed"
                    checked={sameDaySelected}
                    disabled={!sameDayAvailable}
                    onChange={() => setSameDay(true)}
                  />
                  <span className="vb-tile-icon"><Zap size={17} strokeWidth={1.85} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-ink">Envío el mismo día</span>
                    <span className="block text-xs text-[#6B6B6B] mt-0.5">
                      {sameDayAvailable ? SAME_DAY_PROMISE : SAME_DAY_AVAILABILITY_HINT}
                    </span>
                  </span>
                  <span className="text-sm font-bold text-ink shrink-0">+${formatPrice(SAME_DAY_PRICE_COP)}</span>
                  <TileRadio />
                </label>
              ) : (
                <p className="text-xs text-[#6B6B6B] px-1">
                  El envío el mismo día solo está disponible en Bogotá.
                </p>
              )}
            </div>

            {/* TOTAL */}
            <div className="vb-card p-4 sm:p-5 space-y-3">
              <div className="space-y-1.5 text-sm text-[#6B6B6B]">
                <div className="flex justify-between">
                  <span>Vivabox × {quantity}</span>
                  <span>${formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{sameDaySelected ? "Envío el mismo día" : "Envío"}</span>
                  <span>{delivery === 0 ? "Incluido" : `+$${formatPrice(delivery)}`}</span>
                </div>
                {hasBenefit && (
                  <div className="flex justify-between text-green-700">
                    <span>Beneficio</span>
                    <span>−${formatPrice(discount)}</span>
                  </div>
                )}
              </div>

              <div className="vb-well px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-medium text-ink">Total</span>
                <span className="text-2xl font-semibold text-ink tracking-tight">${formatPrice(displayTotal)}</span>
              </div>

              {promoBlock}

              <div className="hidden lg:block pt-1">
                <button
                  onClick={handleGoToPayment}
                  disabled={loading}
                  className="vb-btn-primary h-12 w-full disabled:opacity-60"
                >
                  {payLabel}
                </button>
                {missingMessage}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs font-medium text-ink/75">
              <span className="inline-flex items-center gap-1.5">
                <Lock size={13} strokeWidth={2} className="text-primary shrink-0" />
                Pago seguro
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={13} strokeWidth={2} className="text-green-700 shrink-0" />
                Entrega garantizada
              </span>
            </div>
          </div>

        </div>
        </div>
      </div>

      {/* STICKY CTA — solo móvil ; en escritorio el botón vive en la tarjeta del total */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 vb-sticky-bar px-4 pt-3" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-[#6B6B6B] leading-tight">Total</p>
            <p className="font-semibold text-ink leading-tight truncate">${formatPrice(displayTotal)}</p>
          </div>
          <button
            onClick={handleGoToPayment}
            disabled={loading}
            className="vb-btn-primary h-12 px-8 shrink-0 disabled:opacity-60"
          >
            {payLabel}
          </button>
        </div>
        {missingMessage}
      </div>

    </section>
  )
}
