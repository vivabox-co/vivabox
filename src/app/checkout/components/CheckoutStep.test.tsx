// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useCheckoutStore } from "@/features/checkout/checkoutStore"
import { SAME_DAY_PRICE_COP } from "@/features/checkout/sameDay"

const { push } = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: { src: string; alt?: string }) => <img alt={props.alt ?? ""} src={props.src} />,
}))

import CheckoutStep from "./CheckoutStep"

const box = { slug: "vivabox", name: "Vivabox", price: 199000, image: "/box.webp" }
const fetchMock = vi.fn()
const alertMock = vi.fn()

// 2026-11-26 is a Thursday; Bogotá is UTC-5.
const THURSDAY_10AM = new Date("2026-11-26T15:00:00Z")
const THURSDAY_3PM = new Date("2026-11-26T20:00:00Z")
const SUNDAY_10AM = new Date("2026-11-29T15:00:00Z")

const startOk = (overrides: Record<string, unknown> = {}) => ({
  json: async () => ({
    ok: true,
    ventaId: "venta-1",
    pricing: { subtotal: 199000, delivery: 0, total: 199000, discount: 0 },
    promoApplied: false,
    promoWarning: null,
    ...overrides,
  }),
})

function setClock(date: Date) {
  vi.useFakeTimers({ toFake: ["Date"] })
  vi.setSystemTime(date)
}

function startRequest() {
  const call = fetchMock.mock.calls.find(([url]) => url === "/api/checkout/start")
  return call ? JSON.parse(call[1].body) : null
}

const payButton = () => screen.getAllByRole("button", { name: /Ir a pagar|Procesando/ })[0]
const user = () => userEvent.setup()

async function fillSelf(u: ReturnType<typeof user>, overrides: Partial<Record<"name" | "phone" | "email" | "city" | "address", string>> = {}) {
  const v = { name: "  Ana Pérez ", phone: "3001234567", email: "ana@example.com", city: "Bogotá", address: "Cra 7 # 10-20", ...overrides }
  await u.click(screen.getByLabelText("En mi dirección"))
  if (v.name) await u.type(screen.getByLabelText("Nombre completo"), v.name)
  if (v.phone) await u.type(screen.getByLabelText("WhatsApp"), v.phone)
  if (v.email) await u.type(screen.getByLabelText("Email"), v.email)
  if (v.city) await u.type(screen.getByLabelText("Ciudad"), v.city)
  if (v.address) await u.type(screen.getByLabelText("Dirección"), v.address)
}

