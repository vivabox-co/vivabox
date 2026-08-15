"use client"

import { useEffect } from "react"

// Last line of defense: fires only when the root layout itself fails to
// render, so it replaces <html>/<body> entirely and must not depend on
// globals.css, next/font, next/image or any provider from the app tree —
// any of those could be what broke in the first place. Brand colors are
// hardcoded inline so the page still reads as Vivabox either way.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="es">
      <body style={{ margin: 0, background: "#FAF7F2", color: "#1C1C1C", fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif" }}>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          <div style={{ maxWidth: 420, width: "100%" }}>
            <p style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.04em", color: "#FF8406", marginBottom: 16, textTransform: "uppercase" }}>
              Vivabox
            </p>

            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#18140F", lineHeight: 1.25, margin: 0 }}>
              Ups, algo no salió como esperábamos.
            </h1>

            <p style={{ marginTop: 12, fontSize: 15, color: "#6B6B6B", lineHeight: 1.6 }}>
              Intenta de nuevo o vuelve al inicio.
            </p>

            <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
              <button
                onClick={() => reset()}
                style={{
                  width: "100%",
                  height: 52,
                  borderRadius: 18,
                  border: "none",
                  background: "linear-gradient(135deg, #FF8406 0%, #F0611E 100%)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                  boxSizing: "border-box",
                }}
              >
                Intentar de nuevo
              </button>

              <a
                href="/"
                style={{
                  width: "100%",
                  height: 52,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 18,
                  border: "1.5px solid rgba(254,132,47,0.35)",
                  color: "#FF8406",
                  fontWeight: 600,
                  fontSize: 16,
                  textDecoration: "none",
                  boxSizing: "border-box",
                }}
              >
                Volver al inicio
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
