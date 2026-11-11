#!/usr/bin/env node
/**
 * Renders every mentor route (?mentor=id) and checks the profile sheet.
 *
 *   npm run build && npm run preview -- --host 127.0.0.1 --port 4173
 *   SMOKE_BASE=http://127.0.0.1:4173 npm run smoke
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import puppeteer from 'puppeteer-core';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const refresh = JSON.parse(readFileSync(join(root, 'shared/mentorRefresh.json'), 'utf8'));
const ids = Object.keys(refresh);
const base = process.env.SMOKE_BASE || 'http://127.0.0.1:4173';

if (ids.length < 30) {
  console.error(`expected a full mentor set, found ${ids.length}`);
  process.exit(1);
}

for (const [id, profile] of Object.entries(refresh)) {
  if (!profile.currentFocus || !profile.plays?.length || !profile.sources?.length || !profile.hooks?.length) {
    console.error(`incomplete curated profile: ${id}`);
    process.exit(1);
  }
}

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME || '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
});

const failures = [];
try {
  const page = await browser.newPage();
  page.on('pageerror', (err) => {
    console.error('pageerror', err.message);
  });
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.evaluate(() => {
    localStorage.setItem('creatorplaybooks_origin_seen', '1');
    localStorage.setItem('creatorplaybooks_onboarding_seen', '1');
  });

  for (const id of ids) {
    const name = refresh[id].name;
    await page.goto(`${base}/?mentor=${encodeURIComponent(id)}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    const found = await page.waitForSelector(`[data-mentor="${id}"]`, { timeout: 8000 }).then(() => true).catch(() => false);
    const text = found ? await page.$eval(`[data-mentor="${id}"]`, (el) => el.innerText) : '';
    const focus = text.includes("What they're up to") || text.includes(refresh[id].currentFocus.slice(0, 40));
    if (!found || !text.includes(name) || !focus) {
      failures.push(id);
      console.error('FAIL', id);
    } else {
      console.log('ok', id);
    }
  }

  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(base + '/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  const home = await page.evaluate(() => document.body.innerText);
  if (!home.includes('Neal Frazier Tech') || !home.includes('creator playbooks')) {
    failures.push('home');
    console.error('FAIL home branding');
  } else {
    console.log('ok home');
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`smoke failed for: ${failures.join(', ')}`);
  process.exit(1);
}
console.log(`smoke passed for ${ids.length} mentors`);
