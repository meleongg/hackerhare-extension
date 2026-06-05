export function isExtensionContextValid(): boolean {
  return Boolean(chrome.runtime?.id)
}

export function isContextInvalidatedError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.includes("Extension context invalidated")
  )
}

export function sendSafeMessage(message: unknown): void {
  if (!chrome.runtime?.id) {
    console.log("HackerHare updated in the background. Awaiting page reload.")
    return
  }

  try {
    chrome.runtime.sendMessage(message)
  } catch (error: unknown) {
    if (isContextInvalidatedError(error)) {
      console.debug("HackerHare context invalidated. Execution halted safely.")
    } else {
      console.error(error)
    }
  }
}
