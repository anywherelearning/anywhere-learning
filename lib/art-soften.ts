/**
 * "Soft storybook" finish for the member-zone art (explorers, gear, maps), so
 * it sits with the rest of the site: no hard dark outlines (a soft edge in a
 * darker shade of each shape's own colour instead), colours pulled into the
 * brand palette, and a light paper grain.
 *
 * Works on the SVG strings the art modules build: every hard-ink outline and
 * every hex colour is rewritten here, so the drawings themselves stay simple.
 */

export const HARD_INK = '#3b3226';

const BRAND = ['#588157', '#3d5c3b', '#8fae7f', '#6b8e6b', '#d4a373', '#e8c99a', '#c4836a', '#c47a8f', '#8b7355', '#faf9f6', '#f7f5f0', '#a9c29a', '#b9cbc6', '#cfe4ea'];

function hx(c: string): number[] {
  c = c.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const n = parseInt(c, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const toHex = (a: number[]) => '#' + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export function mixHex(a: string, b: string, t: number) {
  const A = hx(a), B = hx(b);
  return toHex(A.map((v, i) => v + (B[i] - v) * t));
}
function desat(c: string, t: number) {
  const [r, g, b] = hx(c);
  const l = 0.3 * r + 0.59 * g + 0.11 * b;
  return toHex([r + (l - r) * t, g + (l - g) * t, b + (l - b) * t]);
}
function nearest(c: string) {
  const A = hx(c);
  let best = BRAND[0], d = Infinity;
  for (const b of BRAND) {
    const B = hx(b);
    const dd = (A[0] - B[0]) ** 2 + (A[1] - B[1]) ** 2 + (A[2] - B[2]) ** 2;
    if (dd < d) { d = dd; best = b; }
  }
  return best;
}
const cache = new Map<string, string>();
/** Pull a colour toward the brand palette (very dark tones, e.g. eyes, stay). */
export function brandColor(c: string): string {
  const k = c.toLowerCase();
  if (!/^#[0-9a-f]{3}([0-9a-f]{3})?$/.test(k)) return c;
  const hit = cache.get(k);
  if (hit) return hit;
  let out: string;
  if (k === '#fff' || k === '#ffffff') out = '#fdfaf3';
  else {
    const [r, g, b] = hx(k);
    out = 0.3 * r + 0.59 * g + 0.11 * b < 55 ? k : mixHex(desat(k, 0.25), nearest(k), 0.35);
  }
  cache.set(k, out);
  return out;
}

/** A soft edge for a filled shape: a darker shade of its own colour. */
export function softEdge(fill: string) {
  return mixHex(fill.startsWith('#') ? fill : '#8b7355', '#3b3226', 0.28);
}

function attr(tag: string, name: string): string | null {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? m[1] : null;
}
function setAttr(tag: string, name: string, value: string): string {
  const re = new RegExp(`(\\s${name}=")[^"]*(")`);
  return re.test(tag) ? tag.replace(re, `$1${value}$2`) : tag.replace(/^<(\w+)/, `<$1 ${name}="${value}"`);
}

/** Rewrite an SVG string into the soft storybook finish. */
export function softenSVG(svg: string): string {
  return svg.replace(/<(path|circle|rect|ellipse|line|polygon|stop|g)\b[^>]*>/g, (tag) => {
    let t = tag;
    for (const name of ['fill', 'stop-color']) {
      const v = attr(t, name);
      if (v && v.startsWith('#')) t = setAttr(t, name, brandColor(v));
    }
    const st = attr(t, 'stroke');
    if (st && st.startsWith('#')) {
      if (st.toLowerCase() === HARD_INK) {
        const fill = attr(t, 'fill');
        const sw = parseFloat(attr(t, 'stroke-width') || '2');
        if (fill && fill !== 'none') {
          t = setAttr(t, 'stroke', softEdge(fill));
          t = setAttr(t, 'stroke-width', String(Math.max(1, +(sw * 0.45).toFixed(2))));
          t = setAttr(t, 'stroke-opacity', '.55');
        } else {
          // detail lines (mouths, stitching, seams): a warm brown, a touch finer
          t = setAttr(t, 'stroke', '#6b5642');
          t = setAttr(t, 'stroke-width', String(+(sw * 0.8).toFixed(2)));
        }
      } else {
        t = setAttr(t, 'stroke', brandColor(st));
      }
    }
    return t;
  });
}

/** A faint paper grain, as <defs> + a filter id to put on the art's group. */
export function grainFilter(id: string, opacity = 0.06) {
  return `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="1" seed="3" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 .5  0 0 0 0 .42  0 0 0 0 .3  0 0 0 ${opacity} 0" result="gc"/><feComposite in="gc" in2="SourceGraphic" operator="in" result="gi"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="gi"/></feMerge></filter>`;
}
