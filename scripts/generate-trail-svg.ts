/**
 * Generates public/product-shots/app-trail.svg — the faded trail illustration
 * behind the homepage hero.
 *
 * It is a flattened copy of the real member scene in
 * components/account/AdventureMapHome.tsx (Highland Peaks region), minus the
 * chrome and the activity card, plus two demo explorers standing on the trail.
 * The explorer art comes from lib/explorer-art.ts, so the figures on the
 * homepage are the same ones members build.
 *
 * Re-run after changing the member map so the two stay in step:
 *   npx tsx scripts/generate-trail-svg.ts
 */

import { writeFileSync } from 'fs';
import { explorerSVG, gearIconSVG } from '../lib/explorer-art';

const VW = 1600;
const VH = 1000;

const SANS = "system-ui,-apple-system,'Segoe UI',sans-serif";
const MONO = "ui-monospace,'SF Mono',Menlo,monospace";


// Highland Peaks palette, copied from REGIONS[1] in AdventureMapHome.tsx.
const C = {
  sky1: '#d4e6ef', sky2: '#eef4f4',
  hilltop: '#cdd3c6', hill: '#a7b4a4',
  hill2top: '#b8c2b6', hill2: '#8fa091',
  foresttop: '#6f8f77', forest: '#40614c',
  mtntop: '#bccad3', mtn: '#8598a3',
  water1: '#bfe0e6', water2: '#7fb6c0',
  sun1: '#eef1e9', sun2: '#e3ebe6', suncore: '#eef2ec',
  trail: '#bf7c48', // --am-trail
};

// TRAILS[0] ("steady climb") and TREES, both from AdventureMapHome.tsx.
const TRAIL: [number, number][] = [
  [150, 852], [292, 782], [430, 710], [560, 628], [674, 544], [784, 468],
  [888, 410], [996, 372], [1108, 350], [1232, 340], [1362, 336], [1500, 334],
];
const TREES: [number, number][] = [
  [120, 476], [192, 516], [70, 526], [1046, 616], [1116, 576], [1186, 636],
  [1298, 476], [300, 776], [1430, 696], [560, 820], [980, 670],
];

/** Same midpoint-quadratic smoothing the member map uses. */
function smooth(pts: [number, number][]) {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const xm = (pts[i][0] + pts[i + 1][0]) / 2;
    const ym = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q ${pts[i][0]} ${pts[i][1]} ${xm} ${ym}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L ${last[0]} ${last[1]}`;
}

/**
 * Which stop the family is standing on. Everything else is derived from it, the
 * same way the member map derives from `k`:
 *   TRAIL[0 .. K-1]  stops already reached (Elena stands on the last of them)
 *   TRAIL[K]         where the explorers stand ("you are here")
 *   TRAIL[K + 1]     the next stop, glowing
 *   TRAIL[K + 2 ..]  future stops, dashed outlines
 */
const K = 1;

const traveled = smooth(TRAIL.slice(0, K + 1));
const ahead = smooth(TRAIL.slice(K));

// Gear found on the legs already walked. Ids come from the real ID_ICON table
// in lib/explorer-art.ts, chosen to suit an outdoor leg.
const FINDS = [
  'find:map-scrap',
  'everyday:compass',
  'big:binoculars',
  'everyday:magnifying-glass',
];

function pine(x: number, y: number) {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="52" rx="24" ry="7" fill="rgba(50,40,20,.16)"/>` +
    `<path d="M0,-24 L-22,6 L22,6 Z" fill="${C.foresttop}"/>` +
    `<path d="M0,-8 L-26,30 L26,30 Z" fill="${C.forest}"/>` +
    `<path d="M0,4 L-30,44 L30,44 Z" fill="${C.foresttop}" opacity=".92"/>` +
    `<rect x="-4" y="42" width="8" height="12" rx="2" fill="#6f5433"/></g>`
  );
}

/**
 * One explorer standing on the trail: a white disc with a trail-coloured ring,
 * the real explorer art clipped inside it, and a soft ground shadow.
 */
