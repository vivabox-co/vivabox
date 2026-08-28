"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import Script from "next/script"
import { useState, useEffect } from "react"
import { useCheckoutStore } from "@/features/checkout/checkoutStore"
import { formatPrice } from "@/utils/formatPrice"
import CheckoutProgress from "../../CheckoutProgress"
import VivaboxLoader from "@/components/ui/VivaboxLoader"
import { useMinDisplayTime } from "@/components/ui/useMinDisplayTime"
import { Lock, Loader2 } from "lucide-react"

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

  // ======================
  // GUARDS
  // ======================
  useEffect(() => {
    if (!hasHydrated) return

    if (!box || !ventaId) {
      router.replace("/cajas")
    }
  }, [hasHydrated, box, ventaId, router])

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
  // PAY — abre el Widget Wompi
  // ======================
  async function handlePayment() {
    if (loading) return

    if (!ventaId) {
      alert("Error interno: ventaId faltante")
      return
    }

    if (!widgetReady || !window.WidgetCheckout) {
      alert("El módulo de pago todavía se está cargando, intenta de nuevo en un momento")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/checkout/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ventaId }),
      })

      const data = await res.json()

      if (!data.ok) {
        if (data.error === "RESERVATION_EXPIRED") {
          alert("La reserva expiró")
          router.replace("/cajas")
          return
        }

        if (data.error === "ALREADY_PAID") {
          const urlDeliveryType = deliveryMethod === "digital" ? "digital" : "physical"
          router.replace(
            `/checkout/success?ventaId=${ventaId}&quantity=${quantity}&deliveryType=${urlDeliveryType}`
          )
          return
        }

        alert(data.error || "No pudimos iniciar el pago")
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
        // en curso o abandonado) — se queda en esta pantalla para reintentar.
        if (!result?.transaction) return

        router.replace(
          `/checkout/pago/retorno?ventaId=${ventaId}&id=${result.transaction.id}`
        )
      })

    } catch (error) {
      console.error("Payment error:", error)
      alert("Error iniciando el pago")
      setLoading(false)
    }
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

      <div className="min-h-screen vb-surface-base py-10 checkout-container">

        <div className="grid md:grid-cols-2 gap-6 max-w-[900px] mx-auto">

          {/* LEFT */}
          <div className="vb-card p-6 space-y-5 h-fit">

            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-ink flex items-center gap-2">
                <Lock size={16} strokeWidth={2} className="text-primary shrink-0" />
                Pago seguro
              </h2>
              <span className="text-xs text-[#6B6B6B]">
                Wompi
              </span>
            </div>

            <p className="text-sm text-[#6B6B6B]">
              Al hacer clic en &ldquo;Pagar&rdquo; se abrirá la ventana segura de Wompi, donde eliges
              cómo pagar: Nequi, PSE, tarjeta de crédito o débito, Bancolombia y más.
            </p>

            <p className="text-xs text-[#6B6B6B] text-center">
              Tus datos están protegidos
            </p>

          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-4">

            <div className="vb-card p-6 space-y-4">

              <h3 className="font-semibold text-ink">
                Resumen
              </h3>

              <div className="flex justify-between text-sm text-[#6B6B6B]">
                <span>{safeBox.name} x{quantity}</span>
                <span>${formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between text-sm text-[#6B6B6B]">
                <span>Entrega</span>
                <span>{getDeliveryLabel()}</span>
              </div>

              <div className="flex justify-between text-sm text-[#6B6B6B]">
                <span>Envío</span>
                <span>
                  {delivery === 0
                    ? "Gratis"
                    : `+$${formatPrice(delivery)}`}
                </span>
              </div>

              <div className="pt-3 vb-divider-top flex justify-between font-semibold text-lg text-ink">
                <span>Total</span>
                <span>${formatPrice(total)}</span>
              </div>

            </div>

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

      </div>
    </>
  )
}