"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import Script from "next/script"
import { useState, useEffect, useMemo, type ReactNode } from "react"
import { useCheckoutStore } from "@/features/checkout/checkoutStore"
import { formatPrice } from "@/utils/formatPrice"
import CheckoutProgress from "../../CheckoutProgress"
import VivaboxLoader from "@/components/ui/VivaboxLoader"
import { useMinDisplayTime } from "@/components/ui/useMinDisplayTime"
import {
  Lock,
  Loader2,
  ChevronRight,
  CreditCard,
  Smartphone,
  Landmark,
  Wallet,
  QrCode,
  AlertCircle,
} from "lucide-react"

type PaymentMethodMeta = {
  label: string
  icon: ReactNode
}

// Etiquetas/iconos para los códigos que Wompi puede devolver en
// /merchants/:publicKey. Un código desconocido simplemente no se muestra —
// nunca inventamos un método que no reconocemos.
const PAYMENT_METHOD_META: Record<string, PaymentMethodMeta> = {
  CARD: { label: "Tarjeta débito o crédito", icon: <CreditCard size={18} strokeWidth={1.75} /> },
  NEQUI: { label: "Nequi", icon: <Smartphone size={18} strokeWidth={1.75} /> },
  PSE: { label: "PSE", icon: <Landmark size={18} strokeWidth={1.75} /> },
  BANCOLOMBIA_TRANSFER: { label: "Bancolombia", icon: <Landmark size={18} strokeWidth={1.75} /> },
  BANCOLOMBIA_QR: { label: "Bancolombia QR", icon: <QrCode size={18} strokeWidth={1.75} /> },
  BANCOLOMBIA_COLLECT: { label: "Corresponsal Bancolombia", icon: <Landmark size={18} strokeWidth={1.75} /> },
  DAVIPLATA: { label: "Daviplata", icon: <Wallet size={18} strokeWidth={1.75} /> },
}

// Los 3 métodos que se muestran siempre primero cuando están disponibles;
// el resto queda detrás de "Ver más métodos".
const PRIMARY_METHODS = ["CARD", "NEQUI", "PSE"]

// Solo se usa si /api/checkout/wompi/methods no responde (Wompi caído o
// error de red) — nunca reemplaza la consulta real, es la última defensa
// para no dejar la pantalla vacía.
const FALLBACK_METHODS = ["CARD", "NEQUI", "PSE"]

