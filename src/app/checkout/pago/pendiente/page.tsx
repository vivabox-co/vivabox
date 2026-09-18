"use client"

import { Suspense, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useCheckoutStore } from "@/features/checkout/checkoutStore"
import { paymentReference, whatsappLink } from "@/services/manualPayment"
import { formatPrice } from "@/utils/formatPrice"
import CheckoutProgress from "../../CheckoutProgress"
import VivaboxLoader from "@/components/ui/VivaboxLoader"
import { MessageCircle } from "lucide-react"

const POLL_INTERVAL_MS = 5000

export default function PendientePage() {
  return (
    <Suspense fallback={null}>
      <PendientePageContent />
    </Suspense>
  )
}

// Espera del pago manual (Bre-B): el equipo verifica el dinero en Bancolombia
// y confirma desde el back-office. Esta página consulta el estado y, apenas
// se confirma, lleva al cliente al paso "Listo" (mensaje personal). Puede
// cerrarse y reabrirse con el mismo enlace sin perder nada.
function PendientePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const ventaId = searchParams.get("ventaId") || ""

  const quantity = useCheckoutStore(s => s.quantity)
  const deliveryMethod = useCheckoutStore(s => s.deliveryMethod)
  const pricing = useCheckoutStore(s => s.pricing)

  useEffect(() => {
    if (!ventaId) return

    let cancelled = false

    async function check() {
      try {
        const res = await fetch("/api/checkout/manual-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ventaId, action: "status" }),
        })

        const data = await res.json()
        if (cancelled) return

        if (data.ok && data.status === "paid") {
          const urlDeliveryType = deliveryMethod === "digital" ? "digital" : "physical"
          router.replace(
            `/checkout/success?ventaId=${ventaId}&quantity=${quantity}&deliveryType=${urlDeliveryType}`
          )
        }
      } catch {
        // Sin conexión un momento: el siguiente intento lo reintenta.
      }
    }

    check()
    const interval = setInterval(check, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [ventaId, quantity, deliveryMethod, router])

  if (!ventaId) {
    return (
      <>
        <CheckoutProgress current="pagar" />
        <div className="min-h-screen vb-surface-base flex flex-col items-center justify-center gap-4 text-center px-6">
          <p className="text-ink font-medium max-w-sm">No encontramos tu pedido.</p>
          <Link href="/cajas" className="vb-btn-primary h-12 px-6 inline-flex items-center">
            Volver a las cajas
          </Link>
        </div>
      </>
    )
  }

  const reference = paymentReference(ventaId)

  return (
    <>
      <CheckoutProgress current="pagar" />
      <div className="min-h-screen vb-surface-base flex flex-col items-center justify-center gap-4 text-center px-6 py-10">
        <VivaboxLoader size={72} />

        <div className="space-y-1.5 max-w-sm">
          <p className="text-ink font-semibold text-lg">Estamos verificando tu pago</p>
          <p className="text-[#6B6B6B] text-sm">
            Lo confirmamos nosotros mismos en Bancolombia. Apenas lo veamos, esta página te lleva al siguiente paso.
          </p>
        </div>

        <div className="vb-well px-5 py-3 text-sm text-ink">
          Referencia <span className="font-semibold tabular-nums">{reference}</span>
          {pricing ? <> · <span className="font-semibold">${formatPrice(pricing.total)}</span></> : null}
        </div>

        <a
          href={whatsappLink(`Hola Vivabox, ya hice mi pago. Referencia ${reference}. Te envío el comprobante.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="vb-btn-soft h-11 px-5 text-sm inline-flex items-center gap-2"
        >
          <MessageCircle size={16} strokeWidth={2} />
          Enviar comprobante por WhatsApp
        </a>

        <p className="text-xs text-[#6B6B6B] max-w-xs">
          Guarda esta página: si la cierras, puedes volver a abrirla con el mismo enlace.
        </p>
      </div>
    </>
  )
}
