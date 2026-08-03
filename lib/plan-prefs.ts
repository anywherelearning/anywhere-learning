/**
 * Family planning preferences, captured in the first-run setup and used by the
 * Skills Map engine (lib/plan-engine.ts) to personalise the rotation:
 *  - territories: which Skills Map areas to include (default: all 12)
 *  - efforts: which activity lengths to include (default: all)
 *
 * Walk mode (one family trail vs one per child) lives in lib/kid-roadmap
 * (`walkMode`/`setWalkMode`), which existing plan code already reads.
 */

import { TERRITORIES } from './roadmap';
import type { Effort } from './activity-effort';
import { notifyLocalChanged } from './account-sync';

const STORAGE_KEY = 'al_plan_prefs_v1';

export const ALL_EFFORTS: Effort[] = ['Quick', 'Half-Day', 'Project'];
export const EFFORT_LABEL: Record<Effort, string> = {
  Quick: 'Quick (1–2 hours)',
  'Half-Day': 'Half-day',
  Project: 'Multi-day projects',
};

export interface PlanPrefs {
  territories: string[]; // enabled Skills Map territory slugs
  efforts: Effort[]; // enabled activity lengths
}

export function defaultPrefs(): PlanPrefs {
  return { territories: TERRITORIES.map((t) => t.slug), efforts: [...ALL_EFFORTS] };
}

export function loadPrefs(): PlanPrefs {
  if (typeof window === 'undefined') return defaultPrefs();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPrefs();
    const p = JSON.parse(raw) as Partial<PlanPrefs>;
    const d = defaultPrefs();
    const territories = Array.isArray(p.territories) && p.territories.length ? p.territories : d.territories;
    const efforts = Array.isArray(p.efforts) && p.efforts.length ? (p.efforts as Effort[]) : d.efforts;
    return { territories, efforts };
  } catch {
    return defaultPrefs();
  }
}

export function savePrefs(p: PlanPrefs) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    notifyLocalChanged();
  } catch {
    /* ignore quota */
  }
}
