/**
 * Trail state for the family: how they walk (one family path or a path per
 * kid), each kid's explorer avatar, per-kid milestone check-offs, and the
 * optional compass nudge (the parent pointing the engine at a territory).
 *
 * There is deliberately NO activity choosing here: the engine picks the next
 * step. The nudge is the only steering wheel.
 *
 * Stored in localStorage under al_roadmap_v1 and synced across devices via
 * lib/account-sync.ts, same as the profile, plan, and completions. Kid keys
 * are the stable child ids from lib/member-profile.ts.
 */

import { notifyLocalChanged } from './account-sync';

const STORAGE_KEY = 'al_roadmap_v1';

export type WalkMode = 'family' | 'individual';

/** A kid's explorer avatar.
 *  `base` is 'girl' | 'boy' | 'robot' | an animal (fox/owl/bear/rabbit/deer/frog).
 *  Humans use skin/hair/hairStyle; everyone has a body/clothes colour and an
 *  optional clothing piece. Legacy avatars stored { animal, color } are
 *  normalised on read (animal → base). */
export interface KidAvatar {
  base: string;
  color: string;
  skin?: string;
  hair?: string;
  hairStyle?: string;
  clothes?: string;
  /** @deprecated legacy field; read code maps it to `base`. */
  animal?: string;
}

interface RoadmapState {
  /** How this family walks the trails. Unset until the parent picks. */
  mode?: WalkMode;
  /** Compass nudges: territory overrides for the engine.
   *  Keyed by 'family' (family mode) or a child id (individual mode). */
  nudge: Record<string, string | null>;
  /** child id → checked milestone ids (from lib/roadmap.ts TERRITORIES). */
  milestones: Record<string, string[]>;
  /** child id → their explorer avatar. */
  avatars: Record<string, KidAvatar>;
}

function read(): RoadmapState {
  const empty: RoadmapState = { nudge: {}, milestones: {}, avatars: {} };
  if (typeof window === 'undefined') return empty;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const s = JSON.parse(raw) as Partial<RoadmapState> | null;
    // Each nested map must be a real object: mutators do state.x[key] = …,
    // which throws on a legacy/partial blob where the key is missing or wrong.
    const obj = <T,>(v: unknown): Record<string, T> =>
      v && typeof v === 'object' ? (v as Record<string, T>) : {};
    return {
      mode: s?.mode === 'family' || s?.mode === 'individual' ? s.mode : undefined,
      nudge: obj(s?.nudge),
      milestones: obj(s?.milestones),
      avatars: obj(s?.avatars),
    };
  } catch {
    return empty;
  }
}

function write(state: RoadmapState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    notifyLocalChanged();
  } catch {
    /* ignore quota errors */
  }
}

export function walkMode(): WalkMode | null {
  return read().mode ?? null;
}

export function setWalkMode(mode: WalkMode) {
  const state = read();
  state.mode = mode;
  write(state);
}

/** The compass nudge for a scope ('family' or a child id). */
export function nudgeFor(scope: string): string | null {
  return read().nudge[scope] ?? null;
}

/** Point the compass at a territory (or null to let the engine roam). */
export function setNudge(scope: string, territory: string | null) {
  const state = read();
  state.nudge[scope] = territory;
  write(state);
}

export function avatarFor(child: string): KidAvatar | null {
  const a = read().avatars[child];
  if (!a) return null;
  // Normalise legacy { animal, color } avatars to the new shape.
  if (!a.base && a.animal) return { ...a, base: a.animal };
  return a;
}

export function saveAvatar(child: string, avatar: KidAvatar) {
  const state = read();
  state.avatars[child] = avatar;
  write(state);
}

export function checkedMilestones(child: string): string[] {
  return read().milestones[child] ?? [];
}

export function toggleMilestone(child: string, milestoneId: string): string[] {
  const state = read();
  const current = state.milestones[child] ?? [];
  const next = current.includes(milestoneId)
    ? current.filter((m) => m !== milestoneId)
    : [...current, milestoneId];
  state.milestones[child] = next;
  write(state);
  return next;
}
