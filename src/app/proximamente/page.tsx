import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Vivabox — Muy pronto",
  description: "El lanzamiento oficial de Vivabox está por llegar.",
};

function resolveNext(next: string | undefined) {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/";
}

export default async function ProximamentePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextHref = resolveNext(next);

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 py-16 overflow-hidden">

      {/* BACKGROUND PHOTO */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero/hero2.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover scale-105 blur-md"
        />
        <div className="absolute inset-0 bg-ink/45" />
      </div>

      {/* CARD */}
      <section
        className="modal-glass relative z-10 w-full max-w-md rounded-[26px] px-8 py-12 text-center"
      >

        {/* LOGO */}
        <Link href="/" className="inline-flex flex-col items-center group">
          <Image
            src="/icons/logo.png"
            alt="Vivabox"
            width={78}
            height={78}
            priority
            className="transition group-hover:scale-105"
          />
          <Image
            src="/icons/vivabox.png"
            alt="Vivabox"
            width={190}
            height={43}
            priority
            className="mt-2"
          />
        </Link>

        {/* HEADLINE */}
        <h1 className="mt-10 text-[28px] md:text-[32px] font-bold text-ink leading-[1.15] tracking-tight">
          Muy pronto podrás regalar experiencias con Vivab
          <Link href={nextHref} className="text-inherit no-underline">
            o
          </Link>
          x.
        </h1>

        {/* SUBTITLE */}
        <p className="mt-4 text-muted text-[15px] leading-relaxed">
          Estamos preparando los últimos detalles para ofrecerte una
          experiencia sencilla, confiable y memorable desde el primer regalo.
        </p>

        {/* STATUS */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/80">
            Próximamente
          </span>
        </div>

        {/* ACTIONS */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="/"
            className="vb-btn-soft w-full h-[54px] text-[16px]"
          >
            Seguir explorando
          </Link>

          <a
            href="https://wa.me/573142590291?text=Hola!%20Quiero%20saber%20cu%C3%A1ndo%20se%20lanza%20Vivabox."
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted text-[13px] underline underline-offset-4 hover:text-foreground transition"
          >
            ¿Te podemos ayudar? Hablemos por WhatsApp.
          </a>
        </div>

      </section>
    </main>
  );
}
