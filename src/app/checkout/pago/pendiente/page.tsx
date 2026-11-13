"use client"

import { Suspense, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import CheckoutProgress from "../../CheckoutProgress"
import VivaboxLoader from "@/components/ui/VivaboxLoader"

export default function PendientePage() {
  return (
    <Suspense fallback={null}>
      <PendientePageContent />
    </Suspense>
  )
}

// Antes era la pantalla de espera del pago Bre-B. Ahora el cliente sigue
// directo en /checkout/success (modo "verificando", donde también escribe su
// mensaje), pero este enlace se queda vivo: el back-office lo manda por
// WhatsApp y puede estar en correos o pestañas ya abiertas.
function PendientePageContent() {
  const router = useRouter()
  const ventaId = useSearchParams().get("ventaId") || ""

  useEffect(() => {
    if (ventaId) router.replace(`/checkout/success?ventaId=${ventaId}&pending=1`)
  }, [ventaId, router])

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

  return (
    <div className="min-h-screen vb-surface-base flex items-center justify-center">
      <VivaboxLoader size={72} />
    </div>
  )
}
