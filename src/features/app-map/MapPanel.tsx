"use client"

import dynamic from "next/dynamic"
import type { MapExperience } from "./config"
import type { AppChromeVariant } from "./AppChrome"

// Leaflet touches `window` on import, so the map only ever loads in the browser.
// The panel fills whatever positioned container it is placed in.
const MapPanelInner = dynamic(() => import("./MapPanelInner"), {
  ssr: false,
  loading: () => <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "#f4f1ea" }} />,
})

export default function MapPanel({
  experiences,
  immediate = false,
  appUI,
  preview = false,
}: {
  experiences: MapExperience[]
  immediate?: boolean
  appUI?: AppChromeVariant
  preview?: boolean
}) {
  return <MapPanelInner experiences={experiences} immediate={immediate} appUI={appUI} preview={preview} />
}
