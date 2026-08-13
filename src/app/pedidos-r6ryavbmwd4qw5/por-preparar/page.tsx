import { getToPrepare } from "../data"
import { markPrepared } from "../actions"
import { OrderCard } from "../components"

export default async function PorPrepararPage() {
  const orders = await getToPrepare()

  return (
    <section>
      <h1 className="text-[22px] font-semibold mb-1">Por preparar</h1>
      <p className="text-muted mb-5">
        {orders.length === 0 ? "Nada pendiente 🎉" : `${orders.length} pedido(s)`}
      </p>
      <div className="flex flex-col gap-4">
        {orders.map((o) => (
          <OrderCard key={o.id} order={o} action={markPrepared} actionLabel="Marcar como preparada" />
        ))}
      </div>
    </section>
  )
}
