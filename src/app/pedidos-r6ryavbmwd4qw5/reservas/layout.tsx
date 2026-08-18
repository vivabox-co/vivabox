import { getReservasCounts } from "./data"
import { ReservasBottomNav } from "./components"
import { ZoneSwitcher } from "../components"

export default async function ReservasLayout({ children }: { children: React.ReactNode }) {
  const counts = await getReservasCounts()

  return (
    <section>
      <ZoneSwitcher active="reservas" />
      {children}
      <ReservasBottomNav counts={counts} />
    </section>
  )
}
