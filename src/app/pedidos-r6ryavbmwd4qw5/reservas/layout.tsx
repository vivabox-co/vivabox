import { getReservasCounts } from "./data"
import { ReservasSubNav } from "./components"

export default async function ReservasLayout({ children }: { children: React.ReactNode }) {
  const counts = await getReservasCounts()

  return (
    <section>
      <ReservasSubNav counts={counts} />
      {children}
    </section>
  )
}
