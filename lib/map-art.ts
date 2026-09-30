/**
 * Trail map scenery, v2 (Sept 2026 redesign). Five regions (one per leg of
 * the journey), each drawn in layers — sky, far range, hills, meadow — with
 * its own landmarks and a destination at the end of the trail.
 *
 * The scene is a 1600x1000 SVG rendered with preserveAspectRatio
 * "xMidYMax slice" (never stretched). Two trail layouts:
 *   wide: spreads across the whole meadow (computers)
 *   tall: stays inside the centre ~700 units (phones / narrow windows)
 * The trail always stays on the ground and ends at the destination landmark.
 * Decorations automatically keep clear of the trail, water and landmarks.
 */

export type MapLayout = 'wide' | 'tall';
type Pt = [number, number];

export const VW = 1600;
export const VH = 1000;

/** 12 points per leg: start, 10 stops, and the destination. */
export const TRAIL: Record<MapLayout, Pt[]> = {
  wide: [[100, 945], [280, 915], [470, 945], [660, 925], [880, 905], [1060, 880], [1170, 810], [1080, 740], [930, 712], [780, 690], [640, 660], [520, 628]],
  tall: [[500, 945], [650, 930], [900, 925], [1080, 915], [1090, 815], [940, 800], [790, 790], [640, 770], [560, 690], [720, 670], [880, 650], [1040, 625]],
};
const BRIDGE: Record<MapLayout, Pt> = { wide: [770, 916], tall: [775, 928] };

/** Height of a stop sign's centre above its trail point (scene units). */
export const SIGN_DY = 56;

const INK = '#3b3226';

