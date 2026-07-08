# MayaGrowth - Creator Playbooks Platform

Live X API integration powered by X Developer API v2.

## X API Setup

1. Go to https://developer.x.com/en/portal/dashboard
2. Create a new app or use existing app
3. Generate Bearer Token from "Keys and Tokens" section
4. Add token to Netlify environment variables:

```bash
netlify env:set X_BEARER_TOKEN "your_bearer_token_here"
```

Or in the Netlify UI: Site settings > Environment variables > Add variable.

**Do NOT commit the token to git.**

## Local Development

Create `.env` in project root (already ignored by `.gitignore`):

```
X_BEARER_TOKEN=your_bearer_token_here
```

Run local dev server:
```bash
npm run dev
```

## Features

- **Creator Playbooks**: Proven growth strategies from top builders
- **Live X Profiles**: Real-time avatar, bio, follower count, and latest posts
- **Repeatable Plays**: Actionable tactics with frequency guidance
- **Swipe Files**: Copy-ready hooks and writing angles
- **Developer API**: `/api/creator?id={creatorId}` for agent consumption

## Build

```bash
npm run build
```

## Deploy

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
