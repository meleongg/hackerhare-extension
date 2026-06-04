# HackerHare manual test fixtures

These pages exercise the offline heuristics in [`contents/shield.ts`](../contents/shield.ts).

**Important:** `checkInsecureInputs()` only runs when the page URL is real **`http:`**. Opening HTML via `file://` will **not** trigger it (`protocol` is `file:`). Serve this folder over HTTP locally.

## Run the test server

```bash
pnpm test:pages
```

Then open:

- http://localhost:8080/

Default port is **8080** (override with `PORT=3000 pnpm test:pages`). Phishing simulation works on **any port** as long as the hostname is `localhost` or `127.0.0.1`.

## Before testing

1. Load the extension (`pnpm dev` or production build).
2. In the popup: **Form Shielding** on (master). Enable child toggles per test below.
3. Turning **Form Shielding** off cascades all child toggles off.
4. After reloading the extension, **hard-refresh** the test tab.
5. Use the **page** DevTools console and filter by `HackerHare`.

To reset the threat counter: Popup, or DevTools → Application → Extension storage → clear `threat-count`.

## Fixtures

| Page | Path | Shielding | Alerts | Dark patterns | Phishing | Expected |
|------|------|-----------|--------|---------------|----------|----------|
| Northline Credit (01) | `/01-clean-baseline.html` | on | any | any | any | Shield log only; no modal/banner |
| Cascade Outdoor (02) | `/02-insecure-password.html` | on | on | any | any | Summary modal includes HTTP password warning; +1 count |
| Cascade Outdoor (02) | same | on | off | any | any | No password warning |
| amazn Account (03) | `/03-suspicious-form.html` | on | any | any | any | Submit blocked + submit modal +1 on submit |
| amazn Account (03) | same | off | any | any | any | Submit **not** blocked |
| PayPai Security (04) | `/04-full-threat-suite.html` | on | on | on | on | Phishing: **PayPal** lookalike + password modal; dark-pattern banner; submit block on verify |
| Pulse Audio (05) | `/05-dark-pattern-opt-in.html` | on | any | on | on | Dark-pattern banner; Phishing: **Pulse Audio** lookalike (auto per page) |
| Microsoft sign-in (06) | `/06-phishing-simulate.html` | on | any | any | on | **No modal on the picker** until you choose an account; then **Microsoft** or **Outlook** subdomain impersonation modal |

## Mission 03 — Phishing (easy local test)

Phishing normally uses the real hostname, so `localhost` alone will not trigger it. On the test server you can use **`?simulateHost=`** (no `/etc/hosts`):

1. `pnpm test:pages`
2. Popup: **Form Shielding** + **Phishing Alerts** on
3. Open [06-phishing-simulate.html](06-phishing-simulate.html) and **click an account type** (the picker alone does not trigger phishing). Page 06 uses **hash** links so the shield can rescan without a full reload.

   Direct URLs (query or hash also work):

   - `http://localhost:8080/06-phishing-simulate.html#simulateHost=microsoft.secure-verify.test`
   - `http://localhost:8080/06-phishing-simulate.html#simulateHost=outlook.secure-verify.test`

   Typosquat variant (optional): `#simulateHost=rnicrosoft.test`

Pages **04** and **05** pick the correct fake hostname automatically from the filename (no query string required). Optional `?simulateHost=` still works on other fixtures.

**If nothing happens:**

1. Reload the extension in `chrome://extensions`, then **hard-refresh** the tab (`Cmd+Shift+R`). `pnpm dev` rebuilds often cause **Extension context invalidated** on tabs that were already open.
2. Confirm the URL is **`http://localhost:…`** (or `127.0.0.1`) from `pnpm test:pages` — not `file://` (password + phishing checks need HTTP).
3. Popup: **Form Shielding** on (master). Turn on the child toggles you are testing.
4. DevTools → Console → filter `HackerHare`. You should see `HackerHare Shield Active on this domain` on load.

## What each page mocks

- **Insecure input:** `http:` + password field.
- **Suspicious form:** SSN/sensitive fields on HTTP with weak `action`.
- **Dark pattern:** Pre-checked checkbox + newsletter/subscribe copy.
- **Phishing:** Deceptive hostname (see hosts file above).

## Regenerating the brand list

```bash
node scripts/build-brand-registry.mjs
```

Writes [`assets/brand-registry.json`](../assets/brand-registry.json) (~114 curated domains).

## HTTPS control test

Spot-check `https://example.com` manually (shield log only, no false phishing on localhost).
