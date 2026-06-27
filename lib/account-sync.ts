/**
 * Cross-device sync glue. Bundles the four localStorage stores (kids profile,
 * plan, completions, library status) into one blob that the server persists per
 * member. The <AccountSync> component pulls on load and pushes on change; this
 * module just reads/writes the local keys and signals changes.
 */

const KEYS = {
  profile: 'al_member_profile_v1',
  week: 'al_week_v1',
  completions: 'al_completions_v1',
  status: 'al_account_state_v1',
} as const;

export type AccountState = Partial<Record<keyof typeof KEYS, unknown>>;

export function gatherLocalState(): AccountState {
  if (typeof window === 'undefined') return {};
  const out: AccountState = {};
  for (const k of Object.keys(KEYS) as (keyof typeof KEYS)[]) {
    try {
      const raw = localStorage.getItem(KEYS[k]);
      if (raw) out[k] = JSON.parse(raw);
    } catch {
      /* ignore */
    }
  }
  return out;
}

export function applyServerState(data: AccountState) {
  if (typeof window === 'undefined' || !data) return;
  for (const k of Object.keys(KEYS) as (keyof typeof KEYS)[]) {
    const v = data[k];
    if (v === undefined || v === null) continue;
    try {
      localStorage.setItem(KEYS[k], JSON.stringify(v));
    } catch {
      /* ignore */
    }
  }
}

export function isEmptyState(s: AccountState | null | undefined): boolean {
  return !s || (!s.profile && !s.week && !s.completions && !s.status);
}

/** Fire after any local store write so the sync layer can debounce a push. */
export function notifyLocalChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('al:local-changed'));
}
