import { chromium } from 'playwright';

const OUT = '/Users/ameliedrouin/Desktop/tpt-logo.png';
const URL = 'file:///tmp/og-tpt-logo.html';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 400, height: 400 },
  deviceScaleFactor: 2, // retina for crisp logo at small sizes
});
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.screenshot({
  path: OUT,
  type: 'png',
  omitBackground: true,
  fullPage: false,
  clip: { x: 0, y: 0, width: 400, height: 400 },
});
console.log('Saved', OUT);
await browser.close();
