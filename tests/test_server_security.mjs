import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createCreatorPlaybooksServer } from '../server.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

function rawRequest({ port, method = 'GET', reqPath = '/', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        method,
        path: reqPath,
        headers: {
          Host: `127.0.0.1:${port}`,
          ...headers,
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks).toString('utf8'),
          });
        });
      }
    );
    req.on('error', reject);
    if (body !== null) req.write(body);
    req.end();
  });
}

test('server.mjs security, HTTP/API, path traversal, Host/Origin, and body limits', async (t) => {
  const server = createCreatorPlaybooksServer({ port: 0 });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  t.after(() => new Promise((resolve) => server.close(resolve)));

  await t.test('GET & HEAD /health emit 200 JSON, version 1.1.0, exact counts, all 4 security headers, zero /home/ leaks', async () => {
    const res = await rawRequest({ port, reqPath: '/health' });
    assert.equal(res.status, 200);
    assert.equal(res.headers['x-frame-options'], 'SAMEORIGIN');
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
    assert.equal(res.headers['referrer-policy'], 'strict-origin-when-cross-origin');
    assert.ok(res.headers['content-security-policy']);
    assert.equal(res.headers['vary'], 'Origin');
    assert.ok(!res.body.includes('/home/'), 'Health payload must not leak /home/ paths');
    const data = JSON.parse(res.body);
    assert.equal(data.ok, true);
    assert.equal(data.version, '1.1.0');
    assert.equal(data.creators, 35);
    assert.equal(data.plays, 115);
    assert.equal(data.places, 20);

    const headRes = await rawRequest({ port, method: 'HEAD', reqPath: '/health' });
    assert.equal(headRes.status, 200);
    assert.equal(headRes.body, '');
  });

  await t.test('Host header allowlist blocks DNS-rebinding (Host: evil.example.invalid -> 403 JSON)', async () => {
    const res = await rawRequest({ port, reqPath: '/health', headers: { Host: 'evil.example.invalid' } });
    assert.equal(res.status, 403);
    assert.match(res.headers['content-type'], /application\/json/);
  });

  await t.test('Origin CORS allowlist rejects port-suffix spoofing & external origins (403 JSON, no ACAO)', async () => {
    const spoofedPort = `${port}0`;
    const spoofRes = await rawRequest({
      port,
      reqPath: '/api/creators',
      headers: { Origin: `http://127.0.0.1:${spoofedPort}` },
    });
    assert.equal(spoofRes.status, 403);
    assert.equal(spoofRes.headers['access-control-allow-origin'], undefined);

    const evilOpt = await rawRequest({
      port,
      method: 'OPTIONS',
      reqPath: '/api/creators',
      headers: { Origin: 'https://evil.example' },
    });
    assert.equal(evilOpt.status, 403);
    assert.equal(evilOpt.headers['access-control-allow-origin'], undefined);

    const validOrigin = `http://127.0.0.1:${port}`;
    const okRes = await rawRequest({
      port,
      reqPath: '/api/creators',
      headers: { Origin: validOrigin },
    });
    assert.equal(okRes.status, 200);
    assert.equal(okRes.headers['access-control-allow-origin'], validOrigin);
  });

  await t.test('Path traversal and /@fs/ probes are rejected with 403 JSON', async () => {
    for (const p of ['/../package.json', '/%2e%2e/package.json', '/@fs/etc/passwd', '/@fs/package.json']) {
      const res = await rawRequest({ port, reqPath: p });
      assert.equal(res.status, 403, `Expected 403 for ${p}, got ${res.status}`);
      assert.match(res.headers['content-type'], /application\/json/);
    }
  });

  await t.test('GET /api/creators, /api/creator, /api/playbook, /api/ideas, /api/export, and unknown /api/missing', async () => {
    const listRes = await rawRequest({ port, reqPath: '/api/creators' });
    assert.equal(listRes.status, 200);
    const listData = JSON.parse(listRes.body);
    assert.equal(listData.count, 35);

    const filteredRes = await rawRequest({ port, reqPath: '/api/creators?q=maya' });
    assert.equal(filteredRes.status, 200);
    assert.ok(JSON.parse(filteredRes.body).count >= 1);

    const mayaRes = await rawRequest({ port, reqPath: '/api/creator?id=maya&expand=all' });
    assert.equal(mayaRes.status, 200);
    const mayaData = JSON.parse(mayaRes.body);
    assert.equal(mayaData.profile.id, 'maya');
    assert.ok(mayaData.playbook.count >= 4);

    const notFoundCreator = await rawRequest({ port, reqPath: '/api/creator?id=nonexistent-slug' });
    assert.equal(notFoundCreator.status, 404);

    const pbRes = await rawRequest({ port, reqPath: '/api/playbook?creator=maya' });
    assert.equal(pbRes.status, 200);
    assert.ok(JSON.parse(pbRes.body).plays.length >= 4);

    const ideasRes = await rawRequest({ port, reqPath: '/api/ideas?creator=maya&count=4' });
    assert.equal(ideasRes.status, 200);
    assert.equal(JSON.parse(ideasRes.body).ideas.length, 4);

    const expJson = await rawRequest({ port, reqPath: '/api/export?creator=maya' });
    assert.equal(expJson.status, 200);
    assert.match(expJson.headers['content-disposition'], /attachment; filename="maya-agent-kit\.json"/);
    assert.ok(!expJson.body.includes('mayagrowth.app'));

    const expMd = await rawRequest({ port, reqPath: '/api/export?creator=maya&format=md' });
    assert.equal(expMd.status, 200);
    assert.match(expMd.headers['content-type'], /text\/markdown/);
    assert.match(expMd.body, /# Maya \(@buildwithmaya\)/);

    const missingApi = await rawRequest({ port, reqPath: '/api/does-not-exist' });
    assert.equal(missingApi.status, 404);
    assert.match(missingApi.headers['content-type'], /application\/json/);
  });

  await t.test('Malformed JSON -> 400 JSON and >1 MiB POST body -> 413 JSON', async () => {
    const badJson = await rawRequest({
      port,
      method: 'POST',
      reqPath: '/api/members?action=vote',
      headers: { 'Content-Type': 'application/json' },
      body: '{bad-json',
    });
    assert.equal(badJson.status, 400);
    assert.match(badJson.headers['content-type'], /application\/json/);

    const arrJson = await rawRequest({
      port,
      method: 'POST',
      reqPath: '/api/members?action=vote',
      headers: { 'Content-Type': 'application/json' },
      body: '["not-an-object"]',
    });
    assert.equal(arrJson.status, 400);

    const bigPayload = 'x'.repeat(1_100_000);
    const bigRes = await rawRequest({
      port,
      method: 'POST',
      reqPath: '/api/members?action=vote',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': String(Buffer.byteLength(bigPayload)),
      },
      body: bigPayload,
    });
    assert.equal(bigRes.status, 413);
    assert.match(bigRes.headers['content-type'], /application\/json/);
  });
});

