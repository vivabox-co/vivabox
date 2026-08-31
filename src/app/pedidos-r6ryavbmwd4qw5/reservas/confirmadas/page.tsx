import { getConfirmed } from "../data"
import { completeBooking, cancelBooking } from "../actions"
import { ConfirmadasView } from "./view"

export default async function ConfirmadasPage() {
  const bookings = await getConfirmed()

  return (
    <section>
      <h1 className="text-[22px] font-semibold mb-1">Confirmadas</h1>
      <p className="text-muted mb-5">
        {bookings.length === 0 ? "Nada por aquí 🎉" : `${bookings.length} reserva(s) confirmada(s)`}
      </p>
      {bookings.length > 0 && (
        <ConfirmadasView
          bookings={bookings}
          primaryAction={completeBooking}
          primaryLabel="Marcar como completada"
          cancelAction={cancelBooking}
        />
      )}
    </section>
  )
}
