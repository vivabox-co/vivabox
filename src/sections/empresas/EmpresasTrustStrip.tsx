"use client";

import { useEffect, useRef } from "react";
import { Truck, ReceiptText, CalendarClock, Timer } from "lucide-react";

// Practical facts a buyer checks before writing to us. Deliberately NOT a repeat of the
// hero callouts (logo, message, choice, reservations): those are already said above.
// Always ONE line: when it fits it sits still, when it doesn't it scrolls by itself
// (and can be dragged / swiped).
const ITEMS = [
  { icon: Truck, text: "Un solo envío a tu empresa" },
  { icon: ReceiptText, text: "Factura electrónica" },
  { icon: CalendarClock, text: "Código válido 6 meses" },
  { icon: Timer, text: "Listo en 3-4 días" },
] as const;

export default function EmpresasTrustStrip() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const cloneRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    const clone = cloneRef.current;
    if (!container || !track || !clone) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let paused = false;
    let scrolling = false;
    let pos = 0;
    let rafId = 0;

    // The loop only exists when the items do not fit on one screen.
    const measure = () => {
      scrolling = !reduce && track.scrollWidth > container.clientWidth + 1;
      clone.style.display = scrolling ? "flex" : "none";
      track.style.justifyContent = scrolling ? "flex-start" : "space-between";
      if (!scrolling) container.scrollLeft = pos = 0;
    };

    const tick = () => {
      if (scrolling && !paused) {
        pos += 0.35;
        const loop = clone.offsetLeft - track.offsetLeft; // width of one copy
        if (pos >= loop) pos -= loop;
        container.scrollLeft = pos;
      } else if (scrolling) {
        pos = container.scrollLeft;
      }
      rafId = requestAnimationFrame(tick);
    };

    const pause = () => (paused = true);
    const resume = () => (paused = false);

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    rafId = requestAnimationFrame(tick);

    container.addEventListener("touchstart", pause, { passive: true });
    container.addEventListener("touchend", resume);
    container.addEventListener("mouseenter", pause);
    container.addEventListener("mouseleave", resume);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      container.removeEventListener("touchstart", pause);
      container.removeEventListener("touchend", resume);
      container.removeEventListener("mouseenter", pause);
      container.removeEventListener("mouseleave", resume);
    };
  }, []);

  const list = (hidden: boolean) => (
    <ul
      ref={hidden ? cloneRef : trackRef}
      aria-hidden={hidden || undefined}
      className={`${hidden ? "hidden" : "flex"} shrink-0 items-center gap-8 pr-8 md:gap-0 md:pr-0 md:flex-1`}
      style={hidden ? undefined : { minWidth: "100%" }}
    >
      {ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <li
            key={item.text}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap text-ink text-sm font-medium"
          >
            <Icon size={20} strokeWidth={1.5} className="text-primary" />
            <span>{item.text}</span>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="bg-white">
      <div
        ref={containerRef}
        className="max-w-6xl mx-auto flex overflow-x-auto no-scrollbar py-4 md:py-5 px-6"
      >
        {list(false)}
        {list(true)}
      </div>
    </div>
  );
}
