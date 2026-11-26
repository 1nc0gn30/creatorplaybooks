import { getStore } from '@netlify/blobs';
import dataset from '../../shared/creators.json' with { type: 'json' };
import site from '../../site.json' with { type: 'json' };
import { buildCorsHeaders, isUntrustedOrigin, jsonResponse } from './_security.mjs';

const METHODS = 'GET, OPTIONS';

function buildPlaybookMarkdown(creator) {
  return [
    `# ${creator.name} (${creator.handle}) — Growth Playbook`,
    '',
    `> Source: ${site.origin}/api/creator?id=${creator.id}&expand=all`,
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
  ].join('\n');
}

export default async (req, context) => {
  if (isUntrustedOrigin(req)) {
    return jsonResponse(req, { error: 'Forbidden origin' }, 403, METHODS);
  }
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: buildCorsHeaders(req, METHODS) });
  }
  if (req.method !== 'GET') {
    return jsonResponse(req, { error: 'Method not allowed' }, 405, METHODS);
  }

  const url = new URL(req.url);
  const creatorParam = url.searchParams.get('creator');
  const format = (url.searchParams.get('format') || 'json').trim().toLowerCase();

  // Public open-access creator playbook bundle export (matches DocsView & server.mjs)
  if (creatorParam || !context?.user?.sub) {
    const id = (creatorParam || 'maya').trim().toLowerCase();
    const creator = dataset.creators.find((c) => c.id.toLowerCase() === id);
    if (!creator) {
      return jsonResponse(req, { error: 'Creator not found', creator: id }, 404, METHODS);
    }
    const md = buildPlaybookMarkdown(creator);
    if (format === 'md' || format === 'markdown') {
      return new Response(md, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="${creator.id}-playbook.md"`,
          ...buildCorsHeaders(req, METHODS),
        },
      });
    }
    return jsonResponse(req, {
      schema: 'creatorplaybooks.agent-kit/v1.1',
      exportedAt: new Date().toISOString(),
      source: `${site.origin}/api/creator?id=${creator.id}&expand=all`,
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
      files: {
        'playbook.md': md,
        'README.md': `# ${creator.name} Agent Kit\n\nExported from CreatorPlaybooks (${site.origin}).\n`,
      },
    }, 200, METHODS, {
      'Content-Disposition': `attachment; filename="${creator.id}-agent-kit.json"`,
    });
  }

  // Optional authenticated personal profile export
  const user = context.user;
  const store = getStore({ name: 'profiles', consistency: 'strong' });
  const data = await store.get(`user:${user.sub}`, { type: 'json' });
  const handleSlug = encodeURIComponent(String(data?.handle || '').replace(/^@/, ''));
  return jsonResponse(req, {
    user: { email: user.email, id: user.sub },
    profile: data || null,
    publicUrl: handleSlug ? `${site.origin}/?member=${handleSlug}` : `${site.origin}/`,
  }, 200, METHODS);
};
