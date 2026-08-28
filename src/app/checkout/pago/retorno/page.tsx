"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCheckoutStore } from "@/features/checkout/checkoutStore"
import CheckoutProgress from "../../CheckoutProgress"
import VivaboxLoader from "@/components/ui/VivaboxLoader"
import { XCircle } from "lucide-react"

const POLL_INTERVAL_MS = 3000
const MAX_POLL_ATTEMPTS = 10 // ~30s — cubre la mayoría de confirmaciones PSE/Nequi

export default function RetornoPage() {
  return (
    <Suspense fallback={null}>
      <RetornoPageContent />
    </Suspense>
  )
}

function RetornoPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const ventaId = searchParams.get("ventaId") || ""
  const transactionId = searchParams.get("id") || ""

  const box = useCheckoutStore(s => s.box)
  const quantity = useCheckoutStore(s => s.quantity)
  const deliveryMethod = useCheckoutStore(s => s.deliveryMethod)

  const missingParams = !ventaId || !transactionId

  const [status, setStatus] = useState<"checking" | "pending" | "declined" | "error">(
    missingParams ? "error" : "checking"
  )
  const attemptsRef = useRef(0)

  useEffect(() => {
    if (missingParams) return

    let cancelled = false

    async function check() {
      try {
        const res = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ventaId, transactionId }),
        })

        const data = await res.json()
        if (cancelled) return

        if (!data.ok) {
          setStatus("error")
          return
        }

        if (data.status === "approved") {
          const urlDeliveryType = deliveryMethod === "digital" ? "digital" : "physical"
          router.replace(
            `/checkout/success?ventaId=${ventaId}&quantity=${quantity}&deliveryType=${urlDeliveryType}`
          )
          return
        }

        if (data.status === "declined") {
          setStatus("declined")
          return
        }

        // "pending" — reintenta unas veces, la confirmación puede tardar
        // unos segundos en métodos como PSE.
        attemptsRef.current += 1
        if (attemptsRef.current >= MAX_POLL_ATTEMPTS) {
          setStatus("pending")
          return
        }

        setTimeout(check, POLL_INTERVAL_MS)

      } catch (error) {
        console.error("Verify error:", error)
        if (!cancelled) setStatus("error")
      }
    }

    check()

    return () => {
      cancelled = true
    }
  }, [missingParams, ventaId, transactionId, quantity, deliveryMethod, router])

  const pagoHref = box ? `/checkout/${box.slug}/pago` : "/cajas"

  if (status === "checking") {
    return (
      <>
        <CheckoutProgress current="pagar" />
        <div className="min-h-screen vb-surface-base flex flex-col items-center justify-center gap-4 text-center px-6">
          <VivaboxLoader size={72} />
          <p className="text-[#6B6B6B]">Confirmando tu pago...</p>
        </div>
      </>
    )
  }

  if (status === "pending") {
    return (
      <>
        <CheckoutProgress current="pagar" />
        <div className="min-h-screen vb-surface-base flex flex-col items-center justify-center gap-3 text-center px-6">
          <VivaboxLoader size={72} />
          <p className="text-ink font-medium">Tu pago sigue en proceso</p>
          <p className="text-[#6B6B6B] text-sm max-w-sm">
            Te enviaremos la confirmación por correo apenas se complete. Puedes cerrar esta ventana.
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      <CheckoutProgress current="pagar" />
      <div className="min-h-screen vb-surface-base flex flex-col items-center justify-center gap-4 text-center px-6">
        <XCircle size={48} strokeWidth={2} className="text-[#6B6B6B]" />
        <p className="text-ink font-medium max-w-sm">
          {status === "declined"
            ? "No pudimos procesar tu pago. Puedes intentarlo de nuevo o elegir otro medio de pago."
            : "Algo salió mal al confirmar tu pago."}
        </p>
        <a href={pagoHref} className="vb-btn-primary h-12 px-6 inline-flex items-center">
          Volver a intentar
        </a>
      </div>
    </>
  )
}
