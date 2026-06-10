/**
 * Stripe Price IDs for the post-pivot product line.
 *
 * To populate:
 *   1. Drop your Stripe test secret key into .env.local as STRIPE_SECRET_KEY=sk_test_...
 *   2. Run: STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/create-stripe-membership.ts
 *   3. Paste the printed export below into this file.
 *
 * The script is idempotent — running it multiple times reuses existing
 * products/prices by name and nickname.
 *
 * IMPORTANT: when you switch to live keys at launch, you'll need to re-run the
 * script with the LIVE key and replace these IDs. Test-mode IDs only work with
 * test-mode keys.
 *
 * For local development with test-mode keys, the corresponding TEST IDs are:
 *   MEMBERSHIP_FOUNDER:    'price_1TZMETAMzOBftCnthrU2MJLz'
 *   MEMBERSHIP_STANDARD:   'price_1TZMEUAMzOBftCntMuS7OcZg'
 *   STARTER_PACK_ONE_TIME: 'price_1TZMEUAMzOBftCntug0I7khe'
 */

export const STRIPE_PRICES = {
  /** Subscription, $99/year — locked in for the first 100 members. (LIVE) */
  MEMBERSHIP_FOUNDER: 'price_1TZd7YAkIBECpwGmljfvhird',
  /** Subscription, $149/year — applies to member 101+. (LIVE) */
  MEMBERSHIP_STANDARD: 'price_1TZd7ZAkIBECpwGmLH4ogWnu',
  /** One-time, $44.99 — Starter Pack. (LIVE) */
  STARTER_PACK_ONE_TIME: 'price_1TZd7ZAkIBECpwGmQU3zzPjY',
} as const;

/** Returns the Stripe Price ID for the currently-active membership rate. */
export function activeMembershipPriceId(isFounderPhase: boolean): string {
  return isFounderPhase
    ? STRIPE_PRICES.MEMBERSHIP_FOUNDER
    : STRIPE_PRICES.MEMBERSHIP_STANDARD;
}

/** Throw a helpful error if a price ID hasn't been populated yet. */
export function requirePriceId(id: string, label: string): string {
  if (!id) {
    throw new Error(
      `Stripe price ID for "${label}" is not set. Run scripts/create-stripe-membership.ts and populate lib/stripe-prices.ts.`,
    );
  }
  return id;
}
