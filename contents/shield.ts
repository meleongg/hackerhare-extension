import type { PlasmoCSConfig } from "plasmo"

import { Storage } from "@plasmohq/storage"

import {
  removeAllDarkPatternBanners,
  showDarkPatternBanner
} from "~lib/dark-pattern-banner"
import {
  collectPhishingMatches,
  getHostnameForPhishingCheck
} from "~lib/phishing-detection"
import {
  clearThreatModal,
  showThreatModal,
  showThreatSummaryModal,
  type ThreatInfraction
} from "~lib/threat-modal"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

const SENSITIVE_KEYWORD_REGEX =
  /\b(ssn|social[-_]?security|birth[-_]?date|dob)\b/i
const OPT_IN_KEYWORD_REGEX = /\b(newsletter|subscribe|marketing|opt[- ]?in)\b/i
const MISLEADING_SUBDOMAIN_SEGMENTS = ["login", "secure", "verify", "account"]
const TELEMETRY_INCREMENT_URL =
  "https://hackerhare.vercel.app/api/metrics/increment"
const TELEMETRY_AGENT_HEADER = "hare-covert-agent-telemetry-2026"

const storage = new Storage()

const flaggedForms = new Set<HTMLFormElement>()
const formAbortControllers = new Map<HTMLFormElement, AbortController>()
const flaggedDarkPatternForms = new WeakSet<HTMLFormElement>()

let pageInfractions: ThreatInfraction[] = []
let pageInfractionIds = new Set<string>()
let insecureInputCollected = false
let phishingCollected = false
let mutationObserver: MutationObserver | null = null
let mutationObserverStarted = false
let currentConfig: ShieldConfig | null = null
let lastPhishingUrlKey = ""
let phishingUrlListenersBound = false

type ShieldConfig = {
  shieldingEnabled: boolean
  alertsEnabled: boolean
  darkPatternsEnabled: boolean
  phishingAlertsEnabled: boolean
}

async function getShieldConfig(): Promise<ShieldConfig> {
  const shieldingEnabled = await storage.get<boolean>("shielding-enabled")
  const alertsEnabled = await storage.get<boolean>("alerts-enabled")
  const darkPatternsEnabled = await storage.get<boolean>(
    "dark-patterns-enabled"
  )
  const phishingAlertsEnabled = await storage.get<boolean>(
    "phishing-alerts-enabled"
  )

  return {
    shieldingEnabled: shieldingEnabled !== false,
    alertsEnabled: alertsEnabled !== false,
    darkPatternsEnabled: darkPatternsEnabled !== false,
    phishingAlertsEnabled: phishingAlertsEnabled !== false
  }
}

function pingGlobalTelemetry(): void {
  void fetch(TELEMETRY_INCREMENT_URL, {
    method: "POST",
    referrerPolicy: "no-referrer",
    keepalive: true,
    headers: {
      "Content-Type": "application/json",
      "x-hackerhare-agent": TELEMETRY_AGENT_HEADER
    }
  }).catch(() => {})
}

async function incrementThreatCount() {
  const count = (await storage.get<number>("threat-count")) ?? 0
  await storage.set("threat-count", count + 1)
  pingGlobalTelemetry()
}

function whenDomReady(run: () => void) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true })
    return
  }
  run()
}

function debounce(fn: () => void, ms: number) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  return () => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(fn, ms)
  }
}

function queuePageInfraction(infraction: ThreatInfraction) {
  if (pageInfractionIds.has(infraction.id)) return
  pageInfractionIds.add(infraction.id)
  pageInfractions.push(infraction)
}

async function flushPageInfractions() {
  if (pageInfractions.length === 0) return

  const batch = [...pageInfractions]
  pageInfractions = []
  pageInfractionIds = new Set()

  for (let i = 0; i < batch.length; i++) {
    await incrementThreatCount()
  }

  showThreatSummaryModal(batch)
}

