import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId, getActiveSubscription } from '@/lib/db/queries';
import { relaxedLimiter, checkRateLimit } from '@/lib/rate-limit';

/**
 * Client-side membership status check.
 * Used by nav components to conditionally show "Library" vs "Membership" links.
 */
export async function GET(req: NextRequest) {
  // Rate limit: 30 req / 60s - lightweight read endpoint
  const limited = await checkRateLimit(req, relaxedLimiter());
  if (limited) return limited;

  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ isMember: false });
    }

    const user = await getUserByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ isMember: false });
    }

    const subscription = await getActiveSubscription(user.id);

    if (subscription) {
      return NextResponse.json({
        isMember: true,
        plan: subscription.stripePriceId,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        currentPeriodEnd: subscription.currentPeriodEnd,
      });
    }

    return NextResponse.json({ isMember: false });
  } catch {
    return NextResponse.json({ isMember: false });
  }
}
