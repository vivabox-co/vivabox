// Files and warm-up for the 3D box. Kept out of Box3DViewer so the carousel can prefetch
// without pulling the 3D code into the initial bundle.

export const BOX3D_GLB_DESKTOP = "/3d/vivabox_box.glb"
export const BOX3D_GLB_MOBILE = "/3d/vivabox_box_mobile.glb"
export const BOX3D_ENV = "/3d/env_studio.hdr"
export const BOX3D_MOBILE_QUERY = "(max-width: 767px)"

let started = false

// Milliseconds since page load for each prefetch step, read by the ?debug3d overlay.
export const prefetchMarks: Record<string, number> = {}
const mark = (label: string) => {
  prefetchMarks[label] = Math.round(performance.now())
}

// Downloads the 3D engine, the viewer chunk, the model and the lighting in the background
// so "Ver en 3D" opens almost instantly. Skipped on data-saver and slow connections, where
// the 3D still loads on click like before. Safe to call many times.
export function prefetchBox3D() {
  if (started || typeof window === "undefined") return
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  if (conn?.saveData || (conn?.effectiveType && conn.effectiveType !== "4g")) {
    mark(`prefetch ignoré (${conn.saveData ? "économie de données" : conn.effectiveType})`)
    return
  }
  started = true

  mark("prefetch planifié")
  const run = () => {
    mark("prefetch démarré")
    const glb = window.matchMedia(BOX3D_MOBILE_QUERY).matches ? BOX3D_GLB_MOBILE : BOX3D_GLB_DESKTOP
    void import("./Box3DViewer").then(() => mark("prefetch composant prêt"))
    void import("@google/model-viewer").then(() => mark("prefetch moteur prêt"))
    void fetch(glb, { priority: "low" } as RequestInit).then(() => mark("prefetch modèle prêt")).catch(() => {})
    void fetch(BOX3D_ENV, { priority: "low" } as RequestInit).then(() => mark("prefetch éclairage prêt")).catch(() => {})
  }
  if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 4000 })
  else setTimeout(run, 1500)
}
