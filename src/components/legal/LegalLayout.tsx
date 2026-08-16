import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsappButton from "@/components/WhatsappButton";
import BrandRibbon from "@/components/ui/BrandRibbon";

const LEGAL_LINKS = [
  { href: "/terminos-y-condiciones", label: "Términos y condiciones" },
  { href: "/politica-de-datos", label: "Política de tratamiento de datos" },
  { href: "/cambios-y-devoluciones", label: "Cambios y devoluciones" },
];

export default function LegalLayout({
  eyebrow,
  title,
  updated,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />

      <main className="pt-[72px] bg-white">
        <BrandRibbon />

        <div className="container max-w-[720px] py-14 md:py-20">

          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary mb-4">
            {eyebrow}
          </p>

          <h1 className="h2 text-ink mb-2">{title}</h1>

          <p className="text-sm text-muted mb-8">
            Última actualización: {updated}
          </p>

          <p className="text-[17px] leading-relaxed text-ink/80 mb-10 max-w-[60ch]">
            {intro}
          </p>

          <div className="legal-prose">{children}</div>

          <div className="mt-16 pt-8 border-t border-black/10 space-y-4">
            <p className="text-sm text-muted">
              ¿Tienes dudas sobre este documento? Escríbenos a{" "}
              <a href="mailto:contact@vivabox.com.co" className="text-primary underline underline-offset-2">
                contact@vivabox.com.co
              </a>{" "}
              o por{" "}
              <a
                href="https://wa.me/573142590291"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                WhatsApp
              </a>
              .
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted hover:text-ink transition-colors underline underline-offset-2"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
      <WhatsappButton />
    </>
  );
}
