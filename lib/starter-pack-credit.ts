/**
 * Starter Pack → Membership credit.
 *
 * Buyers of the $44.99 Starter Pack get a $44.99 credit toward their first
 * year of membership. Implementation:
 *
 *   - Stripe Coupon `STARTER_PACK_CREDIT_COUPON_ID` with amount_off = $44.99
 *     and duration = 'once'. Stripe applies the discount to the first
 *     subscription invoice only (subsequent renewals are full price), so
 *     the "first year only" rule is enforced by Stripe itself, not by us.
 *
 *   - Per-user once-only enforcement lives in our DB via
 *     `users.starterPackCreditAppliedAt`. Set by the Stripe webhook when
 *     a membership purchase with the credit completes.
 */

export const STARTER_PACK_CREDIT_COUPON_ID = 'starter_pack_credit';

/** Cents value of the credit. Matches the Starter Pack price exactly. */
export const STARTER_PACK_CREDIT_CENTS = 4499;

export const STARTER_PACK_CREDIT_USD = STARTER_PACK_CREDIT_CENTS / 100;

/** Human label for the credit. */
export const STARTER_PACK_CREDIT_LABEL = `$${STARTER_PACK_CREDIT_USD.toFixed(0)}`;

/** Eligibility decision returned from the server. */
export interface StarterPackCreditEligibility {
  eligible: boolean;
  /** Why they're not eligible. Useful for UI / logs. */
  reason: 'eligible' | 'no-starter-pack' | 'already-applied' | 'no-user';
  /** Their original Starter Pack purchase date, if any. */
  starterPackPurchasedAt: Date | null;
  /** When the credit was applied (if it was). */
  appliedAt: Date | null;
}

/** First-year price after applying the credit (server-side display value). */
export function firstYearPriceAfterCredit(membershipPriceUsd: number): number {
  const after = membershipPriceUsd - STARTER_PACK_CREDIT_USD;
  // Round to nearest dollar for cleaner display - actual Stripe charge is exact
  return Math.max(0, Math.round(after));
}
