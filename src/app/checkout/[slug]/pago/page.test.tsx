// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useCheckoutStore } from "@/features/checkout/checkoutStore"

const { push, replace } = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }))

vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace }) }))
vi.mock("next/script", () => ({
  // The Wompi widget script: a button stands in for "the script finished loading".
  default: ({ onLoad }: { onLoad?: () => void }) => <button onClick={onLoad}>__widget-loaded__</button>,
}))
vi.mock("../../CheckoutProgress", () => ({ default: () => <div data-testid="progress" /> }))
vi.mock("@/components/ui/VivaboxLoader", () => ({ default: () => <div data-testid="loader" /> }))
vi.mock("@/components/ui/useMinDisplayTime", () => ({ useMinDisplayTime: () => true }))
vi.mock("../../components/ManualPaymentPanel", () => ({
  default: ({ ventaId, total }: { ventaId: string; total: number }) => (
    <div data-testid="qr-panel">
      QR {ventaId} {total}
    </div>
  ),
}))

import PagoPage from "./page"

const VENTA = "0a1b2c3d-1111-2222-3333-444455556666"
const box = { slug: "vivabox", name: "Vivabox", price: 199000 }
const pricing = { subtotal: 398000, delivery: 0, total: 398000, discount: 0 }
const fetchMock = vi.fn()

const wompi = {
  publicKey: "pub_prod_abc",
  currency: "COP",
  amountInCents: 39800000,
  reference: VENTA,
  signature: "sig-123",
  redirectUrl: "https://www.vivabox.com.co/checkout/pago/retorno",
}

function readyStore(overrides: Record<string, unknown> = {}) {
  useCheckoutStore.setState({
    hasHydrated: true,
    box,
    quantity: 2,
    ventaId: VENTA,
    pricing,
    deliveryMethod: "domicilio",
    ...overrides,
  })
}

const widgetOpen = vi.fn()
const widgetCtor = vi.fn()

beforeEach(() => {
  localStorage.clear()
  useCheckoutStore.getState().reset()
  push.mockReset()
  replace.mockReset()
  fetchMock.mockReset()
  widgetOpen.mockReset()
  widgetCtor.mockReset()
  vi.stubGlobal("fetch", fetchMock)
  vi.spyOn(console, "error").mockImplementation(() => {})
  ;(window as unknown as { WidgetCheckout: unknown }).WidgetCheckout = function (config: unknown) {
    widgetCtor(config)
    return { open: widgetOpen }
  }
  fetchMock.mockImplementation(async () => ({ json: async () => ({ ok: true, wompi }) }))
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  delete (window as unknown as { WidgetCheckout?: unknown }).WidgetCheckout
})

const loadWidget = async (u: ReturnType<typeof userEvent.setup>) => u.click(screen.getByText("__widget-loaded__"))
const cardButton = () => screen.getByRole("button", { name: /Pagar con tarjeta, Nequi o PSE/ }) as HTMLButtonElement

describe("payment page — guards", () => {
  it("shows only the loader until the saved cart has been read", () => {
    useCheckoutStore.setState({ hasHydrated: false })
    render(<PagoPage />)
    expect(screen.getByTestId("loader")).toBeTruthy()
    expect(screen.queryByText("Pago seguro")).toBeNull()
    expect(replace).not.toHaveBeenCalled()
  })

  it.each([
    ["no box", { box: null }],
    ["no order was started", { ventaId: null }],
  ])("sends the visitor back to the boxes when there is %s", (_label, overrides) => {
    readyStore(overrides)
    render(<PagoPage />)
    expect(replace).toHaveBeenCalledWith("/cajas")
  })

  it("waits for the server price instead of showing a guess", () => {
    readyStore({ pricing: null })
    render(<PagoPage />)
    expect(screen.getByText("Cargando precio...")).toBeTruthy()
    expect(screen.queryByRole("button", { name: /Pagar/ })).toBeNull()
  })
})

