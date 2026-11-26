import { getStore } from '@netlify/blobs';
import {
  buildCorsHeaders,
  isUntrustedOrigin,
  jsonResponse,
  pickAllowedFields,
  readBoundedJson,
} from './_security.mjs';

const METHODS = 'GET, POST, PATCH, OPTIONS';
const ALLOWED_MEMBER_FIELDS = {
  name: 'shortString',
  handle: 'shortString',
  bio: 'string',
  building: 'shortString',
  website: 'shortString',
  xHandle: 'shortString',
  github: 'shortString',
  likedPlaybooks: 'stringArray',
  admiredCreators: 'stringArray',
};

const store = () => getStore({ name: 'creatorplaybooks', consistency: 'strong' });

function text(blob) {
  if (!blob) return null;
  if (typeof blob === 'string') return blob;
  if (blob instanceof ArrayBuffer) return new TextDecoder().decode(blob);
  return null;
}

async function getMember(userId) {
  const blob = await store().get(`members:${userId}`);
  return text(blob);
}

async function getSubmissions() {
  const s = store();
  const list = await s.list({ prefix: 'submissions:' });
  const out = [];
  for (const item of list.blobs) {
    const blob = await s.get(item.key);
    const t = text(blob);
    if (t) out.push(JSON.parse(t));
  }
  return out;
}

async function getAllVoteSummaries() {
  const s = store();
  const list = await s.list({ prefix: 'votes:' });
  const out = {};
  for (const item of list.blobs) {
    const blob = await s.get(item.key);
    const t = text(blob);
    if (t) {
      const summary = JSON.parse(t);
      out[summary.creatorId] = summary;
    }
  }
  return out;
}

function buildDefaultProfile(user) {
  const safeName = user.name || (user.email ? user.email.split('@')[0] : '') || 'Builder';
  const handle = safeName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || 'builder';
  return {
    id: user.id,
    email: user.email,
    name: safeName,
    handle,
    bio: 'Builder working through creator playbooks.',
    avatar: '',
    banner: '',
    building: '',
    likedPlaybooks: [],
    admiredCreators: [],
    votes: {},
    role: 'member',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function upsertMember(user) {
  const existing = await getMember(user.id);
  if (existing) return JSON.parse(existing);
  const created = buildDefaultProfile(user);
  await store().setJSON(`members:${user.id}`, created);
  return created;
}

export default async (req, context) => {
  if (isUntrustedOrigin(req)) {
    return jsonResponse(req, { error: 'Forbidden origin' }, 403, METHODS);
  }
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: buildCorsHeaders(req, METHODS) });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action') || url.pathname.split('/').pop();

  if (action === 'votes' && req.method === 'GET') {
    const summaries = await getAllVoteSummaries();
    return jsonResponse(req, summaries, 200, METHODS);
  }

  const user = context?.user;
  if (!user) return jsonResponse(req, { error: 'Unauthorized' }, 401, METHODS);

  if (action === 'me') {
    if (req.method === 'GET') {
      const profile = await upsertMember(user);
      return jsonResponse(req, profile, 200, METHODS);
    }
    if (req.method === 'POST' || req.method === 'PATCH') {
      const parsed = await readBoundedJson(req);
      if (parsed.error) return jsonResponse(req, { error: parsed.error }, parsed.status, METHODS);
      const safePatch = pickAllowedFields(parsed.data, ALLOWED_MEMBER_FIELDS);
      const current = await upsertMember(user);
      const next = {
        ...current,
        ...safePatch,
        id: current.id,
        email: current.email,
        role: current.role,
        updatedAt: new Date().toISOString(),
      };
      await store().setJSON(`members:${user.id}`, next);
      return jsonResponse(req, next, 200, METHODS);
    }
  }

  if (action === 'vote' && req.method === 'POST') {
    const parsed = await readBoundedJson(req);
    if (parsed.error) return jsonResponse(req, { error: parsed.error }, parsed.status, METHODS);
    const { creatorId, direction } = parsed.data;
    if (typeof creatorId !== 'string' || !/^[a-z0-9_-]{1,40}$/i.test(creatorId) || !['up', 'down', null].includes(direction)) {
      return jsonResponse(req, { error: 'Invalid vote payload' }, 400, METHODS);
    }
    const profile = await upsertMember(user);
    const previous = profile.votes[creatorId] || null;
    profile.votes[creatorId] = direction;
    await store().setJSON(`members:${user.id}`, profile);

    const key = `votes:${creatorId}`;
    const blob = await store().get(key);
    const summary = text(blob) ? JSON.parse(text(blob)) : { creatorId, up: 0, down: 0, score: 0 };
    if (previous === 'up') summary.up = Math.max(0, summary.up - 1);
    if (previous === 'down') summary.down = Math.max(0, summary.down - 1);
    if (direction === 'up') summary.up += 1;
    if (direction === 'down') summary.down += 1;
    summary.score = summary.up - summary.down;
    await store().setJSON(key, summary);
    return jsonResponse(req, { profile, summary }, 200, METHODS);
  }

  if (action === 'submit' && req.method === 'POST') {
    const parsed = await readBoundedJson(req);
    if (parsed.error) return jsonResponse(req, { error: parsed.error }, parsed.status, METHODS);
    const safeSub = pickAllowedFields(parsed.data, {
      handle: 'shortString',
      name: 'shortString',
      category: 'shortString',
      reason: 'string',
    });
    if (!safeSub.handle || !safeSub.name || !safeSub.category || !safeSub.reason) {
      return jsonResponse(req, { error: 'Missing submission fields' }, 400, METHODS);
    }
    const payload = {
      ...safeSub,
      id: crypto.randomUUID(),
      submittedBy: user.id,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    await store().setJSON(`submissions:${payload.id}`, payload);
    return jsonResponse(req, payload, 201, METHODS);
  }

  if (action === 'submissions' && req.method === 'GET') {
    if (user.role !== 'admin') return jsonResponse(req, { error: 'Forbidden' }, 403, METHODS);
    const subs = await getSubmissions();
    return jsonResponse(req, subs, 200, METHODS);
  }

  if (action === 'moderate' && req.method === 'POST') {
    if (user.role !== 'admin') return jsonResponse(req, { error: 'Forbidden' }, 403, METHODS);
    const parsed = await readBoundedJson(req);
    if (parsed.error) return jsonResponse(req, { error: parsed.error }, parsed.status, METHODS);
    const { id, status } = parsed.data;
    if (typeof id !== 'string' || !/^[a-z0-9-]{8,64}$/i.test(id) || !['approved', 'rejected'].includes(status)) {
      return jsonResponse(req, { error: 'Invalid moderation payload' }, 400, METHODS);
    }
    const key = `submissions:${id}`;
    const blob = await store().get(key);
    const t = text(blob);
    if (!t) return jsonResponse(req, { error: 'Submission not found' }, 404, METHODS);
    const sub = JSON.parse(t);
    sub.status = status;
    await store().setJSON(key, sub);
    return jsonResponse(req, sub, 200, METHODS);
  }

  return jsonResponse(req, { error: 'Unknown action' }, 400, METHODS);
};

export const config = { path: '/api/members' };
