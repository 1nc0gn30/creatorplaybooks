#!/usr/bin/env node
/**
 * CreatorPlaybooks v1.1.0 — Hardened Zero-Dependency Loopback Production Server
 *
 * Serves built dist/ static assets and full local JSON API endpoints from
 * shared/creators.json strictly on loopback (127.0.0.1:5185 by default).
 *
 * Security controls:
 *  - Strict loopback Host header allowlist (403 JSON on untrusted Host)
 *  - Strict exact-port local Origin CORS allowlist (403 JSON on untrusted Origin / port-suffix spoofing)
 *  - Canonical path traversal & symlink containment (403 JSON on /../, /%2e%2e/, /@fs/, symlink escapes)
 *  - All 4 baseline security headers on every response (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, CSP)
 *  - MAX_BODY_BYTES = 1 MiB (413 JSON) & strict JSON object parsing (400 JSON)
 *  - Clean HEAD handling on /, /health, /api/health, /robots.txt, /sitemap.xml, and static assets
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = __dirname;
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const SHARED_CREATORS_PATH = path.resolve(ROOT_DIR, 'shared', 'creators.json');
const VERSION = '1.1.0';
const MAX_BODY_BYTES = 1_048_576; // 1 MiB
const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '[::1]', '::1']);
const HANDLE_RE = /^[A-Za-z0-9_]{1,15}$/;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

const CSP_HEADER = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' http://127.0.0.1:* http://localhost:*",
  "frame-ancestors 'self' http://127.0.0.1:* http://localhost:*",
  "object-src 'none'",
  "base-uri 'self'",
].join('; ');

function loadDataset() {
  const raw = fs.readFileSync(SHARED_CREATORS_PATH, 'utf8');
  const data = JSON.parse(raw);
  const creators = Array.isArray(data.creators) ? data.creators : [];
  const places = Array.isArray(data.places) ? data.places : [];
  const categories = Array.isArray(data.categories) ? data.categories : [];
  const totalPlays = creators.reduce((sum, c) => sum + (Array.isArray(c.plays) ? c.plays.length : 0), 0);
  return {
    version: data.version || VERSION,
    checkedDate: data.checkedDate || '2026-11-11',
    creators,
    places,
    categories,
    stats: {
      creators: creators.length,
      plays: totalPlays,
      places: places.length,
    },
  };
}

export function isAllowedHost(hostHeader) {
  if (!hostHeader || typeof hostHeader !== 'string') return false;
  const trimmed = hostHeader.trim().toLowerCase();
  if (!trimmed) return false;
  // IPv6 bracketed form: [::1] or [::1]:5185
  if (trimmed.startsWith('[')) {
    const match = trimmed.match(/^(\[::1\])(?::(\d+))?$/);
    if (!match) return false;
    if (match[2] !== undefined) {
      const p = Number(match[2]);
      return Number.isInteger(p) && p >= 1 && p <= 65535;
    }
    return true;
  }
  const parts = trimmed.split(':');
  if (parts.length > 2) return false;
  const hostname = parts[0];
  if (hostname !== '127.0.0.1' && hostname !== 'localhost') return false;
  if (parts.length === 2) {
    if (!/^\d+$/.test(parts[1])) return false;
    const p = Number(parts[1]);
    return Number.isInteger(p) && p >= 1 && p <= 65535;
  }
  return true;
}

export function isAllowedOrigin(originHeader, serverPort) {
  if (!originHeader || typeof originHeader !== 'string') return false;
  let parsed;
  try {
    parsed = new URL(originHeader.trim());
  } catch {
    return false;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
  const host = parsed.hostname.toLowerCase();
  if (!LOOPBACK_HOSTS.has(host)) return false;
  if (parsed.username || parsed.password) return false;
  if (parsed.pathname !== '/' || parsed.search || parsed.hash) return false;
  const port = parsed.port ? Number(parsed.port) : (parsed.protocol === 'https:' ? 443 : 80);
  if (!Number.isInteger(port)) return false;
  const allowedPorts = new Set([Number(serverPort), 3000]);
  return allowedPorts.has(port);
}

function buildSecurityHeaders(originHeader, serverPort) {
  const headers = {
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': CSP_HEADER,
    'Vary': 'Origin',
  };
  if (originHeader && isAllowedOrigin(originHeader, serverPort)) {
    headers['Access-Control-Allow-Origin'] = originHeader.trim();
    headers['Access-Control-Allow-Methods'] = 'GET, POST, HEAD, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  }
  return headers;
}

function sendJson(res, statusCode, payload, extraHeaders = {}, isHead = false) {
  const body = JSON.stringify(payload, null, 2);
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    ...extraHeaders,
  };
  res.writeHead(statusCode, headers);
  if (isHead) {
    res.end();
  } else {
    res.end(body);
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let total = 0;
    const chunks = [];
    let aborted = false;

    const declared = req.headers['content-length'];
    if (declared !== undefined) {
      const len = Number(declared);
      if (Number.isFinite(len) && len > MAX_BODY_BYTES) {
        aborted = true;
        reject({ status: 413, error: `Payload exceeds maximum allowed size (${MAX_BODY_BYTES} bytes)` });
        return;
      }
    }

    req.on('data', (chunk) => {
      if (aborted) return;
      total += chunk.length;
      if (total > MAX_BODY_BYTES) {
        aborted = true;
        req.destroy();
        reject({ status: 413, error: `Payload exceeds maximum allowed size (${MAX_BODY_BYTES} bytes)` });
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (aborted) return;
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) {
        reject({ status: 400, error: 'Request body must be a valid JSON object' });
        return;
      }
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        reject({ status: 400, error: 'Malformed JSON body' });
        return;
      }
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        reject({ status: 400, error: 'JSON body must be a plain object' });
        return;
      }
      resolve(parsed);
    });

    req.on('error', () => {
      if (!aborted) reject({ status: 400, error: 'Failed to read request body' });
    });
  });
}

function generateIdeas(creator, count = 6) {
  const formats = ['post', 'thread', 'reply', 'quote', 'post', 'thread'];
  const hooks = Array.isArray(creator.hooks) && creator.hooks.length ? creator.hooks : [creator.bio.split('\n')[0]];
  const angles = Array.isArray(creator.angles) && creator.angles.length ? creator.angles : ['Share one concrete builder lesson.'];
  const tags = Array.isArray(creator.tags) && creator.tags.length ? creator.tags : ['buildinpublic'];
  return Array.from({ length: count }, (_, i) => ({
    id: `${creator.id}-idea-${i + 1}`,
    format: formats[i % formats.length],
    hook: hooks[i % hooks.length],
    angle: angles[i % angles.length],
    tags: [tags[i % tags.length], tags[(i + 1) % tags.length]].filter((v, idx, arr) => arr.indexOf(v) === idx),
  }));
}

function buildPlaybookMarkdown(creator, baseOrigin) {
  const lines = [
    `# ${creator.name} (${creator.handle}) — Growth Playbook`,
    '',
    `> Source API: ${baseOrigin}/api/creator?id=${creator.id}&expand=all`,
    `> Category: ${creator.category} · Followers: ${creator.followersStr}`,
    '',
    '## Bio',
    creator.bio,
    '',
    '## Repeatable Plays',
    ...(creator.plays || []).flatMap((p) => [
      `### ${p.emoji || '•'} ${p.title} (${p.frequency})`,
      p.description,
      '',
      `**Action:** ${p.action}`,
      '',
    ]),
    '## Hooks',
    ...(creator.hooks || []).map((h) => `- ${h}`),
    '',
    '## Angles',
    ...(creator.angles || []).map((a) => `- ${a}`),
    '',
    '---',
    'Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform',
  ];
  return lines.join('\n');
}

function isSuspiciousPath(rawPathname) {
  // Check raw and decoded forms for traversal or Vite /@fs/ probes
  if (/^\/@(?:fs|id|vite)\b/i.test(rawPathname)) return true;
  if (rawPathname.includes('\0')) return true;
  let decoded = rawPathname;
  try {
    decoded = decodeURIComponent(rawPathname);
  } catch {
    return true;
  }
  if (decoded.includes('\0') || decoded.includes('\\')) return true;
  if (/^\/@(?:fs|id|vite)\b/i.test(decoded)) return true;
  const segments = decoded.split('/');
  if (segments.some((s) => s === '..')) return true;
  // Also catch double-encoded traversal like %252e%252e
  if (/%2e%2e/i.test(rawPathname) || /%252e/i.test(rawPathname)) return true;
  return false;
}

function resolveStaticFile(pathname) {
  if (!fs.existsSync(DIST_DIR)) return { error: 503, message: 'Build output dist/ not found. Run npm run build.' };
  const realDist = fs.realpathSync(DIST_DIR);
  const decoded = decodeURIComponent(pathname);
  const rel = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const candidate = path.resolve(realDist, rel);
  if (candidate !== realDist && !candidate.startsWith(realDist + path.sep)) {
    return { error: 403, message: 'Forbidden path' };
  }

  let target = candidate;
  if (fs.existsSync(target)) {
    let realTarget;
    try {
      realTarget = fs.realpathSync(target);
    } catch {
      return { error: 403, message: 'Forbidden path' };
    }
    if (realTarget !== realDist && !realTarget.startsWith(realDist + path.sep)) {
      return { error: 403, message: 'Forbidden symlink escape' };
    }
    const stat = fs.statSync(realTarget);
    if (stat.isDirectory()) {
      const idx = path.join(realTarget, 'index.html');
      if (fs.existsSync(idx)) return { filePath: idx };
      return { error: 404, message: 'Not found' };
    }
    return { filePath: realTarget };
  }

  // Missing file with a known static asset extension -> 404 JSON instead of SPA HTML
  const ext = path.extname(rel).toLowerCase();
  if (ext && ext !== '.html') {
    return { error: 404, message: 'Asset not found' };
  }

  // SPA fallback to dist/index.html
  const spaIndex = path.join(realDist, 'index.html');
  if (fs.existsSync(spaIndex)) return { filePath: spaIndex };
  return { error: 404, message: 'index.html not found' };
}

export function createCreatorPlaybooksServer(options = {}) {
  const dataset = loadDataset();
  const votesStore = new Map();
  let activePort = Number(options.port || process.env.PORT || 5185);

  const server = http.createServer(async (req, res) => {
    const method = (req.method || 'GET').toUpperCase();
    const isHead = method === 'HEAD';
    const hostHeader = req.headers.host;
    const originHeader = req.headers.origin;
    const addr = server.address();
    if (addr && typeof addr === 'object' && addr.port) {
      activePort = addr.port;
    }

    const secHeaders = buildSecurityHeaders(originHeader, activePort);

    // 1. Strict loopback Host guard (DNS-rebinding protection)
    if (!isAllowedHost(hostHeader)) {
      sendJson(res, 403, { error: 'Forbidden host header' }, secHeaders, isHead);
      return;
    }

    // 2. Parse URL safely (preserve raw pathname for traversal detection!)
    const rawUrl = req.url || '/';
    const qIdx = rawUrl.indexOf('?');
    const rawPathname = qIdx === -1 ? rawUrl : rawUrl.slice(0, qIdx);

    if (isSuspiciousPath(rawPathname)) {
      sendJson(res, 403, { error: 'Forbidden path' }, secHeaders, isHead);
      return;
    }

    let url;
    try {
      url = new URL(rawUrl, `http://127.0.0.1:${activePort}`);
    } catch {
      sendJson(res, 400, { error: 'Malformed request URL' }, secHeaders, isHead);
      return;
    }

    const pathname = url.pathname;
    const isApiRoute = pathname === '/health' || pathname.startsWith('/api/');

    // 3. Strict exact-port Origin CORS enforcement on OPTIONS and API routes
    if (originHeader && !isAllowedOrigin(originHeader, activePort)) {
      if (method === 'OPTIONS' || isApiRoute) {
        sendJson(res, 403, { error: 'Forbidden origin' }, secHeaders, isHead);
        return;
      }
    }

    if (method === 'OPTIONS') {
      res.writeHead(204, { ...secHeaders, 'Content-Length': 0 });
      res.end();
      return;
    }

    // 4. Health endpoints (GET / HEAD)
    if (pathname === '/health' || pathname === '/api/health') {
      if (method !== 'GET' && !isHead) {
        sendJson(res, 405, { error: 'Method not allowed' }, secHeaders, isHead);
        return;
      }
      sendJson(res, 200, {
        ok: true,
        service: 'creatorplaybooks',
        version: VERSION,
        mode: 'loopback-production',
        host: '127.0.0.1',
        port: activePort,
        creators: dataset.stats.creators,
        plays: dataset.stats.plays,
        places: dataset.stats.places,
        checkedDate: dataset.checkedDate,
        timestamp: new Date().toISOString(),
      }, secHeaders, isHead);
      return;
    }

    // 5. API Endpoints
    if (pathname.startsWith('/api/')) {
      const baseOrigin = `http://127.0.0.1:${activePort}`;

      if (pathname === '/api/creators') {
        if (method === 'POST') {
          try {
            const body = await readJsonBody(req);
            sendJson(res, 405, { error: 'Read-only directory endpoint', receivedKeys: Object.keys(body) }, secHeaders, isHead);
          } catch (err) {
            sendJson(res, err.status || 400, { error: err.error || 'Invalid JSON' }, secHeaders, isHead);
          }
          return;
        }
        if (method !== 'GET' && !isHead) {
          sendJson(res, 405, { error: 'Method not allowed' }, secHeaders, isHead);
          return;
        }
        const q = (url.searchParams.get('q') || '').trim().toLowerCase();
        const category = (url.searchParams.get('category') || '').trim().toLowerCase();
        const tag = (url.searchParams.get('tag') || '').trim().toLowerCase();

        let list = dataset.creators;
        if (category) list = list.filter((c) => (c.category || '').toLowerCase() === category);
        if (tag) list = list.filter((c) => (c.tags || []).some((t) => t.toLowerCase() === tag));
        if (q) {
          list = list.filter((c) =>
            (c.name || '').toLowerCase().includes(q) ||
            (c.handle || '').toLowerCase().includes(q) ||
            (c.bio || '').toLowerCase().includes(q) ||
            (c.tags || []).some((t) => t.toLowerCase().includes(q)) ||
            (c.plays || []).some((p) => (p.title || '').toLowerCase().includes(q))
          );
        }

        sendJson(res, 200, {
          version: VERSION,
          count: list.length,
          totalCreators: dataset.stats.creators,
          totalPlays: dataset.stats.plays,
          totalPlaces: dataset.stats.places,
          creators: list.map((c) => ({
            id: c.id,
            handle: c.handle,
            name: c.name,
            emoji: c.emoji,
            status: c.status,
            category: c.category,
            followers: c.followers,
            followersStr: c.followersStr,
            bio: c.bio,
            tags: c.tags || [],
            productsCount: (c.products || []).length,
            playsCount: (c.plays || []).length,
          })),
        }, secHeaders, isHead);
        return;
      }

      if (pathname === '/api/creator') {
        if (method !== 'GET' && !isHead) {
          sendJson(res, 405, { error: 'Method not allowed' }, secHeaders, isHead);
          return;
        }
        const requestedId = url.searchParams.get('id');
        const id = requestedId ? requestedId.trim().toLowerCase() : 'maya';
        const creator = dataset.creators.find((c) => c.id.toLowerCase() === id);
        if (!creator) {
          sendJson(res, 404, { error: 'Creator not found', id }, secHeaders, isHead);
          return;
        }
        const expand = new Set((url.searchParams.get('expand') || '').split(',').map((s) => s.trim()).filter(Boolean));
        const expandAll = expand.has('all') || expand.has('playbook');
        const include = (k) => expandAll || expand.has(k);

        const payload = {
          profile: {
            id: creator.id,
            handle: creator.handle,
            name: creator.name,
            status: creator.status,
            emoji: creator.emoji,
            followers: creator.followers,
            followersStr: creator.followersStr,
            bio: creator.bio,
            products: creator.products || [],
            pillars: creator.pillars || [],
            milestones: creator.milestones || [],
            media: creator.media || [],
            xUrl: `https://x.com/${creator.xHandle}`,
            avatar: creator.avatar,
            banner: creator.banner,
            currentFocus: creator.currentFocus || '',
            followersAsOf: creator.followersAsOf || null,
            sources: creator.sources || [],
          },
        };
        if (include('category') || include('theme')) {
          payload.category = creator.category;
          payload.theme = creator.theme;
        }
        if (include('tags')) payload.tags = creator.tags || [];
        if (include('plays')) payload.playbook = { count: (creator.plays || []).length, plays: creator.plays || [] };
        if (include('hooks')) payload.hooks = creator.hooks || [];
        if (include('angles')) payload.angles = creator.angles || [];
        if (include('resources')) {
          payload.resources = {
            self: `${baseOrigin}/api/creator?id=${creator.id}`,
            expanded: `${baseOrigin}/api/creator?id=${creator.id}&expand=all`,
            playbook: `${baseOrigin}/api/playbook?creator=${creator.id}`,
            ideas: `${baseOrigin}/api/ideas?creator=${creator.id}&count=6`,
            exportJson: `${baseOrigin}/api/export?creator=${creator.id}`,
            exportMarkdown: `${baseOrigin}/api/export?creator=${creator.id}&format=md`,
            x: `https://x.com/${creator.xHandle}`,
          };
        }
        sendJson(res, 200, payload, secHeaders, isHead);
        return;
      }

      if (pathname === '/api/playbook') {
        if (method !== 'GET' && !isHead) {
          sendJson(res, 405, { error: 'Method not allowed' }, secHeaders, isHead);
          return;
        }
        const creatorId = (url.searchParams.get('creator') || 'maya').trim().toLowerCase();
        const creator = dataset.creators.find((c) => c.id.toLowerCase() === creatorId);
        if (!creator) {
          sendJson(res, 404, { error: 'Creator not found', creator: creatorId }, secHeaders, isHead);
          return;
        }
        sendJson(res, 200, {
          creatorId: creator.id,
          creator: creator.name,
          handle: creator.handle,
          status: creator.status,
          count: (creator.plays || []).length,
          plays: creator.plays || [],
        }, secHeaders, isHead);
        return;
      }

      if (pathname === '/api/ideas') {
        if (method !== 'GET' && !isHead) {
          sendJson(res, 405, { error: 'Method not allowed' }, secHeaders, isHead);
          return;
        }
        const creatorId = (url.searchParams.get('creator') || 'maya').trim().toLowerCase();
        const creator = dataset.creators.find((c) => c.id.toLowerCase() === creatorId);
        if (!creator) {
          sendJson(res, 404, { error: 'Creator not found', creator: creatorId }, secHeaders, isHead);
          return;
        }
        const parsedCount = Number.parseInt(url.searchParams.get('count') || '6', 10);
        const count = Number.isFinite(parsedCount) ? Math.min(20, Math.max(1, parsedCount)) : 6;
        sendJson(res, 200, {
          creatorId: creator.id,
          creator: creator.name,
          count,
          ideas: generateIdeas(creator, count),
        }, secHeaders, isHead);
        return;
      }

      if (pathname === '/api/export') {
        if (method !== 'GET' && !isHead) {
          sendJson(res, 405, { error: 'Method not allowed' }, secHeaders, isHead);
          return;
        }
        const creatorId = (url.searchParams.get('creator') || 'maya').trim().toLowerCase();
        const format = (url.searchParams.get('format') || 'json').trim().toLowerCase();
        const creator = dataset.creators.find((c) => c.id.toLowerCase() === creatorId);
        if (!creator) {
          sendJson(res, 404, { error: 'Creator not found', creator: creatorId }, secHeaders, isHead);
          return;
        }
        const md = buildPlaybookMarkdown(creator, baseOrigin);
        if (format === 'md' || format === 'markdown') {
          const headers = {
            ...secHeaders,
            'Content-Type': 'text/markdown; charset=utf-8',
            'Content-Disposition': `attachment; filename="${creator.id}-playbook.md"`,
            'Content-Length': Buffer.byteLength(md),
            'Cache-Control': 'no-store',
          };
          res.writeHead(200, headers);
          if (isHead) res.end();
          else res.end(md);
          return;
        }
        const bundle = {
          schema: 'creatorplaybooks.agent-kit/v1.1',
          exportedAt: new Date().toISOString(),
          source: `${baseOrigin}/api/creator?id=${creator.id}&expand=all`,
          creator: {
            id: creator.id,
            name: creator.name,
            handle: creator.handle,
            category: creator.category,
            followersStr: creator.followersStr,
            bio: creator.bio,
            products: creator.products || [],
            pillars: creator.pillars || [],
            plays: creator.plays || [],
            hooks: creator.hooks || [],
            angles: creator.angles || [],
            tags: creator.tags || [],
            sources: creator.sources || [],
          },
          ideas: generateIdeas(creator, 6),
          files: {
            'playbook.md': md,
            'README.md': `# ${creator.name} Agent Kit\n\nExported from CreatorPlaybooks v${VERSION}.\n`,
          },
        };
        sendJson(res, 200, bundle, {
          ...secHeaders,
          'Content-Disposition': `attachment; filename="${creator.id}-agent-kit.json"`,
        }, isHead);
        return;
      }

      if (pathname === '/api/members') {
        const action = (url.searchParams.get('action') || 'votes').trim().toLowerCase();
        if (method === 'GET' || isHead) {
          if (action === 'votes') {
            const out = {};
            for (const c of dataset.creators) {
              const entry = votesStore.get(c.id) || { creatorId: c.id, up: 0, down: 0, score: 0 };
              out[c.id] = entry;
            }
            sendJson(res, 200, out, secHeaders, isHead);
            return;
          }
          sendJson(res, 404, { error: 'Unknown members action', action }, secHeaders, isHead);
          return;
        }
        if (method === 'POST') {
          let body;
          try {
            body = await readJsonBody(req);
          } catch (err) {
            sendJson(res, err.status || 400, { error: err.error || 'Invalid JSON' }, secHeaders, isHead);
            return;
          }
          if (action === 'vote') {
            const creatorId = typeof body.creatorId === 'string' ? body.creatorId.trim() : '';
            const direction = body.direction;
            if (!dataset.creators.some((c) => c.id === creatorId) || !['up', 'down', null].includes(direction)) {
              sendJson(res, 400, { error: 'Invalid creatorId or direction' }, secHeaders, isHead);
              return;
            }
            const cur = votesStore.get(creatorId) || { creatorId, up: 0, down: 0, score: 0 };
            if (direction === 'up') cur.up += 1;
            if (direction === 'down') cur.down += 1;
            cur.score = cur.up - cur.down;
            votesStore.set(creatorId, cur);
            sendJson(res, 200, { ok: true, summary: cur }, secHeaders, isHead);
            return;
          }
          sendJson(res, 400, { error: 'Unsupported members POST action', action }, secHeaders, isHead);
          return;
        }
        sendJson(res, 405, { error: 'Method not allowed' }, secHeaders, isHead);
        return;
      }

      if (pathname === '/api/x') {
        if (method !== 'GET' && !isHead) {
          sendJson(res, 405, { error: 'Method not allowed' }, secHeaders, isHead);
          return;
        }
        const rawHandle = (url.searchParams.get('handle') || '').replace(/^@/, '');
        if (!rawHandle || !HANDLE_RE.test(rawHandle)) {
          sendJson(res, 400, { error: 'Invalid or missing X handle' }, secHeaders, isHead);
          return;
        }
        sendJson(res, 200, {
          unavailable: true,
          handle: rawHandle,
          reason: 'Offline loopback mode — serving curated local profiles',
        }, secHeaders, isHead);
        return;
      }

      // Unknown /api/* -> strictly 404 JSON (never SPA HTML)
      sendJson(res, 404, {
        error: 'API endpoint not found',
        path: pathname,
        available: ['/health', '/api/health', '/api/creators', '/api/creator', '/api/playbook', '/api/ideas', '/api/export', '/api/members', '/api/x'],
      }, secHeaders, isHead);
      return;
    }

    // 6. Static dist/ file serving (GET / HEAD only)
    if (method !== 'GET' && !isHead) {
      sendJson(res, 405, { error: 'Method not allowed' }, secHeaders, isHead);
      return;
    }

    const resolved = resolveStaticFile(pathname);
    if (resolved.error) {
      sendJson(res, resolved.error, { error: resolved.message }, secHeaders, isHead);
      return;
    }

    const filePath = resolved.filePath;
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const stat = fs.statSync(filePath);
    const cacheControl = ext === '.html' ? 'no-cache' : 'public, max-age=3600';

    res.writeHead(200, {
      ...secHeaders,
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Cache-Control': cacheControl,
    });

    if (isHead) {
      res.end();
      return;
    }

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      if (!res.headersSent) {
        sendJson(res, 500, { error: 'Failed to read static asset' }, secHeaders, false);
      } else {
        res.end();
      }
    });
    stream.pipe(res);
  });

  return server;
}

function parseCliArgs(argv) {
  let port = Number(process.env.PORT || 5185);
  let host = process.env.HOST || '127.0.0.1';
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--port' && argv[i + 1]) {
      port = Number(argv[++i]);
    } else if (arg.startsWith('--port=')) {
      port = Number(arg.split('=')[1]);
    } else if (arg === '--host' && argv[i + 1]) {
      host = argv[++i];
    } else if (arg.startsWith('--host=')) {
      host = arg.split('=')[1];
    }
  }
  // Enforce loopback-only binding
  if (!LOOPBACK_HOSTS.has(host.toLowerCase())) {
    console.error(`[creatorplaybooks] Refusing non-loopback bind host "${host}". Using 127.0.0.1.`);
    host = '127.0.0.1';
  }
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    port = 5185;
  }
  return { host, port };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isMain) {
  const { host, port } = parseCliArgs(process.argv.slice(2));
  const server = createCreatorPlaybooksServer({ port });
  server.listen(port, host, () => {
    const bound = server.address();
    const actualPort = bound && typeof bound === 'object' ? bound.port : port;
    console.log(`[creatorplaybooks v${VERSION}] Loopback workstation listening on http://${host}:${actualPort}`);
  });
  const shutdown = () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 1500).unref();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
