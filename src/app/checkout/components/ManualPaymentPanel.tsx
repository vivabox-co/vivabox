"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, Copy } from "lucide-react"
import { MANUAL_PAYMENT, paymentReference } from "@/services/manualPayment"
import { formatPrice } from "@/utils/formatPrice"

function CopyRow({ label, value, display }: { label: string; value: string; display?: string }) {
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
        <p className="font-semibold text-ink tabular-nums break-all">{display ?? value}</p>
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

export default function ManualPaymentPanel({ ventaId, total }: { ventaId: string; total: number }) {
  const reference = paymentReference(ventaId)

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-ink">Paga con Bre-B desde la app de tu banco</p>
        <p className="text-xs text-[#6B6B6B]">
          Es una transferencia al instante, sin costo. Cuando la hagas, vuelve aquí y avísanos.
        </p>
      </div>

      <div className="vb-well p-4 space-y-3.5">
        <CopyRow label="Llave Bre-B" value={MANUAL_PAYMENT.llave} />
        <p className="text-xs text-[#6B6B6B]">
          Tu banco debe mostrar: <span className="text-ink font-medium">{MANUAL_PAYMENT.holder}</span>
        </p>

        <div className="vb-divider-top pt-3.5">
          <CopyRow label="Monto exacto (COP)" value={String(total)} display={`$${formatPrice(total)}`} />
        </div>

        <div className="vb-divider-top pt-3.5">
          <CopyRow label="Escríbela en el mensaje del pago" value={reference} />
        </div>
      </div>

      <details className="hidden md:block group">
        <summary className="text-xs text-[#6B6B6B] underline underline-offset-2 cursor-pointer list-none">
          ¿Estás en un computador? Escanea el QR con tu celular
        </summary>
        <div className="mt-3 flex justify-center">
          <Image
            src="/images/pago/vivabox-bre-b-qr.jpg"
            alt="Código QR Bre-B de Vivabox Colombia"
            width={180}
            height={321}
            className="rounded-[14px]"
          />
        </div>
      </details>
    </div>
  )
}
