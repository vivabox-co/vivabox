"use client"

import { useEffect, useId, useRef, useState } from "react"
import { Info } from "lucide-react"
import ConfiguratorPreview from "./ConfiguratorPreview"
import DateField from "./DateField"
import Dropdown from "./Dropdown"
import { LOGO_ACCEPT, processLogo, type LogoError, type LogoResult } from "./logoFile"
import {
  BRAND_COLORS,
  CUSTOM_FRONT_TEXT_ID,
  CUSTOM_FRONT_TEXT_MAX,
  DEFAULT_FRONT_TEXT,
  DEFAULT_LOGO_SIZE,
  FRONT_TEXTS,
  LOGO_SIZES,
} from "./frontText"
import {
  DEFAULT_MESSAGE,
  MESSAGE_MAX,
  QUANTITY_OPTIONS,
  SIGNATURE_MAX,
  collectMeta,
  newMaquetaId,
  sendMaqueta,
} from "./tracking"
import type { MaquetaConfig } from "./types"

const WHATSAPP_NUMBER = "573142590291"
const DEFAULT_COLOR: string = BRAND_COLORS[0].hex

const LOGO_ERRORS: Record<LogoError, string> = {
  TYPE: "Usa un archivo PNG, JPG, WebP o SVG.",
  SIZE: "El archivo pesa más de 6 MB. Prueba con uno más liviano.",
  READ: "No pudimos leer ese archivo. Prueba con otro.",
}

const field =
  "w-full rounded-[12px] bg-white/8 px-3 py-2 text-[14px] text-white placeholder:text-white/40 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"

const label = "mb-1.5 block text-[13px] font-medium text-white/80"

