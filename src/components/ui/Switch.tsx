"use client"

type SwitchProps = {
  checked: boolean
  onChange?: (value: boolean) => void
  disabled?: boolean
  label: string
}

// Piste compacte (40x22, lisible visuellement) dans un bouton de 44x44 —
// la cible tactile respecte WCAG sans agrandir le composant visuel.
export default function Switch({ checked, onChange, disabled, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span
        className="relative inline-block h-[22px] w-[40px] rounded-full transition-colors duration-200"
        style={{ background: checked ? "var(--color-ink)" : "var(--nm-border)" }}
      >
        <span
          className="absolute top-[3px] h-[16px] w-[16px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-transform duration-200"
          style={{ transform: checked ? "translateX(21px)" : "translateX(3px)" }}
        />
      </span>
    </button>
  )
}
