/**
 * Single source of truth for membership pricing and copy.
 *
 * Founder phase (first 100 members):
 *   - $99/year, locked in for life
 *   - "Founding member" labels, "Founder rate" tags
 *   - Cohort framing ("the first 100 are shaping this")
 *
 * Post-founder phase (101+):
 *   - $149/year, standard renewal
 *   - Generic "Member" labels, no special rate framing
 *   - No cohort framing
 *
 * WHEN YOU HIT 100 ACTIVE MEMBERS:
 *   1. Set IS_FOUNDER_PHASE to false in this file
 *   2. Deploy
 *   3. All founder-rate copy across the site swaps automatically
 *
 * That's it. One line. No other code changes needed.
 */

// ─── PHASE FLAG ──────────────────────────────────────────────
// Static override. Static = used in SSR-rendered site copy (homepage,
// /join, etc.) so we avoid a DB query on every page render.
//
// The CHECKOUT endpoint additionally calls `isFounderPhaseOpen()` below
// at runtime, which counts active subscriptions and enforces the
// FOUNDER_CAP automatically. So new buyers stop being charged the
// founder rate the moment we hit 100, even if this flag is still `true`.
//
// You can also flip this to `false` early to close the founder phase
// manually before reaching 100 (e.g. for a launch deadline).
export const IS_FOUNDER_PHASE = true;

// ─── PRICING ────────────────────────────────────────────────
export const FOUNDER_PRICE_USD = 99;
export const POST_FOUNDER_PRICE_USD = 149;
export const FOUNDER_CAP = 100;

// ─── FREE TRIAL ─────────────────────────────────────────────
// New members start with a free trial (card required, $0 today, auto-converts
// via Stripe `trial_period_days`). During the trial they can VIEW every guide
// in the in-app reader but CANNOT download anything — downloading is the
// reason to convert to a paid membership. The view/download split is enforced
// server-side in /api/download/activity/[slug]. One trial per customer, ever:
// anyone with a prior subscription row checks out without a trial (see
// isTrialEligible in lib/access).
export const TRIAL_DAYS = 14;

// Active price for the current phase (in whole dollars).
export const MEMBERSHIP_PRICE_USD = IS_FOUNDER_PHASE
  ? FOUNDER_PRICE_USD
  : POST_FOUNDER_PRICE_USD;

// ─── DISPLAY HELPERS ────────────────────────────────────────
/** "$99" or "$149" — bare price with no /year suffix. */
export const MEMBERSHIP_PRICE = `$${MEMBERSHIP_PRICE_USD}`;

/** "$99/year" or "$149/year" — the most common rendering. */
export const MEMBERSHIP_PRICE_YEAR = `$${MEMBERSHIP_PRICE_USD}/year`;

/** "$99/yr" or "$149/yr" — short form for tight UI. */
export const MEMBERSHIP_PRICE_YR = `$${MEMBERSHIP_PRICE_USD}/yr`;

/** "$99.00" or "$149.00" — for receipts and Stripe price displays. */
export const MEMBERSHIP_PRICE_FORMATTED = `$${MEMBERSHIP_PRICE_USD}.00`;

// ─── COPY HELPERS ───────────────────────────────────────────
/** "Founder rate" during phase, empty string after. */
export const RATE_LABEL = IS_FOUNDER_PHASE ? 'Founder rate' : '';

/** "Founding member" during phase, "Member" after. */
export const TIER_LABEL = IS_FOUNDER_PHASE ? 'Founding member' : 'Member';

/** "Locked in for life" during phase, "" after. */
export const LOCKED_FOR_LIFE = IS_FOUNDER_PHASE ? 'Locked in for life' : '';

/** "founder rate" (lowercase, mid-sentence). */
export const RATE_LABEL_LOWER = IS_FOUNDER_PHASE ? 'founder rate' : '';

/** "founding member" (lowercase, mid-sentence). */
export const TIER_LABEL_LOWER = IS_FOUNDER_PHASE ? 'founding member' : 'member';

/** "Become a founding member" / "Become a member" CTA label. */
export const JOIN_CTA_LABEL = IS_FOUNDER_PHASE
  ? 'Become a founding member'
  : 'Join the membership';

/** Mid-sentence cohort pitch (or empty). */
export const COHORT_PITCH = IS_FOUNDER_PHASE
  ? `The first ${FOUNDER_CAP} members shape what this becomes.`
  : '';

/** Short cohort line for receipts / pills. */
export const COHORT_SHORT = IS_FOUNDER_PHASE ? `First ${FOUNDER_CAP}` : '';

/** Full price line, e.g. "$99/year (founder rate, locked in for life)". */
export const PRICE_FULL_LINE = IS_FOUNDER_PHASE
  ? `${MEMBERSHIP_PRICE_YEAR} (founder rate, locked in for life)`
  : `${MEMBERSHIP_PRICE_YEAR}`;

/** "Founder rate $99/year, locked in for life." for hero / sidebar callouts. */
export const FOUNDER_TAGLINE = IS_FOUNDER_PHASE
  ? `Founder rate ${MEMBERSHIP_PRICE_YEAR}, locked in for life.`
  : `${MEMBERSHIP_PRICE_YEAR} membership.`;

// ─────────────────────────────────────────────────────────────────────────────
// Runtime founder-phase helpers
//
// Async because they hit the DB. Used by:
//   - The membership checkout endpoint (picks $99 vs $149 price at runtime)
//   - The Stripe webhook (decides which welcome email variant to send)
//
// Kept out of SSR-rendered site copy on purpose — the static
// IS_FOUNDER_PHASE flag is the source of truth there to avoid a DB
// round-trip on every page render. When you're ready for the homepage,
// /join, etc. to also switch automatically, flip IS_FOUNDER_PHASE.
// ─────────────────────────────────────────────────────────────────────────────

/** Count of active membership subscriptions in the DB.  *  count too: they locked their rate at signup, so they hold a founder spot. */
export async function getActiveMemberCount(): Promise<number> {
  try {
    const { db } = await import('./db');
    const { subscriptions } = await import('./db/schema');
    const { inArray, sql } = await import('drizzle-orm');
    const rows = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(subscriptions)
      .where(inArray(subscriptions.status, ['active', 'trialing']));
    return rows[0]?.n ?? 0;
  } catch (err) {
    console.error('[membership] active member count failed:', err);
    // Fail-open to founder: don't accidentally lock new buyers out of $99
    // because the DB blipped.
    return 0;
  }
}

/**
 * Is the founder rate still available for a NEW signup right now?
 *   - Returns false if the static IS_FOUNDER_PHASE flag is off
 *   - Returns false if 100+ active members already exist
 *   - Otherwise true
 *
 * Call this in the checkout endpoint to pick the Stripe Price ID, and
 * in any webhook that needs a fresh check. Existing founders keep their
 * $99 rate via their stripePriceId regardless — this only governs NEW
 * checkouts.
 */
export async function isFounderPhaseOpen(): Promise<boolean> {
  if (!IS_FOUNDER_PHASE) return false;
  const count = await getActiveMemberCount();
  return count < FOUNDER_CAP;
}
