import Image from "next/image";
import BrandDots from "@/components/ui/BrandDots";
import Reveal from "@/components/ui/Reveal";

const FOUNDERS = [
  {
    name: "Gotie",
    photo: "/images/founders/Gotie.webp",
    ring: "var(--color-accent-green)",
    paragraphs: [
      "Para mí, el mejor regalo siempre ha sido una buena historia que contar.",
      "Me gusta preguntarle a la gente qué fue lo último que la sorprendió, y me quedo pensando en la respuesta.",
      "Un poco de eso buscamos en cada experiencia Vivabox: que valga la pena contarla después.",
    ],
    circlePath:
      "M50,4 C74,3 97,23 96,49 C97,76 73,97 49,96 C24,97 4,75 4,50 C3,25 26,5 50,4 Z",
  },
  {
    name: "Franko",
    photo: "/images/founders/Franko.webp",
    ring: "var(--color-primary)",
    paragraphs: [
      "Me gusta pensar en cada Vivabox como una excusa para vivir algo nuevo.",
      "Prefiero un buen plan improvisado a uno perfecto sobre el papel.",
      "Por eso disfruto tanto ver qué experiencia elige cada persona: casi nunca es la que uno esperaba.",
    ],
    circlePath:
      "M50,3 C71,2 96,19 97,50 C98,79 76,98 49,97 C23,98 3,77 3,49 C2,22 25,4 50,3 Z",
  },
] as const;

export default function StoryTeam() {
  return (
    <section className="vb-dark bg-ink py-20 md:py-[120px]">

      <div className="max-w-[840px] mx-auto px-6">

        <Reveal duration={400}>
          <BrandDots className="justify-center md:justify-start" />
        </Reveal>

        <Reveal duration={400} delay={60}>
          <h2 className="h2 text-white mb-4 text-center md:text-left">
            Quiénes somos
          </h2>
        </Reveal>

        <Reveal duration={400} delay={100}>
          <p className="text-white/70 leading-relaxed mb-12 text-center md:text-left">
            Detrás de Vivabox estamos Gotie y Franko, un equipo colombo-francés
            que creó Vivabox en Colombia.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-12 md:gap-16">

          {FOUNDERS.map((founder, index) => (
            <Reveal key={founder.name} duration={400} delay={160 + index * 100}>
              <div className="text-center sm:text-left">
                <div className="relative w-32 h-32 md:w-36 md:h-36 mx-auto sm:mx-0 mb-4">
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <Image
                      src={founder.photo}
                      alt={founder.name}
                      width={144}
                      height={144}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <svg
                    viewBox="0 0 100 100"
                    className="absolute -inset-[7%] w-[114%] h-[114%]"
                    fill="none"
                  >
                    <path
                      d={founder.circlePath}
                      style={{ stroke: founder.ring }}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <p className="font-semibold text-white mb-3">{founder.name}</p>

                <div className="space-y-3">
                  {founder.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-sm text-white/60 leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}

        </div>

      </div>

    </section>
  );
}
