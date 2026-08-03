// ─── Explorer gear ───
//
// Every finished activity earns the kid's explorer one piece of gear, sized to
// the activity's effort: a Quick activity yields a small "trail find", a
// Half-Day activity everyday kit, a multi-day Project a big piece. Gear is NOT
// tied to skill areas (skills live on the parent's Learning Record); it is
// pure "my explorer is getting ready for anything". Every item fits in or on a
// backpack, or is worn.
//
// Placeholder art for now: each gear renders as a tinted tile with its name.
// The real illustrated set comes later (Claude Design) and drops into GearIcon.

import type { Effort } from './activity-effort';

export type GearTier = 'find' | 'everyday' | 'big';

export interface GearDef {
  id: string;
  name: string;
  tier: GearTier;
}

export const TIER_META: Record<GearTier, { label: string; color: string; note: string }> = {
  find: { label: 'Trail find', color: '#8b9a7d', note: 'a small keepsake for the pack' },
  everyday: { label: 'Everyday gear', color: '#c99a5b', note: 'kit you reach for all the time' },
  big: { label: 'Big gear', color: '#b5654a', note: 'the stuff you brag about' },
};

/** Quick → find, Half-Day → everyday, Project → big. */
export function tierForEffort(effort: Effort): GearTier {
  if (effort === 'Project') return 'big';
  if (effort === 'Half-Day') return 'everyday';
  return 'find';
}

function mk(tier: GearTier, names: string[]): GearDef[] {
  return names.map((name) => ({ id: `${tier}:${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, name, tier }));
}

export const GEAR: Record<GearTier, GearDef[]> = {
  find: mk('find', [
    'Feather', 'Smooth stone', 'Pinecone', 'Seashell', 'Acorn', 'Cool leaf', 'Pressed flower',
    'Four-leaf clover', 'Crystal', 'Arrowhead', 'Marble', 'Lucky coin', 'Bottle cap', 'Sticker',
    'Enamel pin', 'Patch', 'Keychain', 'Shark tooth', 'Fossil', "Robin's egg", 'Friendship bracelet',
    'Trail mix', 'Bandana', 'Glow stick', 'Map scrap',
  ]),
  everyday: mk('everyday', [
    'Water bottle', 'Snack pouch', 'Sun hat', 'Sunglasses', 'Gloves', 'Wool socks', 'Flashlight',
    'Magnifying glass', 'Notebook', 'Pencil set', 'First-aid pouch', 'Bug spray', 'Rain poncho',
    'Camp mug', 'Spork', 'Carabiner', 'Wristwatch', 'Pocket mirror', 'Whistle', 'Compass',
  ]),
  big: mk('big', [
    'Backpack', 'Bigger backpack', 'Expedition pack', 'Hiking boots', 'Waterproof boots', 'Rain jacket',
    'Warm jacket', 'Tent', 'Sleeping bag', 'Sleeping pad', 'Binoculars', 'Headlamp', 'Canteen',
    'Walking stick', 'Trekking poles', 'Climbing rope', 'Camp stove', 'Cook pot', 'Fishing rod',
    'Camera', 'Lantern', 'Spyglass', 'Multi-tool', 'Hammock', 'Water filter', 'Dry bag', 'Grappling hook',
  ]),
};

const ALL_BY_ID: Record<string, GearDef> = Object.fromEntries(
  (['find', 'everyday', 'big'] as GearTier[]).flatMap((t) => GEAR[t].map((g) => [g.id, g])),
);

export function gearById(id: string): GearDef | undefined {
  return ALL_BY_ID[id];
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface EarnedGear extends GearDef {
  /** The activity that earned it, and when (for the reveal + the record). */
  slug: string;
  at: string;
}

/**
 * The gear a kid owns, derived from their completion log (oldest first).
 * Deterministic: the same history always yields the same pack. Within a tier
 * we hand out fresh items first (no immediate duplicates); once a tier's pool
 * is exhausted, favourites come back around.
 */
export function packFor(
  kidId: string,
  completions: { slug: string; at: string; effort: Effort }[],
): EarnedGear[] {
  const usedByTier: Record<GearTier, Set<string>> = { find: new Set(), everyday: new Set(), big: new Set() };
  const out: EarnedGear[] = [];
  completions.forEach((c, i) => {
    // The very first activity — whatever it is — always earns the Backpack, so
    // there's something to collect everything else into from then on.
    if (i === 0) {
      const bp = GEAR.big.find((g) => g.id === 'big:backpack');
      if (bp) {
        usedByTier.big.add(bp.id);
        out.push({ ...bp, slug: c.slug, at: c.at });
        return;
      }
    }
    const tier = tierForEffort(c.effort);
    const pool = GEAR[tier];
    const used = usedByTier[tier];
    if (used.size >= pool.length) used.clear(); // wrapped around, start a fresh cycle
    let idx = hash(kidId + ':' + c.slug) % pool.length;
    for (let step = 0; step < pool.length; step++) {
      const g = pool[(idx + step) % pool.length];
      if (!used.has(g.id)) {
        used.add(g.id);
        out.push({ ...g, slug: c.slug, at: c.at });
        break;
      }
    }
  });
  return out;
}
