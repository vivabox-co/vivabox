// Ported from the beneficiary app (vivabox-appben: lib/map/*) so the website's
// phone mockup shows the exact same pins, colours and labels. Keep in sync.

export type MapCategory = "gastro" | "bienestar" | "aventura" | "cultura" | "estancias"

export type MapExperience = {
  id: string
  title: string
  category: MapCategory
  activityKey: string
  lat: number
  lng: number
  city: string
  format: string
  photos: string[]
}

export const categoryColors: Record<MapCategory, string> = {
  gastro: "#FF8406",
  bienestar: "#0294D2",
  aventura: "#CB2033",
  cultura: "#7A3FF0",
  estancias: "#8DB92F",
}

export const categoryOrder: MapCategory[] = ["gastro", "bienestar", "aventura", "cultura", "estancias"]

export function categoryLabel(category: MapCategory): string {
  switch (category) {
    case "gastro":
      return "Gastronomía"
    case "bienestar":
      return "Bienestar"
    case "aventura":
      return "Aventura"
    case "cultura":
      return "Cultura"
    case "estancias":
      return "Estancias"
  }
}

// Just the number of people ("1", "2", "1-2") -- the icon next to it says the rest.
export function formatCount(format: string): string {
  switch (format) {
    case "duo":
      return "2"
    case "solo o duo":
      return "1-2"
    default:
      return "1"
  }
}

const ICON_BASE_PATH = "/icons/activity"
const DEFAULT_ACTIVITY_ICON = `${ICON_BASE_PATH}/dining.svg`

const VALID_ACTIVITY_KEYS = new Set([
  "archery", "art_workshop", "bbq", "beer_tasting", "brunch", "buggy", "bungee",
  "caravan", "chef_hat", "cinema", "climbing", "coffee_tasting", "crystal_ball",
  "dining", "driving_track", "eco_lodge", "escape_room", "facial", "flight_plane",
  "glass", "glamping", "golf", "gun", "hair", "hiking", "horseback", "hotel_stay",
  "ice_bath", "karting", "kayak", "massage", "meditation", "motorbike",
  "paragliding", "perfume", "photoshoot", "pizza_class", "sailboat", "sauna",
  "scuba", "skydiving", "spa", "sushi_class", "theater", "wind_tunnel",
])

export function normalizeActivityKey(value: string = ""): string {
  return value
    .replace(/ /g, "")
    .trim()
    .toLowerCase()
    .replace(/[ -]+/g, "_")
    .replace(/[^\w_]/g, "")
}

export function getActivityIcon(activityKey: string): string {
  if (!activityKey || !VALID_ACTIVITY_KEYS.has(activityKey)) return DEFAULT_ACTIVITY_ICON
  return `${ICON_BASE_PATH}/${activityKey}.svg`
}

// Same tile style as the app. Stadia authenticates by registered domain; an
// optional key can be provided for environments where the domain isn't listed.
const STADIA_KEY = process.env.NEXT_PUBLIC_STADIA_API_KEY
export const TILE_URL =
  "https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png" +
  (STADIA_KEY ? `?api_key=${STADIA_KEY}` : "")

// Same starting view as the app (zoom 10), centred between Bogotá and Chía.
export const INITIAL_CENTER: [number, number] = [4.8, -74.05]
export const INITIAL_ZOOM = 10
export const MIN_ZOOM = 9
// Exact coordinates are shown, but we don't let visitors zoom close enough to
// read a street address.
export const MAX_ZOOM = 13
export const MAX_BOUNDS: [[number, number], [number, number]] = [
  [3.3, -75.4],
  [5.7, -72.9],
]