function collectPhishingInfractions() {
  if (phishingCollected || !currentConfig?.phishingAlertsEnabled) return
  phishingCollected = true

  const hostname = getHostnameForPhishingCheck()
  const matches = collectPhishingMatches(hostname)
  for (const match of matches) {
    queuePageInfraction({
      id: `phishing-${match.matchType}-${match.brand}`,
      title:
        match.matchType === "typosquat"
          ? `Possible ${match.brandLabel} typosquat`
          : `Possible fake ${match.brandLabel} site`,
      detail: match.detail
    })
  }
}

function collectInsecureInputInfraction() {
  if (insecureInputCollected || !currentConfig?.alertsEnabled) return
  if (window.location.protocol !== "http:") return

  const passwordFields = document.querySelectorAll('input[type="password"]')
  if (passwordFields.length === 0) return

  insecureInputCollected = true
  queuePageInfraction({
    id: "insecure-password",
    title: "Unencrypted password detected",
    detail:
      "This page uses HTTP and contains a password field. Anything you type could be sent without encryption."
  })
}

function getCheckboxContextText(checkbox: HTMLInputElement): string {
  const chunks: string[] = []
  const id = checkbox.id

  if (id) {
    const label = document.querySelector(`label[for="${escapeSelectorId(id)}"]`)
    if (label?.textContent) chunks.push(label.textContent)
  }

  const parentLabel = checkbox.closest("label")
  if (parentLabel?.textContent) chunks.push(parentLabel.textContent)

  for (const attr of ["aria-label", "name", "id", "title"]) {
    const value = checkbox.getAttribute(attr)
    if (value) chunks.push(value)
  }

  const labelledBy = checkbox.getAttribute("aria-labelledby")
  if (labelledBy) {
    for (const ref of labelledBy.split(/\s+/)) {
      const el = document.getElementById(ref)
      if (el?.textContent) chunks.push(el.textContent)
    }
  }

  const fieldset = checkbox.closest("fieldset")
  const legend = fieldset?.querySelector("legend")
  if (legend?.textContent) chunks.push(legend.textContent)

  return chunks.join(" ").replace(/\s+/g, " ").trim().slice(0, 300)
}

function scanDarkPatternsInForm(form: HTMLFormElement) {
  if (!currentConfig?.darkPatternsEnabled) return
  if (flaggedDarkPatternForms.has(form)) return

  const checkboxes = form.querySelectorAll<HTMLInputElement>(
    'input[type="checkbox"]'
  )

  for (const checkbox of checkboxes) {
    if (!checkbox.checked) continue

    const context = getCheckboxContextText(checkbox)
    if (!context || !OPT_IN_KEYWORD_REGEX.test(context)) continue

    flaggedDarkPatternForms.add(form)
    console.warn("[HackerHare] Deceptive pre-checked opt-in detected", {
      form,
      context
    })
    void incrementThreatCount()
    showDarkPatternBanner(form)
    return
  }
}

function fieldHasSensitiveKeyword(element: Element): boolean {
  const attrs = ["name", "id", "placeholder", "aria-label", "autocomplete"]

  for (const attr of attrs) {
    const value = element.getAttribute(attr)
    if (value && SENSITIVE_KEYWORD_REGEX.test(value)) return true
  }

  return false
}

function escapeSelectorId(id: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(id)
  }
  return id.replace(/["\\]/g, "\\$&")
}

function formHasSensitiveFields(form: HTMLFormElement): boolean {
  const fields = form.querySelectorAll("input, select, textarea")

  for (const field of fields) {
    if (fieldHasSensitiveKeyword(field)) return true
  }

  return false
}

function isFormActionSecure(form: HTMLFormElement): boolean {
  const action = form.getAttribute("action")?.trim() ?? ""

  if (!action) return window.location.protocol === "https:"

  try {
    const url = new URL(action, window.location.href)
    return url.protocol === "https:"
  } catch {
    return false
  }
}

function hasValidSecurityIndicators(form: HTMLFormElement): boolean {
  return window.location.protocol === "https:" && isFormActionSecure(form)
}

function hasHostnameRedFlags(): boolean {
  const host = window.location.hostname

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true

  const parts = host.split(".")
  const subdomainParts = parts.length > 2 ? parts.slice(0, -2) : []

  return subdomainParts.some((part) =>
    MISLEADING_SUBDOMAIN_SEGMENTS.includes(part.toLowerCase())
  )
}

function shouldFlagForm(form: HTMLFormElement): boolean {
  if (!formHasSensitiveFields(form)) return false
  if (hasValidSecurityIndicators(form) && !hasHostnameRedFlags()) {
    return false
  }
  return true
}

function attachFormInterceptor(form: HTMLFormElement) {
  if (flaggedForms.has(form)) return
  flaggedForms.add(form)

  const controller = new AbortController()
  formAbortControllers.set(form, controller)

  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault()
      event.stopPropagation()

      console.warn("[HackerHare] Intercepted a suspicious submission", {
        hostname: window.location.hostname,
        form
      })
      showThreatModal("suspicious-submit")
      void incrementThreatCount()
    },
    { capture: true, signal: controller.signal }
  )
}

