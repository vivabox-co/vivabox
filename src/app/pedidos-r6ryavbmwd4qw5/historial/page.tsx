import { getHistory } from "../data"
import { HISTORY_LIMIT } from "../types"
import { OrderCard } from "../components"

export default async function HistorialPage() {
  const orders = await getHistory()

  return (
    <section>
      <h1 className="text-[22px] font-semibold mb-1">Historial — enviadas</h1>
      <p className="text-muted mb-5">
        {orders.length === 0 ? "Ninguna todavía" : `Últimas ${orders.length} (máx. ${HISTORY_LIMIT})`}
      </p>
      <div className="flex flex-col gap-4">
        {orders.map((o) => (
          <OrderCard key={o.id} order={o} />
        ))}
      </div>
    </section>
  )
}