export default function PagoPage() {
  const router = useRouter()

  // ======================
  // STORE (SELECTORS CLEAN)
  // ======================
  const box = useCheckoutStore(s => s.box)
  const quantity = useCheckoutStore(s => s.quantity)

  const deliveryMethod = useCheckoutStore(s => s.deliveryMethod)

  const ventaId = useCheckoutStore(s => s.ventaId)
  const pricing = useCheckoutStore(s => s.pricing)
  const hasHydrated = useCheckoutStore(s => s.hasHydrated)

  const [loading, setLoading] = useState(false)
  const [widgetReady, setWidgetReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableMethods, setAvailableMethods] = useState<string[] | null>(null)
  const [showAllMethods, setShowAllMethods] = useState(false)

  // ======================
  // GUARDS
  // ======================
  useEffect(() => {
    if (!hasHydrated) return

    if (!box || !ventaId) {
      router.replace("/cajas")
    }
  }, [hasHydrated, box, ventaId, router])

  // Métodos de pago realmente disponibles en nuestro comercio Wompi — nunca
  // hardcodeados como fuente principal, solo como fallback si la consulta falla.
  useEffect(() => {
    let cancelled = false

    fetch("/api/checkout/wompi/methods")
      .then(res => res.json())
      .then(data => {
        if (cancelled) return
        const methods = Array.isArray(data?.methods) ? data.methods : []
        setAvailableMethods(methods.length > 0 ? methods : FALLBACK_METHODS)
      })
      .catch(() => {
        if (!cancelled) setAvailableMethods(FALLBACK_METHODS)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const { primaryMethods, extraMethods } = useMemo(() => {
    const known = (availableMethods ?? []).filter(m => PAYMENT_METHOD_META[m])
    const pool = known.length > 0 ? known : FALLBACK_METHODS

    return {
      primaryMethods: PRIMARY_METHODS.filter(m => pool.includes(m)),
      extraMethods: pool.filter(m => !PRIMARY_METHODS.includes(m)),
    }
  }, [availableMethods])

  // Guarantees the loader stays mounted at least one full fill lap (~950ms)
  // even if the store hydrates almost instantly — otherwise it gets swapped
  // out after only the first color or two has appeared.
  const minVisible = useMinDisplayTime(hasHydrated && !!box && !!ventaId, 1130)

  if (!hasHydrated || !box || !ventaId || !minVisible) {
    return (
      <div className="min-h-screen vb-surface-base flex items-center justify-center">
        <VivaboxLoader size={72} />
      </div>
    )
  }

  // 🔥 TS SAFE
  const safeBox = box

  // 🔴 NO FALLBACK → backend only
  if (!pricing) {
    return <div className="min-h-screen vb-surface-base flex items-center justify-center text-[#6B6B6B]">Cargando precio...</div>
  }

  const { subtotal, delivery, total } = pricing

  // ======================
  // LABEL
  // ======================
  function getDeliveryLabel() {
    if (deliveryMethod === "digital") return "Digital"
    if (deliveryMethod === "retiro") return "Retiro"
    return "Domicilio"
  }

  // ======================
  // PAY — abre el Widget Wompi (motor real de pago; el Widget conserva su
  // propia UI nativa de selección de método, no la clonamos aquí)
  // ======================
  async function handlePayment() {
    if (loading) return

    if (!ventaId) {
      setError("Error interno: falta la referencia de tu pedido.")
      return
    }

    if (!widgetReady || !window.WidgetCheckout) {
      setError("El módulo de pago todavía se está cargando, intenta de nuevo en un momento.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/checkout/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ventaId }),
      })

      const data = await res.json()

      if (!data.ok) {
        if (data.error === "RESERVATION_EXPIRED") {
          setError("Tu reserva expiró. Vuelve a elegir tu Vivabox.")
          setLoading(false)
          setTimeout(() => router.replace("/cajas"), 1500)
          return
        }

        if (data.error === "ALREADY_PAID") {
          const urlDeliveryType = deliveryMethod === "digital" ? "digital" : "physical"
          router.replace(
            `/checkout/success?ventaId=${ventaId}&quantity=${quantity}&deliveryType=${urlDeliveryType}`
          )
          return
        }

        setError("No pudimos procesar tu pago. Puedes intentarlo de nuevo o elegir otro medio de pago.")
        setLoading(false)
        return
      }

      const { publicKey, currency, amountInCents, reference, signature, redirectUrl } = data.wompi

      const checkout = new window.WidgetCheckout({
        currency,
        amountInCents,
        reference,
        publicKey,
        redirectUrl,
        signature: { integrity: signature },
      })

      checkout.open((result) => {
        setLoading(false)

        // El usuario cerró el widget sin completar el pago (ej. Nequi/PSE
        // en curso o abandonado) — se queda en esta pantalla para reintentar,
        // la reserva (ventaId) sigue viva.
        if (!result?.transaction) return

        router.replace(
          `/checkout/pago/retorno?ventaId=${ventaId}&id=${result.transaction.id}`
        )
      })

    } catch (err) {
      console.error("Payment error:", err)
      setError("No pudimos conectar con el servidor de pago. Revisa tu conexión e intenta de nuevo.")
      setLoading(false)
    }
  }

  const methodRows = [...primaryMethods, ...(showAllMethods ? extraMethods : [])]

  // ======================
  // UI
  // ======================
  return (
    <>
      <Script
        src="https://checkout.wompi.co/widget.js"
        strategy="afterInteractive"
        onLoad={() => setWidgetReady(true)}
      />

      <CheckoutProgress current="pagar" />

      <div className="min-h-screen vb-surface-base py-10 checkout-container">

        <div className="vb-card p-6 space-y-5 max-w-[440px] mx-auto">

          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink flex items-center gap-2">
              <Lock size={16} strokeWidth={2} className="text-primary shrink-0" />
              Pago seguro
            </h2>
            <span className="text-xs text-[#6B6B6B]">
              Wompi
            </span>
          </div>

          {/* MÉTODOS — cada fila abre el mismo Widget Wompi real; Wompi no
              permite saltar directo a un método desde su SDK, así que todas
              llevan al mismo flujo verdadero en vez de simular una elección
              que no existe. */}
          <div className="space-y-2.5">
            <p className="text-sm font-medium text-ink">¿Cómo quieres pagar?</p>

            {availableMethods === null ? (
              <div className="space-y-2" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-[58px] rounded-[18px] bg-black/[0.04] animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {methodRows.map((code) => {
                  const meta = PAYMENT_METHOD_META[code]
                  if (!meta) return null

                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={handlePayment}
                      disabled={loading || !widgetReady}
                      className="vb-pay-method"
                    >
                      <span className="vb-pay-method-icon">{meta.icon}</span>
                      <span className="text-sm text-ink flex-1 text-left">{meta.label}</span>
                      {loading ? (
                        <Loader2 size={16} strokeWidth={2} className="animate-spin text-[#6B6B6B] shrink-0" />
                      ) : (
                        <ChevronRight size={16} strokeWidth={2} className="text-[#6B6B6B] shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {!showAllMethods && extraMethods.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAllMethods(true)}
                className="text-xs text-[#6B6B6B] underline block"
              >
                Ver más métodos
              </button>
            )}
          </div>

          {/* RESUMEN */}
          <div className="pt-4 vb-divider-top space-y-3">

            <h3 className="font-semibold text-ink text-sm">
              Resumen
            </h3>

            <div className="flex justify-between text-sm text-[#6B6B6B]">
              <span>{safeBox.name} x{quantity}</span>
              <span>${formatPrice(subtotal)}</span>
            </div>

            <div className="flex justify-between text-sm text-[#6B6B6B]">
              <span>Envío ({getDeliveryLabel()})</span>
              <span>
                {delivery === 0 ? "Gratis" : `+$${formatPrice(delivery)}`}
              </span>
            </div>

            <div className="pt-3 vb-divider-top flex justify-between font-semibold text-lg text-ink">
              <span>Total</span>
              <span>${formatPrice(total)}</span>
            </div>

          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-accent-red bg-accent-red/10 rounded-[14px] p-3">
              <AlertCircle size={16} strokeWidth={2} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading || !widgetReady}
            className="vb-btn-primary w-full h-12 disabled:opacity-60"
          >
            {loading ? (
              <>
                Procesando...
                <Loader2 size={18} strokeWidth={2} className="animate-spin" />
              </>
            ) : (
              <>
                Pagar ${formatPrice(total)}
                <Lock size={18} strokeWidth={2} className="vb-cta-icon" />
              </>
            )}
          </button>

          <p className="text-xs text-[#6B6B6B] text-center">
            Pago seguro con Wompi
          </p>

          <p className="text-[11px] text-[#6B6B6B] text-center leading-relaxed">
            Al pagar aceptas los{" "}
            <Link href="/terminos-y-condiciones" target="_blank" className="underline underline-offset-2 hover:text-ink">
              Términos y condiciones
            </Link>{" "}
            y reconoces nuestra{" "}
            <Link href="/politica-de-datos" target="_blank" className="underline underline-offset-2 hover:text-ink">
              Política de tratamiento de datos
            </Link>
            .
          </p>

        </div>

      </div>
    </>
  )
}
