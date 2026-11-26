import { describe, expect, it } from "vitest"
import { isBogota, isSameDayAvailable, sameDayOutcome } from "./sameDay"

// Bogotá is UTC-5 all year (no daylight saving): 15:00Z = 10:00 local.
const at = (iso: string) => new Date(iso)

describe("isBogota", () => {
  it("recognises Bogotá however it is typed", () => {
    expect(isBogota("Bogotá")).toBe(true)
    expect(isBogota("bogota D.C.")).toBe(true)
    expect(isBogota("BOGOTÁ")).toBe(true)
  })
  it("rejects other cities and empty values", () => {
    expect(isBogota("Medellín")).toBe(false)
    expect(isBogota("")).toBe(false)
    expect(isBogota(null)).toBe(false)
  })
})

describe("isSameDayAvailable", () => {
  it("is available on a weekday morning in Bogotá", () => {
    expect(isSameDayAvailable("Bogotá", at("2026-11-26T15:00:00Z"))).toBe(true) // Thursday 10:00
  })
  it("works on Saturday", () => {
    expect(isSameDayAvailable("Bogotá", at("2026-11-28T15:00:00Z"))).toBe(true)
  })
  it("closes at 2 p.m. sharp", () => {
    expect(isSameDayAvailable("Bogotá", at("2026-11-26T18:59:00Z"))).toBe(true) // 13:59
    expect(isSameDayAvailable("Bogotá", at("2026-11-26T19:00:00Z"))).toBe(false) // 14:00
  })
  it("uses Bogotá time, not UTC: 03:00Z is still the previous evening locally", () => {
    expect(isSameDayAvailable("Bogotá", at("2026-11-27T03:00:00Z"))).toBe(false)
  })
  it("is never available on Sundays", () => {
    expect(isSameDayAvailable("Bogotá", at("2026-11-29T15:00:00Z"))).toBe(false)
  })
  it("is not available on Colombian holidays", () => {
    expect(isSameDayAvailable("Bogotá", at("2026-12-08T15:00:00Z"))).toBe(false) // Inmaculada, Tuesday
    expect(isSameDayAvailable("Bogotá", at("2026-12-25T15:00:00Z"))).toBe(false) // Navidad
    expect(isSameDayAvailable("Bogotá", at("2026-04-03T15:00:00Z"))).toBe(false) // Viernes Santo 2026
  })
  it("moves Emiliani holidays to Monday", () => {
    expect(isSameDayAvailable("Bogotá", at("2026-11-02T15:00:00Z"))).toBe(false) // Todos los Santos → Mon Nov 2
    expect(isSameDayAvailable("Bogotá", at("2026-11-01T15:00:00Z"))).toBe(false) // it is a Sunday anyway
    expect(isSameDayAvailable("Bogotá", at("2026-11-03T15:00:00Z"))).toBe(true)
  })
  it("is not available outside Bogotá", () => {
    expect(isSameDayAvailable("Cali", at("2026-11-26T15:00:00Z"))).toBe(false)
  })
})

describe("sameDayOutcome", () => {
  it("is on time before 2 p.m.", () => {
    expect(sameDayOutcome(at("2026-11-26T18:59:00Z"))).toBe("on_time")
  })
  it("grants a grace period until 2:30 p.m.", () => {
    expect(sameDayOutcome(at("2026-11-26T19:10:00Z"))).toBe("grace")
  })
  it("is missed after the grace period", () => {
    expect(sameDayOutcome(at("2026-11-26T19:40:00Z"))).toBe("missed")
  })
  it("is missed on a Sunday or a holiday, even in the morning", () => {
    expect(sameDayOutcome(at("2026-11-29T15:00:00Z"))).toBe("missed")
    expect(sameDayOutcome(at("2026-12-25T15:00:00Z"))).toBe("missed")
  })
})
