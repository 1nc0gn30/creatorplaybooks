import { getStore } from '@netlify/blobs';
import {
  buildCorsHeaders,
  isUntrustedOrigin,
  jsonResponse,
  pickAllowedFields,
  readBoundedJson,
} from './_security.mjs';

const METHODS = 'GET, POST, OPTIONS';
const ALLOWED_PROFILE_FIELDS = {
  name: 'shortString',
  handle: 'shortString',
  project: 'shortString',
  url: 'shortString',
  bio: 'string',
  goal: 'string',
};

export default async (req, context) => {
  if (isUntrustedOrigin(req)) {
    return jsonResponse(req, { error: 'Forbidden origin' }, 403, METHODS);
  }
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: buildCorsHeaders(req, METHODS) });
  }

  const user = context?.user;
  if (!user?.sub) {
    return jsonResponse(req, { error: 'Unauthorized' }, 401, METHODS);
  }

  const store = getStore({ name: 'profiles', consistency: 'strong' });
  const key = `user:${user.sub}`;

  if (req.method === 'GET') {
    const data = await store.get(key, { type: 'json' });
    return jsonResponse(req, data || {}, 200, METHODS);
  }

  if (req.method === 'POST') {
    const parsed = await readBoundedJson(req);
    if (parsed.error) return jsonResponse(req, { error: parsed.error }, parsed.status, METHODS);
    const safePatch = pickAllowedFields(parsed.data, ALLOWED_PROFILE_FIELDS);
    const existing = (await store.get(key, { type: 'json' })) || {};
    const updated = { ...existing, ...safePatch, updatedAt: new Date().toISOString() };
    await store.setJSON(key, updated);
    return jsonResponse(req, updated, 200, METHODS);
  }

  return jsonResponse(req, { error: 'Method not allowed' }, 405, METHODS);
};
