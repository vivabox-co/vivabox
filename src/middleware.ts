import { NextRequest, NextResponse } from "next/server"

// URL volontairement non devinable, jamais liée depuis le site — c'est la
// première barrière. Le Basic Auth ci-dessous est la deuxième : même en
// trouvant l'URL, il faut le mot de passe pour voir les codes d'activation.
const STAFF_ORDERS_PATH = "/pedidos-r6ryavbmwd4qw5"

function unauthorized() {
  return new NextResponse("Autenticación requerida", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Vivabox interno"' },
  })
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  // Checkout n'est pas encore prêt pour de vrais clients : on renvoie
  // toute tentative d'y accéder (lien direct, bouton, deep link) vers
  // /proximamente, en gardant le chemin d'origine pour y revenir plus tard.
  if (pathname === "/checkout" || pathname.startsWith("/checkout/")) {
    const url = req.nextUrl.clone()
    url.pathname = "/proximamente"
    url.search = `?next=${encodeURIComponent(pathname + search)}`
    return NextResponse.redirect(url)
  }

  const user = process.env.ORDERS_ADMIN_USER
  const pass = process.env.ORDERS_ADMIN_PASSWORD

  if (!user || !pass) {
    return new NextResponse("Acceso no configurado (falta ORDERS_ADMIN_USER/PASSWORD)", { status: 500 })
  }

  const auth = req.headers.get("authorization")

  if (auth?.startsWith("Basic ")) {
    const decoded = Buffer.from(auth.slice(6), "base64").toString("utf-8")
    const separatorIndex = decoded.indexOf(":")
    const providedUser = decoded.slice(0, separatorIndex)
    const providedPass = decoded.slice(separatorIndex + 1)

    if (providedUser === user && providedPass === pass) {
      return NextResponse.next()
    }
  }

  return unauthorized()
}

export const config = {
  // "/:path*" seul ne matche PAS le chemin exact sans sous-segment — il faut
  // les deux entrées, sinon la page racine se charge sans passer par le
  // middleware (bug constaté : la page s'affichait sans mot de passe).
  matcher: [
    "/pedidos-r6ryavbmwd4qw5",
    "/pedidos-r6ryavbmwd4qw5/:path*",
    "/checkout",
    "/checkout/:path*",
  ],
}
