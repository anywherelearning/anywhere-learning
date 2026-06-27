import { chromium } from 'playwright';

const OUT = '/Users/ameliedrouin/Desktop/pinterest-cover.jpg';
const URL = 'file:///tmp/og-pinterest.html';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({
  path: OUT,
  type: 'jpeg',
  quality: 92,
  fullPage: false,
  clip: { x: 0, y: 0, width: 1600, height: 900 },
});
console.log('Saved', OUT);
await browser.close();
