/**
 * "My Plan": the activities a parent has lined up, assigned PER CHILD so the
 * page can show each kid with their own list. Each entry is a (slug, child)
 * pair, so the same activity picked "for both" lands as one copy on each
 * child's plan with its own Start/Done.
 *
 * The plan is ongoing and persistent (no automatic weekly wipe), so parents can
 * tend it at their own pace. Items leave only when marked Done or removed.
 * Anything on the plan is excluded from fresh picks.
 */

import { notifyLocalChanged } from './account-sync';

const STORAGE_KEY = 'al_week_v1';

export interface WeekItem {
  slug: string;
  /** Child display label (name, or "Child 1" fallback). */
  child: string;
}

function read(): WeekItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Current shape: { items: [...] }. Back-compat: an older bare array.
    if (Array.isArray(parsed)) return parsed as WeekItem[];
    if (parsed && Array.isArray(parsed.items)) return parsed.items as WeekItem[];
    return [];
  } catch {
    return [];
  }
}

function write(items: WeekItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));
    notifyLocalChanged();
  } catch {
    /* ignore quota errors */
  }
}

export function loadWeek(): WeekItem[] {
  return read();
}

/** Set of slugs anywhere on the plan, for excluding from fresh picks. */
export function weekSlugs(): Set<string> {
  return new Set(read().map((i) => i.slug));
}

/** Add one activity to each given child's plan (deduped per child). */
export function addToWeek(slug: string, children: string[]): WeekItem[] {
  const items = [...read()];
  for (const child of children) {
    if (!items.some((i) => i.slug === slug && i.child === child)) {
      items.push({ slug, child });
    }
  }
  write(items);
  return items;
}

export function removeItem(slug: string, child: string): WeekItem[] {
  const items = read().filter((i) => !(i.slug === slug && i.child === child));
  write(items);
  return items;
}

export function clearWeek() {
  write([]);
}
