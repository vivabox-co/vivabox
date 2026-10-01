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
import CheckoutSummary from "@/app/checkout/components/CheckoutSummary"

import { Truck, Zap, Home, Gift, ArrowRight, Lock, CheckCircle2, Loader2 } from "lucide-react"

type CheckoutBox = {
  slug: string
  name: string
  price: number
  image?: string
}

type Props = {
  box: CheckoutBox
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
  const { displayTotal } = useDisplayPricing(estimatedPricing)

  const missingFields: string[] = []
  if (!buyerName) missingFields.push("tu nombre")
  if (!buyerEmail) missingFields.push("tu email")
  if (needsAddress) {
    if (!deliveryDestination) missingFields.push("cómo quieres recibirla")
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

  const productRow = (
    <div className="flex items-center gap-3">
      {box.image && (
        <span className="vb-thumb shrink-0">
          <Image
            src={box.image}
            alt={box.name}
            width={48}
            height={48}
            className="rounded-xl object-contain"
          />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-semibold text-ink text-sm">Vivabox × {quantity}</p>
          <span className="font-medium text-ink/80 text-sm shrink-0">${formatPrice(box.price * quantity)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 mt-0.5">
          <p className="text-xs text-[#6B6B6B]">Caja física incluida</p>
          <Link href={`/cajas/${box.slug}`} className="text-xs text-[#6B6B6B] underline shrink-0">
            Modificar
          </Link>
        </div>
      </div>
    </div>
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

        <Link href={`/cajas/${box.slug}`} className="text-sm text-[#6B6B6B] mb-4 inline-block">
          ← Volver
        </Link>

        {/* GRID — una sola cuadrícula: formulario | resumen */}
        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">

          {/* LEFT */}
          <div
            className="vb-card p-5 sm:p-6 space-y-6 animate-step"
            style={{ animationDelay: "60ms" }}
          >

            {/* ENTREGA */}
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-ink text-sm">¿Dónde la enviamos?</p>
                <p className="flex items-center gap-1.5 text-xs text-[#6B6B6B] mt-1">
                  <Truck size={14} strokeWidth={1.75} className="text-primary shrink-0" />
                  {deliveryIncluded ? (
                    <>Envío incluido · {deliveryEstimate}</>
                  ) : (
                    <>Envío a domicilio · ${formatPrice(deliveryPriceFor(quantity))} · {deliveryEstimate}</>
                  )}
                </p>
              </div>

              {sameDayOffered && (
                <label
                  className={`vb-choice ${sameDayAvailable ? "" : "opacity-60 cursor-not-allowed"}`}
                >
                  <input
                    type="checkbox"
                    checked={sameDaySelected}
                    disabled={!sameDayAvailable}
                    onChange={(e) => setSameDay(e.target.checked)}
                  />
                  <span className="vb-choice-icon"><Zap size={16} strokeWidth={1.75} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3 text-sm">
                      <span>Envío el mismo día</span>
                      <span className="font-medium">+${formatPrice(SAME_DAY_PRICE_COP)}</span>
                    </span>
                    <span className="block text-xs text-[#6B6B6B] mt-0.5">
                      {sameDayAvailable ? SAME_DAY_PROMISE : SAME_DAY_AVAILABILITY_HINT}
                    </span>
                  </span>
                </label>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="vb-choice">
                  <input
                    type="radio"
                    checked={deliveryDestination === "self"}
                    onChange={() => setDestination("self")}
                  />
                  <span className="vb-choice-icon"><Home size={16} strokeWidth={1.75} /></span>
                  <span className="text-sm">En mi dirección</span>
                </label>

                <label className="vb-choice">
                  <input
                    type="radio"
                    checked={deliveryDestination === "recipient"}
                    onChange={() => setDestination("recipient")}
                  />
                  <span className="vb-choice-icon"><Gift size={16} strokeWidth={1.75} /></span>
                  <span className="text-sm">A quien la recibe</span>
                </label>
              </div>

              {/* ANIMATED EXPAND — CSS grid-rows accordion, no JS height calc needed */}
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  deliveryDestination ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="space-y-3">
                    {deliveryDestination === "recipient" && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          placeholder="Nombre de quien la recibe"
                          value={recipientName}
                          onChange={(e) => setRecipientInfo({ name: e.target.value, phone: recipientPhone })}
                          className="vb-input"
                        />
                        <input
                          type="text"
                          placeholder="WhatsApp de quien la recibe"
                          value={recipientPhone}
                          onChange={(e) => setRecipientInfo({ name: recipientName, phone: e.target.value })}
                          className="vb-input"
                        />
                      </div>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        placeholder="Dirección"
                        value={address}
                        onChange={(e) => setAddressInfo({ address: e.target.value, city, addressExtra })}
                        className="vb-input"
                      />
                      <input
                        type="text"
                        placeholder="Ciudad"
                        value={city}
                        onChange={(e) => setAddressInfo({ address, city: e.target.value, addressExtra })}
                        className="vb-input"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Detalles adicionales (opcional)"
                      value={addressExtra}
                      onChange={(e) => setAddressInfo({ address, city, addressExtra: e.target.value })}
                      className="vb-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* TUS DATOS */}
            <div className="pt-6 vb-divider-top space-y-3">
              <p className="font-semibold text-ink text-sm">Tus datos de contacto</p>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={buyerName}
                  onChange={(e) => setBuyer({ name: e.target.value, email: buyerEmail, phone: buyerPhone })}
                  className="vb-input"
                />
                <input
                  type="text"
                  placeholder="WhatsApp"
                  value={buyerPhone}
                  onChange={(e) => setBuyer({ name: buyerName, email: buyerEmail, phone: e.target.value })}
                  className="vb-input"
                />
              </div>

              <input
                type="email"
                placeholder="Email"
                value={buyerEmail}
                onChange={(e) => setBuyer({ name: buyerName, email: e.target.value, phone: buyerPhone })}
                className="vb-input"
              />
            </div>

          </div>

          {/* RIGHT — resumen con producto, código y CTA */}
          <div
            className="animate-step lg:sticky lg:top-24 space-y-3"
            style={{ animationDelay: "240ms" }}
          >
            <CheckoutSummary
              estimatedPricing={estimatedPricing}
              top={productRow}
              bottom={
                <div className="space-y-3">
                  <div className="pt-3 vb-divider-top">{promoBlock}</div>
                  <div className="hidden lg:block">
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
              }
            />

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs font-medium text-ink/75">
              <span className="inline-flex items-center gap-1.5">
                <Lock size={13} strokeWidth={2} className="text-primary shrink-0" />
                Pago seguro
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={13} strokeWidth={2} className="text-green-700 shrink-0" />
                Entrega garantizada
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={13} strokeWidth={2} className="text-green-700 shrink-0" />
                Tu mensaje, después
              </span>
            </div>
          </div>

        </div>
        </div>
      </div>

      {/* STICKY CTA — solo móvil ; en escritorio el botón vive en el resumen */}
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
