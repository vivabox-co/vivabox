import { Landmark, Timer, ReceiptText, CalendarClock, MessageCircle, Check } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

const TIERS = [
  { range: "1 a 4 boxes", price: "$199.000", note: "Precio de cada box", logo: "Con tu logo: $209.900", logoIncluded: false, featured: false },
  { range: "5 a 19 boxes", price: "$194.900", note: "Por cada box", logo: "Con tu logo: $199.000", logoIncluded: false, featured: false },
  { range: "20 a 99 boxes", price: "$189.900", note: "Por cada box", logo: "Tu logo, sin costo extra", logoIncluded: true, featured: true },
  { range: "100 o más", price: "A tu medida", note: "Armamos tu cotización", logo: "Tu logo, sin costo extra", logoIncluded: true, featured: false },
] as const;

const DETAILS = [
  { icon: ReceiptText, text: "Factura electrónica" },
  { icon: Landmark, text: "Transferencia, anticipo 50 %" },
  { icon: CalendarClock, text: "Código válido 6 meses" },
  { icon: Timer, text: "10 días si le pones tu logo a la caja" },
] as const;

const quote = (
  <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-4 lg:flex-col lg:items-start lg:gap-3 text-center lg:text-left">
    <p className="text-ink/70 text-[14px] md:text-[15px]">
      ¿Más de 100 personas, o un pedido especial? Te armamos la cotización.
    </p>
    <a
      href="https://wa.me/573142590291?text=Hola%2C%20quiero%20una%20cotizaci%C3%B3n%20de%20Vivabox%20para%20mi%20empresa."
      target="_blank"
      rel="noopener noreferrer"
      className="vb-btn-primary inline-flex items-center gap-2 whitespace-nowrap px-5 py-2 text-[14px]"
    >
      <MessageCircle size={16} strokeWidth={1.8} />
      Pedir cotización
    </a>
  </div>
);

export default function EmpresasPricing() {
  return (
    <section id="precios-empresas" className="vb-light vb-surface-base">

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 lg:py-10 lg:grid lg:grid-cols-[280px_1fr] lg:gap-10 lg:items-center">

        <Reveal>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-center lg:text-left tracking-[-0.01em] text-ink mb-1 lg:mb-3">
            Precio y facturación
          </h2>
          <p className="text-ink/70 text-center lg:text-left text-[14px] md:text-[15px] mb-4 md:mb-5 lg:mb-5">
            Entre más personas sorprendes, menos pagas por cada box.
          </p>
          <div className="hidden lg:block">{quote}</div>
        </Reveal>

        <div>

        {/* TIERS */}
        <Reveal delay={80}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-3 md:mb-4">
            {TIERS.map((tier) => (
              <div
                key={tier.range}
                className={
                  tier.featured
                    ? "relative rounded-[26px] bg-ink text-white text-center px-3 py-3 md:py-4 shadow-[0_12px_26px_rgba(24,20,15,0.28)]"
                    : "vb-card relative text-center px-3 py-3 md:py-4"
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
                <p
                  className={`mt-2.5 pt-2.5 border-t flex items-center justify-center gap-1 text-[12px] md:text-[13px] leading-snug ${
                    tier.featured ? "border-white/15" : "border-ink/10"
                  } ${
                    tier.logoIncluded
                      ? `font-semibold ${tier.featured ? "text-white" : "text-ink"}`
                      : tier.featured ? "text-white/70" : "text-ink/65"
                  }`}
                >
                  {tier.logoIncluded && <Check size={14} strokeWidth={2.4} className="text-primary shrink-0" />}
                  <span>{tier.logo}</span>
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* DETAILS */}
        <Reveal delay={140}>
          <ul className="vb-card flex flex-wrap lg:flex-nowrap justify-between gap-x-6 lg:gap-x-4 gap-y-2.5 px-4 py-3.5 md:px-7 lg:px-5 md:py-4">
            {DETAILS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.text} className="flex items-center gap-2 md:gap-3 lg:gap-2 whitespace-nowrap text-ink text-[13px] md:text-[14px] lg:text-[13px] leading-snug">
                  <Icon size={18} strokeWidth={1.5} className="text-primary shrink-0" />
                  <span>{item.text}</span>
                </li>
              );
            })}
          </ul>
        </Reveal>

        {/* QUOTE (mobile: below; desktop: in the title column) */}
        <Reveal delay={200} className="lg:hidden">
          <div className="mt-4 md:mt-5">{quote}</div>
        </Reveal>

        </div>

      </div>

    </section>
  );
}
