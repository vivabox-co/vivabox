"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { RefObject } from "react";
import type { Experience } from "@/types/experience";
import ShowcaseCard from "./ShowcaseCard";

export type MarqueeRowHandle = {
  reset: () => void;
};

type Direction = "left" | "right";

// Frame-driven (not CSS-animation-driven) infinite marquee: translateX is
// written straight to the DOM every rAF tick instead of going through React
// state, so changing the speed slider mid-scroll changes velocity smoothly
// with zero jump -- a CSS `animation-duration` change would snap position
// instead. The loop wraps by exactly the pixel width of one full set of
// cards (measured from the DOM, gaps included), so the seam is invisible.
const MarqueeRow = forwardRef<MarqueeRowHandle, {
  experiences: Experience[];
  direction: Direction;
  speedRef: RefObject<number>;
  playingRef: RefObject<boolean>;
}>(function MarqueeRow({ experiences, direction, speedRef, playingRef }, ref) {
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const wrapDistanceRef = useRef(0);
  const lastTsRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

  const applyTransform = () => {
    const track = trackRef.current;
    if (track) track.style.transform = `translate3d(${offsetRef.current}px,0,0)`;
  };

  useImperativeHandle(ref, () => ({
    reset: () => {
      offsetRef.current = direction === "right" ? -wrapDistanceRef.current : 0;
      applyTransform();
    },
  }), [direction]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      const firstDuplicate = track.children[experiences.length] as HTMLElement | undefined;
      wrapDistanceRef.current = firstDuplicate?.offsetLeft || 0;

      // First measurement: park the "right" row at the far end of its
      // wrap range so both rows fill the frame immediately instead of
      // needing a few seconds to scroll into place.
      if (!initializedRef.current) {
        initializedRef.current = true;
        if (direction === "right") {
          offsetRef.current = -wrapDistanceRef.current;
          applyTransform();
        }
      }
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(track);

    const tick = (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = Math.min((ts - lastTsRef.current) / 1000, 0.1);
      lastTsRef.current = ts;

      const distance = wrapDistanceRef.current;

      if (playingRef.current && distance > 0) {
        const delta = speedRef.current * dt * (direction === "left" ? -1 : 1);
        offsetRef.current += delta;

        if (direction === "left" && offsetRef.current <= -distance) {
          offsetRef.current += distance;
        } else if (direction === "right" && offsetRef.current >= 0) {
          offsetRef.current -= distance;
        }

        applyTransform();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      lastTsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experiences.length, direction]);

  return (
    <div className="overflow-x-hidden overflow-y-visible w-full py-3 shrink-0">
      <div ref={trackRef} className="flex gap-6 w-max will-change-transform relative">
        {experiences.map((exp, i) => (
          <ShowcaseCard key={`a-${i}`} experience={exp} />
        ))}
        {experiences.map((exp, i) => (
          <ShowcaseCard key={`b-${i}`} experience={exp} />
        ))}
      </div>
    </div>
  );
});

export default MarqueeRow;
