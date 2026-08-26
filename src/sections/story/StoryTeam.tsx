import Image from "next/image";
import Reveal from "@/components/ui/Reveal";

const FOUNDERS = [
  {
    name: "Frank",
    role: "Cofundador · Experiencias, alianzas y operaciones",
    photo: "/images/founders/Franko.webp",
    ring: "var(--color-primary)",
    quote:
      "Después de tantos años trabajando con experiencias en Colombia, aprendí que la diferencia muchas veces está en los detalles que el cliente no ve.",
    bio: [
      "Frank lleva 18 años viviendo en Colombia y más de 12 años trabajando en el mundo del turismo y las experiencias, incluyendo su paso por Aventure Colombia.",
      "Su trabajo se enfoca en nuestros aliados, la calidad de las experiencias y todo lo que tiene que funcionar detrás de escena para que lo que prometemos realmente pase.",
    ],
    circlePath:
      "M50,3 C71,2 96,19 97,50 C98,79 76,98 49,97 C23,98 3,77 3,49 C2,22 25,4 50,3 Z",
  },
  {
    name: "Gotie",
    role: "Cofundador · Producto, estrategia y crecimiento",
    photo: "/images/founders/Gotie.webp",
    ring: "var(--color-accent-green)",
    quote:
      "Para mí, el reto no era crear otra forma de vender experiencias. Era hacer que regalar una buena experiencia fuera realmente sencillo.",
    bio: [
      "Gotie se enfoca en convertir la idea de Vivabox en un servicio sencillo de entender, fácil de usar y capaz de crecer.",
      "Está detrás del producto, la estrategia y la experiencia del cliente en cada etapa del proceso.",
    ],
    circlePath:
      "M50,4 C74,3 97,23 96,49 C97,76 73,97 49,96 C24,97 4,75 4,50 C3,25 26,5 50,4 Z",
  },
] as const;

export default function StoryTeam() {
  return (
    <section className="vb-dark bg-ink py-16 md:py-24">

      <div className="max-w-[880px] mx-auto px-6">

        <Reveal duration={400}>
          <h2 className="h2 text-white mb-10 md:mb-14 text-center">
            Las personas detrás de Vivabox.
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-12 md:gap-14">

          {FOUNDERS.map((founder, index) => (
            <Reveal key={founder.name} duration={400} delay={160 + index * 100}>
              <div className="text-center sm:text-left">
                <div className="relative w-28 h-28 md:w-32 md:h-32 mx-auto sm:mx-0 mb-5">
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <Image
                      src={founder.photo}
                      alt={`${founder.name}, cofundador de Vivabox`}
                      width={128}
                      height={128}
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

                <p className="font-semibold text-white">{founder.name}</p>
                <p className="text-white/50 text-sm mb-5">{founder.role}</p>

                <blockquote className="border-l-2 pl-4 mb-5" style={{ borderColor: founder.ring }}>
                  <p className="text-white text-[15px] md:text-base italic leading-relaxed">
                    &ldquo;{founder.quote}&rdquo;
                  </p>
                </blockquote>

                <div className="space-y-3">
                  {founder.bio.map((paragraph) => (
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
