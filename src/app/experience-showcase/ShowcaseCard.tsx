import Image from "next/image";
import { MapPin, Users } from "lucide-react";
import type { Experience } from "@/types/experience";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR, formatCity, formatPeopleCount } from "@/data/categories";

// Simplified read-only variant of the .vb-card used in ExperiencesGrid/
// BoxExperienceExamplesGrid -- no click/modal, no hover state, since this
// card only ever appears inside the auto-scrolling /experience-showcase
// marquee (see docs/03_visual-identity.md for the source card style).
export default function ShowcaseCard({ experience }: { experience: Experience }) {
  const categoryKey = experience.category?.toLowerCase() || "";
  const categoryColor = CATEGORY_COLORS[categoryKey] || DEFAULT_CATEGORY_COLOR;
  const badgeColor = `${categoryColor.bg} ${categoryColor.text}`;
  const barColor = categoryColor.dot;
  const city = formatCity(experience.city);
  const people = formatPeopleCount(experience.format);

  return (
    <div className="vb-card w-[250px] shrink-0 overflow-hidden" style={{ background: "#FFFFFF" }}>
      <div className="relative w-full h-[clamp(85px,15vh,190px)] overflow-hidden rounded-t-[26px]">
        <Image
          src={experience.image || "/images/box-includes/vivabox-caja-regalo.webp"}
          alt={experience.title}
          fill
          sizes="250px"
          className="object-cover"
        />
        <div className={`absolute left-0 top-0 bottom-0 w-[6px] z-10 ${barColor}`} />
      </div>

      <div className="p-3">
        <span
          className={`inline-flex items-center leading-none text-xs font-medium px-2.5 py-1.5 rounded-full mb-2 capitalize ${badgeColor}`}
        >
          {experience.category}
        </span>

        <h3 className="font-semibold leading-6 min-h-[40px] line-clamp-2 mb-[2px]">
          {experience.title}
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
}
