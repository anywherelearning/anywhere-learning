// ─── One free guided activity per email address ───
//
// Each idea-list category gives away a different complete activity. This is the
// ledger that stops one person collecting all eight. See the `guideClaims`
// table comment in lib/db/schema.ts for the reasoning.
//
// Everything here is best-effort by design. The database is optional at runtime
// in this app, and a signup is worth more than a PDF, so every failure path
// returns "granted" rather than blocking the subscribe.

import { sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { guideClaims } from '@/lib/db/schema';

export type ClaimResult =
  /** First claim (or the same one again): hand over the guide. */
  | { status: 'granted' }
  /** Already claimed a different guide: show that one plus the membership. */
  | { status: 'already-claimed'; activitySlug: string };

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Record a claim for this address, or report the one it already has.
 *
 * A single INSERT ... ON CONFLICT DO NOTHING RETURNING does the whole thing:
 * a returned row means the claim was new, no row means one already existed and
 * we read it back. That keeps it atomic, so two submits racing each other can't
 * both be granted.
 */
export async function claimGuide(
  email: string,
  activitySlug: string,
  source?: string,
): Promise<ClaimResult> {
  const normalized = normalizeEmail(email);

  if (!process.env.DATABASE_URL) return { status: 'granted' };

  try {
    const db = getDb();

    const inserted = await db
      .insert(guideClaims)
      .values({ email: normalized, activitySlug, source: source ?? null })
      .onConflictDoNothing({ target: guideClaims.email })
      .returning({ activitySlug: guideClaims.activitySlug });

    // Row returned: this address had no claim, so it just made one.
    if (inserted.length > 0) return { status: 'granted' };

    // No row: a claim already exists. Read it to see which guide it was.
    const existing = await db
      .select({ activitySlug: guideClaims.activitySlug })
      .from(guideClaims)
      .where(sql`${guideClaims.email} = ${normalized}`)
      .limit(1);

    const prior = existing[0]?.activitySlug;
    if (!prior) return { status: 'granted' };

    // Re-requesting the same guide is not abuse, it's someone who lost the tab.
    if (prior === activitySlug) return { status: 'granted' };

    return { status: 'already-claimed', activitySlug: prior };
  } catch (err) {
    // Fail open: a missing table, a cold database, a network blip. None of these
    // are worth losing the subscriber over.
    console.error('guide claim check failed, granting:', err);
    return { status: 'granted' };
  }
}
