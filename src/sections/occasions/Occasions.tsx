"use client";

import { useState } from "react";
import Image from "next/image";

const CARD_IMAGE_SIZES = "(min-width: 1280px) 16vw, (min-width: 640px) 260px, 60vw";

export default function Occasions() {

  const [revealed, setRevealed] = useState<string | null>(null);

  const occasions = [
    {
      name: "Cumpleaños",
      subtitle: "Sorpréndelo con algo que recordará.",
      image: "/images/occasions/regalo-cumpleanos-vivabox.webp",
      alt: "Mujer soplando las velas de una torta de cumpleaños",
      ariaLabel: "Regalo de cumpleaños",
    },
    {
      name: "Aniversario",
      subtitle: "Un momento para compartir juntos.",
      image: "/images/occasions/regalo-aniversario-pareja-vivabox.webp",
      alt: "Pareja abrazada celebrando su aniversario",
      ariaLabel: "Regalo de aniversario",
    },
    {
      name: "Agradecimiento",
      subtitle: "La mejor forma de decir gracias.",
      image: "/images/occasions/regalo-agradecimiento-vivabox.webp",
      alt: "Dos amigas conversando y agradeciendo un momento juntas",
      ariaLabel: "Regalo de agradecimiento",
    },
    {
      name: "Matrimonio",
      subtitle: "Un regalo para disfrutar en pareja.",
      image: "/images/occasions/regalo-matrimonio-vivabox.webp",
      alt: "Invitados brindando en una celebración de matrimonio",
      ariaLabel: "Regalo de matrimonio",
    },
    {
      name: "Para dos",
      subtitle: "Tiempo de calidad para compartir.",
      image: "/images/occasions/regalo-experiencia-pareja-vivabox.webp",
      alt: "Pareja celebrando un momento especial juntos",
      ariaLabel: "Regalo para parejas",
    },
    {
      name: "Empresas",
      subtitle: "Cada persona elige su experiencia.",
      image: "/images/occasions/regalo-corporativo-vivabox-equipo.webp",
      alt: "Equipo de trabajo mostrando una caja Vivabox en la oficina",
      ariaLabel: "Regalos empresariales",
    },
  ];

  return (
    <section className="vb-dark bg-ink py-12 md:py-14">

      <div className="max-w-6xl mx-auto px-6 mb-6 md:mb-8">

        <h2 className="h2 text-white text-center">
          ¿Para qué ocasión regalar una Vivabox?
        </h2>

      </div>

      {/* CAROUSEL on mobile/tablet — first card fully visible, next peeks in to invite swiping. Grid from lg up, where horizontal scroll has no discoverable affordance with a mouse */}

      <div className="max-w-6xl mx-auto">

        <div className="flex gap-4 md:gap-5 overflow-x-auto px-6 pb-2 no-scrollbar snap-x snap-mandatory scroll-smooth lg:grid lg:grid-cols-3 xl:grid-cols-6 lg:overflow-visible lg:px-6 lg:pb-0">

          {occasions.map((item) => (

            <div
              key={item.name}
              role="button"
              tabIndex={0}
              onClick={() => setRevealed((current) => (current === item.name ? null : item.name))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setRevealed((current) => (current === item.name ? null : item.name));
                }
              }}
              className="vb-card group relative shrink-0 w-[60vw] sm:w-[260px] lg:w-auto aspect-[3/4.3] overflow-hidden snap-start cursor-pointer"
              aria-label={item.ariaLabel}
            >

              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes={CARD_IMAGE_SIZES}
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />

              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">

                <h3 className="text-white text-[16px] md:text-[22px] font-semibold leading-tight truncate [text-shadow:0_1px_4px_rgba(0,0,0,.85)]">
                  {item.name}
                </h3>

                <p
                  className={`text-white/90 text-[14px] md:text-[16px] font-normal leading-snug line-clamp-2 [text-shadow:0_1px_4px_rgba(0,0,0,.85)] overflow-hidden transition-all duration-300 ease-out ${
                    revealed === item.name
                      ? "max-h-12 opacity-100 mt-1"
                      : "max-h-0 opacity-0 mt-0 lg:group-hover:max-h-12 lg:group-hover:opacity-100 lg:group-hover:mt-1"
                  }`}
                >
                  {item.subtitle}
                </p>

              </div>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}
