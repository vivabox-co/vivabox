"use client";

import { useState } from "react";
import { Star, ChevronDown, ExternalLink } from "lucide-react";

export type Testimonial = {
  id: string;
  name: string;
  rating: number;
  text: string;
  dateLabel: string | null;
};

// Por encima de este largo el texto se recorta a 3 líneas con «Ver más».
const LONG_TEXT = 130;

function Stars({ count, size = 14 }: { count: number; size?: number }) {
  return (
    <div className="flex items-center gap-[2px] text-primary" aria-label={`${count} de 5 estrellas`}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={size} fill="currentColor" strokeWidth={0} />
      ))}
    </div>
  );
}

function ReviewCard({ t }: { t: Testimonial }) {
  const [open, setOpen] = useState(false);
  const isLong = t.text.length > LONG_TEXT;

  return (
    <article className="relative w-[280px] md:w-[320px] shrink-0 snap-start self-start bg-white border border-black/5 rounded-2xl px-5 pt-6 pb-4">
      <span
        aria-hidden
        className="absolute -top-1 left-4 text-5xl leading-none text-primary/30 select-none"
      >
        “
      </span>

      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="font-semibold text-sm">{t.name}</span>
        <Stars count={t.rating} size={13} />
      </div>

      <p
        className={`text-muted text-sm leading-relaxed whitespace-pre-line ${
          isLong && !open ? "line-clamp-3" : ""
        }`}
      >
        {t.text}
      </p>

      <div className="flex items-center justify-between mt-3 text-xs text-muted/70">
        <span>{t.dateLabel}</span>
        {isLong && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex items-center gap-1 font-medium text-primary hover:underline"
          >
            {open ? "Ver menos" : "Ver más"}
            <ChevronDown
              size={14}
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
    </article>
  );
}

export default function TestimonialsCarousel({
  reviews,
  average,
  googleUrl,
}: {
  reviews: Testimonial[];
  average: string;
  googleUrl: string;
}) {
  return (
    <section className="bg-surface py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="h2 text-center mb-3">
          Lo que dicen quienes ya vivieron Vivabox
        </h2>

        <div className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1 mb-6 text-sm text-muted">
          <Stars count={5} />
          <span>
            <strong className="text-foreground font-semibold">{average}</strong>{" "}
            · Reseñas en Google
          </span>
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Ver en Google
            <ExternalLink size={12} />
          </a>
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1 md:flex-wrap md:justify-center md:overflow-visible">
          {reviews.map((t) => (
            <ReviewCard key={t.id} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
