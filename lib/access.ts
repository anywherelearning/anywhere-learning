/**
 * Resolves a user's access tier (`member` / `trial` / `guest`) from the DB.
 *
 * Order of precedence:
 *   1. Subscription in `subscriptions` table → 'member' (paid) or 'trial'
 *      (status 'trialing': free trial, view everything in the in-app reader
 *      but no downloads — downloading is a paid-member benefit)
 *   2. else → 'guest'
 *
 * "Active" means status === 'active' OR ('canceled' with currentPeriodEnd in
 * the future, they paid through the year, we honour it). A trial canceled
 * early never lands in that bucket: the webhook sets periodEnd = now when a
 * trial is canceled, so the date guard drops them to guest immediately.
 */

import { db } from '@/lib/db';
import { users, subscriptions } from '@/lib/db/schema';
import { eq, and, or, gt, sql } from 'drizzle-orm';

export type AccessTier = 'guest' | 'member' | 'trial';

export interface AccessContext {
  tier: AccessTier;
  /** Internal users.id, handy for follow-up queries. Null for unknown users. */
  userId: string | null;
  /** Trial end date (== subscriptions.currentPeriodEnd while trialing). */
  trialEndsAt: Date | null;
  /** Stripe Price ID of the granting subscription — lets callers tell the
   *  monthly plan from annual (e.g. plan-correct upgrade price labels). */
  stripePriceId: string | null;
}

/** Resolve tier + trial context for a signed-in Clerk user. */
export async function getAccessContextForClerkId(clerkId: string): Promise<AccessContext> {
  const guest: AccessContext = { tier: 'guest', userId: null, trialEndsAt: null, stripePriceId: null };
  try {
    const rows = await db
      .select({ userId: users.id })
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    const u = rows[0];
    if (!u) return guest;

    // 1) Subscription wins, BUT only if currentPeriodEnd is still in
    // the future. This belt-and-suspenders matters in two cases:
    //   - Refund path: we set periodEnd = now after canceling, so even
    //     before customer.subscription.deleted arrives, access drops.
    //   - Missed-event recovery: if Vercel was down when Stripe fired a
    //     cancellation event and our DB still says 'active' with the old
    //     periodEnd in the past, the date guard rejects them anyway.
    const subRows = await db
      .select({
        status: subscriptions.status,
        periodEnd: subscriptions.currentPeriodEnd,
        stripePriceId: subscriptions.stripePriceId,
      })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, u.userId),
          or(
            eq(subscriptions.status, 'active'),
            eq(subscriptions.status, 'trialing'),
            eq(subscriptions.status, 'canceled'),
          ),
          gt(subscriptions.currentPeriodEnd, new Date()),
        ),
      )
      .limit(1);
    const sub = subRows[0];
    if (sub) {
      if (sub.status === 'trialing') {
        return {
          tier: 'trial',
          userId: u.userId,
          trialEndsAt: sub.periodEnd,
          stripePriceId: sub.stripePriceId,
        };
      }
      return {
        tier: 'member',
        userId: u.userId,
        trialEndsAt: null,
        stripePriceId: sub.stripePriceId,
      };
    }

    return { ...guest, userId: u.userId };
  } catch (err) {
    console.error('[access] getAccessContextForClerkId failed:', err);
    return guest;
  }
}

/** Resolve tier for a signed-in Clerk user. Returns 'guest' if anything fails. */
export async function getAccessTierForClerkId(clerkId: string): Promise<AccessTier> {
  return (await getAccessContextForClerkId(clerkId)).tier;
}

/**
 * One free trial per customer, ever (the Twinkl rule). Eligible iff the user
 * has no subscription row of ANY status. A canceled trial, a refunded
 * membership, and an active membership all burn the trial.
 *
 * Fails CLOSED (no trial) on DB errors: worst case an eligible new customer
 * checks out without a trial, which beats handing out unlimited trials when
 * the DB blips.
 */
export async function isTrialEligible(clerkId: string): Promise<boolean> {
  try {
    const rows = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(subscriptions)
      .innerJoin(users, eq(subscriptions.userId, users.id))
      .where(eq(users.clerkId, clerkId));
    return (rows[0]?.n ?? 0) === 0;
  } catch (err) {
    console.error('[access] isTrialEligible failed:', err);
    return false;
  }
}

// NOTE: Trial members are view-only (no downloads), so the per-guide download
// ledger that used to live here was removed. The `trial_downloads` table is
// retained in the schema for now (harmless, already migrated) but unused.

/** Find a user row by email — used by the Stripe webhook before Clerk is linked. */
export async function findUserByEmail(email: string) {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  return rows[0] || null;
}