beforeEach(() => {
  localStorage.clear()
  useCheckoutStore.getState().reset()
  push.mockReset()
  fetchMock.mockReset()
  alertMock.mockReset()
  vi.stubGlobal("fetch", fetchMock)
  vi.stubGlobal("alert", alertMock)
  vi.spyOn(console, "error").mockImplementation(() => {})
  setClock(THURSDAY_10AM)
  fetchMock.mockImplementation(async (url: string) => (url === "/api/checkout/start" ? startOk() : { json: async () => ({ ok: true }) }))
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("<CheckoutStep /> — what the buyer sees", () => {
  it("shows the box, the quantity and the price from the catalogue", () => {
    act(() => useCheckoutStore.getState().setQuantity(3))
    render(<CheckoutStep box={box} />)
    expect(screen.getByRole("heading", { name: "Tu Vivabox" })).toBeTruthy()
    expect(screen.getByText("Vivabox × 3", { selector: "p" })).toBeTruthy()
    expect(screen.getAllByText("$597.000").length).toBeGreaterThan(0) // 3 × 199.000, subtotal and total
    expect(screen.getAllByText("Incluido").length).toBeGreaterThan(0)
  })

  it("puts the box in the store and fixes delivery to home delivery", () => {
    render(<CheckoutStep box={box} />)
    expect(useCheckoutStore.getState().box).toMatchObject({ slug: "vivabox", price: 199000 })
    expect(useCheckoutStore.getState().deliveryMethod).toBe("domicilio")
  })

  it("shows the address form only once a destination is chosen", async () => {
    const u = user()
    render(<CheckoutStep box={box} />)
    expect(screen.queryByLabelText("Ciudad")).toBeNull()

    await u.click(screen.getByLabelText("En mi dirección"))
    expect(screen.getByLabelText("Nombre completo")).toBeTruthy()
    expect(screen.getByLabelText("Ciudad")).toBeTruthy()
    expect(screen.queryByLabelText("Su nombre")).toBeNull()

    await u.click(screen.getByLabelText("A quien la recibe"))
    expect(screen.getByLabelText("Su nombre")).toBeTruthy()
    expect(screen.getByLabelText("Su WhatsApp")).toBeTruthy()
    expect(screen.getByLabelText("Tu email")).toBeTruthy()
    expect(screen.getByText(/No le contamos nada de la sorpresa/)).toBeTruthy()
  })

  it("never uses the forbidden marketing words", () => {
    render(<CheckoutStep box={box} />)
    expect(document.body.textContent).not.toMatch(/exclusiv|lujo|condiciones/i)
  })
})

describe("<CheckoutStep /> — before paying", () => {
  it("lists what is missing and sends nothing when the form is incomplete", async () => {
    const u = user()
    render(<CheckoutStep box={box} />)
    await u.click(payButton())
    expect(fetchMock).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
    const message = screen.getAllByText(/Falta completar:/)[0].textContent!
    expect(message).toContain("tu nombre")
    expect(message).toContain("tu email")
    expect(message).toContain("dónde la enviamos")
    expect(message).toContain("la dirección")
    expect(message).toContain("la ciudad")
  })

  it("asks for the buyer's WhatsApp when delivering to oneself, and the recipient's when it is a gift", async () => {
    const u = user()
    render(<CheckoutStep box={box} />)
    await fillSelf(u, { phone: "" })
    await u.click(payButton())
    expect(screen.getAllByText(/tu WhatsApp/)[0]).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()

    await u.click(screen.getByLabelText("A quien la recibe"))
    await u.click(payButton())
    const message = screen.getAllByText(/Falta completar:/)[0].textContent!
    expect(message).toContain("el nombre de quien la recibe")
    expect(message).toContain("el WhatsApp de quien la recibe")
    expect(message).not.toContain("tu WhatsApp")
  })

  it("sends the order trimmed and goes to the payment page with the server's price", async () => {
    const u = user()
    render(<CheckoutStep box={box} />)
    await fillSelf(u)
    await u.click(payButton())

    await waitFor(() => expect(push).toHaveBeenCalledWith("/checkout/vivabox/pago"))
    expect(startRequest()).toMatchObject({
      box: "vivabox",
      quantity: 1,
      buyer: { name: "Ana Pérez", email: "ana@example.com", phone: "3001234567" },
      delivery: { type: "physical", speed: null },
      destination: "self",
      address: { address: "Cra 7 # 10-20", city: "Bogotá" },
    })
    expect(startRequest().promoCode).toBeUndefined()
    expect(useCheckoutStore.getState()).toMatchObject({ ventaId: "venta-1", pricing: { total: 199000 } })
  })

  it("never sends a price: the server decides", async () => {
    const u = user()
    render(<CheckoutStep box={box} />)
    await fillSelf(u)
    await u.click(payButton())
    await waitFor(() => expect(push).toHaveBeenCalled())
    const body = JSON.stringify(startRequest())
    expect(body).not.toMatch(/"(price|total|subtotal|amount)"/)
  })

  it("sends the recipient's details for a gift", async () => {
    const u = user()
    render(<CheckoutStep box={box} />)
    await u.click(screen.getByLabelText("A quien la recibe"))
    await u.type(screen.getByLabelText("Su nombre"), "Luis")
    await u.type(screen.getByLabelText("Su WhatsApp"), "3109999999")
    await u.type(screen.getByLabelText("Ciudad"), "Cali")
    await u.type(screen.getByLabelText("Dirección"), "Av 6 # 20-10")
    await u.type(screen.getByLabelText("Tu nombre"), "Ana")
    await u.type(screen.getByLabelText("Tu email"), "ana@example.com")
    await u.click(payButton())
    await waitFor(() => expect(push).toHaveBeenCalled())
    expect(startRequest()).toMatchObject({
      destination: "recipient",
      recipient: { name: "Luis", phone: "3109999999" },
      address: { city: "Cali" },
    })
  })

  it("does not submit twice while the first request is running", async () => {
    const u = user()
    let release: (v: unknown) => void = () => {}
    fetchMock.mockImplementation(() => new Promise((resolve) => (release = resolve)))
    render(<CheckoutStep box={box} />)
    await fillSelf(u)
    await u.click(payButton())
    await u.click(payButton())
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(screen.getAllByRole("button", { name: /Procesando/ })[0]).toBeTruthy()
    await act(async () => release(startOk()))
  })

  it.each([
    ["the server refuses", () => fetchMock.mockResolvedValue({ json: async () => ({ ok: false, error: "SERVER_ERROR" }) })],
    ["the answer has no price", () => fetchMock.mockResolvedValue({ json: async () => ({ ok: true, ventaId: "v" }) })],
    ["the network fails", () => fetchMock.mockRejectedValue(new Error("offline"))],
  ])("tells the buyer and stays on the page when %s", async (_label, arrange) => {
    arrange()
    const u = user()
    render(<CheckoutStep box={box} />)
    await fillSelf(u)
    await u.click(payButton())
    await waitFor(() => expect(alertMock).toHaveBeenCalled())
    expect(push).not.toHaveBeenCalled()
    expect(useCheckoutStore.getState().ventaId).toBeNull()
    expect(payButton().textContent).toContain("Ir a pagar") // can try again
  })
})

describe("<CheckoutStep /> — promo code", () => {
  async function openPromo(u: ReturnType<typeof user>) {
    await u.click(screen.getByRole("button", { name: "¿Tienes un código promocional?" }))
  }

  it("keeps 'Aplicar' disabled until something is typed", async () => {
    const u = user()
    render(<CheckoutStep box={box} />)
    await openPromo(u)
    expect((screen.getByRole("button", { name: "Aplicar" }) as HTMLButtonElement).disabled).toBe(true)
    await u.type(screen.getByPlaceholderText("Código"), "VIVA10")
    expect((screen.getByRole("button", { name: "Aplicar" }) as HTMLButtonElement).disabled).toBe(false)
  })

  it("applies a valid code and sends it with the order", async () => {
    const u = user()
    render(<CheckoutStep box={box} />)
    await openPromo(u)
    await u.type(screen.getByPlaceholderText("Código"), " VIVA10 ")
    await u.click(screen.getByRole("button", { name: "Aplicar" }))
    expect(await screen.findByText("✓ Código aplicado")).toBeTruthy()
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ code: "VIVA10" })

    await fillSelf(u)
    await u.click(payButton())
    await waitFor(() => expect(push).toHaveBeenCalled())
    expect(startRequest().promoCode).toBe("VIVA10")
  })

  it.each([
    ["INVALID_CODE", "Código inválido"],
    ["EXPIRED", "Este código expiró"],
    ["USED_UP", "Este código ya no está disponible"],
    ["TOO_MANY_ATTEMPTS", "Demasiados intentos, intenta más tarde"],
    ["SOMETHING_NEW", "Código inválido"],
  ])("explains a refused code (%s)", async (error, label) => {
    fetchMock.mockResolvedValue({ json: async () => ({ ok: false, error }) })
    const u = user()
    render(<CheckoutStep box={box} />)
    await openPromo(u)
    await u.type(screen.getByPlaceholderText("Código"), "X")
    await u.click(screen.getByRole("button", { name: "Aplicar" }))
    expect(await screen.findByText(label)).toBeTruthy()
    expect(useCheckoutStore.getState().promoApplied).toBe(false)
  })

  it("explains a network failure and lets the buyer carry on without a code", async () => {
    fetchMock.mockRejectedValue(new Error("offline"))
    const u = user()
    render(<CheckoutStep box={box} />)
    await openPromo(u)
    await u.type(screen.getByPlaceholderText("Código"), "X")
    await u.click(screen.getByRole("button", { name: "Aplicar" }))
    expect(await screen.findByText("No pudimos validar el código")).toBeTruthy()
  })

  it("clears the error as soon as the buyer edits the code", async () => {
    fetchMock.mockResolvedValue({ json: async () => ({ ok: false, error: "EXPIRED" }) })
    const u = user()
    render(<CheckoutStep box={box} />)
    await openPromo(u)
    await u.type(screen.getByPlaceholderText("Código"), "X")
    await u.click(screen.getByRole("button", { name: "Aplicar" }))
    await screen.findByText("Este código expiró")
    await u.type(screen.getByPlaceholderText("Código"), "Y")
    expect(screen.queryByText("Este código expiró")).toBeNull()
  })

  it("drops the code and says so when the final check rejects it, but still lets the purchase go through", async () => {
    fetchMock.mockImplementation(async (url: string) =>
      url === "/api/checkout/start" ? startOk({ promoApplied: false, promoWarning: "EXPIRED" }) : { json: async () => ({ ok: true }) }
    )
    const u = user()
    render(<CheckoutStep box={box} />)
    await openPromo(u)
    await u.type(screen.getByPlaceholderText("Código"), "VIVA10")
    await u.click(screen.getByRole("button", { name: "Aplicar" }))
    await screen.findByText("✓ Código aplicado")
    await fillSelf(u)
    await u.click(payButton())

    await waitFor(() => expect(push).toHaveBeenCalledWith("/checkout/vivabox/pago"))
    expect(alertMock).toHaveBeenCalledWith(expect.stringContaining("ya no es válido"))
    expect(useCheckoutStore.getState()).toMatchObject({ promoApplied: false, promoCode: "" })
  })
})

