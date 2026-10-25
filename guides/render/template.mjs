// Builds the guide HTML from a content JSON. One template, two modes:
// 'phone' (single column, ~430px pages) and 'print' (US Letter).

import fs from 'node:fs';
import path from 'node:path';

// Local photos are inlined so the PDF never depends on the network.
const img = (src) => src.startsWith('http') ? src : `data:image/jpeg;base64,${fs.readFileSync(path.resolve(src)).toString('base64')}`;

// Card icons: Lucide line icons (ISC licence, guides/icons/LICENSE-lucide.txt),
// inlined so they take the category accent colour.
const icon = (name) => {
  if (!name) return '';
  const svg = fs.readFileSync(path.resolve('guides/icons', `${name}.svg`), 'utf8').replace(/<!--.*?-->/s, '');
  return `<span class="tcicon" aria-hidden="true">${svg}</span>`;
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Category accents. Add one line per category as guides move over.
// One color per category, drawn from the brand palette and never repeated,
// so members can tell categories apart at a glance. `paper` is the light
// page tint (color PDFs and phone only; black & white stays plain).
export const ACCENTS = {
  'Writing & Communication': { accent: '#4f8aa0', soft: '#e3eff2', paper: '#f1f5f4' },
  'Outdoor Learning': { accent: '#588157', soft: '#e1e9d8', paper: '#f2f5ec' },
  'Real-World Math': { accent: '#b08a35', soft: '#f2e6c2', paper: '#f8f3e6' },
  'Creativity & Maker': { accent: '#c4836a', soft: '#f4e0d6', paper: '#f9f0eb' },
  'Emotional & Social Skills': { accent: '#b6748a', soft: '#f2e1e7', paper: '#f8eff2' },
  'Entrepreneurship': { accent: '#8b7355', soft: '#ece2d6', paper: '#f6f0e8' },
  'AI & Digital Literacy': { accent: '#6f86a0', soft: '#e2e8ef', paper: '#f1f3f6' },
  'Worldschooling': { accent: '#8a8470', soft: '#e7e4d9', paper: '#f4f2ec' },
  'Planning & Problem-Solving': { accent: '#5c7b6a', soft: '#dfe8e2', paper: '#eff4f1' },
  default: { accent: '#bf7c48', soft: '#f6e9dc', paper: '#f7f2e8' },
};

const contours = (id) => `
<svg class="topo" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <g fill="none" stroke="currentColor" stroke-width="1">
    <path d="M-20 300 C 60 240, 120 330, 200 280 S 330 200, 420 250"/>
    <path d="M-20 330 C 70 270, 130 360, 210 310 S 330 235, 420 285"/>
    <path d="M-20 360 C 80 300, 140 390, 220 340 S 330 270, 420 320"/>
    <path d="M-20 80 C 50 40, 110 120, 190 90 S 320 20, 420 60"/>
    <path d="M-20 110 C 60 70, 120 150, 200 120 S 320 55, 420 95"/>
    <path d="M260 170 C 300 140, 360 160, 350 200 S 280 240, 260 210 Z"/>
    <path d="M275 175 C 305 158, 342 172, 335 198 S 290 222, 278 204 Z"/>
  </g>
</svg>`;

// Trail map: the steps as stops on a winding dotted path.
const coverTrail = (steps) => {
  const W = 340, rowH = 64, top = 30;
  const pts = steps.map((_, i) => [i % 2 ? W - 70 : 70, top + i * rowH]);
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    d += ` C ${x0} ${y0 + rowH * 0.7}, ${x1} ${y1 - rowH * 0.7}, ${x1} ${y1}`;
  }
  const H = top + (steps.length - 1) * rowH + 34;
  const stops = pts.map(([x, y], i) => {
    const right = i % 2 === 0;
    return `<g transform="translate(${x} ${y})"><rect x="-15" y="-15" width="30" height="30" rx="8" transform="rotate(-4)" class="tm-blaze"/>
      <text class="tm-n" y="5" text-anchor="middle">${i + 1}</text>
      <text class="tm-l" x="${right ? 26 : -26}" y="5" text-anchor="${right ? 'start' : 'end'}">${esc(steps[i].title)}</text></g>`;
  }).join('');
  return `<div class="cover-trail"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="The ${steps.length} steps">
    <path d="${d}" fill="none" class="tm-path"/>${stops}
    <g transform="translate(${pts[pts.length - 1][0]} ${pts[pts.length - 1][1] + 26})"><path d="M0 0 v-14 l12 4 l-12 4" class="tm-flag"/></g></svg></div>`;
};

const blaze = (n, cls = '') => `<span class="blaze ${cls}"><span>${n}</span></span>`;

const trail = (total, current) => {
  const dots = Array.from({ length: total }, (_, i) => {
    const s = i + 1 < current ? 'done' : i + 1 === current ? 'here' : '';
    return `<span class="stop ${s}">${i + 1}</span>`;
  }).join('<span class="dash"></span>');
  return `<div class="trail">${dots}</div>`;
};

const levelRow = (lv) => `
  <div class="levels">
    <div class="lv lv1"><span class="lvname">Explore</span><p>${esc(lv.explore)}</p></div>
    <div class="lv lv2"><span class="lvname">Develop</span><p>${esc(lv.develop)}</p></div>
    <div class="lv lv3"><span class="lvname">Extend</span><p>${esc(lv.extend)}</p></div>
  </div>`;

