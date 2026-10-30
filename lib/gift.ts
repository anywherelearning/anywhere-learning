/**
 * Gift memberships: a relative pays once for 12 months of access for someone
 * else's family. No card on the recipient, nothing renews. Checkout lives at
 * /api/checkout/gift, the Stripe webhook turns the paid session into an
 * access grant (lib/access-grants.ts), and a scheduled gift is delivered by
 * the daily cron on its date.
 */

import { MEMBERSHIP_PRICE_USD } from '@/lib/membership';

export const GIFT_MONTHS = 12;

/** One-time gift price: the current yearly price, no founder lock-in. */
export const GIFT_PRICE_USD = MEMBERSHIP_PRICE_USD;

export const GIFT_MESSAGE_MAX = 300;

/** Furthest a gift can be scheduled ahead. */
export const GIFT_MAX_SCHEDULE_DAYS = 365;

/**
 * A YYYY-MM-DD delivery date → the moment the gift switches on. 13:00 UTC is
 * just before the daily cron (14:00 UTC), so it lands that morning in North
 * America. Returns null for empty, malformed, past or too-far dates.
 */
export function deliveryMoment(ymd: string | null | undefined, now = new Date()): Date | null {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  const at = new Date(`${ymd}T13:00:00Z`);
  if (Number.isNaN(at.getTime())) return null;
  if (at.getTime() <= now.getTime()) return null;
  if (at.getTime() - now.getTime() > GIFT_MAX_SCHEDULE_DAYS * 24 * 60 * 60 * 1000) return null;
  return at;
}

/** "Thursday, December 25" for a delivery moment. */
export function deliveryLabel(at: Date): string {
  return at.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'America/New_York' });
}

/**
 * Holiday gift season: the sitewide GiftBanner shows between these moments.
 * Nov 20 00:00 PT → Dec 22 23:59 PT (the last day a scheduled Christmas gift
 * is still comfortable to set up). Move the dates for next year.
 */
export const GIFT_SEASON = {
  startsAt: new Date('2026-11-20T08:00:00.000Z'),
  endsAt: new Date('2026-12-23T07:59:59.000Z'),
} as const;

export function isGiftSeason(now: Date = new Date()): boolean {
  return now >= GIFT_SEASON.startsAt && now <= GIFT_SEASON.endsAt;
}