describe("<CheckoutStep /> — same-day delivery", () => {
  const sameDayRadio = () => screen.getByLabelText(/Envío el mismo día/) as HTMLInputElement

  it("is offered and selectable on a weekday morning, when no other city is typed", () => {
    render(<CheckoutStep box={box} />)
    return waitFor(() => expect(sameDayRadio().disabled).toBe(false))
  })

  it("is disabled after the 2 p.m. cutoff, with the opening hours as a hint", async () => {
    setClock(THURSDAY_3PM)
    render(<CheckoutStep box={box} />)
    await waitFor(() => expect(sameDayRadio().disabled).toBe(true))
    expect(screen.getByText(/lunes a sábado, antes de las 2:00 p. m./)).toBeTruthy()
  })

  it("is disabled on Sundays", async () => {
    setClock(SUNDAY_10AM)
    render(<CheckoutStep box={box} />)
    await waitFor(() => expect(sameDayRadio().disabled).toBe(true))
  })

  it("disappears for a city other than Bogotá, and says why", async () => {
    const u = user()
    render(<CheckoutStep box={box} />)
    await u.click(screen.getByLabelText("En mi dirección"))
    await u.type(screen.getByLabelText("Ciudad"), "Medellín")
    expect(screen.queryByLabelText(/Envío el mismo día/)).toBeNull()
    expect(screen.getByText("El envío el mismo día solo está disponible en Bogotá.")).toBeTruthy()
    expect(screen.getByText(/2–4 días hábiles/)).toBeTruthy()
  })

  it("accepts accents and case for Bogotá", async () => {
    const u = user()
    render(<CheckoutStep box={box} />)
    await u.click(screen.getByLabelText("En mi dirección"))
    await u.type(screen.getByLabelText("Ciudad"), "BOGOTÁ D.C.")
    expect(screen.getByLabelText(/Envío el mismo día/)).toBeTruthy()
    expect(screen.getByText(/1–2 días hábiles/)).toBeTruthy()
  })

  it("adds the surcharge to the total and tells the server", async () => {
    const u = user()
    render(<CheckoutStep box={box} />)
    await waitFor(() => expect(sameDayRadio().disabled).toBe(false))
    await u.click(sameDayRadio())
    const total = 199000 + SAME_DAY_PRICE_COP
    expect(screen.getAllByText("$209.000").length).toBeGreaterThan(0)
    expect(screen.getAllByText("+$10.000").length).toBeGreaterThan(0)

    await fillSelf(u)
    await u.click(payButton())
    await waitFor(() => expect(push).toHaveBeenCalled())
    expect(startRequest().delivery).toEqual({ type: "physical", speed: "same_day" })
    expect(total).toBe(209000)
  })

  it("falls back to standard delivery, with a message, when the server says it is no longer available", async () => {
    fetchMock.mockResolvedValue({ json: async () => ({ ok: false, error: "SAME_DAY_UNAVAILABLE" }) })
    const u = user()
    render(<CheckoutStep box={box} />)
    await waitFor(() => expect(sameDayRadio().disabled).toBe(false))
    await u.click(sameDayRadio())
    await fillSelf(u)
    await u.click(payButton())

    await waitFor(() => expect(alertMock).toHaveBeenCalledWith(expect.stringContaining("mismo día ya no está disponible")))
    expect(useCheckoutStore.getState().sameDay).toBe(false)
    expect(push).not.toHaveBeenCalled()
    expect(screen.getAllByText("$199.000").length).toBeGreaterThan(0)
  })
})

describe("<CheckoutStep /> — summary", () => {
  it("shows the delivery line as included and no benefit line without a code", () => {
    render(<CheckoutStep box={box} />)
    const summary = screen.getAllByText("Vivabox × 1").find((el) => el.closest(".vb-card"))!.closest(".vb-card")!
    expect(within(summary as HTMLElement).getByText("$199.000")).toBeTruthy()
    expect(screen.queryByText("Beneficio")).toBeNull()
  })
})
