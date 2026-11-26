import { getStore } from '@netlify/blobs';
import dataset from '../../shared/creators.json' with { type: 'json' };
import site from '../../site.json' with { type: 'json' };
import { buildCorsHeaders, isUntrustedOrigin, jsonResponse } from './_security.mjs';

const METHODS = 'GET, OPTIONS';

async function mergeWithBlob(store, creator) {
  try {
    const synced = await store.get(creator.xHandle, { type: 'json' });
    if (!synced) return creator;
    return {
      ...creator,
      followers: synced.followers || creator.followers,
      followersStr: synced.followers ? `${(synced.followers / 1000).toFixed(1)}K+` : creator.followersStr,
      bio: synced.bio || creator.bio,
      avatar: synced.avatar || creator.avatar,
      banner: synced.banner || creator.banner,
      recentTweets: synced.posts || [],
      scrapedAt: synced.syncedAt,
      source: synced.source,
    };
  } catch {
    return creator;
  }
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

export default async (req) => {
  if (isUntrustedOrigin(req)) {
    return jsonResponse(req, { error: 'Forbidden origin' }, 403, METHODS);
  }
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: buildCorsHeaders(req, METHODS) });
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return jsonResponse(req, { error: 'Method not allowed' }, 405, METHODS);
  }

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\//, '').replace(/\/+$/, '');

  if (path === 'health') {
    return jsonResponse(req, {
      ok: true,
      service: 'creatorplaybooks',
      version: dataset.version || '1.1.0',
      creators: dataset.stats.creators,
      plays: dataset.stats.plays,
      places: dataset.stats.places,
      agentApi: true,
      time: new Date().toISOString(),
    }, 200, METHODS);
  }

  let mergedCreators = dataset.creators;
  try {
    const store = getStore({ name: 'creator-sync', consistency: 'strong' });
    mergedCreators = await Promise.all(dataset.creators.map((c) => mergeWithBlob(store, c)));
  } catch {
    mergedCreators = dataset.creators;
  }

  if (path === 'creators') {
    const q = (url.searchParams.get('q') || '').trim().toLowerCase();
    const category = (url.searchParams.get('category') || '').trim().toLowerCase();
    const tag = (url.searchParams.get('tag') || '').trim().toLowerCase();
    let list = mergedCreators;
    if (category) list = list.filter((c) => (c.category || '').toLowerCase() === category);
    if (tag) list = list.filter((c) => (c.tags || []).some((t) => t.toLowerCase() === tag));
    if (q) {
      list = list.filter((c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.handle || '').toLowerCase().includes(q) ||
        (c.bio || '').toLowerCase().includes(q) ||
        (c.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    return jsonResponse(req, {
      version: dataset.version || '1.1.0',
      count: list.length,
      creators: list.map((c) => ({
        id: c.id,
        handle: c.handle,
        name: c.name,
        emoji: c.emoji,
        status: c.status,
        category: c.category,
        followersStr: c.followersStr,
        bio: c.bio,
        tags: c.tags || [],
        productsCount: (c.products || []).length,
        playsCount: (c.plays || []).length,
      })),
    }, 200, METHODS);
  }

  if (path === 'creator') {
    const id = (url.searchParams.get('id') || 'maya').trim().toLowerCase();
    const creator = mergedCreators.find((c) => c.id.toLowerCase() === id);
    if (!creator) {
      return jsonResponse(req, { error: 'Creator not found', id }, 404, METHODS);
    }
    const expand = new Set((url.searchParams.get('expand') || '').split(',').map((s) => s.trim()).filter(Boolean));
    const expandAll = expand.has('all') || expand.has('playbook');
    const include = (key) => expandAll || expand.has(key);

    const response = {
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
        recentTweets: creator.recentTweets || [],
        scrapedAt: creator.scrapedAt || null,
        source: creator.source || 'bundled',
        xUrl: `https://x.com/${creator.xHandle}`,
        avatar: creator.avatar,
        banner: creator.banner,
        currentFocus: creator.currentFocus || '',
        followersAsOf: creator.followersAsOf || null,
        sources: creator.sources || [],
      },
    };

    if (include('category') || include('theme')) {
      response.category = creator.category;
      response.theme = creator.theme;
    }
    if (include('tags')) response.tags = creator.tags || [];
    if (include('plays')) response.playbook = { count: (creator.plays || []).length, plays: creator.plays || [] };
    if (include('hooks')) response.hooks = creator.hooks || [];
    if (include('angles')) response.angles = creator.angles || [];
    if (include('resources')) {
      const base = site.origin;
      response.resources = {
        self: `${base}/api/creator?id=${creator.id}`,
        expanded: `${base}/api/creator?id=${creator.id}&expand=all`,
        playbook: `${base}/api/playbook?creator=${creator.id}`,
        ideas: `${base}/api/ideas?creator=${creator.id}&count=6`,
        exportJson: `${base}/api/export?creator=${creator.id}`,
        exportMarkdown: `${base}/api/export?creator=${creator.id}&format=md`,
        x: `https://x.com/${creator.xHandle}`,
      };
    }

    return jsonResponse(req, response, 200, METHODS);
  }

  if (path === 'playbook') {
    const creatorId = (url.searchParams.get('creator') || 'maya').trim().toLowerCase();
    const creator = mergedCreators.find((c) => c.id.toLowerCase() === creatorId);
    if (!creator) return jsonResponse(req, { error: 'Creator not found', creator: creatorId }, 404, METHODS);
    return jsonResponse(req, { creatorId: creator.id, creator: creator.name, status: creator.status, count: creator.plays.length, plays: creator.plays }, 200, METHODS);
  }

  if (path === 'ideas') {
    const creatorId = (url.searchParams.get('creator') || 'maya').trim().toLowerCase();
    const creator = mergedCreators.find((c) => c.id.toLowerCase() === creatorId);
    if (!creator) return jsonResponse(req, { error: 'Creator not found', creator: creatorId }, 404, METHODS);
    const parsed = Number.parseInt(url.searchParams.get('count') || '6', 10);
    const count = Number.isFinite(parsed) ? Math.min(20, Math.max(1, parsed)) : 6;
    return jsonResponse(req, { creatorId: creator.id, creator: creator.name, count, ideas: generateIdeas(creator, count) }, 200, METHODS);
  }

  if (path === 'maya') {
    const maya = mergedCreators.find((c) => c.id === 'maya') || mergedCreators[0];
    return jsonResponse(req, {
      profile: {
        id: maya.id,
        handle: maya.handle,
        name: maya.name,
        status: maya.status,
        bio: maya.bio,
        followers: maya.followers,
        products: maya.products,
        pillars: maya.pillars,
        milestones: maya.milestones,
        media: maya.media,
        recentTweets: maya.recentTweets || [],
        scrapedAt: maya.scrapedAt || null,
        source: maya.source || 'bundled',
        xUrl: `https://x.com/${maya.xHandle}`,
        avatar: maya.avatar,
        banner: maya.banner,
      },
      links: { x: `https://x.com/${maya.xHandle}` },
    }, 200, METHODS);
  }

  return jsonResponse(req, { error: 'Not found', available: ['health', 'creators', 'creator', 'playbook', 'ideas', 'export', 'maya'] }, 404, METHODS);
};
