"use client"

import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, RotateCcw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Diagnostics only — never surfaced to the visitor.
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 py-16 vb-surface-base">
      <section className="modal-glass relative z-10 w-full max-w-md rounded-[26px] px-8 py-12 text-center">

        <Link href="/" className="inline-flex flex-col items-center group">
          <Image
            src="/icons/logo.webp"
            alt="Vivabox"
            width={78}
            height={78}
            className="transition group-hover:scale-105"
          />
          <Image
            src="/icons/vivabox.webp"
            alt="Vivabox"
            width={190}
            height={43}
            className="mt-2"
          />
        </Link>

        <h1 className="mt-10 text-[28px] md:text-[32px] font-bold text-ink leading-[1.15] tracking-tight">
          Ups, algo no salió como esperábamos.
        </h1>

        <p className="mt-4 text-muted text-[15px] leading-relaxed">
          Intenta de nuevo o vuelve al inicio.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <button
            onClick={() => reset()}
            className="vb-btn-primary w-full h-[54px] text-[16px]"
          >
            Intentar de nuevo
            <RotateCcw size={18} strokeWidth={2} className="vb-cta-icon" />
          </button>

          <Link
            href="/"
            className="vb-btn-soft w-full h-[54px] text-[16px]"
          >
            Volver al inicio
            <ArrowRight size={18} strokeWidth={2} />
          </Link>
        </div>

      </section>
    </main>
  )
}
