"use client"

import { useEffect, useRef, useState } from "react"
import { Heart, HelpCircle, List, Locate, Map as MapIcon, type LucideIcon } from "lucide-react"
import { categoryColors, categoryLabel, categoryOrder, type MapCategory } from "./config"

// The beneficiary app's map chrome (top bar with Filtros + category pills + logo,
// locate/help buttons, bottom tabs). Only the category pills work; every other
// button shows a small tooltip saying it lives in the app.

export type AppChromeVariant = "portrait" | "landscape"

const DARK = "#152F40"
const TIP_TEXT = "Disponible en la app Vivabox"

type TipAlign = "start" | "center" | "end"
type TipSide = "below" | "above" | "left" | "right"

// Gap between the floating bottom tab pill and the phone screen edge (portrait).
const NAV_MARGIN = 10

// Offsets (real phone pixels) the map needs so popups and attribution clear the chrome.
export const CHROME_LAYOUT = {
  portrait: { barTop: 58, navHeight: 64, popupTop: 184, popupBottom: 86, attributionBottom: 80, hintBottom: 100 },
  // Landscape has no bottom bar: the tabs sit in a vertical rail on the left.
  landscape: { barTop: 12, navHeight: 0, popupTop: 76, popupBottom: 16, attributionBottom: 12, hintBottom: 16 },
} as const

function LockedButton({
  id,
  openId,
  onOpen,
  tipSide = "below",
  tipAlign = "center",
  style,
  label,
  children,
}: {
  id: string
  openId: string | null
  onOpen: (id: string) => void
  tipSide?: TipSide
  tipAlign?: TipAlign
  style?: React.CSSProperties
  label: string
  children: React.ReactNode
}) {
  const open = openId === id

  const tipPosition: React.CSSProperties =
    tipSide === "left"
      ? { right: "calc(100% + 10px)", top: "50%", transform: "translateY(-50%)" }
      : tipSide === "right"
      ? { left: "calc(100% + 10px)", top: "50%", transform: "translateY(-50%)" }
      : {
          ...(tipSide === "below" ? { top: "calc(100% + 10px)" } : { bottom: "calc(100% + 10px)" }),
          ...(tipAlign === "start" ? { left: 0 } : tipAlign === "end" ? { right: 0 } : { left: "50%", transform: "translateX(-50%)" }),
        }

  return (
    <span style={{ position: "relative", display: "inline-flex", pointerEvents: "auto" }}>
      <button
        type="button"
        aria-label={`${label}. ${TIP_TEXT}`}
        onClick={() => onOpen(id)}
        style={{ border: "none", cursor: "pointer", font: "inherit", ...style }}
      >
        {children}
      </button>
      {open && (
        <span
          role="status"
          style={{
            position: "absolute",
            zIndex: 5,
            whiteSpace: "nowrap",
            background: "#18140F",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            lineHeight: 1,
            padding: "8px 11px",
            borderRadius: 10,
            boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
            pointerEvents: "none",
            ...tipPosition,
          }}
        >
          {TIP_TEXT}
        </span>
      )}
    </span>
  )
}

