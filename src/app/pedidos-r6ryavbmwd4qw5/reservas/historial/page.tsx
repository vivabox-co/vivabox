import { getBookingHistory } from "../data"
import { BookingCard } from "../components"

export default async function HistorialReservasPage() {
  const bookings = await getBookingHistory()

  return (
    <section>
      <h1 className="text-[22px] font-semibold mb-1">Historial</h1>
      <p className="text-muted mb-5">
        {bookings.length === 0 ? "Todavía nada aquí" : `Últimas ${bookings.length} reserva(s) completadas o canceladas`}
      </p>
      <div className="flex flex-col gap-4">
        {bookings.map((b) => (
          <BookingCard key={b.id} booking={b} />
        ))}
      </div>
    </section>
  )
}
