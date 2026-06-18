export function getExtensionOptionsUrl(): string {
  return chrome.runtime.getURL("options.html")
}

/** Open the extension options page (popup, options, etc.). */
export function openExtensionOptions(): void {
  if (!chrome.runtime?.id) return

  const url = getExtensionOptionsUrl()

  // openOptionsPage() is unreliable from the action popup — Chrome often
  // tears down the popup before the options tab opens.
  if (
    typeof window !== "undefined" &&
    window.location.pathname.endsWith("popup.html")
  ) {
    window.open(url, "_blank", "noopener")
    return
  }

  try {
    chrome.runtime.openOptionsPage(() => {
      if (chrome.runtime.lastError) {
        window.open(url, "_blank", "noopener")
      }
    })
  } catch {
    window.open(url, "_blank", "noopener")
  }
}
