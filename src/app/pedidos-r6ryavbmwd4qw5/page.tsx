import Link from "next/link"
import { Package, CalendarCheck2 } from "lucide-react"
import { getHubCounts } from "./data"
import { PAGE_PATH } from "./types"

export default async function PedidosHubPage() {
  const counts = await getHubCounts()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[22px] font-semibold mb-1">Vivabox — Interno</h1>
      <p className="text-muted mb-3">Elegí qué querés gestionar.</p>

      <Link href={`${PAGE_PATH}/pedidos/por-preparar`} className="vb-card p-6 flex items-center gap-4">
        <div className="vb-thumb text-primary">
          <Package size={24} />
        </div>
        <div className="flex-1">
          <div className="text-[19px] font-bold text-primary mb-1">Pedidos</div>
          <p className="text-muted text-sm">Preparación y envío de las cajas</p>
        </div>
        {!!counts.pedidos && (
          <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full bg-primary text-white text-sm font-bold">
            {counts.pedidos}
          </span>
        )}
      </Link>

      <Link href={`${PAGE_PATH}/reservas/solicitadas`} className="vb-card p-6 flex items-center gap-4">
        <div className="vb-thumb text-[#18140F]">
          <CalendarCheck2 size={24} />
        </div>
        <div className="flex-1">
          <div className="text-[19px] font-bold text-[#18140F] mb-1">Reservas</div>
          <p className="text-muted text-sm">Solicitudes de experiencia de los beneficiarios</p>
        </div>
        {!!counts.reservas && (
          <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full bg-[#18140F] text-white text-sm font-bold">
            {counts.reservas}
          </span>
        )}
      </Link>
    </div>
  )
}
