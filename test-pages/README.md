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
2. In the popup: **Form Shielding** on (master switch); turn **Insecure Input Alerts** on/off per test below. Turning shielding off also turns alerts off.
3. After reloading the extension, **hard-refresh** the test tab (avoids “Extension context invalidated”).
4. Use the **page** DevTools console and filter by `HackerHare`.

To reset the threat counter: Popup shows `threat-count`, or Chrome DevTools → Application → Extension storage → clear `threat-count`.

## Fixtures

| Page | URL | Shielding | Alerts | Expected |
|------|-----|-----------|--------|----------|
| [01-clean-baseline.html](01-clean-baseline.html) | `/01-clean-baseline.html` | on | any | Shield active log only; no modal; form submits normally |
| [02-insecure-password.html](02-insecure-password.html) | `/02-insecure-password.html` | on | on | Centered modal (“Unencrypted password detected”) + `threat-count` +1 (once per load); dismiss with **I understand** or backdrop click |
| [02-insecure-password.html](02-insecure-password.html) | same | on | off | No password modal |
| [03-suspicious-form.html](03-suspicious-form.html) | `/03-suspicious-form.html` | on | any | Submit blocked + “Suspicious submission blocked” modal + `threat-count` +1 on submit |
| [03-suspicious-form.html](03-suspicious-form.html) | same | off | any | Submit **not** blocked |
| [04-full-threat-suite.html](04-full-threat-suite.html) | `/04-full-threat-suite.html` | on | on | Password modal on load (+1), dismiss, then submit block modal (+1) |

## What each page mocks

- **Insecure input:** `http:` origin + `<input type="password">` (not HTTPS, not `file://`).
- **Suspicious form:** `<form>` with `ssn` / sensitive attributes on **HTTP** (fails HTTPS security check) and `action` pointing at `http://…`.

## HTTPS control test

These fixtures are HTTP-only. To confirm **no false positives** on HTTPS, still spot-check `https://example.com` manually (shield log only).
