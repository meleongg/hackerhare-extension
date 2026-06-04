import { useEffect } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { LogoShield } from "~components/icons/LogoShield"
import { RabbitHead } from "~components/icons/RabbitHead"
import { ToggleSwitch } from "~components/ToggleSwitch"

import "~style.css"

const VERSION = "0.0.1"

function IndexPopup() {
  const [formShielding, setFormShielding] = useStorage(
    "shielding-enabled",
    (v) => (v === undefined ? true : v)
  )
  const [insecureInputAlerts, setInsecureInputAlerts] = useStorage(
    "alerts-enabled",
    (v) => (v === undefined ? true : v)
  )
  const [darkPatternAlerts, setDarkPatternAlerts] = useStorage(
    "dark-patterns-enabled",
    (v) => (v === undefined ? true : v)
  )
  const [phishingAlerts, setPhishingAlerts] = useStorage(
    "phishing-alerts-enabled",
    (v) => (v === undefined ? true : v)
  )
  const [threatCount] = useStorage("threat-count", (v) =>
    v === undefined ? 0 : v
  )

  const handleFormShieldingChange = (enabled: boolean) => {
    setFormShielding(enabled)
    if (!enabled) {
      setInsecureInputAlerts(false)
      setDarkPatternAlerts(false)
      setPhishingAlerts(false)
    }
  }

  useEffect(() => {
    if (!formShielding) {
      if (insecureInputAlerts) setInsecureInputAlerts(false)
      if (darkPatternAlerts) setDarkPatternAlerts(false)
      if (phishingAlerts) setPhishingAlerts(false)
    }
  }, [
    formShielding,
    insecureInputAlerts,
    darkPatternAlerts,
    phishingAlerts,
    setInsecureInputAlerts,
    setDarkPatternAlerts,
    setPhishingAlerts
  ])

  return (
    <div className="relative w-[360px] min-h-[480px] bg-bg-primary font-sans text-text-primary">
      <div
        className="star-field pointer-events-none absolute inset-0"
        aria-hidden
      />
      <div className="relative z-10 space-y-4 p-4">
        <header className="flex items-center gap-2.5">
          <LogoShield size={32} className="shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate font-brand text-lg font-bold leading-none tracking-wide text-text-primary">
              HackerHare
            </span>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-text-muted">
                v{VERSION}
              </span>
              <span
                className={`shrink-0 rounded-full border border-card-border bg-bg-secondary px-2 py-1 font-mono text-[10px] tracking-wider uppercase ${
                  formShielding
                    ? "text-text-status shadow-[0_0_8px_rgba(255,244,145,0.4)]"
                    : "text-text-muted"
                }`}
                aria-live="polite">
                {formShielding ? "Agent: Active" : "Agent: Standby"}
              </span>
            </div>
          </div>
        </header>

        <section className="rounded-xl border border-card-border bg-bg-secondary p-4">
          <div className="flex items-center gap-4">
            <RabbitHead className="mascot-glow" height={96} />
            <div>
              <p className="text-sm text-text-muted">Threats Intercepted</p>
              <p className="font-mono text-4xl font-bold text-text-primary">
                {threatCount}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-card-border bg-bg-secondary p-4">
          <div className="flex items-center justify-between gap-3 py-2">
            <div className="min-w-0">
              <span className="text-sm text-text-primary">Form Shielding</span>
              <p className="mt-0.5 text-xs leading-snug text-text-muted">
                Master switch for page protections: forms, dark patterns, and
                phishing hostname checks.
              </p>
            </div>
            <ToggleSwitch
              checked={formShielding}
              label="Form Shielding"
              onChange={handleFormShieldingChange}
            />
          </div>

          <div
            className={`flex items-center justify-between gap-3 border-t border-card-border py-2 ${
              formShielding ? "" : "opacity-60"
            }`}>
            <div className="min-w-0">
              <span className="text-sm text-text-primary">
                Insecure Input Alerts
              </span>
              <p className="mt-0.5 text-xs leading-snug text-text-muted">
                HTTP pages with password fields.
              </p>
            </div>
            <ToggleSwitch
              checked={insecureInputAlerts}
              disabled={!formShielding}
              label="Insecure Input Alerts"
              onChange={setInsecureInputAlerts}
            />
          </div>

          <div
            className={`flex items-center justify-between gap-3 border-t border-card-border py-2 ${
              formShielding ? "" : "opacity-60"
            }`}>
            <div className="min-w-0">
              <span className="text-sm text-text-primary">
                Dark Pattern Alerts
              </span>
              <p className="mt-0.5 text-xs leading-snug text-text-muted">
                Pre-checked newsletter or marketing checkboxes near forms.
              </p>
            </div>
            <ToggleSwitch
              checked={darkPatternAlerts}
              disabled={!formShielding}
              label="Dark Pattern Alerts"
              onChange={setDarkPatternAlerts}
            />
          </div>

          <div
            className={`flex items-center justify-between gap-3 border-t border-card-border py-2 ${
              formShielding ? "" : "opacity-60"
            }`}>
            <div className="min-w-0">
              <span className="text-sm text-text-primary">Phishing Alerts</span>
              <p className="mt-0.5 text-xs leading-snug text-text-muted">
                Lookalike hostnames (fake subdomains or typosquats).
              </p>
            </div>
            <ToggleSwitch
              checked={phishingAlerts}
              disabled={!formShielding}
              label="Phishing Alerts"
              onChange={setPhishingAlerts}
            />
          </div>

          {!formShielding ? (
            <p className="border-t border-card-border pt-2 text-xs leading-relaxed text-text-muted">
              Protection is paused. Turn Form Shielding on to scan pages again.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  )
}

export default IndexPopup
