// @vitest-environment jsdom
// Separate file: EMBED is read from the environment when the page module loads,
// so the variable has to be set before the first import.
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useCheckoutStore } from "@/features/checkout/checkoutStore"

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_WOMPI_EMBED = "true"
})

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }))
vi.mock("next/script", () => ({ default: () => <span data-testid="wompi-script" /> }))
vi.mock("../../CheckoutProgress", () => ({ default: () => <div /> }))
vi.mock("@/components/ui/VivaboxLoader", () => ({ default: () => <div data-testid="loader" /> }))
vi.mock("@/components/ui/useMinDisplayTime", () => ({ useMinDisplayTime: () => true }))
vi.mock("../../components/ManualPaymentPanel", () => ({ default: () => <div /> }))

import PagoPage from "./page"

const VENTA = "0a1b2c3d-1111-2222-3333-444455556666"
const wompi = {
  publicKey: "pub_prod_abc",
  currency: "COP",
  amountInCents: 39800000,
  reference: VENTA,
  signature: "sig-123",
  redirectUrl: "https://www.vivabox.com.co/checkout/pago/retorno",
}

beforeEach(() => {
  localStorage.clear()
  useCheckoutStore.getState().reset()
  useCheckoutStore.setState({
    hasHydrated: true,
    box: { slug: "vivabox", name: "Vivabox", price: 199000 },
    quantity: 2,
    ventaId: VENTA,
    pricing: { subtotal: 398000, delivery: 0, total: 398000, discount: 0 },
  })
  vi.stubGlobal("fetch", vi.fn(async () => ({ json: async () => ({ ok: true, wompi }) })))
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("payment page — embedded Wompi page", () => {
  it("loads no floating widget script, and the card button is usable straight away", () => {
    render(<PagoPage />)
    expect(screen.queryByTestId("wompi-script")).toBeNull()
    expect((screen.getByRole("button", { name: /Pagar con tarjeta/ }) as HTMLButtonElement).disabled).toBe(false)
  })

  it("shows Wompi's hosted page in an iframe with the signed parameters", async () => {
    render(<PagoPage />)
    await userEvent.setup().click(screen.getByRole("button", { name: /Pagar con tarjeta/ }))

    const frame = (await screen.findByTitle("Pago seguro con Wompi")) as HTMLIFrameElement
    const url = new URL(frame.src)
    expect(url.origin + url.pathname).toBe("https://checkout.wompi.co/p/")
    expect(url.searchParams.get("public-key")).toBe("pub_prod_abc")
    expect(url.searchParams.get("amount-in-cents")).toBe("39800000")
    expect(url.searchParams.get("reference")).toBe(VENTA)
    expect(url.searchParams.get("signature:integrity")).toBe("sig-123")
    expect(url.searchParams.get("redirect-url")).toBe(wompi.redirectUrl)
    expect(screen.getByRole("link", { name: "Volver a mi pedido" }).getAttribute("href")).toBe("/checkout/vivabox")
  })

  it("hides the method picker while the hosted page is shown", async () => {
    render(<PagoPage />)
    await userEvent.setup().click(screen.getByRole("button", { name: /Pagar con tarjeta/ }))
    await screen.findByTitle("Pago seguro con Wompi")
    expect(screen.queryByRole("button", { name: /Pagar por QR o Bre-B/ })).toBeNull()
  })
})
