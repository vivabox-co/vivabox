"use client";

import { useState } from "react";
import { Star, ChevronDown, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

export type Testimonial = {
  id: string;
  name: string;
  rating: number;
  text: string;
  dateLabel: string | null;
  source: string;
  sourceUrl: string | null;
};

// Logo "G" de Google, en gris por defecto y a color al pasar el cursor.
function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden>
      <path className="fill-current group-hover:fill-[#4285F4]" d="M22.5 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8z" />
      <path className="fill-current group-hover:fill-[#34A853]" d="M12 23c3 0 5.4-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1-3.7 1-2.8 0-5.2-1.9-6-4.5H2.4v2.8A11 11 0 0 0 12 23z" />
      <path className="fill-current group-hover:fill-[#FBBC05]" d="M6 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.4a11 11 0 0 0 0 9.8L6 14.1z" />
      <path className="fill-current group-hover:fill-[#EA4335]" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 0 0 2.4 7.1L6 9.9c.8-2.6 3.2-4.5 6-4.5z" />
    </svg>
  );
}

// Una entrada por fuente de reseñas. Una fuente desconocida usa el icono genérico.
const SOURCES: Record<string, { label: string; icon: ReactNode }> = {
  google: { label: "Google", icon: <GoogleG /> },
};

function SourceLink({ source, url }: { source: string; url: string | null }) {
  if (!url) return null;
  const cfg = SOURCES[source] ?? {
    label: source,
    icon: <ExternalLink size={13} />,
  };
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={`Ver la reseña original en ${cfg.label}`}
      aria-label={`Ver la reseña original en ${cfg.label}`}
      className="group inline-flex items-center gap-1 text-muted/60 hover:text-foreground transition-colors"
    >
      {cfg.icon}
      <ExternalLink size={10} className="opacity-60" />
    </a>
  );
}

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
        <div className="flex items-center gap-2.5">
          <Stars count={t.rating} size={13} />
          <SourceLink source={t.source} url={t.sourceUrl} />
        </div>
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
}: {
  reviews: Testimonial[];
}) {
  return (
    <section className="bg-surface py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="h2 text-center mb-6">
          Lo que dicen quienes ya vivieron Vivabox
        </h2>

        <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1 md:flex-wrap md:justify-center md:overflow-visible">
          {reviews.map((t) => (
            <ReviewCard key={t.id} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
