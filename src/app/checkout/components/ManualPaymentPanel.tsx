"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Check, Copy, Download, X, ZoomIn } from "lucide-react"
import { MANUAL_PAYMENT, paymentReference } from "@/services/manualPayment"
import { formatPrice } from "@/utils/formatPrice"

function CopyRow({
  label,
  value,
  display,
  large = false,
}: {
  label: string
  value: string
  display?: string
  large?: boolean
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Sin permiso de portapapeles: el valor sigue visible para copiarlo a mano.
    }
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs text-[#6B6B6B]">{label}</p>
        <p className={`font-semibold text-ink tabular-nums break-all ${large ? "text-xl" : ""}`}>
          {display ?? value}
        </p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="vb-btn-soft h-9 px-3 text-xs shrink-0 inline-flex items-center gap-1.5"
        aria-label={`Copiar ${label}`}
      >
        {copied ? <Check size={14} strokeWidth={2.25} /> : <Copy size={14} strokeWidth={2} />}
        {copied ? "Copiado" : "Copiar"}
      </button>
    </div>
  )
}

// Pago por QR / llave Bre-B de Bancolombia, sin pasar por Wompi. El cliente
// solo escanea (o copia la llave), paga el monto exacto y toca "Ya hice el
// pago"; el equipo verifica en Bancolombia (vivabox-operativo → Por verificar).
export default function ManualPaymentPanel({ ventaId, total }: { ventaId: string; total: number }) {
  const [zoomed, setZoomed] = useState(false)

  useEffect(() => {
    if (!zoomed) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomed(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [zoomed])

  return (
    <div className="space-y-4">
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium text-ink">Paga ${formatPrice(total)} con Bre-B</p>
        <p className="text-xs text-[#6B6B6B]">
          Escanea el QR desde la app de tu banco. Es inmediato y sin costo.
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => setZoomed(true)}
          className="relative rounded-[14px]"
          aria-label="Agrandar el código QR"
        >
          <Image
            src="/images/pago/vivabox-bre-b-qr.jpg"
            alt="Código QR Bre-B de Vivabox Colombia"
            width={200}
            height={357}
            priority
            className="rounded-[14px]"
          />
          <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm">
            <ZoomIn size={16} strokeWidth={2} />
          </span>
        </button>
        <p className="text-xs text-[#6B6B6B]">Toca el QR para agrandarlo</p>
      </div>

      {zoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Código QR Bre-B"
          onClick={() => setZoomed(false)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/80 p-4"
        >
          <button
            type="button"
            onClick={() => setZoomed(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink"
            aria-label="Cerrar"
          >
            <X size={20} strokeWidth={2} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/pago/vivabox-bre-b-qr.jpg"
            alt="Código QR Bre-B de Vivabox Colombia"
            onClick={e => e.stopPropagation()}
            className="max-h-[80vh] max-w-full rounded-[14px] object-contain"
          />
          <a
            href="/images/pago/vivabox-bre-b-qr.jpg"
            download="vivabox-bre-b-qr.jpg"
            onClick={e => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink"
          >
            <Download size={16} strokeWidth={2} />
            Descargar QR
          </a>
        </div>
      )}

      <div className="vb-well p-4 space-y-3">
        <CopyRow label="Monto exacto (COP)" value={String(total)} display={`$${formatPrice(total)}`} large />
        <div className="vb-divider-top pt-3">
          <CopyRow label="¿Sin cámara? Envía a la llave Bre-B" value={MANUAL_PAYMENT.llave} />
          <p className="mt-1.5 text-xs text-[#6B6B6B]">
            Tu banco debe mostrar <span className="text-ink font-medium">{MANUAL_PAYMENT.holder}</span>.
          </p>
        </div>
        <div className="vb-divider-top pt-3">
          <CopyRow label="Si hay campo de mensaje, escribe" value={paymentReference(ventaId)} />
        </div>
      </div>
    </div>
  )
}
