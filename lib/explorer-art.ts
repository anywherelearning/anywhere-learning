/**
 * Explorer art, ported from the Claude Design handoff
 * (Explorer gear layering system, July 2026). Storybook flat-vector explorer
 * with layered wearable gear, plus flat inventory icons for in-backpack gear.
 *
 * Pure SVG-string builders (framework-agnostic). The React components in
 * components/account/ExplorerAvatar.tsx render these via dangerouslySetInnerHTML.
 * The backpack-strap was intentionally dropped per Amelie's note.
 */

// ─── palette + helpers ───
function hx(c: string): number[] {
  c = c.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const n = parseInt(c, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(a: string, b: string, t: number): string {
  const A = hx(a), B = hx(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
const dk = (c: string, t = 0.14) => mix(c, '#2e2a20', t);
const lt = (c: string, t = 0.4) => mix(c, '#faf3e4', t);
const INK = '#3d4a38', CREAM = '#f2e7d3', GOLD = '#d4a373', GOLDL = '#e8c99a', GOLDD = '#b5803e', FOREST = '#588157', FORESTD = '#3d5c3b';

const HUM: Record<string, { skin: string; hair: string; style: string; shirt: string }> = {
  girl: { skin: '#e5b48f', hair: '#6f4a2f', style: 'ponytail', shirt: '#588157' },
  boy: { skin: '#c98d5f', hair: '#3b2f27', style: 'short', shirt: '#5b8fa8' },
};
const ANIMAL: Record<string, string> = { fox: '#c4836a', owl: '#7b88a8', bear: '#8b7355', rabbit: '#b8a89a', deer: '#c2a173', frog: '#7fa05e' };

const O = 'stroke="none"';
const Od = 'stroke="none"';
const sh = (d: string, fill: string, o = O) => `<path d="${d}" fill="${fill}" ${o}/>`;
const ci = (x: number, y: number, r: number, fill: string, o = O) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${o}/>`;
const el = (x: number, y: number, rx: number, ry: number, fill: string, o = O, tr = '') => `<ellipse ${tr} cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${o}/>`;
const rc = (x: number, y: number, w: number, h: number, r: number, fill: string, o = O) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${o}/>`;
const limbLn = (x1: number, y1: number, x2: number, y2: number, w: number, fill: string) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${fill}" stroke-width="${w}" stroke-linecap="round"/>`;
const strokeLn = (d: string, w: number, fill: string) => `<path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="round"/>`;
const tex = (x: number, y: number, rot: number, c: string) => `<g transform="translate(${x},${y}) rotate(${rot})" stroke="${c}" stroke-width="1.8" opacity="0.5" stroke-linecap="round" fill="none"><path d="M0,0 L7,-0.6"/><path d="M1.5,4 L9,3.6"/><path d="M0.5,8 L6,7.6"/></g>`;

const FOOT = 'M-13,-8 Q-18,-2 -16,4 Q-14,9 -6,9 L14,9 Q21,9 21,2 Q21,-5 12,-8 Q2,-11 -13,-8 Z';
const foot = (c: string) => sh(FOOT, c) + `<path d="M6,8 L6,3 M-1,8 L-1,4" stroke="${INK}" stroke-width="1.3" opacity="0.55"/>`;
function boot(shd: number): string {
  const s = (c: string) => (shd ? dk(c, shd) : c);
  return rc(-14, -30, 24, 32, 7, s('#6b5643'))
    + sh('M-14,-10 Q-19,-3 -17,5 Q-15,10 -6,10 L16,10 Q23,10 23,2 Q23,-6 13,-9 Q2,-12 -14,-10 Z', s('#6b5643'))
    + rc(-17, 6, 43, 8, 4, s('#3f362b'))
    + rc(-15.5, -32, 27, 10, 5, s(GOLDL))
    + `<circle cx="-2" cy="-17" r="2.3" fill="${s(GOLD)}"/><circle cx="-2" cy="-9" r="2.3" fill="${s(GOLD)}"/>`
    + `<path d="M-2,-17 L7,-19 M-2,-9 L8,-11" stroke="${INK}" stroke-width="1.3" opacity="0.6"/>`
    + tex(8, -4, -8, dk('#6b5643', 0.35));
}
/* Waterproof = a tall smooth rubber rain boot (wellington), a distinct
   silhouette from the laced hiking boot: no laces, rounded, taller shaft. */
function rainBoot(shd: number): string {
  const R = '#3f6e6f';
  const s = (c: string) => (shd ? dk(c, shd) : c);
  return rc(-14, -40, 25, 43, 11, s(R))
    + sh('M-14,-8 Q-21,0 -19,7 Q-17,12 -6,12 L19,12 Q26,12 26,2 Q26,-8 14,-10 Q2,-13 -14,-8 Z', s(R))
    + rc(-17, 8, 45, 7, 4, s('#2e5152'))
    + rc(-15, -42, 27, 8, 4, s('#5a9b9c'))
    + `<path d="M-13,-24 Q-2,-22 10,-24" stroke="${s('#5a9b9c')}" stroke-width="1.6" opacity="0.6" fill="none"/>`
    + tex(9, -6, -8, dk(R, 0.35));
}

function hairParts(style: string, hc: string): { back: string; front: string } {
  // Redrawn cleaner + more modern (July 2026), fitted to the head (center
  // 150,74 r38, 3/4 view facing right). Subtle root shading for depth.
  const root = dk(hc, 0.32);
  // A clean crown cap: volume over the scalp, a soft fringe sweeping right.
  const crown = 'M117,83 Q103,43 140,31 Q178,22 190,53 Q192,63 187,71 Q181,55 167,54 Q172,61 170,67 Q159,49 139,54 Q121,59 120,83 Q118,87 117,83 Z';
  const temple = sh('M120,83 Q117,58 139,54 Q123,60 122,83 Z', root);

  if (style === 'short')
    return { back: '', front: sh(crown, hc) + temple };

  if (style === 'bob')
    return {
      // A sleek chin-length bob: crown on top, a clean side fall to the jaw.
      back: sh('M110,60 Q105,111 137,112 Q127,95 126,72 Q124,50 149,47 Q118,48 110,60 Z', hc),
      front: sh('M115,88 Q103,42 150,32 Q192,36 190,74 Q184,55 169,54 Q173,61 171,67 Q159,49 138,53 Q122,58 120,88 Q117,92 115,88 Z', hc) + temple,
    };

  if (style === 'ponytail')
    return {
      back: sh('M121,49 Q93,59 89,92 Q87,111 104,110 Q96,98 101,81 Q106,63 129,57 Z', hc)
        + ci(101, 101, 10, hc) + ci(101, 101, 5, root),
      front: sh(crown, hc) + temple,
    };

  if (style === 'curls')
    return {
      back: ci(114, 63, 13, hc) + ci(120, 85, 12, hc) + ci(134, 99, 10, hc),
      front: ci(124, 47, 15, hc) + ci(146, 35, 17, hc) + ci(169, 42, 15, hc) + ci(185, 56, 11, hc)
        + ci(131, 52, 7, root) + ci(157, 41, 7, root),
    };

  // buns → a modern top-knot
  return {
    back: '',
    front: sh(crown, hc) + ci(125, 37, 13, hc) + ci(125, 37, 6, root),
  };
}

function head(o: { base: string; body: string; skin: string; hair: string; style: string }): string {
  const b = o.body, base = o.base;
  const eye = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="3.8" fill="${INK}"/><circle cx="${x + 1.3}" cy="${y - 1.3}" r="1.2" fill="#faf9f6"/>`;
  if (base === 'girl' || base === 'boy') {
    const h = hairParts(o.style, o.hair), sk = o.skin;
    return h.back
      + ci(150, 74, 38, sk)
      + ci(133, 81, 7.5, dk(sk, 0.14), Od)
      + `<path d="M186,72 Q195,79 187,87" fill="${sk}" ${Od}/>`
      + eye(166, 70)
      + `<path d="M159,58 Q166,54 173,58" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`
      + `<path d="M171,89 Q178,97 185,88 Q178,92 171,89 Z" fill="${dk(sk, 0.55)}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>`
      + `<circle cx="162" cy="88" r="5" fill="${mix(sk, '#c4836a', 0.5)}" opacity="0.8"/>`
      + (base === 'boy' ? `<circle cx="176" cy="80" r="1.1" fill="${dk(sk, 0.4)}"/><circle cx="181" cy="77" r="1.1" fill="${dk(sk, 0.4)}"/><circle cx="179" cy="83" r="1.1" fill="${dk(sk, 0.4)}"/>` :
        `<path d="M170,64 L174,61 M173,67 L178,65" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>`)
      + tex(126, 58, 20, dk(sk, 0.3))
      + h.front;
  }
  if (base === 'fox') return sh('M118,54 L106,10 Q130,18 140,42 Z', dk(b, 0.14))
    + sh('M142,44 L142,0 Q168,12 171,38 Z', b) + `<path d="M147,37 L147,13 Q159,20 162,33 Z" fill="${CREAM}" stroke="none"/>`
    + ci(146, 74, 36, b)
    + sh('M166,60 Q194,63 202,79 Q196,93 166,94 Z', b)
    + `<path d="M170,79 L200,79 Q194,92 170,93 Z" fill="${CREAM}" stroke="none"/>`
    + el(199, 77, 5.5, 4.5, INK, 'stroke="none"')
    + eye(160, 66)
    + `<path d="M153,57 Q160,54 166,57" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
    + `<circle cx="170" cy="86" r="1.1" fill="${INK}"/><circle cx="176" cy="85" r="1.1" fill="${INK}"/>`
    + tex(128, 84, 30, dk(b, 0.3));
  if (base === 'owl') return sh('M120,46 L112,20 L136,38 Z', dk(b, 0.14)) + sh('M150,40 L153,12 L172,36 Z', b)
    + ci(148, 76, 38, b)
    + ci(162, 72, 17, CREAM, Od)
    + `<circle cx="164" cy="72" r="9" fill="${GOLD}" stroke="none"/><circle cx="165" cy="72" r="5.5" fill="${INK}"/><circle cx="167" cy="70" r="1.6" fill="#faf9f6"/>`
    + `<path d="M150,58 Q158,54 166,57" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
    + sh('M182,78 L201,86 L180,94 Z', GOLDD, Od)
    + `<path d="M128,96 Q136,100 144,97 M124,88 Q131,92 138,89" stroke="${dk(b, 0.3)}" stroke-width="1.5" opacity="0.5" fill="none" stroke-linecap="round"/>`;
  if (base === 'bear') return ci(122, 46, 11, dk(b, 0.14)) + ci(158, 38, 11, b) + `<circle cx="158" cy="38" r="5.5" fill="${lt(b, 0.45)}" stroke="none"/>`
    + ci(148, 76, 37, b)
    + el(178, 86, 15, 12, CREAM)
    + el(187, 80, 5.5, 4.5, INK, 'stroke="none"')
    + `<path d="M180,91 Q185,95 191,90" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
    + eye(158, 66)
    + `<path d="M150,57 Q157,54 164,57" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
    + tex(128, 86, 25, dk(b, 0.3));
  if (base === 'rabbit') return `<g transform="rotate(-26 134 50)">${rc(126, -10, 16, 62, 8, dk(b, 0.14))}</g>`
    + `<g transform="rotate(-8 154 46)">${rc(146, -16, 17, 64, 8.5, b)}<rect x="150.5" y="-9" width="8" height="46" rx="4" fill="${mix(b, '#e8c99a', 0.55)}"/></g>`
    + ci(148, 76, 35, b)
    + sh('M179,76 L188,79 L180,83 Z', '#b07a70', Od)
    + `<path d="M172,90 Q176,95 182,89" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
    + eye(162, 68)
    + `<path d="M155,59 Q162,56 168,59" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
    + `<circle cx="160" cy="86" r="4.5" fill="${mix(b, '#c4836a', 0.45)}" opacity="0.8"/>`
    + `<circle cx="169" cy="83" r="1" fill="${INK}"/><circle cx="173" cy="86" r="1" fill="${INK}"/>`
    + tex(128, 80, 30, dk(b, 0.3));
  if (base === 'deer') return el(120, 52, 9, 17, dk(b, 0.12), O, 'transform="rotate(-42 120 52)"') + `<ellipse transform="rotate(-42 122 52)" cx="122" cy="52" rx="4.5" ry="10" fill="${CREAM}" stroke="none"/>`
    + strokeLn('M136,42 L130,16', 1.2, '#8b7355') + strokeLn('M130,26 L119,19', 1.2, '#8b7355') + strokeLn('M156,36 L154,10', 1.2, '#8b7355') + strokeLn('M154,20 L166,12', 1.2, '#8b7355')
    + ci(148, 76, 35, b)
    + el(179, 86, 13, 11, CREAM)
    + el(188, 81, 5, 4, INK, 'stroke="none"')
    + `<circle cx="128" cy="58" r="3" fill="${CREAM}" stroke="none"/><circle cx="120" cy="72" r="3" fill="${CREAM}" stroke="none"/><circle cx="134" cy="68" r="2.4" fill="${CREAM}" stroke="none"/>`
    + eye(160, 68)
    + `<path d="M164,63 L169,60 M167,67 L172,65" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>`
    + `<path d="M180,92 Q185,95 190,91" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  // frog
  return el(150, 82, 40, 31, b)
    + ci(138, 50, 10, b) + `<circle cx="139" cy="48" r="6" fill="${CREAM}" stroke="none"/><circle cx="141" cy="48" r="3" fill="${INK}"/>`
    + ci(166, 48, 12.5, b) + `<circle cx="167" cy="46" r="8" fill="${CREAM}" stroke="none"/><circle cx="170" cy="46" r="4" fill="${INK}"/><circle cx="171.5" cy="44.5" r="1.3" fill="#faf9f6"/>`
    + `<path d="M124,92 Q152,107 186,86" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`
    + `<circle cx="184" cy="72" r="1.8" fill="${INK}"/><circle cx="168" cy="95" r="4.5" fill="${mix(b, '#c4836a', 0.45)}" opacity="0.8"/>`
    + tex(126, 74, 25, dk(b, 0.35));
}

function tail(base: string, b: string): string {
  if (base === 'fox') return strokeLn('M114,204 Q76,206 68,170', 20, b) + ci(68, 169, 11, CREAM, Od);
  if (base === 'rabbit') return ci(112, 208, 11, CREAM);
  if (base === 'deer') return sh('M116,200 L94,210 L116,220 Z', b) + `<path d="M112,204 L100,210 L112,216 Z" fill="${CREAM}" stroke="none"/>`;
  if (base === 'bear') return ci(112, 208, 8, dk(b, 0.14));
  if (base === 'owl') return strokeLn('M118,200 L88,214', 7, dk(b, 0.14)) + strokeLn('M118,204 L90,226', 7, dk(b, 0.14));
  return '';
}

function pack(size: string): string {
  const body = FOREST, flap = FORESTD;
  if (size === 's') return rc(86, 150, 36, 54, 14, body)
    + sh('M86,166 Q86,150 100,150 L108,150 Q122,150 122,166 L122,172 L86,172 Z', flap)
    + rc(100, 166, 8, 12, 2.5, GOLD, Od) + tex(94, 186, 10, dk(body, 0.3));
  if (size === 'm') return rc(78, 136, 44, 76, 16, body)
    + sh('M78,154 Q78,136 96,136 L104,136 Q122,136 122,154 L122,164 L78,164 Z', flap)
    + rc(96, 156, 8, 14, 2.5, GOLD, Od) + rc(72, 176, 12, 24, 5, flap, Od) + tex(92, 190, 10, dk(body, 0.3));
  return rc(70, 92, 56, 20, 10, GOLDL) + `<path d="M84,92 L84,112 M112,92 L112,112" stroke="${FORESTD}" stroke-width="3.5"/>`
    + rc(72, 108, 52, 108, 18, body)
    + sh('M72,130 Q72,108 94,108 L102,108 Q124,108 124,130 L124,142 L72,142 Z', flap)
    + rc(86, 134, 8, 14, 2.5, GOLD, Od) + rc(104, 134, 8, 14, 2.5, GOLD, Od)
    + rc(66, 160, 13, 30, 6, flap, Od)
    + rc(80, 196, 36, 7, 3.5, GOLD, Od)
    + tex(88, 172, 10, dk(body, 0.3)) + tex(100, 186, 5, dk(body, 0.3));
}

const HAT = sh('M119,46 Q121,8 150,8 Q179,8 181,46 Z', GOLDL)
  + `<path d="M120,34 L180,34 L181,46 L119,46 Z" fill="${FOREST}" stroke="none"/>`
  + el(150, 46.5, 55, 9.5, GOLDL)
  + tex(132, 22, 15, dk(GOLDL, 0.3));
/* Two matched lenses (foreshortened far lens + full near lens) with a bridge
   and temple, for the 3/4 face, instead of one wide wraparound lens. */
const SHADES = `<rect x="136" y="60" width="18" height="19" rx="8" fill="#3a3227"/>
  <path d="M154,67 Q158,64 162,67" stroke="#3a3227" stroke-width="3.6" fill="none" stroke-linecap="round"/>
  <rect x="161" y="58" width="25" height="21" rx="9" fill="#3a3227"/>
  <path d="M186,63 Q190,61 191,68" stroke="#3a3227" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M166,63 Q172,61 178,63" stroke="#6b6152" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
const STICK = strokeLn('M191,152 L191,314', 5.5, '#8b7355')
  + ci(191, 149, 6.5, '#6b5643', Od)
  + rc(185.5, 206, 11, 16, 4, GOLD, Od)
  + `<path d="M191,168 L191,176 M191,240 L191,246" stroke="${dk('#8b7355', 0.35)}" stroke-width="1.5" opacity="0.6"/>`;
/* Rain jacket: a shell body with a centered zipper, a rolled-down hood
   bunched at the collar, chest pockets and a drawcord hem. Sleeve cuffs are
   drawn on the arms in the main render (see jack branch). */
function jacket(): string {
  const J = GOLD;
  return sh('M130,108 Q117,110 116,126 L113,206 Q112,228 132,228 L166,228 Q184,228 183,206 L180,126 Q179,110 166,108 Z', J)
    // far shoulder in shadow (3/4 turn)
    + sh('M133,108 Q112,110 113,132 Q102,124 105,112 Q110,100 133,102 Z', dk(J, 0.16))
    // rolled-down hood bunched around the neck
    + sh('M131,112 Q147,96 165,112 Q168,120 160,122 Q147,116 135,122 Q128,120 131,112 Z', dk(J, 0.22))
    + `<path d="M135,114 Q147,106 161,114" stroke="${dk(J, 0.42)}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`
    // centered zipper placket + teeth
    + `<path d="M147,120 L149,226" stroke="${dk(J, 0.28)}" stroke-width="4" fill="none" stroke-linecap="round"/>`
    + `<path d="M147,122 L149,224" stroke="${GOLDD}" stroke-width="1.5" stroke-dasharray="3.5 3" fill="none"/>`
    + rc(145.5, 150, 6, 9, 2.5, GOLDD, Od)
    // symmetric chest pockets with flaps
    + rc(124, 176, 20, 16, 4, dk(J, 0.13), Od)
    + `<path d="M124,182 L144,182" stroke="${dk(J, 0.34)}" stroke-width="1.6"/>`
    + rc(153, 176, 20, 16, 4, dk(J, 0.13), Od)
    + `<path d="M153,182 L173,182" stroke="${dk(J, 0.34)}" stroke-width="1.6"/>`
    // drawcord hem
    + `<path d="M118,220 Q147,230 178,220" stroke="${dk(J, 0.3)}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
    + tex(126, 200, 15, dk(J, 0.3));
}
/** Sleeve cuff band, drawn over a wrist at (x,y). */
function cuff(x: number, y: number): string {
  return rc(x - 8, y - 5, 16, 10, 4, dk(GOLD, 0.24), Od);
}

export interface ExplorerOpts {
  base: string;
  skin?: string;
  hair?: string;
  hairStyle?: string;
  shirt?: string; // human shirt colour
  body?: string; // animal / chosen colour
  gearIds?: string[];
  uid: string;
  crop?: 'full' | 'head';
}

/** Map owned gear ids to the figure's worn tokens. */
function wornTokens(ids: string[]): Set<string> {
  const has = (x: string) => ids.includes(x);
  const t = new Set<string>();
  if (has('big:hiking-boots') || has('big:waterproof-boots')) t.add('boots');
  if (has('everyday:sun-hat')) t.add('hat');
  if (has('everyday:sunglasses')) t.add('shades');
  if (has('big:walking-stick') || has('big:trekking-poles')) t.add('stick');
  if (has('big:rain-jacket') || has('big:warm-jacket')) t.add('jacket');
  if (has('big:expedition-pack')) t.add('pack-xl');
  else if (has('big:bigger-backpack')) t.add('pack-m');
  else if (has('big:backpack')) t.add('pack-s');
  return t;
}

const HAIRSTYLE_MAP: Record<string, string> = { short: 'short', bob: 'bob', ponytail: 'ponytail', curly: 'curls', bun: 'buns' };

/** The full-body (or head-cropped) explorer wearing its gear. Returns an <svg>. */
export function explorerSVG(o: ExplorerOpts): string {
  const base = o.base || 'girl';
  const human = base === 'girl' || base === 'boy';
  const d = human ? HUM[base] : null;
  const skin = o.skin || (d ? d.skin : '#e5b48f');
  const hair = o.hair || (d ? d.hair : '#3b2f27');
  const style = HAIRSTYLE_MAP[o.hairStyle || (d ? d.style : 'short')] || 'short';
  const shirt = o.shirt || (d ? d.shirt : FOREST);
  const body = o.body || ANIMAL[base] || ANIMAL.fox;
  const isHead = o.crop === 'head';
  const ids = o.gearIds ?? [];
  const gear = isHead ? new Set<string>() : wornTokens(ids);
  const has = (g: string) => gear.has(g);
  const rain = ids.includes('big:waterproof-boots'); // waterproof upgrade → distinct shape
  const bootFor = (shd: number) => (rain ? rainBoot(shd) : boot(shd));
  const packSize = has('pack-xl') ? 'xl' : has('pack-m') ? 'm' : has('pack-s') ? 's' : '';
  const limb = human ? skin : body, torsoC = human ? shirt : body;
  const jack = has('jacket');
  const armC = jack ? GOLD : limb;
  const SHORTS = '#7b6a54';

  let s = '';
  if (!isHead) {
    s += tail(base, body);
    s += limbLn(133, 140, 113, 190, 14, armC) + (jack ? cuff(113, 189) : '') + ci(112, 194, 8.5, limb, Od);
    if (packSize) s += pack(packSize);
    s += limbLn(133, 212, 110, 296, 19, limb);
    if (human) s += limbLn(133, 214, 124, 246, 23, SHORTS);
    s += `<g transform="translate(108,291) rotate(-14)">${has('boots') ? bootFor(0.12) : foot(limb)}</g>`;
    s += sh('M132,114 Q121,116 120,130 L117,206 Q116,222 132,223 L164,223 Q179,222 178,206 L175,130 Q174,116 163,114 Z', torsoC);
    if (!human && !jack) s += `<ellipse cx="151" cy="176" rx="20" ry="36" fill="${lt(body, 0.5)}" stroke="none"/>`;
    if (human && !jack) s += tex(128, 200, 15, dk(shirt, 0.3));
    if (jack) s += jacket();
    // (backpack strap intentionally omitted per design note)
    s += limbLn(147, 212, 176, 300, 19, limb);
    if (human) s += limbLn(147, 214, 158, 248, 23, SHORTS);
    s += `<g transform="translate(177,299)">${has('boots') ? bootFor(0) : foot(limb)}</g>`;
  }
  s += head({ base, body, skin, hair, style });
  if (!isHead) {
    if (has('shades')) s += SHADES;
    if (has('hat')) s += HAT;
    if (has('stick')) s += STICK;
    s += limbLn(159, 140, 184, 188, 14, armC) + (jack ? cuff(184, 187) : '') + ci(186, 193, 8.5, limb, Od);
  }

  const p = o.uid;
  // 2026 finish: crisp vector edges with a soft drop shadow for depth.
  // (Replaced the feTurbulence warp + grain that made the linework look wavy/soft.)
  const defs = `<defs><filter id="${p}" x="-14%" y="-6%" width="128%" height="118%">
    <feDropShadow dx="0" dy="3.5" stdDeviation="3.2" flood-color="#241c12" flood-opacity="0.16"/>
  </filter></defs>`;

  const viewBox = isHead ? '104 -4 108 128' : '0 0 260 340';
  const par = isHead ? 'xMidYMid meet' : 'xMidYMax meet';
  return `<svg viewBox="${viewBox}" preserveAspectRatio="${par}" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" style="display:block;width:100%;height:100%">${defs}<g filter="url(#${p})">${s}</g></svg>`;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

// ─── in-backpack item icons (48x48) ───
const F = '#588157', FD = '#3d5c3b', G = '#d4a373', GD = '#b5803e', GL = '#e8c99a', C = '#f2e7d3', K = '#3d4a38',
  BR = '#6b5643', E = '#8b7355', RB = '#5b8fa8', RBD = '#3f6e6f', TE = '#5a9b9c', RO = '#c47a8f', ROD = '#a05f74',
  LV = '#7a6da8', ST = '#a8a094', GY = '#9a938a', LM = '#9db86a';

const ICONS: Record<string, string> = {
  feather: `<path d="M12,40 Q8,22 20,11 Q32,3 36,8 Q40,14 30,28 Q22,37 12,40 Z" fill="${TE}"/><path d="M14,38 Q24,26 33,11" stroke="${C}" stroke-width="2" fill="none"/><path d="M20,30 L26,31 M24,24 L31,25 M28,18 L34,18" stroke="${C}" stroke-width="1.6"/>`,
  stone: `<ellipse cx="24" cy="28" rx="15" ry="11" fill="${ST}"/><path d="M15,23 Q22,17 31,20" stroke="${C}" stroke-width="2.2" fill="none" opacity="0.75"/>`,
  pinecone: `<path d="M24,10 L24,15" stroke="${BR}" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="24" cy="28" rx="11" ry="14" fill="${BR}"/><path d="M15,20 L33,26 M14,27 L34,32 M16,34 L32,38 M33,20 L15,26 M34,27 L14,32 M32,34 L16,38" stroke="#57452f" stroke-width="1.6"/>`,
  seashell: `<path d="M24,38 L11,22 Q10,10 24,10 Q38,10 37,22 Z" fill="${RO}"/><path d="M24,38 L17,13 M24,38 L24,11 M24,38 L31,13" stroke="${C}" stroke-width="1.8"/>`,
  acorn: `<ellipse cx="24" cy="29" rx="9" ry="11" fill="${GL}"/><path d="M13,22 Q13,14 24,14 Q35,14 35,22 Q30,25 24,25 Q18,25 13,22 Z" fill="${BR}"/><path d="M24,10 L24,14" stroke="${BR}" stroke-width="2.5" stroke-linecap="round"/>`,
  leaf: `<path d="M24,7 Q40,20 24,42 Q8,20 24,7 Z" fill="${F}"/><path d="M24,12 L24,38 M24,20 L31,25 M24,20 L17,25 M24,29 L30,33 M24,29 L18,33" stroke="${C}" stroke-width="1.6"/>`,
  flower: `<rect x="8" y="8" width="32" height="32" rx="3" fill="${C}"/><circle cx="24" cy="17" r="4.6" fill="${RO}"/><circle cx="30.5" cy="21.5" r="4.6" fill="${RO}"/><circle cx="28" cy="28.5" r="4.6" fill="${RO}"/><circle cx="20" cy="28.5" r="4.6" fill="${RO}"/><circle cx="17.5" cy="21.5" r="4.6" fill="${RO}"/><circle cx="24" cy="23" r="3.6" fill="${G}"/><path d="M24,29 Q23,35 24,39" stroke="${F}" stroke-width="2" fill="none"/>`,
  clover: `<circle cx="18.5" cy="18.5" r="6.5" fill="${F}"/><circle cx="29.5" cy="18.5" r="6.5" fill="${F}"/><circle cx="18.5" cy="29" r="6.5" fill="${F}"/><circle cx="29.5" cy="29" r="6.5" fill="${F}"/><path d="M25,31 Q30,38 27,43" stroke="${FD}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  crystal: `<path d="M24,6 L34,18 L29,40 L19,40 L14,18 Z" fill="${LV}"/><path d="M14,18 L24,22 L34,18 M24,22 L24,40" stroke="#a99ecb" stroke-width="1.8" fill="none"/>`,
  arrowhead: `<path d="M24,6 Q36,20 30,40 L26,36 L24,40 L22,36 L18,40 Q12,20 24,6 Z" fill="#7d7468"/><path d="M24,12 L24,34" stroke="#5f574c" stroke-width="1.6"/>`,
  marble: `<circle cx="24" cy="24" r="13" fill="${TE}"/><path d="M14,20 Q24,13 34,22 Q28,26 20,24 Q15,23 14,20 Z" fill="${C}" opacity="0.5"/><circle cx="19" cy="18" r="2.5" fill="#faf9f6" opacity="0.85"/>`,
  coin: `<circle cx="24" cy="24" r="13" fill="${G}"/><circle cx="24" cy="24" r="9.5" fill="none" stroke="${GD}" stroke-width="1.8"/><path d="M24,18 L25.8,22.2 L30,24 L25.8,25.8 L24,30 L22.2,25.8 L18,24 L22.2,22.2 Z" fill="${GD}"/>`,
  bottlecap: `<circle cx="24" cy="24" r="13" fill="none" stroke="${RBD}" stroke-width="4" stroke-dasharray="3 2.6"/><circle cx="24" cy="24" r="11" fill="${RB}"/><circle cx="24" cy="24" r="7.5" fill="${C}"/><path d="M20,26.5 L24,20 L28,26.5 Z" fill="${F}"/>`,
  sticker: `<rect x="10" y="10" width="26" height="26" rx="4" fill="${RO}"/><path d="M36,25 L36,36 L25,36 Z" fill="${C}"/><path d="M25,36 L36,25" stroke="${ROD}" stroke-width="1.6"/><circle cx="21" cy="21" r="5" fill="${C}"/>`,
  pin: `<circle cx="24" cy="21" r="11" fill="${G}"/><circle cx="24" cy="21" r="8.5" fill="${F}"/><path d="M18.5,24.5 L22.5,17.5 L25.5,24.5 Z M24.5,24.5 L27.5,19.5 L30,24.5 Z" fill="${C}"/><path d="M24,32 L24,40" stroke="${GY}" stroke-width="2.2"/>`,
  patch: `<path d="M11,11 L37,11 L37,26 Q37,38 24,42 Q11,38 11,26 Z" fill="${F}"/><path d="M14.5,14.5 L33.5,14.5 L33.5,26 Q33.5,35 24,38.4 Q14.5,35 14.5,26 Z" fill="none" stroke="${C}" stroke-width="1.6" stroke-dasharray="3 2.4"/><path d="M19,28 L24,18 L29,28 Z" fill="${G}"/><rect x="22.6" y="28" width="2.8" height="4" fill="${G}"/>`,
  keychain: `<circle cx="18" cy="15" r="7" fill="none" stroke="${GY}" stroke-width="3"/><circle cx="24" cy="23" r="2.6" fill="none" stroke="${GY}" stroke-width="2"/><g transform="rotate(12 30 33)"><rect x="23" y="25" width="14" height="16" rx="4" fill="${G}"/><circle cx="30" cy="29" r="1.6" fill="${GD}"/></g>`,
  sharktooth: `<path d="M15,13 Q24,9 33,13 L28,20 L24,40 L20,20 Z" fill="${C}"/><path d="M15,13 Q24,9 33,13" stroke="#b9ac97" stroke-width="3.4" stroke-linecap="round"/>`,
  fossil: `<circle cx="24" cy="24" r="14" fill="${ST}"/><path d="M24,24 Q29,24 29,19 Q29,14 23,14 Q16,14 16,22 Q16,31 25,32" fill="none" stroke="#6f665a" stroke-width="2.2" stroke-linecap="round"/>`,
  egg: `<path d="M24,8 Q35,20 35,29 Q35,40 24,40 Q13,40 13,29 Q13,20 24,8 Z" fill="#9fc4bc"/><circle cx="20" cy="24" r="1.5" fill="#5f8a80"/><circle cx="27" cy="29" r="1.5" fill="#5f8a80"/><circle cx="23" cy="33" r="1.3" fill="#5f8a80"/><circle cx="26" cy="18" r="1.3" fill="#5f8a80"/>`,
  bracelet: `<circle cx="24" cy="24" r="12" fill="none" stroke="${G}" stroke-width="5"/><circle cx="24" cy="12" r="3" fill="${F}"/><circle cx="35.4" cy="20.3" r="3" fill="${RO}"/><circle cx="31.1" cy="33.7" r="3" fill="${TE}"/><circle cx="16.9" cy="33.7" r="3" fill="${LV}"/><circle cx="12.6" cy="20.3" r="3" fill="${GD}"/>`,
  trailmix: `<path d="M14,17 L34,17 L36,37 Q24,42 12,37 Z" fill="${GL}"/><rect x="13" y="11" width="22" height="7" rx="3.5" fill="${G}"/><circle cx="20" cy="26" r="2.2" fill="${BR}"/><circle cx="27" cy="29" r="2.2" fill="${RO}"/><circle cx="22" cy="33" r="2" fill="${F}"/><circle cx="29" cy="23" r="1.8" fill="${GD}"/>`,
  bandana: `<rect x="8" y="14" width="32" height="6" rx="3" fill="${GD}"/><path d="M9,19 L39,19 L24,38 Z" fill="${G}"/><circle cx="20" cy="24" r="1.5" fill="${C}"/><circle cx="28" cy="24" r="1.5" fill="${C}"/><circle cx="24" cy="30" r="1.5" fill="${C}"/>`,
  glowstick: `<g transform="rotate(-32 24 24)"><rect x="20" y="10" width="8" height="28" rx="4" fill="${LM}"/><rect x="19" y="6" width="10" height="6" rx="2.4" fill="#778757"/></g><path d="M9,16 Q7,22 9,28 M39,20 Q41,26 39,32" stroke="${LM}" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.65"/>`,
  mapscrap: `<path d="M12,10 L36,12 L34,20 L38,28 L34,38 L14,36 L16,26 Z" fill="${C}"/><path d="M17,30 Q22,20 30,26" stroke="${GD}" stroke-width="1.8" fill="none" stroke-dasharray="3 2.4"/><path d="M29,23 L33,27 M33,23 L29,27" stroke="${F}" stroke-width="2.2" stroke-linecap="round"/>`,
  bottle: `<rect x="16" y="13" width="16" height="27" rx="6" fill="${F}"/><rect x="19" y="7" width="10" height="7" rx="2.5" fill="${FD}"/><rect x="16" y="22" width="16" height="8" fill="${C}"/><path d="M29,8 Q34,8 34,13" stroke="${FD}" stroke-width="2" fill="none"/>`,
  snackpouch: `<rect x="12" y="14" width="24" height="24" rx="5" fill="${G}"/><rect x="12" y="14" width="24" height="5.5" rx="2.7" fill="${GD}"/><path d="M14,22 L34,22" stroke="${GD}" stroke-width="1.6" stroke-dasharray="2.4 2"/><path d="M19,30 L24,26 L29,30" stroke="${C}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  gloves: `<path d="M11,36 L11,21 Q11,13 17,13 Q22,13 22,20 L22,36 Z" fill="${E}"/><path d="M11,26 Q5,24 6,19 Q8,15 12,19" fill="${E}"/><path d="M26,36 L26,21 Q26,13 32,13 Q37,13 37,20 L37,36 Z" fill="${RO}"/><path d="M37,26 Q43,24 42,19 Q40,15 36,19" fill="${RO}"/><rect x="11" y="33" width="11" height="4" rx="2" fill="#6f5a44"/><rect x="26" y="33" width="11" height="4" rx="2" fill="${ROD}"/>`,
  socks: `<path d="M14,8 L24,8 L24,22 Q24,30 17,32 Q10,34 9,28 Q8,23 13,22 L14,17 Z" fill="${C}"/><rect x="14" y="8" width="10" height="4" fill="${F}"/><rect x="14" y="13" width="10" height="3" fill="${G}"/><path d="M28,14 L38,14 L38,28 Q38,36 31,38 Q25,39 24,34 Q23,29 27,28 L28,23 Z" fill="#ddd0ba"/><rect x="28" y="14" width="10" height="4" fill="${FD}"/>`,
  flashlight: `<rect x="15" y="10" width="18" height="10" rx="3" fill="${GD}"/><rect x="19" y="20" width="10" height="20" rx="4" fill="${G}"/><circle cx="24" cy="25" r="1.8" fill="${GD}"/><path d="M11,8 L6,4 M24,6 L24,1 M37,8 L42,4" stroke="${GL}" stroke-width="2.2" stroke-linecap="round"/>`,
  magnifier: `<circle cx="21" cy="20" r="10" fill="#cfe0dc" stroke="${BR}" stroke-width="3.5"/><line x1="28.5" y1="27.5" x2="38" y2="37" stroke="${BR}" stroke-width="5" stroke-linecap="round"/><path d="M16,16 Q19,13 23,14" stroke="#faf9f6" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  notebook: `<rect x="13" y="9" width="22" height="30" rx="3" fill="${F}"/><rect x="13" y="9" width="6" height="30" fill="${FD}"/><line x1="31" y1="9" x2="31" y2="39" stroke="${GD}" stroke-width="2.4"/><rect x="21" y="15" width="8" height="7" rx="1" fill="${C}"/>`,
  pencils: `<g transform="rotate(8 24 24)"><rect x="13" y="12" width="5" height="22" fill="${G}"/><path d="M13,34 L18,34 L15.5,40 Z" fill="${GL}"/><rect x="20.5" y="10" width="5" height="22" fill="${F}"/><path d="M20.5,32 L25.5,32 L23,38 Z" fill="${GL}"/><rect x="28" y="12" width="5" height="22" fill="${RO}"/><path d="M28,34 L33,34 L30.5,40 Z" fill="${GL}"/></g>`,
  firstaid: `<rect x="19" y="9" width="10" height="6" rx="2.5" fill="${ROD}"/><rect x="11" y="13" width="26" height="23" rx="5" fill="${RO}"/><path d="M22,18 L26,18 L26,22 L30,22 L30,26 L26,26 L26,30 L22,30 L22,26 L18,26 L18,22 L22,22 Z" fill="${C}"/>`,
  bugspray: `<rect x="16" y="16" width="16" height="24" rx="4" fill="${TE}"/><rect x="19" y="9" width="8" height="8" rx="2" fill="${RBD}"/><rect x="16" y="24" width="16" height="7" fill="${C}"/><circle cx="33" cy="9" r="1.4" fill="${TE}"/><circle cx="37" cy="13" r="1.4" fill="${TE}"/><circle cx="34" cy="17" r="1.4" fill="${TE}"/>`,
  poncho: `<path d="M24,9 L41,35 L7,35 Z" fill="${RB}"/><circle cx="24" cy="12" r="4.6" fill="${RBD}"/><path d="M24,18 L24,32 M18,24 L18,33 M30,24 L30,33" stroke="${RBD}" stroke-width="1.8"/>`,
  mug: `<rect x="12" y="13" width="21" height="24" rx="4" fill="${C}"/><rect x="12" y="13" width="21" height="5.5" rx="2.7" fill="${F}"/><path d="M33,19 Q41,19 41,25.5 Q41,32 33,32" stroke="${F}" stroke-width="3.5" fill="none"/><circle cx="19" cy="26" r="1.2" fill="${F}"/><circle cx="26" cy="30" r="1.2" fill="${F}"/><circle cx="23" cy="23" r="1.2" fill="${F}"/>`,
  spork: `<ellipse cx="24" cy="13" rx="7" ry="8" fill="${G}"/><path d="M19,6 L19,11 M24,4 L24,10 M29,6 L29,11" stroke="${GD}" stroke-width="2" stroke-linecap="round"/><rect x="21.5" y="19" width="5" height="22" rx="2.5" fill="${G}"/>`,
  carabiner: `<rect x="13" y="9" width="22" height="30" rx="11" fill="none" stroke="${G}" stroke-width="5"/><line x1="35" y1="17" x2="35" y2="28" stroke="${GL}" stroke-width="4.6"/>`,
  watch: `<rect x="19" y="5" width="10" height="38" rx="4" fill="${F}"/><circle cx="24" cy="24" r="10.5" fill="${C}" stroke="${GD}" stroke-width="2.6"/><path d="M24,24 L24,17.5 M24,24 L28.5,26.5" stroke="${K}" stroke-width="2" stroke-linecap="round"/>`,
  mirror: `<rect x="20" y="9" width="8" height="5" rx="2.4" fill="${ROD}"/><circle cx="24" cy="26" r="12.5" fill="${RO}"/><circle cx="24" cy="26" r="8.6" fill="#cfe0dc"/><path d="M20,23 L27,30" stroke="#faf9f6" stroke-width="2.4" stroke-linecap="round" opacity="0.8"/>`,
  whistle: `<circle cx="13" cy="15" r="3.6" fill="none" stroke="${GD}" stroke-width="2"/><rect x="17" y="14" width="21" height="9" rx="4" fill="${G}"/><circle cx="21" cy="27" r="9.5" fill="${G}"/><circle cx="22" cy="28" r="3.2" fill="${GD}"/><path d="M33,23 L38,30" stroke="${G}" stroke-width="6" stroke-linecap="round"/>`,
  compass: `<circle cx="24" cy="24" r="14" fill="${G}"/><circle cx="24" cy="24" r="10.5" fill="${C}"/><path d="M24,15.5 L27,24 L24,24 Z" fill="${RO}"/><path d="M24,15.5 L21,24 L24,24 Z" fill="${ROD}"/><path d="M24,32.5 L27,24 L21,24 Z" fill="${GY}"/><circle cx="24" cy="24" r="1.8" fill="${GD}"/>`,
  tent: `<path d="M24,10 L44,37 L4,37 Z" fill="${F}"/><path d="M24,10 L24,37" stroke="${FD}" stroke-width="2"/><path d="M24,19 L31,37 L17,37 Z" fill="${C}"/><path d="M24,10 L20,5 M24,10 L28,5" stroke="${BR}" stroke-width="2" stroke-linecap="round"/>`,
  sleepingbag: `<path d="M13,12 Q13,7 19,7 L29,7 Q35,7 35,12 L31,36 Q30,41 24,41 Q18,41 17,36 Z" fill="${RO}"/><ellipse cx="24" cy="13" rx="7" ry="4.6" fill="${ROD}"/><ellipse cx="24" cy="13" rx="3.8" ry="2.4" fill="${C}"/><path d="M32,16 L28.5,38" stroke="${ROD}" stroke-width="2" stroke-dasharray="2.6 2"/><circle cx="28.3" cy="38.5" r="1.7" fill="${ROD}"/>`,
  sleepingpad: `<rect x="7" y="17" width="31" height="14" rx="7" fill="${TE}"/><ellipse cx="38" cy="24" rx="5.5" ry="7" fill="#3f6e6f"/><ellipse cx="38" cy="24" rx="2.4" ry="3.2" fill="${C}"/><rect x="17" y="15" width="6" height="18" rx="3" fill="${GD}"/><rect x="18.6" y="15" width="2.8" height="18" fill="${G}"/>`,
  binoculars: `<rect x="9" y="14" width="13" height="20" rx="5.5" fill="${FD}"/><rect x="26" y="14" width="13" height="20" rx="5.5" fill="${FD}"/><rect x="20" y="18" width="8" height="7" fill="${FD}"/><circle cx="15.5" cy="31" r="4.6" fill="#9fb6b0"/><circle cx="32.5" cy="31" r="4.6" fill="#9fb6b0"/><rect x="12" y="10" width="7" height="5" rx="2.4" fill="${GD}"/><rect x="29" y="10" width="7" height="5" rx="2.4" fill="${GD}"/>`,
  headlamp: `<circle cx="24" cy="25" r="13" fill="none" stroke="${G}" stroke-width="5"/><rect x="27" y="16" width="13" height="12" rx="3" fill="${FD}"/><circle cx="33.5" cy="22" r="3.6" fill="${GL}"/><path d="M42,14 L46,10 M44,22 L48,22" stroke="${GL}" stroke-width="2.2" stroke-linecap="round"/>`,
  canteen: `<rect x="21" y="6" width="6" height="7" rx="2" fill="${BR}"/><rect x="22" y="12" width="4" height="4" fill="${E}"/><circle cx="24" cy="28" r="13" fill="${E}"/><circle cx="24" cy="28" r="8" fill="none" stroke="${C}" stroke-width="2"/><path d="M12,20 Q7,15 10,9" stroke="${BR}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  rope: `<circle cx="24" cy="27" r="12" fill="none" stroke="${G}" stroke-width="7"/><circle cx="24" cy="27" r="12" fill="none" stroke="${GD}" stroke-width="7" stroke-dasharray="2 7"/><rect x="20" y="9" width="8" height="10" rx="2.6" fill="${BR}"/>`,
  stove: `<path d="M24,8 Q31,15 24,22 Q17,15 24,8 Z" fill="${G}"/><path d="M24,12 Q27.4,15.5 24,19.4 Q20.6,15.5 24,12 Z" fill="${RO}"/><rect x="15" y="22" width="18" height="4.6" rx="2.3" fill="#5f574c"/><rect x="13" y="26" width="22" height="12" rx="3" fill="#7d7468"/><circle cx="31" cy="32" r="2.2" fill="${G}"/>`,
  pot: `<circle cx="24" cy="10.5" r="2.6" fill="#5f574c"/><rect x="10" y="13" width="28" height="5.5" rx="2.7" fill="#5f574c"/><rect x="12" y="18" width="24" height="18" rx="4" fill="#7d7468"/><path d="M6,23 L12,23 M36,23 L42,23" stroke="#5f574c" stroke-width="3.4" stroke-linecap="round"/>`,
  fishingrod: `<line x1="10" y1="41" x2="36" y2="7" stroke="${BR}" stroke-width="3.4" stroke-linecap="round"/><circle cx="17" cy="32" r="4" fill="${GD}"/><circle cx="17" cy="32" r="1.6" fill="${C}"/><path d="M36,7 Q41,16 38,25 Q38,29 34.6,28 Q33,27 34.6,25" stroke="${K}" stroke-width="1.5" fill="none"/>`,
  camera: `<rect x="14" y="11" width="9" height="6" rx="2" fill="${RBD}"/><rect x="9" y="15" width="30" height="22" rx="5" fill="${TE}"/><circle cx="24" cy="26" r="7.5" fill="${RBD}"/><circle cx="24" cy="26" r="4" fill="#cfe0dc"/><circle cx="34" cy="20" r="1.8" fill="${GL}"/>`,
  lantern: `<path d="M18,10 Q24,3 30,10" stroke="${GD}" stroke-width="2.5" fill="none"/><rect x="14" y="10" width="20" height="4.6" rx="2.3" fill="${GD}"/><rect x="16" y="14" width="16" height="19" rx="3" fill="${G}"/><rect x="19" y="17" width="10" height="13" rx="2" fill="${GL}"/><circle cx="24" cy="23.5" r="2.6" fill="${RO}"/><rect x="13" y="33" width="22" height="5" rx="2.5" fill="${GD}"/>`,
  spyglass: `<g transform="rotate(-25 24 24)"><rect x="7" y="19" width="14" height="11" rx="3.4" fill="${BR}"/><rect x="21" y="20.5" width="11" height="8" rx="2.8" fill="${G}"/><rect x="32" y="22" width="9" height="5.5" rx="2.2" fill="${GD}"/></g><circle cx="9" cy="17" r="2" fill="#cfe0dc"/>`,
  multitool: `<path d="M31,20 L39,9 L42,12 L34,21 Z" fill="${GY}"/><rect x="12" y="18" width="24" height="14" rx="6" fill="${RO}"/><path d="M22.4,21.5 L25.6,21.5 L25.6,23.4 L27.5,23.4 L27.5,26.6 L25.6,26.6 L25.6,28.5 L22.4,28.5 L22.4,26.6 L20.5,26.6 L20.5,23.4 L22.4,23.4 Z" fill="${C}"/>`,
  hammock: `<path d="M9,15 Q24,32 39,15 L39,19 Q24,37 9,19 Z" fill="${F}"/><path d="M9,16 L5,10 M39,16 L43,10" stroke="${BR}" stroke-width="2.4" stroke-linecap="round"/><circle cx="5" cy="9" r="2" fill="${BR}"/><circle cx="43" cy="9" r="2" fill="${BR}"/><path d="M14,22 Q24,32 34,22" stroke="${FD}" stroke-width="1.8" fill="none"/>`,
  waterfilter: `<rect x="15" y="8" width="18" height="10" rx="3" fill="${RBD}"/><rect x="18" y="18" width="12" height="22" rx="5" fill="${RB}"/><path d="M21,24 L27,24 M21,29 L27,29 M21,34 L27,34" stroke="#cfe0dc" stroke-width="1.8"/><path d="M37,22 Q39,25 37,27 Q35,25 37,22 Z M39,30 Q41,33 39,35 Q37,33 39,30 Z" fill="${TE}"/>`,
  drybag: `<rect x="12" y="8" width="24" height="7" rx="3.5" fill="${GD}"/><rect x="21" y="5" width="6" height="5" rx="2" fill="${C}"/><path d="M14,15 L34,15 Q36,26 35,33 Q34,41 24,41 Q14,41 13,33 Q12,26 14,15 Z" fill="${G}"/><path d="M14,22 L34,22 M13.4,29 L34.6,29" stroke="${GL}" stroke-width="1.8" opacity="0.8"/>`,
  grapplinghook: `<circle cx="24" cy="9" r="4" fill="none" stroke="#7d7468" stroke-width="2.6"/><line x1="24" y1="13" x2="24" y2="29" stroke="#7d7468" stroke-width="4"/><path d="M24,30 Q10,30 12,17 M24,30 Q38,30 36,17 M24,29 L24,36" stroke="#7d7468" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M28,9 Q38,11 37,21" stroke="${G}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  // worn gear, small icons for the inventory grid
  sunhat: `<ellipse cx="24" cy="30" rx="18" ry="5" fill="${GL}"/><path d="M13,30 Q13,12 24,12 Q35,12 35,30 Z" fill="${G}"/><path d="M13,28 Q24,32 35,28" stroke="${GD}" stroke-width="2.5" fill="none"/>`,
  shades: `<rect x="7" y="18" width="15" height="11" rx="5" fill="#3a3227"/><rect x="26" y="18" width="15" height="11" rx="5" fill="#3a3227"/><path d="M22,21 Q24,19 26,21" stroke="#3a3227" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  bootsicon: `<path d="M17,9 L26,9 L26,28 Q34,29 39,33 Q42,35 42,39 L17,39 Z" fill="${BR}"/><rect x="15" y="36" width="29" height="5" rx="2.5" fill="#3f362b"/><path d="M20,15 L25,15 M20,20 L25,20" stroke="${GL}" stroke-width="2"/>`,
  rainbootsicon: `<path d="M17,8 L27,8 L27,28 Q36,29 40,34 Q42,36 42,39 L17,39 Z" fill="${RBD}"/><rect x="15" y="36" width="29" height="5" rx="2.5" fill="#2e5152"/><rect x="17" y="14" width="10" height="4" fill="${TE}"/>`,
  jacketicon: `<path d="M16,13 L24,17 L32,13 Q37,14 37,20 L35,37 Q35,40 31,40 L17,40 Q13,40 13,37 L11,20 Q11,14 16,13 Z" fill="${G}"/><line x1="24" y1="17" x2="24" y2="40" stroke="${GD}" stroke-width="2" stroke-dasharray="3 2"/>`,
  stickicon: `<line x1="16" y1="42" x2="32" y2="8" stroke="${E}" stroke-width="4" stroke-linecap="round"/><rect x="26" y="16" width="9" height="6" rx="3" fill="${G}"/>`,
  packicon: `<rect x="14" y="15" width="20" height="25" rx="6" fill="${F}"/><path d="M14,23 Q14,15 20,15 L28,15 Q34,15 34,23 Z" fill="${FD}"/><rect x="21" y="25" width="6" height="9" rx="2" fill="${G}"/><path d="M18,15 Q18,9 24,9 Q30,9 30,15" stroke="${FD}" stroke-width="3" fill="none"/>`,
};

/** Gear id → icon name. */
const ID_ICON: Record<string, string> = {
  'find:feather': 'feather', 'find:smooth-stone': 'stone', 'find:pinecone': 'pinecone', 'find:seashell': 'seashell',
  'find:acorn': 'acorn', 'find:cool-leaf': 'leaf', 'find:pressed-flower': 'flower', 'find:four-leaf-clover': 'clover',
  'find:crystal': 'crystal', 'find:arrowhead': 'arrowhead', 'find:marble': 'marble', 'find:lucky-coin': 'coin',
  'find:bottle-cap': 'bottlecap', 'find:sticker': 'sticker', 'find:enamel-pin': 'pin', 'find:patch': 'patch',
  'find:keychain': 'keychain', 'find:shark-tooth': 'sharktooth', 'find:fossil': 'fossil', 'find:robin-s-egg': 'egg',
  'find:friendship-bracelet': 'bracelet', 'find:trail-mix': 'trailmix', 'find:bandana': 'bandana', 'find:glow-stick': 'glowstick', 'find:map-scrap': 'mapscrap',
  'everyday:water-bottle': 'bottle', 'everyday:snack-pouch': 'snackpouch', 'everyday:sun-hat': 'sunhat', 'everyday:sunglasses': 'shades',
  'everyday:gloves': 'gloves', 'everyday:wool-socks': 'socks', 'everyday:flashlight': 'flashlight', 'everyday:magnifying-glass': 'magnifier',
  'everyday:notebook': 'notebook', 'everyday:pencil-set': 'pencils', 'everyday:first-aid-pouch': 'firstaid', 'everyday:bug-spray': 'bugspray',
  'everyday:rain-poncho': 'poncho', 'everyday:camp-mug': 'mug', 'everyday:spork': 'spork', 'everyday:carabiner': 'carabiner',
  'everyday:wristwatch': 'watch', 'everyday:pocket-mirror': 'mirror', 'everyday:whistle': 'whistle', 'everyday:compass': 'compass',
  'big:backpack': 'packicon', 'big:bigger-backpack': 'packicon', 'big:expedition-pack': 'packicon',
  'big:hiking-boots': 'bootsicon', 'big:waterproof-boots': 'rainbootsicon', 'big:rain-jacket': 'jacketicon', 'big:warm-jacket': 'jacketicon',
  'big:tent': 'tent', 'big:sleeping-bag': 'sleepingbag', 'big:sleeping-pad': 'sleepingpad', 'big:binoculars': 'binoculars',
  'big:headlamp': 'headlamp', 'big:canteen': 'canteen', 'big:walking-stick': 'stickicon', 'big:trekking-poles': 'stickicon',
  'big:climbing-rope': 'rope', 'big:camp-stove': 'stove', 'big:cook-pot': 'pot', 'big:fishing-rod': 'fishingrod',
  'big:camera': 'camera', 'big:lantern': 'lantern', 'big:spyglass': 'spyglass', 'big:multi-tool': 'multitool',
  'big:hammock': 'hammock', 'big:water-filter': 'waterfilter', 'big:dry-bag': 'drybag', 'big:grappling-hook': 'grapplinghook',
};

/** A 48x48 inventory icon for a gear id. `uid` makes the texture filter unique. */
export function gearIconSVG(gearId: string, uid: string, muted = false): string {
  const name = ID_ICON[gearId];
  const body = name ? ICONS[name] : '';
  // 2026 finish: crisp vector icons (removed the feTurbulence warp that softened them).
  void uid;
  const op = muted ? ' opacity="0.4"' : '';
  return `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" style="display:block;width:100%;height:100%"${op}><g>${body}</g></svg>`;
}
