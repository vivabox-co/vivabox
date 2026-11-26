// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useCheckoutStore } from "@/features/checkout/checkoutStore"
import { MESSAGE_MAX_LENGTH } from "@/features/checkout/personalMessage"

const { search } = vi.hoisted(() => ({ search: { value: "" } }))

vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(search.value) }))
vi.mock("../CheckoutProgress", () => ({
  default: ({ completed }: { completed?: boolean }) => <div data-testid="progress" data-completed={String(!!completed)} />,
}))
vi.mock("../components/MessageCardPreview", () => ({
  default: ({ mensaje, firma, corazon }: { mensaje: string; firma: string; corazon: boolean }) => (
    <div data-testid="card">{`${mensaje}|${firma}|${corazon}`}</div>
  ),
}))

import SuccessPage from "./page"

const VENTA = "0a1b2c3d-1111-2222-3333-444455556666"
const fetchMock = vi.fn()
const alertMock = vi.fn()

function answers(map: Record<string, unknown>) {
  fetchMock.mockImplementation(async (url: string) => ({ json: async () => map[url] ?? { ok: true } }))
}
const bodyOf = (url: string) => {
  const call = fetchMock.mock.calls.find(([u]) => u === url)
  return call ? JSON.parse(call[1].body) : null
}
const callsTo = (url: string) => fetchMock.mock.calls.filter(([u]) => u === url).length

function storeAfterPayment(overrides: Record<string, unknown> = {}) {
  useCheckoutStore.setState({
    hasHydrated: true,
    box: { slug: "vivabox", name: "Vivabox", price: 199000 },
    buyerName: "Ana Pérez",
    buyerPhone: "3001234567",
    deliveryMethod: "domicilio",
    deliveryDestination: "self",
    address: "Cra 7 # 10-20",
    city: "Bogotá",
    ventaId: VENTA,
    ...overrides,
  })
}

