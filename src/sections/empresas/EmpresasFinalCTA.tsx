import Reveal from "@/components/ui/Reveal";

export default function EmpresasFinalCTA() {
  return (
    <section className="bg-white py-10 md:py-14">

      <div className="max-w-6xl mx-auto px-6">

        <Reveal>
          <div className="bg-primary rounded-[26px] shadow-[0_20px_50px_rgba(232,73,31,0.25)] px-8 md:px-16 py-12 md:py-16 text-center">

            <h2 className="text-white text-3xl md:text-4xl font-semibold tracking-[-0.01em] mb-5 max-w-[640px] mx-auto">
              ¿Listo para sorprender a tu equipo o a tus clientes?
            </h2>

            <p className="text-white/90 text-[17px] leading-relaxed mb-10 max-w-[520px] mx-auto">
              Cuéntanos cuántas personas quieres regalar y te ayudamos a
              encontrar la mejor solución para tu empresa.
            </p>

            <a
              href="https://wa.me/573142590291?text=Hola%2C%20me%20gustar%C3%ADa%20conocer%20las%20opciones%20de%20Vivabox%20para%20mi%20empresa."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center whitespace-nowrap h-14 px-6 sm:px-10 rounded-[18px] bg-white text-primary text-[15px] sm:text-lg font-semibold hover:bg-white/90 transition shadow-lg"
            >
              Hablar por WhatsApp
            </a>

          </div>
        </Reveal>

      </div>

    </section>
  );
}
