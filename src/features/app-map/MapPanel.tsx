"use client"

import dynamic from "next/dynamic"
import type { MapExperience } from "./config"

// Leaflet touches `window` on import, so the map only ever loads in the browser.
// The panel fills whatever positioned container it is placed in.
const MapPanelInner = dynamic(() => import("./MapPanelInner"), {
  ssr: false,
  loading: () => <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "#f4f1ea" }} />,
})

export default function MapPanel({ experiences }: { experiences: MapExperience[] }) {
  return <MapPanelInner experiences={experiences} />
}
