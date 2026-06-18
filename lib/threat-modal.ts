import jakarta400 from "data-url:~/assets/fonts/plus-jakarta-sans-400.woff2"
import jakarta600 from "data-url:~/assets/fonts/plus-jakarta-sans-600.woff2"
import syncopate700 from "data-url:~/assets/fonts/syncopate-700.woff2"
import rabbitSrc from "data-url:~/assets/rabbit-head.svg"

import { getExtensionOptionsUrl } from "~lib/open-options"

const MODAL_ROOT_ID = "hackerhare-threat-modal"
const FONTS_STYLE_ID = "hackerhare-threat-modal-fonts"
const RABBIT_HEIGHT = 44
const RABBIT_WIDTH = Math.round(RABBIT_HEIGHT * (347 / 460))
const BRAND_FONT_SIZE = 20

const FONT_SANS = '"Plus Jakarta Sans", system-ui, sans-serif'
const FONT_BRAND = '"Syncopate", system-ui, sans-serif'

const SECONDARY_BUTTON_STYLES = [
  "display:block",
  "width:100%",
  "padding:10px 20px",
  "border:1px solid rgba(139,149,179,0.45)",
  "border-radius:8px",
  "background:transparent",
  "color:#ebeaf8",
  "font-size:14px",
  "font-weight:600",
  "cursor:pointer",
  "text-align:center",
  "text-decoration:none",
  "box-sizing:border-box",
  `font-family:${FONT_SANS}`
].join(";")

const PRIMARY_BUTTON_STYLES = [
  "display:block",
  "width:100%",
  "padding:10px 20px",
  "border:none",
  "border-radius:8px",
  "background:#ffa321",
  "color:#001342",
  "font-size:14px",
  "font-weight:600",
  "cursor:pointer",
  "text-align:center",
  "box-sizing:border-box",
  `font-family:${FONT_SANS}`
].join(";")

const TERTIARY_LINK_STYLES = [
  "display:inline-block",
  "margin-top:2px",
  "padding:4px 8px",
  "border:none",
  "background:transparent",
  "color:#a8b2cc",
  "font-size:13px",
  "font-weight:600",
  "cursor:pointer",
  "text-align:center",
  "text-decoration:underline",
  "text-underline-offset:3px",
  `font-family:${FONT_SANS}`
].join(";")

export type ThreatInfraction = {
  id: string
  title: string
  detail: string
}

export type ThreatModalVariant = "insecure-password" | "suspicious-submit"

const VARIANT_COPY: Record<
  ThreatModalVariant,
  { title: string; body: string; logMessage: string }
> = {
  "insecure-password": {
    title: "Unencrypted password detected",
    body: "This page uses HTTP and contains a password field. Anything you type could be sent without encryption.",
    logMessage:
      "Unencrypted password field detected on an HTTP page. Your credentials may be exposed."
  },
  "suspicious-submit": {
    title: "Suspicious submission blocked",
    body: "HackerHare stopped a form that may expose sensitive information on an unsafe or deceptive page.",
    logMessage: "Intercepted a suspicious submission."
  }
}

function ensureThreatModalFonts() {
  if (document.getElementById(FONTS_STYLE_ID)) return

  const style = document.createElement("style")
  style.id = FONTS_STYLE_ID
  style.textContent = `
@font-face {
  font-family: "Plus Jakarta Sans";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("${jakarta400}") format("woff2");
}
@font-face {
  font-family: "Plus Jakarta Sans";
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url("${jakarta600}") format("woff2");
}
@font-face {
  font-family: "Syncopate";
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url("${syncopate700}") format("woff2");
}
`
  document.head.append(style)
}

export function clearThreatModal() {
  document.getElementById(MODAL_ROOT_ID)?.remove()
}

function removeModal() {
  clearThreatModal()
}

