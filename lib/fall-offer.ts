/**
 * Fall offer (Oct 2026): the yearly plan's first year for $79 instead of the
 * $99 founder rate. Promoted only on the /fall ad landing page.
 *
 * Window: now → Mon Oct 19, 2026 23:59 PT. Auto-applied at checkout, no code.
 * The offer travels from /fall to Stripe through `?offer=fall` on
 * /start-trial, backed by a cookie so it survives the sign-up detour.
 *
 * Yearly only, and only while the founder rate is open: $20 off the $99
 * founder price. Monthly stays $15 for everyone.
 */

import { FOUNDER_PRICE_USD } from '@/lib/membership';

export const FALL_OFFER = {
  slug: 'fall',
  name: 'Fall offer',
  amountOffUsd: 20,
  // Stripe coupon ID (created by scripts/create-fall-coupon.ts)
  couponId: 'fall_offer_2026',
  endsAt: new Date('2026-10-20T06:59:59.000Z'), // Mon Oct 19, 23:59 PT
  endsLabel: 'Monday, Oct 19',
  endsLabelShort: 'Oct 19',
} as const;

export const FALL_OFFER_PRICE_USD = FOUNDER_PRICE_USD - FALL_OFFER.amountOffUsd;

/** Cookie set by /start-trial?offer=fall so the offer survives sign-up. */
export const OFFER_COOKIE = 'al_offer';

export function isFallOfferActive(now: Date = new Date()): boolean {
  return now <= FALL_OFFER.endsAt;
}
