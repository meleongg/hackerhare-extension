import { useState } from "react"

import { LogoShield } from "~components/icons/LogoShield"
import { RabbitHead } from "~components/icons/RabbitHead"
import { ToggleSwitch } from "~components/ToggleSwitch"

import "~style.css"

const VERSION = "0.0.1"
const THREATS_INTERCEPTED = 0

function IndexPopup() {
  const [formShielding, setFormShielding] = useState(true)
  const [insecureInputAlerts, setInsecureInputAlerts] = useState(true)

  return (
    <div className="relative w-[360px] min-h-[480px] bg-bg-primary font-sans text-text-primary">
      <div
        className="star-field pointer-events-none absolute inset-0"
        aria-hidden
      />
      <div className="relative z-10 space-y-4 p-4">
        <header className="flex items-center justify-between gap-2">
          <div className="flex shrink-0 items-center gap-2">
            <LogoShield size={32} />
            <span className="truncate text-sm font-semibold text-text-primary">
              HackerHare
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="font-mono text-xs text-text-muted">
              v{VERSION}
            </span>
            <span className="rounded-full border border-card-border bg-bg-secondary px-2 py-1 font-mono text-[10px] tracking-wider text-text-status uppercase shadow-[0_0_8px_rgba(255,244,145,0.4)]">
              Agent: Active
            </span>
          </div>
        </header>

        <section className="rounded-xl border border-card-border bg-bg-secondary p-4">
          <div className="flex items-center gap-4">
            <RabbitHead className="mascot-glow" height={96} />
            <div>
              <p className="text-sm text-text-muted">Threats Intercepted</p>
              <p className="font-mono text-4xl font-bold text-text-primary">
                {THREATS_INTERCEPTED}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-card-border bg-bg-secondary p-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-text-primary">Form Shielding</span>
            <ToggleSwitch
              checked={formShielding}
              label="Form Shielding"
              onChange={setFormShielding}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-text-primary">
              Insecure Input Alerts
            </span>
            <ToggleSwitch
              checked={insecureInputAlerts}
              label="Insecure Input Alerts"
              onChange={setInsecureInputAlerts}
            />
          </div>
        </section>
      </div>
    </div>
  )
}

export default IndexPopup
