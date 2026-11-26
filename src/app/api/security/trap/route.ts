import { after } from "next/server"
import { getSupabase } from "@/services/supabase"
import { reportSecurityEvent } from "@/services/securityAlert"

// Destination interne des chemins piège (voir proxy.ts) : le proxy y
// réécrit la requête en passant le chemin d'origine dans x-trap-path. On
// répond comme n'importe quelle page inexistante (404 vide), sans rien
// révéler ; l'alerte part après la réponse.
function handle(req: Request) {
  const path = req.headers.get("x-trap-path") ?? "/api/security/trap"
  after(() => reportSecurityEvent(getSupabase(), req, "trap_route", path))
  return new Response("Not Found", { status: 404 })
}

export const GET = handle
export const HEAD = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
