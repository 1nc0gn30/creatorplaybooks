import {
  buildCorsHeaders,
  HANDLE_REGEX,
  isUntrustedOrigin,
  jsonResponse,
} from './_security.mjs';

const X_API_BASE = 'https://api.x.com/2';
const METHODS = 'GET, OPTIONS';

export default async (req) => {
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
  const handle = url.searchParams.get('handle');
  const mediaOnly = url.searchParams.get('media') === 'true';

  if (!handle) {
    return jsonResponse(req, { error: 'Missing handle query param' }, 400, METHODS);
  }

  const cleanHandle = handle.replace(/^@/, '').trim();
  if (!HANDLE_REGEX.test(cleanHandle)) {
    return jsonResponse(req, { error: 'Invalid X handle format' }, 400, METHODS);
  }

  const token = process.env.X_BEARER_TOKEN;
  if (!token) {
    return jsonResponse(req, { unavailable: true, reason: 'X_BEARER_TOKEN not configured' }, 200, METHODS);
  }

  try {
    const userFields = 'public_metrics,profile_image_url,url,description,verified,verified_type,location';
    const userRes = await fetch(
      `${X_API_BASE}/users/by/username/${encodeURIComponent(cleanHandle)}?user.fields=${userFields}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!userRes.ok) {
      return jsonResponse(req, { unavailable: true, reason: `X API error ${userRes.status}` }, 200, METHODS);
    }

    const userData = await userRes.json();
    const user = userData.data;

    if (!user) {
      return jsonResponse(req, { unavailable: true, reason: 'User not found on X' }, 200, METHODS);
    }

    const result = {
      id: user.id,
      handle: user.username,
      name: user.name,
      bio: user.description || '',
      avatar: user.profile_image_url?.replace('_normal', '_400x400') || null,
      banner: null,
      followers: user.public_metrics?.followers_count ?? 0,
      following: user.public_metrics?.following_count ?? 0,
      posts: user.public_metrics?.tweet_count ?? 0,
      verified: user.verified || false,
      verifiedType: user.verified_type || null,
      url: user.url || `https://x.com/${encodeURIComponent(user.username)}`,
      location: user.location || null,
    };

    if (!mediaOnly) {
      const tweetFields = 'public_metrics,created_at,attachments,referenced_tweets';
      const tweetExpansions = 'attachments.media_keys';
      const mediaFields = 'url,preview_image_url,type,width,height';

      const tweetsRes = await fetch(
        `${X_API_BASE}/users/${encodeURIComponent(user.id)}/tweets?max_results=10&tweet.fields=${tweetFields}&expansions=${tweetExpansions}&media.fields=${mediaFields}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (tweetsRes.ok) {
        const tweetsData = await tweetsRes.json();
        const mediaMap = new Map();
        (tweetsData.includes?.media || []).forEach((m) => {
          mediaMap.set(m.media_key, m);
        });

        result.tweets = (tweetsData.data || []).map((t) => {
          const media = [];
          if (t.attachments?.media_keys) {
            t.attachments.media_keys.forEach((mk) => {
              const m = mediaMap.get(mk);
              if (m) {
                media.push({
                  url: m.url || m.preview_image_url,
                  type: m.type,
                  width: m.width,
                  height: m.height,
                });
              }
            });
          }
          return {
            id: t.id,
            text: t.text,
            createdAt: t.created_at,
            metrics: t.public_metrics || {},
            media,
            isRetweet: t.referenced_tweets?.some((r) => r.type === 'retweeted') || false,
            isReply: t.referenced_tweets?.some((r) => r.type === 'replied_to') || false,
          };
        });
      } else {
        result.tweets = [];
      }
    }

    return jsonResponse(req, result, 200, METHODS);
  } catch {
    return jsonResponse(req, { unavailable: true, reason: 'X lookup failed' }, 200, METHODS);
  }
};

export const config = {
  path: '/api/x',
};
