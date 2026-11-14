// Turns an uploaded logo file into something that looks good on the sleeve
// and in the app, entirely in the browser (nothing is sent to a third party):
//  - removes a flat background (white or any solid color) when there is one
//  - trims empty margins
//  - upscales small files smoothly
//  - finds the logo's main colors, offered to tint the "Elige tu experiencia" script
// The production sleeve is always reworked by our team from the original file.

const MAX_BYTES = 6 * 1024 * 1024
const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"]
const WORK_MAX = 2048 // cap for the pixel work on huge files
const OUT_MAX = 1024
const LOW_RES_BELOW = 300 // longest side, in px, before we flag the logo
const BG_TOLERANCE = 42 // color distance counted as "same as the background"
const FALLBACK_COLOR = "#C8102E"

export const LOGO_ACCEPT = ACCEPTED.join(",")

export type LogoResult = {
  url: string // transparent PNG, up to 1024 px
  thumb: string // 512 px WebP kept for follow-up
  colors: string[] // main colors of the logo, most common first ("#rrggbb")
  hadBackground: boolean // a flat background was detected
  lowRes: boolean // the original file is small
}
export type LogoError = "TYPE" | "SIZE" | "READ"

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("READ"))
    img.src = src
  })
}

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(w))
  canvas.height = Math.max(1, Math.round(h))
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) throw new Error("READ")
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"
  return { canvas, ctx }
}

function dist(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}

// Removes a solid background by flooding inwards from the border, so white
// inside letters (the hole of an "O") is left alone.
function removeFlatBackground(data: ImageData): boolean {
  const { width: w, height: h } = data
  const px = data.data
  const at = (x: number, y: number) => (y * w + x) * 4

  // Background candidate: average of the four corners, which must agree.
  const corners = [at(0, 0), at(w - 1, 0), at(0, h - 1), at(w - 1, h - 1)]
  if (corners.some((i) => px[i + 3] < 250)) return false // already transparent
  const bg = [0, 1, 2].map((c) => corners.reduce((s, i) => s + px[i + c], 0) / 4)
  if (corners.some((i) => dist(px[i], px[i + 1], px[i + 2], bg[0], bg[1], bg[2]) > 30)) return false

  const seen = new Uint8Array(w * h)
  const stack: number[] = []
  const push = (x: number, y: number) => {
    const k = y * w + x
    if (seen[k]) return
    const i = k * 4
    if (dist(px[i], px[i + 1], px[i + 2], bg[0], bg[1], bg[2]) > BG_TOLERANCE) return
    seen[k] = 1
    stack.push(k)
  }
  for (let x = 0; x < w; x++) {
    push(x, 0)
    push(x, h - 1)
  }
  for (let y = 0; y < h; y++) {
    push(0, y)
    push(w - 1, y)
  }
  while (stack.length) {
    const k = stack.pop()!
    const x = k % w
    const y = (k - x) / w
    if (x > 0) push(x - 1, y)
    if (x < w - 1) push(x + 1, y)
    if (y > 0) push(x, y - 1)
    if (y < h - 1) push(x, y + 1)
  }

  // Flooded pixels become transparent; their immediate neighbours get a soft
  // alpha so the edge of the logo is not jagged.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const k = y * w + x
      const i = k * 4
      if (seen[k]) {
        px[i + 3] = 0
        continue
      }
      const nearBg =
        (x > 0 && seen[k - 1]) || (x < w - 1 && seen[k + 1]) || (y > 0 && seen[k - w]) || (y < h - 1 && seen[k + w])
      if (nearBg) {
        const d = dist(px[i], px[i + 1], px[i + 2], bg[0], bg[1], bg[2])
        px[i + 3] = Math.round(255 * Math.min(1, Math.max(0, (d - BG_TOLERANCE * 0.4) / (BG_TOLERANCE * 1.6))))
      }
    }
  }
  return true
}

function opaqueBounds(data: ImageData) {
  const { width: w, height: h } = data
  const px = data.data
  let minX = w, minY = h, maxX = -1, maxY = -1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (px[(y * w + x) * 4 + 3] > 12) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  return maxX < 0 ? null : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 }
}

