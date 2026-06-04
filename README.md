# HackerHare

A privacy-first Chrome extension that runs **offline heuristics** in the browser: it warns on risky pages, flags deceptive UI, and blocks sensitive form submissions—without sending page content or URLs to a server. A blind telemetry ping can increment a global threat counter when a local threat is verified.

## What it does

- **Form shielding** — Blocks suspicious submits (e.g. sensitive fields on HTTP or deceptive hostnames).
- **Insecure input alerts** — Password fields on non-HTTPS pages.
- **Dark pattern alerts** — Pre-checked marketing/opt-in checkboxes near forms.
- **Phishing alerts** — Brand-in-subdomain and typosquat hostname checks.

Settings and a local **Threats Intercepted** count live in the popup.

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
2. Pin **HackerHare**, open the popup, and turn **Form Shielding** on (plus any child toggles you want to test).

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
