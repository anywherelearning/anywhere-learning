import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../public/og-default.jpg');
const URL = 'file:///tmp/og-hero.html';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle' });
// Wait for Google Fonts + external images
await page.waitForTimeout(2000);
await page.screenshot({
  path: OUT,
  type: 'jpeg',
  quality: 90,
  fullPage: false,
  clip: { x: 0, y: 0, width: 1200, height: 630 },
});
console.log('Saved', OUT);
await browser.close();
