/**
 * Membership checkout. Creates a Stripe Checkout session in subscription mode
 * for the active-phase membership price ($99/year founder or $149/year standard,
 * controlled by IS_FOUNDER_PHASE in lib/membership).
 *
 * POST body (all optional):
 *   email — pre-fills the Stripe Checkout email field
 *   referralCode — applied as a Stripe coupon if present (future)
 *
 * Returns: { url: string } — redirect the browser to this URL.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { STRIPE_PRICES, requirePriceId } from '@/lib/stripe-prices';
import { isFounderPhaseOpen } from '@/lib/membership';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';
import { getStarterPackCreditEligibility } from '@/lib/access';
import { STARTER_PACK_CREDIT_COUPON_ID } from '@/lib/starter-pack-credit';

function getSiteOrigin(req: NextRequest): string {
  if (process.env.NEXT_PUBLIC_URL) return process.env.NEXT_PUBLIC_URL.replace(/\/$/, '');
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  const host = req.headers.get('host') || 'localhost:3000';
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  try {
    const limited = await checkRateLimit(req, standardLimiter());
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const emailInput = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const customerEmail = emailRegex.test(emailInput) ? emailInput : undefined;

    // Require sign-in for membership checkout. This serves two purposes:
    //   1. Lets us reliably apply the Starter Pack credit to eligible buyers
    //      (we need a Clerk userId to look up their purchase history).
    //   2. Prevents the bad outcome where a Starter Pack buyer pays full $99
    //      because they hadn't signed in — they'd lose their $45 credit.
    //
    // Returns 401 with a `signInUrl` so the client can redirect to Clerk's
    // sign-in flow and come back to /join afterward.
    let clerkId: string | null = null;
    let clerkEmail: string | undefined;
    let clerkConfigured = false;
    try {
      const a = await auth();
      clerkId = a.userId;
      clerkConfigured = true;
      if (clerkId) {
        const u = await currentUser();
        clerkEmail = u?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
      }
    } catch {
      /* Clerk not configured — skip the auth gate entirely. */
    }
    if (clerkConfigured && !clerkId) {
      return NextResponse.json(
        {
          error: 'sign_in_required',
          message: 'Please sign in to start your membership. This way we can apply your Starter Pack credit if you qualify.',
          signInUrl: '/sign-in?redirect_url=/join',
        },
        { status: 401 },
      );
    }

    // Real-time founder check: if 100+ active members already exist, this
    // returns false and the buyer goes to the $149 standard tier — even
    // though the static IS_FOUNDER_PHASE flag is still true. Existing
    // founders keep their $99 rate; only NEW signups are affected.
    const offerFounderRate = await isFounderPhaseOpen();
    const priceId = requirePriceId(
      offerFounderRate ? STRIPE_PRICES.MEMBERSHIP_FOUNDER : STRIPE_PRICES.MEMBERSHIP_STANDARD,
      offerFounderRate ? 'Membership Founder' : 'Membership Standard',
    );

    const origin = getSiteOrigin(req);

    // Starter Pack credit: if signed in AND has bought the Starter Pack AND
    // hasn't yet redeemed the credit, apply the one-time coupon to the first
    // invoice. The "first year only" rule is enforced by Stripe via the
    // coupon's duration='once'. The "once per user" rule is enforced in our
    // DB via users.starterPackCreditAppliedAt (set by the webhook on success).
    const creditEligibility = clerkId
      ? await getStarterPackCreditEligibility(clerkId)
      : null;
    const applyStarterPackCredit = !!creditEligibility?.eligible;

    // Debug log: shows up in the dev server console (and Vercel logs in prod)
    // so we can see exactly what the route decided about the credit per request.
    console.log('[checkout/membership] credit decision:', {
      clerkId,
      eligible: applyStarterPackCredit,
      reason: creditEligibility?.reason ?? 'no-clerk-id',
    });

    // Stripe rejects requests that contain BOTH `allow_promotion_codes`
    // and `discounts` (even when one is false). So when we auto-apply the
    // credit, we must omit `allow_promotion_codes` entirely from the
    // request payload — not just set it to false.
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      ...(applyStarterPackCredit
        ? { discounts: [{ coupon: STARTER_PACK_CREDIT_COUPON_ID }] }
        : { allow_promotion_codes: true }),
      billing_address_collection: 'auto',
      customer_email: clerkEmail || customerEmail,
      client_reference_id: clerkId || undefined,
      subscription_data: {
        metadata: {
          tier: 'member',
          // Capture the rate offered to this specific buyer (not the global
          // static flag) so the webhook + downstream emails know the true
          // founder status of THIS subscription.
          founder_phase: String(offerFounderRate),
          // True when the Starter Pack credit was applied at checkout, so the
          // webhook knows to flip users.starterPackCreditAppliedAt on success.
          starter_pack_credit_applied: String(applyStarterPackCredit),
          ...(clerkId && { clerk_id: clerkId }),
        },
      },
      success_url: `${origin}/checkout/success?tier=member&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/join?cancelled=1`,
      // Note: Stripe's `after_expiration.recovery` is NOT supported in
      // `subscription` mode — only `payment` mode. Abandoned-membership
      // emails fall back to /join (handled in the webhook's recoveryUrl
      // fallback), which is fine: a new checkout takes a few seconds.
      metadata: {
        kind: 'membership',
        tier: 'member',
        starter_pack_credit_applied: String(applyStarterPackCredit),
        ...(clerkId && { clerk_id: clerkId }),
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe did not return a checkout URL' }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    // Don't leak Stripe internals to the client
    console.error('[checkout/membership]', err);
    const isConfigError = message.includes('Stripe price ID') || message.includes('STRIPE_SECRET_KEY');
    return NextResponse.json(
      { error: isConfigError ? message : 'Could not start checkout. Please try again.' },
      { status: 500 },
    );
  }
}
