// Paints the company's branding onto the sleeve texture of the 3D box.
// The texture (public/3d/sleeve_color.webp, 915 x 4096) holds the two printed
// faces. Coordinates are in texture pixels; sizes below were measured on the
// original print so the result keeps the same proportions.
//
//  - Front: the Vivabox logo is replaced by the company logo; under it, ONE
//    serif line at the original size and the "Elige tu experiencia" script
//    tinted with the chosen color (IGNIA mockup).
//  - Back: a "company × Vivabox" lockup. The Vivabox logo is kept (cropped
//    from the original print) and the company logo is added beside it.

export const SLEEVE_TEXTURE = "/3d/sleeve_color.webp"
const SCRIPT_ART = "/images/empresas/elige-tu-experiencia.webp"

type Rect = { x: number; y: number; w: number; h: number }

// Printed band: x 35..878, centered on x = 456.
// The front is printed upside down in the texture, hence the 180° turn.
const FRONT_FULL: Rect = { x: 100, y: 895, w: 715, h: 535 } // logo + both text lines
const FRONT_LOGO_ONLY: Rect = { x: 100, y: 1080, w: 715, h: 350 } // keeps the printed text
const BACK: Rect = { x: 100, y: 2300, w: 715, h: 205 }
const BACK_VIVABOX_CROP: Rect = { x: 195, y: 2300, w: 525, h: 205 }

// Original print: 31 characters on 587 px ≈ 38 px type. Our phrases are
// shorter, so they are set bigger: sized to fill ~520 px (about 62% of the
// band, like the IGNIA mockup), never smaller than the original type.
const SERIF_MIN = 38
const SERIF_MAX = 64
const SERIF_TARGET_W = 520
const SERIF_COLOR = "#1A2433"
const SCRIPT_WIDTH = 440
const LOGO_BOX_W = 520 // largest logo box above the text, at scale 1
const LOGO_BOX_H = 250
const GAP_LOGO_TEXT = 34
const GAP_TEXT_SCRIPT = 22

const imageCache = new Map<string, Promise<HTMLImageElement>>()

function loadImage(src: string): Promise<HTMLImageElement> {
  const cacheable = !src.startsWith("data:")
  let p = cacheable ? imageCache.get(src) : undefined
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => {
        imageCache.delete(src)
        reject(new Error(`image: ${src.slice(0, 40)}`))
      }
      img.src = src
    })
    if (cacheable) imageCache.set(src, p)
  }
  return p
}

function drawContain(ctx: CanvasRenderingContext2D, img: HTMLImageElement, box: Rect) {
  const r = Math.min(box.w / img.naturalWidth, box.h / img.naturalHeight)
  const dw = img.naturalWidth * r
  const dh = img.naturalHeight * r
  ctx.drawImage(img, box.x + (box.w - dw) / 2, box.y + (box.h - dh) / 2, dw, dh)
}

function scaledBox(box: Rect, scale: number): Rect {
  const w = box.w * scale
  const h = box.h * scale
  return { x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h }
}

function paperColor(ctx: CanvasRenderingContext2D, y: number): string {
  const [r, g, b] = ctx.getImageData(60, y, 1, 1).data
  return `rgb(${r},${g},${b})`
}

async function tintedScript(color: string, width: number): Promise<HTMLCanvasElement> {
  const art = await loadImage(SCRIPT_ART)
  const c = document.createElement("canvas")
  c.width = width
  c.height = Math.round((art.naturalHeight / art.naturalWidth) * width)
  const ctx = c.getContext("2d")!
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(art, 0, 0, c.width, c.height)
  ctx.globalCompositeOperation = "source-in"
  ctx.fillStyle = color
  ctx.fillRect(0, 0, c.width, c.height)
  return c
}

export type SleeveOptions = {
  logoUrl: string | null
  frontLine: string | null // null keeps the original Vivabox text
  logoScale: number // 0.65 / 0.85 / 1, share of the largest logo box
  color: string
  serifFamily: string
}

