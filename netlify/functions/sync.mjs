import { getStore } from '@netlify/blobs';
import {
  buildCorsHeaders,
  HANDLE_REGEX,
  isUntrustedOrigin,
  jsonResponse,
} from './_security.mjs';

const METHODS = 'GET, POST, OPTIONS';

async function syncCreator(handle) {
  const encoded = encodeURIComponent(handle);
  const avatar = `https://unavatar.io/twitter/${encoded}?fallback=false`;
  return {
    handle,
    syncedAt: new Date().toISOString(),
    source: 'unavatar-only',
    avatar,
    posts: [],
    media: [],
    followers: 0,
    bio: '',
  };
}

export default async (req, context) => {
  if (isUntrustedOrigin(req)) {
    return jsonResponse(req, { error: 'Forbidden origin' }, 403, METHODS);
  }
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: buildCorsHeaders(req, METHODS) });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\//, '').replace(/\/+$/, '');
  const store = getStore({ name: 'creator-sync', consistency: 'strong' });

  // POST /api/sync?handle=buildwithmaya (requires authenticated identity)
  if (path === 'sync' && req.method === 'POST') {
    const user = context?.user;
    if (!user?.sub) {
      return jsonResponse(req, { error: 'Unauthorized' }, 401, METHODS);
    }
    const rawHandle = (url.searchParams.get('handle') || url.searchParams.get('id') || '').replace(/^@/, '');
    if (!rawHandle || !HANDLE_REGEX.test(rawHandle)) {
      return jsonResponse(req, { error: 'Invalid or missing X handle' }, 400, METHODS);
    }
    try {
      const data = await syncCreator(rawHandle);
      await store.setJSON(rawHandle, data);
      return jsonResponse(req, {
        ok: true,
        handle: rawHandle,
        syncedAt: data.syncedAt,
        note: 'Public avatar sync completed. Configure X_BEARER_TOKEN for live metrics.',
      }, 200, METHODS);
    } catch {
      return jsonResponse(req, { error: 'Sync operation failed' }, 500, METHODS);
    }
  }

  // GET /api/sync-status
  if (path === 'sync-status' && req.method === 'GET') {
    const handles = ['buildwithmaya', 'thisiskp_', 'zeng_wt', 'halfmage', 'ChaiWithJai', 'NealFrazierTech'];
    const results = await Promise.all(handles.map(async (h) => {
      const data = await store.get(h, { type: 'json' }).catch(() => null);
      return { handle: h, lastSync: data?.syncedAt || null, source: data?.source || 'never' };
    }));
    return jsonResponse(req, { count: results.length, results }, 200, METHODS);
  }

  return jsonResponse(req, { error: 'Not found', available: ['sync?handle=...', 'sync-status'] }, 404, METHODS);
};
