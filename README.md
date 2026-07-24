<!-- xonettn -->
<div align="center">

# ⚛️ MayaGrowth - Creator Playbooks Platform

Live X API integration powered by X Developer API v2.


![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) ![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white) ![Netlify](https://img.shields.io/badge/Netlify-00C7B7?logo=netlify&logoColor=white)

![Deploy](https://img.shields.io/badge/Deployed-Netlify-00C7B7?logo=netlify&logoColor=white)

</div>

---

## ⚙️ X API Setup

1. Go to https://developer.x.com/en/portal/dashboard
2. Create a new app or use existing app
3. Generate Bearer Token from "Keys and Tokens" section
4. Add token to Netlify environment variables:

```bash
netlify env:set X_BEARER_TOKEN "your_bearer_token_here"
```

Or in the Netlify UI: Site settings > Environment variables > Add variable.

**Do NOT commit the token to git.**

## 💻 Local Development

Create `.env` in project root (already ignored by `.gitignore`):

```
X_BEARER_TOKEN=your_bearer_token_here
```

Run local dev server:
```bash
npm run dev
```

## ✨ Features

- **Creator Playbooks**: Proven growth strategies from top builders
- **Live X Profiles**: Real-time avatar, bio, follower count, and latest posts
- **Repeatable Plays**: Actionable tactics with frequency guidance
- **Swipe Files**: Copy-ready hooks and writing angles
- **Developer API**: `/api/creator?id={creatorId}` for agent consumption

## 🔨 Build

```bash
npm run build
```

## 🚀 Deploy

```bash
netlify deploy --prod
```

## Netlify Functions

- `api.mjs` - Creator data API
- `x-data.mjs` - X API proxy (requires `X_BEARER_TOKEN` env var)
- `members.mjs` - Member/auth API
- `export.mjs` - Export bundle API
- `profile.mjs` - Profile API
- `sync.mjs` - Sync API

---

<div align="center">

**[xonettn]** · Built by [Neal Frazier](https://github.com/1nc0gn30) · [@AshAmplifies](https://twitter.com/AshAmplifies)

</div>
