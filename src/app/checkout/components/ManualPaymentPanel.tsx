"use client"

import { useId, useState, type ReactNode } from "react"
import Image from "next/image"
import { Check, Copy, Heart } from "lucide-react"
import { MANUAL_PAYMENT, paymentReference } from "@/services/manualPayment"
import { formatPrice } from "@/utils/formatPrice"

export function BreBLogo({ className = "h-5" }: { className?: string }) {
  return (
    <Image
      src="/images/pago/bre-b-logo.png"
      alt="Bre-B"
      width={211}
      height={66}
      className={`${className} w-auto`}
    />
  )
}

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

function Step({ n, title, children }: { n: number; title: string; children?: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
        {n}
      </span>
      <div className="min-w-0 flex-1 space-y-2.5">
        <p className="text-sm text-ink">{title}</p>
        {children}
      </div>
    </li>
  )
}

function Field({
  label,
  hint,
  value,
  onChange,
  maxLength,
  autoComplete,
}: {
  label: string
  hint?: string
  value: string
  onChange: (value: string) => void
  maxLength: number
  autoComplete?: string
}) {
  const id = useId()

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs text-[#6B6B6B]">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        maxLength={maxLength}
        autoComplete={autoComplete ?? "off"}
        className="vb-input"
      />
      {hint && <p className="text-[11px] text-[#6B6B6B] leading-snug">{hint}</p>}
    </div>
  )
}

type ManualPaymentPanelProps = {
  ventaId: string
  total: number
  payerName: string
  onPayerNameChange: (value: string) => void
  receiptNumber: string
  onReceiptNumberChange: (value: string) => void
}

export default function ManualPaymentPanel({
  ventaId,
  total,
  payerName,
  onPayerNameChange,
  receiptNumber,
  onReceiptNumberChange,
}: ManualPaymentPanelProps) {
  const reference = paymentReference(ventaId)

  return (
    <div className="space-y-4">
      {/* Disculpa por el pago temporal: va primero y bien visible para que
          nadie lo lea como un error del sitio. */}
      <div
        role="note"
        className="flex items-start gap-3 rounded-[20px] border border-primary/30 bg-primary/[0.07] p-4"
      >
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">
          <Heart size={16} strokeWidth={2.25} />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-ink">Disculpa las molestias</p>
          <p className="text-sm text-ink/80 leading-relaxed">
            Todavía estamos activando el pago con tarjeta, Nequi y PSE. Mientras tanto, pagas por
            Bre-B y nosotros confirmamos tu pedido apenas veamos la transferencia.
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-ink">Transfiere ${formatPrice(total)} con Bre-B</p>
        <p className="text-xs text-[#6B6B6B]">
          Es una transferencia inmediata y sin costo, desde la app de tu banco.
        </p>
      </div>

      <ol className="vb-well p-4 space-y-5">
        <Step n={1} title="Abre la app de tu banco o billetera y entra a Transferir → Bre-B." />

        <Step n={2} title="Envía a esta llave:">
          <CopyRow label="Llave Bre-B" value={MANUAL_PAYMENT.llave} />
          <p className="flex items-start gap-1.5 text-xs text-[#6B6B6B]">
            <Check size={14} strokeWidth={2.25} className="mt-px shrink-0 text-accent-green" />
            <span>
              Antes de confirmar, tu banco debe mostrar{" "}
              <span className="text-ink font-medium">{MANUAL_PAYMENT.holder}</span>.
            </span>
          </p>
        </Step>

        <Step n={3} title="Por este valor exacto:">
          <CopyRow label="Monto (COP)" value={String(total)} display={`$${formatPrice(total)}`} large />
          <div className="vb-divider-top pt-3">
            <CopyRow label="Si hay campo de mensaje, escribe" value={reference} />
          </div>
        </Step>

        <Step n={4} title="Vuelve aquí, cuéntanos quién pagó y toca «Ya hice el pago».">
          <Field
            label="¿A nombre de quién sale la transferencia?"
            value={payerName}
            onChange={onPayerNameChange}
            maxLength={80}
            autoComplete="name"
          />
          <Field
            label="Nº de aprobación del comprobante (opcional)"
            hint="Lo ves en el comprobante de tu banco. Nos ayuda a encontrar tu pago más rápido."
            value={receiptNumber}
            onChange={onReceiptNumberChange}
            maxLength={40}
          />
        </Step>
      </ol>

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
