import Reveal from "@/components/ui/Reveal";

export default function StoryColombia() {
  return (
    <section className="vb-dark bg-ink py-24 md:py-[140px]">

      <div className="max-w-[600px] mx-auto px-6">

        <Reveal duration={400}>
          <h2 className="h2 text-white mb-10 text-center">
            ¿Por qué Colombia?
          </h2>
        </Reveal>

        <Reveal duration={400} delay={80}>
          <div>
            <p className="text-white/70 leading-relaxed mb-4">
              Llevamos años viviendo y trabajando en Colombia, en el mundo
              del turismo y las experiencias. Hemos visto crecer la oferta:
              cada vez hay más operadores buenos y más planes que vale la
              pena descubrir.
            </p>

            <p className="text-white/70 leading-relaxed mb-4">
              Pero más opciones no siempre significan más claridad. Para
              alguien que quiere regalar una experiencia, el reto ya no es
              encontrarlas: es saber cuáles realmente valen la pena.
            </p>

            <p className="text-white/70 leading-relaxed">
              Venimos de trabajar con viajeros internacionales, donde los
              estándares de servicio y calidad son exigentes. Eso nos enseñó
              a mirar los detalles: quién está detrás de cada experiencia y
              qué puede salir mal.
            </p>
          </div>
        </Reveal>

        <Reveal duration={400} delay={160}>
          <p className="text-xl md:text-2xl font-semibold leading-snug my-12 md:my-16 max-w-[420px] mx-auto text-center">
            <span className="text-white">
              Por eso Vivabox no busca simplemente reunir muchas experiencias.
            </span>{" "}
            <span className="text-primary">Las seleccionamos.</span>
          </p>
        </Reveal>

        <Reveal duration={400} delay={220}>
          <p className="text-white/70 leading-relaxed">
            Buscamos proveedores confiables y experiencias que de verdad nos
            darían ganas de regalar — y después las convertimos en algo
            fácil de elegir.
          </p>
        </Reveal>

      </div>

    </section>
  );
}
