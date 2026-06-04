import type { PlasmoCSConfig } from "plasmo"

import { Storage } from "@plasmohq/storage"

import { showThreatModal } from "./threat-modal"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}
const SENSITIVE_KEYWORD_REGEX =
  /\b(ssn|social[-_]?security|birth[-_]?date|dob)\b/i
const MISLEADING_SUBDOMAIN_SEGMENTS = ["login", "secure", "verify", "account"]

const storage = new Storage()
const flaggedForms = new WeakSet<HTMLFormElement>()

let insecureInputReported = false
let mutationObserverStarted = false

type ShieldConfig = {
  shieldingEnabled: boolean
  alertsEnabled: boolean
}

async function getShieldConfig(): Promise<ShieldConfig> {
  const shieldingEnabled = await storage.get<boolean>("shielding-enabled")
  const alertsEnabled = await storage.get<boolean>("alerts-enabled")

  return {
    shieldingEnabled: shieldingEnabled !== false,
    alertsEnabled: alertsEnabled !== false
  }
}

async function incrementThreatCount() {
  const count = (await storage.get<number>("threat-count")) ?? 0
  await storage.set("threat-count", count + 1)
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

function fieldHasSensitiveKeyword(element: Element): boolean {
  const attrs = ["name", "id", "placeholder", "aria-label", "autocomplete"]

  for (const attr of attrs) {
    const value = element.getAttribute(attr)
    if (value && SENSITIVE_KEYWORD_REGEX.test(value)) return true
  }

  return false
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

  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault()
      event.stopPropagation()

      showThreatModal("suspicious-submit")
      void incrementThreatCount()
    },
    { capture: true }
  )
}

async function checkInsecureInputs() {
  if (insecureInputReported) return
  if (window.location.protocol !== "http:") return

  const passwordFields = document.querySelectorAll('input[type="password"]')
  if (passwordFields.length === 0) return

  insecureInputReported = true

  showThreatModal("insecure-password")
  await incrementThreatCount()
}

function scanFormStructures() {
  const forms = document.querySelectorAll("form")

  for (const form of forms) {
    if (!shouldFlagForm(form)) continue
    attachFormInterceptor(form)
  }
}

function startFormMutationObserver() {
  if (mutationObserverStarted || !document.body) return
  mutationObserverStarted = true

  const debouncedScan = debounce(scanFormStructures, 500)
  const observer = new MutationObserver(debouncedScan)
  observer.observe(document.body, { childList: true, subtree: true })
}

async function runHeuristics() {
  const { shieldingEnabled, alertsEnabled } = await getShieldConfig()
  if (!shieldingEnabled) return

  whenDomReady(() => {
    console.log(
      "HackerHare Shield Active on this domain",
      window.location.hostname
    )

    if (alertsEnabled) void checkInsecureInputs()
    scanFormStructures()
    startFormMutationObserver()
  })
}

void runHeuristics()

storage.watch({
  "shielding-enabled": () => {
    void runHeuristics()
  },
  "alerts-enabled": () => {
    void runHeuristics()
  }
})
