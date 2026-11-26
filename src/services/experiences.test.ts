import { beforeEach, describe, expect, it, vi } from "vitest"

const { getSheetData } = vi.hoisted(() => ({ getSheetData: vi.fn() }))
vi.mock("./sheet", () => ({ getSheetData }))

import { getAllExperiences, getExperienceSchemaItems, getMapExperiences } from "./experiences"

type Row = Record<string, string>

const row = (overrides: Row = {}): Row => ({
  codigo_interno: "EXP-001",
  title: "Cena en el cerro",
  category: "gastro",
  city: "Bogotá",
  zone: "Chapinero",
  format: "Pareja",
  duration: "120",
  image: "/images/experiencias-reales/cena-cerro/cena-1.webp",
  imagenesAdicionales: "",
  shortDescription: "Una cena",
  visibleBadges: "vista|chef|a|b|c|d|e",
  tipo_actividad: "gastronomia",
  ubicacion_lat: "4.65",
  ubicacion_lng: "-74.05",
  ...overrides,
})

beforeEach(() => getSheetData.mockReset())

describe("getMapExperiences", () => {
  it("keeps rows with a code, a known category and valid coordinates", async () => {
    getSheetData.mockResolvedValue([row()])
    const [exp] = await getMapExperiences()
    expect(exp).toMatchObject({ id: "EXP-001", title: "Cena en el cerro", category: "gastro", lat: 4.65, lng: -74.05, city: "Bogotá" })
  })

  it.each([
    ["no internal code", { codigo_interno: "" }],
    ["unknown category", { category: "spa" }],
    ["missing latitude", { ubicacion_lat: "" }],
    ["non-numeric longitude", { ubicacion_lng: "abc" }],
  ])("drops a row with %s", async (_label, overrides) => {
    getSheetData.mockResolvedValue([row(overrides)])
    expect(await getMapExperiences()).toEqual([])
  })

  it("accepts a decimal comma, as typed in a Spanish-locale sheet", async () => {
    getSheetData.mockResolvedValue([row({ ubicacion_lat: "4,65", ubicacion_lng: "-74,05" })])
    const [exp] = await getMapExperiences()
    expect(exp.lat).toBe(4.65)
    expect(exp.lng).toBe(-74.05)
  })

  it("falls back to the zone when there is no city, and normalises the category case", async () => {
    getSheetData.mockResolvedValue([row({ city: "", zone: "La Calera", category: " Aventura " })])
    const [exp] = await getMapExperiences()
    expect(exp).toMatchObject({ city: "La Calera", category: "aventura" })
  })

  it("does not expose provider data, prices or addresses", async () => {
    getSheetData.mockResolvedValue([row({ precio: "99000", proveedor: "Acme", direccion: "Calle 1" })])
    const [exp] = await getMapExperiences()
    expect(Object.keys(exp).sort()).toEqual(["activityKey", "category", "city", "format", "id", "lat", "lng", "photos", "title"])
  })

  it("always offers at least 3 distinct photos, starting with the cover", async () => {
    getSheetData.mockResolvedValue([row()])
    const [exp] = await getMapExperiences()
    expect(exp.photos.length).toBeGreaterThanOrEqual(3)
    expect(new Set(exp.photos).size).toBe(exp.photos.length)
    expect(exp.photos[0]).toBe("/images/experiencias-reales/cena-cerro/cena-1.webp")
  })

  it("puts the additional photos right after the cover, in sheet order", async () => {
    const extra = ["/images/experiencias-reales/a/2.webp", "/images/experiencias-reales/a/3.webp", "/images/experiencias-reales/a/4.webp"]
    getSheetData.mockResolvedValue([row({ imagenesAdicionales: ` ${extra.join(" | ")} |` })])
    const [exp] = await getMapExperiences()
    expect(exp.photos).toEqual(["/images/experiencias-reales/cena-cerro/cena-1.webp", ...extra])
  })

  it("uses the placeholder for an unrecognised image source", async () => {
    getSheetData.mockResolvedValue([row({ image: "https://evil.example.com/x.jpg" })])
    const [exp] = await getMapExperiences()
    expect(exp.photos[0]).toBe("/images/box-includes/vivabox-caja-regalo.webp")
  })
})

describe("getExperienceSchemaItems", () => {
  it("skips rows without a title, code or known category", async () => {
    getSheetData.mockResolvedValue([row({ title: "" }), row({ codigo_interno: "" }), row({ category: "otra" }), row()])
    expect(await getExperienceSchemaItems()).toHaveLength(1)
  })

  it("removes duplicates by title and city, ignoring case", async () => {
    getSheetData.mockResolvedValue([row(), row({ title: "CENA EN EL CERRO", city: "bogotá" }), row({ city: "Cali" })])
    expect(await getExperienceSchemaItems()).toHaveLength(2)
  })

  it("orders by category, then by sheet order", async () => {
    getSheetData.mockResolvedValue([
      row({ title: "Rafting", category: "aventura" }),
      row({ title: "Cena", category: "gastro" }),
      row({ title: "Masaje", category: "bienestar" }),
      row({ title: "Cata", category: "gastro", city: "Cali" }),
    ])
    const titles = (await getExperienceSchemaItems()).map((i) => i.title)
    expect(titles).toEqual(["Cena", "Cata", "Masaje", "Rafting"])
  })

  it("labels categories in Spanish and trims the description", async () => {
    getSheetData.mockResolvedValue([row({ shortDescription: "  Una cena  " })])
    expect(await getExperienceSchemaItems()).toEqual([
      expect.objectContaining({ categoryLabel: "Gastronomía", description: "Una cena" }),
    ])
  })
})

describe("getAllExperiences", () => {
  it("maps sheet categories to site categories and drops unknown ones", async () => {
    getSheetData.mockResolvedValue([row(), row({ title: "Rafting", category: "aventura" }), row({ title: "Spa", category: "spa" })])
    const all = await getAllExperiences()
    expect(all.map((e) => e.category).sort()).toEqual(["aventura", "gastronomia"])
  })

  it("limits the visible badges to the maximum", async () => {
    getSheetData.mockResolvedValue([row()])
    const [exp] = await getAllExperiences()
    expect(exp.visibleBadges?.length).toBeLessThanOrEqual(3)
    expect(exp.visibleBadges).toEqual(["vista", "chef", "a"])
  })
})
