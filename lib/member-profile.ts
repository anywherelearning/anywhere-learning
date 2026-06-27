/**
 * The member profile is intentionally tiny: just the kids and their ages.
 *
 * Everything else a parent might want (which kid this week, how much time,
 * what focus) changes week to week, so it is NOT stored here. It is asked
 * fresh each time via the "Find this week's activities" picker. See
 * lib/weekly-plan.ts for the picker request shape and the matching engine.
 *
 * Ages rarely change, so this is captured once at /account/welcome and reused.
 * Lives in localStorage, matching how the dashboard persists progress
 * (al_account_state_v1 in AccountDashboard).
 */

import type { Effort } from './activity-effort';
import { notifyLocalChanged } from './account-sync';

export interface Child {
  /** Stable id so the plan survives a rename (the plan keys on this, not name). */
  id?: string;
  name: string;
  /** Birth month as 'YYYY-MM'. Age is derived from this so it stays current. */
  birthMonth?: string | null;
  /** Legacy fixed age (older profiles). Used only as a fallback. */
  age?: number | null;
}

export function genChildId(): string {
  return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Current age derived from birth month, falling back to a legacy fixed age. */
export function childAge(c: Child): number | null {
  if (c.birthMonth) {
    const [y, m] = c.birthMonth.split('-').map(Number);
    if (!y || !m) return c.age ?? null;
    const now = new Date();
    let age = now.getFullYear() - y;
    if (now.getMonth() + 1 < m) age -= 1;
    return age >= 0 ? age : null;
  }
  return c.age ?? null;
}

export interface MemberProfile {
  children: Child[];
  completedAt: string;
  version: 1;
}

const STORAGE_KEY = 'al_member_profile_v1';

/**
 * Focus themes shown in the picker. Each expands to the category slugs the
 * engine should prefer. "Surprise us" sends an empty list = no category bias.
 */
export interface FocusOption {
  value: string;
  label: string;
  categories: string[];
}

export const FOCUS_THEMES: FocusOption[] = [
  {
    value: 'less-screens',
    label: 'Less screen time',
    // everything hands-on, away from a screen (excludes the AI/digital track)
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
  },
  {
    value: 'creativity',
    label: 'Creativity',
    categories: ['creativity-maker', 'communication-writing'],
  },
  {
    value: 'independence',
    label: 'Independence and life skills',
    categories: [
      'emotional-social-skills',
      'planning-problem-solving',
      'real-world-math',
      'entrepreneurship',
    ],
  },
  { value: 'surprise', label: 'Surprise us', categories: [] },
];

/** Individual subjects, mapped 1:1 to category slugs, for "pick a subject". */
export const SUBJECT_OPTIONS: { value: string; label: string }[] = [
  { value: 'outdoor-learning', label: 'Outdoors and nature' },
  { value: 'creativity-maker', label: 'Building and making' },
  { value: 'real-world-math', label: 'Real-world math' },
  { value: 'entrepreneurship', label: 'Money and business' },
  { value: 'communication-writing', label: 'Writing and storytelling' },
  { value: 'ai-literacy', label: 'Tech and AI' },
  { value: 'planning-problem-solving', label: 'Planning and problem-solving' },
  { value: 'emotional-social-skills', label: 'Feelings and friendships' },
  { value: 'worldschooling', label: 'Travel and cultures' },
];

/** Time options shown in the picker. 'any' means no time constraint. */
export const TIME_OPTIONS: { value: Effort | 'any'; label: string; detail: string }[] = [
  { value: 'Quick', label: 'Quick', detail: '30 to 60 minutes' },
  { value: 'Half-Day', label: 'Half-day', detail: '3 to 4 hours' },
  { value: 'Project', label: 'A project', detail: 'Multiple days' },
  { value: 'any', label: 'Any', detail: "Whatever's a good fit" },
];

export function loadProfile(): MemberProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as MemberProfile;
    // Backfill stable ids on any child that predates them, then persist once.
    let changed = false;
    p.children = (p.children ?? []).map((c) => {
      if (!c.id) {
        changed = true;
        return { ...c, id: genChildId() };
      }
      return c;
    });
    if (changed) saveProfile(p);
    return p;
  } catch {
    return null;
  }
}

export function saveProfile(profile: MemberProfile) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    notifyLocalChanged();
  } catch {
    /* ignore quota errors */
  }
}

export function hasProfile(): boolean {
  return loadProfile() !== null;
}

export function clearProfile() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
