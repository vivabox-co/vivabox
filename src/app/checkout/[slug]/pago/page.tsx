"use client"

import { useRouter } from "next/navigation"
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
// PAY
// ======================
async function handleFakePayment() {
  if (loading) return

  if (!ventaId) {
    alert("Error interno: ventaId faltante")
    return
  }

  if (!quantity || !deliveryMethod) {
    alert("Error interno: datos incompletos")
    return
  }

  const urlDeliveryType = deliveryMethod === "digital" ? "digital" : "physical"

  setLoading(true)

  try {
    const res = await fetch("/api/checkout/pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "pay",
        ventaId,
      }),
    })

    const data = await res.json()

    // ======================
    // ERROR HANDLING
    // ======================

    if (!data.ok) {
      if (data.error === "RESERVATION_EXPIRED") {
        alert("La reserva expiró")
        router.replace("/cajas")
        return
      }

      if (data.error === "ALREADY_PAID") {
        router.replace(
          `/checkout/success?ventaId=${ventaId}&quantity=${quantity}&deliveryType=${urlDeliveryType}`
        )
        return
      }

      alert(data.error || "No pudimos procesar el pago")
      setLoading(false)
      return
    }

    // ======================
    // SUCCESS
    // ======================

    router.replace(
      `/checkout/success?ventaId=${ventaId}&quantity=${quantity}&deliveryType=${urlDeliveryType}`
    )

  } catch (error) {
    console.error("Payment error:", error)
    alert("Error procesando el pago")
    setLoading(false)
  }
}

  // ======================
  // UI
  // ======================
  return (
    <>
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
                MercadoPago
              </span>
            </div>

            <input
              type="text"
              placeholder="Número de tarjeta"
              className="vb-input"
            />

            <input
              type="text"
              placeholder="Nombre en la tarjeta"
              className="vb-input"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="MM/AA"
                className="vb-input"
              />
              <input
                type="text"
                placeholder="CVV"
                className="vb-input"
              />
            </div>

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
              onClick={handleFakePayment}
              disabled={loading}
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
              Pago seguro · sin complicaciones
            </p>

          </div>

        </div>

      </div>
    </>
  )
}