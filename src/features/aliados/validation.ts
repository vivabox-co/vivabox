export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "")
  return digits.length >= 7 && digits.length <= 15
}

export const EXPERIENCE_CATEGORIES = [
  "Gastronomía",
  "Bienestar",
  "Naturaleza & aventura",
  "Cultura & creatividad",
  "Escapadas",
  "Parejas",
  "Otro",
] as const
