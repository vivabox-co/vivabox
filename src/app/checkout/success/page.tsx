"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Package, CheckCircle2, Truck, Mail, Sparkles, Loader2, ArrowRight, PenLine } from "lucide-react"
import CheckoutProgress from "../CheckoutProgress"
import { useCheckoutStore } from "@/features/checkout/checkoutStore"
import { formatPrice } from "@/utils/formatPrice"

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessPageContent />
    </Suspense>
  )
}

function SuccessPageContent() {
  const searchParams = useSearchParams()
  const ventaId = searchParams.get("ventaId") || ""

  const box = useCheckoutStore(s => s.box)
  const quantity = useCheckoutStore(s => s.quantity)
  const pricing = useCheckoutStore(s => s.pricing)

  const deliveryMethod = useCheckoutStore(s => s.deliveryMethod)
  const deliveryDestination = useCheckoutStore(s => s.deliveryDestination)

  const hasHydrated = useCheckoutStore(s => s.hasHydrated)
  const buyerName = useCheckoutStore(s => s.buyerName)
  const buyerPhone = useCheckoutStore(s => s.buyerPhone)

  const recipientName = useCheckoutStore(s => s.recipientName)
  const recipientPhone = useCheckoutStore(s => s.recipientPhone)

  const address = useCheckoutStore(s => s.address)
  const city = useCheckoutStore(s => s.city)

  const isGift = deliveryDestination === "recipient"
  const isPhysical = deliveryMethod !== "digital"

  const destinationName = isGift ? recipientName : buyerName
  const destinationContact = isGift ? recipientPhone : buyerPhone

  const [step, setStep] = useState<"message" | "done">("message")

  const [para, setPara] = useState("")
  const [de, setDe] = useState("")
  const [mensaje, setMensaje] = useState("")

  // Snapshot for the confirmation recap — taken right before the store is
  // reset, so the nav cart badge clears once the order is actually placed.
  const [orderSummary, setOrderSummary] = useState<{
    boxName: string
    quantity: number
    subtotal: number
    total: number | null
  } | null>(null)

  const reset = useCheckoutStore(s => s.reset)

  // El store se hidrata de forma asíncrona (persist) — prellenar "De" una
  // vez que el nombre del comprador esté disponible.
  useEffect(() => {
    if (hasHydrated && buyerName && !de) setDe(buyerName)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, buyerName])

  // Cuando el envío es directo al destinatario, ya recogimos su nombre en
  // "Elegir" — prellenar "Para" con ese dato en vez de dejarlo vacío.
  useEffect(() => {
    if (hasHydrated && isGift && recipientName && !para) setPara(recipientName)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, isGift, recipientName])

  const [loading, setLoading] = useState(false)
  const isSubmittingRef = useRef(false)

  async function handleComplete(withMessage: boolean) {
    if (isSubmittingRef.current || !ventaId) return

    isSubmittingRef.current = true
    setLoading(true)

    try {
      const res = await fetch("/api/checkout/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ventaId,
          message: withMessage ? { para, de, mensaje } : undefined,
        }),
      })

      const data = await res.json()

      if (!data.ok) {
        alert(data.error || "Error")
        return
      }

      setOrderSummary({
        boxName: box?.name ?? "",
        quantity,
        subtotal: pricing?.subtotal ?? 0,
        total: pricing?.total ?? null,
      })
      reset()
      setStep("done")
    } catch {
      alert("Error")
    } finally {
      setLoading(false)
      isSubmittingRef.current = false
    }
  }

  return (
    <>
      <CheckoutProgress current="enviar" completed={step === "done"} />

      <div className="max-w-[520px] mx-auto py-8 px-4 space-y-6 pb-32">

        {/* HEADER */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center animate-check-pop">
            <CheckCircle2 size={30} strokeWidth={2} className="text-green-700" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-green-700 font-semibold uppercase tracking-wide">Pago confirmado</p>
            <h1 className="text-2xl font-semibold text-ink flex items-center justify-center gap-2">
              <Package size={20} strokeWidth={1.75} className="text-primary" />
              {isGift ? "Tu regalo está listo" : "Tu Vivabox está lista"}
            </h1>
          </div>
        </div>

        {step === "message" ? (
          <>
            {/* DESTINATION RECAP — read-only, already collected in "Elegir" */}
            <div className="vb-card p-5 space-y-1.5">
              <p className="font-semibold text-sm text-ink">Se envía a</p>
              <p className="text-sm text-[#6B6B6B]">{destinationName}{destinationContact ? ` · ${destinationContact}` : ""}</p>
              {isPhysical && (
                <p className="text-sm text-[#6B6B6B]">{address}{city ? `, ${city}` : ""}</p>
              )}
            </div>

            {/* PERSONAL MESSAGE — only makes sense when it's a gift */}
            {isGift && (
              <div className="vb-well p-5 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="shrink-0 w-9 h-9 rounded-full bg-white/70 flex items-center justify-center">
                    <PenLine size={17} strokeWidth={2} className="text-primary" />
                  </span>
                  <p className="font-semibold text-ink">Ahora dale tu toque personal</p>
                </div>
                <p className="text-sm text-[#6B6B6B]">Lo verá cuando abra su Vivabox. Es opcional.</p>

                <input
                  placeholder="Para"
                  value={para}
                  onChange={(e) => setPara(e.target.value)}
                  className="vb-input"
                />

                <input
                  placeholder="De"
                  value={de}
                  onChange={(e) => setDe(e.target.value)}
                  className="vb-input"
                />

                <textarea
                  placeholder="Escribe tu mensaje"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="vb-input"
                />
              </div>
            )}

            {/* STICKY CTA — "Guardar mensaje" siempre alcanzable, pegado abajo */}
            <div
              className="fixed bottom-0 inset-x-0 z-40 vb-sticky-bar px-4 pt-3"
              style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
            >
              <div className="max-w-[520px] mx-auto space-y-1">
                <button
                  onClick={() => handleComplete(true)}
                  disabled={loading || !ventaId}
                  className="vb-btn-primary w-full h-12 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      Procesando...
                      <Loader2 size={18} strokeWidth={2} className="animate-spin" />
                    </>
                  ) : (
                    <>
                      {isGift ? "Guardar mensaje" : "Continuar"}
                      <ArrowRight size={18} strokeWidth={2} className="vb-cta-icon" />
                    </>
                  )}
                </button>

                {isGift && (
                  <button
                    onClick={() => handleComplete(false)}
                    disabled={loading || !ventaId}
                    className="w-full text-sm text-[#6B6B6B] py-1.5 hover:text-ink transition"
                  >
                    Continuar sin mensaje
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* FINAL CONFIRMATION */}
            <div className="vb-card p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm text-ink/80">
                <CheckCircle2 size={16} strokeWidth={2} className="text-green-700 shrink-0" />
                Pago confirmado
              </div>
              <div className="flex items-center gap-2 text-sm text-ink/80">
                <Mail size={16} strokeWidth={2} className="text-primary shrink-0" />
                Te enviamos la confirmación por correo
              </div>
              <div className="flex items-center gap-2 text-sm text-ink/80">
                <Sparkles size={16} strokeWidth={2} className="text-primary shrink-0" />
                Estamos preparando tu Vivabox
              </div>
              {isPhysical && (
                <div className="flex items-center gap-2 text-sm text-ink/80">
                  <Truck size={16} strokeWidth={2} className="text-primary shrink-0" />
                  Te avisaremos con las novedades del envío
                </div>
              )}
            </div>

            {orderSummary && (
              <div className="vb-card p-5 space-y-2">
                <div className="flex justify-between text-sm text-[#6B6B6B]">
                  <span>{orderSummary.boxName} × {orderSummary.quantity}</span>
                  <span>{orderSummary.subtotal ? `$${formatPrice(orderSummary.subtotal)}` : ""}</span>
                </div>
                {orderSummary.total !== null && (
                  <div className="pt-2 vb-divider-top flex justify-between text-sm font-semibold text-ink">
                    <span>Total pagado</span>
                    <span>${formatPrice(orderSummary.total)}</span>
                  </div>
                )}
              </div>
            )}

            <p className="text-center text-sm text-[#6B6B6B]">
              Gracias por elegir Vivabox. Ahora empieza la mejor parte.
            </p>

            <Link
              href="/"
              className="vb-btn-primary w-full h-12"
            >
              Seguir comprando
              <ArrowRight size={18} strokeWidth={2} className="vb-cta-icon" />
            </Link>
          </>
        )}
      </div>
    </>
  )
}
