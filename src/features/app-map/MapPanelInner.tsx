"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AttributionControl, MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import MarkerClusterGroup from "react-leaflet-cluster"
import Image from "next/image"
import { MapPin, Users, X } from "lucide-react"

import {
  INITIAL_CENTER,
  INITIAL_ZOOM,
  MAX_BOUNDS,
  MAX_ZOOM,
  MIN_ZOOM,
  TILE_URL,
  categoryColors,
  categoryLabel,
  categoryOrder,
  formatCount,
  type MapCategory,
  type MapExperience,
} from "./config"
import { createClusterIcon, createPinIcon } from "./createPinIcon"

import "leaflet/dist/leaflet.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"

type Props = {
  experiences: MapExperience[]
}

// `drag` covers panning, pinch/double-click zoom and keyboard; the mouse wheel
// is gated separately so scrolling the page past the map never zooms it.
function InteractionToggle({ drag, wheel }: { drag: boolean; wheel: boolean }) {
  const map = useMap()

  useEffect(() => {
    const handlers = [map.dragging, map.touchZoom, map.doubleClickZoom, map.boxZoom, map.keyboard]
    handlers.forEach((h) => (drag ? h.enable() : h.disable()))
    if (!drag) map.closePopup()
  }, [drag, map])

  useEffect(() => {
    if (wheel) map.scrollWheelZoom.enable()
    else map.scrollWheelZoom.disable()
  }, [wheel, map])

  return null
}

function ResizeFix() {
  const map = useMap()

  useEffect(() => {
    const id = setTimeout(() => map.invalidateSize(), 0)
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(map.getContainer())
    return () => {
      clearTimeout(id)
      ro.disconnect()
    }
  }, [map])

  return null
}

