/**
 * Read/write the per-activity status the dashboard already tracks
 * (localStorage key al_account_state_v1, written by AccountDashboard).
 *
 * The picker uses this to exclude anything done or in progress, and to
 * auto-mark a picked activity as "started" so it never resurfaces as new.
 */

import { notifyLocalChanged } from './account-sync';

export type Status = 'started' | 'done';

interface PersistedState {
  status: Record<string, Status>;
  pinned: Record<string, boolean>;
}

const STORAGE_KEY = 'al_account_state_v1';

function load(): PersistedState {
  const empty: PersistedState = { status: {}, pinned: {} };
  if (typeof window === 'undefined') return empty;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<PersistedState> | null;
    // Normalize legacy/partial shapes: callers do `state.status[slug] = …`,
    // so both maps must always be real objects or that assignment throws
    // ("Cannot set properties of undefined") and takes the whole click with it.
    return {
      status: parsed && typeof parsed.status === 'object' && parsed.status ? parsed.status : {},
      pinned: parsed && typeof parsed.pinned === 'object' && parsed.pinned ? parsed.pinned : {},
    };
  } catch {
    return empty;
  }
}

/** Slugs to exclude from fresh picks: anything started or done. */
export function touchedSlugs(): Set<string> {
  const { status } = load();
  return new Set(Object.keys(status));
}

/** Slugs currently in progress. Excluded from picks, but not permanently like
 *  'done' (done is handled by the time-windowed completion log instead). */
export function startedSlugs(): Set<string> {
  const { status } = load();
  return new Set(Object.keys(status).filter((s) => status[s] === 'started'));
}

/** Mark an activity as started (does not downgrade a 'done'). */
export function markStarted(slug: string) {
  if (typeof window === 'undefined') return;
  const state = load();
  if (state.status[slug] === 'done') return;
  state.status[slug] = 'started';
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    notifyLocalChanged();
  } catch {
    /* ignore quota errors */
  }
}

/** Mark an activity as done so it never resurfaces in fresh picks. */
export function markDone(slug: string) {
  if (typeof window === 'undefined') return;
  const state = load();
  state.status[slug] = 'done';
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    notifyLocalChanged();
  } catch {
    /* ignore quota errors */
  }
}
