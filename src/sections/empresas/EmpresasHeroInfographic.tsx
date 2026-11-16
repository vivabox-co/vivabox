"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Package, Truck, Mountain, MessageCircle, Stamp, type LucideIcon } from "lucide-react";

// Hero option: a row of standing Vivabox receding in perspective (Blender renders), the
// front one with a logo that changes, and callout cards with a thin line and a dot that
// lands on the exact element they talk about.
// Renders: public/images/empresas/hero-boxes/pila-v3.webp (the 6 boxes behind) and
// frente-*.webp (the front box with each placeholder logo). All share the same camera and
// size, so they are stacked on top of each other. The logos are PLACEHOLDERS.

const LOGOS = ["nuvora", "kubo", "zentra", "moventia", "bluetec"] as const;
// Vivabox logo colors, one per card.
const C = { orange: "#FF8406", red: "#E0384B", green: "#8DB92F", blue: "#0294D2", violet: "#8B5CF6" };

// Size of the renders (all identical) — used for the aspect ratio.
const IMG_W = 1035;
const IMG_H = 645;

type Pt = [number, number];
type Card = {
  key: string;
  Icon: LucideIcon;
  title: string;
  sub?: string;
  note?: string; // small gray text under the card (outside the border)
  // Card rectangle in stage units.
  x: number; y: number; w: number; h: number;
  // Side of the card the line leaves from.
  from: "left" | "right" | "top" | "bottom";
  // Target: a point on the render, as a fraction of the render (0..1).
  at: Pt;
  color: string; // accent color of the card, its line and its dot
};

type Stage = {
  W: number; H: number;
  img: { left: number; top: number; width: number };
  title: number; sub: number; icon: number; // sizes in stage units
  showSub: boolean;
  boxed: boolean; // cards with a border, or just icon + text
  cards: Card[];
};

// Points on the render (fractions): the logo band, the message line, a photo, the top of the
// last box in the row and the foot of a box in the middle of the row.
const AT_LOGO: Pt = [0.242, 0.481];
const AT_MSG: Pt = [0.199, 0.583];
const AT_PHOTO: Pt = [0.174, 0.791];
const AT_ROW_TOP: Pt = [0.865, 0.42];
const AT_ROW_FOOT: Pt = [0.69, 0.80];

const T = {
  logo: "Tu logo en la sleeve",
  mensaje: "Tu mensaje para el equipo",
  experiencia: "Cada persona elige su experiencia",
  cantidad: "Desde pocas cajas hasta cientos",
  entrega: "Entrega física o digital",
};

// Wide layout, like the approved reference: 3 cards on the left, 2 on the right.
const WIDE: Stage = {
  W: 880, H: 360,
  img: { left: 215, top: 36, width: 470 },
  title: 14, sub: 0, icon: 24, showSub: false, boxed: true,
  cards: [
    { key: "logo", Icon: Stamp, title: T.logo, note: "Cada empresa, su propia Vivabox", x: 0, y: 34, w: 212, h: 50, from: "right", at: AT_LOGO, color: C.orange },
    { key: "mensaje", Icon: MessageCircle, title: T.mensaje, note: "Unas palabras de la empresa", x: 0, y: 138, w: 212, h: 50, from: "right", at: AT_MSG, color: C.red },
    { key: "experiencia", Icon: Mountain, title: T.experiencia, note: "Masajes, aventura, gastronomía…", x: 0, y: 242, w: 212, h: 50, from: "right", at: AT_PHOTO, color: C.green },
    { key: "cantidad", Icon: Package, title: T.cantidad, note: "Nosotros nos encargamos de la reserva", x: 668, y: 6, w: 212, h: 50, from: "left", at: AT_ROW_TOP, color: C.blue },
    { key: "entrega", Icon: Truck, title: T.entrega, x: 706, y: 268, w: 174, h: 50, from: "left", at: AT_ROW_FOOT, color: C.violet },
  ],
};

// Phones: compact cards (icon + title) above and below the row of boxes.
const NARROW: Stage = {
  W: 400, H: 436,
  img: { left: 10, top: 100, width: 380 },
  title: 14, sub: 0, icon: 20, showSub: false, boxed: true,
  cards: [
    { key: "logo", Icon: Stamp, title: "Tu logo en la sleeve", x: 6, y: 6, w: 190, h: 50, from: "bottom", at: AT_LOGO, color: C.orange },
    { key: "cantidad", Icon: Package, title: "Desde pocas cajas hasta cientos", x: 204, y: 6, w: 190, h: 50, from: "bottom", at: AT_ROW_TOP, color: C.blue },
    { key: "experiencia", Icon: Mountain, title: "Cada persona elige su experiencia", x: 4, y: 358, w: 148, h: 72, from: "top", at: AT_PHOTO, color: C.green },
    { key: "mensaje", Icon: MessageCircle, title: "Tu mensaje para el equipo", x: 156, y: 358, w: 128, h: 72, from: "top", at: AT_MSG, color: C.red },
    { key: "entrega", Icon: Truck, title: "Entrega física o digital", x: 288, y: 358, w: 108, h: 72, from: "top", at: AT_ROW_FOOT, color: C.violet },
  ],
};

function anchor(c: Card): Pt {
  if (c.from === "right") return [c.x + c.w, c.y + c.h / 2];
  if (c.from === "left") return [c.x, c.y + c.h / 2];
  if (c.from === "top") return [c.x + c.w / 2, c.y];
  return [c.x + c.w / 2, c.y + c.h];
}

