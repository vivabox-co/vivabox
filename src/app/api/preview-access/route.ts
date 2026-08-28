import { NextRequest, NextResponse } from "next/server"
import {
  PREVIEW_ACCESS_COOKIE,
  PREVIEW_ACCESS_VALUE,
  PREVIEW_ACCESS_MAX_AGE,
} from "@/services/previewAccess"

function resolveNext(next: string | null) {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next
  return "/checkout"
}

// Point d'entrée du "clic secret" sur /proximamente (la lettre "o" de
// Vivabox) — pose le cookie qui laisse passer le garde-fou checkout en
// production (voir middleware.ts) puis redirige vers la page demandée.
export async function GET(req: NextRequest) {
  const next = resolveNext(req.nextUrl.searchParams.get("next"))

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
