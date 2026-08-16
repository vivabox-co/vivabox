"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, MapPin, Users, Smartphone } from "lucide-react";
import ExperienceModal from "@/components/ExperienceModal";
import type { Experience } from "@/types/experience";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR, formatCity, formatPeopleCount } from "@/data/categories";

const CARD_IMAGE_SIZES = "(min-width: 1024px) 260px, 260px";
const SCROLL_STEP = 584; // ~2 cards (260px card + 16px gap) x2

export default function ExperiencesGrid({
  experiencesPreview,
}: {
  experiencesPreview: Experience[];
}) {

  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
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
  }, [updateScrollState, experiencesPreview]);

  const scrollByStep = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -SCROLL_STEP : SCROLL_STEP,
      behavior: "smooth",
    });
  };

  return (
    <>
      <div className="relative">

        {/* DESKTOP SCROLL ARROWS — horizontal scroll has no discoverable affordance with a mouse */}
        <button
          type="button"
          onClick={() => scrollByStep("left")}
          aria-label="Ver experiencias anteriores"
          className={`vb-icon-btn hidden lg:flex absolute left-0 top-[60px] -translate-x-1/2 z-20 w-10 h-10 transition-opacity duration-200 ${
            canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronLeft size={20} className="text-primary" />
        </button>

        <button
          type="button"
          onClick={() => scrollByStep("right")}
          aria-label="Ver más experiencias"
          className={`vb-icon-btn hidden lg:flex absolute right-0 top-[60px] translate-x-1/2 z-20 w-10 h-10 transition-opacity duration-200 ${
            canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronRight size={20} className="text-primary" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-6 no-scrollbar scroll-smooth"
          style={{ paddingLeft: 16, paddingRight: 16 }}
        >

        {experiencesPreview.map((exp, index) => {

          const categoryKey = exp.category?.toLowerCase() || "";

          const categoryColor =
            CATEGORY_COLORS[categoryKey] || DEFAULT_CATEGORY_COLOR;

          const badgeColor = `${categoryColor.bg} ${categoryColor.text}`;
          const barColor = categoryColor.dot;
          const city = formatCity(exp.city);
          const people = formatPeopleCount(exp.format);

          return (

            <div
              key={index}
              onClick={() => setSelectedExperience(exp)}
              className="vb-card group cursor-pointer snap-start min-w-[260px] hover:-translate-y-[2px] transition-transform duration-300 overflow-hidden"
            >

              {/* IMAGE */}
              <div className="relative w-full h-[160px] overflow-hidden rounded-t-[26px]">

                <Image
                  src={exp.image || "/images/box-includes/vivabox-caja-regalo.webp"}
                  alt={exp.title}
                  fill
                  sizes={CARD_IMAGE_SIZES}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                <div
                  className={`absolute left-0 top-0 bottom-0 w-[6px] z-10 ${barColor}`}
                />

              </div>

              {/* CONTENT */}
              <div className="p-4">

                <span
                  className={`inline-flex items-center leading-none text-xs font-medium px-2.5 py-1.5 rounded-full mb-2 capitalize ${badgeColor}`}
                >
                  {exp.category}
                </span>

                <h3 className="font-semibold leading-6 min-h-[48px] line-clamp-2 mb-[2px]">
                  {exp.title}
                </h3>

                {(city || people) && (
                  <div className="flex items-center gap-3 text-sm text-muted">
                    {city && (
                      <span className="flex items-center gap-1">
                        <MapPin size={14} strokeWidth={2.5} />
                        {city}
                      </span>
                    )}
                    {people && (
                      <span className="flex items-center gap-1">
                        <Users size={14} strokeWidth={2.5} />
                        {people}
                      </span>
                    )}
                  </div>
                )}

              </div>

            </div>

          );
        })}

        {/* LAST CARD */}
        <div className="vb-card group snap-start min-w-[260px] hover:-translate-y-[2px] transition-transform duration-300 overflow-hidden">

          <div className="relative w-full h-[160px] overflow-hidden rounded-t-[26px]">

            <Image
              src="/images/experiences-preview/vivabox-mapa-experiencias.webp"
              alt="Mapa de experiencias Vivabox"
              fill
              sizes={CARD_IMAGE_SIZES}
              className="object-cover"
            />

            <div className="absolute left-0 top-0 bottom-0 w-[6px] flex flex-col z-10">
              {Object.values(CATEGORY_COLORS).map((c) => (
                <div key={c.dot} className={`flex-1 ${c.dot}`}></div>
              ))}
            </div>

            <span className="absolute top-3 left-4 z-10 inline-flex items-center gap-1 leading-none text-xs font-medium px-2.5 py-1.5 rounded-full bg-white/95 backdrop-blur-sm shadow-sm text-ink">
              <Smartphone size={13} strokeWidth={1.5} />
              En la app Vivabox
            </span>

          </div>

          <div className="p-4">

            <h3 className="font-semibold leading-6 mb-[2px]">
              Y muchas más por descubrir
            </h3>

            <p className="text-sm text-muted">
              Quien la reciba ve todo el catálogo, que seguimos ampliando.
            </p>

          </div>

        </div>

        </div>

      </div>

      <ExperienceModal
        experience={selectedExperience}
        onClose={() => setSelectedExperience(null)}
      />
    </>
  );
}