function explorerPin(
  x: number,
  y: number,
  uid: string,
  avatar: { base: string; skin: string; hair: string; hairStyle: string; shirt: string },
  r: number,
  ring: string,
) {
  const inner = explorerSVG({
    base: avatar.base,
    skin: avatar.skin,
    hair: avatar.hair,
    hairStyle: avatar.hairStyle,
    shirt: avatar.shirt,
    uid,
    crop: 'full',
  })
    // Drop the fill-parent sizing and the existing preserveAspectRatio (setting
    // it twice makes the document invalid XML and kills the whole illustration)
    // so the figure can be placed as a nested svg.
    .replace(' style="display:block;width:100%;height:100%"', '')
    .replace(/\spreserveAspectRatio="[^"]*"/, '')
    .replace(
      '<svg ',
      `<svg x="${-r * 0.86}" y="${-r * 0.94}" width="${r * 1.72}" height="${r * 2.05}" preserveAspectRatio="xMidYMid meet" `,
    );

  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="${r + 6}" rx="${r * 0.72}" ry="${r * 0.17}" fill="rgba(50,40,20,.2)"/>` +
    `<circle r="${r}" fill="#fbf8f1" opacity=".96"/>` +
    `<clipPath id="clip-${uid}"><circle r="${r - 3}"/></clipPath>` +
    `<g clip-path="url(#clip-${uid})">${inner}</g>` +
    `<circle r="${r}" fill="none" stroke="${ring}" stroke-width="4.5"/>` +
    `</g>`
  );
}

/** A stop already reached, showing the gear found there (the map's `.am-find`). */
function findPin(x: number, y: number, gearId: string, uid: string) {
  const r = 29;
  const icon = gearIconSVG(gearId, uid)
    .replace(' style="display:block;width:100%;height:100%"', '')
    .replace('<svg ', `<svg x="${-r + 9}" y="${-r + 9}" width="${(r - 9) * 2}" height="${(r - 9) * 2}" `);
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="${r + 4}" rx="${r * 0.7}" ry="${r * 0.18}" fill="rgba(50,40,20,.18)"/>` +
    `<circle r="${r}" fill="rgba(247,242,232,.92)" stroke="rgba(255,255,255,.7)" stroke-width="2"/>` +
    icon +
    `</g>`
  );
}

/** The next stop: the map's pulsing flag dot (`.am-next`). */
function nextStopPin(x: number, y: number) {
  return (
    `<g transform="translate(${x},${y})">` +
    `<circle r="30" fill="url(#nextGlow)"/>` +
    `<circle r="13" fill="#d0684a" stroke="#ffffff" stroke-width="4"/>` +
    `</g>`
  );
}

/** A stop still ahead: dashed outline, matching the map's future pins. */
function futureStopPin(x: number, y: number) {
  return `<circle cx="${x}" cy="${y}" r="8" fill="none" stroke="rgba(50,40,20,.4)" stroke-width="2.5" stroke-dasharray="4 4"/>`;
}

/** The "You are here" tag that floats above the explorers on the real map. */
function youAreHere(x: number, y: number) {
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-84" y="-20" width="168" height="40" rx="20" fill="rgba(247,242,232,.88)" stroke="rgba(255,255,255,.6)" stroke-width="1.5"/>` +
    `<text x="0" y="7" text-anchor="middle" font-family="${MONO}" font-size="17" letter-spacing="1.4" fill="#2b2a26">You are here</text>` +
    `</g>`
  );
}

// Two demo explorers, matching the Liam/Elena pair in the member screenshots.
const liam = explorerPin(TRAIL[K][0], TRAIL[K][1], 'liam', {
  base: 'boy', skin: '#f2d3b3', hair: '#6f4a2f', hairStyle: 'short', shirt: '#588157',
}, 70, C.trail);

const elena = explorerPin(TRAIL[K - 1][0], TRAIL[K - 1][1], 'elena', {
  base: 'girl', skin: '#e5b48f', hair: '#3b2f27', hairStyle: 'bun', shirt: '#c4836a',
}, 60, 'rgba(255,255,255,.95)');

