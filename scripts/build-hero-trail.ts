/**
 * Regenerates public/product-shots/app-trail.svg, the homepage hero backdrop:
 * the real member trail map (Forest Valley, soft storybook art) with two
 * explorers part-way along and the gear they've earned on the signposts.
 * Run after changing lib/map-art, lib/explorer-art or lib/gear-art:
 *   npx tsx scripts/build-hero-trail.ts
 */
import { writeFileSync } from 'fs';
import { mapSceneSVG, TRAIL, SIGN_DY } from '../lib/map-art';
import { explorerSVG } from '../lib/explorer-art';
import { gearStickerSVG } from '../lib/gear-art';

const pts = TRAIL.wide;
const reached = 2;
const nest = (svg: string, x: number, y: number, w: number, h: number) =>
  svg.replace(/^<svg /, `<svg x="${x}" y="${y}" width="${w}" height="${h}" `).replace(/ style="[^"]*"/, '');

const gear = ['find:feather', 'everyday:compass', 'find:pinecone', 'everyday:magnifying-glass', 'big:backpack'];
const signs = pts.slice(0, reached).map(([x, y], i) => nest(gearStickerSVG(gear[i]), x - 30, y - SIGN_DY - 31, 60, 62)).join('');

const kit = ['big:backpack', 'everyday:sun-hat', 'find:bandana', 'big:hiking-boots'];
const [ex, ey] = pts[reached];
const liam = nest(explorerSVG({ base: 'boy', skin: '#e5b48f', hair: '#6b4a2b', hairStyle: 'short', shirt: '#6b8e6b', gearIds: kit, uid: 'hl' }), ex - 112, ey - 176, 140, 182);
const elena = nest(explorerSVG({ base: 'girl', skin: '#f1c9a5', hair: '#3b2a1c', hairStyle: 'ponytail', shirt: '#c4836a', gearIds: ['everyday:sun-hat', 'big:walking-stick'], uid: 'he' }), ex - 10, ey - 160, 124, 162);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax slice">${mapSceneSVG(0, 'wide', reached)}${signs}${liam}${elena}</svg>`;
writeFileSync('public/product-shots/app-trail.svg', svg);
console.log('wrote public/product-shots/app-trail.svg', (svg.length / 1024).toFixed(0) + 'KB');