describe("payment page — summary", () => {
  it("shows the server's amounts, never a recomputed one", () => {
    readyStore({ pricing: { subtotal: 111111, delivery: 5000, total: 116111, discount: 0 } })
    render(<PagoPage />)
    expect(screen.getByText("Vivabox x2")).toBeTruthy()
    expect(screen.getByText("$111.111")).toBeTruthy()
    expect(screen.getByText("+$5.000")).toBeTruthy()
    expect(screen.getByText("$116.111")).toBeTruthy()
  })

  it("shows free delivery as 'Gratis'", () => {
    readyStore()
    render(<PagoPage />)
    expect(screen.getByText("Gratis")).toBeTruthy()
    expect(screen.getByText("Envío (Domicilio)")).toBeTruthy()
  })

  it("links the terms and the data policy, and offers WhatsApp help quoting the order", () => {
    readyStore()
    render(<PagoPage />)
    expect(screen.getByRole("link", { name: "Términos y condiciones" }).getAttribute("href")).toBe("/terminos-y-condiciones")
    expect(screen.getByRole("link", { name: "Política de tratamiento de datos" }).getAttribute("href")).toBe("/politica-de-datos")
    const help = screen.getByRole("link", { name: /Necesitas ayuda/ }).getAttribute("href")!
    expect(decodeURIComponent(help)).toContain("pedido 0A1B2C")
  })
})

describe("payment page — card, Nequi or PSE (Wompi widget)", () => {
  it("cannot pay until the Wompi script has loaded", async () => {
    const u = userEvent.setup()
    readyStore()
    render(<PagoPage />)
    expect(cardButton().disabled).toBe(true)
    await loadWidget(u)
    expect(cardButton().disabled).toBe(false)
  })

  it("asks the server to prepare the payment for this order only, then opens the widget with the signed data", async () => {
    const u = userEvent.setup()
    readyStore()
    render(<PagoPage />)
    await loadWidget(u)
    await u.click(cardButton())

    await waitFor(() => expect(widgetOpen).toHaveBeenCalled())
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe("/api/checkout/pay")
    expect(JSON.parse(init.body)).toEqual({ ventaId: VENTA }) // no amount sent from the browser
    expect(widgetCtor).toHaveBeenCalledWith({
      currency: "COP",
      amountInCents: 39800000,
      reference: VENTA,
      publicKey: "pub_prod_abc",
      redirectUrl: wompi.redirectUrl,
      signature: { integrity: "sig-123" },
    })
  })

  it("goes to the return page with the transaction when the widget completes", async () => {
    const u = userEvent.setup()
    widgetOpen.mockImplementation((cb: (r: unknown) => void) => cb({ transaction: { id: "tx-9" } }))
    readyStore()
    render(<PagoPage />)
    await loadWidget(u)
    await u.click(cardButton())
    await waitFor(() => expect(replace).toHaveBeenCalledWith(`/checkout/pago/retorno?ventaId=${VENTA}&id=tx-9`))
  })

  it("keeps the order and offers to retry when the widget is closed without paying", async () => {
    const u = userEvent.setup()
    widgetOpen.mockImplementation((cb: (r: unknown) => void) => cb(undefined))
    readyStore()
    render(<PagoPage />)
    await loadWidget(u)
    await u.click(cardButton())
    expect(await screen.findByText("Tu pago no se completó. Tu pedido sigue reservado.")).toBeTruthy()
    expect(replace).not.toHaveBeenCalled()
    expect(useCheckoutStore.getState().ventaId).toBe(VENTA)
  })

  it("tells the buyer when the reservation expired, then sends them back to choose again", async () => {
    const u = userEvent.setup()
    fetchMock.mockResolvedValue({ json: async () => ({ ok: false, error: "RESERVATION_EXPIRED" }) })
    readyStore()
    render(<PagoPage />)
    await loadWidget(u)
    await u.click(cardButton())
    expect(await screen.findByText("Tu reserva expiró. Vuelve a elegir tu Vivabox.")).toBeTruthy()
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/cajas"), { timeout: 3000 })
    expect(widgetOpen).not.toHaveBeenCalled()
  })

  it("moves to the success page when the order turns out to be paid already", async () => {
    const u = userEvent.setup()
    fetchMock.mockResolvedValue({ json: async () => ({ ok: false, error: "ALREADY_PAID" }) })
    readyStore()
    render(<PagoPage />)
    await loadWidget(u)
    await u.click(cardButton())
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(`/checkout/success?ventaId=${VENTA}&quantity=2&deliveryType=physical`)
    )
  })

  it("reports a digital box as such on the success page", async () => {
    const u = userEvent.setup()
    fetchMock.mockResolvedValue({ json: async () => ({ ok: false, error: "ALREADY_PAID" }) })
    readyStore({ deliveryMethod: "digital" })
    render(<PagoPage />)
    await loadWidget(u)
    await u.click(cardButton())
    await waitFor(() => expect(replace).toHaveBeenCalledWith(expect.stringContaining("deliveryType=digital")))
  })

  it.each([
    ["the server refuses", () => fetchMock.mockResolvedValue({ json: async () => ({ ok: false, error: "SERVER_ERROR" }) }), "No pudimos procesar tu pago. Puedes intentarlo de nuevo."],
    ["the network fails", () => fetchMock.mockRejectedValue(new Error("offline")), "No pudimos conectar con el servidor de pago. Revisa tu conexión e intenta de nuevo."],
  ])("shows a clear message and lets the buyer retry when %s", async (_label, arrange, message) => {
    const u = userEvent.setup()
    arrange()
    readyStore()
    render(<PagoPage />)
    await loadWidget(u)
    await u.click(cardButton())
    expect(await screen.findByText(message)).toBeTruthy()
    expect(widgetOpen).not.toHaveBeenCalled()
    expect(cardButton().disabled).toBe(false)
  })

  it("does not start two payments at once", async () => {
    const u = userEvent.setup()
    let release: (v: unknown) => void = () => {}
    fetchMock.mockImplementation(() => new Promise((resolve) => (release = resolve)))
    readyStore()
    render(<PagoPage />)
    await loadWidget(u)
    await u.click(cardButton())
    expect(screen.getByTestId("loader")).toBeTruthy() // the card is replaced by the loader
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await act(async () => release({ json: async () => ({ ok: false, error: "SERVER_ERROR" }) }))
  })
})

