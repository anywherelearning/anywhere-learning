/**
 * POST /api/checkout/cancel-trial — cancel a free trial the RIGHT way.
 *
 * Sets `cancel_at_period_end` on the trialing subscription instead of deleting
 * it. The member keeps full (view-only) trial access until day 14, then the
 * subscription ends with NO charge. This honors the "14 days free" promise:
 * canceling turns off the conversion, it doesn't end the trial early.
 *
 * POST body: { resume?: true } to undo a pending cancel (cancel_at_period_end
 * back to false) so the trial converts normally again.
 *
 * Immediate/hard cancellation (and refunds of paid memberships) stay with the
 * Stripe billing portal + the charge.refunded webhook path; this route is only
 * for the trial "don't charge me, but let me finish looking" case.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { users, subscriptions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const limited = await checkRateLimit(req, standardLimiter());
    if (limited) return limited;

    let clerkId: string | null = null;
    try {
      clerkId = (await auth()).userId;
    } catch {
      /* Clerk not configured */
    }
    if (!clerkId) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const resume = body?.resume === true;

    const rows = await db
      .select({ subId: subscriptions.stripeSubscriptionId })
      .from(subscriptions)
      .innerJoin(users, eq(subscriptions.userId, users.id))
      .where(and(eq(users.clerkId, clerkId), eq(subscriptions.status, 'trialing')))
      .limit(1);

    const subId = rows[0]?.subId;
    if (!subId) {
      return NextResponse.json(
        { error: 'no_trial', message: 'No active trial to change.' },
        { status: 409 },
      );
    }

    const sub = await stripe.subscriptions.update(subId, {
      cancel_at_period_end: !resume,
    });

    // Mirror to our DB so the UI reflects it without waiting on the webhook.
    try {
      await db
        .update(subscriptions)
        .set({ cancelAtPeriodEnd: sub.cancel_at_period_end ?? !resume, updatedAt: new Date() })
        .where(eq(subscriptions.stripeSubscriptionId, subId));
    } catch (err) {
      console.warn('[cancel-trial] inline DB update failed (webhook will catch up):', err);
    }

    return NextResponse.json({ ok: true, cancelAtPeriodEnd: sub.cancel_at_period_end ?? !resume });
  } catch (err) {
    console.error('[checkout/cancel-trial]', err);
    return NextResponse.json(
      { error: 'Could not update your trial. Please try again, or contact us.' },
      { status: 500 },
    );
  }
}
