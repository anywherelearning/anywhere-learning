/**
 * Home Educators' Appreciation Week sale config.
 *
 * Sale window: Mon May 4, 2026 (00:00 PT) → Sun May 10, 2026 (23:59 PT).
 * 25% off sitewide, all products, all bundles. Auto-applied at checkout.
 */

export const SALE_CONFIG = {
  name: "Home Educators' Appreciation Week",
  shortName: "Educators' Appreciation",
  percentOff: 25,
  promoCode: 'THANKYOU25',
  // Stripe coupon ID (created by scripts/create-sale-coupon.ts)
  couponId: 'home_educators_2026',
  startsAt: new Date('2026-05-04T07:00:00.000Z'), // Mon May 4, 00:00 PT
  endsAt: new Date('2026-05-11T06:59:59.000Z'),   // Sun May 10, 23:59 PT
  bannerCta: 'Shop the sale',
} as const;

export function isSaleActive(now: Date = new Date()): boolean {
  return now >= SALE_CONFIG.startsAt && now <= SALE_CONFIG.endsAt;
}

export function saleDaysLeft(now: Date = new Date()): number {
  if (!isSaleActive(now)) return 0;
  const ms = SALE_CONFIG.endsAt.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}
