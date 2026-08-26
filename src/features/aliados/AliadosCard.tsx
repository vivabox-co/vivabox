"use client"

import { useEffect, useRef, useState } from "react"
import { track } from "@/utils/analytics"
import Step1Form from "./Step1Form"
import Step2Form from "./Step2Form"
import SuccessState from "./SuccessState"
import { isValidEmail, isValidWhatsapp } from "./validation"
import { EMPTY_ALIADOS_FORM, type AliadosFormData } from "./types"

const TRANSITION_MS = 500

type Step = 1 | 2
type Direction = "forward" | "back"
type SubmitStatus = "idle" | "submitting" | "success" | "error"

export default function AliadosCard() {
  const [form, setForm] = useState<AliadosFormData>(EMPTY_ALIADOS_FORM)
  const [step, setStep] = useState<Step>(1)
  const [pendingStep, setPendingStep] = useState<Step | null>(null)
  const [direction, setDirection] = useState<Direction>("forward")
  const [leaving, setLeaving] = useState(false)
  const [nextMinHeight, setNextMinHeight] = useState<number | undefined>(undefined)
  const nextCardRef = useRef<HTMLDivElement>(null)

  const [step1Attempted, setStep1Attempted] = useState(false)
  const [step2Attempted, setStep2Attempted] = useState(false)
  const [status, setStatus] = useState<SubmitStatus>("idle")
  const [submitError, setSubmitError] = useState("")
  const honeypotRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    track("aliados_page_viewed")
  }, [])

  useEffect(() => {
    if (leaving && nextCardRef.current) {
      setNextMinHeight(nextCardRef.current.scrollHeight)
    } else {
      setNextMinHeight(undefined)
    }
  }, [leaving])

  function update<K extends keyof AliadosFormData>(field: K, value: AliadosFormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const step1Valid =
    !!form.name.trim() && !!form.company.trim() && isValidWhatsapp(form.whatsapp) && isValidEmail(form.email)

  const step1Errors = {
    name: step1Attempted && !form.name.trim() ? "Cuéntanos tu nombre." : undefined,
    company: step1Attempted && !form.company.trim() ? "Cuéntanos el nombre de tu empresa o marca." : undefined,
    whatsapp: step1Attempted && !isValidWhatsapp(form.whatsapp) ? "Ingresa un WhatsApp válido." : undefined,
    email: step1Attempted && !isValidEmail(form.email) ? "Ingresa un correo válido." : undefined,
  }

  const step2Valid = !!form.category && !!form.experienceName.trim() && !!form.experienceDescription.trim()

  const step2Errors = {
    category: step2Attempted && !form.category ? "Elige una categoría." : undefined,
    experienceName: step2Attempted && !form.experienceName.trim() ? "Cuéntanos cómo se llama." : undefined,
    experienceDescription:
      step2Attempted && !form.experienceDescription.trim() ? "Cuéntanos qué vive quien la disfruta." : undefined,
  }

  function goToStep(next: Step, dir: Direction) {
    if (leaving) return
    setDirection(dir)
    setPendingStep(next)
    setLeaving(true)
    window.setTimeout(() => {
      setStep(next)
      setPendingStep(null)
      setLeaving(false)
    }, TRANSITION_MS)
  }

  function handleStep1Submit() {
    setStep1Attempted(true)
    if (!step1Valid) return
    track("aliados_step1_cta_clicked")
    goToStep(2, "forward")
    track("aliados_step2_reached")
  }

  function handleBack() {
    goToStep(1, "back")
  }

  async function handleSubmit() {
    setStep2Attempted(true)
    if (!step2Valid || status === "submitting") return

    setStatus("submitting")
    setSubmitError("")
    track("aliados_form_submitted")

    try {
      const res = await fetch("/api/aliados/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          company: form.company.trim(),
          whatsapp: form.whatsapp.trim(),
          email: form.email.trim(),
          category: form.category,
          experienceName: form.experienceName.trim(),
          experienceDescription: form.experienceDescription.trim(),
          websiteOrInstagram: form.websiteOrInstagram.trim(),
          website: honeypotRef.current?.value || "",
        }),
      })

      const data = await res.json()

      if (!data.ok) {
        setStatus("error")
        setSubmitError("No pudimos enviar tu propuesta. Intenta de nuevo.")
        track("aliados_submit_failed")
        return
      }

      setStatus("success")
      track("aliados_submit_succeeded")
    } catch (err) {
      console.error("ALIADOS SUBMIT ERROR:", err)
      setStatus("error")
      setSubmitError("No pudimos enviar tu propuesta. Intenta de nuevo.")
      track("aliados_submit_failed")
    }
  }

  function renderStep(target: Step) {
    if (target === 1) {
      return <Step1Form values={form} errors={step1Errors} onChange={update} onSubmit={handleStep1Submit} />
    }

    if (status === "success") {
      return <SuccessState />
    }

    return (
      <Step2Form
        values={form}
        errors={step2Errors}
        onChange={update}
        onBack={handleBack}
        onSubmit={handleSubmit}
        submitting={status === "submitting"}
        submitError={submitError}
      />
    )
  }

  return (
    <>
      {/* Honeypot: invisible to real users/screen readers, catnip for bots
          filling every field they can see in the DOM. */}
      <input
        ref={honeypotRef}
        type="text"
        name="website_url"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
      />

      <div
        className="vb-slide-viewport"
        style={{
          "--vb-slide-duration": `${TRANSITION_MS}ms`,
          minHeight: nextMinHeight,
        } as React.CSSProperties}
      >
        <div
          className="vb-slide-current"
          style={{
            transform: leaving ? `translateX(${direction === "forward" ? "-100%" : "100%"})` : "translateX(0)",
            opacity: leaving ? 0.92 : 1,
          }}
        >
          {renderStep(step)}
        </div>

        {leaving && pendingStep && (
          <div
            className="vb-slide-next"
            ref={nextCardRef}
            aria-hidden="true"
            style={{ "--vb-slide-enter-from": direction === "forward" ? "100%" : "-100%" } as React.CSSProperties}
          >
            {renderStep(pendingStep)}
          </div>
        )}
      </div>
    </>
  )
}
