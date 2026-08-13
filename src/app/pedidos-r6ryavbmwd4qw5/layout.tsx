import { getCounts } from "./data"
import { BottomNav } from "./components"

// Jamais indexée, jamais liée depuis le site — accès uniquement via l'URL
// directe + mot de passe (voir middleware.ts).
export const metadata = {
  robots: { index: false, follow: false },
}

// Données live (Supabase), jamais pré-rendues au build.
export const dynamic = "force-dynamic"

export default async function PedidosLayout({ children }: { children: React.ReactNode }) {
  const counts = await getCounts()

  return (
    <div className="vb-surface-base min-h-screen text-foreground">
      <div className="max-w-[860px] mx-auto px-5 pt-8 pb-[100px]">
        {children}
      </div>
      <BottomNav counts={counts} />
    </div>
  )
}