test('CLI and Unicode U+2800 Braille TUI work cleanly with zero /home/ leaks', () => {
  const cliBin = path.join(ROOT, 'bin', 'creatorplaybooks');
  const tuiBin = path.join(ROOT, 'bin', 'creatorplaybooks-tui');

  const cliVer = execFileSync(cliBin, ['--version'], { encoding: 'utf8' });
  assert.match(cliVer, /1\.1\.0/);

  const cliJsonRaw = execFileSync(cliBin, ['--json'], { encoding: 'utf8' });
  assert.ok(!cliJsonRaw.includes('/home/'), 'CLI --json leaked /home/ path');
  const cliJson = JSON.parse(cliJsonRaw);
  assert.equal(cliJson.version, '1.1.0');
  assert.equal(cliJson.dataset.creators, 35);

  const tuiOnce = execFileSync(tuiBin, ['--once'], { encoding: 'utf8' });
  assert.ok(/[\u2800-\u28ff]/.test(tuiOnce), 'TUI --once must contain Unicode U+2800 Braille characters');
  assert.ok(!tuiOnce.includes('/home/'), 'TUI --once leaked /home/ path');

  const tuiJsonRaw = execFileSync(tuiBin, ['--search', 'maya', '--json'], { encoding: 'utf8' });
  assert.ok(!tuiJsonRaw.includes('/home/'), 'TUI --json leaked /home/ path');
  const tuiJson = JSON.parse(tuiJsonRaw);
  assert.equal(tuiJson.version, '1.1.0');
  assert.ok(tuiJson.matchCount >= 1);
  assert.ok(/[\u2800-\u28ff]/.test(tuiJson.brailleHeader));
});
