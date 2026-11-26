export const MAX_BODY_BYTES = 1_048_576; // 1 MiB

const ALLOWED_ORIGINS = new Set([
  'https://creatorplaybooks.netlify.app',
  'http://127.0.0.1:5185',
  'http://localhost:5185',
  'http://127.0.0.1:3000',
  'http://localhost:3000',
]);

export const HANDLE_REGEX = /^[A-Za-z0-9_]{1,15}$/;

export function buildCorsHeaders(req, methods = 'GET, OPTIONS') {
  const origin = req?.headers?.get?.('origin') || '';
  const headers = {
    'Vary': 'Origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = methods;
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  }
  return headers;
}

export function isUntrustedOrigin(req) {
  const origin = req?.headers?.get?.('origin') || '';
  return Boolean(origin) && !ALLOWED_ORIGINS.has(origin);
}

export function jsonResponse(req, data, status = 200, methods = 'GET, OPTIONS', extraHeaders = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...buildCorsHeaders(req, methods),
      ...extraHeaders,
    },
  });
}

export async function readBoundedJson(req, maxBytes = MAX_BODY_BYTES) {
  const contentLength = Number(req.headers.get('content-length') || '0');
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return { error: `Payload exceeds maximum size (${maxBytes} bytes)`, status: 413 };
  }
  const text = await req.text();
  if (new TextEncoder().encode(text).length > maxBytes) {
    return { error: `Payload exceeds maximum size (${maxBytes} bytes)`, status: 413 };
  }
  if (!text.trim()) {
    return { error: 'Empty JSON body', status: 400 };
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { error: 'Malformed JSON body', status: 400 };
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { error: 'Request body must be a JSON object', status: 400 };
  }
  return { data: parsed };
}

export function pickAllowedFields(input, allowedSchema) {
  const out = {};
  for (const [key, rule] of Object.entries(allowedSchema)) {
    if (!(key in input)) continue;
    const val = input[key];
    if (rule === 'string') {
      if (typeof val === 'string') out[key] = val.slice(0, 1000);
    } else if (rule === 'shortString') {
      if (typeof val === 'string') out[key] = val.slice(0, 160);
    } else if (rule === 'stringArray') {
      if (Array.isArray(val)) {
        out[key] = val.filter((v) => typeof v === 'string').slice(0, 50).map((v) => v.slice(0, 80));
      }
    }
  }
  return out;
}
