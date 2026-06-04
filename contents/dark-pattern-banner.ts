import jakarta400 from "data-url:~/assets/fonts/plus-jakarta-sans-400.woff2"
import jakarta600 from "data-url:~/assets/fonts/plus-jakarta-sans-600.woff2"
import syncopate700 from "data-url:~/assets/fonts/syncopate-700.woff2"
import rabbitSrc from "data-url:~/assets/rabbit-head.svg"

const FONTS_STYLE_ID = "hackerhare-dark-pattern-fonts"
const BANNER_STYLES_ID = "hackerhare-dark-pattern-styles"
const DISMISS_BTN_ATTR = "data-hackerhare-dismiss-btn"
const BANNER_ATTR = "data-hackerhare-dark-pattern"
const DISMISSED_ATTR = "data-hackerhare-dark-pattern-dismissed"

const FONT_SANS = '"Plus Jakarta Sans", system-ui, sans-serif'
const FONT_BRAND = '"Syncopate", system-ui, sans-serif'

/** Same accent as modal, scaled down for the compact banner */
const DISMISS_BUTTON_STYLES = [
  "display:inline-block",
  "width:fit-content",
  "min-width:0",
  "padding:6px 14px",
  "border:none",
  "border-radius:6px",
  "background:#ffa321",
  "background-color:#ffa321",
  "color:#001342",
  "font-size:12px",
  "font-weight:600",
  "line-height:1.2",
  "cursor:pointer",
  "appearance:none",
  "-webkit-appearance:none",
  "box-shadow:none",
  `font-family:${FONT_SANS}`
].join(";")

function ensureBannerStyles() {
  if (!document.getElementById(BANNER_STYLES_ID)) {
    const bannerStyle = document.createElement("style")
    bannerStyle.id = BANNER_STYLES_ID
    bannerStyle.textContent = `
[${BANNER_ATTR}] button[${DISMISS_BTN_ATTR}] {
  cursor: pointer !important;
}
[${BANNER_ATTR}] button[${DISMISS_BTN_ATTR}]:hover {
  cursor: pointer !important;
  filter: brightness(1.06);
}
`
    document.head.append(bannerStyle)
  }

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

export function removeAllDarkPatternBanners() {
  document.querySelectorAll(`[${BANNER_ATTR}]`).forEach((el) => el.remove())
}

export function showDarkPatternBanner(form: HTMLFormElement) {
  if (form.getAttribute(DISMISSED_ATTR) === "true") return
  if (form.previousElementSibling?.getAttribute(BANNER_ATTR) === "true") return

  ensureBannerStyles()

  const banner = document.createElement("div")
  banner.setAttribute(BANNER_ATTR, "true")
  banner.setAttribute("role", "note")
  banner.style.cssText = [
    "box-sizing:border-box",
    "width:100%",
    "max-width:100%",
    "margin:0 0 12px",
    "padding:12px 14px",
    "border-radius:8px",
    "border:1px solid rgba(139,149,179,0.35)",
    "background:#1b2a5a",
    "color:#ebeaf8",
    `font-family:${FONT_SANS}`,
    "font-size:13px",
    "line-height:1.45",
    "box-shadow:0 4px 16px rgba(0,0,0,0.2)",
    "display:flex",
    "flex-direction:column",
    "align-items:flex-start"
  ].join(";")

  const header = document.createElement("div")
  header.style.cssText = [
    "display:inline-flex",
    "align-items:center",
    "gap:6px",
    "width:fit-content",
    "max-width:100%",
    "margin-bottom:6px"
  ].join(";")

  const bunny = document.createElement("img")
  bunny.src = rabbitSrc
  bunny.width = 22
  bunny.height = 22
  bunny.alt = ""
  bunny.setAttribute("aria-hidden", "true")
  bunny.style.cssText = "display:block;flex-shrink:0;object-fit:contain"

  const brand = document.createElement("span")
  brand.textContent = "HackerHare"
  brand.style.cssText = `font-family:${FONT_BRAND};font-size:11px;font-weight:700;color:#d3ceee;white-space:nowrap`

  header.append(bunny, brand)

  const title = document.createElement("p")
  title.style.cssText = "margin:0 0 4px;font-weight:600;color:#ebeaf8"
  title.textContent = "Pre-checked marketing opt-in"

  const body = document.createElement("p")
  body.style.cssText = "margin:0 0 10px;color:#a8b2cc"
  body.textContent =
    "A newsletter or marketing checkbox is already selected. Review before you submit."

  const dismiss = document.createElement("button")
  dismiss.type = "button"
  dismiss.setAttribute(DISMISS_BTN_ATTR, "true")
  dismiss.textContent = "Dismiss"
  dismiss.style.cssText = DISMISS_BUTTON_STYLES
  dismiss.style.cursor = "pointer"
  dismiss.addEventListener("click", () => {
    form.setAttribute(DISMISSED_ATTR, "true")
    banner.remove()
  })

  banner.append(header, title, body, dismiss)
  form.parentElement?.insertBefore(banner, form)
}