export default function Configurator({ header }: { header?: React.ReactNode }) {
  const [id, setId] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoThumb, setLogoThumb] = useState<string | null>(null)
  const [logoName, setLogoName] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoInfo, setLogoInfo] = useState<Pick<LogoResult, "hadBackground" | "lowRes"> | null>(null)
  const [logoColors, setLogoColors] = useState<string[]>([])
  const [removeBg, setRemoveBg] = useState(true)
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [frontTextId, setFrontTextId] = useState(DEFAULT_FRONT_TEXT)
  const [frontCustom, setFrontCustom] = useState("")
  const [logoSize, setLogoSize] = useState(DEFAULT_LOGO_SIZE)
  const [logoError, setLogoError] = useState("")
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const [signature, setSignature] = useState("")
  const [quantity, setQuantity] = useState("")
  const [neededBy, setNeededBy] = useState("")
  const [dragging, setDragging] = useState(false)
  const dirty = useRef(false)
  const colorPicked = useRef(false) // the visitor chose a script color on purpose
  const fileInput = useRef<HTMLInputElement>(null)

  const config: MaquetaConfig = { logoUrl, message, signature, frontTextId, frontCustom, logoSize, color }

  useEffect(() => {
    // Random per visit, so it can only exist on the client (it feeds the WhatsApp link).
    setId(newMaquetaId())
  }, [])

  const savePayload = () => ({
    logoThumb,
    message,
    signature,
    quantity,
    neededBy,
    frontText: frontTextId,
    frontCustom,
    logoSize,
    brandColor: color,
    meta: collectMeta(),
  })

  // Autosave 1.5 s after the visitor stops editing. Nothing is sent until they
  // change something, so mere visits never create a row.
  useEffect(() => {
    if (!id || !dirty.current) return
    const t = setTimeout(() => sendMaqueta({ id, event: "edit", ...savePayload() }), 1500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, logoThumb, message, signature, quantity, neededBy, frontTextId, frontCustom, logoSize, color])

  function touch<T>(setter: (v: T) => void) {
    return (v: T) => {
      dirty.current = true
      setter(v)
    }
  }

  async function applyLogo(file: File, removeBackground: boolean) {
    setLogoError("")
    try {
      const result = await processLogo(file, { removeBackground })
      dirty.current = true
      setLogoUrl(result.url)
      setLogoThumb(result.thumb)
      setLogoColors(result.colors)
      // Keep the visitor's own pick while it is still on offer; otherwise use the logo's main color.
      setColor((current) => {
        const offered = [...result.colors, ...BRAND_COLORS.map((b) => b.hex as string)]
        if (colorPicked.current && offered.includes(current)) return current
        colorPicked.current = false
        return result.colors[0]
      })
      setLogoInfo({ hadBackground: result.hadBackground, lowRes: result.lowRes })
      setLogoName(file.name)
      setLogoFile(file)
      return true
    } catch (err) {
      const code = (err instanceof Error ? err.message : "READ") as LogoError
      setLogoError(LOGO_ERRORS[code] ?? LOGO_ERRORS.READ)
      return false
    }
  }

  async function handleFile(file: File | undefined) {
    if (!file) return
    if (await applyLogo(file, true)) setRemoveBg(true)
  }

  function toggleRemoveBg(next: boolean) {
    setRemoveBg(next)
    if (logoFile) applyLogo(logoFile, next)
  }

  function removeLogo() {
    dirty.current = true
    setLogoUrl(null)
    setLogoThumb(null)
    setLogoName("")
    setLogoFile(null)
    setLogoInfo(null)
    // Text and color choices are kept (and re-applied if another logo comes in).
    if (fileInput.current) fileInput.current.value = ""
  }

  const hasLogo = logoUrl !== null

  const colorOptions = [
    ...logoColors.map((hex, i) => ({ hex, name: i === 0 ? "Color de tu logo" : "Otro color de tu logo" })),
    ...BRAND_COLORS.filter((b) => !logoColors.includes(b.hex)).map((b) => ({ hex: b.hex, name: b.name })),
  ]

  const maquetaUrl = id ? `${typeof window !== "undefined" ? window.location.origin : ""}/empresas/maqueta/${id}` : ""

  const whatsappHref =
    "https://wa.me/" +
    WHATSAPP_NUMBER +
    "?text=" +
    encodeURIComponent(
      [
        "Hola, quiero personalizar Vivabox para mi empresa.",
        logoUrl ? `Mi maqueta: ${maquetaUrl}` : "",
        `Cantidad aproximada: ${quantity}`,
        `Fecha de entrega: ${neededBy}`,
      ]
        .filter((l, i) => i !== 1 || l)
        .join("\n")
    )

  function onCta() {
    if (!id) return
    // Save the final state first, then flag the click. Small payload so
    // keepalive (64 KB limit) is safe while the tab moves to WhatsApp.
    sendMaqueta({ id, event: "edit", ...savePayload() }, false)
    sendMaqueta({ id, event: "cta" }, true)
  }

  return (
    <div className="grid gap-x-10 gap-y-5 md:grid-cols-[minmax(0,540px)_minmax(0,1fr)] md:grid-rows-[1fr_auto_auto_1fr]">

      {/* HEADER — hugs the controls, centered with the scene */}
      {header && <div className="order-1 md:order-none md:col-start-1 md:row-start-2 md:mb-1">{header}</div>}

      {/* PREVIEW — on phones it comes first, full width, same layout as desktop */}
      <div className="order-2 md:order-none md:col-start-2 md:row-span-4 md:row-start-1 md:self-center">
        {/* Capped so the scene is no taller than the text + controls column next to it */}
        <ConfiguratorPreview config={config} maxWidth={440} />
      </div>

      {/* CONTROLS — two columns on larger screens */}
      <div className="order-3 grid gap-x-4 gap-y-4 text-white sm:grid-cols-2 md:order-none md:col-start-1 md:row-start-3">

        {/* LOGO */}
        <div>
          <span className={label}>Tu logo</span>
          <input
            ref={fileInput}
            type="file"
            accept={LOGO_ACCEPT}
            className="sr-only"
            id="empresas-logo"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {logoUrl ? (
            <div className="flex items-center gap-2.5 rounded-[12px] bg-white/8 p-2 ring-1 ring-white/15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt="" className="h-9 w-14 shrink-0 rounded-[8px] bg-white object-contain p-1" />
              <span className="min-w-0 flex-1 truncate text-[13px] text-white/85">{logoName}</span>
              <button type="button" onClick={removeLogo} className="shrink-0 px-1.5 text-[12px] text-white/70 underline hover:text-white">
                Quitar
              </button>
            </div>
          ) : (
            <label
              htmlFor="empresas-logo"
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                handleFile(e.dataTransfer.files?.[0])
              }}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed px-3 py-3 text-center transition ${
                dragging ? "border-primary bg-primary/10" : "border-white/30 hover:border-white/60"
              }`}
            >
              <span className="text-[14px] font-medium text-white">Subir logo</span>
              <span className="text-[11px] text-white/55">PNG, JPG, WebP o SVG</span>
            </label>
          )}
          {logoError && <p className="mt-1.5 text-[12px] text-[#FCA5A5]" role="alert">{logoError}</p>}
          {logoUrl && logoInfo && (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-white/75">
              <div role="group" aria-label="Tamaño del logo" className="flex items-center gap-1.5">
                <span>Tamaño</span>
                <div className="flex rounded-full bg-white/10 p-0.5 ring-1 ring-white/20">
                  {LOGO_SIZES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={logoSize === s.id}
                      onClick={() => touch(setLogoSize)(s.id)}
                      className={`h-6 w-7 rounded-full text-[11px] font-medium transition ${
                        logoSize === s.id ? "bg-white text-ink" : "text-white/75 hover:text-white"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              {logoInfo.hadBackground && (
                <label className="flex cursor-pointer items-center gap-1.5">
                  <input type="checkbox" checked={removeBg} onChange={(e) => toggleRemoveBg(e.target.checked)} className="h-3.5 w-3.5 accent-[#FF8406]" />
                  Quitar fondo
                </label>
              )}
              {logoInfo.lowRes && <p className="w-full text-[#FCD34D]">Tu archivo es pequeño y puede verse borroso aquí.</p>}
            </div>
          )}
        </div>

        {/* FRONT TEXT + COLOR */}
        <div className={hasLogo ? "" : "[&_select]:cursor-not-allowed [&_fieldset]:cursor-not-allowed"}>
          <div className="mb-1.5 flex items-center gap-1.5">
            <label htmlFor="empresas-front-text" className="text-[13px] font-medium text-white/80">Texto bajo el logo</label>
            {!hasLogo && <InfoTip label="Por qué está desactivado" text="Sube tu logo para elegir el texto y el color." />}
          </div>
          <Dropdown
            id="empresas-front-text"
            value={String(frontTextId)}
            disabled={!hasLogo}
            onChange={(v) => touch(setFrontTextId)(Number(v))}
            options={FRONT_TEXTS.map((t) => ({ value: String(t.id), label: t.label }))}
            className={`${field} disabled:opacity-45`}
          />
          {frontTextId === CUSTOM_FRONT_TEXT_ID && (
            <input
              type="text"
              value={frontCustom}
              disabled={!hasLogo}
              maxLength={CUSTOM_FRONT_TEXT_MAX}
              onChange={(e) => touch(setFrontCustom)(e.target.value)}
              placeholder="Una frase corta"
              aria-label="Tu frase corta"
              className={`${field} mt-1.5 disabled:opacity-45`}
            />
          )}
          <fieldset disabled={!hasLogo} className={`mt-2.5 flex items-center gap-2.5 ${hasLogo ? "" : "opacity-45"}`}>
            <legend className="sr-only">Color de «Elige tu experiencia»</legend>
            <span aria-hidden className="text-[12px] text-white/75">Color</span>
            {colorOptions.map((c) => (
              <label key={c.hex} title={c.name} className="cursor-pointer">
                <input
                  type="radio"
                  name="empresas-color"
                  className="peer sr-only"
                  checked={color === c.hex}
                  onChange={() => {
                    colorPicked.current = true
                    touch(setColor)(c.hex)
                  }}
                  aria-label={c.name}
                />
                <span
                  className="block h-6 w-6 rounded-full ring-2 ring-white/20 transition peer-checked:ring-white peer-focus-visible:ring-primary"
                  style={{ backgroundColor: c.hex }}
                />
              </label>
            ))}
          </fieldset>
        </div>

        {/* CARD */}
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <label htmlFor="empresas-mensaje" className="text-[13px] font-medium text-white/80">Mensaje en la tarjeta</label>
            <span className="text-[11px] text-white/50">{message.length}/{MESSAGE_MAX}</span>
          </div>
          <textarea
            id="empresas-mensaje"
            rows={2}
            maxLength={MESSAGE_MAX}
            value={message}
            onChange={(e) => touch(setMessage)(e.target.value)}
            className={`${field} resize-none`}
            placeholder="Gracias por este año juntos."
          />
          <input
            type="text"
            value={signature}
            maxLength={SIGNATURE_MAX}
            onChange={(e) => touch(setSignature)(e.target.value)}
            placeholder="Firma (opcional), ej. Tu equipo"
            aria-label="Firma de la tarjeta"
            className={`${field} mt-1.5`}
          />
        </div>

        {/* QUANTITY AND DATE */}
        <div className="grid grid-cols-2 content-start gap-3">
          <div>
            <label htmlFor="empresas-cantidad" className={label}>Personas</label>
            <Dropdown
              id="empresas-cantidad"
              value={quantity}
              onChange={(v) => touch(setQuantity)(v)}
              options={[{ value: "", label: "Aproximado" }, ...QUANTITY_OPTIONS.map((q) => ({ value: q, label: q }))]}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="empresas-fecha" className={label}>Para cuándo</label>
            <DateField
              id="empresas-fecha"
              value={neededBy}
              onChange={(iso) => touch(setNeededBy)(iso)}
              className={field}
            />
          </div>
        </div>

        {/* CTA + INFO */}
        <div className="flex flex-col gap-2.5 sm:col-span-2">
          {/* Outlined, not filled: the border is the four Vivabox ribbon colors, twice, cut on a slight slant (200deg). */}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onCta}
            className="group inline-flex w-full rounded-[14px] bg-[linear-gradient(200deg,var(--color-primary)_0_12.5%,var(--color-accent-red)_12.5%_25%,var(--color-accent-green)_25%_37.5%,var(--color-accent-blue)_37.5%_50%,var(--color-primary)_50%_62.5%,var(--color-accent-red)_62.5%_75%,var(--color-accent-green)_75%_87.5%,var(--color-accent-blue)_87.5%_100%)] p-[2px] sm:w-fit"
          >
            <span className="inline-flex h-11 w-full items-center justify-center rounded-[12px] bg-ink px-6 text-[15px] font-semibold text-white transition-colors group-hover:bg-[#26211b]">
              Enviar mi maqueta por WhatsApp
            </span>
          </a>
          <p className="text-[12px] leading-relaxed text-white/55">
            Guardamos tu maqueta para ayudarte mejor. Esta vista es aproximada.{" "}
            <InfoTip text="Nuestro equipo trabaja tu logo con la mejor calidad para la caja final. Te pediremos el archivo en alta resolución si sigues adelante." />
          </p>
        </div>
      </div>

    </div>
  )
}

