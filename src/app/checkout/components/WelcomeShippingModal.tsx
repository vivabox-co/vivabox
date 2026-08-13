"use client"

import { useEffect, useRef, useState } from "react"
import { X, Mail, CheckCircle2, Loader2 } from "lucide-react"
import { track } from "@/utils/analytics"

type Props = {
  onClose: () => void
  onSuccess: (email: string, code: string) => void
}

type Status = "form" | "submitting" | "success"

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function WelcomeShippingModal({ onClose, onSuccess }: Props) {
  const [email, setEmail] = useState("")
  const [touched, setTouched] = useState(false)
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<Status>("form")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const modalRef = useRef<HTMLDivElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  const emailError = touched && !isValidEmail(email)
  const canSubmit = isValidEmail(email) && consent && status !== "submitting"

  // ======================
  // OPEN / FOCUS / A11Y
  // ======================

  useEffect(() => {
    track("checkout_open_welcome_modal")
    emailRef.current?.focus()
  }, [])

  function handleClose() {
    track("checkout_close_modal")
    onClose()
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleClose()
        return
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, input, [href], [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ======================
  // SUBMIT
  // ======================

  async function handleSubmit() {
    if (!canSubmit) return

    setError("")
    setStatus("submitting")
    track("checkout_submit_welcome_email")

    try {
      const res = await fetch("/api/checkout/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), consent }),
      })

      const data = await res.json()

      if (!data.ok || !data.code) {
        setStatus("form")
        setError("No pudimos generar tu código. Intenta de nuevo.")
        return
      }

      setCode(data.code)
      setStatus("success")
      track("checkout_generate_shipping_code", { code: data.code })

    } catch (err) {
      console.error("WELCOME SUBMIT ERROR:", err)
      setStatus("form")
      setError("No pudimos generar tu código. Intenta de nuevo.")
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleApplyAutomatically() {
    track("checkout_apply_shipping_code", { code })
    onSuccess(email.trim(), code)
    onClose()
  }

  // ======================
  // UI
  // ======================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-overlay"
        onClick={handleClose}
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
        className="modal-glass relative w-full max-w-[420px] rounded-[24px] p-7 space-y-5 animate-modal"
      >
        <button
          onClick={handleClose}
          aria-label="Cerrar"
          className="absolute top-5 right-5 p-1 text-[#6B6B6B] transition hover:text-ink"
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        {status !== "success" ? (
          <>
            <div className="space-y-2 pr-6">
              <h2 id="welcome-modal-title" className="text-xl font-semibold tracking-tight text-ink">
                ¡Bienvenido a Vivabox!
              </h2>
              <p className="text-sm text-ink/80 leading-relaxed">
                Es tu primera compra.<br />
                Déjanos tu correo y recibe un código para envío gratis.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <input
                  ref={emailRef}
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched(true)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="vb-input"
                />
                {emailError && (
                  <p className="text-xs text-accent-red mt-1.5">Ingresa un correo válido</p>
                )}
              </div>

              <label className="flex items-start gap-2 text-sm text-[#6B6B6B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 accent-primary"
                />
                Acepto recibir comunicaciones de Vivabox.
              </label>

              {error && <p className="text-xs text-accent-red">{error}</p>}

              <p className="text-xs text-[#6B6B6B]/70 leading-relaxed">
                También recibirás inspiración, novedades y beneficios exclusivos.
                Puedes darte de baja cuando quieras.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="vb-btn-secondary w-full h-12"
              >
                {status === "submitting" ? (
                  <>
                    Enviando...
                    <Loader2 size={18} strokeWidth={2} className="animate-spin" />
                  </>
                ) : (
                  <>
                    Recibir mi código
                    <Mail size={18} strokeWidth={2} className="vb-cta-icon" />
                  </>
                )}
              </button>

              <button
                onClick={handleClose}
                className="w-full h-11 text-sm font-medium text-[#6B6B6B] transition hover:text-ink"
              >
                Ahora no
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-5 text-center">
            <div className="text-4xl">🎉</div>

            <div className="space-y-2">
              <h2 id="welcome-modal-title" className="text-xl font-semibold tracking-tight text-ink">
                ¡Listo!
              </h2>
              <p className="text-sm text-ink/80 leading-relaxed">
                Tu envío gratis ya está disponible.
              </p>
            </div>

            <div className="vb-well px-4 py-3">
              <p className="text-xs text-[#6B6B6B] mb-1">Código</p>
              <p className="text-lg font-semibold tracking-wide text-ink">{code}</p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleApplyAutomatically}
                className="vb-btn-secondary w-full h-12"
              >
                Aplicar automáticamente
                <CheckCircle2 size={18} strokeWidth={2} className="vb-cta-icon" />
              </button>

              <button
                onClick={handleCopy}
                className="vb-btn-soft w-full h-11 text-sm"
              >
                {copied ? "Copiado ✓" : "Copiar código"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
