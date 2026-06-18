import { getDomain } from "tldts"

import brandRegistry from "~assets/brand-registry.json"

type BrandEntry = {
  keyword: string
  officialApex: string[]
  label?: string
}

export const PHISHING_WHITELIST_STORAGE_KEY = "phishing-whitelist"

const REGISTRY = brandRegistry as BrandEntry[]

/** Extra registrable domains that should not trigger phishing heuristics. */
const BUILTIN_TRUSTED_DOMAINS = new Set(
  [
    "chatgpt.com",
    "openai.com",
    "anthropic.com",
    "claude.ai",
    "figma.com",
    "canva.com",
    "linear.app",
    "vercel.com",
    "cloudflare.com",
    "wikipedia.org",
    "archive.org",
    "w3.org",
    "gov.uk",
    "usa.gov"
  ].map((d) => d.toLowerCase())
)

function apexSetForBrand(entry: BrandEntry): Set<string> {
  return new Set(entry.officialApex.map((d) => d.toLowerCase()))
}

function isOfficialDomain(
  domain: string | null,
  apexSet: Set<string>
): boolean {
  if (!domain) return false
  const normalized = domain.toLowerCase()
  if (apexSet.has(normalized)) return true
  for (const apex of apexSet) {
    if (normalized === apex || normalized.endsWith(`.${apex}`)) return true
  }
  return false
}

export function getRegistrableDomain(hostname: string): string | null {
  return (
    getDomain(hostname, { allowPrivateDomains: true })?.toLowerCase() ?? null
  )
}

export function normalizeWhitelistDomain(input: string): string | null {
  const trimmed = input.trim().toLowerCase()
  if (!trimmed) return null

  try {
    const host = trimmed.includes("://")
      ? new URL(trimmed).hostname
      : trimmed.replace(/^www\./, "").split("/")[0]
    return getRegistrableDomain(host) ?? host.replace(/^www\./, "")
  } catch {
    const host = trimmed.replace(/^www\./, "").split("/")[0]
    return getRegistrableDomain(host) ?? host
  }
}

export function isAnyBrandOfficialSite(hostname: string): boolean {
  const domain = getRegistrableDomain(hostname)
  if (!domain) return false

  for (const entry of REGISTRY) {
    if (isOfficialDomain(domain, apexSetForBrand(entry))) return true
  }

  return BUILTIN_TRUSTED_DOMAINS.has(domain)
}

export function isPhishingWhitelisted(
  hostname: string,
  userWhitelist: string[]
): boolean {
  const domain = getRegistrableDomain(hostname)
  if (!domain) return false

  const normalizedUser = userWhitelist.map((d) => d.toLowerCase())
  if (normalizedUser.includes(domain)) return true

  return isAnyBrandOfficialSite(hostname)
}

export function sanitizeUserWhitelist(entries: unknown): string[] {
  if (!Array.isArray(entries)) return []

  const seen = new Set<string>()
  const result: string[] = []

  for (const entry of entries) {
    if (typeof entry !== "string") continue
    const domain = normalizeWhitelistDomain(entry)
    if (!domain || seen.has(domain)) continue
    seen.add(domain)
    result.push(domain)
  }

  return result.sort()
}

export function getSystemTrustedDomains(): string[] {
  const seen = new Set<string>()

  for (const entry of REGISTRY) {
    for (const apex of entry.officialApex) {
      seen.add(apex.toLowerCase())
    }
  }

  for (const domain of BUILTIN_TRUSTED_DOMAINS) {
    seen.add(domain)
  }

  return [...seen].sort()
}

export function getSystemTrustSummary(): {
  brandCount: number
  domainCount: number
  supplementalCount: number
} {
  return {
    brandCount: REGISTRY.length,
    domainCount: getSystemTrustedDomains().length,
    supplementalCount: BUILTIN_TRUSTED_DOMAINS.size
  }
}
