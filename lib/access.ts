/**
 * Resolves a user's access tier (`member` / `starter` / `guest`) from the DB.
 *
 * Order of precedence:
 *   1. Active subscription in `subscriptions` table → 'member'
 *   2. `users.starterPackPurchasedAt` is set → 'starter'
 *   3. else → 'guest'
 *
 * "Active" means status === 'active' OR ('canceled' with currentPeriodEnd in
 * the future — they paid through the year, we honour it).
 */

import { db } from '@/lib/db';
import { users, subscriptions } from '@/lib/db/schema';
import { eq, and, or, gt } from 'drizzle-orm';

export type AccessTier = 'guest' | 'starter' | 'member';

/** Resolve tier for a signed-in Clerk user. Returns 'guest' if anything fails. */
export async function getAccessTierForClerkId(clerkId: string): Promise<AccessTier> {
  try {
    const rows = await db
      .select({
        userId: users.id,
        starterPackPurchasedAt: users.starterPackPurchasedAt,
      })
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    const u = rows[0];
    if (!u) return 'guest';

    // 1) Active subscription wins, BUT only if currentPeriodEnd is still in
    // the future. This belt-and-suspenders matters in two cases:
    //   - Refund path: we set periodEnd = now after canceling, so even
    //     before customer.subscription.deleted arrives, access drops.
    //   - Missed-event recovery: if Vercel was down when Stripe fired a
    //     cancellation event and our DB still says 'active' with the old
    //     periodEnd in the past, the date guard rejects them anyway.
    const subRows = await db
      .select({ status: subscriptions.status, periodEnd: subscriptions.currentPeriodEnd })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, u.userId),
          or(eq(subscriptions.status, 'active'), eq(subscriptions.status, 'canceled')),
          gt(subscriptions.currentPeriodEnd, new Date()),
        ),
      )
      .limit(1);
    if (subRows.length > 0) return 'member';

    // 2) Starter Pack
    if (u.starterPackPurchasedAt) return 'starter';

    return 'guest';
  } catch (err) {
    console.error('[access] getAccessTierForClerkId failed:', err);
    return 'guest';
  }
}

/** Find a user row by email — used by the Stripe webhook before Clerk is linked. */
export async function findUserByEmail(email: string) {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  return rows[0] || null;
}
