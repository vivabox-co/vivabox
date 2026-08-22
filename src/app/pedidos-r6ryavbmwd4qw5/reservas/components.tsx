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

const ORDINAL_LABEL = ["1ª opción", "2ª opción", "3ª opción"]

// Ordre de priorité strict P1 → P2 → P3 : le bénéficiaire a déjà classé ses
// options, l'opérateur ne fait que confirmer la première qui est disponible
// (jamais redemander une nouvelle confirmation au bénéficiaire pour ça).
function getPreferences(booking: Booking) {
  if (booking.requested_dates && booking.requested_dates.length > 0) return booking.requested_dates
  return booking.requested_date ? [booking.requested_date] : []
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
  const proposedDate = formatRequestedDate(booking.proposed_date)
  const preferences = getPreferences(booking)
  const [showProposeForm, setShowProposeForm] = useState(false)

  // La section "Preferencias" + son action "Confirmar" par option ne fait
  // sens que tant que la reserva n'a pas déjà une fecha effective (confirmed/
  // completed/cancelled) — dans ces cas-là on retombe sur l'affichage simple
  // fecha + action générique passée par la page (Confirmadas/Historial).
  const isResolving = primaryAction && (booking.status === "requested" || booking.status === "alternative_proposed")

  return (
    <div className="vb-card p-5">
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div className="text-[19px] font-bold text-foreground leading-snug">
          {booking.experience_title ?? booking.experience_code}
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <p className="my-1 text-[15px]">
        <strong>Beneficiario:</strong> {booking.beneficiary_name || "—"} {booking.beneficiary_email ? `(${booking.beneficiary_email})` : ""}
      </p>
      {booking.experience_city && (
        <p className="my-1 text-[15px]"><strong>Ciudad:</strong> {booking.experience_city}</p>
      )}

      {isResolving && preferences.length > 0 && (
        <div className="mt-3 pt-3 border-t border-black/5">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Preferencias del beneficiario</p>
          <div className="flex flex-col gap-2">
            {preferences.map((date, i) => (
              <div key={date} className="flex flex-wrap items-center justify-between gap-2.5 rounded-[13px] bg-black/[0.03] px-3.5 py-2.5">
                <span className="text-sm">
                  <span className="font-semibold text-foreground">{ORDINAL_LABEL[i] ?? `Opción ${i + 1}`}</span>
                  <span className="text-muted"> · {formatRequestedDate(date)}</span>
                </span>
                {booking.status === "requested" ? (
                  <form action={primaryAction}>
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <input type="hidden" name="confirmedDate" value={date} />
                    <ConfirmSubmitButton
                      confirmMessage={`¿Confirmar la reserva para el ${formatRequestedDate(date)}?`}
                      className={i === 0 ? "vb-btn-dark h-9 px-4 text-xs" : "vb-btn-soft h-9 px-4 text-xs"}
                    >
                      Confirmar
                    </ConfirmSubmitButton>
                  </form>
                ) : (
                  // alternative_proposed : aucune de ces options n'a fonctionné, c'est
                  // pour ça qu'une alternative a été proposée plus bas.
                  <span className="text-xs font-medium text-muted">No disponible</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {isResolving && booking.status === "alternative_proposed" && (
        <div className="mt-3 rounded-[16px] bg-[#FFF3E0] px-3.5 py-3">
          <p className="text-sm font-semibold text-[#8A5300]">Propuesta enviada</p>
          <p className="text-sm text-[#8A5300]">
            {proposedDate}
            {booking.proposed_moment && ` · ${MOMENT_LABEL[booking.proposed_moment as keyof typeof MOMENT_LABEL] ?? booking.proposed_moment}`}
            {booking.proposed_hour && ` (~${booking.proposed_hour})`}
          </p>
          <p className="text-xs text-[#8A5300]/80 mt-0.5">Esperando respuesta del beneficiario</p>
        </div>
      )}

      {!isResolving && booking.requested_date && (
        <p className="my-1 text-[15px]">
          <strong>{booking.status === "cancelled" ? "Fecha" : "Fecha confirmada"}:</strong> {formatRequestedDate(booking.requested_date)}
        </p>
      )}

      {booking.message && (
        <p className="my-1 text-[15px] mt-2.5"><strong>Mensaje:</strong> {booking.message}</p>
      )}
      {booking.box_slug && (
        <p className="my-1 text-[15px] text-muted"><strong>Caja:</strong> {booking.box_slug} · {booking.activation_code ?? "sin código"}</p>
      )}
      {booking.buyer_name && (
        <p className="my-1 text-[15px] text-muted"><strong>Comprador:</strong> {booking.buyer_name}</p>
      )}
      <p className="text-muted text-xs mt-2.5">
        Solicitada el {formatDate(booking.created_at)} · Booking ID: {booking.id}
      </p>

      {isResolving ? (
        <>
          <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
            {booking.status === "alternative_proposed" && primaryAction && (
              <form action={primaryAction}>
                <input type="hidden" name="bookingId" value={booking.id} />
                <ConfirmSubmitButton
                  confirmMessage="¿Confirmar la reserva con la fecha propuesta?"
                  className="vb-btn-dark h-11 px-5 text-sm"
                >
                  Confirmar con fecha propuesta
                </ConfirmSubmitButton>
              </form>
            )}
            {/* Filet de sécurité pour une reserva sans aucune préférence enregistrée
                (donnée historique/incomplète) : la section Preferencias ne s'affiche
                pas, il faut donc quand même une action de confirmation générique. */}
            {booking.status === "requested" && preferences.length === 0 && primaryAction && primaryLabel && (
              <form action={primaryAction}>
                <input type="hidden" name="bookingId" value={booking.id} />
                <ConfirmSubmitButton confirmMessage={`¿${primaryLabel}?`} className="vb-btn-dark h-11 px-5 text-sm">
                  {primaryLabel}
                </ConfirmSubmitButton>
              </form>
            )}
            {proposeAlternativeAction && (
              <button
                type="button"
                onClick={() => setShowProposeForm((v) => !v)}
                className="vb-btn-soft h-11 px-5 text-sm"
              >
                {booking.status === "alternative_proposed" ? "Cambiar fecha propuesta" : "Proponer otra fecha"}
              </button>
            )}
            {cancelAction && (
              <form action={cancelAction} className="ml-auto">
                <input type="hidden" name="bookingId" value={booking.id} />
                <ConfirmSubmitButton
                  confirmMessage="¿Cancelar esta reserva? El beneficiario podrá solicitar otra experiencia después."
                  className="vb-btn-danger h-9 px-3.5 text-xs"
                >
                  Cancelar reserva
                </ConfirmSubmitButton>
              </form>
            )}
          </div>
        </>
      ) : (
        (primaryAction || cancelAction) && (
          <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
            {primaryAction && primaryLabel && (
              <form action={primaryAction}>
                <input type="hidden" name="bookingId" value={booking.id} />
                <ConfirmSubmitButton confirmMessage={`¿${primaryLabel}?`} className="vb-btn-dark h-11 px-5 text-sm">
                  {primaryLabel}
                </ConfirmSubmitButton>
              </form>
            )}
            {cancelAction && (
              <form action={cancelAction} className="ml-auto">
                <input type="hidden" name="bookingId" value={booking.id} />
                <ConfirmSubmitButton
                  confirmMessage="¿Cancelar esta reserva? El beneficiario podrá solicitar otra experiencia después."
                  className="vb-btn-danger h-9 px-3.5 text-xs"
                >
                  Cancelar reserva
                </ConfirmSubmitButton>
              </form>
            )}
          </div>
        )
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
  { href: `${PAGE_PATH}/reservas/solicitadas`, label: "Por resolver", icon: Inbox, countKey: "requested" },
  { href: `${PAGE_PATH}/reservas/confirmadas`, label: "Confirmadas", icon: CalendarCheck2, countKey: "confirmed" },
  { href: `${PAGE_PATH}/reservas/historial`, label: "Historial", icon: History, countKey: null },
]

export function ReservasBottomNav({ counts }: { counts: Counts }) {
  return <StageNav tabs={TABS} counts={counts} activeTextClass="text-[#18140F]" badgeClass="bg-[#18140F]" />
}
