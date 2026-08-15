"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import VivaboxLoader from "./VivaboxLoader"

// Next's own loading.tsx only covers server-render time, which this mostly
// static site clears in a few ms — too fast to ever see the brand loader
// complete. This overlay re-shows it on every route change and keeps it up
// for one full fill lap (matches the hold-end in globals.css), regardless
// of how fast the page underneath is actually ready.
const MIN_VISIBLE_MS = 1130

export default function RouteLoaderOverlay() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(true)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
    } else {
      setVisible(true)
    }

    const t = setTimeout(() => setVisible(false), MIN_VISIBLE_MS)
    return () => clearTimeout(t)
  }, [pathname])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center vb-surface-base">
      <VivaboxLoader size={72} />
    </div>
  )
}
