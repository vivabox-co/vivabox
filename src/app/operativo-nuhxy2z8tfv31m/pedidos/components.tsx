"use client"

import { Package, Truck, History } from "lucide-react"
import { Order } from "./types"
import { formatDate, PAGE_PATH } from "../types"
import { StageNav, StageTab, ConfirmSubmitButton } from "../components"

export function OrderCard({ order, action, actionLabel }: { order: Order; action?: (formData: FormData) => void; actionLabel?: string }) {
  const destinatario = order.recipient_name || order.buyer_name
  const contacto = order.recipient_contact || order.buyer_email

  return (
    <div className="vb-card p-5">
      <div className="text-[26px] font-bold tracking-wide mb-3.5 text-primary">
        {order.code ?? "⚠ Sin código generado"}
      </div>

      <p className="my-1 text-[15px]"><strong>Caja:</strong> {order.box_slug} x{order.quantity}</p>
      <p className="my-1 text-[15px]"><strong>Comprador:</strong> {order.buyer_name} ({order.buyer_email})</p>
      <p className="my-1 text-[15px]"><strong>Destinatario:</strong> {destinatario} {contacto ? `(${contacto})` : ""}</p>
      {order.delivery_direccion && (
        <p className="my-1 text-[15px]">
          <strong>Dirección:</strong> {order.delivery_direccion}, {order.delivery_ciudad}
          {order.delivery_detalles ? ` — ${order.delivery_detalles}` : ""}
        </p>
      )}
      {order.prepared_at && (
        <p className="my-1 text-[15px] text-muted"><strong>Preparada:</strong> {formatDate(order.prepared_at)}</p>
      )}
      {order.shipped_at && (
        <p className="my-1 text-[15px] text-muted"><strong>Enviada:</strong> {formatDate(order.shipped_at)}</p>
      )}
      <p className="text-muted text-xs mt-2.5">Venta ID: {order.id}</p>

      {action && actionLabel && (
        <form action={action} className="mt-3.5">
          <input type="hidden" name="ventaId" value={order.id} />
          <ConfirmSubmitButton confirmMessage={`¿${actionLabel}?`} className="vb-btn-primary h-11 px-5 text-sm">
            {actionLabel}
          </ConfirmSubmitButton>
        </form>
      )}
    </div>
  )
}

type Counts = { toPrepare: number; toShip: number }

const TABS: StageTab[] = [
  { href: `${PAGE_PATH}/pedidos/por-preparar`, label: "Por preparar", icon: Package, countKey: "toPrepare" },
  { href: `${PAGE_PATH}/pedidos/preparadas`, label: "Preparadas", icon: Truck, countKey: "toShip" },
  { href: `${PAGE_PATH}/pedidos/historial`, label: "Historial", icon: History, countKey: null },
]

export function PedidosBottomNav({ counts }: { counts: Counts }) {
  return <StageNav tabs={TABS} counts={counts} activeTextClass="text-primary" badgeClass="bg-primary" />
}
