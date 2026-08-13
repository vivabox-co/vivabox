"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Package, Truck, History } from "lucide-react"
import { PAGE_PATH, Order, formatDate } from "./types"

export function ActionButton({ label }: { label: string }) {
  return (
    <button type="submit" className="vb-btn-primary h-11 px-5 text-sm">
      {label}
    </button>
  )
}

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
          <ActionButton label={actionLabel} />
        </form>
      )}
    </div>
  )
}

type Counts = { toPrepare: number; toShip: number }

const TABS = [
  { href: `${PAGE_PATH}/por-preparar`, label: "Por preparar", icon: Package, countKey: "toPrepare" as const },
  { href: `${PAGE_PATH}/preparadas`, label: "Preparadas", icon: Truck, countKey: "toShip" as const },
  { href: `${PAGE_PATH}/historial`, label: "Historial", icon: History, countKey: null },
]

export function BottomNav({ counts }: { counts: Counts }) {
  const pathname = usePathname()

  return (
    <nav className="vb-sticky-bar fixed bottom-0 left-0 right-0 flex z-10">
      <div className="flex w-full max-w-[860px] mx-auto">
        {TABS.map(({ href, label, icon: Icon, countKey }) => {
          const active = pathname === href
          const count = countKey ? counts[countKey] : null

          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 pt-2.5 px-1 pb-3.5 relative text-xs ${
                active ? "text-primary font-bold" : "text-muted font-medium"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.25 : 1.75} />
              {label}
              {!!count && (
                <span className="absolute top-1 right-[28%] flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-primary text-white text-[10px] font-bold">
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
