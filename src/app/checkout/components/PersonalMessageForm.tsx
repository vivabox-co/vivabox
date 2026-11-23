"use client"

import { useLayoutEffect, useRef } from "react"
import { AlertCircle, PenLine } from "lucide-react"
import { MESSAGE_MAX_LENGTH, SIGNATURE_MAX_LENGTH, messageOverflow } from "@/features/checkout/personalMessage"

type Props = {
  mensaje: string
  firma: string
  corazon: boolean
  onMensajeChange: (value: string) => void
  onFirmaChange: (value: string) => void
  onCorazonChange: (value: boolean) => void
}

// Shared text metrics between the textarea and its highlight layer: both must
// wrap the exact same way for the pink highlight to sit under the right words.
const TEXT_METRICS = "px-4 py-3 text-[0.9375rem] leading-normal whitespace-pre-wrap break-words border border-transparent"

export default function PersonalMessageForm({
  mensaje,
  firma,
  corazon,
  onMensajeChange,
  onFirmaChange,
  onCorazonChange,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const overflow = messageOverflow(mensaje)
  const tooLong = overflow > 0
  const atLimit = mensaje.length === MESSAGE_MAX_LENGTH

  // The textarea grows with its content instead of scrolling, so the highlight
  // layer behind it never has to follow a scroll position.
  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight + 2}px`
  }, [mensaje])

  return (
    <div className="vb-well p-5 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <span className="shrink-0 w-9 h-9 rounded-full bg-white/70 flex items-center justify-center">
            <PenLine size={17} strokeWidth={2} className="text-primary" />
          </span>
          <p className="font-semibold text-ink">Dale tu toque personal</p>
        </div>
        <p className="text-sm text-[#6B6B6B]">
          Escribe un mensaje para la tarjeta que va dentro de la caja. Este es el único momento para escribirlo.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="mensaje" className="text-[13px] text-[#6B6B6B]">Tu mensaje</label>
        <div className="relative rounded-[18px] bg-card">
          <div
            aria-hidden="true"
            className={`absolute inset-0 overflow-hidden rounded-[18px] text-transparent pointer-events-none ${TEXT_METRICS}`}
          >
            {mensaje.slice(0, MESSAGE_MAX_LENGTH)}
            {tooLong && (
              <mark className="bg-accent-red/20 text-transparent rounded-[3px]">{mensaje.slice(MESSAGE_MAX_LENGTH)}</mark>
            )}
            {/* keeps a trailing line break measurable */}
            {" "}
          </div>
          <textarea
            ref={textareaRef}
            id="mensaje"
            placeholder="Escribe tu mensaje"
            value={mensaje}
            onChange={(e) => onMensajeChange(e.target.value)}
            rows={4}
            aria-invalid={tooLong}
            aria-describedby="mensaje-contador"
            className={`vb-input relative block resize-none overflow-hidden !bg-transparent ${TEXT_METRICS} ${
              tooLong ? "!border-accent-red focus:!border-accent-red" : ""
            }`}
          />
        </div>
        <div id="mensaje-contador" className="flex justify-between gap-3 text-xs text-[#6B6B6B]" aria-live="polite">
          <span className="text-accent-red flex items-start gap-1">
            {tooLong ? (
              <>
                <AlertCircle size={14} strokeWidth={2} className="shrink-0 mt-px" aria-hidden="true" />
                Te sobran {overflow} {overflow === 1 ? "carácter" : "caracteres"}. Acórtalo para que quepa en la tarjeta.
              </>
            ) : atLimit ? (
              "Llegaste al límite"
            ) : (
              ""
            )}
          </span>
          <span className={`shrink-0 tabular-nums ${tooLong || atLimit ? "text-accent-red" : ""} ${tooLong ? "font-semibold" : ""}`}>
            {mensaje.length} / {MESSAGE_MAX_LENGTH}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="firma" className="text-[13px] text-[#6B6B6B]">De parte de</label>
        <input
          id="firma"
          value={firma}
          onChange={(e) => onFirmaChange(e.target.value)}
          maxLength={SIGNATURE_MAX_LENGTH}
          className="vb-input"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
        <input
          type="checkbox"
          checked={corazon}
          onChange={(e) => onCorazonChange(e.target.checked)}
          className="size-[18px] accent-primary"
        />
        Añadir un corazón junto a tu firma
      </label>
    </div>
  )
}
