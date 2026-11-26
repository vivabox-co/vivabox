import { describe, expect, it } from "vitest"
import { interleaveByOrder, SHOWCASE_CATEGORY_ORDER } from "./interleave"
import { formatPrice } from "./formatPrice"
import { jsonLd } from "./jsonLd"
import { whatsappLink } from "./whatsappLink"

describe("interleaveByOrder", () => {
  it("takes one item per category, in the given order, on every pass", () => {
    const result = interleaveByOrder({ a: ["a1", "a2"], b: ["b1", "b2"] }, ["a", "b"])
    expect(result).toEqual(["a1", "b1", "a2", "b2"])
  })

  it("wraps shorter categories around instead of running dry", () => {
    const result = interleaveByOrder({ a: ["a1", "a2", "a3"], b: ["b1"] }, ["a", "b"])
    expect(result).toEqual(["a1", "b1", "a2", "b1", "a3", "b1"])
  })

  it("skips empty and missing categories, and appends categories missing from the order", () => {
    expect(interleaveByOrder({ a: [], b: ["b1"], extra: ["x1"] }, ["a", "b", "missing"])).toEqual(["b1", "x1"])
    expect(interleaveByOrder({}, ["a"])).toEqual([])
  })

  it("lists all five site categories for the showcase", () => {
    expect([...SHOWCASE_CATEGORY_ORDER].sort()).toEqual(["aventura", "bienestar", "cultura", "estancias", "gastronomia"])
  })
})

describe("formatPrice", () => {
  it("uses Colombian thousands separators", () => {
    expect(formatPrice(199000)).toBe("199.000")
    expect(formatPrice(1250000)).toBe("1.250.000")
    expect(formatPrice(0)).toBe("0")
  })
})

describe("jsonLd (structured data inside an inline <script>)", () => {
  it("cannot be broken out of with a closing script tag from the sheet", () => {
    const out = jsonLd({ description: "</script><script>alert(1)</script>" })
    expect(out).not.toContain("<")
    expect(JSON.parse(out).description).toBe("</script><script>alert(1)</script>")
  })

  it("escapes the U+2028 and U+2029 line separators", () => {
    const separators = String.fromCharCode(0x2028) + String.fromCharCode(0x2029)
    const out = jsonLd({ t: `a${separators}c` })
    expect(out).not.toContain(String.fromCharCode(0x2028))
    expect(out).not.toContain(String.fromCharCode(0x2029))
    expect(JSON.parse(out).t).toBe(`a${separators}c`)
  })

  it("is plain JSON otherwise", () => {
    expect(jsonLd({ a: 1, b: ["x"] })).toBe('{"a":1,"b":["x"]}')
  })
})

describe("whatsappLink", () => {
  it("points at the Vivabox number with the message encoded", () => {
    const url = new URL(whatsappLink("Hola, ¿qué tal? & más"))
    expect(url.origin + url.pathname).toBe("https://wa.me/573142590291")
    expect(url.searchParams.get("text")).toBe("Hola, ¿qué tal? & más")
  })
})