function linePath(a: Pt, t: Pt, from: Card["from"]) {
  const horiz = from === "left" || from === "right";
  const k = 0.5;
  const c1: Pt = horiz ? [a[0] + (t[0] - a[0]) * k, a[1]] : [a[0], a[1] + (t[1] - a[1]) * k];
  const c2: Pt = horiz ? [t[0] - (t[0] - a[0]) * 0.25, t[1]] : [t[0], t[1] - (t[1] - a[1]) * 0.25];
  return `M ${a[0]} ${a[1]} C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${t[0]} ${t[1]}`;
}

function StageView({ stage, i, prev }: { stage: Stage; i: number; prev: number }) {
  const { W, H, img, cards } = stage;
  const imgH = (img.width * IMG_H) / IMG_W;
  const pctX = (v: number) => `${(v / W) * 100}%`;
  const pctY = (v: number) => `${(v / H) * 100}%`;
  const u = (v: number) => `${(v / W) * 100}cqw`; // stage units -> container width

  const target = (c: Card): Pt => [img.left + img.width * c.at[0], img.top + imgH * c.at[1]];

  return (
    <div className="relative w-full" style={{ aspectRatio: `${W} / ${H}`, containerType: "inline-size" }}>
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(closest-side at 50% 55%, rgba(255,132,6,0.14), transparent 70%)" }}
      />

      {/* the row of boxes behind, and the front box on top (same frame) */}
      <div
        className="absolute"
        style={{ left: pctX(img.left), top: pctY(img.top), width: pctX(img.width), aspectRatio: `${IMG_W} / ${IMG_H}`, filter: "drop-shadow(0 22px 24px rgba(0,0,0,0.5))" }}
      >
        <Image
          src="/images/empresas/hero-boxes/pila-v3.webp"
          alt="" width={IMG_W} height={IMG_H} sizes="(min-width: 1100px) 560px, 95vw" priority
          className="absolute inset-0 w-full h-full"
        />
        {/* the new logo fades in OVER the previous one, so the box never goes see-through */}
        {LOGOS.map((l, n) => (
          <Image
            key={l}
            src={`/images/empresas/hero-boxes/frente-${l}-v5.webp`}
            alt={n === 0 ? "Vivabox con el logo de la empresa en la sleeve" : ""}
            width={IMG_W} height={IMG_H} sizes="(min-width: 1100px) 560px, 95vw" priority={n === 0}
            className="absolute inset-0 w-full h-full"
            style={{
              opacity: n === i || n === prev ? 1 : 0,
              zIndex: n === i ? 2 : n === prev ? 1 : 0,
              transition: n === i ? "opacity 700ms ease" : "none",
            }}
          />
        ))}
      </div>

      {/* lines ending in a dot on the element */}
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden fill="none">
        {cards.map((c) => {
          const a = anchor(c), t = target(c);
          const r = W > 500 ? 5.5 : 4.5;
          return (
            <g key={c.key} stroke={c.color} strokeLinecap="round">
              <path d={linePath(a, t, c.from)} strokeWidth={W > 500 ? 2.4 : 2} />
              <circle cx={t[0]} cy={t[1]} r={r} fill={c.color} stroke="#18140F" strokeWidth={W > 500 ? 2 : 1.5} />
            </g>
          );
        })}
      </svg>

      {/* small gray notes under the cards */}
      {cards.map((c) =>
        c.note && W > 500 ? (
          <p
            key={`${c.key}-note`}
            className="absolute text-white/65"
            style={{ left: pctX(c.x + 14), top: pctY(c.y + c.h + 7), width: pctX(c.w - 14), fontSize: u(12), lineHeight: 1.25 }}
          >
            {c.note}
          </p>
        ) : null,
      )}

      {/* callout cards */}
      {cards.map((c) => (
        <div
          key={c.key}
          className="absolute flex items-center text-white"
          style={{
            left: pctX(c.x), top: pctY(c.y), width: pctX(c.w), height: pctY(c.h),
            border: stage.boxed ? `${W > 500 ? 2 : 1.5}px solid ${c.color}` : "none",
            borderRadius: u(W > 500 ? 22 : 10),
            background: stage.boxed ? "rgba(24,20,15,0.72)" : "transparent",
            padding: stage.boxed ? `0 ${u(W > 500 ? 11 : 8)}` : 0,
            justifyContent: !stage.boxed && c.from === "right" ? "flex-end" : undefined,
            gap: u(W > 500 ? 9 : 7),
          }}
        >
          <c.Icon aria-hidden strokeWidth={1.6} style={{ color: c.color, width: u(stage.icon), height: u(stage.icon), flex: "none" }} />
          <span aria-hidden style={{ width: 2, alignSelf: "stretch", margin: `${u(W > 500 ? 15 : 10)} 0`, background: c.color, opacity: 0.85, flex: "none" }} />
          <div className="min-w-0">
            <p className="font-condensed font-semibold uppercase" style={{ fontSize: u(stage.title), lineHeight: 1.02, textWrap: "balance" }}>
              {c.title}
            </p>
            {stage.showSub && c.sub && (
              <p className="text-white/70" style={{ fontSize: u(stage.sub), lineHeight: 1.2, marginTop: u(5) }}>
                {c.sub}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EmpresasHeroInfographic() {
  const [{ i, prev }, setLogo] = useState({ i: 0, prev: 0 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setLogo((c) => ({ i: (c.i + 1) % LOGOS.length, prev: c.i })), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <div className="hidden md:block w-full max-w-[880px] ml-auto">
        <StageView stage={WIDE} i={i} prev={prev} />
      </div>
      <div className="md:hidden mx-auto w-full max-w-[460px]">
        <StageView stage={NARROW} i={i} prev={prev} />
      </div>
    </>
  );
}