function buildModalShell(
  titleText: string,
  bodyContent: HTMLElement,
  options?: {
    secondaryAction?: { label: string; onClick: () => void }
    showManageWhitelist?: boolean
  }
): HTMLButtonElement {
  ensureThreatModalFonts()

  const backdrop = document.createElement("div")
  backdrop.id = MODAL_ROOT_ID
  backdrop.style.cssText = [
    "position:fixed",
    "inset:0",
    "z-index:2147483647",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "padding:16px",
    "background:rgba(0,19,66,0.72)",
    `font-family:${FONT_SANS}`
  ].join(";")

  const dialog = document.createElement("div")
  dialog.setAttribute("role", "alertdialog")
  dialog.setAttribute("aria-modal", "true")
  dialog.setAttribute("aria-labelledby", "hackerhare-threat-title")
  dialog.setAttribute("aria-describedby", "hackerhare-threat-body")
  dialog.style.cssText = [
    "width:100%",
    "max-width:400px",
    "padding:20px",
    "border-radius:12px",
    "border:1px solid rgba(139,149,179,0.35)",
    "background:#1b2a5a",
    "color:#ebeaf8",
    "box-shadow:0 16px 48px rgba(0,0,0,0.45)"
  ].join(";")

  const header = document.createElement("div")
  header.style.cssText = [
    "display:flex",
    "align-items:center",
    "gap:12px",
    "margin-bottom:12px"
  ].join(";")

  const bunny = document.createElement("img")
  bunny.src = rabbitSrc
  bunny.width = RABBIT_WIDTH
  bunny.height = RABBIT_HEIGHT
  bunny.alt = ""
  bunny.setAttribute("aria-hidden", "true")
  bunny.style.cssText =
    "display:block;flex-shrink:0;max-height:44px;object-fit:contain"

  const brand = document.createElement("span")
  brand.textContent = "HackerHare"
  brand.style.cssText = [
    `font-family:${FONT_BRAND}`,
    `font-size:${BRAND_FONT_SIZE}px`,
    "font-weight:700",
    "letter-spacing:0.04em",
    "color:#ebeaf8",
    `line-height:${RABBIT_HEIGHT}px`
  ].join(";")

  header.append(bunny, brand)

  const title = document.createElement("h2")
  title.id = "hackerhare-threat-title"
  title.textContent = titleText
  title.style.cssText = [
    "margin:0 0 8px",
    "font-size:18px",
    "font-weight:600",
    "line-height:1.3",
    `font-family:${FONT_SANS}`
  ].join(";")

  bodyContent.id = "hackerhare-threat-body"

  const hasExtraActions =
    Boolean(options?.secondaryAction) || Boolean(options?.showManageWhitelist)

  const actions = document.createElement("div")
  actions.style.cssText = hasExtraActions
    ? "display:flex;flex-direction:column;align-items:stretch;gap:10px;margin-top:20px"
    : "display:flex;justify-content:center;margin-top:20px"

  const acknowledge = document.createElement("button")
  acknowledge.type = "button"
  acknowledge.textContent = "I understand"
  acknowledge.style.cssText = hasExtraActions
    ? PRIMARY_BUTTON_STYLES
    : [
        "display:inline-block",
        "min-width:140px",
        "padding:10px 20px",
        "border:none",
        "border-radius:8px",
        "background:#ffa321",
        "color:#001342",
        "font-size:14px",
        "font-weight:600",
        "cursor:pointer",
        `font-family:${FONT_SANS}`
      ].join(";")
  acknowledge.addEventListener("click", removeModal)

  actions.append(acknowledge)

  if (options?.secondaryAction) {
    const secondary = document.createElement("button")
    secondary.type = "button"
    secondary.textContent = options.secondaryAction.label
    secondary.style.cssText = SECONDARY_BUTTON_STYLES
    secondary.addEventListener("click", () => {
      options.secondaryAction?.onClick()
      removeModal()
    })
    actions.append(secondary)
  }

  if (options?.showManageWhitelist) {
    const manage = document.createElement("a")
    manage.href = getExtensionOptionsUrl()
    manage.target = "_blank"
    manage.rel = "noopener noreferrer"
    manage.textContent = "Manage trusted sites"
    manage.style.cssText = TERTIARY_LINK_STYLES
    manage.addEventListener("click", () => {
      removeModal()
    })

    const manageWrap = document.createElement("div")
    manageWrap.style.cssText = "display:flex;justify-content:center"
    manageWrap.append(manage)
    actions.append(manageWrap)
  }

  dialog.append(header, title, bodyContent, actions)

  if (options?.secondaryAction || options?.showManageWhitelist) {
    const footnote = document.createElement("p")
    footnote.textContent =
      "Trusted sites skip phishing alerts only. Review or remove them in settings."
    footnote.style.cssText = [
      "margin:12px 0 0",
      "font-size:12px",
      "line-height:1.4",
      "color:#a8b2cc",
      "text-align:center",
      `font-family:${FONT_SANS}`
    ].join(";")
    dialog.append(footnote)
  }

  backdrop.append(dialog)

  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) removeModal()
  })

  document.body.append(backdrop)
  acknowledge.focus()

  return acknowledge
}

export type ThreatSummaryModalOptions = {
  trustSiteLabel?: string
  onTrustSite?: () => void
}

export function showThreatSummaryModal(
  infractions: ThreatInfraction[],
  options?: ThreatSummaryModalOptions
) {
  if (infractions.length === 0) return
  if (document.getElementById(MODAL_ROOT_ID)) return

  const body = document.createElement("div")
  body.style.cssText = [
    "margin:0",
    "font-size:14px",
    "line-height:1.5",
    "color:#a8b2cc",
    `font-family:${FONT_SANS}`
  ].join(";")

  const intro = document.createElement("p")
  intro.style.cssText = "margin:0 0 12px"
  intro.textContent =
    infractions.length === 1
      ? "HackerHare found a possible risk on this page:"
      : `HackerHare found ${infractions.length} possible risks on this page:`

  const list = document.createElement("ul")
  list.style.cssText = "margin:0;padding-left:18px"

  for (const item of infractions) {
    const li = document.createElement("li")
    li.style.cssText = "margin-bottom:10px"
    const strong = document.createElement("strong")
    strong.style.color = "#ebeaf8"
    strong.textContent = item.title
    li.append(strong, document.createTextNode(` — ${item.detail}`))
    list.append(li)
  }

  body.append(intro, list)

  const hasPhishing = infractions.some((item) =>
    item.id.startsWith("phishing-")
  )
  const secondaryAction =
    hasPhishing && options?.onTrustSite && options.trustSiteLabel
      ? { label: options.trustSiteLabel, onClick: options.onTrustSite }
      : undefined

  buildModalShell("Security issues detected", body, {
    secondaryAction,
    showManageWhitelist: hasPhishing
  })
}

export function showThreatModal(variant: ThreatModalVariant) {
  const copy = VARIANT_COPY[variant]

  if (document.getElementById(MODAL_ROOT_ID)) return

  const body = document.createElement("p")
  body.style.cssText = [
    "margin:0",
    "font-size:14px",
    "line-height:1.5",
    "color:#a8b2cc",
    `font-family:${FONT_SANS}`
  ].join(";")
  body.textContent = copy.body

  buildModalShell(copy.title, body)
}
