// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import AliadosCard from "./AliadosCard"

vi.mock("@/utils/analytics", () => ({ track: vi.fn() }))

const fetchMock = vi.fn()

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock)
  fetchMock.mockResolvedValue({ json: async () => ({ ok: true }) })
  vi.spyOn(console, "error").mockImplementation(() => {})
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  fetchMock.mockReset()
})

function ui() {
  return userEvent.setup()
}

async function fillStep1(user: ReturnType<typeof ui>, overrides: Partial<Record<"name" | "company" | "location" | "whatsapp" | "email", string>> = {}) {
  const v = { name: "Camila Ruiz", company: "Finca La Esperanza", location: "Guatavita", whatsapp: "3001234567", email: "", ...overrides }
  await user.type(screen.getByLabelText("Nombre"), v.name)
  await user.type(screen.getByLabelText(/Empresa/), v.company)
  await user.type(screen.getByLabelText(/Ubicaci|Dónde|Ciudad/i), v.location)
  if (v.whatsapp) await user.type(document.getElementById("aliados-whatsapp") as HTMLElement, v.whatsapp)
  if (v.email) await user.type(document.getElementById("aliados-email") as HTMLElement, v.email)
}

const next = () => screen.getByRole("button", { name: /Contarnos sobre tu experiencia/ })

async function goToStep2(user: ReturnType<typeof ui>) {
  await user.click(next())
  // The slide animation shows both steps for ~500ms; wait until step 1 is gone.
  await waitFor(() => expect(screen.queryByText("01 / 02")).toBeNull(), { timeout: 3000 })
}

describe("<AliadosCard /> — step 1", () => {
  it("shows what is missing instead of moving on", async () => {
    const user = ui()
    render(<AliadosCard />)
    await user.click(next())
    expect(await screen.findByText("Cuéntanos tu nombre.")).toBeTruthy()
    expect(screen.getByText("Cuéntanos el nombre de tu empresa o marca.")).toBeTruthy()
    expect(screen.getByText("Cuéntanos dónde se realiza.")).toBeTruthy()
    expect(screen.getByText("Déjanos al menos un medio de contacto.")).toBeTruthy()
    expect(screen.queryByText("02 / 02")).toBeNull()
  })

  it("rejects an invalid whatsapp and an invalid email", async () => {
    const user = ui()
    render(<AliadosCard />)
    await fillStep1(user, { whatsapp: "123", email: "camila@" })
    await user.click(next())
    expect(await screen.findByText("Ingresa un WhatsApp válido.")).toBeTruthy()
    expect(screen.getByText("Ingresa un correo válido.")).toBeTruthy()
  })

  it("moves to step 2 with valid data", async () => {
    const user = ui()
    render(<AliadosCard />)
    await fillStep1(user)
    await goToStep2(user)
    expect(screen.getByLabelText("¿Qué tipo de experiencia ofreces?")).toBeTruthy()
  })
})

describe("<AliadosCard /> — step 2 and sending", () => {
  async function reachStep2() {
    const user = ui()
    render(<AliadosCard />)
    await fillStep1(user)
    await goToStep2(user)
    return user
  }

  it("requires a category and an experience name", async () => {
    const user = await reachStep2()
    await user.click(screen.getByRole("button", { name: /Proponer mi experiencia/ }))
    expect(await screen.findByText("Elige una categoría.")).toBeTruthy()
    expect(screen.getByText("Cuéntanos cómo se llama.")).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("sends the lead trimmed, with an empty honeypot, and thanks the visitor", async () => {
    const user = await reachStep2()
    await user.selectOptions(screen.getByLabelText("¿Qué tipo de experiencia ofreces?"), "Naturaleza & aventura")
    await user.type(screen.getByLabelText("¿Cómo se llama tu experiencia?"), "  Cabalgata al amanecer ")
    await user.click(screen.getByRole("button", { name: /Proponer mi experiencia/ }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe("/api/aliados/submit")
    expect(JSON.parse(init.body)).toMatchObject({
      name: "Camila Ruiz",
      company: "Finca La Esperanza",
      whatsapp: "3001234567",
      category: "Naturaleza & aventura",
      experienceName: "Cabalgata al amanecer",
      website: "",
    })
    expect(screen.queryByText("02 / 02")).toBeNull() // success state replaces the form
  })

  it("passes along what a bot typed in the hidden field", async () => {
    const user = await reachStep2()
    const honeypot = document.querySelector('input[name="website_url"]') as HTMLInputElement
    honeypot.value = "http://spam.example"
    await user.selectOptions(screen.getByLabelText("¿Qué tipo de experiencia ofreces?"), "Otro")
    await user.type(document.getElementById("aliados-experience-name") as HTMLElement, "X")
    await user.click(screen.getByRole("button", { name: /Proponer mi experiencia/ }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).website).toBe("http://spam.example")
  })

  it.each([
    ["the server refuses", () => fetchMock.mockResolvedValue({ json: async () => ({ ok: false }) })],
    ["the network fails", () => fetchMock.mockRejectedValue(new Error("offline"))],
  ])("keeps the form and shows an error when %s", async (_label, arrange) => {
    arrange()
    const user = await reachStep2()
    await user.selectOptions(screen.getByLabelText("¿Qué tipo de experiencia ofreces?"), "Otro")
    await user.type(document.getElementById("aliados-experience-name") as HTMLElement, "X")
    await user.click(screen.getByRole("button", { name: /Proponer mi experiencia/ }))
    expect(await screen.findByText("No pudimos enviar tu propuesta. Intenta de nuevo.")).toBeTruthy()
    expect(screen.getByRole("button", { name: /Proponer mi experiencia/ })).toBeTruthy()
  })

  it("goes back to step 1 with the data kept", async () => {
    const user = await reachStep2()
    await act(async () => {
      await user.click(screen.getByRole("button", { name: /Atrás/ }))
    })
    await waitFor(() => expect(screen.queryByText("02 / 02")).toBeNull(), { timeout: 3000 })
    expect((screen.getByLabelText("Nombre") as HTMLInputElement).value).toBe("Camila Ruiz")
  })
})
