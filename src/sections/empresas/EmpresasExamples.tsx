import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import BrandRibbon from "@/components/ui/BrandRibbon";

// Examples only — never a promise of availability.
const EXAMPLES = [
  { name: "Gastronomía", color: "var(--color-cat-gastronomia)", title: "Taller de cacao", place: "Bogotá", slug: "taller-cata-cacao-bogota" },
  { name: "Bienestar", color: "var(--color-cat-bienestar)", title: "Spa termal", place: "La Calera", slug: "spa-termal-natural-la-calera" },
  { name: "Aventura", color: "var(--color-cat-aventura)", title: "Cabalgata", place: "La Calera", slug: "cabalgata-parrillada-la-calera" },
  { name: "Cultura", color: "var(--color-cat-cultura)", title: "Tras bambalinas", place: "Bogotá", slug: "tras-bambalinas-bogota" },
  { name: "Estancias", color: "var(--color-cat-estancias)", title: "Glamping", place: "Guatavita", slug: "carpa-glamping-embalse-guatavita" },
] as const;

const expSrc = (slug: string) => `/images/experiencias-reales/${slug}-vivabox/${slug}-vivabox-1.webp`;

export default function EmpresasExamples() {
  return (
    <section id="ejemplos-empresas" className="vb-dark bg-ink">
      <div className="max-w-6xl mx-auto px-6 py-6 md:py-7">

        <Reveal>
          <h2 className="text-2xl md:text-3xl font-semibold text-center tracking-[-0.01em] text-white mb-1">
            Ejemplos de experiencias
          </h2>
          <p className="text-white/70 text-center text-[14px] md:text-[15px] mb-4 md:mb-5">
            Esto es lo que tu equipo puede elegir.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <ul className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-5">
            {EXAMPLES.map((ex) => (
              <li
                key={ex.slug}
                className="vb-card snap-start shrink-0 w-[62%] sm:w-[34%] md:w-auto overflow-hidden !rounded-[20px]"
                style={{ borderBottom: `5px solid ${ex.color}` }}
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={expSrc(ex.slug)}
                    alt={`${ex.title}, ${ex.place}`}
                    fill
                    sizes="(min-width: 768px) 200px, 62vw"
                    className="object-cover"
                  />
                </div>
                <div className="px-3.5 py-2.5">
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-[12px] font-semibold text-white"
                    style={{ background: ex.color }}
                  >
                    {ex.name}
                  </span>
                  <p className="mt-1.5 text-[15px] font-semibold leading-tight text-white">{ex.title}</p>
                  <p className="text-[13px] text-white/60">{ex.place}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

      </div>
      <BrandRibbon />

    </section>
  );
}
