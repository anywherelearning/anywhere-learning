/**
 * Explorer art, v2 (Sept 2026 redesign): chunky, friendly sticker-style
 * explorers with one outline weight, a round head and a real face. Earned gear
 * layers on piece by piece and takes on the kid's own colours (jacket, hat
 * band), so a fully kitted explorer still looks like *their* explorer.
 *
 * Pure SVG-string builders (framework-agnostic). The React components in
 * components/account/ExplorerAvatar.tsx render these via dangerouslySetInnerHTML.
 * Gear icons live in ./gear-art (re-exported below as gearIconSVG).
 *
 * Coordinates: a 200x260 box, explorer facing right, feet on y≈244.
 */

import { gearStickerSVG } from './gear-art';

// ─── palette + helpers ───
function hx(c: string): number[] {
  c = c.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const n = parseInt(c, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function mix(a: string, b: string, t: number): string {
  const A = hx(a), B = hx(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
const dk = (c: string, t = 0.22) => mix(c, '#1d1a14', t);
const lt = (c: string, t = 0.35) => mix(c, '#fffaf0', t);

const INK = '#3b3226';
const SW = 3.2; // one outline weight for everything

const HUM: Record<string, { skin: string; hair: string; style: string; shirt: string }> = {
  girl: { skin: '#e5b48f', hair: '#6f4a2f', style: 'ponytail', shirt: '#588157' },
  boy: { skin: '#c98d5f', hair: '#3b2f27', style: 'short', shirt: '#5b8fa8' },
};
const ANIMAL: Record<string, string> = { fox: '#d9824a', owl: '#7b88a8', bear: '#8b6a4f', rabbit: '#c2b2a4', deer: '#c2956a', frog: '#7fa05e' };

const shape = (d: string, fill: string, extra = '') =>
  `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
const circ = (cx: number, cy: number, r: number, fill: string, w = SW) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${INK}" stroke-width="${w}"/>`;
const ell = (cx: number, cy: number, rx: number, ry: number, fill: string, w = SW, extra = '') =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${INK}" stroke-width="${w}" ${extra}/>`;
const line = (d: string, w: number, c = INK, extra = '') =>
  `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
/** A thick limb: an outlined round-capped stroke. */
const limb = (d: string, w: number, fill: string) => line(d, w + SW * 2, INK) + line(d, w, fill);

// ─── worn gear ───
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

/** Map owned gear ids to the pieces the figure wears. */
function wornTokens(ids: string[]): Set<string> {
  const has = (x: string) => ids.includes(x);
  const t = new Set<string>();
  if (has('big:waterproof-boots')) t.add('rainboots');
  else if (has('big:hiking-boots')) t.add('boots');
  if (has('everyday:sun-hat')) t.add('hat');
  if (has('everyday:sunglasses')) t.add('shades');
  if (has('big:trekking-poles')) t.add('poles');
  else if (has('big:walking-stick')) t.add('stick');
  if (has('big:rain-jacket')) t.add('raincoat');
  else if (has('big:warm-jacket')) t.add('puffer');
  if (has('find:bandana')) t.add('bandana');
  if (has('big:headlamp')) t.add('headlamp');
  if (has('big:binoculars')) t.add('binoculars');
  if (has('big:expedition-pack')) t.add('pack-xl');
  else if (has('big:bigger-backpack')) t.add('pack-m');
  else if (has('big:backpack')) t.add('pack-s');
  return t;
}

/* Where the eyes sit per base (for sunglasses) and how far to lift the hat. */
const EYES: Record<string, { l: number; r: number; y: number; hat: number }> = {
  human: { l: 116, r: 136, y: 80, hat: 0 },
  fox: { l: 112, r: 132, y: 74, hat: 0 },
  bear: { l: 114, r: 134, y: 76, hat: 0 },
  rabbit: { l: 114, r: 134, y: 78, hat: 2 },
  deer: { l: 114, r: 134, y: 78, hat: 0 },
  owl: { l: 110, r: 136, y: 76, hat: -2 },
  frog: { l: 88, r: 126, y: 48, hat: -14 },
};

// ─── pieces ───
function tail(base: string, b: string): string {
  switch (base) {
    case 'fox':
      return shape('M84,176 Q40,184 30,150 Q24,126 44,124 Q52,150 86,160 Z', b)
        + `<path d="M31,150 Q25,128 43,125 Q39,139 41,147 Z" fill="#f6e6cf"/>`;
    case 'bear': return circ(80, 170, 9, dk(b, 0.08));
    case 'rabbit': return circ(78, 166, 12, '#fbf6ec');
    case 'deer': return shape('M82,150 Q66,146 66,158 Q70,168 84,164 Z', '#fbf6ec');
    case 'owl': return shape('M84,172 L64,186 L70,168 L60,170 L80,158 Z', dk(b, 0.1));
    default: return '';
  }
}

function pack(size: 's' | 'm' | 'xl'): string {
  if (size === 'xl') {
    return line('M58,62 L58,186 M94,62 L94,186', 5, '#7a5a38')
      + shape('M50,90 Q50,78 62,78 L90,78 Q100,78 100,90 L100,180 Q100,188 92,188 L58,188 Q50,188 50,180 Z', '#c26a45')
      + shape('M54,140 L96,140 L96,168 Q96,172 92,172 L58,172 Q54,172 54,168 Z', dk('#c26a45', 0.12))
      + shape('M44,72 Q44,62 54,62 L98,62 Q108,62 108,72 Q108,82 98,82 L54,82 Q44,82 44,72 Z', '#5e8757')
      + line('M60,62 L60,82 M92,62 L92,82', 2.4)
      + `<rect x="70" y="148" width="10" height="10" rx="2" fill="#e8c99a" stroke="${INK}" stroke-width="2"/>`;
  }
  if (size === 'm') {
    return shape('M50,106 Q50,94 62,94 L88,94 Q98,94 98,106 L98,180 Q98,188 90,188 L58,188 Q50,188 50,180 Z', '#4f7a8c')
      + shape('M54,142 L94,142 L94,168 Q94,172 90,172 L58,172 Q54,172 54,168 Z', dk('#4f7a8c', 0.14))
      + shape('M46,90 Q46,80 56,80 L92,80 Q102,80 102,90 Q102,100 92,100 L56,100 Q46,100 46,90 Z', '#c9774f')
      + line('M58,80 L58,100 M90,80 L90,100', 2.4)
      + `<rect x="69" y="148" width="8" height="10" rx="2" fill="#e8c99a" stroke="${INK}" stroke-width="2"/>`;
  }
  return shape('M52,116 Q52,104 64,104 L86,104 Q96,104 96,116 L96,176 Q96,184 88,184 L60,184 Q52,184 52,176 Z', '#5e8757')
    + shape('M56,144 L92,144 L92,166 Q92,170 88,170 L60,170 Q56,170 56,166 Z', '#4c7147')
    + `<rect x="70" y="150" width="7" height="9" rx="2" fill="#e8c99a" stroke="${INK}" stroke-width="2"/>`;
}

function boot(x: number, y: number, rain: boolean): string {
  if (rain) {
    return shape(`M${x - 11},${y - 26} L${x + 6},${y - 26} L${x + 6},${y - 4} Q${x + 19},${y - 2} ${x + 19},${y + 5} L${x + 19},${y + 9} L${x - 12},${y + 9} Z`, '#3f7a7a')
      + line(`M${x - 12},${y - 20} L${x + 6},${y - 20}`, 2.2, lt('#3f7a7a', 0.4));
  }
  return shape(`M${x - 11},${y - 13} L${x + 5},${y - 13} L${x + 6},${y - 2} Q${x + 18},${y} ${x + 18},${y + 6} L${x + 18},${y + 9} L${x - 12},${y + 9} Z`, '#6b4a2f')
    + line(`M${x - 12},${y + 4} L${x + 18},${y + 4}`, 2.2)
    + line(`M${x - 6},${y - 8} L${x + 2},${y - 8}`, 1.8, '#e8c99a');
}

function foot(x: number, y: number, c: string): string {
  return shape(`M${x - 9},${y - 4} Q${x - 10},${y + 8} ${x},${y + 8} L${x + 12},${y + 8} Q${x + 16},${y + 1} ${x + 8},${y - 4} Z`, c);
}

// ─── heads ───
function humanHair(style: string, hair: string, part: 'back' | 'front'): string {
  if (part === 'back') {
    if (style === 'ponytail') return shape('M66,70 Q46,86 52,122 Q56,136 70,130 Q64,108 78,86 Z', hair) + `<circle cx="68" cy="72" r="7" fill="#d0684a" stroke="${INK}" stroke-width="2.4"/>`;
    if (style === 'buns') return circ(76, 34, 15, hair);
    if (style === 'bob') return shape('M62,76 Q52,104 62,118 Q76,124 88,116 L86,90 Z', hair);
    return '';
  }
  if (style === 'curls') {
    return [[62, 70, 13], [70, 50, 14], [88, 36, 15], [110, 32, 15], [130, 38, 14], [144, 54, 11], [66, 88, 10]]
      .map(([x, y, r]) => circ(x, y, r, hair)).join('')
      + `<path d="M62,74 Q60,40 104,36 Q144,36 146,62 Q120,54 96,60 Q76,70 70,86 Z" fill="${hair}"/>`;
  }
  const top = 'M60,84 Q54,34 104,32 Q150,32 150,70 Q138,58 120,60 Q124,50 112,48 Q100,62 80,62 Q72,70 70,86 Q64,86 60,84 Z';
  if (style === 'bob') return shape('M60,86 Q52,34 104,32 Q152,32 150,72 Q136,56 116,58 Q100,64 84,62 Q76,74 78,108 Q66,110 60,100 Z', hair);
  return shape(top, hair);
}

function humanFace(skin: string): string {
  return `<ellipse cx="116" cy="80" rx="4.6" ry="5.6" fill="#241c16"/><circle cx="117.6" cy="78" r="1.6" fill="#fff"/>`
    + `<ellipse cx="136" cy="80" rx="4.2" ry="5.2" fill="#241c16"/><circle cx="137.4" cy="78" r="1.5" fill="#fff"/>`
    + `<circle cx="108" cy="96" r="7" fill="#e58c7a" opacity=".45"/><circle cx="143" cy="94" r="5.5" fill="#e58c7a" opacity=".45"/>`
    + line('M121,99 Q128,106 136,99', 2.6)
    + line('M146,84 Q150,88 146,91', 2.4, dk(skin, 0.3));
}

/** Two friendly 3/4-view eyes + cheeks for the rounder animals. */
function animalFace(l: number, r: number, y: number): string {
  return `<ellipse cx="${l}" cy="${y}" rx="4.4" ry="5.4" fill="#241c16"/><circle cx="${l + 1.5}" cy="${y - 2}" r="1.5" fill="#fff"/>`
    + `<ellipse cx="${r}" cy="${y}" rx="4" ry="5" fill="#241c16"/><circle cx="${r + 1.4}" cy="${y - 2}" r="1.4" fill="#fff"/>`
    + `<circle cx="${l - 8}" cy="${y + 16}" r="6" fill="#e58c7a" opacity=".38"/>`;
}

function head(base: string, o: { body: string; skin: string; hair: string; style: string }): string {
  const b = o.body;
  switch (base) {
    case 'fox':
      return shape('M66,56 L72,18 L94,44 Z', b)
        + shape('M110,40 L128,8 L136,50 Z', b) + `<path d="M114,40 L127,18 L131,46 Z" fill="#3b2c22"/>`
        + shape('M62,84 Q58,42 100,38 Q134,38 140,64 Q158,72 170,84 Q172,92 162,96 Q140,104 122,110 Q96,118 76,108 Q62,100 62,84 Z', b)
        + `<path d="M122,82 Q150,80 168,86 Q170,92 162,96 Q140,104 122,108 Q108,100 122,82 Z" fill="#f6e6cf"/>`
        + `<ellipse cx="166" cy="87" rx="6" ry="5" fill="#2b221b"/>`
        + `<ellipse cx="118" cy="74" rx="4.6" ry="5.6" fill="#241c16"/><circle cx="119.6" cy="72" r="1.6" fill="#fff"/>`
        + line('M138,100 Q146,104 152,99', 2.4) + `<circle cx="104" cy="90" r="6" fill="#e58c7a" opacity=".35"/>`;
    case 'bear':
      return circ(72, 44, 15, b) + circ(72, 44, 7, lt(b, 0.35), 0)
        + circ(124, 38, 15, b) + circ(124, 38, 7, lt(b, 0.35), 0)
        + circ(104, 80, 44, b)
        + ell(140, 94, 22, 16, lt(b, 0.45))
        + `<ellipse cx="156" cy="88" rx="7" ry="5.4" fill="#2b221b"/>`
        + line('M146,100 Q152,104 158,99', 2.4)
        + animalFace(114, 134, 76);
    case 'rabbit':
      return shape('M78,52 Q60,10 72,4 Q90,2 94,46 Z', b) + `<path d="M80,44 Q68,14 74,10 Q84,10 88,42 Z" fill="#f2b8b0"/>`
        + shape('M100,46 Q96,6 110,2 Q126,4 118,50 Z', b) + `<path d="M104,42 Q102,12 110,8 Q120,10 114,44 Z" fill="#f2b8b0"/>`
        + circ(104, 82, 42, b)
        + ell(140, 96, 16, 12, lt(b, 0.5))
        + shape('M144,88 L154,88 L149,95 Z', '#e8948a')
        + line('M152,98 L170,94 M152,101 L170,103', 1.6, dk(b, 0.35))
        + animalFace(114, 134, 78);
    case 'deer':
      return line('M90,40 L84,16 M84,24 L74,16 M116,38 L122,14 M122,22 L132,14', 5, '#7a5a38')
        + ell(66, 64, 16, 9, b, SW, 'transform="rotate(-28 66 64)"')
        + ell(124, 46, 14, 8, b, SW, 'transform="rotate(-60 124 46)"')
        + circ(104, 80, 42, b)
        + ell(142, 94, 20, 15, lt(b, 0.45))
        + `<ellipse cx="158" cy="89" rx="6.4" ry="5" fill="#2b221b"/>`
        + line('M146,102 Q152,105 158,100', 2.2)
        + animalFace(114, 134, 78)
        + `<circle cx="88" cy="58" r="3.4" fill="#fbf6ec" opacity=".85"/><circle cx="80" cy="72" r="2.8" fill="#fbf6ec" opacity=".85"/>`;
    case 'owl':
      return shape('M66,52 L60,20 L88,40 Z', dk(b, 0.1))
        + shape('M128,40 L146,14 L146,52 Z', dk(b, 0.1))
        + circ(104, 78, 44, b)
        + `<ellipse cx="122" cy="80" rx="34" ry="30" fill="${lt(b, 0.55)}"/>`
        + circ(110, 76, 12, '#fffaf0', 2.6) + circ(136, 76, 12, '#fffaf0', 2.6)
        + `<circle cx="112" cy="76" r="5.4" fill="#241c16"/><circle cx="138" cy="76" r="5.4" fill="#241c16"/>`
        + `<circle cx="113.6" cy="74" r="1.8" fill="#fff"/><circle cx="139.6" cy="74" r="1.8" fill="#fff"/>`
        + shape('M118,90 L130,90 L124,102 Z', '#e0a93b');
    case 'frog':
      return circ(88, 48, 17, b) + circ(126, 46, 17, b)
        + ell(106, 84, 52, 36, b)
        + circ(88, 48, 10, '#fffaf0', 2.4) + circ(126, 46, 10, '#fffaf0', 2.4)
        + `<circle cx="90" cy="49" r="5" fill="#241c16"/><circle cx="128" cy="47" r="5" fill="#241c16"/>`
        + `<circle cx="91.4" cy="47.4" r="1.6" fill="#fff"/><circle cx="129.4" cy="45.4" r="1.6" fill="#fff"/>`
        + line('M80,92 Q108,112 146,90', 2.8)
        + `<circle cx="76" cy="86" r="7" fill="#e58c7a" opacity=".35"/><circle cx="148" cy="82" r="6" fill="#e58c7a" opacity=".35"/>`;
    default: // human
      return humanHair(o.style, o.hair, 'back')
        + circ(70, 84, 10, o.skin)
        + circ(104, 78, 44, o.skin)
        + humanFace(o.skin)
        + humanHair(o.style, o.hair, 'front');
  }
}

function shades(e: { l: number; r: number; y: number }): string {
  return `<g><path d="M${e.l - 9},${e.y - 4} L${e.r + 9},${e.y - 4}" stroke="${INK}" stroke-width="3"/>`
    + `<rect x="${e.l - 9}" y="${e.y - 6}" width="17" height="12" rx="5" fill="#2e2a26" stroke="${INK}" stroke-width="2.4"/>`
    + `<rect x="${e.r - 8}" y="${e.y - 6}" width="17" height="12" rx="5" fill="#2e2a26" stroke="${INK}" stroke-width="2.4"/>`
    + `<path d="M${e.l - 5},${e.y - 3} L${e.l},${e.y - 3}" stroke="#fff" stroke-width="1.8" opacity=".6"/></g>`;
}

function hat(dy: number, band: string): string {
  return `<g transform="translate(0 ${dy})">`
    + shape('M44,52 Q104,34 168,50 Q170,60 160,60 Q104,48 50,62 Q40,62 44,52 Z', '#d9b77e')
    + shape('M70,50 Q70,14 106,14 Q140,14 140,48 Q106,40 70,50 Z', '#e4c690')
    + `<path d="M71,44 Q106,34 139,42 L139,49 Q106,41 71,50 Z" fill="${band}" stroke="${INK}" stroke-width="2.4"/>`
    + `</g>`;
}

/** The full-body (or head-cropped) explorer wearing its gear. Returns an <svg>. */
export function explorerSVG(o: ExplorerOpts): string {
  const base = o.base || 'girl';
  const human = base === 'girl' || base === 'boy';
  const d = human ? HUM[base] : null;
  const skin = o.skin || (d ? d.skin : '#e5b48f');
  const hair = o.hair || (d ? d.hair : '#3b2f27');
  const styleIn = o.hairStyle || (d ? d.style : 'short');
  const style = styleIn === 'curly' ? 'curls' : styleIn === 'bun' ? 'buns' : styleIn;
  const shirt = o.shirt || (d ? d.shirt : '#588157');
  const body = o.body || ANIMAL[base] || ANIMAL.fox;
  const isHead = o.crop === 'head';
  const g = isHead ? new Set<string>() : wornTokens(o.gearIds ?? []);
  const has = (t: string) => g.has(t);

  // Clothes take on the kid's colour: humans their shirt, animals their fur.
  const kidColor = human ? shirt : body;
  const coat = has('raincoat') || has('puffer');
  const coatC = has('raincoat') ? mix(kidColor, '#f2d36b', 0.35) : mix(kidColor, '#efe3cc', 0.3);
  const limbC = human ? skin : body;
  const pawC = human ? skin : dk(body, 0.28);
  const torsoC = coat ? coatC : human ? shirt : body;
  const eyes = EYES[human ? 'human' : base] ?? EYES.human;

  const out: string[] = [];
  if (!isHead) {
    out.push(`<ellipse cx="102" cy="248" rx="54" ry="8" fill="#2a2016" opacity=".16"/>`);
    out.push(tail(base, body));
    const packSize = has('pack-xl') ? 'xl' : has('pack-m') ? 'm' : has('pack-s') ? 's' : '';
    if (packSize) out.push(pack(packSize));
    if (has('poles')) out.push(limb('M84,122 L72,238', 4.5, '#6c7a86'));

    // back arm
    out.push(limb('M90,128 Q80,146 78,164', 12, coat ? coatC : limbC));
    out.push(circ(78, 166, 7, pawC));
    if (human && !coat) out.push(limb('M90,126 Q84,136 83,140', 15, shirt));

    // legs + feet (back then front)
    const legC = human ? skin : body;
    out.push(limb('M94,176 Q90,204 86,230', 15, human ? legC : dk(legC, 0.06)));
    out.push(has('rainboots') ? boot(88, 236, true) : has('boots') ? boot(88, 236, false) : foot(86, 236, pawC));
    out.push(limb('M112,176 Q118,204 122,228', 15, legC));
    out.push(has('rainboots') ? boot(124, 234, true) : has('boots') ? boot(124, 234, false) : foot(122, 234, pawC));
    if (human) out.push(shape('M80,168 L126,168 L130,196 L112,198 L104,184 L98,198 L78,196 Z', '#6f5a45'));

    // torso
    out.push(shape('M80,118 Q80,108 92,108 L114,108 Q128,108 128,120 L130,176 Q130,182 124,182 L84,182 Q78,182 78,176 Z', torsoC));
    if (!human && !coat) {
      const belly = base === 'frog' ? '#e9e4a8' : base === 'owl' ? lt(body, 0.55) : '#f6e6cf';
      out.push(`<path d="M104,114 Q122,118 122,150 Q120,176 104,178 Q92,160 96,130 Z" fill="${belly}"/>`);
      if (base === 'deer') out.push(`<circle cx="90" cy="130" r="3.4" fill="#fbf6ec"/><circle cx="86" cy="148" r="3" fill="#fbf6ec"/><circle cx="94" cy="162" r="2.6" fill="#fbf6ec"/>`);
    }
    if (human && !coat) out.push(line('M94,110 Q104,120 114,110', 2.4));
    if (coat) {
      out.push(line('M104,110 L104,180', 2.2, INK, 'opacity=".5"'));
      out.push(`<rect x="84" y="142" width="15" height="13" rx="3" fill="${dk(coatC, 0.1)}" stroke="${INK}" stroke-width="2.2"/>`);
      out.push(`<rect x="109" y="142" width="15" height="13" rx="3" fill="${dk(coatC, 0.1)}" stroke="${INK}" stroke-width="2.2"/>`);
      if (has('puffer')) out.push(line('M81,128 L127,128 M80,160 L129,160', 2, dk(coatC, 0.25)));
      if (has('raincoat')) out.push(shape('M82,112 Q76,96 92,96 L100,108 Z', coatC));
    }
    if (has('bandana')) out.push(shape('M88,110 L122,110 L106,128 Z', '#d0684a') + `<circle cx="100" cy="115" r="1.6" fill="#fff"/><circle cx="110" cy="115" r="1.6" fill="#fff"/>`);
    if (has('binoculars')) out.push(line('M92,110 Q104,132 116,110', 2, '#7a5a38') + `<g transform="translate(104 132)"><rect x="-10" y="-6" width="9" height="13" rx="3" fill="#4b4b52" stroke="${INK}" stroke-width="2"/><rect x="1" y="-6" width="9" height="13" rx="3" fill="#4b4b52" stroke="${INK}" stroke-width="2"/></g>`);
    if (packSize) out.push(line('M86,112 Q92,140 90,176', 6, packSize === 'm' ? dk('#4f7a8c', 0.14) : packSize === 'xl' ? dk('#c26a45', 0.12) : '#4c7147'));

    // front arm (+ stick / pole)
    if (has('stick')) out.push(limb('M146,118 L150,238', 5, '#8b6a45'));
    if (has('poles')) out.push(limb('M146,122 L154,240', 4.5, '#6c7a86'));
    out.push(limb('M120,126 Q134,140 146,150', 12, coat ? coatC : limbC));
    if (human && !coat) out.push(limb('M120,124 Q126,130 129,134', 15, shirt));
    out.push(circ(147, 150, 7.5, pawC));
  }

  out.push(head(human ? 'human' : base, { body, skin, hair, style }));
  if (!isHead) {
    if (has('shades')) out.push(shades(eyes));
    if (has('hat')) out.push(hat(eyes.hat, human ? shirt : dk(body, 0.05)));
    if (has('headlamp') && !has('hat')) out.push(line(`M62,${60 + eyes.hat} Q104,${44 + eyes.hat} 146,${56 + eyes.hat}`, 5, '#4b4b52') + circ(120, 50 + eyes.hat, 7, '#f6e3a6', 2.4));
  }

  const viewBox = isHead ? '40 0 140 140' : '0 0 200 260';
  const par = isHead ? 'xMidYMid meet' : 'xMidYMax meet';
  void o.uid;
  return `<svg viewBox="${viewBox}" preserveAspectRatio="${par}" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" style="display:block;width:100%;height:100%">${out.join('')}</svg>`;
}

/** Gear icon for the map, backpack and pop-ups (sticker style, see gear-art). */
export function gearIconSVG(gearId: string, uid: string, muted = false): string {
  void uid;
  return gearStickerSVG(gearId, muted);
}
