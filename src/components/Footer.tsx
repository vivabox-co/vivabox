import Link from "next/link";

const linkClasses =
  "text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-sm";

export default function Footer() {
  return (
    <footer className="vb-dark bg-ink text-white py-20 md:py-24">

      <div className="max-w-6xl mx-auto px-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-x-8 gap-y-14">

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

            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://www.instagram.com/vivaboxcolombia/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Vivabox en Instagram"
                className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-sm"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4.2" />
                  <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>

              <a
                href="https://www.linkedin.com/company/vivabox-colombia"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Vivabox en LinkedIn"
                className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-sm"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.83v1.64h.05c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21h-4V9Z" />
                </svg>
              </a>
            </div>
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
                <a
                  href="https://app.vivabox.com.co/activar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClasses}
                >
                  Activar mi Vivabox
                </a>
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

          {/* COLUMN 6 — LEGAL */}
          <nav aria-label="Legal">
            <h4 className="text-white font-semibold text-[15px] mb-5">
              Legal
            </h4>

            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/terminos-y-condiciones" className={linkClasses}>
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="/politica-de-datos" className={linkClasses}>
                  Política de tratamiento de datos
                </Link>
              </li>
              <li>
                <Link href="/cambios-y-devoluciones" className={linkClasses}>
                  Cambios y devoluciones
                </Link>
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
