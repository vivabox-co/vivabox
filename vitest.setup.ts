// Node 25 ships an experimental global `localStorage` that shadows jsdom's and
// has no working methods without --localstorage-file. Tests that touch the
// browser storage get a plain in-memory implementation instead (all Node
// versions, so CI on Node 22 behaves the same as a laptop on Node 25).
class MemoryStorage implements Storage {
  private data = new Map<string, string>()
  get length() {
    return this.data.size
  }
  clear() {
    this.data.clear()
  }
  getItem(key: string) {
    return this.data.get(key) ?? null
  }
  key(index: number) {
    return [...this.data.keys()][index] ?? null
  }
  removeItem(key: string) {
    this.data.delete(key)
  }
  setItem(key: string, value: string) {
    this.data.set(key, String(value))
  }
}

if (typeof window !== "undefined") {
  for (const name of ["localStorage", "sessionStorage"] as const) {
    const storage = new MemoryStorage()
    Object.defineProperty(window, name, { value: storage, configurable: true })
    Object.defineProperty(globalThis, name, { value: storage, configurable: true })
  }
}
