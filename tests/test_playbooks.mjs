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

test('package.json uses canonical creatorplaybooks name, version 1.1.0, and start/serve/test scripts', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.equal(pkg.name, 'creatorplaybooks');
  assert.equal(pkg.version, '1.1.0');
  assert.equal(pkg.scripts.start, 'node server.mjs');
  assert.equal(pkg.scripts.serve, 'node server.mjs');
  assert.match(pkg.scripts.test, /node --test/);
});

test('site.json parses cleanly and has required publisher metadata', () => {
  const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.json'), 'utf8'));
  assert.equal(site.name, 'CreatorPlaybooks');
  assert.match(site.origin, /^https:\/\//);
  assert.ok(site.publisher && site.publisher.length > 0);
  assert.match(site.publisherUrl, /^https:\/\//);
});

test('shared/creators.json holds canonical 35 creators, 115 plays, and 20 places', () => {
  const ds = JSON.parse(fs.readFileSync(path.join(ROOT, 'shared', 'creators.json'), 'utf8'));
  assert.equal(ds.creators.length, 35);
  assert.equal(ds.places.length, 20);
  const totalPlays = ds.creators.reduce((sum, c) => sum + (c.plays?.length || 0), 0);
  assert.equal(totalPlays, 115);
  assert.equal(ds.stats.creators, 35);
  assert.equal(ds.stats.plays, 115);
  assert.equal(ds.stats.places, 20);
});

test('all JSON and creator data files parse cleanly', () => {
  const targets = [
    path.join(ROOT, 'package.json'),
    path.join(ROOT, 'site.json'),
    ...walkJsonFiles(path.join(ROOT, 'creators')),
    ...walkJsonFiles(path.join(ROOT, 'public')),
    ...walkJsonFiles(path.join(ROOT, 'shared')),
  ];

  assert.ok(targets.length >= 4, `Expected at least 4 JSON data files, found ${targets.length}`);
  for (const file of targets) {
    const raw = fs.readFileSync(file, 'utf8');
    assert.doesNotThrow(() => JSON.parse(raw), `Invalid JSON in ${path.relative(ROOT, file)}`);
  }
});

test('public brand PNGs have valid PNG magic signatures (zero JPEG spoofing)', () => {
  const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  for (const rel of ['public/brand_logo.png', 'public/liquid_trail.png', 'public/og-card.png']) {
    const buf = fs.readFileSync(path.join(ROOT, rel));
    assert.ok(buf.subarray(0, 8).equals(PNG_MAGIC), `${rel} is not a valid PNG file`);
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

test('netlify.toml declares dist publish dir, security headers, and SPA catch-all redirect', () => {
  const toml = fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8');
  assert.match(toml, /publish\s*=\s*"dist"/);
  assert.match(toml, /\[\[headers\]\]/);
  assert.match(toml, /X-Frame-Options\s*=\s*"SAMEORIGIN"/);
  assert.match(toml, /X-Content-Type-Options\s*=\s*"nosniff"/);
  assert.match(toml, /Referrer-Policy\s*=\s*"strict-origin-when-cross-origin"/);
  assert.match(toml, /Content-Security-Policy\s*=/);
  assert.match(toml, /from\s*=\s*"\/\*"/);
  assert.match(toml, /to\s*=\s*"\/index\.html"/);
  assert.match(toml, /status\s*=\s*200/);
});

test('netlify functions have zero wildcard CORS * and zero stale mayagrowth.app references', () => {
  const fnDir = path.join(ROOT, 'netlify', 'functions');
  for (const name of fs.readdirSync(fnDir).filter((f) => f.endsWith('.mjs'))) {
    const content = fs.readFileSync(path.join(fnDir, name), 'utf8');
    assert.ok(!content.includes("'Access-Control-Allow-Origin': '*'"), `Wildcard CORS found in ${name}`);
    assert.ok(!content.includes('"Access-Control-Allow-Origin": "*"'), `Wildcard CORS found in ${name}`);
    assert.ok(!content.includes('mayagrowth.app'), `Stale mayagrowth.app reference in ${name}`);
  }
});

test('dist/index.html has balanced tags, viewport, JSON-LD @graph, @1nc0gn30 twitter tags, and zero paywall/DePay stubs', () => {
  const html = fs.readFileSync(path.join(ROOT, 'dist', 'index.html'), 'utf8');

  assert.match(html, /<meta\s+name="viewport"\s+content="width=device-width,\s*initial-scale=1\.0"/i);
  assert.match(html, /<meta\s+name="twitter:site"\s+content="@1nc0gn30"/i);
  assert.match(html, /<meta\s+name="twitter:creator"\s+content="@1nc0gn30"/i);

  for (const tag of ['html', 'head', 'body', 'script']) {
    const opens = (html.match(new RegExp(`<${tag}(\\s|>)`, 'gi')) || []).length;
    const closes = (html.match(new RegExp(`</${tag}>`, 'gi')) || []).length;
    assert.equal(opens, closes, `Unbalanced <${tag}> tags: ${opens} open vs ${closes} close`);
  }

  const ldMatch = html.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  assert.ok(ldMatch, 'Missing JSON-LD script block');
  const ld = JSON.parse(ldMatch[1]);
  assert.ok(Array.isArray(ld['@graph']), 'JSON-LD missing @graph array');
  const types = ld['@graph'].map((n) => n['@type']);
  assert.ok(types.includes('WebApplication'), 'JSON-LD @graph missing WebApplication');
  assert.ok(types.includes('FAQPage'), 'JSON-LD @graph missing FAQPage');
  assert.ok(html.includes(STRIPE_COFFEE_URL), 'Missing Stripe Buy Us a Coffee URL in dist/index.html');

  const lower = html.toLowerCase();
  assert.ok(!lower.includes('depay'), 'Found forbidden DePay reference');
  assert.ok(!lower.includes('free citizen tier'), 'Found forbidden paywall tier badge');
  assert.ok(!lower.includes('paywall-blur'), 'Found forbidden paywall blur class');
});
