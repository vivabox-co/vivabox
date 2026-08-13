import Image from "next/image";

export default function EmpresasHero() {
  return (
    <section className="vb-dark relative w-full overflow-hidden bg-ink">

      <div className="max-w-[1100px] mx-auto px-6 pt-28 pb-8 md:pt-24 md:pb-10">

        {/* TEXT */}
        <div className="text-white max-w-[640px] mx-auto text-center mb-12 md:mb-14">

          <p className="text-white/70 text-[13px] uppercase tracking-[0.14em] mb-5">
            Vivabox Empresas
          </p>

          <h1 className="text-[40px] sm:text-[48px] md:text-[56px] leading-[1.05] font-semibold tracking-[-0.02em] mb-6">
            Regalos corporativos<br />sin complicaciones
          </h1>

          <p className="text-[17px] md:text-[19px] leading-relaxed text-white/90 mb-10">
            La empresa regala una Vivabox.<br />
            Cada persona elige la experiencia que más le guste.<br />
            Nosotros gestionamos la reserva.
          </p>

          <div className="flex items-center justify-center gap-4">

            <a
              href="https://wa.me/573142590291?text=Hola%2C%20me%20gustar%C3%ADa%20conocer%20las%20opciones%20de%20Vivabox%20para%20mi%20empresa."
              target="_blank"
              rel="noopener noreferrer"
              className="vb-btn-primary whitespace-nowrap px-5 sm:px-7 py-3 text-[14px] sm:text-[16px]"
            >
              Hablar por WhatsApp
            </a>

            <a
              href="#como-funciona-empresas"
              className="whitespace-nowrap text-white text-[14px] sm:text-[16px] font-medium hover:underline"
            >
              Cómo funciona
            </a>

          </div>

        </div>

        {/* CUSTOM BOXES GRID */}
        <div className="vb-card relative w-full aspect-video overflow-hidden">
          {/*
            PENDING: grid shows real company logos (Bancolombia, Sura, Davivienda,
            Ecopetrol...) — confirm these are actual confirmed clients before
            this goes live. Swap for approved/fictional logos otherwise.
          */}
          <Image
            src="/images/empresas/boxes-corporate-grid.png"
            alt="Vivabox personalizada con el logo de distintas empresas"
            fill
            priority
            sizes="(min-width: 1100px) 1100px, 100vw"
            className="object-cover"
          />
        </div>

      </div>

    </section>
  );
}
