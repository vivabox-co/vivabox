"use client"

import { useEffect, useRef, useState } from "react"

// Scales its content to the exact font-size that fills the container width
// on a single line — measured live, so it always fits regardless of glyph
// metrics (colored per-letter spans break normal kerning estimates).
export default function FitLine({
  children,
  min,
  max,
  className = "",
  onFontSize,
}: {
  children: React.ReactNode
  min: number
  max: number
  className?: string
  onFontSize?: (size: number) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [fontSize, setFontSize] = useState(max)

  useEffect(() => {
    const container = containerRef.current
    const text = textRef.current
    if (!container || !text) return

    const measureAt = (size: number) => {
      text.style.fontSize = `${size}px`
      return text.scrollWidth
    }

    const fit = () => {
      const containerWidth = container.clientWidth
      if (containerWidth === 0) return

      const naturalWidth = measureAt(max)
      if (naturalWidth === 0) return
      let size = Math.min(max, Math.max(min, max * (containerWidth / naturalWidth)))

      // Re-measure at the computed size and correct any residual mismatch
      // (font metrics can shift slightly between sizes, especially right
      // after a web font swaps in), so the line never overflows its box.
      const measuredWidth = measureAt(size)
      if (measuredWidth > 0) {
        size = Math.min(max, Math.max(min, size * (containerWidth / measuredWidth)))
      }

      setFontSize(size)
      onFontSize?.(size)
    }

    fit()
    document.fonts?.ready.then(fit)
    const ro = new ResizeObserver(fit)
    ro.observe(container)
    return () => ro.disconnect()
  }, [min, max, onFontSize])

  return (
    <div ref={containerRef} className="w-full">
      <span
        ref={textRef}
        className={`inline-block whitespace-nowrap ${className}`}
        style={{ fontSize }}
      >
        {children}
      </span>
    </div>
  )
}
