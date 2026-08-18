"use client"

import { useState } from "react"
import { Inbox, CalendarCheck2, History } from "lucide-react"
import { Booking, MOMENT_LABEL, formatDate, formatRequestedDate } from "./types"
import { PAGE_PATH } from "../types"
import { StageNav, StageTab, ConfirmSubmitButton } from "../components"

const STATUS_LABEL: Record<Booking["status"], string> = {
  requested: "Solicitada",
  alternative_proposed: "Fecha alternativa",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
}

// Teintes de la zone Reservas : noir espresso (#18140F) au lieu de l'orange
// utilisé côté Pedidos — voir la note du ZoneSwitcher dans ../components.tsx.
const STATUS_CLASS: Record<Booking["status"], string> = {
  requested: "bg-black/5 text-[#18140F]",
  alternative_proposed: "bg-[#FFF3E0] text-[#8A5300]",
  confirmed: "bg-[#18140F] text-white",
  completed: "bg-accent-green text-white",
  cancelled: "bg-accent-red text-white",
}

function StatusBadge({ status }: { status: Booking["status"] }) {
  return (
    <span className={`inline-flex items-center rounded-[13px] px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}

export function BookingCard({
  booking,
  primaryAction,
  primaryLabel,
  cancelAction,
  proposeAlternativeAction,
}: {
  booking: Booking
  primaryAction?: (formData: FormData) => void
  primaryLabel?: string
  cancelAction?: (formData: FormData) => void
  proposeAlternativeAction?: (formData: FormData) => void
}) {
  const requestedDate = formatRequestedDate(booking.requested_date)
  const proposedDate = formatRequestedDate(booking.proposed_date)
  const [showProposeForm, setShowProposeForm] = useState(false)

  return (
    <div className="vb-card p-5">
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div className="text-[19px] font-bold text-foreground leading-snug">
          {booking.experience_title ?? booking.experience_code}
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {booking.experience_city && (
        <p className="my-1 text-[15px]"><strong>Ciudad:</strong> {booking.experience_city}</p>
      )}
      <p className="my-1 text-[15px]">
        <strong>Beneficiario:</strong> {booking.beneficiary_name || "—"} {booking.beneficiary_email ? `(${booking.beneficiary_email})` : ""}
      </p>
      {requestedDate && (
        <p className="my-1 text-[15px]"><strong>Fecha solicitada:</strong> {requestedDate}</p>
      )}
      {booking.status === "alternative_proposed" && proposedDate && (
        <p className="my-1 text-[15px] text-[#8A5300]">
          <strong>Fecha propuesta:</strong> {proposedDate}
          {booking.proposed_moment && ` · ${MOMENT_LABEL[booking.proposed_moment as keyof typeof MOMENT_LABEL] ?? booking.proposed_moment}`}
          {booking.proposed_hour && ` (~${booking.proposed_hour})`}
          {" · esperando respuesta del beneficiario"}
        </p>
      )}
      {booking.message && (
        <p className="my-1 text-[15px]"><strong>Mensaje:</strong> {booking.message}</p>
      )}
      {booking.box_slug && (
        <p className="my-1 text-[15px] text-muted">
          <strong>Caja:</strong> {booking.box_slug} · {booking.activation_code ?? "sin código"}
        </p>
      )}
      {booking.buyer_name && (
        <p className="my-1 text-[15px] text-muted"><strong>Comprador:</strong> {booking.buyer_name}</p>
      )}
      <p className="text-muted text-xs mt-2.5">
        Solicitada el {formatDate(booking.created_at)} · Booking ID: {booking.id}
      </p>

      {(primaryAction || cancelAction || proposeAlternativeAction) && (
        <div className="mt-3.5 flex flex-wrap gap-2.5">
          {primaryAction && primaryLabel && (
            <form action={primaryAction}>
              <input type="hidden" name="bookingId" value={booking.id} />
              <ConfirmSubmitButton
                confirmMessage={booking.status === "alternative_proposed" ? "¿Confirmar la reserva con la fecha propuesta?" : `¿${primaryLabel}?`}
                className="vb-btn-dark h-11 px-5 text-sm"
              >
                {booking.status === "alternative_proposed" ? "Confirmar con fecha propuesta" : primaryLabel}
              </ConfirmSubmitButton>
            </form>
          )}
          {proposeAlternativeAction && (
            <button
              type="button"
              onClick={() => setShowProposeForm((v) => !v)}
              className="vb-btn-secondary h-11 px-5 text-sm"
            >
              {booking.status === "alternative_proposed" ? "Cambiar fecha propuesta" : "Proponer otra fecha"}
            </button>
          )}
          {cancelAction && (
            <form action={cancelAction}>
              <input type="hidden" name="bookingId" value={booking.id} />
              <ConfirmSubmitButton
                confirmMessage="¿Cancelar esta reserva? El beneficiario podrá solicitar otra experiencia después."
                className="vb-btn-danger h-11 px-5 text-sm"
              >
                Cancelar
              </ConfirmSubmitButton>
            </form>
          )}
        </div>
      )}

      {proposeAlternativeAction && showProposeForm && (
        <form
          action={proposeAlternativeAction}
          className="mt-3.5 pt-3.5 border-t border-black/5 flex flex-wrap items-end gap-2.5"
          onSubmit={() => setShowProposeForm(false)}
        >
          <input type="hidden" name="bookingId" value={booking.id} />
          <label className="text-sm">
            <span className="block text-xs text-muted mb-1">Fecha propuesta</span>
            <input type="date" name="proposedDate" required className="vb-input h-11 text-sm" style={{ width: 160 }} />
          </label>
          <label className="text-sm">
            <span className="block text-xs text-muted mb-1">Momento</span>
            <select name="proposedMoment" required defaultValue="" className="vb-input h-11 text-sm" style={{ width: 130 }}>
              <option value="" disabled>Elegir…</option>
              {Object.entries(MOMENT_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="block text-xs text-muted mb-1">Hora aprox. (opcional)</span>
            <input type="time" name="proposedHour" className="vb-input h-11 text-sm" style={{ width: 120 }} />
          </label>
          <button type="submit" className="vb-btn-dark h-11 px-5 text-sm">
            Enviar propuesta
          </button>
        </form>
      )}
    </div>
  )
}

type Counts = { requested: number; confirmed: number }

const TABS: StageTab[] = [
  { href: `${PAGE_PATH}/reservas/solicitadas`, label: "Solicitadas", icon: Inbox, countKey: "requested" },
  { href: `${PAGE_PATH}/reservas/confirmadas`, label: "Confirmadas", icon: CalendarCheck2, countKey: "confirmed" },
  { href: `${PAGE_PATH}/reservas/historial`, label: "Historial", icon: History, countKey: null },
]

export function ReservasBottomNav({ counts }: { counts: Counts }) {
  return <StageNav tabs={TABS} counts={counts} activeTextClass="text-[#18140F]" badgeClass="bg-[#18140F]" />
}
