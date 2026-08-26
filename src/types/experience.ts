export type Experience = {
  title: string
  city?: string
  category: string
  image?: string
  gallery?: string[]

  duration?: string
  zone?: string
  format?: string // sheet "formato": solo | duo -- feeds the practical people-count metadata
  shortDescription?: string

  // Internal filter metadata -- kept for the beneficiary activation app's
  // catalogue filters, no longer rendered as visible badges on this site.
  idealFor?: string
  effortLevel?: string
  ambiance?: string
  environment?: string
  engagement?: string
  vivanote?: string

  // Curated editorial "claves de elección" (max 3, explicit order), resolved
  // via src/data/badges.ts -- separate system from the internal filters above.
  visibleBadges?: string[]
}