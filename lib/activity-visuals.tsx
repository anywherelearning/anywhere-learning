/**
 * Shared visual helpers for the weekly planner and schedule: per-category
 * subject icons, kid avatar colors, the effort -> time label, and the focus /
 * time option lists. The focus "reason" lines are reused from the approved
 * design and stay on-brand.
 */

import type { Effort } from './activity-effort';

/** Outline SVG path(s) per category, drawn in the subject's accent color. */
const CATEGORY_ICONS: Record<string, string[]> = {
  'outdoor-learning': ['M11 20A7 7 0 0 1 4 13c0-5 4-9 16-9 0 9-5 13-9 13z', 'M4 20c2-5 5-8 9-9'],
  'real-world-math': [
    'M5 3h14v18H5z',
    'M8 7h8',
    'M8 11h.01',
    'M12 11h.01',
    'M16 11h.01',
    'M8 15h.01',
    'M12 15h.01',
    'M16 15h.01',
  ],
  'creativity-maker': [
    'M12 3.2a8.8 8.8 0 1 0 1 17.7c1 .1 1.6-.7 1.6-1.6 0-1.3 1-2.1 2.3-2.1h.6a3 3 0 0 0 3-3c0-4.7-4.1-8.7-8.5-8.7z',
  ],
  'communication-writing': [
    'M12 6.6C10.4 4.9 8.2 4.1 5.4 4.1H4v12.8h2.5c2.2 0 3.9.6 5.5 1.8M12 6.6c1.6-1.7 3.8-2.5 6.6-2.5H20v12.8h-2.5c-2.2 0-3.9.6-5.5 1.8M12 6.6v12.1',
  ],
  'ai-literacy': ['M8 8h8v8H8z', 'M10 4v2M14 4v2M10 18v2M14 18v2M4 10h2M4 14h2M18 10h2M18 14h2'],
  entrepreneurship: [
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
    'M12 7v10',
    'M14.5 9.3c-.5-.8-1.5-1.3-2.5-1.3-1.4 0-2.5.9-2.5 2s1.1 2 2.5 2 2.5.9 2.5 2-1.1 2-2.5 2c-1 0-2-.5-2.5-1.3',
  ],
  'planning-problem-solving': [
    'M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8z',
    'M12 3v2.6M12 18.4V21M3 12h2.6M18.4 12H21M5.6 5.6l1.9 1.9M16.5 16.5l1.9 1.9M18.4 5.6l-1.9 1.9M7.5 16.5l-1.9 1.9',
  ],
  'emotional-social-skills': ['M12 20s-6.5-4.2-6.5-9A3.5 3.5 0 0 1 12 6.7 3.5 3.5 0 0 1 18.5 11c0 4.8-6.5 9-6.5 9z'],
  worldschooling: [
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
    'M3.5 12h17',
    'M12 3c2.6 2.4 2.6 15.6 0 18M12 3c-2.6 2.4-2.6 15.6 0 18',
  ],
};

export function CategoryIcon({
  category,
  color,
  size = 20,
}: {
  category: string;
  color: string;
  size?: number;
}) {
  const paths = CATEGORY_ICONS[category] ?? CATEGORY_ICONS['planning-problem-solving'];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

/** Friendly time label from an effort bucket (no fake precision). */
export function minsLabel(effort: Effort): string {
  return effort === 'Quick' ? 'Under an hour' : effort === 'Half-Day' ? 'Half-day' : 'Multi-day';
}

const KID_COLORS = ['#C97B5C', '#588157', '#B6748A', '#6b8e6b', '#8b7355', '#b5803e'];
export function kidColor(i: number): string {
  return KID_COLORS[i % KID_COLORS.length];
}

export function hexToRgba(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export interface FocusOption {
  id: string;
  label: string;
  categories: string[];
  reason: string;
}

/** The six in-the-moment focuses, mapped to catalog categories for the engine. */
export const FOCI: FocusOption[] = [
  {
    id: 'screen',
    label: 'Less screen time',
    categories: [
      'outdoor-learning',
      'creativity-maker',
      'real-world-math',
      'emotional-social-skills',
      'planning-problem-solving',
      'communication-writing',
      'worldschooling',
      'entrepreneurship',
    ],
    reason:
      'A real reason to put the screens down, the kind of thing they remember instead of a show.',
  },
  {
    id: 'creativity',
    label: 'Creativity',
    categories: ['creativity-maker'],
    reason:
      'Pure make-something time with no right answer, which is exactly where confidence grows.',
  },
  {
    id: 'life',
    label: 'Life skills',
    categories: [
      'emotional-social-skills',
      'planning-problem-solving',
      'real-world-math',
      'entrepreneurship',
    ],
    reason: 'A grown-up skill learned by actually doing it, not by being told about it.',
  },
  {
    id: 'reading',
    label: 'Reading and writing',
    categories: ['communication-writing'],
    reason: 'Words and storytelling the low-pressure way, so it never feels like a worksheet.',
  },
  {
    id: 'outdoors',
    label: 'Outdoors',
    categories: ['outdoor-learning'],
    reason: 'Gets everyone outside and moving, and resets the whole mood of the day.',
  },
  {
    id: 'surprise',
    label: 'Surprise us',
    categories: [],
    reason: 'A little of everything, hand-picked to fit the time you have this week.',
  },
];

/** Three time options; values map straight to effort buckets. */
export const TIMES: { id: Effort; label: string; desc: string }[] = [
  { id: 'Quick', label: 'Under an hour', desc: 'One quick activity' },
  { id: 'Half-Day', label: 'A half-day', desc: 'Something to sink into' },
  { id: 'Project', label: 'A multi-day project', desc: 'A few days, start to finish' },
];
