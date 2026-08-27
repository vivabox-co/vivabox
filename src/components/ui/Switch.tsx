"use client"

// Géométrie explicite — jamais de translateX "aveugle" sur une position de
// base implicite (c'est ce qui causait le débordement du thumb en ON).
// TRAVEL = largeur du track - largeur du thumb - (2 x padding).
const TRACK_WIDTH = 42
const TRACK_HEIGHT = 24
const THUMB_SIZE = 18
const PADDING = 3
const TRAVEL = TRACK_WIDTH - THUMB_SIZE - PADDING * 2 // 18px, thumb toujours contenu

type SwitchProps = {
  checked: boolean
  onChange?: (value: boolean) => void
  disabled?: boolean
  label: string
}

// Piste 42x24 dans un bouton de 44x44 — la cible tactile respecte WCAG sans
// agrandir le composant visuel.
export default function Switch({ checked, onChange, disabled, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span
        className="relative block rounded-full border transition-colors duration-200"
        style={{
          width: TRACK_WIDTH,
          height: TRACK_HEIGHT,
          background: checked ? "var(--color-ink)" : "#A79C8C",
          borderColor: checked ? "var(--color-ink)" : "rgba(24, 20, 15, 0.25)",
        }}
      >
        <span
          className="absolute rounded-full bg-white transition-transform duration-200"
          style={{
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            top: PADDING,
            left: PADDING,
            boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
            transform: `translateX(${checked ? TRAVEL : 0}px)`,
          }}
        />
      </span>
    </button>
  )
}
