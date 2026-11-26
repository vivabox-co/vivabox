/* eslint-disable @next/next/no-img-element */
"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

/*
  16:9 infographic for the /empresas hero, one connected scene on a flat
  espresso background:
    laptop (the company places ONE order)  →  a pile of polaroids (the team)
    →  Vivabox hub (gift logo with a care headset: we are the hosts)
    →  one experience card per category.
  Each person's thread is coloured like the category they pick and runs
  through the hub to the matching card.

  Everything is positioned in container-query units (cqw) on a 100 × 56.25 grid
  (designed at 1280px: 1cqw = 12.8px), so it scales with the card and stays
  readable on a phone held vertically (~327px wide, 1cqw ≈ 3.3px).
  Deliberately no team size: 5 people or 500.

  Photos: Pexels (free licence, no attribution required) in
  public/images/empresas/equipo. The laptop screen is a real capture of the
  /empresas configurator composited onto the photo.
*/

const INK = "#18140F";
const CREAM = "#FFFCF9";
const OR = "#FF8406";
const SHADOW = "0 0.6cqw 1.6cqw rgba(0,0,0,.35)";

// Site category colours (globals.css --color-cat-*) and icons
const CATS = [
  { name: "Gastronomía", color: "var(--color-cat-gastronomia)", icon: "gastronomia", title: "Taller de cacao", place: "Bogotá", slug: "taller-cata-cacao-bogota" },
  { name: "Bienestar", color: "var(--color-cat-bienestar)", icon: "bienestar", title: "Spa termal", place: "La Calera", slug: "spa-termal-natural-la-calera" },
  { name: "Aventura", color: "var(--color-cat-aventura)", icon: "aventura", title: "Cabalgata", place: "La Calera", slug: "cabalgata-parrillada-la-calera" },
  { name: "Cultura", color: "var(--color-cat-cultura)", icon: "cultura", title: "Tras bambalinas", place: "Bogotá", slug: "tras-bambalinas-bogota" },
  { name: "Estancias", color: "var(--color-cat-estancias)", icon: "estancias", title: "Glamping", place: "Guatavita", slug: "carpa-glamping-embalse-guatavita" },
];

// px at the 1280 design → cqw is done by the u() helper
const u = (px: number) => px / 12.8;

// persona, x, y (top-left, px), rotation, category index
const PEOPLE: [string, string, number, number, number, number][] = [
  ["persona-2", "50% 28%", 458, 176, -5, 0],
  ["persona-1", "50% 30%", 466, 312, 4, 2],
  ["persona-3", "50% 35%", 456, 446, -4, 4],
  ["persona-7", "55% 30%", 590, 198, 5, 1],
  ["persona-4", "50% 25%", 584, 334, -4, 3],
  ["persona-8", "50% 22%", 594, 466, 3, 1],
];
// where each thread meets the mascot (shuffled on purpose: the knot is the mess Vivabox sorts out)
const KNOT = [10, -14, 14, -4, 2, -10];
const PW = 118;
const PH = 146;
const HUB = { x: 845, y: 392, w: 132 };
const CX = 984;
const CW = 282;
const CH = 84;
const CG = 12;
const CT = 148;
const cardY = (j: number) => CT + j * (CH + CG);

const expSrc = (slug: string) => `/images/experiencias-reales/${slug}-vivabox/${slug}-vivabox-1.webp`;

// tangled approach: control points cross over so the threads knot together
const knot = (x1: number, y1: number, x2: number, y2: number, i: number) => {
  const sw = i % 2 ? 1 : -1;
  return `M${u(x1)} ${u(y1)} C${u(x1 + 150)} ${u(y1 + sw * 70)},${u(x2 - 130)} ${u(y2 - sw * 90)},${u(x2)} ${u(y2)}`;
};

// SVG user units are 1/12.8 of the 1280 design px
const curve = (x1: number, y1: number, x2: number, y2: number) => {
  const mx = (x1 + x2) / 2;
  return `M${u(x1)} ${u(y1)} C${u(mx)} ${u(y1)},${u(mx)} ${u(y2)},${u(x2)} ${u(y2)}`;
};

