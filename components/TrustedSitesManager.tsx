import { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import {
  normalizeWhitelistDomain,
  PHISHING_WHITELIST_STORAGE_KEY,
  sanitizeUserWhitelist
} from "~lib/phishing-whitelist"

type TrustedSitesManagerProps = {
  compact?: boolean
}

export function TrustedSitesManager({
  compact = false
}: TrustedSitesManagerProps) {
  const [phishingWhitelist, setPhishingWhitelist] = useStorage<string[]>(
    PHISHING_WHITELIST_STORAGE_KEY,
    (v) => sanitizeUserWhitelist(v)
  )
  const [whitelistInput, setWhitelistInput] = useState("")
  const [whitelistError, setWhitelistError] = useState("")
  const [statusMessage, setStatusMessage] = useState("")

  useEffect(() => {
    if (!statusMessage) return

    const timeoutId = window.setTimeout(() => {
      setStatusMessage("")
    }, 3500)

    return () => window.clearTimeout(timeoutId)
  }, [statusMessage])

  const handleAddWhitelistDomain = () => {
    const domain = normalizeWhitelistDomain(whitelistInput)
    if (!domain) {
      setWhitelistError("Enter a domain like spotify.com")
      setStatusMessage("")
      return
    }

    if (phishingWhitelist.includes(domain)) {
      setWhitelistError("That domain is already trusted")
      setStatusMessage("")
      return
    }

    setPhishingWhitelist(sanitizeUserWhitelist([...phishingWhitelist, domain]))
    setWhitelistInput("")
    setWhitelistError("")
    setStatusMessage(`Added ${domain}`)
  }

  const handleRemoveWhitelistDomain = (domain: string) => {
    const confirmed = window.confirm(
      `Remove ${domain} from trusted sites?\n\nPhishing alerts will run on this domain again.`
    )
    if (!confirmed) return

    setPhishingWhitelist(phishingWhitelist.filter((entry) => entry !== domain))
    setStatusMessage(`Removed ${domain}`)
    setWhitelistError("")
  }

  const handleClearWhitelist = () => {
    if (phishingWhitelist.length === 0) return

    const confirmed = window.confirm(
      `Remove all ${phishingWhitelist.length} trusted sites?\n\nPhishing alerts will run on every domain again unless you trust them later.`
    )
    if (!confirmed) return

    setPhishingWhitelist([])
    setStatusMessage("Cleared all trusted sites")
    setWhitelistError("")
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div>
        <p
          className={
            compact
              ? "text-sm text-text-primary"
              : "text-base font-semibold text-text-primary"
          }>
          Your trusted sites
        </p>
        <p
          className={`mt-1 leading-snug text-text-muted ${
            compact ? "text-xs" : "text-sm"
          }`}>
          Domains where phishing hostname alerts are skipped. Stored on this
          device only. Add from alerts with{" "}
          <span className="text-text-primary">Trust this site</span>, or add
          manually below.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={whitelistInput}
          onChange={(event) => {
            setWhitelistInput(event.target.value)
            if (whitelistError) setWhitelistError("")
            if (statusMessage) setStatusMessage("")
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleAddWhitelistDomain()
          }}
          placeholder="Enter a domain"
          className="min-w-0 flex-1 rounded-lg border border-card-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-rocket-orange focus:outline-none"
          aria-label="Domain to trust"
        />
        <button
          type="button"
          onClick={handleAddWhitelistDomain}
          className="shrink-0 rounded-lg border border-card-border bg-bg-primary px-4 py-2 text-sm font-semibold text-text-primary transition hover:border-rocket-orange">
          Add site
        </button>
      </div>

      {whitelistError ? (
        <p className="text-sm text-rocket-orange" role="alert">
          {whitelistError}
        </p>
      ) : null}

      {statusMessage ? (
        <p className="text-sm text-text-status" role="status">
          {statusMessage}
        </p>
      ) : null}

      {phishingWhitelist.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-text-muted">
              {phishingWhitelist.length}{" "}
              {phishingWhitelist.length === 1 ? "site" : "sites"} trusted
            </p>
            <button
              type="button"
              onClick={handleClearWhitelist}
              className="text-sm font-semibold text-text-muted transition hover:text-rocket-orange">
              Remove all
            </button>
          </div>

          <ul
            className={`space-y-2 overflow-y-auto ${
              compact ? "max-h-40" : "max-h-[min(52vh,520px)]"
            }`}>
            {phishingWhitelist.map((domain) => (
              <li
                key={domain}
                className="flex items-center justify-between gap-3 rounded-lg border border-card-border bg-bg-primary px-3 py-2.5">
                <span className="truncate font-mono text-sm text-text-primary">
                  {domain}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveWhitelistDomain(domain)}
                  className="shrink-0 text-sm font-semibold text-text-muted transition hover:text-rocket-orange"
                  aria-label={`Remove ${domain} from trusted sites`}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-text-muted">No trusted sites yet.</p>
      )}
    </div>
  )
}
