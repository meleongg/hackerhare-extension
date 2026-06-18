import leftCloudSrc from "data-url:~/assets/left-cloud.svg"
import rabbitRocketSrc from "data-url:~/assets/rabbit-on-rocket.svg"
import rightCloudSrc from "data-url:~/assets/right-cloud.svg"

import { LogoShield } from "~components/icons/LogoShield"
import { OptionsFooter } from "~components/OptionsFooter"
import { SystemDefaultsPanel } from "~components/SystemDefaultsPanel"
import { TrustedSitesManager } from "~components/TrustedSitesManager"

import "~style.css"

function OptionsPage() {
  return (
    <div className="options-shell relative bg-bg-primary font-sans text-text-primary">
      <div
        className="options-star-field pointer-events-none fixed inset-0"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-8">
        <header className="relative mb-8 min-h-[9.5rem] overflow-hidden rounded-2xl border border-card-border bg-bg-secondary px-6 py-8 sm:min-h-[10.5rem] sm:px-10 sm:py-10">
          <img
            src={leftCloudSrc}
            alt=""
            aria-hidden
            className="pointer-events-none absolute -left-4 top-6 w-28 opacity-80 sm:w-36"
          />

          <img
            src={rightCloudSrc}
            alt=""
            aria-hidden
            className="pointer-events-none absolute -right-6 top-8 w-36 opacity-80 sm:-right-8 sm:top-10 sm:w-44"
          />

          <img
            src={rabbitRocketSrc}
            alt=""
            aria-hidden
            className="mascot-glow pointer-events-none absolute bottom-3 right-10 z-10 h-24 w-auto sm:bottom-4 sm:right-12 sm:h-32 md:h-36"
          />

          <div className="relative z-20 max-w-2xl pr-24 sm:pr-36 md:pr-44">
            <div className="flex items-center gap-3">
              <LogoShield size={44} rounded className="shrink-0" />
              <h1 className="font-brand text-2xl font-bold tracking-wide text-text-primary sm:text-3xl">
                HackerHare settings
              </h1>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-text-muted sm:max-w-xl sm:text-base">
              Manage phishing alert exceptions on this device. Your trusted
              sites and HackerHare&apos;s built-in brand registry are both
              listed below.
            </p>
          </div>
        </header>

        <div className="grid flex-1 gap-6 lg:grid-cols-2">
          <section className="flex min-h-[420px] flex-col rounded-2xl border border-card-border bg-bg-secondary p-5 sm:p-6">
            <TrustedSitesManager />
          </section>

          <section className="flex min-h-[420px] flex-col rounded-2xl border border-card-border bg-bg-secondary p-5 sm:p-6">
            <SystemDefaultsPanel />
          </section>
        </div>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <article className="rounded-xl border border-card-border bg-bg-secondary/80 p-4">
            <h2 className="text-sm font-semibold text-text-primary">
              On-device only
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-text-muted">
              Trusted sites live in extension storage on this browser. They are
              never uploaded or synced.
            </p>
          </article>
          <article className="rounded-xl border border-card-border bg-bg-secondary/80 p-4">
            <h2 className="text-sm font-semibold text-text-primary">
              Phishing alerts only
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-text-muted">
              Trusting a domain skips hostname phishing checks. Form shielding,
              HTTP password alerts, and dark-pattern scans still run.
            </p>
          </article>
          <article className="rounded-xl border border-card-border bg-bg-secondary/80 p-4">
            <h2 className="text-sm font-semibold text-text-primary">
              Undo accidental trust
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-text-muted">
              Remove a domain from your list anytime. System defaults cannot be
              changed here. They update with extension releases.
            </p>
          </article>
        </section>

        <OptionsFooter className="mt-8" />
      </div>
    </div>
  )
}

export default OptionsPage
