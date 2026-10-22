"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Package, CheckCircle2, Truck, Mail, Sparkles, Loader2, ArrowRight, MessageCircle } from "lucide-react"
import CheckoutProgress from "../CheckoutProgress"
import { useCheckoutStore } from "@/features/checkout/checkoutStore"
import { formatPrice } from "@/utils/formatPrice"
import { HEART, SIGNATURE_MAX_LENGTH } from "@/features/checkout/personalMessage"
import PersonalMessageForm from "../components/PersonalMessageForm"
import MessageCardPreview from "../components/MessageCardPreview"

type OrderSnapshot = {
  isGift: boolean
  isPhysical: boolean
  destinationName: string
  destinationContact: string
  address: string
  city: string
  boxName: string
  quantity: number
  subtotal: number
  total: number | null
}

// writing: form open · saved / already: message locked in · skipped: left empty
type MessagePhase = "writing" | "saved" | "already" | "skipped"

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

  const hasHydrated = useCheckoutStore(s => s.hasHydrated)
  const reset = useCheckoutStore(s => s.reset)

  // Snapshot taken once the store has hydrated and right before it is reset,
  // so the nav cart badge clears while this page keeps its recap.
  const [order, setOrder] = useState<OrderSnapshot | null>(null)
  const startedRef = useRef(false)

  const [phase, setPhase] = useState<MessagePhase>("writing")
  const [mensaje, setMensaje] = useState("")
  const [firma, setFirma] = useState("")
  const [corazon, setCorazon] = useState(false)
  const [savedCard, setSavedCard] = useState<{ mensaje: string; firma: string; corazon: boolean } | null>(null)

  const [loading, setLoading] = useState(false)
  const isSubmittingRef = useRef(false)

  // The payment already completes the venta on its own; this call is only a
  // safety net (idempotent), then the checkout store is cleared.
  useEffect(() => {
    if (!hasHydrated || startedRef.current) return
    startedRef.current = true

    const s = useCheckoutStore.getState()
    const isGift = s.deliveryDestination === "recipient"

    setOrder({
      isGift,
      isPhysical: s.deliveryMethod !== "digital",
      destinationName: isGift ? s.recipientName : s.buyerName,
      destinationContact: isGift ? s.recipientPhone : s.buyerPhone,
      address: s.address,
      city: s.city,
      boxName: s.box?.name ?? "",
      quantity: s.quantity,
      subtotal: s.pricing?.subtotal ?? 0,
      total: s.pricing?.total ?? null,
    })
    setFirma((s.buyerName || "").slice(0, SIGNATURE_MAX_LENGTH))

    if (!ventaId) return

    fetch("/api/checkout/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ventaId }),
    })
      .then(res => res.json())
      .then(data => { if (data.ok) reset() })
      .catch(() => {})
  }, [hasHydrated, ventaId, reset])

  // The message can only be written now, once: saving or skipping both lock it.
  async function handleMessage(withMessage: boolean) {
    if (isSubmittingRef.current || !ventaId) return

    isSubmittingRef.current = true
    setLoading(true)

    try {
      const text = withMessage ? mensaje.trim() : ""
      const signature = text ? `${firma.trim()}${corazon ? ` ${HEART}` : ""}`.trim() : ""

      const res = await fetch("/api/checkout/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ventaId, mensaje: text, de: signature }),
      })
      const data = await res.json()

      if (data.ok) {
        if (text) {
          setSavedCard({ mensaje: text, firma: firma.trim(), corazon })
          setPhase("saved")
        } else {
          setPhase("skipped")
        }
      } else if (data.error === "ALREADY_SET") {
        setPhase("already")
      } else {
        alert(data.error || "Error")
      }
    } catch {
      alert("Error")
    } finally {
      setLoading(false)
      isSubmittingRef.current = false
    }
  }

  const isGift = order?.isGift ?? false
  const writing = phase === "writing" && !!ventaId

  return (
    <>
      <CheckoutProgress current="enviar" completed={!writing} />

      <div className={`max-w-[520px] mx-auto py-8 px-4 space-y-6 ${writing ? "pb-32" : "pb-12"}`}>

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

        {/* CONFIRMATION */}
        <div className="vb-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm text-ink/80">
            <Mail size={16} strokeWidth={2} className="text-primary shrink-0" />
            Te enviamos la confirmación por correo
          </div>
          <div className="flex items-center gap-2 text-sm text-ink/80">
            <Sparkles size={16} strokeWidth={2} className="text-primary shrink-0" />
            Estamos preparando tu Vivabox
          </div>
          {order?.isPhysical && (
            <div className="flex items-center gap-2 text-sm text-ink/80">
              <Truck size={16} strokeWidth={2} className="text-primary shrink-0" />
              Te avisaremos con las novedades del envío
            </div>
          )}
        </div>

        {/* DESTINATION RECAP — read-only, already collected in "Elegir" */}
        {order && order.destinationName && (
          <div className="vb-card p-5 space-y-1.5">
            <p className="font-semibold text-sm text-ink">Se envía a</p>
            <p className="text-sm text-[#6B6B6B]">
              {order.destinationName}{order.destinationContact ? ` · ${order.destinationContact}` : ""}
            </p>
            {order.isPhysical && (
              <p className="text-sm text-[#6B6B6B]">{order.address}{order.city ? `, ${order.city}` : ""}</p>
            )}
          </div>
        )}

        {/* PERSONAL MESSAGE */}
        {writing && (
          <PersonalMessageForm
            mensaje={mensaje}
            firma={firma}
            corazon={corazon}
            onMensajeChange={setMensaje}
            onFirmaChange={setFirma}
            onCorazonChange={setCorazon}
          />
        )}

        {(phase === "saved" || phase === "already") && (
          <div className="vb-well p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="shrink-0 w-9 h-9 rounded-full bg-white/70 flex items-center justify-center">
                <MessageCircle size={17} strokeWidth={2} className="text-primary" />
              </span>
              <p className="font-semibold text-ink">Tu mensaje personal</p>
            </div>
            <p className="text-sm text-[#6B6B6B]">
              {phase === "saved"
                ? "Quedó guardado. Lo imprimiremos en la tarjeta que va dentro de la caja."
                : "Tu mensaje ya estaba guardado. Lo imprimiremos en la tarjeta que va dentro de la caja."}
            </p>
            {savedCard && (
              <MessageCardPreview mensaje={savedCard.mensaje} firma={savedCard.firma} corazon={savedCard.corazon} />
            )}
          </div>
        )}

        {/* ORDER SUMMARY */}
        {order && order.boxName && (
          <div className="vb-card p-5 space-y-2">
            <div className="flex justify-between text-sm text-[#6B6B6B]">
              <span>{order.boxName} × {order.quantity}</span>
              <span>{order.subtotal ? `$${formatPrice(order.subtotal)}` : ""}</span>
            </div>
            {order.total !== null && (
              <div className="pt-2 vb-divider-top flex justify-between text-sm font-semibold text-ink">
                <span>Total pagado</span>
                <span>${formatPrice(order.total)}</span>
              </div>
            )}
          </div>
        )}

        {!writing && (
          <>
            <p className="text-center text-sm text-[#6B6B6B]">
              Gracias por elegir Vivabox. Ahora empieza la mejor parte.
            </p>

            <Link href="/" className="vb-btn-primary w-full h-12">
              Seguir comprando
              <ArrowRight size={18} strokeWidth={2} className="vb-cta-icon" />
            </Link>
          </>
        )}
      </div>

      {/* STICKY CTA — siempre alcanzable mientras el mensaje está abierto */}
      {writing && (
        <div
          className="fixed bottom-0 inset-x-0 z-40 vb-sticky-bar px-4 pt-3"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <div className="max-w-[520px] mx-auto space-y-1">
            <button
              onClick={() => handleMessage(true)}
              disabled={loading || !mensaje.trim()}
              className="vb-btn-primary w-full h-12 disabled:opacity-60"
            >
              {loading ? (
                <>
                  Guardando...
                  <Loader2 size={18} strokeWidth={2} className="animate-spin" />
                </>
              ) : (
                <>
                  Guardar mensaje
                  <ArrowRight size={18} strokeWidth={2} className="vb-cta-icon" />
                </>
              )}
            </button>

            <button
              onClick={() => handleMessage(false)}
              disabled={loading}
              className="w-full text-sm text-[#6B6B6B] py-1.5 hover:text-ink transition"
            >
              Continuar sin mensaje
            </button>
          </div>
        </div>
      )}
    </>
  )
}
