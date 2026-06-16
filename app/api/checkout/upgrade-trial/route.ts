/**
 * POST /api/checkout/upgrade-trial — convert a free trial to a paid
 * membership immediately, so the member can download right away.
 *
 * The trial member already entered a card at signup (payment_method_collection
 * 'always'), so there's no second Checkout: we end the Stripe trial now, which
 * invoices and charges the saved card.
 *
 * SAFETY: the charge is atomic. We pass `payment_behavior: 'error_if_incomplete'`
 * so that if the card declines (or needs authentication we can't collect
 * off-session), Stripe rolls the change back — the subscription STAYS a trial,
 * nothing converts, and the call throws a card error we surface to the user.
 * We additionally verify the invoice is actually `paid` before flipping the DB
 * or returning ok. No access is ever granted without money clearing.
 *
 * Returns:
 *   { ok: true }                              → paid + converted
 *   { error: 'card_declined', message }       → card failed, still a trial
 *   { error: 'no_trial' | ... }               → nothing to convert / server error
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { users, subscriptions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';
import type Stripe from 'stripe';

export async function POST(req: NextRequest) {
  let subId: string | undefined;
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

    // Find this user's trialing subscription.
    const rows = await db
      .select({ subId: subscriptions.stripeSubscriptionId })
      .from(subscriptions)
      .innerJoin(users, eq(subscriptions.userId, users.id))
      .where(and(eq(users.clerkId, clerkId), eq(subscriptions.status, 'trialing')))
      .limit(1);

    subId = rows[0]?.subId;
    if (!subId) {
      // Not on a trial (already a member, or no subscription). Nothing to do.
      return NextResponse.json(
        { error: 'no_trial', message: 'No active trial to upgrade.' },
        { status: 409 },
      );
    }

    // End the trial now and charge the saved card ATOMICALLY:
    //   - error_if_incomplete → if the card can't be charged immediately,
    //     Stripe rolls back and throws; the sub stays trialing.
    //   - expand latest_invoice so we can confirm it's actually paid.
    const sub = await stripe.subscriptions.update(subId, {
      trial_end: 'now',
      proration_behavior: 'none',
      payment_behavior: 'error_if_incomplete',
      expand: ['latest_invoice'],
    });

    // Belt-and-suspenders: only treat this as converted if the subscription
    // is active AND its latest invoice is paid. (error_if_incomplete already
    // guarantees this, but we never want to grant access on a maybe.)
    const invoice = sub.latest_invoice as Stripe.Invoice | null;
    const paid = sub.status === 'active' && invoice?.status === 'paid';
    if (!paid) {
      console.warn('[upgrade-trial] not paid after update:', {
        subId,
        status: sub.status,
        invoiceStatus: invoice?.status,
      });
      return NextResponse.json(
        {
          error: 'card_declined',
          message:
            "We couldn't charge the card on file. Try a different card, then start your membership again.",
        },
        { status: 402 },
      );
    }

    // Paid. Update our DB inline so the immediate redirect to /account already
    // resolves as 'member'. The webhook also fires and is idempotent, so this
    // is a latency optimization, not the source of truth.
    const itemEnd = (
      sub.items.data[0] as (typeof sub.items.data)[0] & { current_period_end?: number }
    )?.current_period_end;
    const topEnd = (sub as Stripe.Subscription & { current_period_end?: number }).current_period_end;
    const periodEndUnix = topEnd ?? itemEnd ?? null;
    try {
      await db
        .update(subscriptions)
        .set({
          status: 'active',
          ...(periodEndUnix ? { currentPeriodEnd: new Date(periodEndUnix * 1000) } : {}),
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, subId));
    } catch (err) {
      console.warn('[upgrade-trial] inline DB update failed (webhook will catch up):', err);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    // A declined/unauthenticated card throws here (error_if_incomplete). The
    // subscription was rolled back to trialing, so it's safe to tell them to
    // try another card. Distinguish card errors from genuine server faults.
    const type = (err as { type?: string })?.type;
    if (type === 'StripeCardError' || type === 'StripeInvalidRequestError') {
      const message = (err as { message?: string })?.message;
      console.warn('[upgrade-trial] card error:', { subId, message });
      return NextResponse.json(
        {
          error: 'card_declined',
          message:
            "We couldn't charge the card on file. Try a different card, then start your membership again.",
        },
        { status: 402 },
      );
    }
    console.error('[checkout/upgrade-trial]', err);
    return NextResponse.json(
      { error: 'Could not start your membership. Please try again, or contact us.' },
      { status: 500 },
    );
  }
}
