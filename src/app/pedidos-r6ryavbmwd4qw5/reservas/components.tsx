"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Booking, formatDate, formatRequestedDate } from "./types"
import { PAGE_PATH } from "../types"

const STATUS_LABEL: Record<Booking["status"], string> = {
  requested: "Solicitada",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
}

const STATUS_CLASS: Record<Booking["status"], string> = {
  requested: "bg-accent-tint text-primary",
  confirmed: "bg-primary text-white",
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
}: {
  booking: Booking
  primaryAction?: (formData: FormData) => void
  primaryLabel?: string
  cancelAction?: (formData: FormData) => void
}) {
  const requestedDate = formatRequestedDate(booking.requested_date)

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

      {(primaryAction || cancelAction) && (
        <div className="mt-3.5 flex flex-wrap gap-2.5">
          {primaryAction && primaryLabel && (
            <form action={primaryAction}>
              <input type="hidden" name="bookingId" value={booking.id} />
              <button type="submit" className="vb-btn-primary h-11 px-5 text-sm">
                {primaryLabel}
              </button>
            </form>
          )}
          {cancelAction && (
            <form
              action={cancelAction}
              onSubmit={(e) => {
                if (!window.confirm("¿Cancelar esta reserva? El beneficiario podrá solicitar otra experiencia después.")) {
                  e.preventDefault()
                }
              }}
            >
              <input type="hidden" name="bookingId" value={booking.id} />
              <button type="submit" className="vb-btn-danger h-11 px-5 text-sm">
                Cancelar
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

type Counts = { requested: number; confirmed: number }

const TABS = [
  { href: `${PAGE_PATH}/reservas/solicitadas`, label: "Solicitadas", countKey: "requested" as const },
  { href: `${PAGE_PATH}/reservas/confirmadas`, label: "Confirmadas", countKey: "confirmed" as const },
  { href: `${PAGE_PATH}/reservas/historial`, label: "Historial", countKey: null },
]

export function ReservasSubNav({ counts }: { counts: Counts }) {
  const pathname = usePathname()

  return (
    <div className="flex gap-2 mb-5">
      {TABS.map(({ href, label, countKey }) => {
        const active = pathname === href
        const count = countKey ? counts[countKey] : null

        return (
          <Link
            key={href}
            href={href}
            className={`inline-flex items-center gap-1.5 rounded-[13px] px-3.5 py-2 text-sm font-semibold transition-colors ${
              active ? "bg-primary text-white" : "vb-card text-muted"
            }`}
          >
            {label}
            {!!count && (
              <span
                className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
                  active ? "bg-white/25 text-white" : "bg-primary text-white"
                }`}
              >
                {count}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}
