import { getRequested } from "../data"
import { confirmBooking, cancelBooking, proposeAlternative } from "../actions"
import { BookingCard } from "../components"

export default async function SolicitadasPage() {
  const bookings = await getRequested()

  return (
    <section>
      <h1 className="text-[22px] font-semibold mb-1">Solicitadas</h1>
      <p className="text-muted mb-5">
        {bookings.length === 0 ? "Nada pendiente 🎉" : `${bookings.length} reserva(s) por confirmar`}
      </p>
      <div className="flex flex-col gap-4">
        {bookings.map((b) => (
          <BookingCard
            key={b.id}
            booking={b}
            primaryAction={confirmBooking}
            primaryLabel="Confirmar"
            cancelAction={cancelBooking}
            proposeAlternativeAction={proposeAlternative}
          />
        ))}
      </div>
    </section>
  )
}
