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
 * Mode is detected from STRIPE_SECRET_KEY at runtime: sk_test_* keys resolve
 * to the test-mode price IDs, anything else resolves to live. This lets local
 * dev (test keys in .env.development.local) and production (live keys in
 * Vercel) share this file with no manual ID swapping. Server-side only: no
 * client code imports these IDs, and the secret key never reaches the client.
 */

interface StripePriceIds {
  MEMBERSHIP_FOUNDER: string;
  MEMBERSHIP_STANDARD: string;
  MEMBERSHIP_MONTHLY: string;
}

const LIVE_PRICES: StripePriceIds = {
  /** Subscription, $99/year — locked in for the first 100 members. (LIVE) */
  MEMBERSHIP_FOUNDER: 'price_1TZd7YAkIBECpwGmljfvhird',
  /** Subscription, $149/year — applies to member 101+. (LIVE) */
  MEMBERSHIP_STANDARD: 'price_1TZd7ZAkIBECpwGmLH4ogWnu',
  /** Subscription, $15/month — one rate for everyone, no founder split. (LIVE) */
  MEMBERSHIP_MONTHLY: 'price_1TtEAIAkIBECpwGmebueXC9Q',
};

const TEST_PRICES: StripePriceIds = {
  MEMBERSHIP_FOUNDER: 'price_1TZMETAMzOBftCnthrU2MJLz',
  MEMBERSHIP_STANDARD: 'price_1TZMEUAMzOBftCntMuS7OcZg',
  MEMBERSHIP_MONTHLY: 'price_1TtEABAMzOBftCntDqcq4Of8',
};

const IS_TEST_MODE = (process.env.STRIPE_SECRET_KEY || '').startsWith('sk_test_');

export const STRIPE_PRICES: StripePriceIds = IS_TEST_MODE ? TEST_PRICES : LIVE_PRICES;

/** Returns the Stripe Price ID for the currently-active membership rate. */
export function activeMembershipPriceId(isFounderPhase: boolean): string {
  return isFounderPhase
    ? STRIPE_PRICES.MEMBERSHIP_FOUNDER
    : STRIPE_PRICES.MEMBERSHIP_STANDARD;
}

/**
 * Which billing plan a Stripe Price ID belongs to. Anything that isn't the
 * monthly price is treated as annual — the safe default for unknown/legacy
 * IDs, since every price before the monthly plan existed was annual.
 */
export function planForPriceId(priceId: string | null | undefined): 'annual' | 'monthly' {
  return priceId === STRIPE_PRICES.MEMBERSHIP_MONTHLY ? 'monthly' : 'annual';
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
