import { NextRequest, NextResponse } from "next/server"
import { PREVIEW_ACCESS_COOKIE, PREVIEW_ACCESS_VALUE } from "@/services/previewAccess"

// URL volontairement non devinable, jamais liée depuis le site — c'est la
// première barrière. Le Basic Auth ci-dessous est la deuxième : même en
// trouvant l'URL, il faut le mot de passe pour voir les codes d'activation.
const STAFF_ORDERS_PATH = "/operativo-nuhxy2z8tfv31m"

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
  // Exception : sur les déploiements Preview (VERCEL_ENV), on laisse passer
  // pour pouvoir tester le checkout (ex. l'intégration Wompi) avant le
  // lancement public — la vraie prod reste bloquée normalement.
  // Chrome vérifie l'installabilité PWA en refetchant le manifest et le
  // service worker lui-même, en interne — cette requête n'envoie pas
  // forcément les identifiants Basic Auth mis en cache pour l'onglet, et
  // reçoit alors un 401 qui fait échouer la détection en silence (aucun
  // beforeinstallprompt n'est jamais émis). Ces deux fichiers ne contiennent
  // rien de sensible (pas de données pedidos/reservas) et restent de toute
  // façon protégés par l'URL non devinable — on les laisse passer sans mot
  // de passe.
  const isPwaAssetPath =
    pathname === `${STAFF_ORDERS_PATH}/manifest.webmanifest` || pathname === `${STAFF_ORDERS_PATH}/sw.js`

  if (isPwaAssetPath) {
    return NextResponse.next()
  }

  const isProduction = process.env.VERCEL_ENV === "production"
  const isCheckoutPath = pathname === "/checkout" || pathname.startsWith("/checkout/")

  if (isProduction && isCheckoutPath) {
    // Entrée secrète : un clic caché sur /proximamente (POST /api/preview-access)
    // pose ce cookie pour laisser entrer les premiers testeurs/clients sans
    // attendre le lancement public officiel, sans exiger le Basic Auth staff.
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
    "/operativo-nuhxy2z8tfv31m",
    "/operativo-nuhxy2z8tfv31m/:path*",
    "/checkout",
    "/checkout/:path*",
  ],
}
