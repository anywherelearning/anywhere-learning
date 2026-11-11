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
  MONTHLY_PRICE_USD,
  type MembershipPlan,
} from '@/lib/membership';
import {
  getAccessContextForClerkId,
  isTrialEligible,
} from '@/lib/access';
import { BLACK_FRIDAY_OFFER, BLACK_FRIDAY_PRICE_USD, isBlackFridayActive } from '@/lib/black-friday';
import { metaMatchToMetadata, type MetaUserData } from '@/lib/meta-capi';
import { OWNER_OFFER, OWNER_OFFER_HOURS } from '@/lib/skills-map';
import { COOP_OFFER } from '@/lib/coop-offer';
import { db } from '@/lib/db';
import { mapPurchases } from '@/lib/db/schema';
import { and, eq, gt } from 'drizzle-orm';

/** True if this email bought the Skills Map within the owner-offer window. */
async function hasRecentMapPurchase(email: string | undefined): Promise<boolean> {
  if (!email) return false;
  try {
    const since = new Date(Date.now() - OWNER_OFFER_HOURS * 60 * 60 * 1000);
    const rows = await db
      .select({ id: mapPurchases.id })
      .from(mapPurchases)
      .where(and(eq(mapPurchases.email, email.toLowerCase()), gt(mapPurchases.createdAt, since)))
      .limit(1);
    return rows.length > 0;
  } catch (err) {
    console.error('[membership-checkout] map purchase lookup failed:', err);
    return false;
  }
}

export type MembershipCheckoutResult =
  | { ok: true; url: string; /** The co-op code applied, if any. */ coopCode?: string }
  | { ok: false; reason: 'already_member' | 'no_url' };

