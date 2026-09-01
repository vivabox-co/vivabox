"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"
import { PAGE_PATH } from "./types"

const DISMISS_KEY = "vb-operativo-install-dismissed"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

declare global {
  interface Window {
    __vbDeferredInstallPrompt?: BeforeInstallPromptEvent | null
  }
}

type Platform = "ios" | "android" | "desktop"

function detectPlatform(): Platform {
  const ua = navigator.userAgent
  if (/iphone|ipad|ipod/i.test(ua)) return "ios"
  if (/android/i.test(ua)) return "android"
  return "desktop"
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // Flag legacy exposé par iOS Safari, absent des types DOM standards.
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

type InstallState = {
  visible: boolean
  dismissed: boolean
  platform: Platform
  installEvent: BeforeInstallPromptEvent | null
  showHelp: boolean
}

const INITIAL_STATE: InstallState = {
  visible: false,
  dismissed: true,
  platform: "desktop",
  installEvent: null,
  showHelp: false,
}

// Aucun navigateur ne permet à du JS de déclencher l'installation sans son
// propre feu vert (beforeinstallprompt) — protection anti-spam délibérée,
// pas une limite qu'on peut coder autour. Le bouton reste donc unique et
// toujours cliquable : il installe directement si Chrome a donné
// l'événement, sinon le clic révèle la marche à suivre (jamais imposée
// avant qu'on clique).
export function PwaRegister() {
  const [state, setState] = useState<InstallState>(INITIAL_STATE)

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register(`${PAGE_PATH}/sw.js`).catch(() => {})
    }

    // Le script inline du layout a pu capturer l'événement avant que ce
    // composant ne soit monté (voir CAPTURE_INSTALL_PROMPT_SCRIPT). Lecture
    // d'APIs navigateur (localStorage/matchMedia/userAgent) impossible côté
    // serveur : l'état initial doit rester le défaut SSR-safe et se
    // synchroniser ici, après le premier rendu client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({
      visible: !isStandalone(),
      dismissed: localStorage.getItem(DISMISS_KEY) === "1",
      platform: detectPlatform(),
      installEvent: window.__vbDeferredInstallPrompt ?? null,
      showHelp: false,
    })

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setState((s) => ({ ...s, installEvent: e as BeforeInstallPromptEvent }))
    }
    const onInstalled = () => setState((s) => ({ ...s, installEvent: null, visible: false }))

    window.addEventListener("beforeinstallprompt", onBeforeInstall)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  const { visible, dismissed, platform, installEvent, showHelp } = state
  if (!visible || dismissed) return null

  return (
    <div className="vb-card fixed top-3 left-3 right-3 z-30 max-w-[860px] mx-auto px-4 py-3">
      <div className="flex items-center gap-3">
        <Download size={18} className="text-primary shrink-0" />
        <p className="flex-1 text-sm">Instalá esta app en tu celular para acceso rápido.</p>
        <button
          className="vb-btn-primary px-3 py-1.5 text-sm shrink-0"
          onClick={async () => {
            if (installEvent) {
              await installEvent.prompt()
              await installEvent.userChoice
              setState((s) => ({ ...s, installEvent: null, visible: false }))
              return
            }
            // Chrome n'a pas (encore) donné l'accès direct : le clic révèle
            // la marche à suivre plutôt que de l'imposer sans qu'on demande.
            setState((s) => ({ ...s, showHelp: true }))
          }}
        >
          Instalar
        </button>
        <button
          aria-label="Cerrar"
          className="text-muted p-1 shrink-0"
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, "1")
            setState((s) => ({ ...s, dismissed: true }))
          }}
        >
          <X size={16} />
        </button>
      </div>
      {showHelp && !installEvent && (
        <p className="text-muted text-xs mt-2 pl-[30px]">
          {platform === "ios"
            ? "Tocá el ícono Compartir y elegí “Agregar a inicio”."
            : platform === "android"
              ? "Tocá el menú ⋮ arriba a la derecha y elegí “Instalar aplicación”."
              : "Buscá el ícono de instalar (⊕) en la barra de direcciones."}
        </p>
      )}
    </div>
  )
}
