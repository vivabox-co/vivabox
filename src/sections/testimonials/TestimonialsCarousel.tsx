"use client";

import { useRef } from "react";
import { Star } from "lucide-react";

export type Testimonial = {
  id: string;
  name: string;
  rating: number;
  text: string;
};

// El carrusel infinito solo tiene sentido con suficientes tarjetas para
// llenar el ancho; con pocas reseñas se muestran fijas y centradas.
const LOOP_MIN = 4;

export default function TestimonialsCarousel({
  reviews,
}: {
  reviews: Testimonial[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const loop = reviews.length >= LOOP_MIN;
  const items = loop ? [...reviews, ...reviews] : reviews;

  function handleScroll() {
    const el = scrollRef.current;
    if (!el || !loop) return;

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
          className={`flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1 ${
            loop ? "" : "md:justify-center"
          }`}
        >
          {items.map((t, i) => (
            <div
              key={`${t.id}-${i}`}
              className="min-w-[280px] md:min-w-[320px] max-w-[360px] bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition"
            >
              {/* header */}
              <div className="flex items-center flex-wrap gap-3 text-sm mb-2">
                <div className="flex items-center gap-[2px] text-primary">
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star key={s} size={14} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>

                <span className="font-medium">{t.name}</span>
              </div>

              {/* text */}
              <p className="text-muted text-sm leading-relaxed whitespace-pre-line">
                “{t.text}”
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
