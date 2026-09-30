"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import Script from "next/script"
import { useState, useEffect, useRef } from "react"
import { useCheckoutStore } from "@/features/checkout/checkoutStore"
import { formatPrice } from "@/utils/formatPrice"
import { whatsappLink } from "@/utils/whatsappLink"
import CheckoutProgress from "../../CheckoutProgress"
import VivaboxLoader from "@/components/ui/VivaboxLoader"
import { useMinDisplayTime } from "@/components/ui/useMinDisplayTime"
import { Lock, AlertCircle, MessageCircle } from "lucide-react"

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
  // true una vez que el cliente cerró el widget sin pagar → pantalla de reintento
  const [dismissed, setDismissed] = useState(false)

  // El widget se abre solo una vez al llegar; después solo el cliente lo reabre.
  const autoOpened = useRef(false)

  // ======================
  // GUARDS
  // ======================
  useEffect(() => {
    if (!hasHydrated) return

    if (!box || !ventaId) {
      router.replace("/cajas")
    }
  }, [hasHydrated, box, ventaId, router])

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
      setDismissed(true)
      return
    }

    setLoading(true)
    setError(null)
    setDismissed(false)

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
          setDismissed(true)
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

        setError("No pudimos procesar tu pago. Puedes intentarlo de nuevo.")
        setLoading(false)
        setDismissed(true)
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
        if (!result?.transaction) {
          setDismissed(true)
          return
        }

        router.replace(
          `/checkout/pago/retorno?ventaId=${ventaId}&id=${result.transaction.id}`
        )
      })

    } catch (err) {
      console.error("Payment error:", err)
      setError("No pudimos conectar con el servidor de pago. Revisa tu conexión e intenta de nuevo.")
      setLoading(false)
      setDismissed(true)
    }
  }

  // Abre Wompi automáticamente en cuanto todo está listo (store hidratado,
  // precio del backend y script del widget cargado).
  const ready = hasHydrated && !!box && !!ventaId && !!pricing && widgetReady

  useEffect(() => {
    if (!ready || autoOpened.current) return
    autoOpened.current = true
    handlePayment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

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

      {/* Mientras el widget Wompi se abre / está abierto, solo el loader de
          Vivabox: el widget ya muestra el monto, así que la tarjeta detrás
          sería un doble. La tarjeta solo aparece si se cierra sin pagar. */}
      {!(dismissed && !loading) ? (
        <div className="min-h-screen vb-surface-base flex items-center justify-center">
          <VivaboxLoader size={72} />
        </div>
      ) : (
      <div className="min-h-screen vb-surface-base py-10 checkout-container">

        <div className="vb-card p-6 space-y-5 max-w-[440px] mx-auto">

          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink flex items-center gap-2">
              <Lock size={16} strokeWidth={2} className="text-primary shrink-0" />
              Pago seguro
            </h2>
            <span className="text-xs text-[#6B6B6B]">Wompi</span>
          </div>

          {/* RESUMEN COMPACTO */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-[#6B6B6B]">
              <span>{safeBox.name} x{quantity}</span>
              <span>${formatPrice(subtotal)}</span>
            </div>

            <div className="flex justify-between text-sm text-[#6B6B6B]">
              <span>Envío ({getDeliveryLabel()})</span>
              <span>{delivery === 0 ? "Gratis" : `+$${formatPrice(delivery)}`}</span>
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

          {!error && (
            <p className="text-sm text-[#6B6B6B] text-center">
              Tu pago no se completó. Tu pedido sigue reservado.
            </p>
          )}

          <button
            onClick={handlePayment}
            className="vb-btn-primary w-full h-12"
          >
            Reintentar el pago
            <Lock size={18} strokeWidth={2} className="vb-cta-icon" />
          </button>

          <a
            href={whatsappLink(`Hola Vivabox, necesito ayuda con mi pago (pedido ${ventaId.slice(0, 6).toUpperCase()}).`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-xs text-[#6B6B6B] underline underline-offset-2"
          >
            <MessageCircle size={14} strokeWidth={2} />
            ¿Necesitas ayuda? Escríbenos por WhatsApp
          </a>

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
      )}
    </>
  )
}
