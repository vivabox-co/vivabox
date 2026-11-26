import { describe, expect, it } from "vitest"
import { isTrapPath } from "./trapPaths"

describe("isTrapPath", () => {
  it.each([
    "/wp-login.php",
    "/wp-admin/install.php",
    "/WP-Admin",
    "/xmlrpc.php",
    "/phpmyadmin/index.php",
    "/admin",
    "/admin/login",
    "/administrator",
    "/.env",
    "/.env.local",
    "/.env.production",
    "/.git/config",
    "/.aws/credentials",
    "/api/admin/users",
  ])("flags %s", (path) => {
    expect(isTrapPath(path)).toBe(true)
  })

  it.each([
    "/",
    "/cajas",
    "/checkout/classic",
    "/empresas",
    "/nuestra-historia",
    "/administracion-de-regalos",
    "/api/checkout/start",
    "/api/activation/redeem",
    "/.well-known/security.txt",
    "/robots.txt",
  ])("lets %s through", (path) => {
    expect(isTrapPath(path)).toBe(false)
  })
})
