"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { formatPrice } from "@/utils/formatPrice"
import { useCheckoutStore } from "@/features/checkout/checkoutStore"
import CheckoutSummary from "@/app/checkout/components/CheckoutSummary"
import WelcomeShippingModal from "@/app/checkout/components/WelcomeShippingModal"

import { Truck, Home, Gift } from "lucide-react"

type CheckoutBox = {
  slug: string
  name: string
  price: number
  image?: string
}

type Props = {
  box: CheckoutBox
}

const DELIVERY_PRICE = 15000

export default function CheckoutStep({ box }: Props) {
  const router = useRouter()
  const [welcomeOpen, setWelcomeOpen] = useState(false)
  const [promoInput, setPromoInput] = useState("")
  const [promoChecking, setPromoChecking] = useState(false)
  const [promoError, setPromoError] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [promoOpen, setPromoOpen] = useState(false)

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

  const firstPurchaseEmail = useCheckoutStore(s => s.firstPurchaseEmail)
  const firstPurchaseApplied = useCheckoutStore(s => s.firstPurchaseApplied)
  const setFirstPurchase = useCheckoutStore(s => s.setFirstPurchase)
  const codes = useCheckoutStore(s => s.codes)
  const setCodes = useCheckoutStore(s => s.setCodes)

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

  // Prefill buyer email from first-purchase benefit, only once
  useEffect(() => {
    if (firstPurchaseApplied && firstPurchaseEmail && !buyerEmail) {
      setBuyer({ name: buyerName, email: firstPurchaseEmail, phone: "" })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstPurchaseApplied, firstPurchaseEmail])

  // ======================
  // ESTIMATED PRICING
  // ======================

  function getEstimatedPricing() {
    const subtotal = box.price * quantity
    const delivery = DELIVERY_PRICE

    return {
      subtotal,
      delivery,
      total: subtotal + delivery,
    }
  }

  const estimatedPricing = getEstimatedPricing()

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

  function handleWelcomeSuccess(email: string, code: string) {
    setFirstPurchase(email, true)
    setCodes([code])
  }

  // ======================
  // SUBMIT
  // ======================

  const needsAddress = true // MVP: domicilio única opción

  const hasDiscount = promoApplied || firstPurchaseApplied

  const normalizedCity = city
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
  // La mayoría de los clientes son de Bogotá — se asume Bogotá por defecto
  // hasta que la ciudad escrita demuestre lo contrario.
  const isOutsideBogota = normalizedCity.length > 0 && !normalizedCity.includes("bogota")
  const deliveryEstimate = isOutsideBogota ? "2–4 días hábiles" : "1–2 días hábiles"

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

  // Une seule promo à la fois : le code tapé à la main a priorité, sinon le
  // code du bénéfice première commande (les deux sont mutuellement
  // exclusifs dans le store, voir setPromo/setFirstPurchase).
  const activePromoCode = promoApplied ? promoCode : (firstPurchaseApplied ? codes[0] : null)

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
          delivery: { type: "physical", speed: "outside" },
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
        setFirstPurchase("", false)
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

  return (
    <section className="pt-2 pb-28 lg:pb-10">
      <div className="checkout-container">

        <Link href={`/cajas/${box.slug}`} className="text-sm text-[#6B6B6B] mb-3 inline-block">
          ← Volver
        </Link>

        {/* PRODUCT + PROMOTIONS — same frame */}
        <div
          className="checkout-card p-4 mb-5 space-y-4 animate-step"
          style={{ animationDelay: "0ms" }}
        >
          <div className="flex items-center gap-4">

            {box.image && (
              <Image
                src={box.image}
                alt={box.name}
                width={68}
                height={68}
                className="shrink-0 rounded-xl object-contain drop-shadow-[0_8px_16px_rgba(24,20,15,0.12)]"
              />
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <h1 className="font-semibold text-ink truncate">Vivabox</h1>
                <span className="font-medium text-ink/80 shrink-0">${formatPrice(box.price)}</span>
              </div>

              <div className="flex items-center justify-between gap-3 mt-0.5">
                <p className="text-xs text-[#6B6B6B]">Caja física incluida</p>

                <p className="text-xs text-[#6B6B6B] shrink-0">
                  {quantity} Vivabox ·{" "}
                  <Link href={`/cajas/${box.slug}`} className="underline">
                    Modificar
                  </Link>
                </p>
              </div>
            </div>

          </div>

          <div className="pt-3 border-t border-[#ECECEC]">
            {promoApplied ? (
              <div className="text-xs text-green-700">
                ✓ Código aplicado — Envío incluido
              </div>
            ) : firstPurchaseApplied ? (
              <div className="text-xs text-green-700">
                ✓ Beneficio de primera compra aplicado — Envío incluido
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-2xl bg-[#FFF4EC] p-4 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Gift size={16} strokeWidth={2} className="text-primary shrink-0" />
                    <p className="text-sm font-semibold text-ink">
                      Ahorra ${formatPrice(DELIVERY_PRICE)} en tu primera compra
                    </p>
                  </div>
                  <p className="text-xs text-[#6B6B6B]">
                    Envío gratis solo por ser nueva/o en Vivabox. Sin tarjeta ni contraseña, solo tu email.
                  </p>
                  <button
                    onClick={() => setWelcomeOpen(true)}
                    className="checkout-btn-primary w-full h-10 text-sm"
                  >
                    Obtener envío incluido
                  </button>
                </div>

                {promoOpen ? (
                  <div>
                    <p className="text-xs font-medium text-[#6B6B6B] mb-2">
                      ¿Tienes un código? Obtén el envío gratis (−${formatPrice(DELIVERY_PRICE)}).
                    </p>
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
                        className="checkout-input flex-1 text-sm"
                        autoFocus
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={promoChecking || !promoInput.trim()}
                        className="px-4 rounded-2xl border border-[#ECECEC] text-sm font-medium text-ink transition hover:bg-black/[0.02] active:scale-[0.98] disabled:opacity-50"
                      >
                        {promoChecking ? "..." : "Aplicar"}
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-xs text-accent-red mt-1.5">{promoError}</p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setPromoOpen(true)}
                    className="text-xs text-[#6B6B6B] underline block mx-auto"
                  >
                    ¿Tienes un código promocional?
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* GRID */}
        <div className="grid lg:grid-cols-[1fr_360px] gap-6 max-w-[1050px] mx-auto">

          {/* LEFT */}
          <div className="space-y-4">

            {/* DELIVERY + DESTINATION */}
            <div
              className="checkout-card p-5 space-y-4 animate-step"
              style={{ animationDelay: "60ms" }}
            >
              <div>
                <p className="font-semibold text-ink text-sm">¿Dónde la enviamos?</p>
                <p className="flex items-center gap-1.5 text-xs text-[#6B6B6B] mt-1">
                  <Truck size={14} strokeWidth={1.75} className="text-primary shrink-0" />
                  {hasDiscount ? (
                    <>
                      Envío a domicilio ·{" "}
                      <span className="line-through opacity-60">${formatPrice(DELIVERY_PRICE)}</span>{" "}
                      <span className="text-green-700 font-medium">Gratis</span> · {deliveryEstimate}
                    </>
                  ) : (
                    <>Envío a domicilio · ${formatPrice(DELIVERY_PRICE)} · {deliveryEstimate}</>
                  )}
                </p>
              </div>

              <div className="pt-3 space-y-3 border-t border-[#ECECEC]">
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      checked={deliveryDestination === "self"}
                      onChange={() => setDestination("self")}
                      className="accent-primary"
                    />
                    <Home size={16} strokeWidth={1.75} className="text-primary" />
                    <span className="text-sm">En mi dirección</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      checked={deliveryDestination === "recipient"}
                      onChange={() => setDestination("recipient")}
                      className="accent-primary"
                    />
                    <Gift size={16} strokeWidth={1.75} className="text-primary" />
                    <span className="text-sm">Directamente a quien la recibe</span>
                  </label>
                </div>

                {/* ANIMATED EXPAND — CSS grid-rows accordion, no JS height calc needed */}
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    deliveryDestination ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pt-3 space-y-3 border-t border-[#ECECEC]">
                      {deliveryDestination === "recipient" && (
                        <>
                          <input
                            type="text"
                            placeholder="Nombre"
                            value={recipientName}
                            onChange={(e) => setRecipientInfo({ name: e.target.value, phone: recipientPhone })}
                            className="checkout-input"
                          />
                          <input
                            type="text"
                            placeholder="WhatsApp"
                            value={recipientPhone}
                            onChange={(e) => setRecipientInfo({ name: recipientName, phone: e.target.value })}
                            className="checkout-input"
                          />
                        </>
                      )}

                      <input
                        type="text"
                        placeholder="Dirección"
                        value={address}
                        onChange={(e) => setAddressInfo({ address: e.target.value, city, addressExtra })}
                        className="checkout-input"
                      />
                      <input
                        type="text"
                        placeholder="Ciudad"
                        value={city}
                        onChange={(e) => setAddressInfo({ address, city: e.target.value, addressExtra })}
                        className="checkout-input"
                      />
                      <input
                        type="text"
                        placeholder="Detalles adicionales (opcional)"
                        value={addressExtra}
                        onChange={(e) => setAddressInfo({ address, city, addressExtra: e.target.value })}
                        className="checkout-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* BUYER — merged into the same card */}
              <div className="pt-3 space-y-3 border-t border-[#ECECEC]">
                <p className="font-semibold text-ink text-sm">Tus datos de contacto</p>

                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={buyerName}
                  onChange={(e) => setBuyer({ name: e.target.value, email: buyerEmail, phone: buyerPhone })}
                  className="checkout-input"
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={buyerEmail}
                  onChange={(e) => setBuyer({ name: buyerName, email: e.target.value, phone: buyerPhone })}
                  className="checkout-input"
                />

                <input
                  type="text"
                  placeholder="WhatsApp"
                  value={buyerPhone}
                  onChange={(e) => setBuyer({ name: buyerName, email: buyerEmail, phone: e.target.value })}
                  className="checkout-input"
                />
              </div>
            </div>

          </div>

          {/* RIGHT */}
          <div
            className="space-y-3 animate-step"
            style={{ animationDelay: "240ms" }}
          >

            <CheckoutSummary estimatedPricing={estimatedPricing} />

            <button
              onClick={handleGoToPayment}
              disabled={loading}
              className="hidden lg:block checkout-btn-primary w-full h-12 disabled:opacity-60"
            >
              {loading ? "Procesando..." : "Ir a pagar"}
            </button>

            {submitAttempted && missingFields.length > 0 && (
              <p className="hidden lg:block text-xs text-accent-red text-center">
                Falta completar: {missingFields.join(", ")}.
              </p>
            )}

            <div className="text-xs text-[#6B6B6B]/70 text-center space-y-1">
              <p>🔒 Pago seguro</p>
              <p>✔ Entrega garantizada</p>
              <p>✔ Lo completas después</p>
            </div>

          </div>

        </div>

      </div>

      {/* MOBILE STICKY CTA — total + pay button always reachable without scrolling */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-sm border-t border-[#ECECEC] px-4 pt-3 shadow-[0_-8px_24px_rgba(24,20,15,0.06)]" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
        <div className="flex items-center gap-3 max-w-[1050px] mx-auto">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-[#6B6B6B] leading-tight">Total</p>
            <p className="font-semibold text-ink leading-tight truncate">${formatPrice(estimatedPricing.total)}</p>
          </div>
          <button
            onClick={handleGoToPayment}
            disabled={loading}
            className="checkout-btn-primary h-12 px-8 shrink-0 disabled:opacity-60"
          >
            {loading ? "Procesando..." : "Ir a pagar"}
          </button>
        </div>
        {submitAttempted && missingFields.length > 0 && (
          <p className="text-[11px] text-accent-red text-center mt-1.5 max-w-[1050px] mx-auto">
            Falta completar: {missingFields.join(", ")}.
          </p>
        )}
      </div>

      {welcomeOpen && (
        <WelcomeShippingModal
          onClose={() => setWelcomeOpen(false)}
          onSuccess={handleWelcomeSuccess}
        />
      )}

    </section>
  )
}
