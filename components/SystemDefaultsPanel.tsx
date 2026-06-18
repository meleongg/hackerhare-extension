import { useMemo, useState } from "react"

import {
  getSystemTrustedDomains,
  getSystemTrustSummary
} from "~lib/phishing-whitelist"

const SYSTEM_DOMAINS = getSystemTrustedDomains()
const SYSTEM_SUMMARY = getSystemTrustSummary()

export function SystemDefaultsPanel() {
  const [query, setQuery] = useState("")

  const filteredDomains = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return SYSTEM_DOMAINS
    return SYSTEM_DOMAINS.filter((domain) => domain.includes(needle))
  }, [query])

  return (
    <div className="flex h-full flex-col space-y-4">
      <div>
        <p className="text-base font-semibold text-text-primary">
          System defaults
        </p>
        <p className="mt-1 text-sm leading-snug text-text-muted">
          Read-only list of {SYSTEM_SUMMARY.domainCount} official domains across{" "}
          {SYSTEM_SUMMARY.brandCount} known brands, plus{" "}
          {SYSTEM_SUMMARY.supplementalCount} extras. Shipped with the extension;
          updates on install only.
        </p>
      </div>

      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search defaults, e.g. spotify.com"
        className="w-full rounded-lg border border-card-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-rocket-orange focus:outline-none"
        aria-label="Search system default domains"
      />

      <p className="text-xs text-text-muted">
        Showing {filteredDomains.length} of {SYSTEM_DOMAINS.length} domains
      </p>

      <ul
        className="grid max-h-[min(52vh,520px)] flex-1 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2"
        aria-label="System default trusted domains">
        {filteredDomains.map((domain) => (
          <li
            key={domain}
            className="rounded-lg border border-card-border/70 bg-bg-primary/80 px-3 py-2 font-mono text-xs text-text-muted">
            {domain}
          </li>
        ))}
      </ul>

      {filteredDomains.length === 0 ? (
        <p className="text-sm text-text-muted">No domains match your search.</p>
      ) : null}
    </div>
  )
}
