import type { Metadata, Viewport } from "next"
import { PwaRegister } from "./pwa-register"
import { PAGE_PATH } from "./types"

// Jamais indexée, jamais liée depuis le site — accès uniquement via l'URL
// directe + mot de passe (voir middleware.ts). Le manifest pointe vers la
// route dédiée manifest.webmanifest/ (pas la convention Next), pour rester
// elle aussi derrière ce middleware.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  manifest: `${PAGE_PATH}/manifest.webmanifest`,
  icons: {
    icon: "/icons/pwa/icon-192.png",
    apple: "/icons/pwa/apple-touch-icon-180.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vivabox Operativo",
  },
  other: {
    // Next n'émet que le tag "mobile-web-app-capable" moderne — celui-ci
    // reste nécessaire pour l'écran d'accueil sur les iOS plus anciens.
    "apple-mobile-web-app-capable": "yes",
  },
}

export const viewport: Viewport = {
  themeColor: "#FF8406",
  colorScheme: "light",
}

// Données live (Supabase), jamais pré-rendues au build.
export const dynamic = "force-dynamic"

export default function OperativoRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="vb-surface-base min-h-screen text-foreground">
      <div className="max-w-[860px] mx-auto px-5 pt-8 pb-[100px]">
        {children}
      </div>
      <PwaRegister />
    </div>
  )
}
