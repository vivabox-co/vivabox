import { Landmark, Timer, ReceiptText, CalendarClock, MessageCircle } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

const TIERS = [
  { range: "1 a 4 boxes", price: "$199.000", note: "Precio de cada box", featured: false },
  { range: "5 a 19 boxes", price: "$194.900", note: "Por cada box", featured: false },
  { range: "20 a 99 boxes", price: "$189.900", note: "Por cada box", featured: true },
  { range: "100 o más", price: "A tu medida", note: "Armamos tu cotización", featured: false },
] as const;

const DETAILS = [
  { icon: ReceiptText, text: "Factura electrónica" },
  { icon: Landmark, text: "Transferencia, anticipo 50 %" },
  { icon: CalendarClock, text: "Código válido 6 meses" },
  { icon: Timer, text: "10 días si le pones tu logo a la caja" },
] as const;

export default function EmpresasPricing() {
  return (
    <section id="precios-empresas" className="vb-light vb-surface-base">

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">

        <Reveal>
          <h2 className="text-2xl md:text-3xl font-semibold text-center tracking-[-0.01em] text-ink mb-1">
            Precio y facturación
          </h2>
          <p className="text-ink/70 text-center text-[14px] md:text-[15px] mb-4 md:mb-5">
            Entre más personas sorprendes, menos pagas por cada box.
          </p>
        </Reveal>

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
              </div>
            ))}
          </div>
        </Reveal>

        {/* DETAILS */}
        <Reveal delay={140}>
          <ul className="vb-card flex flex-wrap justify-between gap-x-6 gap-y-2.5 px-4 py-3.5 md:px-7 md:py-4">
            {DETAILS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.text} className="flex items-center gap-2 md:gap-3 whitespace-nowrap text-ink text-[13px] md:text-[14px] leading-snug">
                  <Icon size={18} strokeWidth={1.5} className="text-primary shrink-0" />
                  <span>{item.text}</span>
                </li>
              );
            })}
          </ul>
        </Reveal>

        {/* QUOTE */}
        <Reveal delay={200}>
          <div className="mt-4 md:mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-4 text-center">
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
        </Reveal>

      </div>

    </section>
  );
}
