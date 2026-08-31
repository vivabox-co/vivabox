import { getPedidosCounts } from "./data"
import { PedidosBottomNav } from "./components"
import { ZoneSwitcher } from "../components"

export default async function PedidosLayout({ children }: { children: React.ReactNode }) {
  const counts = await getPedidosCounts()

  return (
    <section>
      <ZoneSwitcher active="pedidos" />
      {children}
      <PedidosBottomNav counts={counts} />
    </section>
  )
}