// Up to three clearly different, clearly colored shades of the logo, most
// common first. Greys, near-white and near-black are skipped unless nothing
// else is there (a one-color black logo).
function dominantColors(data: ImageData): string[] {
  const px = data.data
  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>()
  let darkCount = 0
  const step = Math.max(1, Math.floor(Math.sqrt((data.width * data.height) / 40000)))
  for (let y = 0; y < data.height; y += step) {
    for (let x = 0; x < data.width; x += step) {
      const i = (y * data.width + x) * 4
      if (px[i + 3] < 200) continue
      const r = px[i], g = px[i + 1], b = px[i + 2]
      const max = Math.max(r, g, b), min = Math.min(r, g, b)
      const sat = max === 0 ? 0 : (max - min) / max
      if (max < 70) darkCount++
      if (sat < 0.3 || max < 70 || min > 235) continue
      const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4)
      const e = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 }
      e.n++; e.r += r; e.g += g; e.b += b
      buckets.set(key, e)
    }
  }

  const sorted = [...buckets.values()].sort((a, b) => b.n - a.n)
  const picked: number[][] = []
  for (const e of sorted) {
    let rgb = [e.r / e.n, e.g / e.n, e.b / e.n]
    // Keep the script readable on white paper: darken pale colors.
    const lum = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255
    if (lum > 0.6) rgb = rgb.map((v) => v * (0.6 / lum))
    if (picked.every((p) => dist(p[0], p[1], p[2], rgb[0], rgb[1], rgb[2]) > 80)) picked.push(rgb)
    if (picked.length === 3) break
  }
  const toHex = (rgb: number[]) => "#" + rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")
  if (picked.length === 0) return [darkCount > 20 ? "#1F2A44" : FALLBACK_COLOR]
  return picked.map(toHex)
}

function upscaleTo(source: HTMLCanvasElement, target: number): HTMLCanvasElement {
  let current = source
  while (Math.max(current.width, current.height) < target) {
    const factor = Math.min(2, target / Math.max(current.width, current.height))
    const { canvas, ctx } = makeCanvas(current.width * factor, current.height * factor)
    ctx.drawImage(current, 0, 0, canvas.width, canvas.height)
    current = canvas
  }
  return current
}

function downscaleTo(source: HTMLCanvasElement, max: number): HTMLCanvasElement {
  const longest = Math.max(source.width, source.height)
  if (longest <= max) return source
  const k = max / longest
  const { canvas, ctx } = makeCanvas(source.width * k, source.height * k)
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
  return canvas
}

export async function processLogo(file: File, options: { removeBackground?: boolean } = {}): Promise<LogoResult> {
  if (!ACCEPTED.includes(file.type)) throw new Error("TYPE")
  if (file.size > MAX_BYTES) throw new Error("SIZE")
  const removeBackground = options.removeBackground ?? true

  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await loadImage(objectUrl)
    const isSvg = file.type === "image/svg+xml"
    // SVGs without explicit size report 0 — fall back to a neutral wide ratio.
    const nw = img.naturalWidth || 600
    const nh = img.naturalHeight || 300
    const lowRes = !isSvg && Math.max(nw, nh) < LOW_RES_BELOW

    // Work at a sensible size: shrink huge files, give vectors real pixels.
    const k = isSvg ? OUT_MAX / Math.max(nw, nh) : Math.min(1, WORK_MAX / Math.max(nw, nh))
    const { canvas, ctx } = makeCanvas(nw * k, nh * k)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    let data = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const hadBackground = removeFlatBackground(data)
    if (hadBackground && removeBackground) ctx.putImageData(data, 0, 0)
    else if (hadBackground) data = ctx.getImageData(0, 0, canvas.width, canvas.height) // keep original pixels

    const bounds = opaqueBounds(hadBackground && removeBackground ? data : ctx.getImageData(0, 0, canvas.width, canvas.height))
    let trimmed = canvas
    if (bounds) {
      const pad = Math.round(Math.max(bounds.w, bounds.h) * 0.03)
      const x0 = Math.max(0, bounds.x - pad), y0 = Math.max(0, bounds.y - pad)
      const x1 = Math.min(canvas.width, bounds.x + bounds.w + pad), y1 = Math.min(canvas.height, bounds.y + bounds.h + pad)
      const t = makeCanvas(x1 - x0, y1 - y0)
      t.ctx.drawImage(canvas, x0, y0, x1 - x0, y1 - y0, 0, 0, x1 - x0, y1 - y0)
      trimmed = t.canvas
    }

    const full = downscaleTo(upscaleTo(trimmed, OUT_MAX), OUT_MAX)
    const colors = dominantColors(full.getContext("2d", { willReadFrequently: true })!.getImageData(0, 0, full.width, full.height))
    const small = downscaleTo(full, 512)
    let thumb = small.toDataURL("image/webp", 0.8)
    if (!thumb.startsWith("data:image/webp")) thumb = small.toDataURL("image/png")

    return { url: full.toDataURL("image/png"), thumb, colors, hadBackground, lowRes }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
