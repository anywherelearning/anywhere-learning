/**
 * Builds the engine's activity list from the catalog: every INDIVIDUAL activity
 * (one with an effort tag) turned into a PlanActivity. Bundles, packs, and
 * skills maps have no effort tag and are dropped here, so they can never be
 * surfaced as a weekly pick.
 */

import { getFallbackProducts } from './fallback-products';
import { CATEGORY_LABELS } from './categories';
import { EFFORT_BY_SLUG } from './activity-effort';
import { parseAgeRange, type PlanActivity } from './weekly-plan';

// Per-category accent colors (mirrors the dashboard / shop TRACKS map).
const TRACK_COLORS: Record<string, { color: string; deep: string }> = {
  'real-world-math': { color: '#588157', deep: '#3A5A40' },
  entrepreneurship: { color: '#C97B5C', deep: '#7A3D24' },
  'ai-literacy': { color: '#B6913F', deep: '#7A5E1F' },
  'communication-writing': { color: '#3A5A40', deep: '#26331F' },
  'planning-problem-solving': { color: '#588157', deep: '#3A5A40' },
  'creativity-maker': { color: '#C97B5C', deep: '#7A3D24' },
  'outdoor-learning': { color: '#3A5A40', deep: '#26331F' },
  worldschooling: { color: '#8A8470', deep: '#5A5240' },
  'emotional-social-skills': { color: '#B6748A', deep: '#7A4858' },
};

export function getPlanActivities(): PlanActivity[] {
  const out: PlanActivity[] = [];
  for (const p of getFallbackProducts()) {
    const effort = EFFORT_BY_SLUG[p.slug];
    if (!effort) continue; // not an individual activity
    const [ageMin, ageMax] = parseAgeRange(p.ageRange);
    const colors = TRACK_COLORS[p.category] ?? { color: '#588157', deep: '#3d5c3b' };
    out.push({
      slug: p.slug,
      title: p.name,
      excerpt: p.shortDescription,
      category: p.category,
      categoryLabel: CATEGORY_LABELS[p.category] ?? p.category,
      ageMin,
      ageMax,
      effort,
      trackColor: colors.color,
      trackDeep: colors.deep,
    });
  }
  return out;
}
