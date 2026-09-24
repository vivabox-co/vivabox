import Image from "next/image";
import { FileCheck2 } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import BrandRibbon from "@/components/ui/BrandRibbon";
import { homemadeApple } from "@/lib/fonts";

const WHATSAPP_URL =
  "https://wa.me/573142590291?text=" +
  encodeURIComponent(
    "Hola, quiero personalizar Vivabox para mi empresa.\nCantidad aproximada: \nFecha de entrega: "
  );

// Numbers match the pins on the mockup.
const ITEMS = [
  {
    title: "Tu logo en la caja",
    text: "En la faja de la caja, para que se note desde el primer momento.",
  },
  {
    title: "Los colores y motivos de tu marca",
    text: "Una caja con tu identidad, según el volumen del pedido.",
  },
  {
    title: "Un mensaje de tu empresa",
    text: "Una tarjeta impresa con las palabras que quieras decir.",
  },
  {
    title: "Un catálogo a tu medida",
    text: "Todo el catálogo con tu logo y tus colores, de la portada a la última página.",
  },
  {
    title: "Activación con tu marca",
    text: "Tu logo en la pantalla cuando la persona activa su regalo.",
  },
] as const;

/* ---------------------------------------------------------------------------
   Mockup — every size inside is in cqw (container width), so the whole
   composition scales as one picture from phone to desktop.
--------------------------------------------------------------------------- */

type Brand = "andes" | "nativa" | "seguros" | "aurora";

