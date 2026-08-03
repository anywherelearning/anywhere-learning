/**
 * The monthly family challenge (from This Month) as a small shared store, so
 * the Adventure Map home can react to it: an accepted challenge becomes the
 * family's active quest, and a finished one becomes a keepsake medal that stays
 * on the journey and shows on every explorer.
 *
 * One localStorage key, keyed by challengeId ("August:Hand over the morning").
 * Old versions stored a bare "accepted"/"done" string; readChallenges() upgrades
 * those on the fly so nothing breaks.
 */

const KEY = 'al_month_challenge_v1';

export type MonthChallengeStatus = 'accepted' | 'done';

export interface MonthChallengeEntry {
  status: MonthChallengeStatus;
  month: string;
  title: string;
  /** ISO timestamp of the last status change. */
  at: string;
}

export function readChallenges(): Record<string, MonthChallengeEntry> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    const out: Record<string, MonthChallengeEntry> = {};
    for (const [id, v] of Object.entries(raw)) {
      if (v === 'accepted' || v === 'done') {
        const [month, ...rest] = id.split(':');
        out[id] = { status: v, month, title: rest.join(':'), at: '' };
      } else if (v && typeof v === 'object' && 'status' in v) {
        out[id] = v as MonthChallengeEntry;
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function writeChallenge(id: string, entry: MonthChallengeEntry): void {
  if (typeof window === 'undefined') return;
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || '{}');
    all[id] = entry;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function clearChallenge(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || '{}');
    delete all[id];
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

/** The challenge the family has accepted but not yet finished (most recent). */
export function activeQuest(all: Record<string, MonthChallengeEntry> = readChallenges()): MonthChallengeEntry | null {
  const accepted = Object.values(all).filter((e) => e.status === 'accepted');
  if (!accepted.length) return null;
  return accepted.sort((a, b) => (a.at < b.at ? 1 : -1))[0];
}

/** Every finished challenge, newest first — the family's medal shelf. */
export function earnedMedals(all: Record<string, MonthChallengeEntry> = readChallenges()): MonthChallengeEntry[] {
  return Object.values(all)
    .filter((e) => e.status === 'done')
    .sort((a, b) => (a.at < b.at ? 1 : -1));
}
