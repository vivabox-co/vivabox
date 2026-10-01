// Option « Envío el mismo día » — Bogotá, lunes a sábado (sin festivos), si el
// pedido se hace antes de la hora límite. Fuente única de verdad: el checkout
// (visualización) y el servidor (api/checkout/start, finalizeVentaPayment) la
// importan. Reglas en docs/09_checkout.md.

// Suplemento en COP, sumado al total (los códigos promo no lo reducen).
export const SAME_DAY_PRICE_COP = 10000

// Valor guardado en ventas.delivery_speed (vivabox-operativo lo lee).
export const SAME_DAY_SPEED = "same_day"

// Hora límite (hora de Bogotá) para elegir la opción, y tolerancia para un
// pago que llega un poco después de que el cliente haya empezado el checkout.
const CUTOFF_MINUTES = 14 * 60
const GRACE_MINUTES = 14 * 60 + 30

// Promesa mostrada al cliente.
export const SAME_DAY_PROMISE = "Llega hoy antes de las 8:00 p. m."
export const SAME_DAY_AVAILABILITY_HINT = "Disponible de lunes a sábado, antes de las 2:00 p. m."

const BOGOTA_OFFSET_MS = -5 * 60 * 60 * 1000 // sin horario de verano

export function isBogota(city: string | null | undefined): boolean {
  return (city ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .includes("bogota")
}

function bogotaClock(date: Date) {
  const shifted = new Date(date.getTime() + BOGOTA_OFFSET_MS)
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(), // 0-11
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(), // 0 = domingo
    minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
  }
}

function addDays(base: Date, days: number) {
  return new Date(base.getTime() + days * 86400000)
}

function easterSunday(year: number): Date {
  // Algoritmo de Meeus/Jones/Butcher
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(Date.UTC(year, month, day))
}

// Ley Emiliani: ciertos festivos pasan al lunes siguiente (o se quedan si ya es lunes).
function toMonday(date: Date) {
  const weekday = date.getUTCDay()
  return weekday === 1 ? date : addDays(date, (8 - weekday) % 7)
}

function colombianHolidayKeys(year: number): Set<string> {
  const key = (d: Date) => `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`
  const utc = (month: number, day: number) => new Date(Date.UTC(year, month, day))
  const easter = easterSunday(year)

  return new Set(
    [
      // fijos
      utc(0, 1), utc(4, 1), utc(6, 20), utc(7, 7), utc(11, 8), utc(11, 25),
      // trasladados al lunes
      toMonday(utc(0, 6)), toMonday(utc(2, 19)), toMonday(utc(5, 29)),
      toMonday(utc(7, 15)), toMonday(utc(9, 12)), toMonday(utc(10, 1)), toMonday(utc(10, 11)),
      // Semana Santa y festivos ligados a la Pascua
      addDays(easter, -3), addDays(easter, -2),
      addDays(easter, 43), addDays(easter, 64), addDays(easter, 71),
    ].map(key)
  )
}

function isWorkingDay(clock: ReturnType<typeof bogotaClock>) {
  if (clock.weekday === 0) return false
  const holiday = colombianHolidayKeys(clock.year)
  return !holiday.has(`${clock.year}-${clock.month}-${clock.day}`)
}

// ¿Se puede elegir la opción ahora? (checkout y `start`)
export function isSameDayAvailable(city: string | null | undefined, now: Date = new Date()): boolean {
  if (!isBogota(city)) return false
  const clock = bogotaClock(now)
  return isWorkingDay(clock) && clock.minutes < CUTOFF_MINUTES
}

// Estado de un pedido same_day según la hora del pago confirmado:
//   on_time — pagado antes de la hora límite  → entrega hoy
//   grace   — pagado dentro de la tolerancia  → entrega hoy igualmente, urgente
//   missed  — demasiado tarde / día no hábil  → no llega hoy, el equipo decide
export type SameDayOutcome = "on_time" | "grace" | "missed"

export function sameDayOutcome(paidAt: Date): SameDayOutcome {
  const clock = bogotaClock(paidAt)
  if (!isWorkingDay(clock)) return "missed"
  if (clock.minutes < CUTOFF_MINUTES) return "on_time"
  if (clock.minutes < GRACE_MINUTES) return "grace"
  return "missed"
}