beforeEach(() => {
  localStorage.clear()
  useCheckoutStore.getState().reset()
  search.value = `ventaId=${VENTA}`
  fetchMock.mockReset()
  alertMock.mockReset()
  vi.stubGlobal("fetch", fetchMock)
  vi.stubGlobal("alert", alertMock)
  vi.spyOn(console, "error").mockImplementation(() => {})
  answers({})
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("success page — paid order", () => {
  it("confirms the payment", async () => {
    storeAfterPayment()
    render(<SuccessPage />)
    expect(await screen.findByText("Pago confirmado")).toBeTruthy()
    expect(screen.getByRole("heading", { name: /Tu Vivabox está lista/ })).toBeTruthy()
    expect(screen.getByText("Te avisaremos con las novedades del envío")).toBeTruthy()
  })

  it("says 'regalo' when the box is sent to someone else, and shows who and where", async () => {
    storeAfterPayment({ deliveryDestination: "recipient", recipientName: "Luis", recipientPhone: "3109999999" })
    render(<SuccessPage />)
    expect(await screen.findByRole("heading", { name: /Tu regalo está listo/ })).toBeTruthy()
    expect(screen.getByText("Luis · 3109999999")).toBeTruthy()
    expect(screen.getByText("Cra 7 # 10-20, Bogotá")).toBeTruthy()
  })

  it("does not mention shipping for a digital box", async () => {
    storeAfterPayment({ deliveryMethod: "digital" })
    render(<SuccessPage />)
    await screen.findByText("Pago confirmado")
    expect(screen.queryByText("Te avisaremos con las novedades del envío")).toBeNull()
  })

  it("completes the order once as a safety net, then empties the cart but keeps its own recap", async () => {
    storeAfterPayment()
    render(<SuccessPage />)
    await waitFor(() => expect(useCheckoutStore.getState().ventaId).toBeNull())
    expect(callsTo("/api/checkout/complete")).toBe(1)
    expect(bodyOf("/api/checkout/complete")).toEqual({ ventaId: VENTA })
    expect(useCheckoutStore.getState().box).toBeNull() // the nav cart badge clears
    expect(screen.getByText("Se envía a")).toBeTruthy() // the page still knows where it goes
    expect(screen.getByText("Ana Pérez · 3001234567")).toBeTruthy()
  })

  it("keeps the cart when the completion call fails, so the buyer can still see their order", async () => {
    answers({ "/api/checkout/complete": { ok: false } })
    storeAfterPayment()
    render(<SuccessPage />)
    await waitFor(() => expect(callsTo("/api/checkout/complete")).toBe(1))
    expect(useCheckoutStore.getState().ventaId).toBe(VENTA)
  })

  it("does nothing before the saved cart has been read", () => {
    storeAfterPayment({ hasHydrated: false })
    render(<SuccessPage />)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("without an order id there is no message form and nothing is sent", async () => {
    search.value = ""
    storeAfterPayment()
    render(<SuccessPage />)
    await screen.findByText("Pago confirmado")
    expect(screen.queryByLabelText("Tu mensaje")).toBeNull()
    expect(callsTo("/api/checkout/complete")).toBe(0)
    expect(screen.getByRole("link", { name: /Seguir comprando/ })).toBeTruthy()
  })
})

describe("success page — personal message", () => {
  const saveButton = () => screen.getAllByRole("button", { name: "Guardar mensaje" })[0] as HTMLButtonElement

  it("starts with the buyer's name as the signature and the save button disabled", async () => {
    storeAfterPayment()
    render(<SuccessPage />)
    expect((await screen.findByLabelText("De parte de") as HTMLInputElement).value).toBe("Ana Pérez")
    expect(saveButton().disabled).toBe(true)
  })

  it("saves the message with its signature and shows the printed card", async () => {
    const u = userEvent.setup()
    storeAfterPayment()
    render(<SuccessPage />)
    await u.type(await screen.findByLabelText("Tu mensaje"), "  Feliz cumple  ")
    await u.click(saveButton())

    expect(await screen.findByText("Quedó guardado. Lo imprimiremos en la tarjeta que va dentro de la caja.")).toBeTruthy()
    expect(bodyOf("/api/checkout/message")).toEqual({ ventaId: VENTA, mensaje: "Feliz cumple", de: "Ana Pérez" })
    expect(screen.getByTestId("card").textContent).toBe("Feliz cumple|Ana Pérez|false")
    expect(screen.queryByLabelText("Tu mensaje")).toBeNull() // written once, then locked
  })

  it("appends the heart to the signature when chosen", async () => {
    const u = userEvent.setup()
    storeAfterPayment()
    render(<SuccessPage />)
    await u.type(await screen.findByLabelText("Tu mensaje"), "Hola")
    await u.click(screen.getByRole("checkbox"))
    await u.click(saveButton())
    await screen.findByText(/Quedó guardado/)
    expect(bodyOf("/api/checkout/message").de).toBe("Ana Pérez ♡")
  })

  it("can be skipped, which locks it with an empty message and no signature", async () => {
    const u = userEvent.setup()
    storeAfterPayment()
    render(<SuccessPage />)
    await u.click((await screen.findAllByRole("button", { name: "Continuar sin mensaje" }))[0])
    await screen.findByText("Gracias por elegir Vivabox. Ahora empieza la mejor parte.")
    expect(bodyOf("/api/checkout/message")).toEqual({ ventaId: VENTA, mensaje: "", de: "" })
    expect(screen.queryByText(/Quedó guardado/)).toBeNull()
  })

  it("says so when a message had already been saved", async () => {
    const u = userEvent.setup()
    answers({ "/api/checkout/message": { ok: false, error: "ALREADY_SET" } })
    storeAfterPayment()
    render(<SuccessPage />)
    await u.type(await screen.findByLabelText("Tu mensaje"), "Hola")
    await u.click(saveButton())
    expect(await screen.findByText(/Tu mensaje ya estaba guardado/)).toBeTruthy()
  })

  it("keeps the form open and alerts when saving fails", async () => {
    const u = userEvent.setup()
    answers({ "/api/checkout/message": { ok: false, error: "SERVER_ERROR" } })
    storeAfterPayment()
    render(<SuccessPage />)
    await u.type(await screen.findByLabelText("Tu mensaje"), "Hola")
    await u.click(saveButton())
    await waitFor(() => expect(alertMock).toHaveBeenCalledWith("SERVER_ERROR"))
    expect(screen.getByLabelText("Tu mensaje")).toBeTruthy()
    expect(saveButton().disabled).toBe(false)
  })

  it("will not save a message that does not fit on the card", async () => {
    storeAfterPayment()
    render(<SuccessPage />)
    const box = (await screen.findByLabelText("Tu mensaje")) as HTMLTextAreaElement
    const u = userEvent.setup()
    await u.click(box)
    await u.paste("a".repeat(MESSAGE_MAX_LENGTH + 5))
    expect(saveButton().disabled).toBe(true)
    expect(screen.getAllByText("Tu mensaje no cabe en la tarjeta: acórtalo un poco.").length).toBeGreaterThan(0)
    expect(callsTo("/api/checkout/message")).toBe(0)
  })
})

describe("success page — Bre-B payment under review", () => {
  beforeEach(() => {
    search.value = `ventaId=${VENTA}&pending=1&slug=vivabox`
  })

  it("shows the 'verifying' state with the payment reference, and does not claim the payment is confirmed", async () => {
    answers({ "/api/checkout/manual-payment": { ok: true, status: "pending" } })
    storeAfterPayment()
    render(<SuccessPage />)
    expect(await screen.findByText("Verificando tu pago")).toBeTruthy()
    expect(screen.getByText("VB-0A1B2C")).toBeTruthy()
    expect(screen.queryByText("Pago confirmado")).toBeNull()
    expect(screen.getByTestId("progress").getAttribute("data-completed")).toBe("false")
  })

  it("keeps the cart and does not complete the order while the team is still checking", async () => {
    answers({ "/api/checkout/manual-payment": { ok: true, status: "pending" } })
    storeAfterPayment()
    render(<SuccessPage />)
    await screen.findByText("Verificando tu pago")
    await waitFor(() => expect(callsTo("/api/checkout/manual-payment")).toBeGreaterThan(0))
    expect(callsTo("/api/checkout/complete")).toBe(0)
    expect(useCheckoutStore.getState().ventaId).toBe(VENTA)
    expect(bodyOf("/api/checkout/manual-payment")).toEqual({ ventaId: VENTA, action: "status" })
  })

  it("lets the buyer write their message while waiting", async () => {
    answers({ "/api/checkout/manual-payment": { ok: true, status: "pending" } })
    storeAfterPayment()
    render(<SuccessPage />)
    expect(await screen.findByLabelText("Tu mensaje")).toBeTruthy()
  })

  it("switches to the confirmed state, and completes the order, once the team confirms", async () => {
    answers({ "/api/checkout/manual-payment": { ok: true, status: "paid" } })
    storeAfterPayment()
    render(<SuccessPage />)
    expect(await screen.findByText("Pago confirmado")).toBeTruthy()
    await waitFor(() => expect(callsTo("/api/checkout/complete")).toBe(1))
  })

  it("stops asking once the payment is confirmed", async () => {
    answers({ "/api/checkout/manual-payment": { ok: true, status: "paid" } })
    storeAfterPayment()
    render(<SuccessPage />)
    await screen.findByText("Pago confirmado")
    await waitFor(() => expect(callsTo("/api/checkout/complete")).toBe(1))
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })
    expect(callsTo("/api/checkout/manual-payment")).toBe(1)
  })

  it("asks again every 5 seconds", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] })
    answers({ "/api/checkout/manual-payment": { ok: true, status: "pending" } })
    storeAfterPayment()
    render(<SuccessPage />)
    await waitFor(() => expect(callsTo("/api/checkout/manual-payment")).toBe(1))
    await act(async () => {
      vi.advanceTimersByTime(5000)
    })
    await waitFor(() => expect(callsTo("/api/checkout/manual-payment")).toBe(2))
  })

  it("explains it when the team could not find the payment, with a way to send the receipt and to go back to pay", async () => {
    answers({ "/api/checkout/manual-payment": { ok: true, status: "rejected" } })
    storeAfterPayment()
    render(<SuccessPage />)
    expect(await screen.findByRole("heading", { name: "Aún no vemos tu pago" })).toBeTruthy()
    const whatsapp = screen.getByRole("link", { name: /Enviar comprobante por WhatsApp/ }).getAttribute("href")!
    expect(decodeURIComponent(whatsapp)).toContain("Referencia VB-0A1B2C")
    expect(screen.getByRole("link", { name: "Volver al pago" }).getAttribute("href")).toBe("/checkout/vivabox/pago")
    expect(callsTo("/api/checkout/complete")).toBe(0)
  })

  it("sends the buyer to the boxes instead when their order is no longer in this browser", async () => {
    answers({ "/api/checkout/manual-payment": { ok: true, status: "rejected" } })
    storeAfterPayment({ ventaId: "another-order" })
    render(<SuccessPage />)
    expect((await screen.findByRole("link", { name: "Volver al pago" })).getAttribute("href")).toBe("/cajas")
  })

  it("stays in the verifying state when the status check fails", async () => {
    fetchMock.mockRejectedValue(new Error("offline"))
    storeAfterPayment()
    render(<SuccessPage />)
    expect(await screen.findByText("Verificando tu pago")).toBeTruthy()
  })
})