// Small tooltip: opens on mouse hover and keyboard focus, closes by itself.
// On touch, a tap opens it; a tap elsewhere or a few seconds later closes it.
function InfoTip({ text, label = "Más información sobre esta vista" }: { text: string; label?: string }) {
  const tipId = useId()
  const [hover, setHover] = useState(false)
  const [focus, setFocus] = useState(false)
  const [tap, setTap] = useState(false)
  const [alignRight, setAlignRight] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  // Keep the tooltip on screen: open towards the side with more room.
  const measure = () => {
    const r = ref.current?.getBoundingClientRect()
    if (r) setAlignRight(r.left > window.innerWidth / 2)
  }

  useEffect(() => {
    if (!tap) return
    const close = (e: Event) => {
      if (!ref.current?.contains(e.target as Node)) setTap(false)
    }
    const timer = setTimeout(() => setTap(false), 4000)
    document.addEventListener("pointerdown", close)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("pointerdown", close)
    }
  }, [tap])

  const open = hover || focus || tap

  return (
    <span
      ref={ref}
      className="relative inline-flex align-middle"
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return
        measure()
        setHover(true)
      }}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHover(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? tipId : undefined}
        onClick={() => {
          measure()
          setTap((t) => !t)
        }}
        onFocus={() => {
          measure()
          setFocus(true)
        }}
        onBlur={() => setFocus(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setTap(false)
            e.currentTarget.blur()
          }
        }}
        className="rounded-full p-0.5 text-white/55 transition hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Info className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
      </button>
      <span
        id={tipId}
        role="tooltip"
        className={`pointer-events-none absolute bottom-full z-30 mb-2 w-[260px] max-w-[calc(100vw-3rem)] rounded-[12px] ${alignRight ? "right-0" : "left-0"} bg-white px-3.5 py-2.5 text-[12px] leading-relaxed text-ink shadow-xl transition-opacity duration-150 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      >
        {text}
      </span>
    </span>
  )
}
