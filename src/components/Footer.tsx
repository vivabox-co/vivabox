"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { useConsentStore } from "@/features/consent/consentStore";

const linkClasses =
  "text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-sm";

function handleFaqClick(e: MouseEvent<HTMLAnchorElement>) {
  const target = document.getElementById("faq");
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function Footer() {
  const openCookiePanel = useConsentStore((s) => s.openPanel);

  return (
    <footer className="vb-dark bg-ink text-white py-12 md:py-14">

      <div className="max-w-6xl mx-auto px-6">

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-x-6 sm:gap-x-8 gap-y-8">

          {/* COLUMN 1 — BRAND */}
          <div className="col-span-2 row-start-1 lg:col-span-1 lg:col-start-1 lg:row-start-1">
            <h3 className="text-white font-semibold text-[17px] mb-3">
              Vivabox Colombia
            </h3>

            <p className="text-gray-400 text-sm leading-relaxed max-w-[220px]">
              Regala una caja.
              <br />
              Deja que elija la experiencia.
            </p>

            <div className="flex items-center gap-4 mt-3 lg:mt-4">
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

          {/* COLUMN 2 — EXPLORA (mobile: left, row 2) */}
          <nav
            aria-label="Explora Vivabox"
            className="col-start-1 row-start-2 lg:col-start-2 lg:row-start-1"
          >
            <h4 className="text-white font-semibold text-[15px] mb-3.5">
              Explora
            </h4>

            <ul className="space-y-3 text-sm">
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

          {/* COLUMN 3 — EMPRESAS (mobile: left, row 3) */}
          <nav
            aria-label="Empresas Vivabox"
            className="col-start-1 row-start-3 lg:col-start-3 lg:row-start-1"
          >
            <h4 className="text-white font-semibold text-[15px] mb-3.5">
              Empresas
            </h4>

            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/empresas" className={linkClasses}>
                  Regalos corporativos
                </Link>
              </li>
            </ul>
          </nav>

          {/* COLUMN 4 — ALIADOS (mobile: right, row 3) */}
          <nav
            aria-label="Aliados Vivabox"
            className="col-start-2 row-start-3 lg:col-start-4 lg:row-start-1"
          >
            <h4 className="text-white font-semibold text-[15px] mb-3.5">
              Aliados
            </h4>

            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/aliados" className={linkClasses}>
                  Ofrece una experiencia
                </Link>
              </li>
            </ul>
          </nav>

          {/* COLUMN 5 — AYUDA (mobile: right, row 2) */}
          <nav
            aria-label="Ayuda Vivabox"
            className="col-start-2 row-start-2 lg:col-start-5 lg:row-start-1"
          >
            <h4 className="text-white font-semibold text-[15px] mb-3.5">
              Ayuda
            </h4>

            <ul className="space-y-3 text-sm">
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
                <Link href="/#faq" onClick={handleFaqClick} className={linkClasses}>
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

          {/* COLUMN 6 — LEGAL (mobile: full width, row 4) */}
          <nav
            aria-label="Legal"
            className="col-span-2 row-start-4 lg:col-span-1 lg:col-start-6 lg:row-start-1"
          >
            <h4 className="text-white font-semibold text-[15px] mb-3.5">
              Legal
            </h4>

            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm lg:flex-col lg:flex-nowrap lg:gap-x-0 lg:space-y-3">
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
              <li>
                <button type="button" onClick={openCookiePanel} className={linkClasses}>
                  Preferencias de cookies
                </button>
              </li>
            </ul>
          </nav>

        </div>

        {/* LEGAL / TRUST */}
        <div className="border-t border-white/10 mt-6 pt-5 lg:mt-8 lg:pt-6">
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