function scanFormStructures() {
  const forms = document.querySelectorAll("form")

  for (const form of forms) {
    scanDarkPatternsInForm(form)
    if (!shouldFlagForm(form)) continue
    attachFormInterceptor(form)
  }
}

function teardownShield() {
  for (const controller of formAbortControllers.values()) {
    controller.abort()
  }
  formAbortControllers.clear()
  flaggedForms.clear()

  if (mutationObserver) {
    mutationObserver.disconnect()
    mutationObserver = null
  }
  mutationObserverStarted = false
  lastPhishingUrlKey = ""
  phishingUrlListenersBound = false

  removeAllDarkPatternBanners()
  clearThreatModal()

  pageInfractions = []
  pageInfractionIds = new Set()
  insecureInputCollected = false
  phishingCollected = false
  currentConfig = null
}

function startFormMutationObserver() {
  if (mutationObserverStarted || !document.body) return
  mutationObserverStarted = true

  const debouncedScan = debounce(() => {
    if (!currentConfig?.shieldingEnabled) return
    scanFormStructures()
  }, 500)

  mutationObserver = new MutationObserver(debouncedScan)
  mutationObserver.observe(document.body, { childList: true, subtree: true })
}

function phishingUrlKey(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`
}

function rescanIfPhishingContextChanged() {
  if (!currentConfig?.shieldingEnabled) return

  const key = phishingUrlKey()
  if (key === lastPhishingUrlKey) return

  lastPhishingUrlKey = key
  runPageScan()
}

function bindPhishingUrlListeners() {
  if (phishingUrlListenersBound) return
  phishingUrlListenersBound = true

  window.addEventListener("pageshow", () => {
    rescanIfPhishingContextChanged()
  })

  window.addEventListener("hashchange", () => {
    rescanIfPhishingContextChanged()
  })

  window.addEventListener("popstate", () => {
    rescanIfPhishingContextChanged()
  })
}

function runPageScan() {
  clearThreatModal()

  pageInfractions = []
  pageInfractionIds = new Set()
  insecureInputCollected = false
  phishingCollected = false

  if (!currentConfig?.darkPatternsEnabled) {
    removeAllDarkPatternBanners()
  }

  collectPhishingInfractions()
  scanFormStructures()
  collectInsecureInputInfraction()
  void flushPageInfractions()
}

function activateShield() {
  if (!currentConfig?.shieldingEnabled) return

  console.log(
    "HackerHare Shield Active on this domain",
    window.location.hostname
  )

  bindPhishingUrlListeners()
  lastPhishingUrlKey = phishingUrlKey()
  runPageScan()
  startFormMutationObserver()
}

async function runHeuristics() {
  const config = await getShieldConfig()
  currentConfig = config

  if (!config.shieldingEnabled) {
    teardownShield()
    return
  }

  whenDomReady(activateShield)
}

void runHeuristics()

storage.watch({
  "shielding-enabled": () => {
    void runHeuristics()
  },
  "alerts-enabled": () => {
    void runHeuristics()
  },
  "dark-patterns-enabled": () => {
    void runHeuristics()
  },
  "phishing-alerts-enabled": () => {
    void runHeuristics()
  }
})
