type ToggleSwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}

export function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-rocket-orange" : "bg-placeholder-bg"
      }`}>
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-text-primary shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  )
}