describe("payment page — QR or Bre-B", () => {
  it("shows the bank details and the 'I already paid' button", async () => {
    const u = userEvent.setup()
    readyStore()
    render(<PagoPage />)
    await u.click(screen.getByRole("button", { name: /Pagar por QR o Bre-B/ }))
    expect(screen.getByTestId("qr-panel").textContent).toContain(`QR ${VENTA} 398000`)
    expect(screen.getByRole("button", { name: "Ya hice el pago" })).toBeTruthy()
  })

  it("lets the buyer go back to the other payment methods", async () => {
    const u = userEvent.setup()
    readyStore()
    render(<PagoPage />)
    await u.click(screen.getByRole("button", { name: /Pagar por QR o Bre-B/ }))
    await u.click(screen.getByRole("button", { name: "Elegir otro medio de pago" }))
    expect(screen.getByRole("button", { name: /Pagar con tarjeta/ })).toBeTruthy()
    expect(screen.queryByTestId("qr-panel")).toBeNull()
  })

  it("reports the transfer for this order and moves to the 'verifying' step without marking anything paid", async () => {
    const u = userEvent.setup()
    fetchMock.mockResolvedValue({ json: async () => ({ ok: true }) })
    readyStore()
    render(<PagoPage />)
    await u.click(screen.getByRole("button", { name: /Pagar por QR o Bre-B/ }))
    await u.click(screen.getByRole("button", { name: "Ya hice el pago" }))

    await waitFor(() => expect(push).toHaveBeenCalledWith(`/checkout/success?ventaId=${VENTA}&pending=1&slug=vivabox`))
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe("/api/checkout/manual-payment")
    expect(JSON.parse(init.body)).toEqual({ ventaId: VENTA, action: "report" })
  })

  it.each([
    ["the server refuses", () => fetchMock.mockResolvedValue({ json: async () => ({ ok: false }) }), "No pudimos registrar tu aviso. Inténtalo de nuevo o escríbenos por WhatsApp."],
    ["the network fails", () => fetchMock.mockRejectedValue(new Error("offline")), "No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo."],
  ])("stays on the page with a message when %s", async (_label, arrange, message) => {
    const u = userEvent.setup()
    arrange()
    readyStore()
    render(<PagoPage />)
    await u.click(screen.getByRole("button", { name: /Pagar por QR o Bre-B/ }))
    await u.click(screen.getByRole("button", { name: "Ya hice el pago" }))
    expect(await screen.findByText(message)).toBeTruthy()
    expect(push).not.toHaveBeenCalled()
    expect((screen.getByRole("button", { name: "Ya hice el pago" }) as HTMLButtonElement).disabled).toBe(false)
  })

  it("does not report twice while the first request is running", async () => {
    const u = userEvent.setup()
    let release: (v: unknown) => void = () => {}
    fetchMock.mockImplementation(() => new Promise((resolve) => (release = resolve)))
    readyStore()
    render(<PagoPage />)
    await u.click(screen.getByRole("button", { name: /Pagar por QR o Bre-B/ }))
    await u.click(screen.getByRole("button", { name: "Ya hice el pago" }))
    await u.click(screen.getByRole("button", { name: "Enviando..." }))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await act(async () => release({ json: async () => ({ ok: false }) }))
  })
})
