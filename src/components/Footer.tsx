import Link from "next/link";

const linkClasses =
  "text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-sm";

export default function Footer() {
  return (
    <footer className="vb-dark bg-ink text-white py-20 md:py-24">

      <div className="max-w-6xl mx-auto px-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-14">

          {/* COLUMN 1 — BRAND */}
          <div className="lg:col-span-1">
            <h3 className="text-white font-semibold text-[17px] mb-5">
              Vivabox Colombia
            </h3>

            <p className="text-gray-400 text-sm leading-relaxed max-w-[220px]">
              Regala una caja.
              <br />
              Deja que elija la experiencia.
            </p>
          </div>

          {/* COLUMN 2 — EXPLORA */}
          <nav aria-label="Explora Vivabox">
            <h4 className="text-white font-semibold text-[15px] mb-5">
              Explora
            </h4>

            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/#incluye" className={linkClasses}>
                  Cómo funciona
                </Link>
              </li>
              <li>
                <Link href="/#incluye" className={linkClasses}>
                  La caja
                </Link>
              </li>
              <li>
                <Link href="/#experiencias" className={linkClasses}>
                  Catálogo de experiencias
                </Link>
              </li>
            </ul>
          </nav>

          {/* COLUMN 3 — EMPRESAS */}
          <nav aria-label="Empresas Vivabox">
            <h4 className="text-white font-semibold text-[15px] mb-5">
              Empresas
            </h4>

            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/empresas" className={linkClasses}>
                  Regalos corporativos
                </Link>
              </li>
            </ul>
          </nav>

          {/* COLUMN 4 — ALIADOS */}
          <nav aria-label="Aliados Vivabox">
            <h4 className="text-white font-semibold text-[15px] mb-5">
              Aliados
            </h4>

            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/proximamente" className={linkClasses}>
                  Ofrece una experiencia
                </Link>
              </li>
            </ul>
          </nav>

          {/* COLUMN 5 — AYUDA */}
          <nav aria-label="Ayuda Vivabox">
            <h4 className="text-white font-semibold text-[15px] mb-5">
              Ayuda
            </h4>

            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/proximamente" className={linkClasses}>
                  Activar mi Vivabox
                </Link>
              </li>
              <li>
                <Link href="/#faq" className={linkClasses}>
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/573142590291"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClasses}
                >
                  Contáctanos
                </a>
              </li>
            </ul>
          </nav>

        </div>

        {/* LEGAL / TRUST */}
        <div className="border-t border-white/10 mt-16 pt-8">
          <p className="text-xs text-gray-500 mb-2">
            Empresa colombiana de regalos de experiencias.
          </p>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Vivabox Colombia SAS · NIT 902.043.916-8 · Bogotá, Colombia
          </p>
        </div>

      </div>

    </footer>
  );
}
