"use client"

import { PenLine } from "lucide-react"
import { MESSAGE_MAX_LENGTH, SIGNATURE_MAX_LENGTH } from "@/features/checkout/personalMessage"
import MessageCardPreview from "./MessageCardPreview"

type Props = {
  mensaje: string
  firma: string
  corazon: boolean
  onMensajeChange: (value: string) => void
  onFirmaChange: (value: string) => void
  onCorazonChange: (value: boolean) => void
}

export default function PersonalMessageForm({
  mensaje,
  firma,
  corazon,
  onMensajeChange,
  onFirmaChange,
  onCorazonChange,
}: Props) {
  const atLimit = mensaje.length >= MESSAGE_MAX_LENGTH

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
        <textarea
          id="mensaje"
          placeholder="Escribe tu mensaje"
          value={mensaje}
          onChange={(e) => onMensajeChange(e.target.value)}
          maxLength={MESSAGE_MAX_LENGTH}
          rows={4}
          className="vb-input resize-none leading-normal"
        />
        <div className="flex justify-between text-xs text-[#6B6B6B]">
          <span className="text-accent-red">{atLimit ? "Llegaste al límite" : ""}</span>
          <span className={atLimit ? "text-accent-red" : ""}>{mensaje.length} / {MESSAGE_MAX_LENGTH}</span>
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

      <div className="space-y-2 pt-2">
        <p className="text-[13px] text-[#6B6B6B] text-center">Así se verá tu tarjeta</p>
        <MessageCardPreview mensaje={mensaje} firma={firma} corazon={corazon} />
        <p className="text-xs text-[#6B6B6B] text-center">Vista aproximada. La letra se ajusta al largo de tu mensaje.</p>
      </div>
    </div>
  )
}
