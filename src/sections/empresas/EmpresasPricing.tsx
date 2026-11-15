import { Truck, MessageCircleHeart, ReceiptText, CalendarClock, Landmark, Timer } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

const TIERS = [
  { range: "1 a 4 boxes", price: "$199.000", note: "Precio de cada box", featured: false },
  { range: "5 a 19 boxes", price: "$194.900", note: "Por cada box", featured: false },
  { range: "20 a 99 boxes", price: "$189.900", note: "Por cada box", featured: true },
  { range: "100 o más", price: "A tu medida", note: "Armamos tu cotización", featured: false },
] as const;

const DETAILS = [
  { icon: Truck, text: "Un solo envío a tu empresa" },
  { icon: MessageCircleHeart, text: "Mensaje personalizado" },
  { icon: ReceiptText, text: "Factura electrónica" },
  { icon: CalendarClock, text: "Código válido 6 meses" },
  { icon: Landmark, text: "Transferencia, anticipo 50 %" },
  { icon: Timer, text: "Listo en 3-4 días (10 si le pones tu logo a la caja)" },
] as const;

export default function EmpresasPricing() {
  return (
    <section id="precios-empresas" className="vb-light vb-surface-base">

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-14">

        <Reveal>
          <h2 className="text-3xl md:text-4xl font-semibold text-center tracking-[-0.01em] text-ink mb-2">
            Precio y facturación
          </h2>
          <p className="text-ink/70 text-center text-[15px] mb-5 md:mb-8">
            Entre más personas sorprendes, menos pagas por cada box.
          </p>
        </Reveal>

        {/* TIERS */}
        <Reveal delay={80}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-5">
            {TIERS.map((tier) => (
              <div
                key={tier.range}
                className={
                  tier.featured
                    ? "relative rounded-[26px] bg-ink text-white text-center px-3 py-4 md:py-5 shadow-[0_12px_26px_rgba(24,20,15,0.28)]"
                    : "vb-card relative text-center px-3 py-4 md:py-5"
                }
              >
                {tier.featured && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary text-white text-[11px] font-semibold px-3 py-0.5">
                    Nuestro mejor precio
                  </span>
                )}
                <p className={`text-[13px] mb-1 ${tier.featured ? "text-white/70" : "text-ink/65"}`}>
                  {tier.range}
                </p>
                <p className="text-[22px] md:text-[26px] font-semibold leading-tight tracking-tight">
                  {tier.price}
                </p>
                <p className={`text-[12px] mt-1 ${tier.featured ? "text-white/60" : "text-ink/55"}`}>
                  {tier.note}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* DETAILS */}
        <Reveal delay={140}>
          <ul className="vb-card grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-3 md:gap-y-4 px-4 py-4 md:px-8 md:py-5">
            {DETAILS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.text} className="flex items-start gap-2 md:gap-3 text-ink text-[12.5px] md:text-[14px] leading-snug">
                  <Icon size={18} strokeWidth={1.5} className="text-primary shrink-0 mt-0.5" />
                  <span>{item.text}</span>
                </li>
              );
            })}
          </ul>
        </Reveal>

      </div>

    </section>
  );
}
