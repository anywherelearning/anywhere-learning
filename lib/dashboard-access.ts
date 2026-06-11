/**
 * Resolves the planner access tier for the current request.
 *
 * The planner's automation (Generate, AI, Programs) is the membership's
 * skill-building engine, so it's member-only. Manual planning and browsing
 * are the free taste. This helper tells routes and the access endpoint which
 * tier the current viewer is.
 *
 * Tiers:
 *   - 'member'  → full access (active subscription)
 *   - 'starter' → Starter Pack holder (treated as taste, like guest, for the planner)
 *   - 'guest'   → signed-out or anonymous demo
 *
 * When Clerk is NOT configured at all (local dev / owner preview), we return
 * 'member' so the owner can use the whole thing without a membership system
 * running. In production (Clerk configured) the real tier is enforced.
 */

import { getAccessTierForClerkId, type AccessTier } from '@/lib/access';

export type { AccessTier };

export async function getDashboardTier(): Promise<AccessTier> {
  // Local-only override so the owner can preview any tier without a live
  // subscription. Ignored in production for safety.
  if (process.env.NODE_ENV !== 'production') {
    const forced = process.env.DASHBOARD_DEV_TIER;
    if (forced === 'member' || forced === 'starter' || forced === 'guest') return forced;
  }

  // No Clerk configured → demo/owner mode, full access.
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return 'member';

  try {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = await auth();
    if (!userId) return 'guest';
    return await getAccessTierForClerkId(userId);
  } catch {
    return 'guest';
  }
}

/** Convenience: does this viewer get the member-only automation? */
export async function isDashboardMember(): Promise<boolean> {
  return (await getDashboardTier()) === 'member';
}
