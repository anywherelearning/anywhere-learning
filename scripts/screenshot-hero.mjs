import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../public/membership-hero.png');
const URL = process.env.HERO_URL || 'http://localhost:60335/';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 1100 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle' });

const el = await page.waitForSelector('[data-hero-collage]', { timeout: 15000 });
// Wait a beat for next/image to swap in real srcs
await page.waitForTimeout(1500);

await el.screenshot({ path: OUT, omitBackground: true });

console.log('Saved', OUT);
await browser.close();
