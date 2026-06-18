# HackerHare

Plasmo MV3 extension: on-device heuristics for unsafe forms, HTTP passwords, dark patterns, and phishing hostnames. Optional anonymous counter ping (off by default)—no page data in requests.

## Features

- **Form shielding** — blocks risky submits (sensitive fields on HTTP / deceptive hosts)
- **Insecure input alerts** — password fields on non-HTTPS pages
- **Dark pattern alerts** — pre-checked marketing/opt-in checkboxes near forms
- **Phishing alerts** — brand-in-subdomain + typosquat hostname checks
- **Trusted sites** — user whitelist for phishing false positives (`options.tsx` or popup **Manage**)
- **Popup** — toggles, local threat count; **Settings** — trusted sites + read-only system defaults

## Origins

Forked in spirit from **[StormHacks 2024](https://github.com/DonaldKLee/Stormhacks-2024)** (Donald, Tracy, Tracy). Rewritten in Plasmo/TypeScript with phishing, dark-pattern, and telemetry work on top.

## Tech stack

Plasmo (MV3), React, TypeScript, Tailwind, [`@plasmohq/storage`](https://docs.plasmo.com/framework/storage), [`tldts`](https://github.com/remusao/tldts)

## Dev setup

**Requires:** Node 18+, pnpm (or npm).

```bash
pnpm install
pnpm dev
```

Load `build/chrome-mv3-dev` at `chrome://extensions` (Developer mode). Turn **Form Shielding** on in the popup; enable **Anonymous global counter** only to test telemetry.

**Test fixtures** (must serve over HTTP, not `file://`):

```bash
pnpm test:pages   # http://localhost:8080 — see test-pages/README.md
```

**Prod build / store zip:**

```bash
pnpm build        # → build/chrome-mv3
pnpm package
```

## Storage keys (`chrome.storage`)

All local; nothing synced or uploaded except opt-in telemetry (see below).

| Key | Purpose |
| --- | --- |
| `shielding-enabled`, `alerts-enabled`, `dark-patterns-enabled`, `phishing-alerts-enabled` | Feature toggles |
| `telemetry-enabled` | Anonymous counter opt-in (default off) |
| `threat-count` | Popup threat counter |
| `phishing-whitelist` | User-trusted registrable domains (phishing skip only) |

System default brand domains ship in `assets/brand-registry.json` (not stored per user).

## Network

- **Heuristics:** no server calls; page content/URLs stay in the browser.
- **Telemetry (opt-in):** `POST https://hackerhare.vercel.app/api/metrics/increment` — empty body, `x-hackerhare-agent` header only.

Policies: [privacy](https://hackerhare.vercel.app/privacy) · [terms](https://hackerhare.vercel.app/terms) · [site](https://hackerhare.vercel.app)

## Manifest permissions

| Permission | Why |
| --- | --- |
| `storage` | Settings, threat count, telemetry flag, trusted-site list |
| `<all_urls>` content script | On-device scans on visited pages |
| `hackerhare.vercel.app` | Opt-in anonymous counter only |
