#!/usr/bin/env node
/** Open one mentor, start a 7-day goal, check a step, reload, confirm it stuck. */
import puppeteer from 'puppeteer-core';

const base = process.env.SMOKE_BASE || 'http://127.0.0.1:4173';
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME || '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
});
const page = await browser.newPage();
await page.goto(base, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => {
  localStorage.setItem('creatorplaybooks_origin_seen', '1');
  localStorage.setItem('creatorplaybooks_onboarding_seen', '1');
});
await page.goto(`${base}/?mentor=maya`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('[data-mentor="maya"]');
await page.click('.goal-actions .btn-hot');
await page.waitForSelector('.goal-phase input[type="checkbox"]');
const before = await page.$eval('.goal-stats strong', (el) => el.textContent);
await page.click('.goal-today input[type="checkbox"], .goal-phase input[type="checkbox"]');
await page.waitForFunction(() => {
  const box = document.querySelector('.goal-phase input[type="checkbox"]');
  return box && box.checked;
});
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForSelector('.goal-phase input[type="checkbox"]');
const kept = await page.$eval('.goal-phase input[type="checkbox"]', (el) => el.checked);
const percent = await page.$eval('.goal-stats strong', (el) => el.textContent);
const ics = await page.evaluate(() => document.body.innerText.includes('Export calendar'));
if (!kept || percent === '0%' || !ics) {
  console.error('goal tracker failed', { before, kept, percent, ics });
  process.exit(1);
}
console.log('goal tracker ok', { percent });
await browser.close();
