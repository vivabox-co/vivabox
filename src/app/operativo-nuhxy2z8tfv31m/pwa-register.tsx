"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"
import { PAGE_PATH } from "./types"

const DISMISS_KEY = "vb-operativo-install-dismissed"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

// Chrome n'affiche plus de bandeau d'installation automatique depuis
// quelques versions — sans ce bouton, l'option est cachée dans le menu ⋮
// et personne ne la trouve. iOS Safari n'émet jamais beforeinstallprompt,
// donc ce bandeau reste simplement invisible là-bas (l'ajout à l'écran
// d'accueil s'y fait uniquement via le bouton Partager, hors de notre
// contrôle).
export function PwaRegister() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register(`${PAGE_PATH}/sw.js`).catch(() => {})
    }

    setDismissed(localStorage.getItem(DISMISS_KEY) === "1")

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => setInstallEvent(null)

    window.addEventListener("beforeinstallprompt", onBeforeInstall)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  if (!installEvent || dismissed) return null

  return (
    <div className="vb-card fixed top-3 left-3 right-3 z-30 max-w-[860px] mx-auto flex items-center gap-3 px-4 py-3">
      <Download size={18} className="text-primary shrink-0" />
      <p className="flex-1 text-sm">Instalá esta app en tu celular para acceso rápido.</p>
      <button
        className="vb-btn-primary px-3 py-1.5 text-sm"
        onClick={async () => {
          await installEvent.prompt()
          await installEvent.userChoice
          setInstallEvent(null)
        }}
      >
        Instalar
      </button>
      <button
        aria-label="Cerrar"
        className="text-muted p-1"
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, "1")
          setDismissed(true)
        }}
      >
        <X size={16} />
      </button>
    </div>
  )
}
