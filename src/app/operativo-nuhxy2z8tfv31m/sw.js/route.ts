import { NextResponse } from "next/server"

// Servi depuis /operativo-.../sw.js : le scope par défaut d'un service
// worker est le dossier de son propre script, donc pas besoin d'un header
// Service-Worker-Allowed — il ne peut de toute façon pas contrôler autre
// chose que cette zone. Route dédiée (pas public/) pour rester elle aussi
// derrière le middleware, cohérent avec le reste de la zone interne.
const SW_SOURCE = `
const CACHE_NAME = "vb-operativo-shell-v1"
const OFFLINE_URL = new URL("offline", self.registration.scope).pathname
const SHELL_URLS = [
  OFFLINE_URL,
  "/icons/pwa/icon-192.png",
  "/icons/pwa/icon-512.png",
  "/icons/pwa/icon-maskable-512.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

// Les données (pedidos/reservas) doivent toujours venir du réseau — on ne
// sert jamais une page en cache. Le cache ne sert qu'à afficher un écran
// "Sin conexión" correct au lieu de l'erreur générique du navigateur.
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_URL)))
  }
})
`

export async function GET() {
  return new NextResponse(SW_SOURCE, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  })
}
