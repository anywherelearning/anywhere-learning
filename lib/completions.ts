/**
 * A timestamped log of completed activities (per child). Powers two things:
 *   - persistent progress: the "X done" count survives a page refresh
 *   - resurfacing: the planner re-suggests a done activity only after 9 months,
 *     so favourites can come back year to year (you can always reopen one from
 *     the library before then).
 *
 * Stored in localStorage. `child` is the stable child id.
 */

import { notifyLocalChanged } from './account-sync';

const STORAGE_KEY = 'al_completions_v1';

interface Completion {
  slug: string;
  child: string;
  at: string; // ISO timestamp
}

function read(): Completion[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Completion[]) : [];
  } catch {
    return [];
  }
}

function write(list: Completion[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    notifyLocalChanged();
  } catch {
    /* ignore quota errors */
  }
}

export function recordCompletion(slug: string, child: string) {
  const list = read();
  list.push({ slug, child, at: new Date().toISOString() });
  write(list);
}

/** Completion counts per child within the last `days` (recent momentum). */
export function recentDoneByChild(days = 30): Record<string, number> {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const out: Record<string, number> = {};
  for (const c of read()) {
    if (Date.parse(c.at) >= cutoff) out[c.child] = (out[c.child] || 0) + 1;
  }
  return out;
}

/** Slugs completed within the last `months`. The planner excludes these so a
 *  done activity resurfaces only after the window passes. */
export function recentlyDoneSlugs(months = 9): Set<string> {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  const cutoff = d.getTime();
  const out = new Set<string>();
  for (const c of read()) {
    if (Date.parse(c.at) >= cutoff) out.add(c.slug);
  }
  return out;
}
