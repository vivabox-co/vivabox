import { ZoneSwitcher } from "../components"

// Une seule vue (pas de statut/étapes sur partner_leads) — pas de bottom
// nav ici, contrairement à Pedidos/Reservas qui en ont besoin pour leurs
// 3 onglets respectifs.
export default function AlianzasLayout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <ZoneSwitcher active="alianzas" />
      {children}
    </section>
  )
}
