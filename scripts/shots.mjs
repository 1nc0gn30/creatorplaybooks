#!/usr/bin/env node
/** Screenshots of every mentor and the main views, mobile and desktop. */
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const refresh = JSON.parse(readFileSync(join(root, 'shared/mentorRefresh.json'), 'utf8'));
const out = '/opt/cursor/artifacts/pass3';
mkdirSync(out, { recursive: true });
const base = process.env.SMOKE_BASE || 'http://127.0.0.1:4173';
const browser = await chromium.launch({
  executablePath: process.env.CHROME || '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
});
const page = await browser.newPage();
await page.goto(base);
await page.evaluate(() => {
  localStorage.setItem('creatorplaybooks_origin_seen', '1');
  localStorage.setItem('creatorplaybooks_onboarding_seen', '1');
});

async function shot(name, url, width, height) {
  await page.setViewportSize({ width, height });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: join(out, `${name}.png`) });
  console.log(name);
}

const views = [
  ['home', base + '/'],
  ...Object.keys(refresh).map((id) => [id, `${base}/?mentor=${id}`]),
];
for (const [name, url] of views) {
  await shot(`${name}-mobile`, url, 390, 844);
  await shot(`${name}-desktop`, url, 1440, 900);
}
for (const width of [360, 430, 768, 1024, 1920]) {
  await shot(`home-w${width}`, base + '/', width, 900);
}

const tabs = ['Flow', 'Dashboard', 'Me', 'Docs', 'Members'];
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(base + '/');
for (const label of tabs) {
  await page.getByRole('button', { name: label, exact: true }).first().click();
  await page.waitForTimeout(250);
  await page.screenshot({ path: join(out, `tab-${label.toLowerCase()}-desktop.png`) });
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(base + '/');
for (const label of tabs) {
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.getByRole('button', { name: label, exact: true }).last().click();
  await page.waitForTimeout(250);
  await page.screenshot({ path: join(out, `tab-${label.toLowerCase()}-mobile.png`) });
}
await browser.close();
console.log('shots done');