// Stops already reached, each showing what was found there.
const findPins = FINDS.slice(0, Math.max(0, K - 1))
  .map((g, i) => findPin(TRAIL[i][0], TRAIL[i][1], g, `find${i}`))
  .join('');
// The next stop, then everything still ahead of it.
const nextPin = nextStopPin(TRAIL[K + 1][0], TRAIL[K + 1][1]);
const futurePins = TRAIL.slice(K + 2).map(([x, y]) => futureStopPin(x, y)).join('');

const scene = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VW} ${VH}" width="${VW}" height="${VH}" role="img" aria-label="The Anywhere Learning trail map, with two explorers partway along the trail">
<title>Anywhere Learning trail map</title>
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.sky1}"/><stop offset="1" stop-color="${C.sky2}"/></linearGradient>
<linearGradient id="h1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.hilltop}"/><stop offset="1" stop-color="${C.hill}"/></linearGradient>
<linearGradient id="h2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.hill2top}"/><stop offset="1" stop-color="${C.hill2}"/></linearGradient>
<linearGradient id="fo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.foresttop}"/><stop offset="1" stop-color="${C.forest}"/></linearGradient>
<linearGradient id="mt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.mtntop}"/><stop offset="1" stop-color="${C.mtn}"/></linearGradient>
<linearGradient id="wa" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.water1}"/><stop offset="1" stop-color="${C.water2}"/></linearGradient>
<radialGradient id="nextGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="rgba(208,104,74,0.5)"/><stop offset=".68" stop-color="rgba(208,104,74,0)"/></radialGradient>
<radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.sun1}"/><stop offset=".55" stop-color="${C.sun2}"/><stop offset="1" stop-color="${C.sun2}" stop-opacity="0"/></radialGradient>
</defs>
<rect width="${VW}" height="${VH}" fill="url(#sky)"/>
<circle cx="1320" cy="150" r="150" fill="url(#sun)"/>
<circle cx="1320" cy="150" r="46" fill="${C.suncore}"/>
<path d="M0,330 L200,150 L360,330 Z" fill="url(#mt)" opacity=".55"/>
<path d="M250,330 L470,120 L520,190 L620,90 L800,330 Z" fill="url(#mt)" opacity=".8"/>
<path d="M470,120 L520,190 L558,152 Z" fill="#f4f0e6" opacity=".9"/>
<path d="M620,90 L664,150 L706,116 Z" fill="#f4f0e6" opacity=".9"/>
<path d="M0,300 Q400,234 820,292 Q1200,346 1600,282 L1600,1000 L0,1000 Z" fill="url(#h1)"/>
<path d="M0,300 Q400,234 820,292 Q1200,346 1600,282" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="6"/>
<path d="M0,430 Q380,364 760,418 Q1150,472 1600,408 L1600,1000 L0,1000 Z" fill="url(#h2)"/>
<path d="M0,560 Q420,480 900,538 Q1250,582 1600,518 L1600,1000 L0,1000 Z" fill="url(#fo)"/>
<path d="M-20,410 C220,470 250,650 470,700 C690,748 660,900 940,952" fill="none" stroke="url(#wa)" stroke-width="30" stroke-linecap="round" opacity=".92"/>
<path d="M-20,410 C220,470 250,650 470,700 C690,748 660,900 940,952" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="7" stroke-linecap="round"/>
${TREES.map(([x, y]) => pine(x, y)).join('')}
<path d="${traveled}" fill="none" stroke="${C.trail}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
<path d="${traveled}" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="${ahead}" fill="none" stroke="${C.trail}" stroke-width="9" stroke-linecap="round" stroke-dasharray="2 26" opacity=".7"/>
${findPins}
${futurePins}
${nextPin}
${elena}
${liam}
${youAreHere(TRAIL[K][0], TRAIL[K][1] - 108)}
</svg>
`;

const out = scene();
writeFileSync('public/product-shots/app-trail.svg', out);
console.log(`wrote public/product-shots/app-trail.svg (${(out.length / 1024).toFixed(1)} KB)`);
