/**
 * Gear stickers, v2 (Sept 2026 redesign). Every one of the 72 pieces of gear
 * is drawn in one style (same outline weight, flat colour + a highlight) and
 * sits on a badge whose shape says its tier:
 *   trail find  → round, sage   ·  everyday gear → rounded square, gold
 *   big gear    → shield, rust
 * Near-duplicates are drawn to be told apart (the three packs, two jackets,
 * two boots, stick vs poles).
 */

import { gearById, type GearTier } from './gear';

const K = '#3b3226';
const W = 2.6;

const S = (d: string, fill: string, extra = '') =>
  `<path d="${d}" fill="${fill}" stroke="${K}" stroke-width="${W}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
const L = (d: string, w = W, c = K) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const C = (x: number, y: number, r: number, fill: string, w = W) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${K}" stroke-width="${w}"/>`;
const R = (x: number, y: number, w: number, h: number, r: number, fill: string, sw = W) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${K}" stroke-width="${sw}"/>`;
const E = (x: number, y: number, rx: number, ry: number, fill: string, w = W) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${K}" stroke-width="${w}"/>`;
const HI = (d: string) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".65"/>`;

// palette
const GR = '#5e8757', GRD = '#4c7147', SG = '#8fae7f', TE = '#4f7a8c', TEL = '#6c97a8', RU = '#c26a45', RUL = '#d0684a',
  GO = '#c99a5b', GOL = '#e8c99a', CR = '#fbf4e6', BR = '#8b6a45', BRD = '#6b4a2f', ST = '#b8b0a0', RO = '#e89a8a',
  LV = '#9b87c8', YE = '#f2c14e', GY = '#6c7a86', SK = '#9fd0da';

const ART: Record<string, string> = {
  // ── trail finds ──
  'Feather': S('M-18,24 Q-22,-8 10,-28 Q20,-10 6,10 Q-6,22 -18,24 Z', '#5f9ea0') + L('M-18,24 Q-4,4 10,-24', 2.2) + L('M-8,6 L2,2 M-12,14 L-2,12 M-2,-6 L8,-10', 2),
  'Smooth stone': E(0, 4, 26, 18, ST) + HI('M-14,-4 Q-4,-10 8,-8') + E(8, 10, 5, 3, '#a39a8a', 0),
  'Pinecone': S('M0,-28 Q18,-14 16,6 Q12,26 0,30 Q-12,26 -16,6 Q-18,-14 0,-28 Z', '#8b5e3c') + L('M-14,-4 Q0,4 14,-4 M-15,8 Q0,16 15,8 M-10,20 Q0,26 10,20 M-8,-16 Q0,-10 8,-16', 2.2),
  'Seashell': S('M-26,14 Q-26,-22 0,-26 Q26,-22 26,14 Q12,22 0,20 Q-12,22 -26,14 Z', '#f2c1b0') + L('M0,20 L0,-22 M-10,19 L-14,-18 M10,19 L14,-18 M-19,16 L-24,-6 M19,16 L24,-6', 2) + S('M-8,20 L8,20 L5,28 L-5,28 Z', '#e6a591'),
  'Acorn': E(0, 10, 15, 18, GOL) + S('M-20,-2 Q-20,-18 0,-18 Q20,-18 20,-2 Q10,4 0,4 Q-10,4 -20,-2 Z', BRD) + L('M0,-18 L3,-28', 3.4, BRD) + HI('M-8,6 Q-8,16 -2,22'),
  'Cool leaf': S('M0,-30 Q28,-6 0,30 Q-28,-6 0,-30 Z', '#d98b3a') + L('M0,-24 L0,28 M0,-8 L12,-16 M0,-8 L-12,-16 M0,6 L12,-2 M0,6 L-12,-2', 2),
  'Pressed flower': R(-26, -26, 52, 52, 4, CR) + [0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-10" rx="7" ry="10" fill="${RO}" stroke="${K}" stroke-width="2" transform="rotate(${a})"/>`).join('') + C(0, 0, 6, YE, 2),
  'Four-leaf clover': [0, 90, 180, 270].map((a) => `<path d="M0,0 Q-14,-12 -8,-20 Q0,-24 0,-14 Q0,-24 8,-20 Q14,-12 0,0 Z" fill="#5e9a54" stroke="${K}" stroke-width="2.4" stroke-linejoin="round" transform="rotate(${a})"/>`).join('') + L('M2,4 Q10,18 6,28', 3, '#3f6a3a'),
  'Crystal': S('M0,-30 L16,-8 L10,26 L-10,26 L-16,-8 Z', LV) + S('M0,-30 L6,-8 L4,26 L-4,26 L-6,-8 Z', '#b9a8de') + L('M-16,-8 L16,-8', 2),
  'Arrowhead': S('M0,-30 Q20,-4 12,26 L4,20 L0,28 L-4,20 L-12,26 Q-20,-4 0,-30 Z', '#7d7468') + L('M0,-20 L0,16', 2, '#5f574c') + L('M-6,-8 L-2,-4 M6,-8 L2,-4 M-8,6 L-3,10 M8,6 L3,10', 1.6, '#5f574c'),
  'Marble': C(0, 0, 22, '#4fa3a8') + `<path d="M-18,-4 Q0,-16 18,2 Q6,8 -6,4 Q-14,2 -18,-4 Z" fill="${CR}" opacity=".6"/>` + `<circle cx="-8" cy="-10" r="4" fill="#fff" opacity=".85"/>`,
  'Lucky coin': C(0, 0, 24, GO) + C(0, 0, 17, '#d9ad6a', 2) + S('M0,-10 L3,-3 L10,-2 L5,3 L6,10 L0,6 L-6,10 L-5,3 L-10,-2 L-3,-3 Z', '#f2d38f', 'stroke-width="1.8"'),
  'Bottle cap': `<circle r="25" fill="${RUL}" stroke="${K}" stroke-width="${W}" stroke-dasharray="6 3"/>` + C(0, 0, 17, CR) + S('M-8,6 L0,-8 L8,6 Z', GR, 'stroke-width="2"'),
  'Sticker': R(-22, -22, 44, 44, 8, '#e28aa0') + S('M22,6 L22,22 L6,22 Z', CR, 'stroke-width="2.2"') + `<path d="M-8,-6 L0,-14 L8,-6 L4,6 L-4,6 Z" fill="${YE}" stroke="${K}" stroke-width="2"/>`,
  'Enamel pin': C(0, -6, 20, GO) + C(0, -6, 14, GR, 2) + `<path d="M-9,0 L-3,-10 L2,0 Z M1,0 L6,-7 L10,0 Z" fill="${CR}"/>` + L('M0,14 L0,28', 3.4, GY),
  'Patch': S('M-22,-24 L22,-24 L22,2 Q22,22 0,28 Q-22,22 -22,2 Z', GR) + `<path d="M-16,-18 L16,-18 L16,2 Q16,16 0,21 Q-16,16 -16,2 Z" fill="none" stroke="${CR}" stroke-width="2" stroke-dasharray="4 3"/>` + S('M-8,8 L0,-8 L8,8 Z', GOL, 'stroke-width="2"'),
  'Keychain': `<circle cx="-10" cy="-14" r="11" fill="none" stroke="${K}" stroke-width="7"/><circle cx="-10" cy="-14" r="11" fill="none" stroke="#b9bec4" stroke-width="3.6"/>` + L('M-2,-6 L6,4', 3, GY) + `<g transform="rotate(14 12 14)">${R(2, 2, 20, 24, 6, RUL)}${C(12, 9, 2.4, CR, 1.6)}</g>`,
  'Shark tooth': S('M-18,-18 Q0,-26 18,-18 L6,-8 L0,28 L-6,-8 Z', '#f4efe2') + L('M-18,-18 Q0,-26 18,-18', 6, '#a8997e') + L('M-18,-18 Q0,-26 18,-18', 2.4),
  'Fossil': C(0, 0, 25, '#c7bfae') + L('M0,0 Q8,0 8,-8 Q8,-16 -2,-16 Q-14,-16 -14,-2 Q-14,14 2,14 Q16,14 18,2', 3, '#6f665a'),
  "Robin's egg": S('M0,-28 Q20,-8 20,8 Q20,28 0,28 Q-20,28 -20,8 Q-20,-8 0,-28 Z', '#8ec9c4') + `<circle cx="-7" cy="0" r="2.2" fill="#4f8a82"/><circle cx="6" cy="10" r="2.2" fill="#4f8a82"/><circle cx="-2" cy="18" r="2" fill="#4f8a82"/><circle cx="5" cy="-8" r="2" fill="#4f8a82"/>` + HI('M-10,-10 Q-12,-2 -12,4'),
  'Friendship bracelet': `<circle r="20" fill="none" stroke="${K}" stroke-width="12"/><circle r="20" fill="none" stroke="${GOL}" stroke-width="7"/>` + [[0, -20, GR], [19, -6, RUL], [12, 16, TE], [-12, 16, LV], [-19, -6, YE]].map(([x, y, c]) => C(x as number, y as number, 5.5, c as string, 2)).join(''),
  'Trail mix': S('M-18,-14 L18,-14 L20,24 Q0,30 -20,24 Z', GOL) + R(-19, -24, 38, 11, 5, GO) + C(-8, 2, 3.4, BRD, 1.6) + C(6, 8, 3.4, RUL, 1.6) + C(-4, 14, 3, GR, 1.6) + C(9, -4, 3, '#f4efe2', 1.6),
  'Bandana': R(-26, -18, 52, 10, 5, '#b8492f') + S('M-24,-10 L24,-10 L0,24 Z', RUL) + `<circle cx="-8" cy="-2" r="2" fill="#fff"/><circle cx="8" cy="-2" r="2" fill="#fff"/><circle cx="0" cy="8" r="2" fill="#fff"/>`,
  'Glow stick': `<g transform="rotate(-35)"><rect x="-8" y="-28" width="16" height="56" rx="8" fill="#9be05a" stroke="${K}" stroke-width="${W}"/>${HI('M-2,-20 L-2,14')}</g>` + L('M20,-22 L26,-28 M24,-8 L32,-10 M8,-30 L8,-36', 2.4, '#8fcf4f'),
  'Map scrap': S('M-24,-18 L-8,-24 L8,-18 L24,-24 L24,18 L8,24 L-8,18 L-24,24 Z', CR) + L('M-8,-24 L-8,18 M8,-18 L8,24', 2) + `<path d="M-18,8 Q-10,-4 0,2 Q8,6 14,-8" fill="none" stroke="${RUL}" stroke-width="2.4" stroke-dasharray="3 3"/>` + L('M12,-12 L18,-6 M18,-12 L12,-6', 2.4, RUL),

  // ── everyday gear ──
  'Water bottle': S('M-12,-14 Q-12,-20 -6,-20 L6,-20 Q12,-20 12,-14 L12,26 Q12,30 8,30 L-8,30 Q-12,30 -12,26 Z', '#6e9f6a') + R(-7, -30, 14, 10, 3, '#3f5f3c') + R(-12, 0, 24, 12, 0, GOL, 2.2) + L('M7,-26 Q20,-26 18,-12', 2.4),
  'Snack pouch': S('M-18,-20 L18,-20 L20,24 Q0,28 -20,24 Z', '#e3a44a') + L('M-18,-12 L18,-12', 2.2) + L('M-18,-16 L18,-16', 1.6) + C(0, 6, 8, CR, 2) + `<path d="M-3,6 L3,6 M0,3 L0,9" stroke="${RUL}" stroke-width="2.4" stroke-linecap="round"/>`,
  'Sun hat': S('M-30,8 Q0,-4 30,8 Q32,16 22,16 Q0,8 -22,16 Q-32,16 -30,8 Z', '#d9b77e') + S('M-16,6 Q-16,-20 0,-20 Q16,-20 16,6 Q0,2 -16,6 Z', '#e4c690') + `<path d="M-15,0 Q0,-4 15,0 L15,5 Q0,1 -15,5 Z" fill="${GR}" stroke="${K}" stroke-width="2"/>`,
  'Sunglasses': L('M-26,-4 L26,-4', 3.4) + R(-26, -10, 22, 18, 8, '#2e2a26') + R(4, -10, 22, 18, 8, '#2e2a26') + L('M-4,-2 Q0,-6 4,-2', 3) + HI('M-20,-4 L-14,-4') + HI('M10,-4 L16,-4'),
  'Gloves': S('M-24,24 L-24,-2 Q-24,-10 -18,-10 L-18,-20 Q-18,-24 -14,-24 Q-10,-24 -10,-20 L-10,-12 L-8,-12 L-8,-22 Q-8,-26 -4,-26 Q0,-26 0,-22 L0,24 Z', '#b8492f') + S('M4,24 L4,-2 Q4,-10 10,-10 L10,-20 Q10,-24 14,-24 Q18,-24 18,-20 L18,-12 L20,-12 L20,-22 Q20,-26 24,-26 Q28,-26 28,-22 L28,24 Z', '#b8492f') + L('M-24,16 L0,16 M4,16 L28,16', 2.4, CR),
  'Wool socks': S('M-22,-26 L-8,-26 L-8,8 Q-8,20 -18,24 Q-30,26 -28,16 Q-26,10 -22,8 Z', '#e4d6c0') + L('M-22,-18 L-8,-18 M-22,-12 L-8,-12', 2.2, RUL) + S('M6,-26 L20,-26 L20,8 Q20,20 10,24 Q-2,26 0,16 Q2,10 6,8 Z', '#e4d6c0') + L('M6,-18 L20,-18 M6,-12 L20,-12', 2.2, GR),
  'Flashlight': `<g transform="rotate(-35)">${S('M-8,-6 L8,-6 L8,28 Q8,32 4,32 L-4,32 Q-8,32 -8,28 Z', TE)}${S('M-13,-22 L13,-22 L8,-6 L-8,-6 Z', TEL)}${S('M-13,-26 L13,-26 L13,-22 L-13,-22 Z', '#f6e3a6')}${R(-3, 4, 6, 8, 2, YE, 2)}</g>` + L('M12,-34 L18,-40 M22,-24 L30,-26 M4,-40 L4,-48', 2.4, '#e0a93b'),
  'Magnifying glass': L('M10,10 L26,26', 9) + L('M10,10 L26,26', 5, BR) + C(-6, -6, 20, '#d8eef2') + `<circle cx="-6" cy="-6" r="20" fill="none" stroke="${GO}" stroke-width="5"/>` + `<circle cx="-6" cy="-6" r="20" fill="none" stroke="${K}" stroke-width="2.6"/>` + HI('M-16,-12 Q-12,-20 -4,-20'),
  'Notebook': R(-20, -26, 40, 52, 4, GR) + R(-14, -26, 34, 52, 3, '#6e9f6a', 2) + L('M-20,-16 L-14,-16 M-20,-4 L-14,-4 M-20,8 L-14,8 M-20,20 L-14,20', 2.4) + R(-4, -14, 18, 12, 2, CR, 2),
  'Pencil set': [-14, 0, 14].map((x, i) => `<g transform="translate(${x} 0) rotate(${[-8, 0, 8][i]})">${S('M-5,-22 L5,-22 L5,16 L0,26 L-5,16 Z', [YE, RUL, TE][i])}${S('M-5,16 L5,16 L0,26 Z', '#f0d6b0', 'stroke-width="2"')}</g>`).join(''),
  'First-aid pouch': R(-24, -18, 48, 38, 8, RUL) + L('M-24,-8 L24,-8', 2) + R(-7, -2, 14, 14, 1, '#fff', 0) + `<path d="M0,-4 L0,14 M-9,5 L9,5" stroke="#fff" stroke-width="5" stroke-linecap="round"/>` + R(-6, -26, 12, 8, 3, '#b8492f'),
  'Bug spray': R(-12, -14, 24, 42, 5, '#8bbf9a') + R(-7, -24, 14, 10, 2, GY) + R(-3, -30, 8, 6, 2, GY) + S('M-6,2 Q0,-6 6,2 Q6,10 0,14 Q-6,10 -6,2 Z', CR, 'stroke-width="2"') + `<circle cx="14" cy="-30" r="2" fill="${SK}"/><circle cx="20" cy="-26" r="2" fill="${SK}"/><circle cx="18" cy="-34" r="1.6" fill="${SK}"/>`,
  'Rain poncho': S('M0,-24 Q-8,-24 -10,-14 L-28,20 Q-28,26 -20,26 L20,26 Q28,26 28,20 L10,-14 Q8,-24 0,-24 Z', '#f2c14e') + S('M-10,-14 Q0,-30 10,-14 Q0,-8 -10,-14 Z', '#e0a93b') + L('M0,-10 L0,24', 2, '#c9962f'),
  'Camp mug': S('M-18,-18 L14,-18 L14,20 Q14,26 8,26 L-12,26 Q-18,26 -18,20 Z', '#dfe7ea') + L('M14,-8 Q28,-8 28,4 Q28,14 14,14', 3.6) + `<rect x="-18" y="-18" width="32" height="6" fill="${TE}" stroke="${K}" stroke-width="2"/>` + L('M-8,-28 Q-4,-34 -8,-40 M2,-28 Q6,-34 2,-40', 2.2, '#b8b0a0'),
  'Spork': `<g transform="rotate(20)">${S('M-3,-2 L3,-2 L4,30 Q0,34 -4,30 Z', '#c5ccd2')}${S('M-10,-16 Q-10,-30 0,-30 Q10,-30 10,-16 Q10,-4 0,-2 Q-10,-4 -10,-16 Z', '#c5ccd2')}${L('M-4,-30 L-4,-24 M0,-30 L0,-24 M4,-30 L4,-24', 2)}</g>`,
  'Carabiner': `<path d="M-6,-26 Q-22,-26 -22,-8 L-22,10 Q-22,28 -6,28 L6,28 Q22,28 22,10 L22,-8 Q22,-26 6,-26 Z" fill="none" stroke="${K}" stroke-width="11"/>` + `<path d="M-6,-26 Q-22,-26 -22,-8 L-22,10 Q-22,28 -6,28 L6,28 Q22,28 22,10 L22,-8 Q22,-26 6,-26 Z" fill="none" stroke="#e08a3a" stroke-width="6"/>` + L('M20,-10 L20,10', 4, '#b9bec4'),
  'Wristwatch': R(-10, -32, 20, 64, 5, '#8b6a45') + C(0, 0, 17, GOL) + C(0, 0, 12, CR, 2) + L('M0,0 L0,-8 M0,0 L6,3', 2.4),
  'Pocket mirror': C(0, -4, 22, RO) + C(0, -4, 16, '#d8eef2', 2) + HI('M-8,-12 L-2,-18') + HI('M-10,-4 L2,-16') + R(-5, 16, 10, 12, 3, RO),
  'Whistle': S('M-24,-8 L10,-8 Q26,-8 26,8 Q26,24 10,24 Q-4,24 -6,8 L-24,8 Z', '#e0a93b') + C(10, 8, 7, '#b7832b', 2) + L('M-26,-4 Q-32,-20 -18,-26', 2.4, RUL),
  'Compass': C(0, 0, 28, GO) + C(0, 0, 21, CR, 2.2) + S('M0,-16 L5,0 L0,16 L-5,0 Z', CR) + S('M0,-16 L5,0 L-5,0 Z', RUL) + `<circle r="2.6" fill="${K}"/>` + R(-5, -34, 10, 6, 2, GO),

  // ── big gear ──
  'Backpack': S('M-20,-14 Q-20,-26 -8,-26 L8,-26 Q20,-26 20,-14 L20,24 Q20,30 14,30 L-14,30 Q-20,30 -20,24 Z', GR) + S('M-14,4 L14,4 L14,20 Q14,24 10,24 L-10,24 Q-14,24 -14,20 Z', GRD) + S('M-18,-18 Q0,-8 18,-18 L18,-10 Q0,0 -18,-10 Z', GRD) + R(-4, -6, 8, 8, 2, GOL, 2),
  'Bigger backpack': S('M-22,-8 Q-22,-20 -10,-20 L10,-20 Q22,-20 22,-8 L22,26 Q22,32 16,32 L-16,32 Q-22,32 -22,26 Z', TE) + S('M-16,8 L16,8 L16,22 Q16,26 12,26 L-12,26 Q-16,26 -16,22 Z', '#3e6475') + S('M-24,-30 Q-24,-38 -16,-38 L16,-38 Q24,-38 24,-30 Q24,-22 16,-22 L-16,-22 Q-24,-22 -24,-30 Z', '#c9774f') + L('M-12,-38 L-12,-22 M12,-38 L12,-22', 2.2),
  'Expedition pack': L('M-14,-40 L-14,34 M14,-40 L14,34', 4, BR) + S('M-20,-26 Q-20,-34 -12,-34 L12,-34 Q20,-34 20,-26 L20,28 Q20,34 14,34 L-14,34 Q-20,34 -20,28 Z', RU) + S('M-14,6 L14,6 L14,24 L-14,24 Z', '#a8553a') + S('M-24,-16 Q-24,-22 -18,-22 L18,-22 Q24,-22 24,-16 Q24,-10 18,-10 L-18,-10 Q-24,-10 -24,-16 Z', GR) + L('M-14,-42 L14,-42', 4, BR),
  'Hiking boots': S('M-22,-24 L2,-24 L4,2 Q24,4 26,14 L26,22 L-22,22 Z', BRD) + L('M-22,16 L26,16', 2.4) + L('M-14,-16 L-4,-16 M-14,-8 L-4,-8 M-14,0 L-2,0', 2.4, GOL) + R(-24, -28, 28, 8, 3, GOL, 2),
  'Waterproof boots': S('M-20,-30 L4,-30 L4,0 Q24,2 26,12 L26,22 L-20,22 Z', '#3f7a7a') + L('M-20,14 L26,14', 2.4) + L('M-20,-20 L4,-20', 2.4, '#7fb1b1') + HI('M-14,-24 L-14,6'),
  'Rain jacket': S('M-12,-24 Q0,-34 12,-24 L24,-18 L30,10 L20,12 L18,28 L-18,28 L-20,12 L-30,10 L-24,-18 Z', '#f2c14e') + S('M-12,-24 Q0,-38 12,-24 Q0,-18 -12,-24 Z', '#e0a93b') + L('M0,-20 L0,28', 2, '#b7832b') + R(-14, 6, 9, 8, 2, '#e0a93b', 2),
  'Warm jacket': S('M-10,-24 L10,-24 L24,-16 L30,12 L20,14 L18,28 L-18,28 L-20,14 L-30,12 L-24,-16 Z', '#c4583f') + L('M-22,-6 L22,-6 M-20,8 L20,8 M-18,20 L18,20', 2.2, '#9e3f2b') + L('M0,-24 L0,28', 2) + R(-10, -30, 20, 8, 4, '#e8e0d0', 2),
  'Tent': S('M-32,24 L0,-26 L32,24 Z', GR) + S('M0,-26 L-10,24 L10,24 Z', GOL) + L('M-36,24 L36,24', 3) + L('M0,-26 L0,-34', 2.6) + S('M0,-34 L10,-31 L0,-28 Z', RUL, 'stroke-width="2"'),
  'Sleeping bag': S('M-26,-20 Q-26,-28 -16,-28 L16,-28 Q26,-28 26,-20 L26,22 Q26,28 18,28 L-18,28 Q-26,28 -26,22 Z', '#4f7a8c') + S('M-26,-20 Q-26,-28 -16,-28 L16,-28 Q26,-28 26,-20 L26,-8 L-26,-8 Z', '#7fa8b8') + L('M-26,6 L26,6 M-26,18 L26,18', 2, '#3e6475'),
  'Sleeping pad': `<g transform="rotate(-12)">${S('M-30,-6 L22,-6 Q30,-6 30,4 Q30,14 22,14 L-30,14 Z', '#e08a3a')}${E(-30, 4, 7, 10, '#e8a45e', 2.4)}${E(-30, 4, 3, 5, '#b8692a', 0)}</g>`,
  'Binoculars': S('M-24,-6 Q-24,-16 -14,-16 L-8,-16 L-8,22 Q-8,26 -12,26 L-20,26 Q-24,26 -24,22 Z', '#4b4b52') + S('M8,-16 L14,-16 Q24,-16 24,-6 L24,22 Q24,26 20,26 L12,26 Q8,26 8,22 Z', '#4b4b52') + R(-8, -6, 16, 14, 0, '#6a6a72') + C(-16, 22, 6, SK, 2.2) + C(16, 22, 6, SK, 2.2) + L('M-16,-16 Q0,-34 16,-16', 2.4, BR),
  'Headlamp': `<ellipse cx="0" cy="4" rx="28" ry="16" fill="none" stroke="${K}" stroke-width="8"/><ellipse cx="0" cy="4" rx="28" ry="16" fill="none" stroke="${GY}" stroke-width="4"/>` + R(-11, -18, 22, 18, 5, '#e08a3a') + C(0, -9, 6, '#f6e3a6', 2) + L('M-18,-26 L-24,-32 M0,-28 L0,-36 M18,-26 L24,-32', 2.4, '#e0a93b'),
  'Canteen': C(0, 4, 24, '#7a8b6a') + C(0, 4, 17, '#93a383', 0) + R(-5, -26, 10, 10, 2, GY) + L('M-22,-6 Q-30,-30 0,-32 Q30,-30 22,-6', 2.6, BR) + HI('M-10,-6 Q-14,4 -10,14'),
  'Walking stick': L('M-14,-30 L12,30', 9) + L('M-14,-30 L12,30', 5, BR) + E(-12, -24, 8, 5, GR, 2) + L('M-8,-12 L-4,-8 M0,2 L4,6', 2, BRD),
  'Trekking poles': [-10, 10].map((x, i) => L(`M${x - 6},-30 L${x + 4},30`, 7) + L(`M${x - 6},-30 L${x + 4},30`, 3.4, GY) + R(x - 11, -34, 10, 12, 3, [RUL, TE][i], 2) + `<circle cx="${x + 3}" cy="24" r="4" fill="none" stroke="${K}" stroke-width="2"/>`).join(''),
  'Climbing rope': [16, 10, 4].map((r) => `<circle r="${r}" fill="none" stroke="${K}" stroke-width="7"/><circle r="${r}" fill="none" stroke="#e08a3a" stroke-width="3.6"/>`).join('') + L('M16,0 Q26,14 20,28', 7) + L('M16,0 Q26,14 20,28', 3.6, '#e08a3a'),
  'Camp stove': R(-20, -2, 40, 22, 4, GY) + R(-24, -8, 48, 8, 3, '#8a96a0') + L('M-20,20 L-24,28 M20,20 L24,28', 3) + S('M-8,-8 Q-10,-20 0,-30 Q10,-20 8,-8 Z', '#f2a33b') + S('M-3,-8 Q-4,-16 0,-22 Q4,-16 3,-8 Z', YE, 'stroke-width="1.6"'),
  'Cook pot': S('M-24,-10 L24,-10 L22,20 Q22,26 16,26 L-16,26 Q-22,26 -22,20 Z', '#8a96a0') + R(-28, -16, 56, 8, 4, '#a9b3bb') + L('M-28,-4 L-34,-4 M28,-4 L34,-4', 4) + R(-5, -22, 10, 6, 3, K, 0) + L('M-8,-26 Q-4,-32 -8,-38 M4,-26 Q8,-32 4,-38', 2.2, '#b8b0a0'),
  'Fishing rod': L('M-24,28 L20,-30', 6) + L('M-24,28 L20,-30', 3, BR) + C(-14, 14, 6, GY, 2) + L('M20,-30 Q26,-10 24,8', 1.4) + `<path d="M24,8 q-4,6 0,10" fill="none" stroke="${K}" stroke-width="2"/>` + C(24, 4, 3, RUL, 1.6),
  'Camera': R(-26, -14, 52, 36, 7, TE) + R(-14, -22, 18, 10, 3, TEL) + C(4, 4, 13, '#2e2a26') + C(4, 4, 7, SK, 2) + HI('M0,0 L3,-3') + C(-18, -6, 3, YE, 1.6),
  'Lantern': R(-14, -18, 28, 36, 6, '#f6e3a6') + R(-18, 16, 36, 8, 3, RU) + R(-18, -24, 36, 8, 3, RU) + L('M-10,-24 Q0,-38 10,-24', 3) + S('M-4,4 Q-6,-6 0,-12 Q6,-6 4,4 Z', '#f2a33b', 'stroke-width="1.8"'),
  'Spyglass': `<g transform="rotate(-25)">${R(-30, -7, 22, 14, 3, BR)}${R(-10, -9, 22, 18, 3, GO)}${R(10, -11, 22, 22, 4, BR)}${E(32, 0, 3, 10, SK, 2)}</g>`,
  'Multi-tool': R(-26, -8, 52, 16, 8, '#c4583f') + S('M-18,-8 L-10,-30 L-4,-30 L-8,-8 Z', '#c5ccd2') + S('M4,-8 L10,-24 Q16,-24 14,-16 L10,-8 Z', '#c5ccd2') + `<path d="M-6,0 L6,0 M0,-6 L0,6" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
  'Hammock': L('M-30,-18 L-30,26 M30,-18 L30,26', 5, BR) + S('M-30,-12 Q0,26 30,-12 Q0,8 -30,-12 Z', '#d0684a') + L('M-22,-6 Q0,12 22,-6', 2, '#f6e3a6'),
  'Water filter': R(-10, -14, 20, 40, 6, '#dfe7ea') + R(-10, -2, 20, 16, 0, SK, 2) + R(-6, -24, 12, 10, 3, TE) + L('M6,-20 Q22,-22 22,-4', 3, TE) + `<circle cx="0" cy="32" r="3" fill="${SK}"/>`,
  'Dry bag': S('M-18,-10 L18,-10 L20,24 Q0,30 -20,24 Z', '#e0a93b') + S('M-22,-22 L22,-22 L20,-10 L-20,-10 Z', '#c9962f') + L('M-24,-26 Q0,-36 24,-26', 3) + C(-24, -26, 4, GY, 2) + C(24, -26, 4, GY, 2),
  'Grappling hook': L('M0,-30 L0,14', 5) + L('M0,-30 L0,14', 2.4, GY) + `<circle cx="0" cy="-30" r="5" fill="none" stroke="${K}" stroke-width="3"/>` + L('M0,14 Q-20,14 -20,-4 M0,14 Q20,14 20,-4 M0,14 L0,28', 5) + L('M0,14 Q-20,14 -20,-4 M0,14 Q20,14 20,-4 M0,14 L0,28', 2.4, GY),
};

const TIER_BG: Record<GearTier, [string, string]> = {
  find: ['#e7eedf', SG],
  everyday: ['#f6e8cf', GO],
  big: ['#f4ddd2', '#c4724f'],
};

function badge(tier: GearTier): string {
  const [bg, ring] = TIER_BG[tier];
  if (tier === 'find') return `<circle cx="60" cy="62" r="52" fill="#fff"/><circle cx="60" cy="60" r="44" fill="${bg}" stroke="${ring}" stroke-width="5"/>`;
  if (tier === 'everyday') return `<rect x="8" y="10" width="104" height="104" rx="30" fill="#fff"/><rect x="16" y="16" width="88" height="88" rx="24" fill="${bg}" stroke="${ring}" stroke-width="5"/>`;
  return `<path d="M60,4 L110,20 L108,64 Q104,100 60,118 Q16,100 12,64 L10,20 Z" fill="#fff" stroke-linejoin="round"/><path d="M60,12 L102,26 L100,64 Q96,94 60,110 Q24,94 20,64 L18,26 Z" fill="${bg}" stroke="${ring}" stroke-width="5" stroke-linejoin="round"/>`;
}

/** A gear sticker as an <svg>. `muted` = not collected yet (greyed). */
export function gearStickerSVG(gearId: string, muted = false): string {
  const g = gearById(gearId);
  const tier: GearTier = g?.tier ?? (gearId.split(':')[0] as GearTier) ?? 'find';
  const art = (g && ART[g.name]) || C(0, 0, 18, '#ddd');
  const style = muted ? 'display:block;width:100%;height:100%;filter:grayscale(1);opacity:.4' : 'display:block;width:100%;height:100%';
  return `<svg viewBox="0 0 120 124" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" style="${style}"><g style="filter:drop-shadow(0 3px 3px rgba(40,30,15,.25))">${badge(tier)}</g><g transform="translate(60 61) scale(.92)">${art}</g></svg>`;
}

/** Names that have art (for QA). */
export const GEAR_ART_NAMES = Object.keys(ART);
