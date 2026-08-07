import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAccessTierForClerkId } from '@/lib/access';

/**
 * GET /api/user/access
 * The signed-in user's access tier, straight from the database.
 *
 * Marketing pages are static, so they can't resolve this at render time. Clerk's
 * publicMetadata.tier is a convenience mirror the Stripe webhook stamps, and it
 * drifts: nothing resets it when a subscription is removed outside the webhook
 * (a wiped test row, a manual Stripe cleanup), so a header reading it can claim
 * membership the database won't honor. This endpoint is the same source /account
 * and every content endpoint gate on, so the public header agrees with them.
 *
 * Returns 'guest' for signed-out visitors, matching /api/user/purchases, which
 * answers with an empty list rather than a 401.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ tier: 'guest' });
    // getAccessTierForClerkId already fails closed to 'guest'.
    return NextResponse.json({ tier: await getAccessTierForClerkId(userId) });
  } catch {
    return NextResponse.json({ tier: 'guest' });
  }
}