function PopupGallery({ photos, alt, category }: { photos: string[]; alt: string; category: MapCategory }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ x: number; left: number } | null>(null)
  const [index, setIndex] = useState(0)

  const onScroll = useCallback(() => {
    const el = trackRef.current
    if (el?.clientWidth) setIndex(Math.round(el.scrollLeft / el.clientWidth))
  }, [])

  const goTo = (i: number) => trackRef.current?.scrollTo({ left: i * trackRef.current.clientWidth, behavior: "smooth" })

  return (
    <div style={{ position: "relative", height: "var(--vb-photo-h, 120px)", borderRadius: 10, overflow: "hidden", background: "#e9e2d6" }}>
      <div
        ref={trackRef}
        onScroll={onScroll}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || !trackRef.current) return
          dragRef.current = { x: e.clientX, left: trackRef.current.scrollLeft }
          trackRef.current.style.scrollSnapType = "none"
          trackRef.current.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (dragRef.current && trackRef.current) {
            trackRef.current.scrollLeft = dragRef.current.left - (e.clientX - dragRef.current.x)
          }
        }}
        onPointerUp={() => {
          if (!dragRef.current || !trackRef.current) return
          dragRef.current = null
          trackRef.current.style.scrollSnapType = "x mandatory"
          goTo(Math.round(trackRef.current.scrollLeft / trackRef.current.clientWidth))
        }}
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          touchAction: "pan-x",
          userSelect: "none",
        }}
      >
        {photos.map((src, i) => (
          <div key={src + i} style={{ position: "relative", flex: "0 0 100%", width: "100%", height: "100%", scrollSnapAlign: "center" }}>
            <Image
              src={src}
              alt={`${alt} ${i + 1}`}
              fill
              sizes="220px"
              quality={70}
              draggable={false}
              loading={i === 0 ? "eager" : "lazy"}
              style={{ objectFit: "cover", pointerEvents: "none" }}
            />
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          padding: "4px 8px",
          fontSize: 10,
          fontWeight: 600,
          color: "#fff",
          background: categoryColors[category],
          borderRadius: 8,
          pointerEvents: "none",
        }}
      >
        {categoryLabel(category)}
      </div>

      {photos.length > 1 && (
        <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6 }}>
          {photos.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Foto ${i + 1}`}
              onClick={() => goTo(i)}
              style={{
                width: 6,
                height: 6,
                padding: 0,
                borderRadius: "50%",
                border: "none",
                background: i === index ? "#fff" : "rgba(255,255,255,0.55)",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MetaItem({ icon: Icon, text }: { icon: typeof MapPin; text: string }) {
  return (
    <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
      <Icon size={14} />
      <span>{text}</span>
    </span>
  )
}

// Same vignette as the app's map popup, minus the "Ver experiencia" button and
// the favourites heart (no booking or accounts on the website).
function ExperiencePopup({ exp }: { exp: MapExperience }) {
  return (
    <div style={{ width: "min(220px, calc(100cqw - 48px))" }}>
      <PopupGallery photos={exp.photos} alt={exp.title} category={exp.category} />
      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1c1c1c", lineHeight: 1.3 }}>{exp.title}</div>
        <div style={{ display: "flex", flexWrap: "wrap", columnGap: 12, rowGap: 4, marginTop: 4, fontSize: 12, color: "#666" }}>
          <MetaItem icon={MapPin} text={exp.city} />
          <MetaItem icon={Users} text={formatCount(exp.format)} />
        </div>
      </div>
    </div>
  )
}

export default function MapPanelInner({ experiences }: Props) {
  // Touch devices start frozen (tap to take control) so a finger scrolling the
  // page never gets trapped in the map. Mouse devices can drag right away.
  const [coarse] = useState(() => window.matchMedia("(pointer: coarse)").matches)
  const [active, setActive] = useState(!coarse)
  const [wheel, setWheel] = useState(false)
  // Mouse devices: tell the visitor the wheel needs a click first, then confirm it's on.
  const [hovering, setHovering] = useState(false)
  const [justActivated, setJustActivated] = useState(false)
  const [activeCategories, setActiveCategories] = useState<MapCategory[]>(categoryOrder)
  const frameRef = useRef<HTMLDivElement>(null)

  // Same selection logic as the app's CategoryLegend: from "all active" the
  // first tap isolates that category, then taps add or remove categories.
  const toggleCategory = (cat: MapCategory) => {
    setActiveCategories((current) => {
      if (current.length === categoryOrder.length) return [cat]
      if (current.includes(cat)) {
        const next = current.filter((c) => c !== cat)
        return next.length > 0 ? next : categoryOrder
      }
      return [...current, cat]
    })
  }

  const byCategory = useMemo(() => {
    return categoryOrder
      .filter((category) => activeCategories.includes(category))
      .map((category) => ({ category, items: experiences.filter((e) => e.category === category) }))
      .filter((g) => g.items.length > 0)
  }, [experiences, activeCategories])

  useEffect(() => {
    if (!justActivated) return
    const id = setTimeout(() => setJustActivated(false), 1600)
    return () => clearTimeout(id)
  }, [justActivated])

  // On touch devices, freeze the map again once it leaves the screen.
  useEffect(() => {
    if (!coarse) return
    const el = frameRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setActive(false)
    }, { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [coarse])

  useEffect(() => {
    if (!active || !coarse) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [active, coarse])

  return (
    <div
      ref={frameRef}
      className="vb-map-panel"
      onPointerDown={() => {
        if (coarse || wheel) return
        setWheel(true)
        setJustActivated(true)
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
        setHovering(false)
        setWheel(false)
        setJustActivated(false)
      }}
      style={{
        containerType: "size",
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        isolation: "isolate",
        background: "#f4f1ea",
      }}
    >
      <style>{`
        .vb-map-panel .leaflet-container { background: #f4f1ea; font-family: inherit; }
        .vb-map-panel .leaflet-control-attribution { font-size: 8px; opacity: .6; margin: 0; line-height: 1.2; }
        .vb-map-panel .leaflet-popup-content { margin: 12px 14px; }
        .vb-map-panel .leaflet-popup-content-wrapper { border-radius: 14px; }
        .vb-map-panel .vivabox-pin { background: none; border: none; }
      `}</style>

      <MapContainer
        center={INITIAL_CENTER}
        zoom={INITIAL_ZOOM}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        maxBounds={MAX_BOUNDS}
        maxBoundsViscosity={0.8}
        zoomControl={false}
        attributionControl={false}
        dragging={!coarse}
        touchZoom={!coarse}
        doubleClickZoom={!coarse}
        scrollWheelZoom={false}
        boxZoom={false}
        keyboard={!coarse}
        style={{ width: "100%", height: "100%" }}
      >
        <AttributionControl prefix={false} position="bottomleft" />
        <ResizeFix />
        <InteractionToggle drag={active} wheel={wheel && active} />
        <TileLayer
          url={TILE_URL}
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={MAX_ZOOM}
        />

        {byCategory.map(({ category, items }) => (
          <MarkerClusterGroup
            key={category}
            chunkedLoading
            showCoverageOnHover={false}
            maxClusterRadius={45}
            spiderfyDistanceMultiplier={2}
            iconCreateFunction={createClusterIcon(categoryColors[category])}
          >
            {items.map((exp) => (
              <Marker
                key={exp.id}
                position={[exp.lat, exp.lng]}
                alt={exp.title}
                icon={createPinIcon(categoryColors[category], exp.activityKey, exp.title)}
              >
                <Popup autoPanPaddingTopLeft={[16, window.innerWidth >= 1024 ? 64 : 72]} autoPanPaddingBottomRight={[16, window.innerWidth >= 1024 ? 16 : 24]}>
                  <ExperiencePopup exp={exp} />
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        ))}
      </MapContainer>

      {/* Category filters, same behaviour as the app's legend */}
      <div
        style={{
          position: "absolute",
          top: "var(--vb-legend-top, 8px)",
          left: 6,
          right: 6,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 4,
          zIndex: 1200,
          pointerEvents: "none",
        }}
      >
        {categoryOrder.map((category) => (
          <button
            key={category}
            type="button"
            aria-pressed={activeCategories.includes(category)}
            onClick={() => toggleCategory(category)}
            style={{
              pointerEvents: "auto",
              background: categoryColors[category],
              color: "#fff",
              border: "none",
              fontWeight: 700,
              lineHeight: 1,
              fontSize: "clamp(9px, 2.4cqw, 13px)",
              padding: "clamp(4px, 1.2cqw, 8px) clamp(6px, 2cqw, 14px)",
              borderRadius: 999,
              boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
              opacity: activeCategories.includes(category) ? 1 : 0.28,
              whiteSpace: "nowrap",
              cursor: "pointer",
              transition: "opacity .2s ease",
            }}
          >
            {category === "gastro" ? "Gastro" : categoryLabel(category)}
          </button>
        ))}
      </div>

      {/* Mouse devices: signal that the wheel zooms only after a click */}
      {!coarse && (hovering || justActivated) && (!wheel || justActivated) && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "50%",
            bottom: 26,
            transform: "translateX(-50%)",
            zIndex: 1200,
            pointerEvents: "none",
            background: wheel ? "rgba(21,47,64,0.92)" : "rgba(24,20,15,0.88)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 13,
            padding: "8px 14px",
            borderRadius: 999,
            whiteSpace: "nowrap",
            boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
          }}
        >
          {wheel ? "Zoom con la rueda activado" : "Haz clic para hacer zoom con la rueda"}
        </span>
      )}

      {/* Touch devices: tap once to take control of the map */}
      {coarse && !active && (
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label="Explorar el mapa de experiencias"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1100,
            background: "rgba(24,20,15,0.16)",
            border: "none",
            padding: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              background: "rgba(24,20,15,0.88)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 12,
              padding: "8px 14px",
              borderRadius: 999,
              boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
            }}
          >
            Toca para explorar
          </span>
        </button>
      )}

      {coarse && active && (
        <button
          type="button"
          onClick={() => setActive(false)}
          style={{
            position: "absolute",
            right: 8,
            bottom: 22,
            zIndex: 1200,
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "rgba(24,20,15,0.88)",
            color: "#fff",
            border: "none",
            fontWeight: 600,
            fontSize: 12,
            padding: "7px 12px",
            borderRadius: 999,
            cursor: "pointer",
            boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
          }}
        >
          <X size={12} aria-hidden="true" />
          Soltar mapa
        </button>
      )}
    </div>
  )
}