// Fictional companies, only there to show "your logo here" without a placeholder.
function FakeLogo({ brand, className = "" }: { brand: Brand; className?: string }) {
  // Andes is stacked (icon above the name) — it sits on the box sleeve,
  // where a centered printed mark reads more natural than an inline one.
  if (brand === "andes") {
    return (
      <span className={`inline-flex flex-col items-center gap-[0.35em] whitespace-nowrap text-[#1E3A8A] ${className}`}>
        <svg viewBox="0 0 24 16" className="h-[2.2em] w-auto" aria-hidden>
          <path d="M1 15 9 3l4 6 3-4 7 10z" fill="#1E3A8A" />
          <path d="M9 3l2 3-2 1-2-1z" fill="#fff" />
        </svg>
        <span className="text-[1.25em] leading-none tracking-[0.04em]">
          <span className="font-bold">ANDES</span> <span className="font-light">GROUP</span>
        </span>
      </span>
    );
  }
  if (brand === "nativa") {
    return (
      <span className={`inline-flex items-center gap-[0.35em] whitespace-nowrap text-[#166534] ${className}`}>
        <svg viewBox="0 0 16 16" className="h-[1.2em] w-auto" aria-hidden>
          <path d="M14 2C6 2 2 6 2 14c8 0 12-4 12-12z" fill="#16A34A" />
          <path d="M2.5 13.5 10 6" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <span className="font-bold leading-none tracking-[0.02em]">Nativa</span>
      </span>
    );
  }
  if (brand === "seguros") {
    return (
      <span className={`inline-flex items-center gap-[0.35em] whitespace-nowrap text-[#0369A1] ${className}`}>
        <svg viewBox="0 0 20 16" className="h-[1.2em] w-auto" aria-hidden>
          <path d="M1 6c3-3 6-3 9 0s6 3 9 0M1 11c3-3 6-3 9 0s6 3 9 0" fill="none" stroke="#0284C7" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
        <span className="leading-none">
          <span className="font-bold">Seguros</span> <span className="font-light">Latam</span>
        </span>
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-[0.35em] whitespace-nowrap text-[#7C2D12] ${className}`}>
      <svg viewBox="0 0 20 12" className="h-[1em] w-auto" aria-hidden>
        <path d="M2 11a8 8 0 0 1 16 0z" fill="#EA580C" />
        <path d="M0 11.5h20" stroke="#7C2D12" strokeWidth="1.2" />
      </svg>
      <span className="font-semibold leading-none tracking-[0.02em]">Grupo Aurora</span>
    </span>
  );
}

function Pin({ n, className = "" }: { n: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute z-40 flex h-[5.4cqw] w-[5.4cqw] min-h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[max(11px,2.5cqw)] font-semibold text-white ring-[3px] ring-ink ${className}`}
    >
      {n}
    </span>
  );
}

// Four sleeve swatches: different colors AND patterns, to read as "anything goes".
const SWATCHES = [
  {
    rotate: "-rotate-[16deg]",
    style: {
      backgroundColor: "#1E3A8A",
      backgroundImage: "radial-gradient(#F5B301 22%, transparent 24%)",
      backgroundSize: "18% 18%",
    },
  },
  {
    rotate: "-rotate-[5deg]",
    style: {
      backgroundColor: "#0F766E",
      backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.4) 0 2px, transparent 2px 8px)",
    },
  },
  {
    rotate: "rotate-[6deg]",
    style: {
      backgroundColor: "#F4EDE2",
      backgroundImage: "repeating-radial-gradient(circle at 0 100%, transparent 0 7px, #C2410C 7px 9px)",
    },
  },
  {
    rotate: "rotate-[17deg]",
    style: {
      backgroundColor: "#BE185D",
      backgroundImage:
        "conic-gradient(rgba(255,255,255,0.28) 25%, transparent 0 50%, rgba(255,255,255,0.28) 0 75%, transparent 0)",
      backgroundSize: "25% 25%",
    },
  },
] as const;

function Mockup() {
  return (
    <div
      className="@container relative mx-auto aspect-[5/6] w-full max-w-[500px]"
      role="img"
      aria-label="Vivabox personalizada para empresas: logo en la caja, colores y motivos de marca, tarjeta con mensaje, catálogo con su identidad y pantalla de activación con el logo de la empresa"
    >

      {/* 4 — CATÁLOGO: the whole catalogue in the company's colors —
          an inside page behind, the cover in front */}
      <div className="absolute right-[2%] top-0 w-[31%] rotate-[9deg]">
        <div className="aspect-square overflow-hidden rounded-[0.8cqw] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.45)]">
          <div className="h-[2.6cqw] bg-[#16A34A]" />
          <div className="p-[2cqw]">
            <div className="relative aspect-[16/9] overflow-hidden rounded-[0.5cqw]">
              <Image
                src="/images/experiencias-reales/cata-chocolate-bogota-vivabox/cata-chocolate-bogota-vivabox-1.webp"
                alt=""
                fill
                sizes="160px"
                className="object-cover"
              />
            </div>
            <span className="mt-[1.6cqw] block h-[1cqw] w-[70%] rounded-full bg-[#16A34A]/70" />
            <span className="mt-[1.2cqw] block h-[0.7cqw] w-full rounded-full bg-ink/12" />
            <span className="mt-[0.9cqw] block h-[0.7cqw] w-[85%] rounded-full bg-ink/12" />
          </div>
        </div>
      </div>
      <div className="absolute right-[15%] top-[9%] z-20 w-[31%] -rotate-[4deg]">
        <div className="relative aspect-square overflow-hidden rounded-[0.8cqw] shadow-[0_14px_30px_rgba(0,0,0,0.45)]">
          <Image
            src="/images/experiencias-reales/carpa-glamping-embalse-guatavita-vivabox/carpa-glamping-embalse-guatavita-vivabox-1.webp"
            alt=""
            fill
            sizes="160px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
          <span className="absolute left-[7%] top-[7%] rounded-[0.8cqw] bg-white px-[1.4cqw] py-[1cqw] shadow-md">
            <FakeLogo brand="nativa" className="text-[1.8cqw]" />
          </span>
          <p className="absolute bottom-[12%] left-[7%] text-[1.5cqw] font-medium uppercase leading-tight tracking-[0.14em] text-white">
            Catálogo de
            <span className="block text-[2.3cqw] font-semibold tracking-[0.1em]">experiencias</span>
          </p>
          <div className="absolute inset-x-0 bottom-0 h-[1.4cqw] bg-[#16A34A]" />
        </div>
        <Pin n={4} className="-right-[1.5cqw] -top-[1.5cqw]" />
      </div>

      {/* 1 — CAJA with a company logo on the sleeve */}
      <div className="absolute left-0 top-[11%] z-10 w-[66%]">
        <div className="relative aspect-square">
          <Image
            src="/images/box-includes/vivabox-caja-regalo.webp"
            alt=""
            fill
            sizes="(min-width: 768px) 330px, 66vw"
            className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
          />
          {/* Covers the Vivabox logo on the sleeve */}
          <div className="absolute left-[28.5%] top-[31.5%] flex h-[18.5%] w-[45.5%] items-center justify-center bg-[#FBFBFA]">
            <FakeLogo brand="andes" className="text-[2.5cqw]" />
            <Pin n={1} className="-left-[2cqw] -top-[2cqw]" />
          </div>
        </div>
      </div>

      {/* 2 — COLORES Y MOTIVOS */}
      <div className="absolute left-[1%] top-[56%] z-20 h-[13cqw] w-[30cqw]">
        {SWATCHES.map((s, i) => (
          <span
            key={i}
            className={`absolute top-0 h-[13cqw] w-[13cqw] origin-bottom rounded-[1cqw] ring-2 ring-white shadow-[0_8px_18px_rgba(0,0,0,0.4)] ${s.rotate}`}
            style={{ left: `${i * 5.5}cqw`, ...s.style }}
          />
        ))}
        <Pin n={2} className="-left-[1.5cqw] -top-[2cqw]" />
      </div>

      {/* 3 — TARJETA: same look as the homepage carousel card, company text */}
      <div className="absolute bottom-[1%] left-[16%] z-20 w-[33%] -rotate-[4deg]">
        <div className="relative flex aspect-square flex-col justify-center rounded-[0.6cqw] bg-[#FBF9F2] px-[3.4cqw] shadow-[0_14px_30px_rgba(0,0,0,0.45)]">
          <p className={`${homemadeApple.className} -mt-[2cqw] text-[2.5cqw] leading-[1.9] text-[#1F2A44]`}>
            Gracias por este año juntos.
            <br />
            Te lo mereces.
          </p>
          <svg viewBox="0 0 60 24" className="absolute bottom-[21%] right-[10%] w-[9cqw]" aria-hidden>
            <path d="M40 9c-2-4-7-3-7 1 0 3 4 6 7 8 3-2 7-5 7-8 0-4-5-5-7-1z" fill="none" stroke="#1F2A44" strokeWidth="1.4" />
            <path d="M18 23 58 20" stroke="#1F2A44" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <FakeLogo brand="aurora" className="absolute bottom-[9%] left-[10%] text-[1.6cqw]" />
        </div>
        <Pin n={3} className="-left-[1.5cqw] -top-[1.5cqw]" />
      </div>

      {/* 5 — ACTIVACIÓN on a phone */}
      <div className="absolute bottom-0 right-[3%] z-30 w-[30%] rotate-[3deg]">
        <div className="rounded-[4.6cqw] bg-[#0f0d0a] p-[0.9cqw] shadow-[0_18px_40px_rgba(0,0,0,0.55)] ring-1 ring-white/15">
          <div
            className="relative flex aspect-[9/19] flex-col items-center overflow-hidden rounded-[3.8cqw] px-[1.8cqw]"
            style={{
              background:
                "radial-gradient(60% 35% at 20% 30%, rgba(251,146,60,0.55), transparent 70%), radial-gradient(45% 30% at 85% 65%, rgba(250,204,21,0.45), transparent 70%), linear-gradient(#7FB7E3, #BFD9EE 55%, #DCE7EF)",
            }}
          >
            <span className="mt-[1.6cqw] h-[1.8cqw] w-[8cqw] rounded-full bg-[#0f0d0a]" />

            <span className="mt-[7cqw] rounded-[1.4cqw] bg-white px-[2cqw] py-[1.4cqw] shadow-md">
              <FakeLogo brand="seguros" className="text-[1.9cqw]" />
            </span>

            <div className="mt-[3cqw] w-full rounded-[2.4cqw] bg-white/85 px-[1.8cqw] py-[3cqw] text-center">
              <p className="text-[1.7cqw] font-semibold leading-tight text-[#1E293B]">
                Te hicieron un regalo.
              </p>
              <p className="mt-[1cqw] text-[2.3cqw] font-bold leading-tight text-[#1E293B]">
                Ahora <span className="text-primary">eliges tú</span> la experiencia.
              </p>
              <p className="mt-[1.2cqw] text-[1.4cqw] leading-snug text-[#475569]">
                Descubre las experiencias disponibles para ti.
              </p>
              <span className="mt-[2.4cqw] flex h-[4.4cqw] items-center justify-center rounded-[1.2cqw] bg-[#1E293B] text-[1.6cqw] font-semibold text-white">
                Empezar
              </span>
            </div>
          </div>
        </div>
        <Pin n={5} className="-right-[1.5cqw] -top-[1.5cqw]" />
      </div>

    </div>
  );
}

export default function EmpresasCustomization() {
  return (
    <section className="vb-dark bg-ink">

      <div className="max-w-6xl mx-auto px-6 py-14 md:py-20 grid md:grid-cols-2 md:items-center gap-x-16 gap-y-10">

        {/* HEADER */}
        <Reveal className="md:col-start-1 md:row-start-1 md:self-end">
          <div className="text-white">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.01em] mb-4">
              Personaliza tu Vivabox
            </h2>
            <p className="text-white/70 text-lg leading-snug max-w-[440px]">
              Un regalo con el sello de tu empresa, de la caja a la activación.
            </p>
          </div>
        </Reveal>

        {/* MOCKUP */}
        <Reveal delay={120} className="md:col-start-2 md:row-start-1 md:row-span-2">
          <Mockup />
        </Reveal>

        {/* LIST + CTA */}
        <Reveal className="md:col-start-1 md:row-start-2 md:self-start">
          <div className="text-white">

            <ol className="space-y-4 mb-8">
              {ITEMS.map((item, i) => (
                <li key={item.title} className="flex gap-3.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-semibold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-[15px] leading-snug">{item.title}</p>
                    <p className="text-white/60 text-[14px] leading-relaxed">{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <p className="flex items-start gap-2 text-white/70 text-[14px] leading-relaxed mb-6 max-w-[440px]">
              <FileCheck2 size={18} strokeWidth={1.5} className="text-primary shrink-0 mt-0.5" />
              Cada proyecto es distinto. Antes de producir, te enviamos una maqueta para validar.
            </p>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-12 px-7 rounded-[16px] bg-primary text-white text-[15px] font-semibold hover:bg-primary-hover transition shadow-[0_12px_30px_rgba(255,132,6,0.3)]"
            >
              Hablemos de tu Vivabox
            </a>

          </div>
        </Reveal>

      </div>

      <BrandRibbon />

    </section>
  );
}
