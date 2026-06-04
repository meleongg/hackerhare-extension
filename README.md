# HackerHare

A privacy-first Chrome extension that runs **on-device heuristics** in the browser: it warns on risky pages, flags deceptive UI, and blocks sensitive form submissions without sending page content or URLs anywhere. Optionally, you can enable an **anonymous global counter**—a blind ping that increments a public total when a threat is verified locally (off by default).

## What it does

- **Form shielding** — Blocks suspicious submits (e.g. sensitive fields on HTTP or deceptive hostnames).
- **Insecure input alerts** — Password fields on non-HTTPS pages.
- **Dark pattern alerts** — Pre-checked marketing/opt-in checkboxes near forms.
- **Phishing alerts** — Brand-in-subdomain and typosquat hostname checks.

Settings and a local **Threats Intercepted** count live in the popup. **Anonymous global counter** (telemetry) is opt-in in the popup and sends no page data.

## Origins

This project grew out of **[StormHacks 2024](https://github.com/DonaldKLee/Stormhacks-2024)**—the original hackathon repo built with Donald, Tracy, and Tracy. This extension takes inspiration from that prototype and iterates on it with a Plasmo/TypeScript rewrite, on-device phishing and dark-pattern detection, and an optional anonymous global counter.

## Tech stack

- [Plasmo](https://docs.plasmo.com/) (Manifest V3, React popup)
- TypeScript, Tailwind CSS
- [`@plasmohq/storage`](https://docs.plasmo.com/framework/storage) for extension settings
- [`tldts`](https://github.com/remusao/tldts) for hostname / registrable-domain parsing

## Getting started

**Prerequisites:** Node.js 18+, [pnpm](https://pnpm.io/) (or npm).

```bash
pnpm install
pnpm dev
```

1. Open `chrome://extensions`, enable **Developer mode**, **Load unpacked** → `build/chrome-mv3-dev`.
2. Pin **HackerHare**, open the popup, and turn **Form Shielding** on (plus any child toggles you want to test). Enable **Anonymous global counter** only if you want to test telemetry pings.

**Manual test pages** (HTTP fixtures; must be served, not opened as `file://`):

```bash
pnpm test:pages
```

Open http://localhost:8080/ — see [test-pages/README.md](test-pages/README.md) for scenarios.

**Production build:**

```bash
pnpm build
```

Output: `build/chrome-mv3` (zip or upload for store submission).

## Chrome Web Store permissions

| Permission                                               | Why                                                                                                                                                              |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Access to all websites** (`<all_urls>` content script) | Run on-device heuristics on pages you visit (forms, passwords, phishing hostname checks). Analysis stays in the browser; no page content is sent to our servers. |
| **hackerhare.vercel.app** (host permission)              | Only used when you opt in to **Anonymous global counter**: a blind `POST` to increment a public total. No URLs or page data in the request.                      |
