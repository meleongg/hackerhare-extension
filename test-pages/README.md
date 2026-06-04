# HackerHare manual test fixtures

These pages exercise the offline heuristics in [`contents/shield.ts`](../contents/shield.ts).

**Important:** `checkInsecureInputs()` only runs when the page URL is real **`http:`**. Opening HTML via `file://` will **not** trigger it (`protocol` is `file:`). Serve this folder over HTTP locally.

## Run the test server

```bash
pnpm test:pages
```

Then open:

- http://localhost:8080/

Default port is **8080** (override with `PORT=3000 pnpm test:pages`).

## Before testing

1. Load the extension (`pnpm dev` or production build).
2. In the popup: **Form Shielding** on (master). Enable child toggles per test below.
3. Turning **Form Shielding** off cascades all child toggles off.
4. After reloading the extension, **hard-refresh** the test tab.
5. Use the **page** DevTools console and filter by `HackerHare`.

To reset the threat counter: Popup, or DevTools → Application → Extension storage → clear `threat-count`.

## Fixtures

| Page | URL | Shielding | Alerts | Dark patterns | Phishing | Expected |
|------|-----|-----------|--------|---------------|----------|----------|
| [01-clean-baseline.html](01-clean-baseline.html) | `/01-clean-baseline.html` | on | any | any | any | Shield log only; no modal/banner |
| [02-insecure-password.html](02-insecure-password.html) | `/02-insecure-password.html` | on | on | any | any | Summary modal includes HTTP password warning; +1 count |
| [02-insecure-password.html](02-insecure-password.html) | same | on | off | any | any | No password warning |
| [03-suspicious-form.html](03-suspicious-form.html) | `/03-suspicious-form.html` | on | any | any | any | Submit blocked + submit modal +1 on submit |
| [03-suspicious-form.html](03-suspicious-form.html) | same | off | any | any | any | Submit **not** blocked |
| [04-full-threat-suite.html](04-full-threat-suite.html) | `/04-full-threat-suite.html` | on | on | on | off | Summary modal (password) on load; dark-pattern banner; submit block on submit |
| [05-dark-pattern-opt-in.html](05-dark-pattern-opt-in.html) | `/05-dark-pattern-opt-in.html` | on | any | on | any | Banner above form +1; dismiss sticks |

## Mission 03 — Phishing (easy local test)

Phishing normally uses the real hostname, so `localhost` alone will not trigger it. On the test server you can use **`?simulateHost=`** (no `/etc/hosts`):

1. `pnpm test:pages`
2. Popup: **Form Shielding** + **Phishing Alerts** on
3. Open [06-phishing-simulate.html](06-phishing-simulate.html) and click a link, or visit directly:

- http://localhost:8080/06-phishing-simulate.html?simulateHost=paypal.secure-verify.test
- http://localhost:8080/06-phishing-simulate.html?simulateHost=rnicrosoft.test

Expect a summary modal once per load. `simulateHost` only works on `localhost` / `127.0.0.1` port **8080**.

**Optional (real hostname):** add `127.0.0.1 paypal.secure-verify.test` to `/etc/hosts` and use that host in the URL instead of `simulateHost`.

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
