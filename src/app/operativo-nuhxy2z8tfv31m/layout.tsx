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

// Capture beforeinstallprompt dès le parsing du HTML, avant l'hydratation
// React — sur un mobile lent, Chrome peut l'émettre avant que le useEffect
// de PwaRegister ait eu le temps de poser son propre listener, et
// l'événement raté ne se represente pas. PwaRegister relit cette variable
// globale au montage.
const CAPTURE_INSTALL_PROMPT_SCRIPT = `
window.__vbDeferredInstallPrompt = null;
window.addEventListener("beforeinstallprompt", function (e) {
  e.preventDefault();
  window.__vbDeferredInstallPrompt = e;
});
`

export default function OperativoRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="vb-surface-base min-h-screen text-foreground">
      {/* eslint-disable-next-line react/no-danger */}
      <script dangerouslySetInnerHTML={{ __html: CAPTURE_INSTALL_PROMPT_SCRIPT }} />
      <div className="max-w-[860px] mx-auto px-5 pt-8 pb-[100px]">
        {children}
      </div>
      <PwaRegister />
    </div>
  )
}
