import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const STRIPE_COFFEE_URL = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';

function walkJsonFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkJsonFiles(full, out);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      out.push(full);
    }
  }
  return out;
}

test('site.json parses cleanly and has required publisher metadata', () => {
  const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.json'), 'utf8'));
  assert.equal(site.name, 'CreatorPlaybooks');
  assert.match(site.origin, /^https:\/\//);
  assert.ok(site.publisher && site.publisher.length > 0);
  assert.match(site.publisherUrl, /^https:\/\//);
});

test('all JSON and creator data files parse cleanly', () => {
  const targets = [
    path.join(ROOT, 'package.json'),
    path.join(ROOT, 'site.json'),
    ...fs
      .readdirSync(ROOT)
      .filter((f) => f.endsWith('_profile.json'))
      .map((f) => path.join(ROOT, f)),
    ...walkJsonFiles(path.join(ROOT, 'creators')),
    ...walkJsonFiles(path.join(ROOT, 'public')),
    ...walkJsonFiles(path.join(ROOT, 'shared')),
  ];

  assert.ok(targets.length >= 8, `Expected at least 8 JSON data files, found ${targets.length}`);
  for (const file of targets) {
    const raw = fs.readFileSync(file, 'utf8');
    assert.doesNotThrow(() => JSON.parse(raw), `Invalid JSON in ${path.relative(ROOT, file)}`);
  }
});

test('dist/robots.txt allows all 6 frontier bots with Crawl-delay: 0 and declares sitemap', () => {
  const robots = fs.readFileSync(path.join(ROOT, 'dist', 'robots.txt'), 'utf8');
  for (const bot of ['*', 'Googlebot', 'GPTBot', 'ClaudeBot', 'PerplexityBot', 'Applebot']) {
    assert.ok(robots.includes(`User-agent: ${bot}`), `dist/robots.txt missing ${bot}`);
  }
  const delayMatches = robots.match(/Crawl-delay:\s*0/g) || [];
  assert.ok(delayMatches.length >= 6, `Expected Crawl-delay: 0 for all 6 bots, found ${delayMatches.length}`);
  assert.match(robots, /Sitemap:\s+https:\/\/creatorplaybooks\.netlify\.app\/sitemap\.xml/);
});

test('dist/sitemap.xml is well-formed with canonical URLs and lastmod', () => {
  const sitemap = fs.readFileSync(path.join(ROOT, 'dist', 'sitemap.xml'), 'utf8');
  assert.ok(sitemap.includes('<?xml version="1.0"'));
  assert.ok(sitemap.includes('<urlset'));
  assert.ok(sitemap.includes('<loc>https://creatorplaybooks.netlify.app/</loc>'));
  assert.match(sitemap, /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
});

test('netlify.toml declares dist publish dir and SPA catch-all redirect', () => {
  const toml = fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8');
  assert.match(toml, /publish\s*=\s*"dist"/);
  assert.match(toml, /from\s*=\s*"\/\*"/);
  assert.match(toml, /to\s*=\s*"\/index\.html"/);
  assert.match(toml, /status\s*=\s*200/);
});

test('dist/index.html has balanced tags, viewport, JSON-LD @graph, and zero paywall/DePay stubs', () => {
  const html = fs.readFileSync(path.join(ROOT, 'dist', 'index.html'), 'utf8');

  // Viewport
  assert.match(html, /<meta\s+name="viewport"\s+content="width=device-width,\s*initial-scale=1\.0"/i);

  // Balanced tags
  for (const tag of ['html', 'head', 'body', 'script']) {
    const opens = (html.match(new RegExp(`<${tag}(\\s|>)`, 'gi')) || []).length;
    const closes = (html.match(new RegExp(`</${tag}>`, 'gi')) || []).length;
    assert.equal(opens, closes, `Unbalanced <${tag}> tags: ${opens} open vs ${closes} close`);
  }

  // JSON-LD @graph
  const ldMatch = html.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  assert.ok(ldMatch, 'Missing JSON-LD script block');
  const ld = JSON.parse(ldMatch[1]);
  assert.ok(Array.isArray(ld['@graph']), 'JSON-LD missing @graph array');
  const types = ld['@graph'].map((n) => n['@type']);
  assert.ok(types.includes('WebApplication'), 'JSON-LD @graph missing WebApplication');
  assert.ok(types.includes('FAQPage'), 'JSON-LD @graph missing FAQPage');
  assert.ok(html.includes(STRIPE_COFFEE_URL), 'Missing Stripe Buy Us a Coffee URL in dist/index.html');

  // Zero paywall / DePay stubs
  const lower = html.toLowerCase();
  assert.ok(!lower.includes('depay'), 'Found forbidden DePay reference');
  assert.ok(!lower.includes('free citizen tier'), 'Found forbidden paywall tier badge');
  assert.ok(!lower.includes('paywall-blur'), 'Found forbidden paywall blur class');
});
