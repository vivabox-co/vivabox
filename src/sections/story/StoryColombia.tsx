import BrandDots from "@/components/ui/BrandDots";
import Reveal from "@/components/ui/Reveal";

export default function StoryColombia() {
  return (
    <section className="vb-surface-base py-20 md:py-[120px]">

      <div className="max-w-[680px] mx-auto px-6">

        <Reveal duration={400}>
          <BrandDots className="justify-center mx-auto" />
        </Reveal>

        <Reveal duration={400} delay={60}>
          <h2 className="h2 mb-8 text-center">
            ¿Por qué Colombia?
          </h2>
        </Reveal>

        <Reveal duration={400} delay={100}>
          <div>
            <p className="text-muted leading-relaxed mb-4">
              Llevamos años viviendo y trabajando en Colombia, dentro del
              mundo del turismo y las experiencias. Y hemos visto cómo ha
              cambiado este sector.
            </p>

            <p className="text-muted leading-relaxed mb-4">
              Cada vez hay más personas creando experiencias increíbles, más
              operadores que elevan sus estándares y más planes que realmente
              vale la pena descubrir en Bogotá y en el resto del país.
            </p>

            <p className="text-muted leading-relaxed mb-4">
              Pero también vimos algo: cuando hay cada vez más opciones,
              elegir bien se vuelve más difícil. Para alguien que quiere
              regalar una experiencia, no basta con encontrar muchas
              opciones. Hay que saber cuáles realmente valen la pena.
            </p>

            <p className="text-muted leading-relaxed mb-8">
              Venimos de trabajar con viajeros internacionales, donde los
              estándares de servicio, organización y calidad son exigentes.
              Esa experiencia nos enseñó a mirar los detalles: quién está
              detrás de cada experiencia, cómo funciona, qué recibe realmente
              el cliente y qué puede salir mal.
            </p>

            <p className="text-lg font-semibold text-ink mb-1">
              Por eso Vivabox no busca simplemente reunir muchas experiencias.
            </p>
            <p className="text-lg font-semibold text-primary mb-6">
              Las seleccionamos.
            </p>

            <p className="text-muted leading-relaxed mb-4">
              Buscamos experiencias bien hechas, proveedores confiables y
              propuestas que realmente nos darían ganas de regalar.
            </p>

            <p className="text-muted leading-relaxed">
              Y después hacemos algo igual de importante: las convertimos en
              algo fácil de regalar.
            </p>
          </div>
        </Reveal>

      </div>

    </section>
  );
}