// Returns a URL of the full texture with the branding painted on, or the
// untouched original texture URL when there is no logo.
export async function composeSleeveTexture(opts: SleeveOptions): Promise<string> {
  if (!opts.logoUrl) return SLEEVE_TEXTURE

  const [base, logo] = await Promise.all([loadImage(SLEEVE_TEXTURE), loadImage(opts.logoUrl)])
  const canvas = document.createElement("canvas")
  canvas.width = base.naturalWidth
  canvas.height = base.naturalHeight
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) return SLEEVE_TEXTURE
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(base, 0, 0)

  /* ---------- FRONT ---------- */
  const keepPrint = opts.frontLine === null
  const fz = keepPrint ? FRONT_LOGO_ONLY : FRONT_FULL
  ctx.fillStyle = paperColor(ctx, fz.y + fz.h / 2)
  ctx.fillRect(fz.x, fz.y, fz.w, fz.h)

  ctx.save()
  ctx.translate(fz.x + fz.w / 2, fz.y + fz.h / 2)
  ctx.rotate(Math.PI)
  ctx.translate(-fz.w / 2, -fz.h / 2) // local origin = top-left of the (rotated) zone

  if (keepPrint) {
    // Original text stays where it is printed; only the logo block changes.
    drawContain(ctx, logo, scaledBox({ x: 100, y: 20, w: fz.w - 200, h: fz.h - 40 }, opts.logoScale))
  } else {
    // One compact block (logo, tagline, script), centered in the white band,
    // so the text always follows the logo whatever its shape.
    const box = { x: 0, y: 0, w: LOGO_BOX_W * opts.logoScale, h: LOGO_BOX_H * opts.logoScale }
    const r = Math.min(box.w / logo.naturalWidth, box.h / logo.naturalHeight)
    const logoW = logo.naturalWidth * r
    const logoH = logo.naturalHeight * r

    const script = await tintedScript(opts.color, SCRIPT_WIDTH)

    ctx.font = `400 100px ${opts.serifFamily}`
    const widthAt100 = ctx.measureText(opts.frontLine!).width
    const serifSize = Math.round(Math.max(SERIF_MIN, Math.min(SERIF_MAX, (SERIF_TARGET_W * 100) / widthAt100)))

    const blockH = logoH + GAP_LOGO_TEXT + serifSize + GAP_TEXT_SCRIPT + script.height
    const top = Math.max(8, (fz.h - blockH) / 2)

    ctx.drawImage(logo, (fz.w - logoW) / 2, top, logoW, logoH)

    ctx.fillStyle = SERIF_COLOR
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.font = `400 ${serifSize}px ${opts.serifFamily}`
    ctx.fillText(opts.frontLine!, fz.w / 2, top + logoH + GAP_LOGO_TEXT)

    ctx.drawImage(script, (fz.w - script.width) / 2, top + logoH + GAP_LOGO_TEXT + serifSize + GAP_TEXT_SCRIPT, script.width, script.height)
  }
  ctx.restore()

  /* ---------- BACK: company × Vivabox ---------- */
  const vivabox = document.createElement("canvas")
  vivabox.width = BACK_VIVABOX_CROP.w
  vivabox.height = BACK_VIVABOX_CROP.h
  vivabox
    .getContext("2d")!
    .drawImage(base, BACK_VIVABOX_CROP.x, BACK_VIVABOX_CROP.y, BACK_VIVABOX_CROP.w, BACK_VIVABOX_CROP.h, 0, 0, vivabox.width, vivabox.height)

  ctx.fillStyle = paperColor(ctx, BACK.y + BACK.h / 2)
  ctx.fillRect(BACK.x, BACK.y, BACK.w, BACK.h)

  // Proportions of the IGNIA mockup: lockup ≈ 85% of the band, Vivabox logo ≈ 46%.
  const vbScale = 0.74
  const vbW = vivabox.width * vbScale
  const vbH = vivabox.height * vbScale
  const partnerW = 235
  const gap = 26
  const crossW = 30
  const total = partnerW + gap + crossW + gap + vbW
  const left = BACK.x + (BACK.w - total) / 2
  const vbTop = BACK.y + (BACK.h - vbH) / 2
  const logoCenterY = vbTop + vbH * 0.4 // the wordmark, above the colored dashes

  drawContain(ctx, logo, { x: left, y: logoCenterY - 62, w: partnerW, h: 124 })

  ctx.fillStyle = "#3A3A3A"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.font = `300 44px ${opts.serifFamily}`
  ctx.fillText("×", left + partnerW + gap + crossW / 2, logoCenterY)

  ctx.drawImage(vivabox, left + partnerW + gap + crossW + gap, vbTop, vbW, vbH)

  const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/webp", 0.92))
  return blob ? URL.createObjectURL(blob) : canvas.toDataURL("image/png")
}
