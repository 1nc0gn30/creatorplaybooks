# CreatorPlaybooks (`creatorplaybooks` · `v1.1.0` · `:5185`)

[![Zoth Studio v2](https://img.shields.io/badge/Zoth_Studio_v2-CreatorPlaybooks-D4AF37?style=for-the-badge)](https://zoth.nullai.tech/tools/creatorplaybooks)
[![ZothOS CLI & TUI](https://img.shields.io/badge/ZothOS-CLI_%26_Braille_TUI-10B981?style=for-the-badge)](https://github.com/1nc0gn30/zoth-os)
[![Open Access](https://img.shields.io/badge/Access-100%25_Free_%26_Unlocked-06B6D4?style=for-the-badge)](https://creatorplaybooks.netlify.app)
[![Support](https://img.shields.io/badge/Support-Buy_Us_a_Coffee-FFDD00?style=for-the-badge)](https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X)

> Curated reading list, mentor playbook directory, local loopback JSON API, and Unicode U+2800 Braille TUI indexing **35 public builders**, **115 repeatable plays**, and **20 cities**.
> Engineered by **Neal Frazier Tech** ([@1nc0gn30](https://github.com/1nc0gn30)) • [NullAI Platform](https://nullai.tech). Inspired by [@buildwithmaya](https://x.com/buildwithmaya).

---

## What It Does

- **35-Mentor Curated Directory (`115` Plays, `20` Cities)**: Client-side search, category/tag filtering, Saved Queue bookmarks, relationship flow graph, and sourced playbooks backed by a single canonical dataset (`shared/creators.json`).
- **Dual-Theme Workstation**: Full **Editorial Ivory Light Mode (`#FAF8F3`)** and **Obsidian Dark Mode (`#0A0A0F`)** with persistent preference, `?theme=light|dark` sync, and WCAG `>= 4.5:1` contrast.
- **Persistent Local Dashboard & Offline Builder Hub**: Weekly post scheduler, XP/streak tracker, local builder profile card, creator signal voting, nomination queue, and one-click JSON/Markdown/`.ics`/`.zip` exports stored strictly in browser `localStorage`.
- **Hardened Loopback Server (`server.mjs` on `127.0.0.1:5185`)**: Zero external dependencies; serves built `dist/` static assets plus live `/health` and `/api/*` endpoints from `shared/creators.json`.
- **Unicode U+2800 Braille TUI (`creatorplaybooks-tui`)**: Interactive terminal browser and `--once` / `--json` CLI views reading `shared/creators.json` and live `:5185/health`.

---

## Verified Loopback API Endpoints (`http://127.0.0.1:5185`)

| Method | Endpoint | Response |
| :---: | :--- | :--- |
| `GET` / `HEAD` | `/health` & `/api/health` | `200 JSON` — version (`1.1.0`), `creators: 35`, `plays: 115`, `places: 20` |
| `GET` | `/api/creators?q=&category=&tag=` | `200 JSON` — filtered mentor index |
| `GET` | `/api/creator?id=<slug>&expand=all` | `200 JSON` (or `404 JSON` for unknown slug) — full dossier, plays, hooks, angles, sources |
| `GET` | `/api/playbook?creator=<slug>` | `200 JSON` — repeatable plays only |
| `GET` | `/api/ideas?creator=<slug>&count=6` | `200 JSON` — synthesized post ideas from hooks & angles |
| `GET` | `/api/export?creator=<slug>&format=json\|md` | `200` — downloadable JSON agent-kit bundle or Markdown pack (`Content-Disposition: attachment`) |
| `GET` / `POST` | `/api/members?action=votes\|vote` | `200 JSON` — local loopback vote tally |

### Security Guarantees (`server.mjs` & Netlify Functions)

- **Loopback-Only Binding & Host Guard**: Binds strictly to `127.0.0.1:5185` and returns `403 JSON` on untrusted `Host` headers (DNS-rebinding protection).
- **Exact-Port Origin CORS Allowlist**: Validates `new URL(origin)` hostname and exact numeric port (rejecting port-suffix spoofing like `:51850` or external origins with `403 JSON` on `OPTIONS` and `/api/*` routes, emitting `Vary: Origin`).
- **Path-Traversal Containment**: Blocks `/../`, `/%2e%2e/`, `/@fs/`, and symlink escapes with `403 JSON`.
- **Security Headers**: Emits `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and loopback-safe `Content-Security-Policy` on every response (and via `netlify.toml` `[[headers]]`).
- **Bounded JSON Parsing**: Enforces `1 MiB` max request body (`413 JSON`) and strict JSON object parsing (`400 JSON`), with `404 JSON` for unknown `/api/*` routes.

---

## ZothOS CLI, Braille TUI & Hermes Plugin Tools

```bash
# Start hardened production loopback server on http://127.0.0.1:5185
creatorplaybooks serve

# Launch workstation and open in browser
creatorplaybooks desktop

# Inspect status and machine-readable JSON telemetry
creatorplaybooks --status
creatorplaybooks --json
creatorplaybooks --version

# Launch interactive Unicode U+2800 Braille terminal TUI
creatorplaybooks-tui

# Non-interactive Braille snapshot & filtered JSON output
creatorplaybooks-tui --once
creatorplaybooks-tui --search maya --json
```

### Hermes Agent Plugin (`hermes-creatorplaybooks`)

The community Hermes plugin (`github.com/1nc0gn30/hermes-creatorplaybooks`) exposes 5 read-only agent tools:
- `creatorplaybooks_mentors` — list mentors with optional filters
- `creatorplaybooks_mentor` — inspect one mentor profile & verified sources
- `creatorplaybooks_playbook` — fetch repeatable plays for a mentor
- `creatorplaybooks_ideas` — generate post ideas from hooks & angles
- `creatorplaybooks_goal_plan` — generate a dated 7/14/30/60/90-day goal schedule

---

## Local Build, Lint & Test

```bash
npm install
npm run build        # TypeScript build + Vite production bundle -> dist/
npm test             # Static + live HTTP/API/security + CLI/TUI test suite
npm run lint         # oxlint src
npx tsc --noEmit     # Strict typecheck
npm start            # Run node server.mjs on 127.0.0.1:5185
```

---

## 100% Free & Open Access

Every playbook, API endpoint, local dashboard, and export is free and unlocked with zero paywalls. Voluntary support:

- **Buy Us a Coffee (Stripe)**: [buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X](https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X)
- **Solana Tip Address**: `GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK`

Engineered by Neal Frazier Tech ([@1nc0gn30](https://github.com/1nc0gn30)) • [NullAI Platform](https://nullai.tech) · MIT License.
