import { db } from '@/lib/db';
import { subscriptions, users } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

/**
 * Check whether a Clerk user has an active Annual Pass subscription.
 * Returns the subscription row if active, or null.
 */
export async function getActiveSubscription(clerkId: string) {
  const result = await db
    .select({
      id: subscriptions.id,
      status: subscriptions.status,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
      stripeSubscriptionId: subscriptions.stripeSubscriptionId,
    })
    .from(subscriptions)
    .innerJoin(users, eq(subscriptions.userId, users.id))
    .where(
      and(
        eq(users.clerkId, clerkId),
        inArray(subscriptions.status, ['active', 'past_due']),
      ),
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Quick boolean check: does this Clerk user have an active pass?
 */
export async function hasActivePass(clerkId: string): Promise<boolean> {
  const sub = await getActiveSubscription(clerkId);
  return sub !== null;
}

/**
 * Check whether a DB user ID has an active pass (for webhook/server contexts
 * where we have the internal user ID rather than clerkId).
 */
export async function hasActivePassByUserId(userId: string): Promise<boolean> {
  const result = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        inArray(subscriptions.status, ['active', 'past_due']),
      ),
    )
    .limit(1);

  return result.length > 0;
}
