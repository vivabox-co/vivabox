import { NextRequest, NextResponse } from "next/server"
import { PREVIEW_ACCESS_COOKIE, PREVIEW_ACCESS_VALUE } from "@/services/previewAccess"

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  // Checkout n'est pas encore prêt pour de vrais clients : on renvoie
  // toute tentative d'y accéder (lien direct, bouton, deep link) vers
  // /proximamente, en gardant le chemin d'origine pour y revenir plus tard.
  // Exception : sur les déploiements Preview (VERCEL_ENV), on laisse passer
  // pour pouvoir tester le checkout (ex. l'intégration Wompi) avant le
  // lancement public — la vraie prod reste bloquée normalement.
  const isProduction = process.env.VERCEL_ENV === "production"
  const isCheckoutPath = pathname === "/checkout" || pathname.startsWith("/checkout/")

  if (isProduction && isCheckoutPath) {
    // Entrée secrète : un clic caché sur /proximamente (POST /api/preview-access)
    // pose ce cookie pour laisser entrer les premiers testeurs/clients sans
    // attendre le lancement public officiel.
    const hasPreviewAccess =
      req.cookies.get(PREVIEW_ACCESS_COOKIE)?.value === PREVIEW_ACCESS_VALUE

    if (hasPreviewAccess) {
      return NextResponse.next()
    }

    const url = req.nextUrl.clone()
    url.pathname = "/proximamente"
    url.search = `?next=${encodeURIComponent(pathname + search)}`
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/checkout",
    "/checkout/:path*",
  ],
}
