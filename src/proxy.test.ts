import { NextRequest } from "next/server"
import { afterEach, describe, expect, it, vi } from "vitest"
import { PREVIEW_ACCESS_COOKIE, PREVIEW_ACCESS_VALUE } from "@/services/previewAccess"
import { config, proxy as middleware } from "./proxy"

function request(path: string, cookie?: string) {
  return new NextRequest(`http://localhost${path}`, cookie ? { headers: { cookie } } : undefined)
}

const production = () => {
  vi.stubEnv("VERCEL_ENV", "production")
  vi.stubEnv("CHECKOUT_ENABLED", "")
}

const isPassThrough = (res: Response) =>
  res.status === 200 && !res.headers.get("location") && !res.headers.get("x-middleware-rewrite")

afterEach(() => vi.unstubAllEnvs())

describe("proxy — checkout gate", () => {
  it("sends production visitors to /proximamente, remembering where they wanted to go", () => {
    production()
    const res = middleware(request("/checkout/vivabox?utm=x"))
    expect(res.status).toBe(307)
    const location = new URL(res.headers.get("location")!)
    expect(location.pathname).toBe("/proximamente")
    expect(location.searchParams.get("next")).toBe("/checkout/vivabox?utm=x")
  })

  it("gates /checkout itself and every sub-path, but not look-alikes", () => {
    production()
    expect(middleware(request("/checkout")).status).toBe(307)
    expect(middleware(request("/checkout/vivabox/pago")).status).toBe(307)
    expect(isPassThrough(middleware(request("/checkouts")))).toBe(true)
    expect(isPassThrough(middleware(request("/regalar")))).toBe(true)
  })

  it("lets early-access visitors through with the right cookie", () => {
    production()
    const cookie = `${PREVIEW_ACCESS_COOKIE}=${PREVIEW_ACCESS_VALUE}`
    expect(isPassThrough(middleware(request("/checkout/vivabox", cookie)))).toBe(true)
  })

  it("does not let a wrong cookie value through", () => {
    production()
    expect(middleware(request("/checkout/vivabox", `${PREVIEW_ACCESS_COOKIE}=1`)).status).toBe(307)
    expect(middleware(request("/checkout/vivabox", `other=${PREVIEW_ACCESS_VALUE}`)).status).toBe(307)
  })

  it("opens the checkout to everyone once CHECKOUT_ENABLED is true in production", () => {
    vi.stubEnv("VERCEL_ENV", "production")
    vi.stubEnv("CHECKOUT_ENABLED", "true")
    expect(isPassThrough(middleware(request("/checkout/vivabox")))).toBe(true)
  })

  it("only treats the exact string 'true' as enabled", () => {
    vi.stubEnv("VERCEL_ENV", "production")
    vi.stubEnv("CHECKOUT_ENABLED", "1")
    expect(middleware(request("/checkout")).status).toBe(307)
  })

  it.each(["preview", "development", ""])("never gates the checkout on VERCEL_ENV=%j (previews and local dev can test payments)", (env) => {
    vi.stubEnv("VERCEL_ENV", env)
    vi.stubEnv("CHECKOUT_ENABLED", "")
    expect(isPassThrough(middleware(request("/checkout/vivabox")))).toBe(true)
  })
})

describe("proxy — trap paths", () => {
  it.each(["/wp-login.php", "/wp-admin/install.php", "/.env", "/.env.production", "/.git/config", "/admin", "/api/admin/users", "/phpmyadmin/index.php"])(
    "rewrites %s to the internal trap route and keeps the requested path in a header",
    (path) => {
      const res = middleware(request(path))
      expect(new URL(res.headers.get("x-middleware-rewrite")!).pathname).toBe("/api/security/trap")
      expect(res.headers.get("x-middleware-override-headers")).toContain("x-trap-path")
      expect(res.headers.get("x-middleware-request-x-trap-path")).toBe(path)
    }
  )

  it("drops the query string when rewriting", () => {
    const res = middleware(request("/wp-login.php?redirect_to=/secret"))
    expect(new URL(res.headers.get("x-middleware-rewrite")!).search).toBe("")
  })

  it("is not affected by the checkout gate (a trap path in production still alerts)", () => {
    production()
    expect(middleware(request("/admin")).headers.get("x-middleware-rewrite")).toBeTruthy()
  })

  it("leaves ordinary pages and the real API alone", () => {
    for (const path of ["/", "/regalar", "/empresas", "/api/checkout/start", "/administracion", "/environment"]) {
      expect(isPassThrough(middleware(request(path))), path).toBe(true)
    }
  })
})

describe("proxy — matcher", () => {
  const matchers = config.matcher.join("\n").replace(/\\\\/g, "\\").replace(/\\\./g, ".")

  it("covers the checkout", () => {
    expect(config.matcher).toContain("/checkout")
    expect(config.matcher).toContain("/checkout/:path*")
  })

  it.each(["wp-admin", "wp-login.php", "wp-content", "wp-includes", "xmlrpc.php", "phpmyadmin", "pma", "administrator", "admin", "cpanel", ".git", ".aws", ".ssh"])(
    "includes the trap segment %s, so the middleware actually runs for it",
    (segment) => {
      expect(matchers).toContain(segment)
    }
  )

  it("includes the .env family and /api/admin", () => {
    expect(matchers).toContain("\\.env".replace(/\\\./g, "."))
    expect(config.matcher).toContain("/api/admin/:path*")
  })
})
