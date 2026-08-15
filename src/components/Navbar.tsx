"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, QrCode, Menu, X } from "lucide-react"
import { useCheckoutStore } from "@/features/checkout/checkoutStore"

export default function Navbar() {

  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const box = useCheckoutStore((s) => s.box)
  const quantity = useCheckoutStore((s) => s.quantity)
  const hasHydrated = useCheckoutStore((s) => s.hasHydrated)

  const cartHref = box ? `/checkout/${box.slug}` : "/#incluye"
  const cartCount = hasHydrated && box ? quantity : 0

  // Brief pulse whenever the count changes, so adding/adjusting a box gives
  // visible feedback on the nav icon without a toast.
  const [bump, setBump] = useState(false)
  const prevCount = useRef(cartCount)

  useEffect(() => {
    if (cartCount !== prevCount.current) {
      prevCount.current = cartCount
      if (cartCount > 0) {
        setBump(true)
        const t = setTimeout(() => setBump(false), 300)
        return () => clearTimeout(t)
      }
    }
  }, [cartCount])

  const isCheckout = pathname.startsWith("/checkout")

  const forceSolid =
    isCheckout ||
    pathname.startsWith("/experiencias") ||
    pathname.startsWith("/carrito") ||
    pathname.startsWith("/activar") ||
    pathname.startsWith("/nuestra-historia")

  useEffect(() => {
    if (forceSolid) return

    const handleScroll = () => {
      setScrolled(window.scrollY > 60)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)

  }, [forceSolid])

  const solid = forceSolid || scrolled

  return (
    <>
      {/* HEADER */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          solid
            ? "bg-white/80 backdrop-blur-md border-b border-black/5 shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
            : "bg-transparent"
        }`}
      >

        <nav className="max-w-[1200px] mx-auto h-[72px] flex items-center justify-between px-4 md:px-6">

          {/* LEFT */}
          <div className="flex items-center gap-3">

            {!isCheckout && (
              <button
                onClick={() => setMenuOpen(true)}
                className={`md:hidden transition hover:scale-105 translate-y-[2px] ${
                  solid ? "text-foreground" : "text-white"
                }`}
              >
                <Menu size={28} strokeWidth={1.5} />
              </button>
            )}

            <Link
              href="/"
              onClick={(e) => {
                if (pathname === "/") {
                  e.preventDefault()
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }
              }}
              className="flex items-center gap-2 py-2 pr-2 group"
            >

              <Image
                src={solid ? "/icons/logo.webp" : "/icons/logo-white.webp"}
                alt="Vivabox"
                width={42}
                height={42}
                priority
                className="transition group-hover:scale-105"
              />

              <Image
                src={solid ? "/icons/vivabox.webp" : "/icons/vivabox-white.webp"}
                alt="Vivabox"
                width={110}
                height={28}
                priority
                className="transition group-hover:opacity-80"
              />

            </Link>

          </div>

          {/* NAV DESKTOP */}
          {!isCheckout && (
            <div
              className={`hidden md:flex gap-8 text-[15px] transition-colors ${
                solid ? "text-ink" : "text-white"
              }`}
            >
              <Link href="/#incluye">Cómo funciona</Link>
              <Link href="/#incluye">Cajas</Link>
              <Link href="/#experiencias">Experiencias</Link>
              <Link href="/proximamente?next=/empresas">Empresas</Link>
              <Link href="/proximamente?next=/nuestra-historia">Nuestra historia</Link>
            </div>
          )}

          {/* ACTIONS */}
          {!isCheckout && (
            <div className="flex items-center gap-2 md:gap-3">

              {/* CTA SECONDARY (activation) */}
              <Link
                href="/proximamente"
                className={`
                  inline-flex items-center gap-2
                  h-10 px-3.5 md:px-4
                  text-sm font-semibold
                  whitespace-nowrap shrink-0
                  transition-all duration-200
                  rounded-[18px] border-2
                  ${
                    solid
                      ? "border-ink/40 text-ink hover:bg-ink hover:text-white hover:border-ink"
                      : "border-white text-white hover:bg-white hover:text-primary"
                  }
                `}
              >
                <QrCode size={16} strokeWidth={1.5} />
                <span className="hidden sm:inline">Activar mi box</span>
                <span className="sm:hidden">Activar</span>
              </Link>

              {/* CART */}
              <Link
                href={cartHref}
                className={`relative p-2 rounded-full transition ${
                  solid
                    ? "text-ink hover:bg-black/5"
                    : "text-white hover:bg-white/20"
                }`}
              >
                <ShoppingCart size={24} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span
                    className={`absolute top-0.5 right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-semibold leading-none transition-transform duration-300 ${
                      bump ? "scale-125" : "scale-100"
                    }`}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>

            </div>
          )}

        </nav>
      </header>

      {/* MOBILE MENU */}
<div
  className={`fixed inset-0 z-50 ${
    menuOpen ? "pointer-events-auto" : "pointer-events-none"
  }`}
>

  {/* OVERLAY */}
  <div
    onClick={() => setMenuOpen(false)}
    className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
      menuOpen ? "opacity-100" : "opacity-0"
    }`}
  />

  {/* PANEL */}
  <div
    className={`absolute left-0 top-0 h-full w-[300px] bg-[var(--color-base)] shadow-[10px_0_30px_var(--nm-dark)] transform transition-transform duration-300 ${
      menuOpen ? "translate-x-0" : "-translate-x-full"
    }`}
  >

    <div className="p-6 flex flex-col h-full">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">
        <p className="text-[18px] font-medium text-foreground">
          Vivabox
        </p>

        <button
          onClick={() => setMenuOpen(false)}
          className="vb-icon-btn p-1.5"
        >
          <X size={24} strokeWidth={1.5} />
        </button>
      </div>

      {/* CTA PRIMARY */}
<Link
  href="/#incluye"
  onClick={() => setMenuOpen(false)}
  className="vb-btn-secondary mb-4 h-12 font-medium"
>
  Ver las cajas
</Link>

{/* CTA SECONDARY */}
{!isCheckout && (
  <Link
    href="/proximamente"
    onClick={() => setMenuOpen(false)}
    className="vb-btn-soft mb-10 h-12 font-medium"
  >
    <QrCode size={15} strokeWidth={1.5} />
    Activar mi box
  </Link>
)}

      {/* NAV */}
      <div className="flex flex-col gap-7 text-[16px] text-foreground">

        <Link href="/#incluye" onClick={() => setMenuOpen(false)}>
          Cómo funciona
        </Link>

        <Link href="/#experiencias" onClick={() => setMenuOpen(false)}>
          Experiencias
        </Link>

        <Link href="/proximamente?next=/empresas" onClick={() => setMenuOpen(false)}>
          Empresas
        </Link>

      </div>

      {/* SEPARATOR */}
      <div className="my-10 border-t border-black/10" />

      {/* SECONDARY */}
      <div className="flex flex-col gap-5 text-[15px] text-gray-500">

        <Link href="/proximamente?next=/nuestra-historia" onClick={() => setMenuOpen(false)}>
          Nuestra historia
        </Link>

        {!isCheckout && (
          <Link
            href={cartHref}
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2"
          >
            Carrito
            {cartCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-semibold leading-none">
                {cartCount}
              </span>
            )}
          </Link>
        )}

      </div>

      {/* TRUST (minimal) */}
      <div className="mt-auto pt-6 text-xs text-gray-400">
        +20 experiencias · Confirmación rápida
      </div>

    </div>
  </div>
</div>
    </>
  )
}