"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Maximize, Minimize, EyeOff, Eye } from "lucide-react";
import type { Experience } from "@/types/experience";
import { interleaveByOrder, SHOWCASE_CATEGORY_ORDER } from "@/utils/interleave";
import MarqueeRow, { type MarqueeRowHandle } from "./MarqueeRow";

// Base scroll speed in px/second at 1x -- tuned so a 320px card takes a
// few seconds to cross the frame at default speed.
const BASE_SPEED = 70;
const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

// Background pattern size, as a % of the frame's width (background-size:
// "N% auto"). 100% is roughly equivalent to the old `bg-cover` for this
// particular (portrait) SVG in a landscape frame, since covering a wider
// container with a taller-than-wide image is width-constrained.
const BG_SCALE_MIN = 40;
const BG_SCALE_MAX = 400;

// Splits experiences into two rows, each cycling through
// SHOWCASE_CATEGORY_ORDER independently -- interleaving the full list
// first and then taking every other item (or a contiguous half) would
// keep the fixed order on the combined list but not within a single row,
// since a row's neighbors aren't neighbors in that combined list.
function splitIntoRows(experiences: Experience[]): [Experience[], Experience[]] {
  const byCategory: Record<string, Experience[]> = {};
  for (const exp of experiences) {
    const key = exp.category || "otros";
    (byCategory[key] ||= []).push(exp);
  }

  const rowAGroups: Record<string, Experience[]> = {};
  const rowBGroups: Record<string, Experience[]> = {};

  for (const [category, items] of Object.entries(byCategory)) {
    // getAllExperiences() already pads small categories by repeating
    // experiences (so every category can alternate on every pass) -- de-dupe
    // back to unique experiences *before* splitting, otherwise the same
    // repeated card can land in both halves and show in both rows at once.
    // Each row then re-pads its own half independently via interleaveByOrder.
    const seen = new Set<string>();
    const unique: Experience[] = [];
    for (const exp of items) {
      if (!seen.has(exp.title)) {
        seen.add(exp.title);
        unique.push(exp);
      }
    }

    const mid = Math.ceil(unique.length / 2);
    rowAGroups[category] = unique.slice(0, mid);
    rowBGroups[category] = unique.slice(mid);
  }

  return [
    interleaveByOrder(rowAGroups, SHOWCASE_CATEGORY_ORDER),
    interleaveByOrder(rowBGroups, SHOWCASE_CATEGORY_ORDER),
  ];
}

export default function ExperienceShowcase({ experiences }: { experiences: Experience[] }) {
  const [rowTop, rowBottom] = useMemo(() => splitIntoRows(experiences), [experiences]);

  const [playing, setPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(2);
  const [bgScale, setBgScale] = useState(100);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const playingRef = useRef(playing);
  const speedRef = useRef(BASE_SPEED * speedMultiplier);
  const containerRef = useRef<HTMLDivElement>(null);
  const rowTopRef = useRef<MarqueeRowHandle>(null);
  const rowBottomRef = useRef<MarqueeRowHandle>(null);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    speedRef.current = BASE_SPEED * speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const handleReset = () => {
    rowTopRef.current?.reset();
    rowBottomRef.current?.reset();
  };

  const showPanel = controlsVisible && !isFullscreen;

  return (
    <div
      ref={containerRef}
      className="h-screen w-screen overflow-hidden bg-black flex items-center justify-center relative"
    >
      {/* Locked to a 4:5 frame -- width/height computed so it always fits
          the viewport exactly at that ratio, whichever dimension is the
          limiting one, leaving black letterbox/pillarbox margins. */}
      <div
        className="relative overflow-hidden bg-white flex flex-col items-center justify-center gap-0"
        style={{
          width: "min(100vw, calc(100vh * 4 / 5))",
          height: "min(100vh, calc(100vw * 5 / 4))",
          backgroundImage: "url('/rect75.svg')",
          backgroundSize: `${bgScale}% auto`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <MarqueeRow
          ref={rowTopRef}
          experiences={rowTop}
          direction="left"
          speedRef={speedRef}
          playingRef={playingRef}
        />
        <MarqueeRow
          ref={rowBottomRef}
          experiences={rowBottom}
          direction="right"
          speedRef={speedRef}
          playingRef={playingRef}
        />
      </div>

      {/* Reveal affordance when the panel is intentionally hidden (not shown in fullscreen -- ESC is the only way out there) */}
      {!showPanel && !isFullscreen && (
        <button
          type="button"
          onClick={() => setControlsVisible(true)}
          aria-label="Mostrar controles"
          className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-ink/80 text-white flex items-center justify-center backdrop-blur-sm hover:bg-ink transition"
        >
          <Eye size={18} />
        </button>
      )}

      {showPanel && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-full bg-ink/85 backdrop-blur-md text-white px-5 py-3 shadow-lg">
          <button
            type="button"
            onClick={() => setPlaying(p => !p)}
            aria-label={playing ? "Pausar" : "Reproducir"}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-white/70 w-9 text-right tabular-nums">
              {speedMultiplier}x
            </span>
            <input
              type="range"
              min={0}
              max={SPEED_OPTIONS.length - 1}
              step={1}
              value={SPEED_OPTIONS.indexOf(speedMultiplier)}
              onChange={e => setSpeedMultiplier(SPEED_OPTIONS[Number(e.target.value)])}
              className="w-32 accent-primary"
              aria-label="Velocidad de la animación"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-white/70 w-9 text-right tabular-nums">
              {bgScale}%
            </span>
            <input
              type="range"
              min={BG_SCALE_MIN}
              max={BG_SCALE_MAX}
              step={10}
              value={bgScale}
              onChange={e => setBgScale(Number(e.target.value))}
              className="w-32 accent-primary"
              aria-label="Tamaño del fondo"
            />
          </div>

          <button
            type="button"
            onClick={handleReset}
            aria-label="Reiniciar"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <RotateCcw size={16} />
          </button>

          <button
            type="button"
            onClick={() => setControlsVisible(false)}
            aria-label="Ocultar controles"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <EyeOff size={16} />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      )}
    </div>
  );
}