export default function AppChrome({
  variant,
  activeCategories,
  onToggleCategory,
}: {
  variant: AppChromeVariant
  activeCategories: MapCategory[]
  onToggleCategory: (category: MapCategory) => void
}) {
  const landscape = variant === "landscape"
  const layout = CHROME_LAYOUT[variant]
  const [openId, setOpenId] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const open = (id: string) => {
    setOpenId(id)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpenId(null), 2200)
  }

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  const pill = (category: MapCategory) => (
    <button
      key={category}
      type="button"
      aria-pressed={activeCategories.includes(category)}
      onClick={() => onToggleCategory(category)}
      style={{
        pointerEvents: "auto",
        background: categoryColors[category],
        color: "#fff",
        border: "none",
        fontWeight: 700,
        lineHeight: 1,
        fontSize: landscape ? 13 : 11,
        padding: landscape ? "8px 12px" : "5px 9px",
        borderRadius: 999,
        boxShadow: "0 3px 10px rgba(0,0,0,0.18)",
        opacity: activeCategories.includes(category) ? 1 : 0.28,
        whiteSpace: "nowrap",
        cursor: "pointer",
        transition: "opacity .2s ease",
      }}
    >
      {category === "gastro" ? "Gastro" : categoryLabel(category)}
    </button>
  )

  const roundButton = (size: number): React.CSSProperties => ({
    width: size,
    height: size,
    borderRadius: "50%",
    background: "#fff",
    color: "#111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
    padding: 0,
  })

  const tabs: { id: string; label: string; Icon: LucideIcon; active: boolean; align: TipAlign }[] = [
    { id: "mapa", label: "Mapa", Icon: MapIcon, active: true, align: "center" },
    { id: "lista", label: "Lista", Icon: List, active: false, align: "center" },
    { id: "favoritos", label: "Favoritos", Icon: Heart, active: false, align: "end" },
  ]

  return (
    <>
      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: layout.barTop,
          left: landscape ? 70 : 10,
          right: landscape ? 14 : 10,
          zIndex: 1210,
          background: "#fff",
          borderRadius: 26,
          padding: landscape ? "8px 12px" : "10px 12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
          display: "flex",
          alignItems: "center",
          gap: landscape ? 12 : 8,
          pointerEvents: "none",
        }}
      >
        <LockedButton
          id="filtros"
          label="Filtros"
          openId={openId}
          onOpen={open}
          tipAlign="start"
          style={{
            background: DARK,
            color: "#fff",
            fontWeight: 700,
            fontSize: landscape ? 14 : 13,
            padding: landscape ? "10px 16px" : "9px 11px",
            borderRadius: 999,
            boxShadow: "0 5px 12px rgba(0,0,0,0.25)",
          }}
        >
          Filtros
        </LockedButton>

        <div style={{ flex: 1, display: "flex", flexWrap: landscape ? "nowrap" : "wrap", justifyContent: "center", gap: landscape ? 8 : 6 }}>
          {categoryOrder.map(pill)}
        </div>

        <LockedButton
          id="logo"
          label="Logo Vivabox"
          openId={openId}
          onOpen={open}
          tipAlign="end"
          style={{ background: "transparent", padding: 0, display: "flex" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/app-logo.svg" alt="" width={44} height={40} style={{ display: "block" }} />
        </LockedButton>
      </div>

      {/* Locate + help */}
      <div
        style={{
          position: "absolute",
          right: 14,
          bottom: layout.navHeight + (landscape ? 0 : NAV_MARGIN) + 16,
          zIndex: 1200,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 12,
          pointerEvents: "none",
        }}
      >
        <LockedButton id="locate" label="Ver mi ubicación" openId={openId} onOpen={open} tipSide="left" style={roundButton(46)}>
          <Locate size={22} aria-hidden="true" />
        </LockedButton>
        <LockedButton id="help" label="Ayuda" openId={openId} onOpen={open} tipSide="left" style={roundButton(42)}>
          <HelpCircle size={22} aria-hidden="true" />
        </LockedButton>
      </div>

      {/* Tabs: bottom bar in portrait, vertical rail on the left in landscape */}
      <div
        style={
          landscape
            ? {
                position: "absolute",
                left: 70,
                top: 84,
                width: 76,
                zIndex: 1200,
                background: "#fff",
                borderRadius: 24,
                boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                gap: 6,
                padding: 8,
                pointerEvents: "none",
              }
            : {
                position: "absolute",
                left: NAV_MARGIN,
                right: NAV_MARGIN,
                bottom: NAV_MARGIN,
                height: layout.navHeight,
                zIndex: 1200,
                background: "#fff",
                borderRadius: 999,
                boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "0 6px",
                pointerEvents: "none",
              }
        }
      >
        {tabs.map(({ id, label, Icon, active, align }) => {
          const content = (
            <>
              <Icon size={22} aria-hidden="true" />
              <span>{label}</span>
            </>
          )
          const style: React.CSSProperties = {
            width: "100%",
            height: landscape ? 60 : layout.navHeight - 12,
            borderRadius: 999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            fontSize: 12,
            fontWeight: active ? 600 : 400,
            background: active ? DARK : "transparent",
            color: active ? "#fff" : "#a8998c",
          }
          return (
            <div key={id} style={{ flex: 1, display: "flex", justifyContent: "center", pointerEvents: "auto" }}>
              {active ? (
                <span style={style}>{content}</span>
              ) : (
                <LockedButton id={id} label={label} openId={openId} onOpen={open} tipSide={landscape ? "right" : "above"} tipAlign={align} style={style}>
                  {content}
                </LockedButton>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
