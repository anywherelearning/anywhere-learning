import { chromium } from 'playwright';

const OUT = '/Users/ameliedrouin/Desktop/tpt-banner.png';
const URL = 'file:///tmp/og-tpt.html';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1200, height: 320 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({
  path: OUT,
  type: 'png',
  omitBackground: false,
  fullPage: false,
  clip: { x: 0, y: 0, width: 1200, height: 320 },
});
console.log('Saved', OUT);
await browser.close();
