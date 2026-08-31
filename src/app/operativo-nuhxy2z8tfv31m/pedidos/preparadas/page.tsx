import { getToShip } from "../data"
import { markShipped } from "../actions"
import { OrderCard } from "../components"

export default async function PreparadasPage() {
  const orders = await getToShip()

  return (
    <section>
      <h1 className="text-[22px] font-semibold mb-1">Preparadas — listas para enviar</h1>
      <p className="text-muted mb-5">
        {orders.length === 0 ? "Nada en espera de envío" : `${orders.length} pedido(s)`}
      </p>
      <div className="flex flex-col gap-4">
        {orders.map((o) => (
          <OrderCard key={o.id} order={o} action={markShipped} actionLabel="Marcar como enviada" />
        ))}
      </div>
    </section>
  )
}
