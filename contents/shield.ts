import type { PlasmoCSConfig } from "plasmo"

import { Storage } from "@plasmohq/storage"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

const storage = new Storage()

async function activateShieldIfEnabled() {
  const enabled = await storage.get<boolean>("shielding-enabled")
  if (enabled === false) return

  console.log(
    "HackerHare Shield Active on this domain",
    window.location.hostname
  )
}

void activateShieldIfEnabled()

storage.watch({
  "shielding-enabled": (change) => {
    if (change.newValue === false) return

    console.log(
      "HackerHare Shield Active on this domain",
      window.location.hostname
    )
  }
})
