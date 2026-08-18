import { getConfirmed } from "../data"
import { completeBooking, cancelBooking } from "../actions"
import { BookingCard } from "../components"

export default async function ConfirmadasPage() {
  const bookings = await getConfirmed()

  return (
    <section>
      <h1 className="text-[22px] font-semibold mb-1">Confirmadas</h1>
      <p className="text-muted mb-5">
        {bookings.length === 0 ? "Nada por aquí 🎉" : `${bookings.length} reserva(s) confirmada(s)`}
      </p>
      <div className="flex flex-col gap-4">
        {bookings.map((b) => (
          <BookingCard
            key={b.id}
            booking={b}
            primaryAction={completeBooking}
            primaryLabel="Marcar como completada"
            cancelAction={cancelBooking}
          />
        ))}
      </div>
    </section>
  )
}
