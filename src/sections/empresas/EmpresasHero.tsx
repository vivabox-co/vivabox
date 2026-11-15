import EmpresasHeroInfographic from "./EmpresasHeroInfographic";

export default function EmpresasHero() {
  return (
    <section className="vb-dark relative w-full overflow-hidden bg-ink">
      <div className="max-w-[1320px] mx-auto px-6 pt-28 pb-8 md:pt-24 md:pb-10">
        {/* Phones: text centered, then the boxes. md+: text on the left, boxes on the right. */}
        <div className="grid items-center gap-8 md:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:grid-cols-[minmax(0,430px)_minmax(0,1fr)] md:gap-6 lg:gap-8">
          <div className="text-white max-w-[640px] mx-auto text-center md:mx-0 md:text-left">
            <p className="text-white/70 text-[13px] uppercase tracking-[0.14em] mb-5">
              Vivabox Empresas
            </p>

            <h1 className="text-[40px] sm:text-[48px] md:text-[34px] lg:text-[40px] leading-[1.05] font-semibold tracking-[-0.02em] mb-6">
              Regalos corporativos<br />sin complicaciones
            </h1>

            <p className="text-[17px] md:text-[19px] leading-relaxed text-white/90 mb-10">
              La empresa regala una Vivabox.<br />
              Cada persona elige la experiencia que más le guste.<br />
              Nosotros gestionamos las reservas.
            </p>

            <div className="flex items-center gap-4 justify-center md:justify-start">
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

          <EmpresasHeroInfographic />
        </div>
      </div>
    </section>
  );
}
