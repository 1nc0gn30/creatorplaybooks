# creatorplaybooks

Agentic Access to become knowledgable upon real people and real playboooks that work.

## Overview
Agentic Access to become knowledgable upon real people and real playboooks that work.

## Tech Stack
- React
- Vite
- Netlify (deployed)

## Project Structure
```
creatorplaybooks/
  - creators
  - netlify
  - public
  - scratch
  - scripts
  - src
  (522 files total)
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
git clone https://github.com/1nc0gn30/creatorplaybooks.git
cd creatorplaybooks
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Available Scripts
  npm run dev - vite
  npm run build - tsc -b && vite build
  npm run lint - eslint .
  npm run preview - vite preview

## Original README
<details>
<summary>Click to expand original README</summary>

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

</details>

## TODO / Roadmap
- [ ] Add unit tests
- [ ] Add LICENSE file
- [ ] Add Dockerfile for containerized deployment
- [ ] Consider adding Tailwind CSS
- [ ] Add CI/CD pipeline
- [ ] Add contribution guidelines (CONTRIBUTING.md)
- [ ] Improve error handling and edge cases
- [ ] Add environment variable documentation
- [ ] Update dependencies to latest versions
- [ ] Add code comments and inline documentation

## Deployment
This project is deployed on Netlify. See netlify.toml for configuration.

## Author
**Neal Frazier** - [@AshAmplifies](https://github.com/1nc0gn30)

## Links
- GitHub: https://github.com/1nc0gn30/creatorplaybooks

---
*This README was enhanced as part of the neals-projects-2026 batch update.*
