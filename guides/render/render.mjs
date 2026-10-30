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
const tpt = args.includes('--tpt');
const preview = args.includes('--preview');
const [contentPath, outArg] = args.filter((a) => !a.startsWith('--'));
const g = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
// The cover's time chip uses the member zone's label for this activity
// (lib/activity-effort.ts + minsLabel in lib/activity-visuals.tsx), so the
// two can never disagree.
if (g.type !== 'map') {
  const effortSrc = fs.readFileSync(new URL('../../lib/activity-effort.ts', import.meta.url), 'utf8');
  const effort = effortSrc.match(new RegExp(`'${g.slug}':\\s*'(Quick|Half-Day|Project)'`))?.[1];
  if (effort) g.time = { Quick: 'Under an hour', 'Half-Day': 'Half-day', Project: 'Multi-day' }[effort];
  else console.warn(`No effort for ${g.slug} in lib/activity-effort.ts; cover time: ${g.time ?? 'none'}`);
}
// The reference pages sit near the end, not on the back cover. Point to them
// by name and "at the end of the guide", never "at the back". Stops the render
// unless the phrase is about something real (tall plants at the back of a bed).
const backRefs = JSON.stringify(g).match(/[^."]*\b(?:(?:at|from) the back(?! of)|the back page)\b[^."]*/gi)
  ?.filter((s) => !/plants? (go )?at the back|at the back so/i.test(s));
if (backRefs?.length) {
  console.error(`Says "at the back" for a page in the guide. Name the page and say "at the end of the guide":\n  ${backRefs.join('\n  ')}`);
  process.exit(1);
}
const build = (m, o) => (g.type === 'map' ? buildMapHtml(g, m, { ...o, review, tpt }) : buildHtml(g, m, o));
const tag = (bonus ? '-bonus' : '') + (review ? '-review' : '') + (tpt ? '-tpt' : '') + (preview ? '-preview' : '');
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

const PREVIEW_KEEP = ['cover', 'glance', 'build-critical-thinking'];
async function trimForPreview() {
  if (!preview) return;
  await evaluate(`(() => { const keep = ${JSON.stringify(PREVIEW_KEEP)}; const isMap = ${g.type === 'map'};
    // Guides: cover, The idea, and the first step (the preview format).
    const pgs = [...document.querySelectorAll('.pg')]; const firstStep = document.querySelector('.pg.step') || document.querySelector('.pg.cardpg');
    pgs.forEach((p, i) => { const k = isMap ? keep.includes(p.id) : (i < 2 || p === firstStep); if (!k) p.remove(); });
    const st = document.createElement('style'); st.textContent = '.stamp{position:absolute;top:44%;left:50%;transform:translate(-50%,-50%) rotate(-18deg);font:900 120px Arial Black,Arial,sans-serif;color:rgba(40,40,40,.16);letter-spacing:.05em;pointer-events:none;z-index:9}';
    document.head.appendChild(st);
    document.querySelectorAll('.pg:not(.cover)').forEach(p => { const d = document.createElement('div'); d.className = 'stamp'; d.textContent = 'PREVIEW'; p.appendChild(d); }); return true; })()`);
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
await trimForPreview();
const hs = await evaluate(`(() => { const ps=[...document.querySelectorAll('.pg')]; ps.forEach(p => p.style.minHeight = '0'); return ps.map(p => Math.max(Math.ceil(p.scrollHeight), 760)); })()`);
await evaluate(`(() => { const hs=${JSON.stringify(hs)}; const s=document.createElement('style'); s.textContent = hs.map((h,i) => '@page p'+i+'{size:430px '+h+'px;margin:0} .pg:nth-of-type('+(i+1)+'){page:p'+i+';height:'+h+'px}').join(' '); document.head.appendChild(s); return true; })()`);
console.log('phone page heights', hs.join(','), '->', await pdf(`${g.slug}${tag}-phone.pdf`));

// Print: Letter pages in color and in ink-saving black and white. Warn on overflow.
for (const m of ['print', 'print-bw']) {
  file = await load(build(m, { bonus }), 816);
  await trimForPreview();
  // Each page spreads its sections apart until it fills the page (text size stays fixed).
  await evaluate(`(() => { for (const p of document.querySelectorAll('.pg:not(.cover):not(.cardpg)')) { let sp = 1; p.style.setProperty('--sp', 1); while (p.scrollHeight > p.clientHeight && sp > 0.4) { sp -= 0.05; p.style.setProperty('--sp', sp); } let m = 0.7; while (p.scrollHeight > p.clientHeight && m > 0.5) { m -= 0.05; p.style.paddingTop = m + 'in'; p.style.paddingBottom = (m + 0.1) + 'in'; } while (sp < 2.1) { p.style.setProperty('--sp', sp + 0.05); if (p.scrollHeight > p.clientHeight) { p.style.setProperty('--sp', sp); break; } sp += 0.05; } } return true; })()`);
  const over = await evaluate(`[...document.querySelectorAll('.pg')].map((p,i) => ({ i: i + 1, over: p.scrollHeight - p.clientHeight })).filter(x => x.over > 2)`);
  if (over?.length) console.log(m, 'OVERFLOW on pages:', JSON.stringify(over));
  console.log(m, '->', await pdf(`${g.slug}${tag}-${m === 'print' ? 'color' : 'bw'}.pdf`));
}
fs.unlinkSync(file);

ws.close(); chrome.kill(); process.exit(0);
