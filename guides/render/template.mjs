// Builds the guide HTML from a content JSON. One template, two modes:
// 'phone' (single column, ~430px pages) and 'print' (US Letter).

import fs from 'node:fs';
import path from 'node:path';

// Local photos are inlined so the PDF never depends on the network.
const img = (src) => src.startsWith('http') ? src : `data:image/jpeg;base64,${fs.readFileSync(path.resolve(src)).toString('base64')}`;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Category accents. Add one line per category as guides move over.
export const ACCENTS = {
  'Writing & Communication': { accent: '#4f8aa0', soft: '#e3eff2' },
  default: { accent: '#bf7c48', soft: '#f6e9dc' },
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
  const { accent, soft } = ACCENTS[g.category] ?? ACCENTS.default;
  const n = g.steps.length;
  const foot = (label) => `<footer class="foot"><span>${esc(g.title)}</span><span>${esc(label)}</span></footer>`;

  const cover = `
<section class="pg cover">
  ${contours()}
  <div class="cover-in">
    <div class="eyebrow">${esc(g.category)}</div>
    <h1>${esc(g.title)}</h1>
    <p class="tagline">${esc(g.tagline)}</p>
    <div class="chips"><span>${esc(g.ages)}</span>${g.time ? `<span>${esc(g.time)}</span>` : ''}<span>Three levels</span></div>
    <div class="coverbody">
      ${coverTrail(g.steps)}
      <ol class="htrail">${g.steps.map((st, i) => `<li>${blaze(i + 1, 'sm')}<span>${esc(st.title)}</span></li>`).join('')}</ol>
      ${g.photo ? `<figure class="snap"><img src="${img(g.photo.src)}" alt="Two drawings of a stove"><figcaption>${esc(g.photo.caption)}</figcaption></figure>` : ''}
    </div>
  </div>
  <div class="brand"><img src="https://anywherelearning.co/email-anywhere-learning-wordmark.png" alt="Anywhere Learning"></div>
</section>`;

  const idea = `
<section class="pg">
  <div class="eyebrow">Before you start</div>
  <h2>The idea</h2>
  <p class="lead">${esc(g.goal)}</p>
  ${g.glance ? `<div class="glance">${g.glance.map((x) => `<div><span>${esc(x.k)}</span><b>${esc(x.v)}</b></div>`).join('')}</div>` : ''}
  <div class="ideagrid">
    <div class="box"><div class="label">What your kid will make</div>
      <ul class="ticks">${g.create.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></div>
    <div class="box"><div class="label">Skills your kid builds</div>
      <dl class="skills">${g.skills.map((s) => `<div><dt>${esc(s.name)}</dt><dd>${esc(s.text)}</dd></div>`).join('')}</dl></div>
  </div>
  <div class="box"><div class="label">What you need</div>
    <ul class="dots">${g.need.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></div>
  <div class="levelsline"><span class="lvdots"><i class="lv1"></i><i class="lv2"></i><i class="lv3"></i></span><p>${esc(g.levelsLine)}</p></div>
  ${foot('The idea')}
</section>`;

  const howto = `
<section class="pg">
  <div class="eyebrow">Your role</div>
  <h2>How to run it</h2>
  <p class="lead">${esc(g.howTo.intro)}</p>
  <div class="tips">${g.howTo.tips.map((t, i) => `
    <div class="tip"><span class="tipn">${i + 1}</span><div><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p></div></div>`).join('')}
  </div>
  ${g.howTo.example ? `
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
  <div class="start">Let's start.</div>
  ${foot('How to run it')}
</section>`;

  const steps = g.steps.map((s, i) => `
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
<style>${css(layout, accent, soft, bw)}</style></head>
<body class="${layout}${bw ? ' bw' : ''}">${cover}${idea}${howto}${steps}${finish}</body></html>`;
}

function css(mode, accent, soft, bw) {
  return `
:root{--paper:#f7f2e8;--paper2:#efe7d6;--card:#fffdf8;--ink:#32302a;--muted:#6b6152;--forest:#5d7d53;--forest2:#7d9c6d;--trail:#bf7c48;--gold:#d6a24e;--accent:${accent};--soft:${soft};
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
.skills{display:grid;gap:8px}.skills dt{font:700 1em 'DM Sans';color:var(--forest);display:inline}.skills dt:after{content:': '}.skills dd{display:inline;color:var(--ink)}
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

.cover-in{flex:1;display:flex;flex-direction:column;text-align:center;max-width:none}
.cover .chips{justify-content:center}
.coverbody{flex:1;display:flex;flex-direction:column;justify-content:center;gap:.45in;margin-top:.15in}
.cover-trail{display:none}
.snap{order:1;width:5.4in;max-width:none;margin:0 auto;padding:14px 14px 16px;transform:rotate(1.5deg)}
.snap figcaption{font-size:14px;margin-top:10px}
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
.skills{grid-template-columns:1fr 1fr}
.finish .split{grid-template-columns:1fr 1fr}
.eyebrow,.label,.jobl,.lvname{font-size:13px}
.who{font-size:12px}
.stop{width:28px;height:28px;font-size:12px}
.foot{font-size:11px}

.ideagrid{grid-template-columns:1fr 1fr;gap:14px}
.tips{grid-template-columns:repeat(3,1fr)}
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
