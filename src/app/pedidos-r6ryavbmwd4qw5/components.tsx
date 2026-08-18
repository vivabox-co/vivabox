"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { PAGE_PATH } from "./types"

export type StageTab = { href: string; label: string; icon: LucideIcon; countKey: string | null }

// Double vérification avant d'envoyer un server action form — utilisée par
// tous les boutons d'action des deux zones (pas seulement "Cancelar") pour
// éviter qu'un mauvais clic sur mobile ne fasse avancer/annuler une
// commande ou une réservation sans le vouloir.
//
// Le blocage se fait sur le clic du bouton, pas sur l'onSubmit du <form> :
// avec un action={fonction} (Server Action), React intercepte l'événement
// submit nativement pour déclencher l'action, et un preventDefault() posé
// depuis un onSubmit React arrive trop tard pour le bloquer de façon
// fiable. Annuler le clic empêche le submit de se déclencher du tout —
// aucun risque de course avec le mécanisme interne de React.
export function ConfirmSubmitButton({
  confirmMessage,
  className,
  children,
}: {
  confirmMessage: string
  className: string
  children: React.ReactNode
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault()
      }}
    >
      {children}
    </button>
  )
}

// Barre de navigation basse générique à 3 onglets — partagée par les deux
// zones (Pedidos/Reservas), qui ne diffèrent que par leurs tabs et leur
// couleur d'accent (orange vs noir espresso).
export function StageNav({
  tabs,
  counts,
  activeTextClass,
  badgeClass,
}: {
  tabs: StageTab[]
  counts: Record<string, number>
  activeTextClass: string
  badgeClass: string
}) {
  const pathname = usePathname()

  return (
    <nav className="vb-sticky-bar fixed bottom-0 left-0 right-0 flex z-10">
      <div className="flex w-full max-w-[860px] mx-auto">
        {tabs.map(({ href, label, icon: Icon, countKey }) => {
          const active = pathname === href
          const count = countKey ? counts[countKey] : null

          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 pt-2.5 px-1 pb-3.5 relative text-xs ${
                active ? `${activeTextClass} font-bold` : "text-muted font-medium"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.25 : 1.75} />
              {label}
              {!!count && (
                <span className={`absolute top-1 right-[28%] flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-white text-[10px] font-bold ${badgeClass}`}>
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// Sélecteur de zone permanent, en haut de chaque page des deux zones —
// permet de basculer Pedidos ⇄ Reservas en un clic, sans repasser par
// l'accueil. Chaque pastille garde sa couleur propre (orange/noir) qu'elle
// soit active ou non — elle ne doit jamais hériter de la teinte de la zone
// dans laquelle on se trouve actuellement.
export function ZoneSwitcher({ active }: { active: "pedidos" | "reservas" }) {
  return (
    <div className="flex gap-2 mb-5">
      <Link
        href={`${PAGE_PATH}/pedidos/por-preparar`}
        className={`flex-1 text-center rounded-[13px] px-3.5 py-2.5 text-sm font-semibold transition-colors ${
          active === "pedidos" ? "bg-primary text-white" : "vb-card text-muted"
        }`}
      >
        Pedidos
      </Link>
      <Link
        href={`${PAGE_PATH}/reservas/solicitadas`}
        className={`flex-1 text-center rounded-[13px] px-3.5 py-2.5 text-sm font-semibold transition-colors ${
          active === "reservas" ? "bg-[#18140F] text-white" : "vb-card text-muted"
        }`}
      >
        Reservas
      </Link>
    </div>
  )
}