export function smoothPath(pts: Pt[]): string {
  if (pts.length < 2) return pts.length ? `M ${pts[0][0]} ${pts[0][1]}` : '';
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const xm = (pts[i][0] + pts[i + 1][0]) / 2;
    const ym = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q ${pts[i][0]} ${pts[i][1]} ${xm} ${ym}`;
  }
  const last = pts[pts.length - 1];
  return d + ` L ${last[0]} ${last[1]}`;
}

// ─── geometry helpers for keeping decorations clear ───
function distSeg(p: Pt, a: Pt, b: Pt) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}
function distPoly(p: Pt, pts: Pt[]) {
  let m = Infinity;
  for (let i = 0; i < pts.length - 1; i++) m = Math.min(m, distSeg(p, pts[i], pts[i + 1]));
  return m;
}
const RIVER: Pt[] = [[300, 684], [360, 760], [520, 800], [680, 830], [760, 905], [790, 960], [775, 1000]];
const RIVER_D = 'M300,684 Q340,770 520,800 Q700,830 760,905 Q790,960 775,1000';
const LAKE = { cx: 270, cy: 652, rx: 150, ry: 34 };
const LANDMARK: Pt = [96, 770];

// ─── regions ───
type Tree = 'round' | 'pine' | 'snowpine' | 'cactus' | 'palm' | 'shrub';
interface RegionArt {
  name: string;
  sky: [string, string];
  sun: [string, string];
  far: 'mountains' | 'peaks' | 'mesas' | 'sea';
  farC: string;
  fringe: Tree | null;
  fringeC: [string, string];
  hills: [string, string];
  meadow: [string, string];
  water: 'river' | 'frozen' | 'oasis' | 'lagoon';
  waterC: [string, string];
  trees: Tree[];
  treeC: [string, string];
  decor: 'flowers' | 'rocks' | 'pebbles' | 'shells' | 'snow';
  landmark: 'cabin' | 'hut' | 'oasis' | 'beachhut' | 'igloo';
  dest: 'tower' | 'cairn' | 'arch' | 'lighthouse' | 'flag';
  birds: 'birds' | 'gulls' | 'none';
  clouds: number;
  snowfall?: boolean;
}

export const REGION_ART: RegionArt[] = [
  {
    name: 'Forest Valley', sky: ['#cfe4ea', '#eef2e6'], sun: ['#f8dd8f', '#f6d27a'], far: 'mountains', farC: '#b9cbc6',
    fringe: 'pine', fringeC: ['#7f9e76', '#5f7f5a'], hills: ['#a9c29a', '#94b37f'], meadow: ['#9dba84', '#6f9460'],
    water: 'river', waterC: ['#b8dfe6', '#7fb6c3'], trees: ['round', 'pine', 'round'], treeC: ['#7fa36b', '#5f8a58'],
    decor: 'flowers', landmark: 'cabin', dest: 'tower', birds: 'birds', clouds: 3,
  },
  {
    name: 'Highland Peaks', sky: ['#cfe0ec', '#eef3f3'], sun: ['#f2eed8', '#e9e6cf'], far: 'peaks', farC: '#9fb2bd',
    fringe: 'pine', fringeC: ['#5f7f6a', '#48664f'], hills: ['#9fb3a0', '#8aa38f'], meadow: ['#93ab8a', '#6a8a6c'],
    water: 'river', waterC: ['#bfe0e6', '#7fb6c0'], trees: ['pine', 'pine', 'shrub'], treeC: ['#4f7a5e', '#3f644c'],
    decor: 'rocks', landmark: 'hut', dest: 'cairn', birds: 'birds', clouds: 4,
  },
  {
    name: 'Golden Desert', sky: ['#f5e4c6', '#f8f0dc'], sun: ['#f8cf74', '#f4bd58'], far: 'mesas', farC: '#d3a072',
    fringe: null, fringeC: ['#c9954f', '#b1774d'], hills: ['#e3ba7e', '#d9a866'], meadow: ['#eccf95', '#d9a866'],
    water: 'oasis', waterC: ['#9fdcd6', '#5fb8b4'], trees: ['cactus', 'shrub', 'cactus'], treeC: ['#7fa36b', '#5f8a58'],
    decor: 'pebbles', landmark: 'oasis', dest: 'arch', birds: 'none', clouds: 1,
  },
  {
    name: 'Sunny Coast', sky: ['#bfe3ee', '#e9f5f2'], sun: ['#f7d98a', '#f3c869'], far: 'sea', farC: '#4fb3c0',
    fringe: null, fringeC: ['#5fc3c9', '#2f8f9c'], hills: ['#efd9a8', '#e6cb92'], meadow: ['#e9d8a6', '#d9bf85'],
    water: 'lagoon', waterC: ['#a5e2e2', '#4fb3c0'], trees: ['palm', 'shrub', 'palm'], treeC: ['#5fa870', '#3f8a58'],
    decor: 'shells', landmark: 'beachhut', dest: 'lighthouse', birds: 'gulls', clouds: 3,
  },
  {
    name: 'Snowfield', sky: ['#d6e5ee', '#f3f8fb'], sun: ['#f3f5f2', '#e6edef'], far: 'mountains', farC: '#b9ccd8',
    fringe: 'snowpine', fringeC: ['#8fa9b8', '#6f8d9e'], hills: ['#e4eef4', '#d5e2ea'], meadow: ['#f1f6f9', '#d3e1ea'],
    water: 'frozen', waterC: ['#e3f1f6', '#b7d4e0'], trees: ['snowpine', 'snowpine', 'shrub'], treeC: ['#5f8577', '#4a6e62'],
    decor: 'snow', landmark: 'igloo', dest: 'flag', birds: 'none', clouds: 3, snowfall: true,
  },
];

// ─── drawing bits ───
const sh = (d: string, fill: string, w = 2.6) => `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const shadow = (rx: number) => `<ellipse cx="0" cy="4" rx="${rx}" ry="${rx * 0.22}" fill="#2a2016" opacity=".13"/>`;

function tree(kind: Tree, x: number, y: number, s: number, c: [string, string]): string {
  const g = (inner: string, rx: number) => `<g transform="translate(${x} ${y}) scale(${s})">${shadow(rx)}${inner}</g>`;
  switch (kind) {
    case 'pine':
      return g(`<rect x="-4" y="-14" width="8" height="18" rx="2" fill="#6f5433"/><path d="M0,-86 L-22,-44 L-12,-44 L-30,-14 L30,-14 L12,-44 L22,-44 Z" fill="${c[1]}"/><path d="M0,-86 L-22,-44 L-12,-44 L-30,-14 L0,-14 Z" fill="${c[0]}" opacity=".55"/>`, 22);
    case 'snowpine':
      return g(`<rect x="-4" y="-14" width="8" height="18" rx="2" fill="#6f5433"/><path d="M0,-86 L-22,-44 L-12,-44 L-30,-14 L30,-14 L12,-44 L22,-44 Z" fill="${c[1]}"/><path d="M0,-86 L-11,-64 Q0,-58 11,-64 Z M-16,-44 Q0,-38 16,-44 L12,-50 Q0,-46 -12,-50 Z M-24,-14 Q0,-8 24,-14 L20,-22 Q0,-16 -20,-22 Z" fill="#fff"/>`, 22);
    case 'cactus':
      return g(`<rect x="-9" y="-70" width="18" height="74" rx="9" fill="${c[0]}" stroke="${INK}" stroke-width="2.4"/><path d="M-9,-30 L-20,-30 Q-26,-30 -26,-36 L-26,-52" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M-9,-30 L-20,-30 Q-26,-30 -26,-36 L-26,-52" fill="none" stroke="${c[0]}" stroke-width="7" stroke-linecap="round"/><path d="M9,-40 L18,-40 Q24,-40 24,-46 L24,-58" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M9,-40 L18,-40 Q24,-40 24,-46 L24,-58" fill="none" stroke="${c[0]}" stroke-width="7" stroke-linecap="round"/><path d="M-2,-60 L-2,-10" stroke="${c[1]}" stroke-width="2"/><circle cx="0" cy="-72" r="4" fill="#e89a8a"/>`, 20);
    case 'palm':
      return g(`<path d="M2,4 Q-6,-40 4,-92" stroke="#8a6a44" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M2,4 Q-6,-40 4,-92" stroke="#a8875c" stroke-width="4" fill="none" stroke-dasharray="4 8"/><g fill="${c[0]}" stroke="${INK}" stroke-width="2"><path d="M4,-92 Q-34,-104 -46,-80 Q-24,-92 4,-86 Z"/><path d="M4,-92 Q42,-106 52,-82 Q28,-92 4,-86 Z"/><path d="M4,-92 Q-18,-124 -2,-132 Q4,-110 6,-88 Z"/><path d="M4,-92 Q28,-122 18,-134 Q8,-112 2,-88 Z"/></g><circle cx="0" cy="-86" r="5" fill="#7a5a38"/><circle cx="8" cy="-84" r="5" fill="#7a5a38"/>`, 22);
    case 'shrub':
      return g(`<circle cx="-14" cy="-12" r="14" fill="${c[1]}"/><circle cx="12" cy="-12" r="14" fill="${c[1]}"/><circle cx="0" cy="-22" r="16" fill="${c[0]}"/><circle cx="-6" cy="-28" r="5" fill="#fff" opacity=".15"/>`, 26);
    default: // round
      return g(`<rect x="-4" y="-22" width="8" height="26" rx="2" fill="#7a5a38"/><circle cx="0" cy="-44" r="28" fill="${c[0]}"/><circle cx="-16" cy="-30" r="18" fill="${c[0]}"/><circle cx="16" cy="-30" r="18" fill="${c[0]}"/><circle cx="-8" cy="-54" r="11" fill="#fff" opacity=".12"/><path d="M-30,-30 Q-20,-12 0,-16 Q20,-12 30,-30 Q24,-18 0,-14 Q-24,-18 -30,-30 Z" fill="${c[1]}" opacity=".45"/>`, 26);
  }
}

function landmark(kind: RegionArt['landmark']): string {
  const [x, y] = LANDMARK;
  const t = `translate(${x} ${y})`;
  switch (kind) {
    case 'hut':
      return `<g transform="${t}">${shadow(50)}${sh('M-40,0 L40,0 L40,-40 L-40,-40 Z', '#a9a39a')}<path d="M-30,-10 h14 M-6,-24 h16 M18,-12 h14 M-34,-30 h12" stroke="#8a847b" stroke-width="3"/>${sh('M-50,-36 L0,-74 L50,-36 Z', '#6f7f86')}${sh('M-8,0 L-8,-24 Q0,-32 8,-24 L8,0 Z', '#6b4a2f')}${sh('M18,-66 L30,-66 L30,-44 L18,-54 Z', '#8a847b')}<g fill="#fff" opacity=".65"><circle cx="26" cy="-80" r="6"/><circle cx="32" cy="-94" r="8"/></g></g>`;
    case 'oasis':
      return `<g transform="${t}">${tree('palm', -20, 0, 0.9, ['#5fa870', '#3f8a58'])}${tree('palm', 44, 6, 0.7, ['#5fa870', '#3f8a58'])}</g>`;
    case 'beachhut':
      return `<g transform="${t}">${shadow(46)}${sh('M-36,0 L36,0 L36,-46 L-36,-46 Z', '#fbf4e6')}<path d="M-26,-46 V0 M-12,-46 V0 M2,-46 V0 M16,-46 V0 M30,-46 V0" stroke="#d0684a" stroke-width="7"/><rect x="-36" y="-46" width="72" height="46" fill="none" stroke="${INK}" stroke-width="2.6"/>${sh('M-44,-42 L0,-72 L44,-42 Z', '#4fb3c0')}${sh('M-8,0 L-8,-26 L8,-26 L8,0 Z', '#8b6a45')}<g transform="translate(66 0)"><path d="M0,0 L0,-58" stroke="${INK}" stroke-width="3"/>${sh('M-32,-50 Q0,-78 32,-50 Z', '#f2c14e')}<path d="M-16,-56 Q0,-72 0,-66 M16,-56 Q0,-72 0,-66" stroke="#d0684a" stroke-width="3" fill="none"/></g></g>`;
    case 'igloo':
      return `<g transform="${t}">${shadow(56)}${sh('M-50,0 Q-50,-56 0,-56 Q50,-56 50,0 Z', '#f6fbfd')}<path d="M-44,-20 Q0,-28 44,-20 M-34,-40 Q0,-46 34,-40 M-20,-56 L-24,-40 M12,-56 L16,-40 M-40,-20 L-44,0 M-6,-24 L-8,0 M28,-22 L30,0" stroke="#b7d4e0" stroke-width="2.4" fill="none"/>${sh('M30,0 L30,-24 Q44,-30 58,-24 L58,0 Z', '#eef6f9')}${sh('M38,0 L38,-14 Q44,-18 50,-14 L50,0 Z', '#4f6e7a')}<g transform="translate(104 4)">${shadow(20)}<circle cx="0" cy="-16" r="17" fill="#fff" stroke="${INK}" stroke-width="2.4"/><circle cx="0" cy="-42" r="12" fill="#fff" stroke="${INK}" stroke-width="2.4"/><circle cx="-4" cy="-44" r="1.8" fill="${INK}"/><circle cx="4" cy="-44" r="1.8" fill="${INK}"/><path d="M0,-40 L10,-38 L0,-36 Z" fill="#e08a3a"/><path d="M-10,-32 Q0,-28 10,-32 L12,-26 L6,-27 Z" fill="#d0684a" stroke="${INK}" stroke-width="1.6"/></g></g>`;
    default: // cabin
      return `<g transform="${t}">${shadow(48)}${sh('M-36,0 L36,0 L36,-44 L0,-72 L-36,-44 Z', '#b98556')}<path d="M-46,-40 L0,-80 L46,-40" fill="none" stroke="#8b4a36" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>${sh('M-8,0 L-8,-26 L10,-26 L10,0 Z', '#6b4a2f')}${sh('M-28,-34 L-16,-34 L-16,-22 L-28,-22 Z', '#f8dd8f')}${sh('M14,-62 L24,-62 L24,-40 L14,-48 Z', '#8b6a45')}<g fill="#fff" opacity=".7"><circle cx="20" cy="-76" r="7"/><circle cx="28" cy="-92" r="9"/><circle cx="22" cy="-110" r="11"/></g></g>`;
  }
}

function destination(kind: RegionArt['dest'], [x, y]: Pt): string {
  const t = `translate(${x} ${y + 6})`;
  switch (kind) {
    case 'cairn':
      return `<g transform="${t}">${shadow(40)}${sh('M-34,0 Q-36,-18 -18,-20 L18,-20 Q36,-18 34,0 Z', '#a9a39a')}${sh('M-24,-20 Q-26,-38 -10,-40 L12,-40 Q26,-38 24,-20 Z', '#bdb7ad')}${sh('M-14,-40 Q-14,-56 0,-58 Q14,-56 14,-40 Z', '#a9a39a')}${sh('M-6,-58 Q-6,-70 0,-70 Q6,-70 6,-58 Z', '#bdb7ad')}<path d="M0,-70 L0,-118" stroke="${INK}" stroke-width="3.4"/>${sh('M0,-118 L34,-108 L0,-96 Z', '#d0684a')}</g>`;
    case 'arch':
      return `<g transform="${t}">${shadow(70)}${sh('M-64,0 L-60,-100 Q-56,-140 0,-142 Q56,-140 60,-100 L64,0 L34,0 L32,-86 Q30,-110 0,-110 Q-30,-110 -32,-86 L-34,0 Z', '#c9804f')}<path d="M-54,-60 Q-44,-66 -40,-60 M40,-40 Q48,-46 54,-40 M-10,-126 Q0,-130 12,-126" stroke="#a8633a" stroke-width="3" fill="none"/><path d="M0,-142 L0,-172" stroke="${INK}" stroke-width="3"/>${sh('M0,-172 L28,-164 L0,-156 Z', '#d0684a')}</g>`;
    case 'lighthouse':
      return `<g transform="${t}">${shadow(44)}${sh('M-26,0 L-18,-130 L18,-130 L26,0 Z', '#fbf4e6')}<path d="M-24,-30 L24,-30 L22,-54 L-22,-54 Z M-20,-80 L20,-80 L19,-102 L-19,-102 Z" fill="#d0684a"/><path d="M-26,0 L-18,-130 L18,-130 L26,0 Z" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>${sh('M-24,-130 L24,-130 L24,-138 L-24,-138 Z', '#4b4b52')}${sh('M-14,-138 L14,-138 L14,-160 L-14,-160 Z', '#f6e3a6')}${sh('M-20,-160 L0,-178 L20,-160 Z', '#d0684a')}<path d="M18,-150 L64,-162 L64,-138 Z" fill="#f6e3a6" opacity=".55"/>${sh('M-6,0 L-6,-20 L6,-20 L6,0 Z', '#4f7a8c')}</g>`;
    case 'flag':
      return `<g transform="${t}">${shadow(60)}<path d="M-70,2 Q-40,-50 0,-54 Q40,-50 70,2 Z" fill="#f6fbfd" stroke="${INK}" stroke-width="2.6"/><path d="M-50,-20 Q-30,-30 -20,-24 M20,-30 Q34,-34 44,-24" stroke="#b7d4e0" stroke-width="2.4" fill="none"/><path d="M0,-54 L0,-150" stroke="${INK}" stroke-width="4"/>${sh('M0,-150 L50,-136 L0,-120 Z', '#d0684a')}<circle cx="0" cy="-152" r="4" fill="#e0a93b" stroke="${INK}" stroke-width="2"/></g>`;
    default: // tower
      return `<g transform="translate(${x} ${y + 6}) scale(.8)"><path d="M-30,0 L-18,-120 L18,-120 L30,0" fill="none" stroke="#7a5a38" stroke-width="7" stroke-linejoin="round"/><path d="M-26,-30 L22,-60 M26,-30 L-22,-60 M-22,-70 L18,-100 M22,-70 L-18,-100" stroke="#7a5a38" stroke-width="4"/>${sh('M-30,-120 L30,-120 L24,-150 L-24,-150 Z', '#b98556')}${sh('M-34,-150 L0,-178 L34,-150 Z', '#8b4a36')}<path d="M0,-178 L0,-206" stroke="${INK}" stroke-width="3"/>${sh('M0,-206 L26,-198 L0,-190 Z', '#d0684a', 2)}</g>`;
  }
}

function far(r: RegionArt): string {
  if (r.far === 'sea') {
    return `<rect x="0" y="440" width="1600" height="130" fill="url(#mSea)"/>`
      + `<path d="M0,440 L1600,440" stroke="#fff" stroke-width="3" opacity=".6"/>`
      + `<path d="M180,452 Q260,418 340,452 Z M1180,450 Q1230,428 1290,450 Z" fill="#8fc2a8"/>`
      + `<g transform="translate(560 452)"><path d="M-20,0 L20,0 L14,8 L-14,8 Z" fill="#fbf4e6" stroke="${INK}" stroke-width="2"/><path d="M0,0 L0,-34 L18,-4 Z" fill="#fff" stroke="${INK}" stroke-width="2"/></g>`
      + [0, 1, 2, 3, 4, 5].map((i) => `<path d="M${120 + i * 260},${490 + (i % 2) * 30} q12,-6 24,0" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>`).join('');
  }
  if (r.far === 'mesas') {
    return `<path d="M0,500 L0,420 L120,420 L150,380 L330,380 L360,430 L520,430 L560,360 L760,360 L790,420 L1000,420 L1030,390 L1180,390 L1210,440 L1380,440 L1410,400 L1600,400 L1600,500 Z" fill="${r.farC}" opacity=".85"/>`
      + `<path d="M150,380 L330,380 L336,392 L146,392 Z M560,360 L760,360 L766,374 L554,374 Z M1030,390 L1180,390 L1186,402 L1024,402 Z" fill="#e0b289"/>`
      + `<rect y="380" width="1600" height="160" fill="url(#mHaze)"/>`;
  }
  const peaks = r.far === 'peaks';
  const d = peaks
    ? 'M0,470 L120,300 L230,400 L390,170 L540,380 L690,210 L860,420 L1010,250 L1170,430 L1320,280 L1480,440 L1600,340 L1600,540 L0,540 Z'
    : 'M0,430 L150,300 L260,380 L420,230 L560,360 L700,270 L860,400 L1000,310 L1160,420 L1300,330 L1460,420 L1600,360 L1600,540 L0,540 Z';
  const caps = peaks
    ? 'M390,170 L352,222 L374,216 L392,234 L412,214 L432,226 Z M690,210 L656,250 L676,246 L692,262 L708,244 L724,252 Z M1010,250 L982,284 L1000,280 L1012,294 L1026,280 L1040,286 Z M1320,280 L1296,310 L1312,306 L1322,318 L1334,306 L1346,310 Z'
    : 'M420,230 L380,268 L402,262 L420,282 L440,262 L462,270 Z M700,270 L668,300 L688,296 L704,312 L720,294 L736,300 Z M1000,310 L974,334 L992,330 L1004,344 L1018,330 L1030,336 Z';
  return `<path d="${d}" fill="${r.farC}"/><path d="${caps}" fill="#f7f9f8"/><rect y="300" width="1600" height="240" fill="url(#mHaze)"/>`;
}

function water(r: RegionArt, layout: MapLayout): string {
  const lake = `<ellipse cx="${LAKE.cx}" cy="${LAKE.cy}" rx="${LAKE.rx}" ry="${LAKE.ry}" fill="url(#mWater)" stroke="#fff" stroke-opacity=".6" stroke-width="3"/>`;
  if (r.water === 'oasis') {
    return `<ellipse cx="${LAKE.cx}" cy="${LAKE.cy + 6}" rx="${LAKE.rx - 30}" ry="${LAKE.ry - 6}" fill="#b98a5a" opacity=".25"/><ellipse cx="${LAKE.cx}" cy="${LAKE.cy}" rx="${LAKE.rx - 40}" ry="${LAKE.ry - 8}" fill="url(#mWater)" stroke="#fff" stroke-opacity=".6" stroke-width="3"/>`;
  }
  const river = `<path d="${RIVER_D}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="54" stroke-linecap="round"/><path d="${RIVER_D}" fill="none" stroke="url(#mWater)" stroke-width="44" stroke-linecap="round"/>`;
  const glints = r.water === 'frozen'
    ? `<path d="M200,648 l40,6 l30,-10 M320,660 l24,-12 M560,806 l30,8 l18,-12" stroke="#fff" stroke-width="3" fill="none"/>`
    : `<path d="M300,672 Q340,760 520,790" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="4" stroke-dasharray="18 22"/>`;
  const [bx, by] = BRIDGE[layout];
  const bridge = `<g transform="translate(${bx} ${by}) rotate(-8)"><rect x="-48" y="-17" width="96" height="34" rx="4" fill="#b98556" stroke="${INK}" stroke-width="2.6"/><path d="M-32,-17 L-32,17 M-16,-17 L-16,17 M0,-17 L0,17 M16,-17 L16,17 M32,-17 L32,17" stroke="#8b6a45" stroke-width="2.4"/><path d="M-48,-17 L48,-17" stroke="#6b4a2f" stroke-width="5"/></g>`;
  return lake + river + glints + bridge;
}

function decorAt(kind: RegionArt['decor'], x: number, y: number, i: number): string {
  switch (kind) {
    case 'rocks':
      return i % 3 === 0 ? `<ellipse cx="${x}" cy="${y}" rx="12" ry="7" fill="#b3ada2" stroke="${INK}" stroke-width="1.8"/>` : `<circle cx="${x}" cy="${y}" r="4" fill="${['#f2d16b', '#fff', '#c9a0d6'][i % 3]}"/>`;
    case 'pebbles':
      return `<ellipse cx="${x}" cy="${y}" rx="${4 + (i % 3) * 2}" ry="${3 + (i % 2)}" fill="${['#c79a64', '#b9885a', '#e0c08c'][i % 3]}"/>`;
    case 'shells':
      return i % 4 === 0 ? `<path d="M${x},${y - 8} l3,6 l7,1 l-5,5 l1,7 l-6,-3 l-6,3 l1,-7 l-5,-5 l7,-1 Z" fill="#e89a6a" stroke="${INK}" stroke-width="1.4"/>` : `<ellipse cx="${x}" cy="${y}" rx="4" ry="3" fill="${['#fbf4e6', '#f2c1b0', '#fff'][i % 3]}"/>`;
    case 'snow':
      return `<path d="M${x - 5},${y} h10 M${x},${y - 5} v10" stroke="#fff" stroke-width="2" opacity=".9"/>`;
    default:
      return `<circle cx="${x}" cy="${y}" r="4" fill="${['#f2d16b', '#fff', '#e89a8a'][i % 3]}" opacity=".95"/>`;
  }
}

/**
 * The scene for one leg, as SVG inner markup for a 0 0 1600 1000 viewBox.
 * `reached` = stops reached on this leg (the explorer stands on trail[reached]).
 */
export function mapSceneSVG(regionIndex: number, layout: MapLayout, reached: number): string {
  const r = REGION_ART[regionIndex % REGION_ART.length];
  const pts = TRAIL[layout];
  const dest = pts[pts.length - 1];
  const o: string[] = [];

  o.push(`<defs>
    <linearGradient id="mSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${r.sky[0]}"/><stop offset=".75" stop-color="${r.sky[1]}"/></linearGradient>
    <radialGradient id="mSun"><stop offset="0" stop-color="${r.sun[0]}"/><stop offset=".45" stop-color="${r.sun[1]}" stop-opacity=".85"/><stop offset="1" stop-color="${r.sun[1]}" stop-opacity="0"/></radialGradient>
    <linearGradient id="mHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${r.sky[1]}" stop-opacity="0"/><stop offset="1" stop-color="${r.sky[1]}" stop-opacity=".7"/></linearGradient>
    <linearGradient id="mMeadow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${r.meadow[0]}"/><stop offset="1" stop-color="${r.meadow[1]}"/></linearGradient>
    <linearGradient id="mWater" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${r.waterC[0]}"/><stop offset="1" stop-color="${r.waterC[1]}"/></linearGradient>
    <linearGradient id="mSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fcfd6"/><stop offset="1" stop-color="#4fb3c0"/></linearGradient>
  </defs>`);

  // sky, sun, clouds, birds
  o.push(`<rect width="${VW}" height="${VH}" fill="url(#mSky)"/>`);
  o.push(`<circle cx="990" cy="230" r="190" fill="url(#mSun)"/><circle cx="990" cy="230" r="58" fill="${r.sun[0]}"/>`);
  const cloud = (x: number, y: number, s: number, op = 0.9) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${op}" fill="#fff"><ellipse cx="0" cy="0" rx="70" ry="22"/><ellipse cx="-28" cy="-14" rx="34" ry="26"/><ellipse cx="18" cy="-22" rx="40" ry="32"/><ellipse cx="52" cy="-6" rx="26" ry="18"/></g>`;
  [[330, 250, 1.1, 0.9], [640, 170, 0.8, 0.8], [1380, 330, 0.75, 0.75], [160, 380, 0.6, 0.7]].slice(0, r.clouds).forEach(([x, y, s, op]) => o.push(cloud(x, y, s, op)));
  if (r.birds === 'birds') o.push(`<g fill="none" stroke="#5a5a52" stroke-width="3" stroke-linecap="round" opacity=".5"><path d="M760,300 q10,-10 20,0 q10,-10 20,0"/><path d="M820,330 q8,-8 16,0 q8,-8 16,0"/><path d="M720,340 q7,-7 14,0 q7,-7 14,0"/></g>`);
  if (r.birds === 'gulls') o.push(`<g fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round"><path d="M760,320 q12,-12 24,0 q12,-12 24,0"/><path d="M840,360 q9,-9 18,0 q9,-9 18,0"/></g>`);

  // far range, fringe, hills, meadow
  o.push(far(r));
  o.push(`<path d="M0,540 Q220,470 460,520 T920,500 T1380,490 T1600,500 L1600,660 L0,660 Z" fill="${r.hills[0]}"/>`);
  if (r.fringe) {
    for (let i = 0; i < 26; i++) {
      const x = 20 + i * 62 + (i % 3) * 9;
      const y = 522 + Math.sin(i * 1.3) * 14 + (i % 2) * 8;
      o.push(tree(r.fringe, x, y, 0.4, r.fringeC));
    }
  }
  o.push(`<path d="M0,640 Q300,570 640,612 T1240,602 T1600,592 L1600,760 L0,760 Z" fill="${r.hills[1]}"/>`);
  o.push(`<path d="M0,700 Q360,646 760,690 T1600,662 L1600,1000 L0,1000 Z" fill="url(#mMeadow)"/>`);

  // water + landmark
  o.push(water(r, layout));
  o.push(landmark(r.landmark));

  // decorations, kept clear of the trail, water and landmarks
  const nearWater = (p: Pt) => r.water !== 'oasis' && (distPoly(p, RIVER) < 60 || ((p[0] - LAKE.cx) / (LAKE.rx + 40)) ** 2 + ((p[1] - LAKE.cy) / (LAKE.ry + 50)) ** 2 < 1);
  const clear = (p: Pt, pad: number) => distPoly(p, pts) > pad && Math.hypot(p[0] - dest[0], p[1] - dest[1]) > 130 && Math.hypot(p[0] - LANDMARK[0], p[1] - LANDMARK[1]) > 120 && !nearWater(p);
  const TREE_SPOTS: [number, number, number][] = [
    [560, 700, 0.85], [360, 720, 0.7], [1000, 700, 0.8], [1240, 690, 0.9], [1420, 700, 1], [1540, 740, 1.1],
    [40, 880, 1.2], [230, 830, 0.95], [420, 1000, 1.1], [620, 1010, 1.05], [960, 1000, 1.15], [1180, 990, 1.1],
    [1340, 930, 1.2], [1520, 900, 1.1], [1290, 780, 0.9], [990, 800, 0.85], [470, 800, 0.8], [860, 790, 0.75],
    [150, 660, 0.6], [1460, 620, 0.7], [700, 740, 0.7], [1120, 960, 0.9],
  ];
  TREE_SPOTS.forEach(([x, y, s], i) => { if (clear([x, y], 78)) o.push(tree(r.trees[i % r.trees.length], x, y, s, r.treeC)); });
  for (let i = 0; i < 70; i++) {
    const x = (i * 137 + 29) % 1580 + 10;
    const y = 740 + ((i * 53) % 250);
    if (clear([x, y], 34)) o.push(decorAt(r.decor, x, y, i));
  }

  // the trail: a dirt path; walked part solid, the rest dotted
  const all = smoothPath(pts);
  const k = Math.max(0, Math.min(reached, pts.length - 1));
  o.push(`<path d="${all}" fill="none" stroke="#6b4a2f" stroke-width="32" stroke-linecap="round" opacity=".18"/>`);
  o.push(`<path d="${all}" fill="none" stroke="${r.decor === 'snow' ? '#c9d9e3' : '#e9d9b6'}" stroke-width="22" stroke-linecap="round"/>`);
  o.push(`<path d="${smoothPath(pts.slice(k))}" fill="none" stroke="#b58a5a" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 16"/>`);
  if (k > 0) o.push(`<path class="am-draw" d="${smoothPath(pts.slice(0, k + 1))}" fill="none" stroke="#d08d52" stroke-width="11" stroke-linecap="round"/>`);

  // stop posts: walked ones get a blank sign (the gear sticker sits on it),
  // upcoming ones show their number; the next one glows.
  pts.forEach(([x, y], i) => {
    if (i === k || i === pts.length - 1) return;
    const done = i < k;
    const sr = done ? 27 : 19;
    if (i === k + 1) o.push(`<circle class="am-next-glow" cx="${x}" cy="${y - SIGN_DY}" r="36" fill="#d0684a" opacity=".3"/>`);
    o.push(`<g transform="translate(${x} ${y})"><ellipse cx="0" cy="3" rx="12" ry="3.5" fill="#2a2016" opacity=".16"/><rect x="-4" y="${-SIGN_DY + sr - 4}" width="8" height="${SIGN_DY - sr + 6}" rx="2" fill="#8b6a45" stroke="${INK}" stroke-width="2"/><circle cx="0" cy="${-SIGN_DY}" r="${sr}" fill="${done ? '#fffdf8' : i === k + 1 ? '#fbe3d8' : '#f3ead8'}" stroke="${INK}" stroke-width="2.6"/>${done ? '' : `<text x="0" y="${-SIGN_DY + 6}" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="800" font-size="17" fill="${i === k + 1 ? '#b8492f' : '#9a8a70'}">${i}</text>`}</g>`);
  });

  o.push(destination(r.dest, dest));

  if (r.snowfall) {
    for (let i = 0; i < 40; i++) o.push(`<circle cx="${(i * 211) % 1600}" cy="${(i * 97) % 700}" r="${2 + (i % 3)}" fill="#fff" opacity=".8"/>`);
  }
  return o.join('');
}
