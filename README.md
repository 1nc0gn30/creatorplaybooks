# 📚 CreatorPlaybooks (`creatorplaybooks` · `:5185`)

[![Zoth Studio v2](https://img.shields.io/badge/Zoth_Studio_v2-CreatorPlaybooks-D4AF37?style=for-the-badge&logo=compass&logoColor=black)](https://zoth.nullai.tech/tools/creatorplaybooks)
[![ZothOS Status](https://img.shields.io/badge/ZothOS-Native_CLI_%26_TUI-10B981?style=for-the-badge&logo=gnubash&logoColor=white)](https://github.com/1nc0gn30/zoth-os)
[![Open Access](https://img.shields.io/badge/Access-100%25_Free_%26_Unlocked-06B6D4?style=for-the-badge)](https://creatorplaybooks.netlify.app)
[![Support](https://img.shields.io/badge/Support-Buy_Us_a_Coffee-FFDD00?style=for-the-badge&logo=buymeacoffee&logoColor=black)](https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X)

> **Curated reading lists, tactical playbooks, and mental models from top creators and operators with zero-tracking client-side search.**
> Published by **Neal Frazier Tech** ([@NealFrazierTech](https://x.com/NealFrazierTech) · [@1nc0gn30](https://github.com/1nc0gn30)) • NullAI Platform. Inspired by [@buildwithmaya](https://x.com/buildwithmaya).

---

## ✦ What It Does

CreatorPlaybooks is a high-velocity workstation and reference directory indexing proven frameworks, tactical plays, and reading recommendations from frontier creators and operators. It features:
- **Interactive Playbook Search**: Zero-latency, client-side filtering across mental models, execution cadences, and swipe files.
- **Mentor Reading Lists**: Deep-dive dossiers into specific builder journeys, strategy decks, and operational habits.
- **Repeatable Plays**: Actionable tactics with frequency guidance and battle-tested execution recipes.
- **Swipe Files**: Copy-ready hooks, writing angles, and audience engagement vectors.
- **Offline & Zero-Egress Support**: Fully runs offline and client-side on `127.0.0.1:5185` with zero telemetry requirements.

---

## ✦ How It Works

1. **Client-Side Reactive Core**: Built with React 19, TypeScript, and Vite, bundling all playbook metadata locally for instant in-browser utility.
2. **Deterministic Search Engine**: Fast fuzzy search and tag indexing without backend queries or external tracking cookies.
3. **Optional Live X Telemetry**: Integrates with X Developer API v2 (`X_BEARER_TOKEN`) on Netlify Functions to hydrate real-time follower counts and latest posts when online, gracefully falling back to offline curated dossiers.
4. **Zoth Studio v2 & ZothOS Ecosystem Integration**: Pre-wired into Zoth Studio v2 (`/tools/creatorplaybooks`), ZothOS desktop launchers, and terminal CLIs.

---

## ✦ ZothOS CLI, TUI & Dispatch Commands

CreatorPlaybooks is pre-installed across ZothOS and available on any system running the NullAI arsenal:

```bash
# Launch interactive workstation on http://127.0.0.1:5185
creatorplaybooks desktop

# Run 60fps Unicode U+2800 Braille terminal TUI
creatorplaybooks-tui

# Inspect daemon health & telemetry status as JSON
creatorplaybooks --status
creatorplaybooks --json

# Start dev server manually
creatorplaybooks serve
```

---

## ✦ Local Development & Build

```bash
# Install dependencies
npm install

# Run local development server (:5185)
npm run dev

# Run production build & verify type safety
npm run build

# Preview production build locally
npm run preview
```

### X API Setup (Optional for Live Telemetry)

1. Navigate to the [X Developer Portal](https://developer.x.com/en/portal/dashboard).
2. Create a Project/App and generate a Bearer Token.
3. Add to your local `.env` (ignored by `.gitignore`):
   ```bash
   X_BEARER_TOKEN="your_bearer_token_here"
   ```
4. For Netlify deployments:
   ```bash
   netlify env:set X_BEARER_TOKEN "your_bearer_token_here"
   ```

---

## ✦ Netlify Serverless Functions

- `api.mjs` — Creator directory & data query API
- `x-data.mjs` — Live X API proxy (uses `X_BEARER_TOKEN`)
- `members.mjs` — Open member state API
- `export.mjs` — Bundled playbook export utility
- `profile.mjs` — Creator profile resolution API
- `sync.mjs` — Telemetry synchronization API

---

## ✦ 100% Free & Open Access — Zero Paywalls

All tools across the NullAI / Neal Frazier Tech ecosystem are **100% free, open, and unlocked by default**. Zero license modals, zero paywalls, zero locked exports.

If CreatorPlaybooks helps your workflow, consider supporting ongoing independent open-source development:

- ☕ **Buy Us a Coffee (Stripe)**: [buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X](https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X)
- 🪙 **Solana Tip Address**: `GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK` (`solana:GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK`)

---

## ✦ Architecture & Attribution

- **Architect**: Neal Frazier ([@1nc0gn30](https://github.com/1nc0gn30))
- **Organization**: Neal Frazier Tech • [NullAI Platform](https://nullai.tech)
- **Repository**: [github.com/1nc0gn30/creatorplaybooks](https://github.com/1nc0gn30/creatorplaybooks)
- **License**: MIT