export function buildHtml(g, mode, { bonus = false } = {}) {
  const bw = mode === 'print-bw';
  const layout = mode === 'phone' ? 'phone' : 'print';
  const { accent, soft, paper } = ACCENTS[g.category] ?? ACCENTS.default;
  const n = (g.steps || []).length;
  // Card decks have themes instead of steps; the cover trail shows the themes.
  const coverItems = g.steps || g.themes || [];
  const foot = (label) => `<footer class="foot"><span>${esc(g.title)}</span><span>${esc(label)}</span></footer>`;

  const cover = `
<section class="pg cover">
  ${contours()}
  <div class="cover-in">
    <div class="eyebrow">${esc(g.category)}</div>
    <h1${g.title.length > 30 ? ' class="longtitle"' : ''}>${esc(g.title)}</h1>
    <p class="tagline">${esc(g.tagline)}</p>
    <div class="chips"><span>${esc(g.ages)}</span>${g.time ? `<span>${esc(g.time)}</span>` : ''}<span>Three levels</span></div>
    <div class="coverbody">
      ${coverTrail(coverItems)}
      <ol class="htrail">${coverItems.map((st, i) => `<li>${blaze(i + 1, 'sm')}<span>${esc(st.title)}</span></li>`).join('')}</ol>
      ${g.photo ? `<figure class="snap${g.photo.tall ? ' tall' : ''}"><img src="${img(g.photo.src)}" alt="${esc(g.photo.alt || g.photo.caption)}"><figcaption>${esc(g.photo.caption)}</figcaption></figure>` : ''}
    </div>
  </div>
  <div class="brand"><img src="https://anywherelearning.co/email-anywhere-learning-wordmark.png" alt="Anywhere Learning"></div>
</section>`;

  // The core skill in plain words, shown as one worked example: the weak
  // first try, then the fixed version with each part labelled. Replaces the
  // plain before/after example when a guide has a lesson.
  const L = g.lesson;
  const lessonBox = L ? `
  <div class="box model"><div class="label">The skill, in a minute</div>
    <p class="mlead">${esc(L.text)}</p>
    ${L.before ? `<div class="mbefore"><span class="tag">First try</span><s>${esc(L.before)}</s></div>` : ''}
    <div class="mafter"><span class="tag">After the fix</span>
      ${L.model.map((m) => `<div class="mrow"><span class="mtag">${esc(m.part)}</span><p>${esc(m.line)}</p></div>`).join('')}</div>
    ${L.modelNote ? `<p class="why">${esc(L.modelNote)}</p>` : ''}</div>` : '';

  const levelsLine = `<div class="levelsline"><span class="lvdots"><i class="lv1"></i><i class="lv2"></i><i class="lv3"></i></span><p>${esc(g.levelsLine)}</p></div>`;
  const idea = `
<section class="pg">
  <div class="eyebrow">Before you start</div>
  <h2>The idea</h2>
  <p class="lead">${esc(g.goal)}</p>
  ${g.glance ? `<div class="glance">${g.glance.map((x) => `<div><span>${esc(x.k)}</span><b>${esc(x.v)}</b></div>`).join('')}</div>` : ''}
  ${g.academics ? `<div class="box"><div class="label">What your kid learns</div>
    <dl class="skills learns">${g.academics.map((a) => `<div><dt>${esc(a.subject)}</dt><dd>${esc(a.text)}</dd></div>`).join('')}</dl></div>` : `
  <div class="ideagrid">
    <div class="box"><div class="label">What your kid will make</div>
      <ul class="ticks">${g.create.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></div>
    <div class="box"><div class="label">Skills your kid builds</div>
      <dl class="skills">${g.skills.map((s) => `<div><dt>${esc(s.name)}</dt><dd>${esc(s.text)}</dd></div>`).join('')}</dl></div>
  </div>`}
  ${L ? lessonBox : `  <div class="box"><div class="label">What you need</div>
    <ul class="dots">${g.need.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></div>`}
  ${L ? '' : levelsLine}
  ${foot('The idea')}
</section>`;

  const howto = `
<section class="pg">
  <div class="eyebrow">Your role</div>
  <h2>How to run it</h2>
  <p class="lead">${esc(g.howTo.intro)}</p>
  ${L ? `  <div class="box"><div class="label">What you need</div>
    <ul class="dots">${g.need.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></div>` : ''}
  ${g.howTo.plan ? `<div class="box"><div class="label">A simple plan</div>
    <dl class="plan">${g.howTo.plan.map((x) => `<div><dt>${esc(x.when)}</dt><dd>${esc(x.what)}</dd></div>`).join('')}</dl></div>` : ''}
  ${g.howTo.tips?.length ? `<div class="tips">${g.howTo.tips.map((t, i) => `
    <div class="tip"><span class="tipn">${i + 1}</span><div><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p></div></div>`).join('')}
  </div>` : ''}
  ${g.fromHome ? `<div class="box home"><div class="label">From our house</div><p>${esc(g.fromHome.text)}</p>
    ${g.fromHome.quotes.map((q) => `<blockquote>${esc(q)}</blockquote>`).join('')}</div>` : ''}
  ${g.howTo.example && !L ? `
  <div class="example">
    <div class="label">${esc(g.howTo.example.title)}</div>
    <div class="ba">
      <div class="before"><span class="tag">First try</span><ol>${g.howTo.example.before.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></div>
      <div class="arrow" aria-hidden="true">&rarr;</div>
      <div class="after"><span class="tag">After the fix</span><ol>${g.howTo.example.after.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></div>
    </div>
    <p class="why">${esc(g.howTo.example.why)}</p>
  </div>` : ''}
  ${g.howTo.troubleshoot ? `<div class="trouble"><div class="label">If it's not working</div><dl>${g.howTo.troubleshoot.map((t) => `<div><dt>${esc(t.q)}</dt><dd>${esc(t.a)}</dd></div>`).join('')}</dl></div>` : ''}
  ${L ? levelsLine : ''}
  <div class="start">Let's start.</div>
  ${foot('How to run it')}
</section>`;

  // Card decks: every card numbered across the deck, 6 per printed page,
  // each tagged with its theme.
  const allCards = (g.themes || []).flatMap((th, ti) => th.cards.map((c) => ({ ...c, theme: th.title, ti })));
  const cardPages = [];
  for (let i = 0; i < allCards.length; i += 6) cardPages.push(allCards.slice(i, i + 6).map((c, k) => ({ ...c, num: i + k + 1 })));
  const cards = cardPages.map((pg, pi) => `
<section class="pg cardpg">
  <div class="eyebrow">The cards &middot; ${pg[0].num} to ${pg[pg.length - 1].num}</div>
  <div class="cardgrid">${pg.map((c) => `
    <div class="tcard th${c.ti % 7}"><div class="tchead"><span class="tcnum">${c.num}</span><span class="tctheme">${esc(c.theme)}</span>${icon(c.icon)}</div>
      ${c.name ? `<h3 class="tcname">${esc(c.name)}</h3>` : ''}<p class="tct">${esc(c.t)}</p><p class="tcd"><b>Deeper</b> ${esc(c.d)}</p></div>`).join('')}
  </div>
  ${foot(`Cards ${pg[0].num} to ${pg[pg.length - 1].num}`)}
</section>`).join('');

  const steps = (g.steps || []).map((s, i) => `
<section class="pg step">
  <header class="stephead">
    ${blaze(i + 1)}
    <div><div class="eyebrow">Step ${i + 1} of ${n}</div><h2>${esc(s.title)}</h2></div>
  </header>
  ${trail(n, i + 1)}
  <p class="why">${esc(s.why)}</p>
  <div class="role kid"><div class="rolel"><span class="who">Kid</span>What your kid does</div><p>${esc(s.kid)}</p></div>
  <div class="role you"><div class="rolel"><span class="who">You</span>What you do</div><p>${esc(s.you)}</p>
    ${s.starters ? `<div class="chips starters">${s.starters.map((x) => `<span>${esc(x)}</span>`).join('')}</div>` : ''}</div>
  <div class="tryask"><div class="rolel">Try asking</div>${s.ask.map((q) => `<p>&ldquo;${esc(q)}&rdquo;</p>`).join('')}</div>
  ${s.tip ? `<p class="tip2"><b>Tip</b>${esc(s.tip)}</p>` : ''}
  <div class="label lvlabel">Adjust the level</div>
  ${levelRow(s.levels)}
  ${foot(`Step ${i + 1}`)}
</section>`).join('');

  // Optional reference page (style cards, prompt cards): a titled grid of
  // short cards the kid flips through while working.
  const R = g.reference;
  const reference = R ? `
<section class="pg refpg">
  <div class="eyebrow">Keep this open</div>
  <h2>${esc(R.title)}</h2>
  ${R.intro ? `<p class="lead">${esc(R.intro)}</p>` : ''}
  <div class="refgrid">${R.items.map((it) => `
    <div class="refcard"><h3>${esc(it.name)}</h3>${it.lines.map((l) => `<p><b>${esc(l.k)}</b> ${esc(l.v)}</p>`).join('')}</div>`).join('')}
  </div>
  ${foot(R.title)}
</section>` : '';

  const c = g.conclusion;
  const finish = `
<section class="pg finish">
  ${contours()}
  <div class="eyebrow">You made it</div>
  <h2>${esc(c.headline)}</h2>
  <p class="lead">${esc(c.text)}</p>
  <div class="${c.reflect ? 'split' : ''}">
    ${c.reflect ? `<div class="box"><div class="label">Reflect</div><p>${esc(c.reflect)}</p></div>` : ''}
    <div class="box"><div class="label">Celebrate</div><p>${esc(c.celebrate)}</p></div>
  </div>
  ${g.signs ? `<div class="box"><div class="label">Signs it's working</div><ul class="ticks">${g.signs.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
  ${g.makeItReal ? `<div class="box real"><div class="label">Make it real</div><p>${esc(g.makeItReal)}</p></div>` : ''}
  <div class="box"><div class="label">Keep it going</div><ul class="dots">${c.extensions.map((e) => `<li>${esc(e)}</li>`).join('')}</ul></div>
  ${!bonus && g.done ? `<a class="donebox" href="${esc(g.done.url)}"><span class="donetick">&#10003;</span><span>${esc(g.done.text)}</span><b>${esc(g.done.label)} &rarr;</b></a>` : ''}
  ${bonus ? `<div class="cta"><p>${esc(g.cta)}</p><span class="ctaurl">${esc(g.ctaUrl)}</span></div>` : ''}
  <p class="legal">&copy; Anywhere Learning &middot; For your family's use. Please don't share, resell or upload this guide. &middot; anywherelearning.co</p>
</section>`;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(g.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
<style>${css(layout, accent, soft, bw, paper)}</style></head>
<body class="${layout}${bw ? ' bw' : ''}">${cover}${idea}${howto}${steps}${cards}${reference}${finish}</body></html>`;
}

function css(mode, accent, soft, bw, paper = '#f7f2e8') {
  return `
:root{--paper:${paper};--paper2:#efe7d6;--card:#fffdf8;--ink:#32302a;--muted:#6b6152;--forest:#5d7d53;--forest2:#7d9c6d;--trail:#bf7c48;--gold:#d6a24e;--accent:${accent};--soft:${soft};
--l1:#eef3e6;--l2:#dde9cf;--l3:#c7dbb3}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:var(--paper);color:var(--ink);font-family:'DM Sans',sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{position:relative;overflow:hidden;break-after:page;background:var(--paper)}
.pg:last-child{break-after:auto}
.topo{position:absolute;inset:0;width:100%;height:100%;color:var(--forest2);opacity:.16;pointer-events:none}
.eyebrow{font:700 11px 'JetBrains Mono',monospace;letter-spacing:.16em;text-transform:uppercase;color:var(--trail)}
h1,h2,h3{font-family:'Bricolage Grotesque',sans-serif;color:var(--ink);letter-spacing:-.01em}
h2{font-weight:800;line-height:1.05;margin:6px 0 14px}
h3{font-weight:700}
p,li,dd{line-height:1.55}
.lead{color:var(--ink)}
.label{font:700 11px 'JetBrains Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--forest);margin-bottom:8px}
.box{background:var(--card);border:1px solid rgba(93,125,83,.16);border-radius:16px;padding:16px 18px;margin-top:14px;box-shadow:0 2px 10px -6px rgba(70,55,30,.25)}
ul{list-style:none}
.ticks li,.dots li{position:relative;padding-left:26px;margin:0 0 8px}
.ticks li:before{content:'';position:absolute;left:0;top:.28em;width:16px;height:16px;border-radius:50%;background:var(--forest) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 8.5l2.5 2.5L12 5.5' stroke='%23fff' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") center/16px no-repeat}
.dots li:before{content:'';position:absolute;left:5px;top:.55em;width:7px;height:7px;border-radius:50%;background:var(--trail)}
.blaze{display:inline-grid;place-items:center;width:var(--bz,52px);height:var(--bz,52px);flex:none;background:var(--accent);border-radius:14px;transform:rotate(-4deg);box-shadow:0 3px 0 rgba(0,0,0,.12)}
.blaze span{transform:rotate(4deg);font:800 26px 'Bricolage Grotesque';color:#fff}
.blaze.sm{width:26px;height:26px;border-radius:8px}.blaze.sm span{font-size:14px}
/* cover */
.cover{display:flex;flex-direction:column;justify-content:space-between;background:linear-gradient(170deg,var(--soft) 0%,var(--paper) 55%)}
.cover-in{position:relative;text-align:center}
.cover .chips{justify-content:center}
.cover h1{font-weight:800;line-height:.95;margin:10px 0 12px;color:var(--ink)}
.tagline{font:500 15px 'DM Sans';color:var(--muted);letter-spacing:.02em}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
.chips span{font:700 11px 'JetBrains Mono';letter-spacing:.08em;text-transform:uppercase;padding:7px 11px;border-radius:999px;background:var(--card);border:1px solid rgba(93,125,83,.25);color:var(--forest)}
.cover-trail{position:relative;margin:26px auto 0;max-width:380px}
.cover-trail svg{width:100%;height:auto;display:block;overflow:visible}
.tm-path{stroke:var(--trail);stroke-width:3;stroke-dasharray:1 9;stroke-linecap:round}
.tm-blaze{fill:var(--accent)}
.tm-n{font:800 16px 'Bricolage Grotesque';fill:#fff}
.tm-l{font:600 13.5px 'DM Sans';fill:var(--ink)}
.tm-flag{fill:var(--trail);stroke:var(--trail);stroke-width:2;stroke-linejoin:round}
.brand{position:relative;text-align:center;margin-top:28px}.brand img{height:30px;opacity:.9}
/* steps */
.stephead{display:flex;align-items:center;gap:14px}
.stephead h2{margin:2px 0 0}
.trail{display:flex;align-items:center;margin:14px 0 4px}
.stop{width:22px;height:22px;flex:none;border-radius:50%;display:grid;place-items:center;font:700 10px 'JetBrains Mono';color:var(--muted);background:var(--card);border:1.5px solid rgba(93,125,83,.3)}
.stop.done{background:var(--forest2);color:#fff;border-color:var(--forest2)}
.stop.here{background:var(--accent);color:#fff;border-color:var(--accent);transform:scale(1.2)}
.dash{flex:1;height:0;border-top:2px dotted rgba(191,124,72,.55);margin:0 3px}
.jobs{display:grid;gap:12px;margin-top:16px}
.job{border-radius:16px;padding:15px 17px;background:var(--card);border:1px solid rgba(93,125,83,.16);box-shadow:0 2px 10px -6px rgba(70,55,30,.25)}
.job.kid{border-left:5px solid var(--accent)}.job.you{border-left:5px solid var(--trail)}
.jobl{display:flex;align-items:center;gap:9px;font:700 11px 'JetBrains Mono';letter-spacing:.14em;text-transform:uppercase;margin-bottom:7px}
.who{font:700 10px 'JetBrains Mono';letter-spacing:.06em;color:#fff;padding:4px 7px;border-radius:6px}
.kid .who{background:var(--accent)}.you .who{background:var(--trail)}
.split{display:grid;gap:12px;margin-top:16px}
.note{margin-top:6px;padding:10px 12px;border-radius:10px;background:var(--paper2);font-size:.92em;color:var(--muted)}
.ask{background:var(--soft);border-radius:16px;padding:15px 17px}
.ask .label{color:var(--accent)}
.ask p{font-style:italic;margin:0 0 7px}.ask p:last-child{margin-bottom:0}
.lvlabel{margin-top:16px}
.levels{display:grid;gap:8px}
.lv,.bl{border-radius:12px;padding:11px 14px}
.lv1{background:var(--l1)}.lv2{background:var(--l2)}.lv3{background:var(--l3)}
.lvname{font:700 11px 'JetBrains Mono';letter-spacing:.12em;text-transform:uppercase;color:var(--forest)}
.lv p{margin-top:3px}
.biglevels{display:grid;gap:10px;margin-top:6px}
.bl p{margin-top:6px}.focus{color:var(--muted);font-size:.92em}
.skills{display:grid;gap:0;margin:0}.skills div{padding:8px 0;border-top:1px solid rgba(58,44,23,.12)}.skills div:first-child{border-top:0;padding-top:2px}.skills dt{font:700 1em/1.3 'DM Sans';color:var(--forest);display:block}.skills dd{display:block;margin:2px 0 0;color:var(--muted);font-size:.92em;line-height:1.4}
.model .mrow{display:grid;grid-template-columns:5.2em 1fr;gap:12px;align-items:start;padding:6px 0;border-top:1px solid rgba(58,44,23,.12)}.model .label+.mrow{border-top:0;padding-top:4px}
.mtag{font:700 .72em/1.2 'JetBrains Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:#fff;background:var(--accent);border-radius:6px;padding:5px 6px;text-align:center}
.mrow p{margin:0}.model .why{margin-top:10px}
.mlead{margin:2px 0 10px}.mbefore{display:flex;gap:10px;align-items:baseline;padding:8px 12px;border-radius:10px;background:#f6e3df;margin-bottom:8px}.mbefore s{color:#9a5b4c;text-decoration-color:rgba(154,91,76,.6)}
.mafter{padding:8px 12px 2px;border-radius:10px;background:#e3ead9}.mafter .tag{display:block;margin-bottom:2px}.mafter .mrow:first-of-type{border-top:0}
.mbefore .tag,.mafter .tag{font:700 .7em 'JetBrains Mono',monospace;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap}
.acad{display:grid;gap:0;margin:0}.acad div{padding:8px 0;border-top:1px solid rgba(58,44,23,.12)}.acad div:first-child{border-top:0;padding-top:2px}
.acad dt{font:700 1em/1.3 'DM Sans';color:var(--accent)}.acad dd{margin:2px 0 0;line-height:1.45}
.box.real{border-left:4px solid var(--trail)}
.cardgrid{display:grid;gap:10px;margin-top:8px}
.tcard{background:#fff;border:1.5px dashed rgba(58,44,23,.28);border-radius:14px;padding:12px 14px;display:flex;flex-direction:column;gap:6px}
.tchead{display:flex;align-items:center;gap:8px}.tcnum{font:800 1.05em 'Bricolage Grotesque';color:#fff;background:var(--accent);border-radius:8px;min-width:30px;height:28px;display:grid;place-items:center;padding:0 6px}
.tctheme{font:700 .68em 'JetBrains Mono',monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.tct{margin:0;font:600 1.02em/1.35 'DM Sans';color:var(--ink)}.tcicon{margin-left:auto;width:50px;height:50px;border-radius:50%;background:var(--soft);color:var(--accent);display:grid;place-items:center;flex:none;margin-top:-2px}.tcicon svg{width:30px;height:30px;stroke-width:1.6}
.tcname{margin:0;font:800 1.15em/1.2 'Bricolage Grotesque';color:var(--ink)}.tcname+.tct{font-weight:400}
.tcd{margin:auto 0 0;font-size:.86em;line-height:1.35;color:var(--muted)}.tcd b{color:var(--accent);margin-right:4px}
.refgrid{display:grid;gap:10px;margin-top:6px}.refcard{background:var(--card);border:1px solid rgba(58,44,23,.12);border-top:4px solid var(--accent);border-radius:12px;padding:11px 13px}
.refcard h3{font:800 1.02em 'Bricolage Grotesque';margin:0 0 5px;color:var(--ink)}.refcard p{margin:3px 0 0;font-size:.9em;line-height:1.4}.refcard b{color:var(--accent);font-weight:700}
.plan{display:grid;gap:0;margin:0}.plan div{display:grid;grid-template-columns:7.5em 1fr;gap:12px;padding:6px 0;border-top:1px solid rgba(58,44,23,.12)}.plan div:first-child{border-top:0;padding-top:2px}
.plan dt{font:700 .95em/1.35 'DM Sans';color:var(--trail)}.plan dd{margin:0;line-height:1.4}
.box.home{background:#fbf3e4}.box.home p{margin:0 0 8px}.box.home blockquote{margin:6px 0 0;padding:4px 0 4px 12px;border-left:3px solid var(--gold);font-style:italic;line-height:1.45}
.ideagrid{display:grid;gap:0}
.levelsline{display:flex;gap:12px;align-items:center;margin-top:16px;padding:12px 16px;border-radius:14px;border:1.5px dashed rgba(93,125,83,.35)}
.lvdots{display:flex;gap:4px;flex:none}.lvdots i{width:12px;height:22px;border-radius:4px;display:block}
.tips{display:grid;gap:12px;margin-top:6px}
.tip{display:flex;gap:14px;background:var(--card);border:1px solid rgba(93,125,83,.16);border-radius:16px;padding:15px 17px}
.tipn{flex:none;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:var(--trail);color:#fff;font:800 15px 'Bricolage Grotesque'}
.tip h3{font-size:1.02em;margin-bottom:3px}
.example{margin-top:16px;background:var(--card);border:1px solid rgba(93,125,83,.16);border-radius:16px;padding:16px 18px}
.ba{display:grid;gap:10px;align-items:center}
.before,.after{border-radius:12px;padding:12px 14px}
.before{background:#f6e3df}.after{background:var(--l2)}
.tag{font:700 11px 'JetBrains Mono';letter-spacing:.12em;text-transform:uppercase}
.before .tag{color:#b5533c}.after .tag{color:var(--forest)}
.ba ol{margin:6px 0 0 18px}.ba li{margin:0 0 3px}
.before li{text-decoration:line-through;text-decoration-color:rgba(181,83,60,.5);text-decoration-thickness:2px}
.arrow{font:800 24px 'Bricolage Grotesque';color:var(--trail);text-align:center;transform:rotate(90deg)}
.why{margin-top:10px;color:var(--muted);font-size:.95em}
.starters{margin-top:16px}.starters .chips{margin-top:0}
.glance{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}
.glance div{background:var(--card);border:1px solid rgba(93,125,83,.16);border-radius:12px;padding:10px 12px}
.glance span{display:block;font:700 10.5px 'JetBrains Mono';letter-spacing:.12em;text-transform:uppercase;color:var(--trail)}
.glance b{display:block;margin-top:3px;font-weight:700;line-height:1.3}
.side{display:grid;gap:12px;align-content:start}
.say{position:relative;background:var(--card);border:1.5px solid var(--trail);border-radius:16px 16px 16px 4px;padding:12px 16px}
.saylab{font:700 10.5px 'JetBrains Mono';letter-spacing:.12em;text-transform:uppercase;color:var(--trail)}
.say p{margin-top:4px;font-weight:600}
.photo{margin-top:16px;display:grid;gap:8px}
.photo img{width:100%;border-radius:14px;display:block;object-fit:cover}
.photo figcaption{font-size:.9em;color:var(--muted);font-style:italic}
.trouble{margin-top:16px;background:var(--card);border:1px solid rgba(93,125,83,.16);border-radius:16px;padding:14px 18px}
.trouble dl{display:grid;gap:8px}.trouble dt{font-weight:700;color:var(--ink)}.trouble dd{color:var(--muted)}
.donebox{position:relative;display:flex;flex-wrap:wrap;align-items:center;gap:10px 12px;margin-top:16px;padding:14px 18px;border-radius:16px;background:var(--card);border:2px solid var(--forest);color:var(--ink);text-decoration:none}
.donetick{width:28px;height:28px;border-radius:50%;background:var(--forest);color:#fff;display:grid;place-items:center;font-weight:800;flex:none}
.donebox span:nth-child(2){flex:1;min-width:200px}.donebox b{color:var(--forest);font-family:'JetBrains Mono';font-size:.85em;letter-spacing:.06em}
.why{margin:.9em 0 .25em;font-size:1.08em;font-weight:500;color:var(--muted)}
.role{margin-top:.95em;padding:14px 18px 15px;border-radius:16px;background:var(--card);border:1px solid rgba(93,125,83,.16);box-shadow:0 2px 10px -6px rgba(70,55,30,.25)}
.role.kid{border-left:5px solid var(--accent)}.role.you{border-left:5px solid var(--trail)}
.rolel{display:flex;align-items:center;gap:9px;font:700 11.5px 'JetBrains Mono';letter-spacing:.14em;text-transform:uppercase;margin-bottom:6px}
.role .starters{margin-top:10px}
.tryask{margin-top:.95em;padding:14px 18px;border-radius:16px;background:var(--soft)}
.tryask .rolel{color:var(--accent)}
.tryask p{font-style:italic;margin:0 0 5px}.tryask p:last-child{margin:0}
.tip2{margin-top:.95em;padding:0 4px;color:var(--ink)}
.tip2 b{font:700 11.5px 'JetBrains Mono';letter-spacing:.14em;text-transform:uppercase;color:var(--trail);margin-right:10px}
.coverbody{position:relative}
.htrail{display:none}
.snap{position:relative;background:#fff;padding:10px 10px 12px;border-radius:4px;box-shadow:0 10px 26px -10px rgba(50,40,20,.45);transform:rotate(3deg);margin:22px auto 0;max-width:330px}
.snap:before{content:'';position:absolute;top:-10px;left:50%;width:90px;height:22px;margin-left:-45px;background:rgba(214,162,78,.55);transform:rotate(-3deg)}
.snap img{display:block;width:100%;border-radius:2px}
.snap figcaption{margin-top:8px;font-size:12.5px;line-height:1.35;color:var(--muted);text-align:center}
.start{margin:20px 0 14px;font:800 30px 'Bricolage Grotesque';color:var(--trail);transform:rotate(-2deg)}
.finish h2{font-size:28px}
.finish .lead{position:relative}
.cta{position:relative;margin-top:16px;background:var(--forest);color:#fff;border-radius:16px;padding:18px 20px}
.cta p{font-weight:500}.ctaurl{display:inline-block;margin-top:8px;font:700 13px 'JetBrains Mono';color:var(--gold)}
.legal{position:relative;margin-top:14px;font-size:11px;color:var(--muted);text-align:center}
.box,.job,.role,.tip,.ss,.example,.trouble,.glance div,.role,.tryask{box-shadow:none!important}
.foot{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;font:500 10px 'JetBrains Mono';letter-spacing:.1em;text-transform:uppercase;color:var(--muted);opacity:.8}
${mode === 'phone' ? phoneCss() : printCss()}
${bw ? bwCss() : ''}`;
}

function phoneCss() {
  return `

body{font-size:17px}
.pg{width:430px;padding:28px 22px 46px}
.foot{padding:0 22px 16px}
h2{font-size:30px}
.cover h1{font-size:54px}
.cover h1.longtitle{font-size:44px}

`;
}

function printCss() {
  return `
@page{size:letter;margin:0}
body{font-size:14.5px}
.pg{width:8.5in;height:11in;padding:.5in .65in .62in}
.foot{padding:0 .65in .35in}
h2{font-size:40px}
:root{--bz:60px}
.blaze span{font-size:30px}
.job,.ask,.box,.tip,.say{padding:13px 16px}
.lv{padding:11px 14px}
.jobs,.split{margin-top:12px}
.trail{margin:10px 0 2px}
.lvlabel{margin-top:12px}
.cover h1{font-size:84px}
.cover h1.longtitle{font-size:68px}

.cover-in{flex:1;display:flex;flex-direction:column;text-align:center;max-width:none}
.cover .chips{justify-content:center}
.coverbody{flex:1;display:flex;flex-direction:column;justify-content:center;gap:.45in;margin-top:.15in}
.cover-trail{display:none}
.snap{order:1;width:5.4in;max-width:none;margin:0 auto;padding:14px 14px 16px;transform:rotate(1.5deg)}
.snap figcaption{font-size:14px;margin-top:10px}
.snap.tall{width:3.3in}
.htrail{order:2;display:flex;justify-content:space-between;list-style:none;position:relative;padding:0 .1in}
.htrail:before{content:'';position:absolute;left:.5in;right:.5in;top:19px;border-top:3px dotted var(--trail)}
.htrail .blaze.sm{width:40px;height:40px;border-radius:11px}.htrail .blaze.sm span{font-size:21px}
.htrail li{position:relative;display:flex;flex-direction:column;align-items:center;gap:10px;width:1.35in;text-align:center;font:600 15.5px/1.3 'DM Sans'}
.cover-trail{max-width:none;margin-top:0}
.tm-l{font-size:12.5px}
.jobs{grid-template-columns:1fr 1fr}
.split{grid-template-columns:1.25fr 1fr}
.levels{grid-template-columns:repeat(3,1fr)}
.biglevels{grid-template-columns:repeat(3,1fr)}
.tips{grid-template-columns:1fr 1fr}
.finish .split{grid-template-columns:1fr 1fr}
.eyebrow,.label,.jobl,.lvname{font-size:13px}
.who{font-size:12px}
.stop{width:28px;height:28px;font-size:12px}
.foot{font-size:11px}

.ideagrid{grid-template-columns:1fr 1fr;gap:14px}
.tips{grid-template-columns:repeat(auto-fit,minmax(0,1fr))}
.learns{grid-template-columns:1fr 1fr;column-gap:28px}
.refgrid{grid-template-columns:1fr 1fr}
.cardgrid{grid-template-columns:1fr 1fr;grid-auto-rows:1fr;gap:16px}
.cardpg{display:flex;flex-direction:column}.cardpg .cardgrid{flex:1;margin-bottom:.1in}
.cardpg .tcard{padding:20px 22px}.cardpg .tct{font-size:1.32em;line-height:1.4}.cardpg .tcname{font-size:1.3em}.cardpg .tcd{font-size:1.05em}.cardpg .tctheme{font-size:.78em}
.tcard{padding:18px 20px;gap:10px}.tchead{margin-bottom:4px}.tct{font-size:1.25em;line-height:1.42}.tcd{font-size:.95em}.learns div:nth-child(2){border-top:0;padding-top:2px}
.tips:has(.tip:nth-child(2):last-child) .tip{flex-direction:row;gap:12px}
.trouble dl{grid-template-columns:1fr 1fr;gap:10px 18px}
.photo{margin-top:0}
.photo img{height:1in;object-fit:cover}
.photo figcaption{font-size:.82em}
.starters{margin-top:12px}
.tip{flex-direction:column;gap:6px;padding:14px 16px}
.tip h3{font-size:.98em}
.ba{grid-template-columns:1fr auto 1fr}
.arrow{transform:none}
.start{display:none}
.note{padding:8px 11px}
.ticks li{margin-bottom:6px}
.pg > :is(.lead,.why,.role,.tryask,.tip2,.lvlabel,.box,.ideagrid,.levelsline,.tips,.example,.trouble,.cta,.donebox,.legal){margin-top:calc(var(--sp,1) * 13px)}
.pg > .ideagrid > .box{margin-top:0}
.trail{margin-top:calc(var(--sp,1) * 10px)}
.pg:not(.cover){padding-top:.7in;padding-bottom:.8in;display:flex;flex-direction:column;justify-content:center}
.pg:not(.cover) > *{flex:none}
.pg:not(.cover) .foot{padding-bottom:.4in}`;
}

// Ink-saving black and white: no filled backgrounds, outlines and black text.
function bwCss() {
  return `
:root{--paper:#fff;--paper2:#fff;--card:#fff;--ink:#000;--muted:#333;--forest:#000;--forest2:#555;--trail:#000;--gold:#000;--accent:#000;--soft:#fff;--l1:#fff;--l2:#fff;--l3:#fff}
html,body,.pg{background:#fff!important}
.topo,.cover-trail .tm-flag{display:none}
.cover{background:#fff}
.box,.job,.tip,.ask,.lv,.bl,.note{box-shadow:none!important;border:1.5px solid #000!important;background:#fff!important}
.job.kid,.job.you{border-left-width:5px!important}
.lv2{border-style:dashed!important}.lv3{border-width:2.5px!important}
.levelsline{border-color:#000}
.lvdots i{border:1.5px solid #000;background:#fff!important}.lvdots .lv3{background:#000!important}
.blaze{background:#fff;border:2.5px solid #000;box-shadow:none}.blaze span{color:#000}
.tm-blaze{fill:#fff;stroke:#000;stroke-width:2}.htrail:before{border-top-color:#000}.tm-n{fill:#000}.tm-path{stroke:#000}
.who{background:#fff!important;color:#000!important;border:1.5px solid #000}
.stop{border-color:#000;color:#000}.stop.done{background:#bbb;color:#000;border-color:#000}.stop.here{background:#000;color:#fff;border-color:#000}
.dash{border-top-color:#000}
.ticks li:before{background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 8.5l2.5 2.5L12 5.5' stroke='%23000' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") center/16px no-repeat;border:1.5px solid #000}
.dots li:before{background:#000}
.tipn{background:#fff;color:#000;border:2px solid #000}
.chips span{border-color:#000;color:#000}
.cta{background:#fff;color:#000;border:2px solid #000}.ctaurl{color:#000}
.brand img{filter:grayscale(1) contrast(1.4)}
.role,.tryask,.snap{background:#fff!important;border:1.5px solid #000;box-shadow:none!important}.role.kid,.role.you{border-left-width:5px}.tryask .rolel,.tip2 b{color:#000}.snap img{filter:grayscale(1)}.snap:before{background:#ccc}
.before,.after,.example,.glance div,.say,.trouble,.donebox{background:#fff!important;border:1.5px solid #000}.donetick{background:#000}.donebox b,.saylab,.glance span{color:#000}.photo img{filter:grayscale(1)}
.before,.after,.example{background:#fff!important;border:1.5px solid #000}.after{border-width:2.5px}
.before .tag,.after .tag{color:#000}.before li{text-decoration-color:#000}`;
}

// ─── The Future-Ready Skills Map: same design system, map-specific pages ───
export function buildMapHtml(g, mode, { bonus = false, review = false, tpt = false } = {}) {
  const bw = mode === 'print-bw';
  const layout = mode === 'phone' ? 'phone' : 'print';
  let pn = 1; // cover is page 1
  const foot = (label) => `<footer class="foot"><span>The Future-Ready Skills Map &middot; ${esc(label)}</span><span class="pnum">${++pn}</span></footer>`;
  // Page numbers are fixed by structure, so the contents page can list them up front.
  const o = tpt ? 1 : 0;
  const P = { welcome: 2 + o, toc: 3 + o, start: 4 + o, glance: 5 + o };
  let n0 = 6 + o; const bandStart = g.bands.map((b) => { const s0 = n0; n0 += b.pages.length + 2; return s0; });
  const closingPage = n0;
  const areaTag = (a) => `<span class="atag" style="--ac:${a.color}">${esc(a.name)}</span>`;

  const cover = `
<section class="pg cover map-cover" id="cover">
  ${contours()}
  <div class="cover-in">
    <div class="eyebrow">${esc(g.category)}</div>
    <h1>${esc(g.title)}</h1>
    <p class="tagline">${esc(g.tagline)}</p>
    <div class="chips">${g.chips.map((c) => `<span>${esc(c)}</span>`).join('')}</div>
    <div class="coverbody">
      <figure class="snap mapsnap"><img src="${img(g.photo.src)}" alt=""></figure>
      <div class="areadots">${g.areas.map((a) => `<span style="--ac:${a.color}">${esc(a.name)}</span>`).join('')}</div>
    </div>
  </div>
  <div class="brand"><img src="https://anywherelearning.co/email-anywhere-learning-wordmark.png" alt="Anywhere Learning"></div>
</section>`;

  const terms = tpt ? `
<section class="pg" id="terms">
  <div class="eyebrow">Thank you</div>
  <h2>Thank you for choosing this map</h2>
  <p class="lead blk">I'm Amelie, a former teacher of fifteen years and a homeschooling mom of two. I made this map for the question I hear most from parents: am I actually preparing my kid for real life? I hope it gives you a clear, calm picture of what matters at every age, and a few good ideas to start with this week.</p>
  <div class="box blk"><div class="label">Terms of use</div><p>This guide is for use by one family or one classroom. Please don't share, resell, or upload it, including to shared drives or websites.</p></div>
  <div class="box blk"><div class="label">If it helps you</div><p>A review on TPT means the world to a small shop like mine, and it helps other parents and teachers find it. I read every one.</p></div>
  ${foot('Thank you')}
</section>` : '';

  const welcome = `
<section class="pg">
  <div class="eyebrow">Welcome</div>
  <h2>Before you start</h2>
  ${g.welcome.map((p, i) => `<p class="${i === 0 ? 'lead big' : 'lead'} blk">${esc(p)}</p>`).join('')}
  <div class="box blk"><div class="label">A note about ages</div><p>${esc(g.agesNote)}</p></div>
  <div class="box blk"><div class="label">About the checkboxes</div><p>${esc(g.checkNote)}</p></div>
  <p class="legal blk">${esc(g.disclaimer)}</p>
  ${foot('Welcome')}
</section>`;

  const toc = `
<section class="pg" id="toc">
  <div class="eyebrow">Contents</div>
  <h2>Find your way</h2>
  <div class="toc blk">
    <a class="tocrow" href="#start"><span>Your first 10 minutes</span><i></i><b>${P.start}</b></a>
    <a class="tocrow" href="#glance"><span>The whole map on one page</span><i></i><b>${P.glance}</b></a>
  </div>
  ${g.bands.map((b, bi) => `
  <div class="tocband blk ${b.id}">
    <a class="tochead" href="#band-${b.id}"><span class="tlabel">${esc(b.label)}</span><span class="tname">${esc(b.name)}</span><b>${bandStart[bi]}</b></a>
    <div class="tocareas">${g.areas.map((ar, i) => `<a href="#${b.id}-${ar.slug}" style="--ac:${ar.color}"><span>${esc(ar.name)}</span><b>${bandStart[bi] + 1 + i}</b></a>`).join('')}
      <a href="#week-${b.id}"><span>What a week could look like</span><b>${bandStart[bi] + 13}</b></a></div>
  </div>`).join('')}
  <div class="toc blk"><a class="tocrow" href="#closing"><span>You're raising someone ready</span><i></i><b>${closingPage}</b></a></div>
  ${foot('Contents')}
</section>`;

  const start = `
<section class="pg" id="start">
  <div class="eyebrow">Start here</div>
  <h2>Your first 10 minutes</h2>
  <div class="startsteps blk">${g.start.map(([t, d], i) => `
    <div class="ss"><span class="tipn">${i + 1}</span><div><h3>${esc(t)}</h3><p>${esc(d)}</p></div></div>`).join('')}
  </div>
  <p class="why blk">${esc(g.startClose)}</p>
  ${foot('Start here')}
</section>`;

  const glance = `
<section class="pg" id="glance">
  <div class="eyebrow">At a glance</div>
  <h2>The whole map on one page</h2>
  <p class="why blk">Find your kid's column, read down, then turn to the areas you circle.</p>
  <div class="glancet blk">
    <div class="gh"></div><div class="gh">${esc(g.bands[0].label)}<b>${esc(g.bands[0].name)}</b></div><div class="gh">${esc(g.bands[1].label)}<b>${esc(g.bands[1].name)}</b></div>
    ${g.areas.map((a, i) => `<div class="ga" style="--ac:${a.color}">${esc(a.name)}</div><div class="gc">${esc(g.glance[i][0])}</div><div class="gc">${esc(g.glance[i][1])}</div>`).join('')}
  </div>
  ${foot('At a glance')}
</section>`;

  const bandPages = g.bands.map((b) => {
    const intro = `
<section class="pg bandintro ${b.id}" id="band-${b.id}">
  <div class="bandbanner"><span class="bblabel">${esc(b.label)}</span><span class="bbname">${esc(b.name)}</span></div>
  <h2>${esc(b.title)}</h2>
  ${b.intro.map((p) => `<p class="lead blk">${esc(p)}</p>`).join('')}
  <div class="focusbox blk"><div class="label">Focus over formality</div><p>If you only do three things consistently, make them:</p>
    <ol>${b.focus.map((f) => `<li>${esc(f)}</li>`).join('')}</ol></div>
  ${foot(b.label)}
</section>`;
    const areas = b.pages.map((p, i) => {
      const a = g.areas[i];
      return `
<section class="pg area" id="${b.id}-${a.slug}" style="--ac:${a.color}">
  <header class="areahead">
    <span class="abadge"></span>
    <div><div class="bandpill ${b.id}">${esc(b.label)} &middot; ${esc(b.name)}</div><div class="eyebrow">Area ${i + 1} of 12</div><h2>${esc(a.name)}</h2><p class="asub">${esc(p.subtitle)}</p></div>
  </header>
  <div class="blk"><div class="label">What to develop</div><ul class="dots">${p.develop.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
  <div class="box blk"><div class="label">${esc(b.by)}</div><ul class="checks">${p.looks.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
  <div class="blk"><div class="label">${esc(b.waysLabel)}</div><ul class="ways">${p.ways.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
  <div class="talk blk"><div class="label">Real talk${review && p.talkNew ? ' <span class="newflag">New, please review</span>' : ''}</div><p>${esc(p.talk)}</p></div>
  <div class="lib blk"><div class="label">${tpt ? "Related Anywhere Learning activities" : "In the library"}</div><div class="libchips">${p.library.map((x) => `<span>${esc(x)}</span>`).join('')}</div></div>
  ${foot(`${b.label} · ${a.name}`)}
</section>`;
    }).join('');
    const tag = (s) => s.split(' & ').length ? `<span class="wtag">${esc(s)}</span>` : '';
    const week = `
<section class="pg" id="week-${b.id}">
  <div class="bandpill ${b.id}">${esc(b.label)} &middot; ${esc(b.name)}</div>
  <h2>What a week could look like</h2>
  <p class="why blk">Not a schedule. Just a sketch of how these skills weave into everyday life.</p>
  <div class="week blk">${b.week.map(([d, m, mt, a, at]) => `
    <div class="wd">${esc(d)}</div>
    <div class="wc"><span class="wl">Morning</span>${esc(m)} ${tag(mt)}</div>
    <div class="wc"><span class="wl">Afternoon</span>${esc(a)} ${tag(at)}</div>`).join('')}
  </div>
  <div class="box blk"><div class="label">Weekend</div><p>${esc(b.weekend)}</p></div>
  <div class="focusbox blk"><div class="label">If you only do three things this week</div><ol>${b.focus.map((f) => `<li>${esc(f)}</li>`).join('')}</ol><p class="wclose">${esc(b.weekClose)}</p></div>
  ${foot(`${b.label} · A week`)}
</section>`;
    return intro + areas + week;
  }).join('');

  const closing = `
<section class="pg finish" id="closing">
  ${contours()}
  <div class="eyebrow">One last thing</div>
  <h2>You're raising someone ready</h2>
  ${g.closing.map((p) => `<p class="lead blk">${esc(p)}</p>`).join('')}
  ${tpt
    ? `<div class="box blk"><div class="label">Keep going</div><p>Every area in this map has hands-on activities in the Anywhere Learning Studio store, each with your job and your kid's job at every step.</p></div>`
    : bonus
    ? `<div class="cta blk"><p>${esc(g.cta)}</p><span class="ctaurl">${esc(g.ctaUrl)}</span></div>`
    : `<a class="donebox blk" href="${esc(g.memberUrl)}"><span class="donetick">&#10003;</span><span>${esc(g.memberClose)}</span><b>Open my trail &rarr;</b></a>`}
  <p class="legal blk">&copy; Anywhere Learning &middot; For your family's use. Please don't share, resell or upload this guide. &middot; anywherelearning.co</p>
  ${foot('The end')}
</section>`;

  const accent = '#bf7c48', soft = '#f6e9dc';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(g.title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
<style>${css(layout, accent, soft, bw)}${mapCss(layout, bw)}</style></head>
<body class="${layout}${bw ? ' bw' : ''}">${cover}${terms}${welcome}${toc}${start}${glance}${bandPages}${closing}</body></html>`;
}

function mapCss(layout, bw) {
  return `
.lead.big{font-size:1.12em;font-weight:500}
.pnum{font:800 13px 'Bricolage Grotesque';letter-spacing:0;color:var(--ink)}
.toc{display:grid;gap:2px}
.tocrow,.tocareas a,.tochead{display:flex;align-items:baseline;gap:8px;color:var(--ink);text-decoration:none}
.tocrow{padding:9px 2px;border-bottom:1px dotted rgba(93,125,83,.35);font-weight:700}
.tocrow i{flex:1}.toc b,.tocareas b,.tochead b{font:800 1em 'Bricolage Grotesque'}
.tocband{border-radius:16px;overflow:hidden;border:1px solid rgba(93,125,83,.2);background:var(--card)}
.tochead{padding:12px 16px;color:#fff;align-items:center}
.tocband.build .tochead{background:#4f8aa0}.tocband.apply .tochead{background:#bf7c48}
.tlabel{font:700 11px 'JetBrains Mono';letter-spacing:.12em;text-transform:uppercase}
.tname{flex:1;font:800 22px 'Bricolage Grotesque'}
.tochead b{font-size:18px}
.tocareas{display:grid;padding:8px 16px 10px}
.tocareas a{padding:5px 0;border-bottom:1px dotted rgba(93,125,83,.25);font-size:.95em}
.tocareas a span{flex:1;position:relative;padding-left:16px}
.tocareas a span:before{content:'';position:absolute;left:0;top:.42em;width:9px;height:9px;border-radius:3px;background:var(--ac,#999)}
.bandbanner{display:flex;flex-direction:column;border-radius:20px;padding:22px 26px;color:#fff;margin-bottom:26px}
.bandintro h2{margin:0 0 6px}
.bandintro h2 + .lead{margin-top:10px}
.bandintro.build .bandbanner{background:linear-gradient(135deg,#4f8aa0,#3f7187)}
.bandintro.apply .bandbanner{background:linear-gradient(135deg,#c98552,#a8683b)}
.bblabel{font:800 34px/1 'Bricolage Grotesque'}
.bbname{font:700 14px 'JetBrains Mono';letter-spacing:.3em;text-transform:uppercase;margin-top:8px;opacity:.9}
.bandpill{display:inline-block;align-self:flex-start;font:700 10.5px 'JetBrains Mono';letter-spacing:.1em;text-transform:uppercase;color:#fff;padding:4px 9px;border-radius:6px;margin-bottom:4px}
.bandpill.build{background:#4f8aa0}.bandpill.apply{background:#bf7c48}
.atag{display:inline-block;font:700 11px 'JetBrains Mono';letter-spacing:.06em;padding:3px 8px;border-radius:6px;background:var(--ac);color:#fff}
.areadots{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin-top:18px}
.areadots span{font:700 10.5px 'JetBrains Mono';letter-spacing:.05em;text-transform:uppercase;padding:5px 9px;border-radius:999px;background:var(--card);border:1.5px solid var(--ac);color:var(--ink)}
.mapsnap img{aspect-ratio:4/3;object-fit:cover}
.startsteps{display:grid;gap:12px}
.ss{display:flex;gap:14px;background:var(--card);border:1px solid rgba(93,125,83,.16);border-radius:16px;padding:14px 18px}
.ss h3{font-size:1.05em;margin-bottom:2px}
.glancet{display:grid;grid-template-columns:1.05fr 1.5fr 1.5fr;border-radius:14px;overflow:hidden;border:1px solid rgba(93,125,83,.2);background:var(--card)}
.gh{font:700 11px 'JetBrains Mono';letter-spacing:.1em;text-transform:uppercase;color:var(--muted);padding:9px 10px;background:var(--paper2)}
.gh b{display:block;font:800 15px 'Bricolage Grotesque';letter-spacing:0;text-transform:none;color:var(--ink)}
.ga{font:700 .86em 'DM Sans';color:var(--ink);padding:8px 10px;border-top:1px solid rgba(93,125,83,.14);border-left:5px solid var(--ac);display:flex;align-items:center}
.gc{font-size:.86em;line-height:1.35;padding:8px 10px;border-top:1px solid rgba(93,125,83,.14);border-left:1px solid rgba(93,125,83,.1)}
.focusbox{background:var(--forest);color:#fff;border-radius:16px;padding:16px 20px}
.focusbox .label{color:var(--gold)}.focusbox ol{margin:6px 0 0 20px}.focusbox li{margin:0 0 4px;font-weight:600}
.wclose{margin-top:8px;font-style:italic;color:#e8ecdf}
.areahead{display:flex;gap:14px;align-items:center}
.abadge{flex:none;width:52px;height:52px;border-radius:14px;background:var(--ac);transform:rotate(-4deg);box-shadow:0 3px 0 rgba(0,0,0,.12)}
.area h2{margin:2px 0 0;color:var(--ink)}
.asub{color:var(--ac);font-weight:700;margin-top:2px}
.area .eyebrow{color:var(--ac)}
.area .box{border-left:5px solid var(--ac)}
.checks li{position:relative;padding-left:28px;margin:0 0 8px}
.checks li:before{content:'';position:absolute;left:0;top:.2em;width:16px;height:16px;border:2px solid var(--ac);border-radius:4px;background:#fff}
.ways li{position:relative;padding-left:22px;margin:0 0 7px}
.ways li:before{content:'→';position:absolute;left:0;color:var(--ac);font-weight:700}
.talk{background:#fbf1dc;border-radius:16px;padding:14px 18px;border:1px dashed rgba(214,162,78,.7)}
.talk .label{color:#a9762f}.talk p{font-style:italic}
.newflag{font:700 9.5px 'JetBrains Mono';letter-spacing:.06em;background:#d0684a;color:#fff;padding:2px 6px;border-radius:4px;margin-left:6px;text-transform:uppercase}
.libchips{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.libchips span{display:flex;align-items:center;justify-content:center;text-align:center;font:600 .82em/1.25 'DM Sans';padding:7px 10px;border-radius:14px;background:var(--card);border:1.5px solid var(--ac)}
.week{display:grid;grid-template-columns:1.1in 1fr 1fr;gap:6px}
.week,.week + .box,.focusbox{width:100%;box-sizing:border-box;align-self:stretch}
.wd{font:800 15px 'Bricolage Grotesque';padding:10px 8px;background:var(--paper2);border-radius:10px;display:flex;align-items:center}
.wc{background:var(--card);border:1px solid rgba(93,125,83,.16);border-radius:10px;padding:9px 11px;font-size:.9em;line-height:1.4}
.wl{display:block;font:700 10px 'JetBrains Mono';letter-spacing:.1em;text-transform:uppercase;color:var(--trail);margin-bottom:2px}
.wtag{display:block;margin-top:4px;font:600 .82em 'DM Sans';color:var(--forest)}
${layout === 'phone' ? `
.glancet{grid-template-columns:1fr 1fr}.glancet .gh:first-child{display:none}.ga{grid-column:1/-1;background:var(--paper2)}
.week{grid-template-columns:1fr}.wd{margin-top:6px}` : `
.mapsnap{width:5.6in}
.areadots{max-width:6.4in;margin:.25in auto 0}
.blk{margin-top:calc(var(--sp,1) * 13px)}
.startsteps{gap:calc(var(--sp,1) * 12px)}
.ways{columns:2;column-gap:22px}.ways li{break-inside:avoid}
.bandbanner{padding:.4in .45in}.bblabel{font-size:56px}.bbname{font-size:18px}
.tocareas{grid-template-columns:1fr 1fr;column-gap:26px}
.tocband{margin-top:calc(var(--sp,1) * 10px)}`}
${bw ? `
.atag,.abadge{background:#fff!important;border:2px solid #000;color:#000}
.areadots span,.libchips span,.checks li:before{border-color:#000!important}
.ga{border-left-color:#000!important}
.focusbox{background:#fff;color:#000;border:2px solid #000}.focusbox .label{color:#000}.wclose{color:#000}
.talk{background:#fff;border-color:#000}.talk .label,.asub,.area .eyebrow,.ways li:before,.wl,.wtag{color:#000!important}
.area .box{border-left-color:#000!important}
.ss,.wc{border-color:#000}.wd,.gh{background:#eee}
.mapsnap img{filter:grayscale(1)}
.bandbanner,.tochead,.bandpill{background:#fff!important;color:#000!important;border:2.5px solid #000}
.tocareas a span:before{background:#fff;border:1.5px solid #000}` : ''}`;
}
