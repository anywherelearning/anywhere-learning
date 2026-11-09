/**
 * Black Friday offer (Nov 2026): the yearly plan's first year for $79 instead
 * of the $99 founder rate. Membership only, the shop is not discounted.
 *
 * Window: Tue Nov 24, 2026 00:00 PT to Tue Dec 1, 2026 23:59 PT. Auto-applied
 * at checkout, no code. The offer travels from /black-friday to Stripe through
 * `?offer=bf` on /start-trial, backed by the same cookie the Fall offer used.
 *
 * Founder-only: the coupon is $20 off the $99 founder price, so it is ignored
 * if the founder rate has closed. Monthly stays $15 for everyone.
 */

import { FOUNDER_PRICE_USD } from '@/lib/membership';

export const BLACK_FRIDAY_OFFER = {
  slug: 'bf',
  name: 'Black Friday',
  amountOffUsd: 20,
  // Stripe coupon ID (created by scripts/create-black-friday-coupon.ts)
  couponId: 'black_friday_2026',
  startsAt: new Date('2026-11-24T08:00:00.000Z'), // Tue Nov 24, 00:00 PT
  endsAt: new Date('2026-12-02T07:59:59.000Z'), // Tue Dec 1, 23:59 PT
  endsLabel: 'Tuesday, Dec 1',
  endsLabelShort: 'Dec 1',
} as const;

export const BLACK_FRIDAY_PRICE_USD = FOUNDER_PRICE_USD - BLACK_FRIDAY_OFFER.amountOffUsd;

/** When new yearly members move from the founder rate to the standard price. */
export const FOUNDER_RATE_CLOSES_LABEL = 'Jan 12';

export function isBlackFridayActive(now: Date = new Date()): boolean {
  return now >= BLACK_FRIDAY_OFFER.startsAt && now <= BLACK_FRIDAY_OFFER.endsAt;
}

/** Whole days left in the window, counting today. 0 outside the window. */
export function blackFridayDaysLeft(now: Date = new Date()): number {
  if (!isBlackFridayActive(now)) return 0;
  const ms = BLACK_FRIDAY_OFFER.endsAt.getTime() - now.getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}
