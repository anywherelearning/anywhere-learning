/**
 * Dual taxonomy for the member dashboard:
 *
 * 1. CATEGORIES - the 9 Anywhere Learning content categories (from lib/categories.ts).
 *    Used to classify activities by product line.
 *
 * 2. SUBJECTS - the 7 homeschool reporting subjects (Math, Science, ELA, etc.).
 *    Used for portfolio-style logging and legal reporting. Each activity maps to
 *    one or more subjects so completed-work exports look like a real curriculum.
 *
 * Users can also create their own subjects (stored in DB per user_id).
 */

import { CATEGORIES, CATEGORY_LABELS, CATEGORY_ACTIVE_COLORS } from './categories';

export { CATEGORIES, CATEGORY_LABELS, CATEGORY_ACTIVE_COLORS };

// ─────────────────────────────────────────────────────────────────────────────
// STANDARD SUBJECTS (homeschool reporting taxonomy)
// ─────────────────────────────────────────────────────────────────────────────

export interface SubjectDef {
  id: string;
  label: string;
  color: string; // hex
  description: string;
}

export const STANDARD_SUBJECTS: SubjectDef[] = [
  {
    id: 'math',
    label: 'Math',
    color: '#8b7355',
    description: 'Arithmetic, geometry, measurement, financial math, problem-solving.',
  },
  {
    id: 'science',
    label: 'Science',
    color: '#6b8e6b',
    description: 'Biology, physics, chemistry, earth science, scientific method.',
  },
  {
    id: 'ela',
    label: 'ELA',
    color: '#5b8fa8',
    description: 'Reading, writing, grammar, vocabulary, communication.',
  },
  {
    id: 'history',
    label: 'History & Social Studies',
    color: '#a8825b',
    description: 'History, geography, civics, cultural studies, world events.',
  },
  {
    id: 'art',
    label: 'Art',
    color: '#c47a8f',
    description: 'Visual art, music, theatre, design, creative expression.',
  },
  {
    id: 'pe',
    label: 'PE & Health',
    color: '#c4836a',
    description: 'Physical activity, outdoor movement, nutrition, well-being.',
  },
  {
    id: 'life',
    label: 'Life Skills',
    color: '#d4a373',
    description: 'Practical skills, home economics, financial literacy, self-management.',
  },
];

export const STANDARD_SUBJECT_IDS = new Set(STANDARD_SUBJECTS.map((s) => s.id));

export function getSubjectById(id: string): SubjectDef | undefined {
  return STANDARD_SUBJECTS.find((s) => s.id === id);
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY → SUBJECT MAPPING
// Each AL category implies one or more subjects. Used as the default subject
// suggestion when logging an activity. Users can edit subjects per-entry.
// ─────────────────────────────────────────────────────────────────────────────

export const CATEGORY_TO_SUBJECTS: Record<string, string[]> = {
  'start-here': ['life'],
  'ai-literacy': ['science', 'ela', 'life'],
  'communication-writing': ['ela'],
  'creativity-maker': ['art', 'science'],
  'entrepreneurship': ['math', 'life', 'ela'],
  'outdoor-learning': ['science', 'pe'],
  'planning-problem-solving': ['math', 'life'],
  'real-world-math': ['math', 'life'],
  'worldschooling': ['history', 'ela'],
  'bundle': [],
};

export function defaultSubjectsForCategory(category: string | null | undefined): string[] {
  if (!category) return [];
  return CATEGORY_TO_SUBJECTS[category] || [];
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTRY TYPES (logged in Activity Log)
// ─────────────────────────────────────────────────────────────────────────────

export interface LogEntryTypeDef {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export const LOG_ENTRY_TYPES: LogEntryTypeDef[] = [
  {
    id: 'activity',
    label: 'Activity',
    icon: '✿',
    description: 'A completed Anywhere Learning activity.',
  },
  {
    id: 'custom',
    label: 'Custom activity',
    icon: '+',
    description: 'A homeschool activity you ran yourself.',
  },
  {
    id: 'field-trip',
    label: 'Field trip',
    icon: '⌗',
    description: 'A museum, park, factory tour, or other off-site learning.',
  },
  {
    id: 'book',
    label: 'Book',
    icon: '◧',
    description: 'A book read together or independently.',
  },
  {
    id: 'documentary',
    label: 'Documentary / video',
    icon: '◐',
    description: 'A film, documentary, or educational video.',
  },
  {
    id: 'lesson',
    label: 'Lesson / class',
    icon: '◆',
    description: 'A music lesson, sport class, co-op session, tutoring.',
  },
  {
    id: 'project',
    label: 'Project',
    icon: '✦',
    description: 'A multi-day project or sustained build.',
  },
];

export const LOG_ENTRY_TYPE_IDS = new Set(LOG_ENTRY_TYPES.map((t) => t.id));

export function getLogEntryTypeById(id: string): LogEntryTypeDef | undefined {
  return LOG_ENTRY_TYPES.find((t) => t.id === id);
}
