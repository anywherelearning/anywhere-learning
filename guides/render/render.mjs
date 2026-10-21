// Renders a guide content JSON into two PDFs (phone + print) with headless Chrome.
//   node guides/render/render.mjs guides/content/directions-challenge.json [outDir]
// Prints a warning for any print page whose content overflows the Letter page.

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { buildHtml, buildMapHtml } from './template.mjs';

const args = process.argv.slice(2);
const bonus = args.includes('--bonus');
const review = args.includes('--review');
const [contentPath, outArg] = args.filter((a) => !a.startsWith('--'));
const g = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
const build = (m, o) => (g.type === 'map' ? buildMapHtml(g, m, { ...o, review }) : buildHtml(g, m, o));
const tag = (bonus ? '-bonus' : '') + (review ? '-review' : '');
const outDir = outArg ?? path.join('notes', 'guides');
fs.mkdirSync(outDir, { recursive: true });

const PORT = 9334;
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ['--headless=new', `--remote-debugging-port=${PORT}`, '--hide-scrollbars', `--user-data-dir=/tmp/claude-501/guide-chrome`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) {
  try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((t) => t.type === 'page'); } catch {}
  if (!target) await sleep(250);
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = {};
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending[m.id]) { pending[m.id](m); delete pending[m.id]; } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;

async function load(html, width) {
  const file = path.resolve(outDir, `.tmp-${g.slug}.html`);
  fs.writeFileSync(file, html);
  await send('Emulation.setDeviceMetricsOverride', { width, height: 1200, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'file://' + file });
  await sleep(1500);
  await evaluate('document.fonts.ready.then(() => true)');
  await sleep(300);
  return file;
}

async function pdf(name) {
  const res = await send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 });
  const out = path.join(outDir, name);
  fs.writeFileSync(out, Buffer.from(res.result.data, 'base64'));
  return out;
}

await send('Page.enable');

// Phone: every section becomes its own named page, sized to its content.
let file = await load(build('phone', { bonus }), 430);
const hs = await evaluate(`(() => { const ps=[...document.querySelectorAll('.pg')]; ps.forEach(p => p.style.minHeight = '0'); return ps.map(p => Math.max(Math.ceil(p.scrollHeight), 760)); })()`);
await evaluate(`(() => { const hs=${JSON.stringify(hs)}; const s=document.createElement('style'); s.textContent = hs.map((h,i) => '@page p'+i+'{size:430px '+h+'px;margin:0} .pg:nth-of-type('+(i+1)+'){page:p'+i+';height:'+h+'px}').join(' '); document.head.appendChild(s); return true; })()`);
console.log('phone page heights', hs.join(','), '->', await pdf(`${g.slug}${tag}-phone.pdf`));

// Print: Letter pages in color and in ink-saving black and white. Warn on overflow.
for (const m of ['print', 'print-bw']) {
  file = await load(build(m, { bonus }), 816);
  // Each page spreads its sections apart until it fills the page (text size stays fixed).
  await evaluate(`(() => { for (const p of document.querySelectorAll('.pg:not(.cover)')) { let sp = 1; p.style.setProperty('--sp', 1); while (p.scrollHeight > p.clientHeight && sp > 0.4) { sp -= 0.05; p.style.setProperty('--sp', sp); } let m = 0.7; while (p.scrollHeight > p.clientHeight && m > 0.5) { m -= 0.05; p.style.paddingTop = m + 'in'; p.style.paddingBottom = (m + 0.1) + 'in'; } while (sp < 2.1) { p.style.setProperty('--sp', sp + 0.05); if (p.scrollHeight > p.clientHeight) { p.style.setProperty('--sp', sp); break; } sp += 0.05; } } return true; })()`);
  const over = await evaluate(`[...document.querySelectorAll('.pg')].map((p,i) => ({ i: i + 1, over: p.scrollHeight - p.clientHeight })).filter(x => x.over > 2)`);
  if (over?.length) console.log(m, 'OVERFLOW on pages:', JSON.stringify(over));
  console.log(m, '->', await pdf(`${g.slug}${tag}-${m === 'print' ? 'color' : 'bw'}.pdf`));
}
fs.unlinkSync(file);

ws.close(); chrome.kill(); process.exit(0);
