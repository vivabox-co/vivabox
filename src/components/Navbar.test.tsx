// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useCheckoutStore } from "@/features/checkout/checkoutStore"

const { pathname } = vi.hoisted(() => ({ pathname: { value: "/" } }))

vi.mock("next/navigation", () => ({ usePathname: () => pathname.value }))
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: { src: string; alt?: string }) => <img alt={props.alt ?? ""} src={props.src} />,
}))

import Navbar from "./Navbar"

const box = { slug: "vivabox", name: "Vivabox", price: 199000 }

beforeEach(() => {
  pathname.value = "/"
  localStorage.clear()
  useCheckoutStore.getState().reset()
})
afterEach(cleanup)

const cartLinks = () => screen.getAllByRole("link").filter((a) => /^\/(checkout|#incluye)/.test(a.getAttribute("href") ?? "") || a.getAttribute("href") === "/#incluye")

describe("<Navbar /> — cart", () => {
  it("points the cart at the box section while nothing is chosen, with no counter", () => {
    render(<Navbar />)
    act(() => useCheckoutStore.getState().setHasHydrated(true))
    const links = cartLinks()
    expect(links.length).toBeGreaterThan(0)
    expect(links.every((a) => a.getAttribute("href") === "/#incluye")).toBe(true)
    expect(screen.queryByText("1")).toBeNull()
  })

  it("shows the quantity and links to that box's checkout once the cart is hydrated", () => {
    useCheckoutStore.getState().setBox(box)
    useCheckoutStore.getState().setQuantity(3)
    render(<Navbar />)
    act(() => useCheckoutStore.getState().setHasHydrated(true))
    expect(screen.getAllByText("3").length).toBeGreaterThan(0)
    expect(cartLinks().some((a) => a.getAttribute("href") === "/checkout/vivabox")).toBe(true)
  })

  it("shows no counter before the stored cart has been read (no server/client mismatch)", () => {
    useCheckoutStore.getState().setBox(box)
    useCheckoutStore.getState().setQuantity(3)
    useCheckoutStore.getState().setHasHydrated(false)
    render(<Navbar />)
    expect(screen.queryByText("3")).toBeNull()
  })

  it("updates the counter when the quantity changes", () => {
    useCheckoutStore.getState().setBox(box)
    render(<Navbar />)
    act(() => useCheckoutStore.getState().setHasHydrated(true))
    expect(screen.getAllByText("1").length).toBeGreaterThan(0)
    act(() => useCheckoutStore.getState().setQuantity(5))
    expect(screen.getAllByText("5").length).toBeGreaterThan(0)
  })
})

describe("<Navbar /> — navigation", () => {
  it("links to the activation app and to /empresas", () => {
    render(<Navbar />)
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"))
    expect(hrefs).toContain("/empresas")
    expect(screen.getAllByText(/Activar/).length).toBeGreaterThan(0)
  })
})
