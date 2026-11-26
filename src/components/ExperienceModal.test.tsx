// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: { src: string; alt?: string }) => <img alt={props.alt ?? ""} src={props.src} />,
}))

import ExperienceModal from "./ExperienceModal"

beforeAll(() => {
  Element.prototype.scrollTo = vi.fn() as unknown as typeof Element.prototype.scrollTo
})
afterEach(cleanup)

const experience = {
  title: "Cena en el cerro",
  city: "Bogotá",
  category: "gastronomia",
  shortDescription: "Una cena con vista a la ciudad.",
  duration: "120",
  format: "Pareja",
  vivanote: "Nos gustó por la vista y el silencio.",
  gallery: ["/a.webp", "/b.webp", "/c.webp"],
}

describe("<ExperienceModal />", () => {
  it("renders nothing without an experience", () => {
    const { container } = render(<ExperienceModal experience={null} onClose={() => {}} />)
    expect(container.innerHTML).toBe("")
  })

  it("shows the experience's own description and why Vivabox picked it", () => {
    render(<ExperienceModal experience={experience} onClose={() => {}} />)
    expect(screen.getByRole("heading", { name: "Cena en el cerro" })).toBeTruthy()
    expect(screen.getByText("Una cena con vista a la ciudad.")).toBeTruthy()
    expect(screen.getByText("Nos gustó por la vista y el silencio.")).toBeTruthy()
    expect(screen.getByText("La elegimos")).toBeTruthy()
  })

  it("falls back to generic copy when the sheet row has no description or note", () => {
    render(<ExperienceModal experience={{ ...experience, shortDescription: "  ", vivanote: "" }} onClose={() => {}} />)
    expect(screen.queryByText("Una cena con vista a la ciudad.")).toBeNull()
    expect(screen.getByText("La elegimos")).toBeTruthy()
    // Something non-empty still explains the experience.
    expect(document.body.textContent!.length).toBeGreaterThan(100)
  })

  it("never uses the forbidden marketing words in its own labels", () => {
    render(<ExperienceModal experience={experience} onClose={() => {}} />)
    expect(document.body.textContent).not.toMatch(/exclusiv|lujo|condiciones/i)
  })

  it("closes from the close button", async () => {
    const onClose = vi.fn()
    render(<ExperienceModal experience={experience} onClose={onClose} />)
    await userEvent.setup().click(screen.getByRole("button", { name: "Cerrar" }))
    expect(onClose).toHaveBeenCalled()
  })

  it("offers photo navigation only when there is more than one photo", () => {
    const { rerender } = render(<ExperienceModal experience={experience} onClose={() => {}} />)
    expect(screen.getByRole("button", { name: "Foto siguiente" })).toBeTruthy()
    expect(screen.getAllByRole("button", { name: /Ver foto/ })).toHaveLength(3)

    rerender(<ExperienceModal experience={{ ...experience, gallery: ["/only.webp"] }} onClose={() => {}} />)
    expect(screen.queryByRole("button", { name: "Foto siguiente" })).toBeNull()
    expect(screen.queryByRole("button", { name: /Ver foto/ })).toBeNull()
  })

  it("scrolls the carousel when a photo is picked", async () => {
    const scrollTo = vi.fn()
    Element.prototype.scrollTo = scrollTo as unknown as typeof Element.prototype.scrollTo
    render(<ExperienceModal experience={experience} onClose={() => {}} />)
    await userEvent.setup().click(screen.getByRole("button", { name: "Ver foto 2" }))
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: "smooth" }))
  })
})
