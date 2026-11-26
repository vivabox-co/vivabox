import { NextRequest } from "next/server"
import { afterEach, describe, expect, it, vi } from "vitest"
import { PREVIEW_ACCESS_COOKIE, PREVIEW_ACCESS_MAX_AGE, PREVIEW_ACCESS_VALUE } from "@/services/previewAccess"
import { GET } from "./route"

function call(query = "") {
  return GET(new NextRequest(`http://localhost:3000/api/preview-access${query}`))
}

afterEach(() => vi.unstubAllEnvs())

describe("/api/preview-access", () => {
  it("sets the early-access cookie and redirects to /checkout by default", async () => {
    const res = await call()
    expect(res.status).toBe(307)
    expect(new URL(res.headers.get("location")!).pathname).toBe("/checkout")

    const cookie = res.cookies.get(PREVIEW_ACCESS_COOKIE)!
    expect(cookie.value).toBe(PREVIEW_ACCESS_VALUE)
    expect(cookie).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/", maxAge: PREVIEW_ACCESS_MAX_AGE })
  })

  it("redirects to a same-site path given in ?next=", async () => {
    const res = await call("?next=%2Fcheckout%2Fvivabox%3Fa%3D1")
    expect(new URL(res.headers.get("location")!).pathname + new URL(res.headers.get("location")!).search).toBe("/checkout/vivabox?a=1")
  })

  it.each([
    ["an absolute URL", "https://evil.example/phish"],
    ["a protocol-relative URL", "//evil.example/phish"],
    ["a path without a leading slash", "evil.example"],
    ["a javascript URL", "javascript:alert(1)"],
    // Le parseur d'URL normalise ces formes en "//evil.example" : un simple
    // test de préfixe les laisserait passer.
    ["a backslash host", "/\\evil.example"],
    ["a slash + backslash host", "/\\/evil.example"],
    ["a tab inside the slashes", "/\t/evil.example"],
    ["a newline inside the slashes", "/\n/evil.example"],
    ["a carriage return inside the slashes", "/\r/evil.example"],
  ])("never redirects off-site: %s falls back to /checkout", async (_label, next) => {
    const res = await call(`?next=${encodeURIComponent(next)}`)
    const location = new URL(res.headers.get("location")!)
    expect(location.origin).toBe("http://localhost:3000")
    expect(location.pathname).toBe("/checkout")
  })

  it("marks the cookie secure in production only", async () => {
    vi.stubEnv("NODE_ENV", "production")
    expect((await call()).cookies.get(PREVIEW_ACCESS_COOKIE)!.secure).toBe(true)
    vi.stubEnv("NODE_ENV", "development")
    expect((await call()).cookies.get(PREVIEW_ACCESS_COOKIE)!.secure).toBeFalsy()
  })
})
