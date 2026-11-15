// Fixed alternation order for the /experience-showcase marquee: cycles
// through every category, in order, taking one item per category per
// pass. Categories are very uneven in size (many more "aventura" rows
// than "cultura"), so smaller categories wrap around and repeat their
// experiences rather than running dry -- alternation stays perfect for
// the whole list, at the cost of some repeated cards in the smaller
// categories.
export const SHOWCASE_CATEGORY_ORDER = ["gastronomia", "aventura", "estancias", "bienestar", "cultura"]

export function interleaveByOrder<T>(groups: Record<string, T[]>, order: string[]): T[] {
  const cats = [...order, ...Object.keys(groups).filter(c => !order.includes(c))]
  const available = cats.filter(c => (groups[c]?.length || 0) > 0)
  if (available.length === 0) return []

  const passes = Math.max(...available.map(c => groups[c].length))
  const ordered: T[] = []

  for (let i = 0; i < passes; i++) {
    for (const cat of available) {
      const list = groups[cat]
      ordered.push(list[i % list.length])
    }
  }

  return ordered
}
