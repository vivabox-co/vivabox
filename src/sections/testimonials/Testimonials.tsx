"use client";

import { useRef } from "react";
import { Utensils, Sparkles, Mountain, Star } from "lucide-react";
import Image from "next/image";

export default function Testimonials() {

  const scrollRef = useRef<HTMLDivElement>(null);

  const testimonials = [
    {
      type: "experience",
      name: "Camila",
      city: "Bogotá",
      label: "Brunch para dos",
      icon: Utensils,
      text: "Fue el mejor regalo de cumpleaños. Pudimos elegir la experiencia y todo fue muy fácil."
    },
    {
      type: "gift",
      name: "Andrés",
      city: "Bogotá",
      label: "Vivabox",
      text: "Se la regalé a mis padres y les encantó poder elegir la experiencia."
    },
    {
      type: "experience",
      name: "Mariana",
      city: "Chía",
      label: "Parapente",
      icon: Mountain,
      text: "Una experiencia increíble. Nunca había hecho algo así."
    },
    {
      type: "gift",
      name: "Natalia",
      city: "Bogotá",
      label: "Vivabox",
      text: "Quería un regalo diferente y fue perfecto."
    },
    {
      type: "experience",
      name: "Daniel",
      city: "Bogotá",
      label: "Spa relajante",
      icon: Sparkles,
      text: "La activación fue muy simple y la experiencia espectacular."
    },
    {
      type: "gift",
      name: "Carlos",
      city: "Chía",
      label: "Vivabox",
      text: "Fue un regalo muy original y fácil de entregar."
    },
    {
      type: "experience",
      name: "Valentina",
      city: "Bogotá",
      label: "Cena romántica",
      icon: Utensils,
      text: "Nos encantó poder elegir entre varias experiencias."
    },
    {
      type: "gift",
      name: "Paula",
      city: "Bogotá",
      label: "Vivabox",
      text: "Un regalo elegante y diferente."
    },
    {
      type: "experience",
      name: "Santiago",
      city: "Bogotá",
      label: "Cata de café",
      icon: Utensils,
      text: "Una experiencia muy diferente y muy bien organizada."
    },
    {
      type: "gift",
      name: "Laura",
      city: "Chía",
      label: "Vivabox",
      text: "Un regalo fácil de ofrecer y que siempre sorprende."
    }
  ];

  const duplicated = [...testimonials, ...testimonials];

  function handleScroll() {

    const el = scrollRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth / 2;

    if (el.scrollLeft >= maxScroll) {
      el.scrollLeft = el.scrollLeft - maxScroll;
    }

    if (el.scrollLeft <= 0) {
      el.scrollLeft = maxScroll;
    }
  }

  return (
    <section className="bg-surface py-16 md:py-20">

      <div className="max-w-6xl mx-auto px-6">

        <h2 className="h2 text-center mb-6">
          Lo que dicen quienes ya vivieron Vivabox
        </h2>

        <div
  ref={scrollRef}
  onScroll={handleScroll}
  className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1"
>

          {duplicated.map((t, i) => {

            const Icon = t.icon;

            return (

              <div
                key={i}
                className="min-w-[280px] md:min-w-[320px] bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition"
              >

                {/* header */}

                <div className="flex items-center flex-wrap gap-3 text-sm mb-2">

                  <div className="flex items-center gap-[2px] text-primary">
  {Array.from({ length: 5 }).map((_, i) => (
    <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
  ))}
</div>

                  {t.type === "experience" && Icon && (
                    <div className="flex items-center gap-1 text-primary">
                      <Icon size={14} strokeWidth={1.5} />
                      {t.label}
                    </div>
                  )}

                  {t.type === "gift" && (
                    <div className="flex items-center gap-1 text-primary">

                      <Image
                        src="/icons/logo.webp"
                        alt="Vivabox"
                        width={14}
                        height={14}
                      />

                      {t.label}

                    </div>
                  )}

                  <span className="font-medium">
                    {t.name} – {t.city}
                  </span>

                </div>

                {/* text */}

                <p className="text-muted text-sm leading-relaxed">
                  “{t.text}”
                </p>

              </div>

            );

          })}

        </div>

      </div>

    </section>
  );
}