function Title({ l1, l2, sub, cx, w, delay, pop }: { l1: string; l2?: string; sub: string; cx: number; w: number; delay: number; pop: (d: number) => React.CSSProperties }) {
  return (
    <div className="absolute text-white text-center" style={{ left: `${u(cx - w / 2)}cqw`, top: `${u(14)}cqw`, width: `${u(w)}cqw`, zIndex: 9, ...pop(delay) }}>
      <h3 className="font-condensed font-semibold uppercase" style={{ fontSize: `${u(46)}cqw`, lineHeight: 0.95 }}>
        <span className="block whitespace-nowrap">{l1}</span>
        {l2 && <span className="block whitespace-nowrap">{l2}</span>}
      </h3>
      <p className="font-bold text-primary whitespace-nowrap" style={{ fontSize: "2.1cqw", lineHeight: 1, marginTop: `${u(9)}cqw` }}>
        {sub}
      </p>
    </div>
  );
}

const FourBar = ({ w, h }: { w: number; h: number }) => (
  <div className="flex overflow-hidden" style={{ width: `${u(w)}cqw`, height: `${u(h)}cqw`, borderRadius: "1cqw" }} aria-hidden="true">
    <i className="flex-1 bg-primary" />
    <i className="flex-1 bg-accent-red" />
    <i className="flex-1 bg-accent-green" />
    <i className="flex-1 bg-accent-blue" />
  </div>
);

