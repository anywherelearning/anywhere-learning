/**
 * Shared membership-checkout session builder.
 *
 * Used by two entry points:
 *   - POST /api/checkout/membership — the CheckoutButton on /join (XHR flow)
 *   - GET  /start-trial             — direct-link funnel for every
 *     "Start free trial" CTA across the site (nav, shop banners, etc.)
 *
 * Both resolve the same pricing, credit, and trial decisions; only the
 * transport (JSON vs redirect) differs.
 */

import { stripe } from '@/lib/stripe';
import { STRIPE_PRICES, requirePriceId } from '@/lib/stripe-prices';
import {
  isFounderPhaseOpen,
  TRIAL_DAYS,
  FOUNDER_PRICE_USD,
  POST_FOUNDER_PRICE_USD,
} from '@/lib/membership';
import {
  getAccessContextForClerkId,
  isTrialEligible,
} from '@/lib/access';

export type MembershipCheckoutResult =
  | { ok: true; url: string }
  | { ok: false; reason: 'already_member' | 'no_url' };

export async function createMembershipCheckout(opts: {
  clerkId: string | null;
  /** Pre-fills the Stripe Checkout email field. */
  email?: string;
  /** Site origin for success/cancel URLs, e.g. https://anywherelearning.co */
  origin: string;
}): Promise<MembershipCheckoutResult> {
  const { clerkId, email, origin } = opts;

  // Members and trial members already have a live subscription. Creating a
  // second one would double-bill them at Stripe, so send them to their
  // library instead.
  if (clerkId) {
    const access = await getAccessContextForClerkId(clerkId);
    if (access.tier === 'member' || access.tier === 'trial') {
      return { ok: false, reason: 'already_member' };
    }
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

  // Free trial: one per customer, ever. Anyone with a prior subscription
  // row (canceled trial, refunded membership, active membership) checks
  // out without a trial, and Stripe charges them immediately instead.
  // Requires a clerkId so the eligibility check has someone to look up;
  // when Clerk isn't configured (bare local dev) there's no trial.
  const applyTrial = clerkId ? await isTrialEligible(clerkId) : false;

  // Debug log (dev only): what the route decided about credit/trial/rate per
  // request. Gated so production checkout logs don't carry clerkIds.
  if (process.env.NODE_ENV !== 'production') {
    console.log('[membership-checkout] decision:', {
      clerkId,
      trial: applyTrial,
      founderRate: offerFounderRate,
    });
  }

  // Plain-words fine print shown above the pay button on the Stripe page.
  // Honest billing: spell out the trial mechanics and the founder rate
  // right where the card is entered, not just on our own pages.
  const priceUsd = offerFounderRate ? FOUNDER_PRICE_USD : POST_FOUNDER_PRICE_USD;
  const submitMessage = applyTrial
    ? `Free for ${TRIAL_DAYS} days: read every guide in your browser. Downloads unlock when your membership starts, $${priceUsd}/year${offerFounderRate ? ', your founder rate locked in for life' : ''}. Cancel anytime before then and pay nothing.`
    : offerFounderRate
      ? `Founder rate: $${FOUNDER_PRICE_USD}/year, locked in for life.`
      : undefined;

  const session = await stripe.checkout.sessions.create({
    ...(submitMessage && { custom_text: { submit: { message: submitMessage } } }),
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    customer_email: email,
    client_reference_id: clerkId || undefined,
    // Card upfront even though the trial invoice is $0. Auto-converting
    // trials are the whole point. Stripe charges the card at trial end.
    payment_method_collection: 'always',
    subscription_data: {
      ...(applyTrial && { trial_period_days: TRIAL_DAYS }),
      metadata: {
        tier: 'member',
        // Capture the rate offered to this specific buyer (not the global
        // static flag) so the webhook + downstream emails know the true
        // founder status of THIS subscription.
        founder_phase: String(offerFounderRate),
        trial_applied: String(applyTrial),
        ...(clerkId && { clerk_id: clerkId }),
      },
    },
    success_url: `${origin}/checkout/success?tier=member${applyTrial ? '&trial=1' : ''}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/join?cancelled=1`,
    // Note: Stripe's `after_expiration.recovery` is NOT supported in
    // `subscription` mode — only `payment` mode. Abandoned-membership
    // emails fall back to /join (handled in the webhook's recoveryUrl
    // fallback), which is fine: a new checkout takes a few seconds.
    metadata: {
      kind: 'membership',
      tier: 'member',
      ...(clerkId && { clerk_id: clerkId }),
    },
  });

  if (!session.url) return { ok: false, reason: 'no_url' };
  return { ok: true, url: session.url };
}