export async function createMembershipCheckout(opts: {
  clerkId: string | null;
  /** Pre-fills the Stripe Checkout email field. */
  email?: string;
  /** Site origin for success/cancel URLs, e.g. https://anywherelearning.co */
  origin: string;
  /** Billing plan. Annual (the featured, founder-eligible plan) by default. */
  plan?: MembershipPlan;
  /** Promo the buyer arrived with: 'bf' (from /black-friday, ignored outside
   *  the sale window) or 'map' (Skills Map owners, verified against
   *  map_purchases by email). */
  offer?: 'bf' | 'map';
  /** Co-op code from a flyer link (already sanitized). Applied only if it's a
   *  live promotion code on the co-op coupon (lib/coop-offer.ts). */
  coopCode?: string | null;
  /**
   * The buyer's Meta matching data (from userDataFromRequest). The Stripe
   * webhook that sends the server-side StartTrial runs on Stripe's request,
   * so it can only see these if we park them on the session here.
   */
  meta?: Pick<MetaUserData, 'clientIp' | 'userAgent' | 'fbp' | 'fbc'>;
}): Promise<MembershipCheckoutResult> {
  const { clerkId, email, origin } = opts;
  const plan: MembershipPlan = opts.plan === 'monthly' ? 'monthly' : 'annual';

  // Members and trial members already have a live subscription. Creating a
  // second one would double-bill them at Stripe, so send them to their
  // library instead.
  if (clerkId) {
    const access = await getAccessContextForClerkId(clerkId);
    if (access.tier === 'member' || access.tier === 'trial') {
      return { ok: false, reason: 'already_member' };
    }
  }

  // Real-time founder check: if 120+ active members already exist, this
  // returns false and the buyer goes to the standard tier — even
  // though the static IS_FOUNDER_PHASE flag is still true. Existing
  // founders keep their $99 rate; only NEW signups are affected.
  //
  // The monthly plan sits outside the founder system entirely: one $15/month
  // rate for everyone, no lock-in framing. offerFounderRate stays false so
  // none of the founder copy leaks into a monthly checkout.
  const offerFounderRate = plan === 'annual' ? await isFounderPhaseOpen() : false;
  const priceId =
    plan === 'monthly'
      ? requirePriceId(STRIPE_PRICES.MEMBERSHIP_MONTHLY, 'Membership Monthly')
      : requirePriceId(
          offerFounderRate ? STRIPE_PRICES.MEMBERSHIP_FOUNDER : STRIPE_PRICES.MEMBERSHIP_STANDARD,
          offerFounderRate ? 'Membership Founder' : 'Membership Standard',
        );

  // Free trial: one per customer, ever. Anyone with a prior subscription
  // row (canceled trial, refunded membership, active membership) checks
  // out without a trial, and Stripe charges them immediately instead.
  // Requires a clerkId so the eligibility check has someone to look up;
  // when Clerk isn't configured (bare local dev) there's no trial.
  const applyTrial = clerkId ? await isTrialEligible(clerkId) : false;

  // Black Friday: $20 off the yearly founder rate, so the first year is $79.
  // Founder-only because the coupon is sized against $99 (and restricted to
  // the founder product at Stripe).
  const applyBlackFriday =
    opts.offer === 'bf' && plan === 'annual' && offerFounderRate && isBlackFridayActive();

  // Skills Map owners: 20% off the first year of the yearly plan, for 72h
  // after buying the Map. The coupon is limited to the yearly products.
  const applyMapOffer =
    !applyBlackFriday && opts.offer === 'map' && plan === 'annual' && (await hasRecentMapPurchase(email));
  // Co-op code: $79/year for life on the yearly founder rate. Looked up at
  // Stripe so an expired, used-up or unknown code just falls back to a normal
  // checkout (where the family can still type a code).
  let coopPromo: { id: string; code: string } | null = null;
  if (opts.coopCode && !applyBlackFriday && !applyMapOffer && plan === 'annual' && offerFounderRate) {
    try {
      const found = await stripe.promotionCodes.list({ code: opts.coopCode, active: true, limit: 1 });
      const p = found.data[0];
      if (p && p.coupon.id === COOP_OFFER.couponId) coopPromo = { id: p.id, code: p.code };
    } catch (err) {
      console.error('[membership-checkout] co-op code lookup failed:', err);
    }
  }

  const mapFirstYear = Math.round((offerFounderRate ? FOUNDER_PRICE_USD : POST_FOUNDER_PRICE_USD) * (100 - OWNER_OFFER.percentOff)) / 100;

  // Debug log (dev only): what the route decided about credit/trial/rate per
  // request. Gated so production checkout logs don't carry clerkIds.
  if (process.env.NODE_ENV !== 'production') {
    console.log('[membership-checkout] decision:', {
      clerkId,
      plan,
      trial: applyTrial,
      founderRate: offerFounderRate,
      blackFriday: applyBlackFriday,
      mapOffer: applyMapOffer,
    });
  }

  // Plain-words fine print shown above the pay button on the Stripe page.
  // Honest billing: spell out the trial mechanics and the founder rate
  // right where the card is entered, not just on our own pages.
  const priceLine =
    plan === 'monthly'
      ? `$${MONTHLY_PRICE_USD}/month`
      : `$${offerFounderRate ? FOUNDER_PRICE_USD : POST_FOUNDER_PRICE_USD}/year`;
  const submitMessage = coopPromo
    ? applyTrial
      ? `Free for ${TRIAL_DAYS} days: read every guide in your browser. Then $${COOP_OFFER.priceUsd}/year with your co-op code ${coopPromo.code}, kept for life. Cancel anytime before your trial ends and pay nothing.`
      : `Co-op code ${coopPromo.code}: $${COOP_OFFER.priceUsd}/year, kept for life.`
    : applyMapOffer
    ? applyTrial
      ? `Free for ${TRIAL_DAYS} days: read every guide in your browser. Then $${mapFirstYear.toFixed(2)} for your first year (Skills Map owner, ${OWNER_OFFER.percentOff}% off), and ${priceLine} after that. Cancel anytime before your trial ends and pay nothing.`
      : `Skills Map owner: ${OWNER_OFFER.percentOff}% off your first year ($${mapFirstYear.toFixed(2)}), then ${priceLine}.`
    : applyBlackFriday
    ? applyTrial
      ? `Free for ${TRIAL_DAYS} days: read every guide in your browser. Then $${BLACK_FRIDAY_PRICE_USD} for your first year (${BLACK_FRIDAY_OFFER.name}), and $${FOUNDER_PRICE_USD}/year after that, your founder rate locked in for life. Cancel anytime before your trial ends and pay nothing.`
      : `${BLACK_FRIDAY_OFFER.name}: $${BLACK_FRIDAY_PRICE_USD} for your first year, then $${FOUNDER_PRICE_USD}/year, your founder rate locked in for life.`
    : applyTrial
    ? `Free for ${TRIAL_DAYS} days: read every guide in your browser. Downloads unlock when your membership starts, ${priceLine}${offerFounderRate ? ', your founder rate locked in for life' : ''}. Cancel anytime before then and pay nothing.`
    : offerFounderRate
      ? `Founder rate: $${FOUNDER_PRICE_USD}/year, locked in for life.`
      : plan === 'monthly'
        ? `$${MONTHLY_PRICE_USD}/month, cancel anytime.`
        : undefined;

  const session = await stripe.checkout.sessions.create({
    ...(submitMessage && { custom_text: { submit: { message: submitMessage } } }),
    // Expire unfinished sessions after 2h instead of Stripe's 24h default, so
    // the `checkout.session.expired` webhook (→ "I held your spot" email) fires
    // while intent is still warm rather than a full day later. Stripe allows
    // 30min–24h; 2h is long enough to rule out a quick distraction.
    expires_at: Math.floor(Date.now() / 1000) + 2 * 60 * 60,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    // Stripe rejects `discounts` together with `allow_promotion_codes`.
    ...(applyBlackFriday
      ? { discounts: [{ coupon: BLACK_FRIDAY_OFFER.couponId }] }
      : applyMapOffer
        ? { discounts: [{ coupon: OWNER_OFFER.couponId }] }
        : coopPromo
          ? { discounts: [{ promotion_code: coopPromo.id }] }
          : { allow_promotion_codes: true }),
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
        plan,
        // Capture the rate offered to this specific buyer (not the global
        // static flag) so the webhook + downstream emails know the true
        // founder status of THIS subscription.
        founder_phase: String(offerFounderRate),
        trial_applied: String(applyTrial),
        ...(applyBlackFriday && { offer: BLACK_FRIDAY_OFFER.slug }),
        ...(applyMapOffer && { offer: OWNER_OFFER.slug }),
        ...(coopPromo && { offer: COOP_OFFER.slug, coop_code: coopPromo.code }),
        ...(clerkId && { clerk_id: clerkId }),
        // For the trial-to-paid Subscribe event 7 days later.
        ...metaMatchToMetadata(opts.meta),
      },
    },
    success_url: `${origin}/checkout/success?tier=member${applyTrial ? '&trial=1' : ''}${plan === 'monthly' ? '&plan=monthly' : ''}&session_id={CHECKOUT_SESSION_ID}`,
    // Black Friday buyers came from the offer page, so send them back there.
    cancel_url: applyBlackFriday ? `${origin}/black-friday?cancelled=1` : `${origin}/?cancelled=1#membership`,
    // Note: Stripe's `after_expiration.recovery` is NOT supported in
    // `subscription` mode — only `payment` mode. Abandoned-membership
    // emails fall back to /join (handled in the webhook's recoveryUrl
    // fallback), which is fine: a new checkout takes a few seconds.
    metadata: {
      kind: 'membership',
      tier: 'member',
      // Session-level copy of the plan: the expired-checkout webhook only
      // has the session (no subscription exists), and the abandoned email
      // needs to pitch the plan that was actually in the cart.
      plan,
      ...(applyBlackFriday && { offer: BLACK_FRIDAY_OFFER.slug }),
      ...(applyMapOffer && { offer: OWNER_OFFER.slug }),
      ...(coopPromo && { offer: COOP_OFFER.slug, coop_code: coopPromo.code }),
      ...(clerkId && { clerk_id: clerkId }),
      ...metaMatchToMetadata(opts.meta),
    },
  });

  if (!session.url) return { ok: false, reason: 'no_url' };
  return { ok: true, url: session.url, ...(coopPromo && { coopCode: coopPromo.code }) };
}