export default function EmpresasRelayInfographic() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const pop = (delay: number): React.CSSProperties => ({
    opacity: on ? 1 : 0,
    transform: on ? "none" : "translateY(1.4cqw)",
    transition: "opacity .6s ease-out, transform .6s cubic-bezier(.2,.8,.2,1)",
    transitionDelay: on ? `${delay}ms` : "0ms",
  });

  const draw = (delay: number): React.CSSProperties => ({
    strokeDasharray: 1,
    strokeDashoffset: on ? 0 : 1,
    transition: `stroke-dashoffset 1s cubic-bezier(.4,.1,.2,1) ${delay}ms`,
  });

    const hubRight = HUB.x + 70;

  return (
    <div
      ref={ref}
      role="img"
      aria-label="Tú compras con un solo pedido. Cada persona de tu equipo elige su experiencia. Vivabox se encarga de todo y reserva."
      className="vb-card relative w-full aspect-video overflow-hidden select-none"
      style={{ containerType: "inline-size", background: INK }}
    >
      {/* narrow cards: keep photo, category and icon; drop the small print */}
      <style>{`@container (max-width: 640px){.vbx-detail{display:none!important}.vbx-pill{font-size:1.5cqw!important;padding:.2cqw .7cqw!important}.vbx-body{justify-content:center;padding-top:0!important;padding-right:0!important}}`}</style>

      {/* ── Man at the laptop ── */}
      <div className="absolute overflow-hidden" style={{ left: 0, top: `${u(70)}cqw`, width: `${u(470)}cqw`, height: `${u(570)}cqw`, zIndex: 1, ...pop(0) }}>
        <Image
          src="/images/empresas/equipo/compras-pantalla.webp"
          alt=""
          width={1000}
          height={562}
          priority
          sizes="(min-width: 1100px) 790px, 80vw"
          className="absolute max-w-none"
          style={{ left: `${u(-380)}cqw`, top: `${u(20)}cqw`, width: `${u(960)}cqw`, height: "auto" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(90deg, rgba(24,20,15,0) 70%, ${INK} 100%), linear-gradient(180deg, ${INK} 0%, rgba(24,20,15,0) 22%), linear-gradient(0deg, ${INK} 0%, rgba(24,20,15,0) 14%)` }}
        />
      </div>

      {/* arrow: the order goes to the team */}
      <div
        className="absolute flex items-center justify-center rounded-full bg-primary text-white"
        style={{ left: `${u(408)}cqw`, top: `${u(340)}cqw`, width: `${u(62)}cqw`, height: `${u(62)}cqw`, border: `${u(5)}cqw solid ${CREAM}`, zIndex: 6, ...pop(500) }}
      >
        <svg viewBox="0 0 24 24" style={{ width: "55%", height: "55%" }} fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12h16M13 5l7 7-7 7" />
        </svg>
      </div>

      {/* ── Threads: order → team → Vivabox → experiences ── */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 56.25" preserveAspectRatio="none" style={{ zIndex: 3, pointerEvents: "none" }} aria-hidden="true">
        <g fill="none" strokeLinecap="round">
          {[0, 1, 2].map((k) => (
            <path
              key={k}
              d={curve(436, 372, PEOPLE[k][2] + 10, PEOPLE[k][3] + PH / 2)}
              stroke={OR}
              strokeWidth=".5"
              strokeDasharray=".1 .7"
              style={{ opacity: on ? 0.9 : 0, transition: "opacity .6s ease-out .5s" }}
            />
          ))}
          {PEOPLE.map(([src, , x, y, , c], i) => (
            <path
              key={src}
              d={knot(x + PW / 2, y + PH / 2, HUB.x - 62, HUB.y + KNOT[i], i)}
              stroke={CATS[c].color}
              strokeWidth=".47"
              pathLength={1}
              style={draw(900 + i * 70)}
            />
          ))}
          {CATS.map((c, j) => (
            <path
              key={c.name}
              d={curve(hubRight - 4, HUB.y + (j - 2) * 14, CX + 3, cardY(j) + CH / 2)}
              stroke={c.color}
              strokeWidth=".58"
              pathLength={1}
              style={draw(1500 + j * 110)}
            />
          ))}
        </g>
      </svg>

      {/* ── Team: pile of polaroids ── */}
      {PEOPLE.map(([src, pos, x, y, rot], i) => (
        <div
          key={src}
          className="absolute bg-white"
          style={{
            left: `${u(x)}cqw`,
            top: `${u(y)}cqw`,
            width: `${u(PW)}cqw`,
            height: `${u(PH)}cqw`,
            padding: `${u(6)}cqw ${u(6)}cqw ${u(22)}cqw`,
            borderRadius: `${u(7)}cqw`,
            boxShadow: SHADOW,
            transform: on ? `rotate(${rot}deg)` : `rotate(${rot}deg) scale(.85)`,
            opacity: on ? 1 : 0,
            transition: "opacity .5s ease-out, transform .6s cubic-bezier(.2,.8,.2,1)",
            transitionDelay: on ? `${400 + i * 80}ms` : "0ms",
            zIndex: 4 + (i % 3),
          }}
        >
          <div className="relative h-full w-full overflow-hidden" style={{ borderRadius: `${u(3)}cqw` }}>
            <Image src={`/images/empresas/equipo/${src}.webp`} alt="" fill sizes="160px" className="object-cover" style={{ objectPosition: pos }} />
          </div>
        </div>
      ))}

      {/* ── Vivabox hub: the mascot, headset on, connecting everyone ── */}
      <div
        className="absolute flex flex-col items-center"
        style={{
          left: `${u(HUB.x - 105)}cqw`,
          top: `${u(HUB.y - 140)}cqw`,
          width: `${u(210)}cqw`,
          zIndex: 7,
          ...pop(800),
        }}
      >
        <svg viewBox="0 0 480 464" style={{ width: `${u(205)}cqw`, height: "auto", overflow: "visible" }} aria-hidden="true">
          <image href="/images/empresas/mascota-hub.webp" width="480" height="464" />
          {/* headband */}
          <path d="M112 196 C88 12, 374 12, 352 188" fill="none" stroke={INK} strokeWidth="26" strokeLinecap="round" />
          <path d="M112 196 C88 12, 374 12, 352 188" fill="none" stroke={OR} strokeWidth="13" strokeLinecap="round" />
          {/* ear cups */}
          <rect x="92" y="178" width="38" height="72" rx="18" fill={OR} stroke={INK} strokeWidth="9" />
          <rect x="334" y="168" width="38" height="72" rx="18" fill={OR} stroke={INK} strokeWidth="9" />
          {/* mic boom */}
          <path d="M108 246 C112 312, 176 312, 208 274" fill="none" stroke={INK} strokeWidth="19" strokeLinecap="round" />
          <path d="M108 246 C112 312, 176 312, 208 274" fill="none" stroke={CREAM} strokeWidth="8" strokeLinecap="round" />
          <circle cx="212" cy="270" r="15" fill="#CB2033" stroke={INK} strokeWidth="7" />
        </svg>
        <img src="/icons/vivabox-white.webp" alt="" style={{ width: `${u(96)}cqw`, height: "auto", marginTop: `${u(-6)}cqw` }} />
        <div style={{ marginTop: `${u(7)}cqw` }}>
          <FourBar w={62} h={9} />
        </div>
      </div>


      {/* ── Experience cards (same colours and icons as the site) ── */}
      {CATS.map((c, j) => (
        <div
          key={c.name}
          className="absolute flex"
          style={{
            left: `${u(CX)}cqw`,
            top: `${u(cardY(j))}cqw`,
            width: `${u(CW)}cqw`,
            height: `${u(CH)}cqw`,
            background: CREAM,
            borderRadius: `${u(20)}cqw`,
            borderLeft: `${u(6)}cqw solid ${c.color}`,
            boxShadow: SHADOW,
            overflow: "hidden",
            zIndex: 6,
            ...pop(1500 + j * 110),
          }}
        >
          <div className="relative shrink-0" style={{ width: `${u(92)}cqw` }}>
            <Image src={expSrc(c.slug)} alt="" fill sizes="120px" className="object-cover" />
          </div>
          <div className="vbx-body min-w-0 flex flex-col items-start" style={{ padding: `${u(9)}cqw ${u(8)}cqw 0 ${u(11)}cqw` }}>
            <span className="vbx-pill inline-block font-semibold text-white whitespace-nowrap" style={{ background: c.color, fontSize: `${u(15)}cqw`, lineHeight: 1.25, borderRadius: `${u(12)}cqw`, padding: `${u(2)}cqw ${u(9)}cqw` }}>
              {c.name}
            </span>
            <div className="vbx-detail font-semibold text-ink whitespace-nowrap overflow-hidden text-ellipsis" style={{ fontSize: `${u(15)}cqw`, lineHeight: 1.2, marginTop: `${u(5)}cqw`, maxWidth: `${u(122)}cqw` }}>
              {c.title}
            </div>
            <div className="vbx-detail text-muted whitespace-nowrap" style={{ fontSize: `${u(13)}cqw`, marginTop: `${u(2)}cqw` }}>
              {c.place}
            </div>
          </div>
          <img src={`/images/box-includes/${c.icon}.svg`} alt="" className="absolute" style={{ right: `${u(12)}cqw`, bottom: `${u(10)}cqw`, width: `${u(46)}cqw`, height: `${u(40)}cqw`, objectFit: "contain" }} />
          <span
            className="absolute flex items-center justify-center text-white"
            style={{ right: 0, top: 0, width: `${u(30)}cqw`, height: `${u(30)}cqw`, background: "#8DB92F", borderRadius: `0 ${u(20)}cqw 0 ${u(20)}cqw` }}
          >
            <Check strokeWidth={3.5} style={{ width: `${u(16)}cqw`, height: `${u(16)}cqw` }} />
          </span>
        </div>
      ))}

      {/* ── Titles: condensed caps straight on the dark ── */}
      <Title l1="Tú compras" sub="1 solo pedido" cx={236} w={400} delay={100} pop={pop} />
      <Title l1="Cada persona" l2="elige" sub="su experiencia" cx={587} w={440} delay={250} pop={pop} />
      <Title l1="Vivabox" l2="se encarga" sub="de todo" cx={1125} w={290} delay={400} pop={pop} />

      {/* ── Signature ── */}
      <div
        className="absolute flex items-center justify-center"
        style={{ left: `${u(230)}cqw`, right: `${u(230)}cqw`, bottom: `${u(20)}cqw`, height: `${u(72)}cqw`, gap: `${u(22)}cqw`, borderRadius: `${u(36)}cqw`, background: CREAM, boxShadow: SHADOW, zIndex: 9, ...pop(1000) }}
      >
        <p className="font-semibold text-ink whitespace-nowrap" style={{ fontSize: `${u(38)}cqw`, lineHeight: 1, letterSpacing: "-0.02em" }}>
          Tú compras. <span className="text-primary">Nosotros nos ocupamos.</span>
        </p>
        <FourBar w={84} h={10} />
      </div>
    </div>
  );
}
