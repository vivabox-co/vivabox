"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";

const CARD_IMAGE_SIZES = "(min-width: 1024px) 272px, (min-width: 640px) 260px, 60vw";
const SCROLL_STEP = 584; // 2 cards (272px card + 20px gap) x2

type Base = { name: string; subtitle: string; ariaLabel: string };

export type OccasionCard =
  | (Base & { image: string; alt: string })
  // Plain brand-color card, for occasions we don't have a photo for yet.
  | (Base & { color: string; icon: LucideIcon });

type OccasionCarouselProps = {
  title: string;
  items: readonly OccasionCard[];
  theme?: "dark" | "light";
  prevLabel?: string;
  nextLabel?: string;
};

// Shared by the homepage ("¿Para qué ocasión…?") and Empresas ("Ideal para").
export default function OccasionCarousel({
  title,
  items,
  theme = "dark",
  prevLabel = "Ver ocasiones anteriores",
  nextLabel = "Ver más ocasiones",
}: OccasionCarouselProps) {

  const [revealed, setRevealed] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scrollByStep = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -SCROLL_STEP : SCROLL_STEP,
      behavior: "smooth",
    });
  };

  const isDark = theme === "dark";

  return (
    <section className={`${isDark ? "vb-dark bg-ink" : "vb-surface-base"} py-12 md:py-14`}>

      <div className="max-w-6xl mx-auto px-6 mb-6 md:mb-8">

        <h2 className={`h2 text-center ${isDark ? "text-white" : ""}`}>
          {title}
        </h2>

      </div>

      {/* CAROUSEL at every width — the next card always peeks in to invite swiping; desktop gets arrows since horizontal scroll has no discoverable affordance with a mouse */}

      <div className="relative max-w-7xl mx-auto">

        <button
          type="button"
          onClick={() => scrollByStep("left")}
          aria-label={prevLabel}
          className={`vb-icon-btn hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 transition-opacity duration-200 ${
            canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronLeft size={22} />
        </button>

        <button
          type="button"
          onClick={() => scrollByStep("right")}
          aria-label={nextLabel}
          className={`vb-icon-btn hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 transition-opacity duration-200 ${
            canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronRight size={22} />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-5 overflow-x-auto px-6 scroll-px-6 pb-2 no-scrollbar snap-x snap-mandatory scroll-smooth"
        >

          {items.map((item) => (

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
              className="vb-card group relative shrink-0 w-[60vw] sm:w-[260px] lg:w-[272px] aspect-[3/4.3] overflow-hidden snap-start cursor-pointer"
              aria-label={item.ariaLabel}
            >

              {"image" in item ? (
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes={CARD_IMAGE_SIZES}
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              ) : (
                <>
                  <div
                    className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    style={{ background: `linear-gradient(160deg, ${item.color}, ${item.color}CC)` }}
                  />
                  <item.icon
                    size={120}
                    strokeWidth={1}
                    className="absolute -right-4 -top-4 text-white/15"
                  />
                </>
              )}

              {/* Scrim — text-shadow alone isn't enough on bright photos */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none" />

              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">

                <h3 className="text-white text-[16px] md:text-[22px] font-semibold leading-tight [text-shadow:0_1px_4px_rgba(0,0,0,.85)]">
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
