import { NextRequest, NextResponse } from "next/server"
import {
  PREVIEW_ACCESS_COOKIE,
  PREVIEW_ACCESS_VALUE,
  PREVIEW_ACCESS_MAX_AGE,
} from "@/services/previewAccess"

// On valide le RÉSULTAT (même origine après résolution) plutôt que le préfixe :
// le parseur d'URL traite "\" comme "/" et ignore tabulations et sauts de
// ligne, donc "/\evil.com" ou "/<tab>/evil.com" passeraient un simple test
// startsWith("/") && !startsWith("//") et redirigeraient hors du site.
function resolveNext(next: string | null, base: URL) {
  if (next && next.startsWith("/")) {
    try {
      const target = new URL(next, base)
      if (target.origin === base.origin) return target.pathname + target.search + target.hash
    } catch {
      // URL invalide : on retombe sur la valeur par défaut.
    }
  }
  return "/checkout"
}

// Point d'entrée du "clic secret" sur /proximamente (la lettre "o" de
// Vivabox) — pose le cookie qui laisse passer le garde-fou checkout en
// production (voir proxy.ts) puis redirige vers la page demandée.
export async function GET(req: NextRequest) {
  const next = resolveNext(req.nextUrl.searchParams.get("next"), req.nextUrl)

  const res = NextResponse.redirect(new URL(next, req.url))

  res.cookies.set(PREVIEW_ACCESS_COOKIE, PREVIEW_ACCESS_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PREVIEW_ACCESS_MAX_AGE,
  })

  return res
}
