import { Archivo_Narrow, Caveat_Brush, Gloria_Hallelujah } from "next/font/google"

export const caveatBrush = Caveat_Brush({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-caveat-brush",
})

export const gloriaHallelujah = Gloria_Hallelujah({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-gloria-hallelujah",
})

// Condensed numerals for tight display numbers (e.g. the step counter in
// WhatsIncluded) — tall without going wide, unlike scaling Jakarta with
// transform which distorts stroke weight.
export const archivoNarrow = Archivo_Narrow({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-archivo-narrow",
})
