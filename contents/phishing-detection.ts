import { getDomain, getSubdomain } from "tldts"

import brandRegistry from "~assets/brand-registry.json"

export type BrandEntry = {
  keyword: string
  officialApex: string[]
}

export type PhishingMatch = {
  brand: string
  matchType: "subdomain" | "typosquat"
  detail: string
}

const REGISTRY = brandRegistry as BrandEntry[]
const MIN_TYPOSQUAT_LENGTH = 5
const MAX_LEVENSHTEIN = 2
const IP_HOST_REGEX = /^\d{1,3}(\.\d{1,3}){3}$/

export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  const rows = a.length + 1
  const cols = b.length + 1
  const matrix: number[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(0)
  )

  for (let i = 0; i < rows; i++) matrix[i][0] = i
  for (let j = 0; j < cols; j++) matrix[0][j] = j

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }

  return matrix[a.length][b.length]
}

const DEV_HOST_REGEX = /^(localhost|127\.0\.0\.1)$/
const SIMULATE_HOST_PARAM = "simulateHost"
const SIMULATED_HOST_REGEX =
  /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i

export function isSkippedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "")
  if (!host || host === "localhost" || host.endsWith(".localhost")) return true
  if (IP_HOST_REGEX.test(host)) return true
  return false
}

/**
 * On local test server (localhost:8080), ?simulateHost=paypal.secure-verify.test
 * runs phishing checks without editing /etc/hosts.
 */
export function getHostnameForPhishingCheck(): string {
  const actual = window.location.hostname.toLowerCase()
  if (!DEV_HOST_REGEX.test(actual)) return window.location.hostname

  const port = window.location.port
  if (port !== "8080" && port !== "") return window.location.hostname

  const simulated = new URLSearchParams(window.location.search)
    .get(SIMULATE_HOST_PARAM)
    ?.trim()
    .toLowerCase()

  if (!simulated || !SIMULATED_HOST_REGEX.test(simulated)) {
    return window.location.hostname
  }

  return simulated
}

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

function segmentMatchesBrand(segment: string, keyword: string): boolean {
  const seg = segment.toLowerCase()
  const key = keyword.toLowerCase()
  if (seg === key) return true
  if (seg.startsWith(`${key}-`) || seg.endsWith(`-${key}`)) return true
  if (key.length >= 5 && seg.includes(key)) return true
  return false
}

export function detectBrandSubdomainPhishing(
  hostname: string
): PhishingMatch | null {
  if (isSkippedHostname(hostname)) return null

  const registrableDomain = getDomain(hostname, { allowPrivateDomains: true })
  const subdomain = getSubdomain(hostname, { allowPrivateDomains: true })
  if (!registrableDomain || !subdomain) return null

  const segments = subdomain.split(".").filter(Boolean)
  if (segments.length === 0) return null

  for (const entry of REGISTRY) {
    const apexSet = apexSetForBrand(entry)
    if (isOfficialDomain(registrableDomain, apexSet)) continue

    for (const segment of segments) {
      if (!segmentMatchesBrand(segment, entry.keyword)) continue

      return {
        brand: entry.keyword,
        matchType: "subdomain",
        detail: `"${entry.keyword}" appears in the subdomain, but this site is "${registrableDomain}".`
      }
    }
  }

  return null
}

function registrableLabel(domain: string): string {
  const parts = domain.split(".")
  return parts[0] ?? domain
}

export function detectTyposquatPhishing(
  hostname: string
): PhishingMatch | null {
  if (isSkippedHostname(hostname)) return null

  const registrableDomain = getDomain(hostname, { allowPrivateDomains: true })
  if (!registrableDomain) return null

  const label = registrableLabel(registrableDomain)
  if (label.length < MIN_TYPOSQUAT_LENGTH) return null

  for (const entry of REGISTRY) {
    const apexSet = apexSetForBrand(entry)
    if (isOfficialDomain(registrableDomain, apexSet)) continue

    const keyword = entry.keyword.toLowerCase()
    if (keyword.length < MIN_TYPOSQUAT_LENGTH) continue

    const distance = levenshteinDistance(label, keyword)
    if (distance === 0 || distance > MAX_LEVENSHTEIN) continue

    return {
      brand: entry.keyword,
      matchType: "typosquat",
      detail: `This site's domain "${registrableDomain}" closely resembles "${keyword}" but is not official.`
    }
  }

  return null
}

export function collectPhishingMatches(hostname: string): PhishingMatch[] {
  const matches: PhishingMatch[] = []
  const seen = new Set<string>()

  const subdomain = detectBrandSubdomainPhishing(hostname)
  if (subdomain) {
    matches.push(subdomain)
    seen.add(subdomain.brand)
  }

  const typosquat = detectTyposquatPhishing(hostname)
  if (typosquat && !seen.has(typosquat.brand)) {
    matches.push(typosquat)
  }

  return matches
}
