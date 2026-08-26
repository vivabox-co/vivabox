"use client";

import Image from "next/image";
import { Snowflake, Award, Handshake } from "lucide-react";

const CARD_IMAGE_SIZES = "(min-width: 1280px) 22vw, (min-width: 640px) 300px, 78vw";

const CASES = [
  {
    kind: "photo" as const,
    title: "Empleados",
    items: ["Cumpleaños", "Reconocimientos", "Incentivos"],
    image: "/images/occasions/regalo-cumpleanos-vivabox.webp",
    ariaLabel: "Vivabox para empleados",
  },
  {
    kind: "photo" as const,
    title: "Clientes",
    items: ["Agradecimientos", "Fidelización", "Cierre de proyectos"],
    image: "/images/occasions/regalo-corporativo-vivabox-equipo.webp",
    ariaLabel: "Vivabox para clientes",
  },
  {
    kind: "photo" as const,
    title: "Eventos",
    items: ["Conferencias", "Lanzamientos", "Activaciones"],
    image: "/images/occasions/regalo-celebracion-vivabox.webp",
    ariaLabel: "Vivabox para eventos",
  },
  {
    kind: "photo" as const,
    title: "Bienvenida",
    items: ["Nuevos ingresos", "Primer día", "Onboarding"],
    image: "/images/occasions/regalo-sorpresa-vivabox.webp",
    ariaLabel: "Vivabox de bienvenida",
  },
  {
    kind: "color" as const,
    title: "Proveedores",
    items: ["Alianzas", "Cierre de negociación", "Agradecimiento"],
    color: "#0294D2",
    icon: Handshake,
    ariaLabel: "Vivabox para proveedores y aliados",
  },
  {
    kind: "color" as const,
    title: "Fin de año",
    items: ["Novenas", "Cierre de año", "Regalo navideño"],
    color: "#CB2033",
    icon: Snowflake,
    ariaLabel: "Vivabox de fin de año",
  },
  {
    kind: "color" as const,
    title: "Aniversario",
    items: ["Hitos de la empresa", "Celebración de equipo"],
    color: "#8DB92F",
    icon: Award,
    ariaLabel: "Vivabox de aniversario de empresa",
  },
] as const;

export default function EmpresasUseCases() {
  return (
    <section className="vb-surface-base py-14 md:py-20">

      <div className="max-w-6xl mx-auto px-6 mb-8 md:mb-10">
        <h2 className="text-3xl md:text-4xl font-semibold text-center tracking-[-0.01em]">
          Ideal para
        </h2>
      </div>

      {/* CAROUSEL at every breakpoint — 7 items don't split evenly into a grid, so the peeking edge card stays the scroll affordance instead of switching to a grid on desktop */}

      <div className="max-w-6xl mx-auto">

        <div className="flex gap-4 md:gap-5 overflow-x-auto px-6 pb-2 no-scrollbar snap-x snap-mandatory scroll-smooth">

          {CASES.map((item) => (

            <div
              key={item.title}
              className="vb-card group relative shrink-0 w-[78vw] sm:w-[300px] lg:w-[270px] aspect-[3/4.3] overflow-hidden snap-start"
              aria-label={item.ariaLabel}
            >

              {item.kind === "photo" ? (
                <>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes={CARD_IMAGE_SIZES}
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </>
              ) : (
                <>
                  <div
                    className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    style={{
                      background: `linear-gradient(160deg, ${item.color}, ${item.color}CC)`,
                    }}
                  />
                  <item.icon
                    size={120}
                    strokeWidth={1}
                    className="absolute -right-4 -top-4 text-white/15"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
                </>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">

                <h3 className="text-white text-[22px] md:text-[24px] font-semibold leading-tight mb-2 [text-shadow:0_2px_12px_rgba(0,0,0,.25)]">
                  {item.title}
                </h3>

                <ul className="space-y-0.5">
                  {item.items.map((li) => (
                    <li
                      key={li}
                      className="text-white/85 text-[13px] md:text-[14px] [text-shadow:0_1px_8px_rgba(0,0,0,.3)]"
                    >
                      {li}
                    </li>
                  ))}
                </ul>

              </div>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}
