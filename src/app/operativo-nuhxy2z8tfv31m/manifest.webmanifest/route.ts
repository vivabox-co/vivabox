import { NextResponse } from "next/server"
import { PAGE_PATH } from "../types"

// Manifest servi depuis une route dédiée (pas la convention manifest.ts de
// Next, qui ne fonctionne qu'à la racine de app/) — reste ainsi derrière le
// même middleware (URL non devinable + Basic Auth) que le reste de la zone.
export async function GET() {
  return NextResponse.json(
    {
      name: "Vivabox — Operativo",
      short_name: "Vivabox Operativo",
      description: "Panel operativo Vivabox: pedidos, reservas y alianzas.",
      // scope doit être un préfixe strict de start_url (spec Web App
      // Manifest) : un "/" final en trop sur scope seul cassait cette
      // règle et pouvait faire échouer la vérification d'installabilité
      // de Chrome en silence.
      start_url: PAGE_PATH,
      scope: PAGE_PATH,
      display: "standalone",
      background_color: "#FAF7F2",
      theme_color: "#FF8406",
      lang: "es-CO",
      icons: [
        { src: "/icons/pwa/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/icons/pwa/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "/icons/pwa/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } }
  )
}
