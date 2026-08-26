import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export const metadata = {
  title: "Página no encontrada — Vivabox",
  description: "Esta página no existe o cambió de lugar.",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 py-16 overflow-hidden">

      {/* BACKGROUND PHOTO — same treatment as /proximamente, so every
          "exception state" in the site shares one visual language. */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero/experiencia-vivabox-aire-libre.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover scale-105 blur-md"
        />
        <div className="absolute inset-0 bg-ink/45" />
      </div>

      {/* CARD */}
      <section className="modal-glass relative z-10 w-full max-w-md rounded-[26px] px-8 py-12 text-center">

        {/* LOGO */}
        <Link href="/" className="inline-flex flex-col items-center group">
          <Image
            src="/icons/logo.webp"
            alt="Vivabox"
            width={78}
            height={78}
            priority
            className="transition group-hover:scale-105"
          />
          <Image
            src="/icons/vivabox.webp"
            alt="Vivabox"
            width={190}
            height={43}
            priority
            className="mt-2"
          />
        </Link>

        {/* HEADLINE */}
        <h1 className="mt-10 text-[28px] md:text-[32px] font-bold text-ink leading-[1.15] tracking-tight">
          Esta página se nos perdió.
        </h1>

        {/* SUBTITLE */}
        <p className="mt-4 text-muted text-[15px] leading-relaxed">
          El enlace que abriste no existe o cambió de lugar. Tu regalo perfecto sigue aquí, a un clic.
        </p>

        {/* ACTIONS */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="/"
            className="vb-btn-primary w-full h-[54px] text-[16px]"
          >
            Volver al inicio
            <ArrowRight size={18} strokeWidth={2} className="vb-cta-icon" />
          </Link>

          <Link
            href="/#experiencias"
            className="vb-btn-soft w-full h-[54px] text-[16px]"
          >
            Ver ejemplos de experiencias
          </Link>

          <a
            href="https://wa.me/573142590291?text=Hola!%20No%20encontr%C3%A9%20lo%20que%20buscaba%20en%20Vivabox."
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted text-[13px] underline underline-offset-4 hover:text-foreground transition"
          >
            ¿Buscabas algo en particular? Escríbenos por WhatsApp.
          </a>
        </div>

      </section>
    </main>
  )
}
