/**
 * Co-op offer (Nov 2026): each homeschool co-op gets its own promotion code.
 * Any family who joins the yearly plan with it pays $79 for the first year
 * ($20 off), then renews at the $99 founder rate, kept for life. Codes stop
 * working at the end of the founder phase (Tue Jan 12 2027, 11:59 PM ET) and
 * each one is capped at 30 families. All codes share one Stripe coupon, so Stripe's redemption
 * count per code tells us how many families each co-op brought.
 *
 * The flyer link /coop/<code> sends families to /start-trial with `?code=`,
 * and checkout applies the code for them. Typing it on the Stripe page works
 * too (checkout allows promotion codes).
 *
 * Create a co-op's code with scripts/create-coop-code.ts.
 */

export const COOP_OFFER = {
  slug: 'coop',
  couponId: 'coop-79-first-year',
  amountOffUsd: 20,
  /** First-year price; renewals bill the $99 founder rate. */
  priceUsd: 79,
  maxFamiliesPerCode: 30,
  /** Tue Jan 12 2027, 11:59:59 PM Eastern (EST, UTC-5). */
  codesExpireAt: new Date('2027-01-13T04:59:59Z'),
} as const;

/** Cookie set by /start-trial?code= so the code survives sign-up. */
export const COOP_CODE_COOKIE = 'al_coop_code';

/** Uppercase letters and digits only, 3 to 24 long; anything else is ignored. */
export function sanitizeCoopCode(raw: string | null | undefined): string | null {
  const code = (raw || '').trim().toUpperCase();
  return /^[A-Z0-9]{3,24}$/.test(code) ? code : null;
}
