/**
 * Runtime (DB-aware) membership state.
 *
 * The static constants in `lib/membership.ts` are the source of truth for
 * SSR-rendered copy that doesn't need a per-request DB hit (blog callouts,
 * footer in static pages, etc.). This module is the *live* equivalent — it
 * counts active subscriptions and returns the same shape with the founder
 * banner automatically closed once we hit FOUNDER_CAP.
 *
 * Usage in a server component:
 *
 *   import { getMembership } from '@/lib/membership-runtime';
 *
 *   export default async function Page() {
 *     const m = await getMembership();
 *     return <h1>Join for {m.priceYear}</h1>;
 *   }
 *
 * `cache()` ensures a single DB query per request even when the helper is
 * called multiple times across a page's component tree.
 */

import { cache } from 'react';
import {
  IS_FOUNDER_PHASE,
  FOUNDER_PRICE_USD,
  POST_FOUNDER_PRICE_USD,
  FOUNDER_CAP,
  isFounderPhaseOpen,
} from './membership';

export interface MembershipState {
  /** True if the founder rate is still on offer for NEW signups. */
  isFounderPhase: boolean;
  /** True only when the static IS_FOUNDER_PHASE override is also true. */
  isStaticallyFounder: boolean;
  founderCap: number;

  /** "$99" or "$149" — bare price with no /year suffix. */
  price: string;
  /** "$99/year" or "$149/year" — most common rendering. */
  priceYear: string;
  /** "$99/yr" or "$149/yr" — short form for tight UI. */
  priceYr: string;
  /** "$99.00" or "$149.00" — receipts and Stripe price displays. */
  priceFormatted: string;
  priceUSD: number;

  /** "Founder rate" during phase, empty string after. */
  rateLabel: string;
  /** "Founding member" during phase, "Member" after. */
  tierLabel: string;
  /** "Locked in for life" during phase, "" after. */
  lockedForLife: string;
  /** "founder rate" (lowercase, mid-sentence). */
  rateLabelLower: string;
  /** "founding member" (lowercase, mid-sentence). */
  tierLabelLower: string;

  /** "Become a founding member" / "Join the membership" CTA label. */
  joinCtaLabel: string;
  /** Mid-sentence cohort pitch (or empty). */
  cohortPitch: string;
  /** Short cohort line for receipts / pills. */
  cohortShort: string;
  /** Full price line, e.g. "$99/year (founder rate, locked in for life)". */
  priceFullLine: string;
  /** "Founder rate $99/year, locked in for life." for hero / sidebar callouts. */
  founderTagline: string;
}

export const getMembership = cache(async (): Promise<MembershipState> => {
  // The runtime gate: true only if the static flag is on AND we're under cap.
  const isFounder = await isFounderPhaseOpen();
  const priceUSD = isFounder ? FOUNDER_PRICE_USD : POST_FOUNDER_PRICE_USD;
  const price = `$${priceUSD}`;
  const priceYear = `${price}/year`;
  const priceYr = `${price}/yr`;
  const priceFormatted = `${price}.00`;

  return {
    isFounderPhase: isFounder,
    isStaticallyFounder: IS_FOUNDER_PHASE,
    founderCap: FOUNDER_CAP,

    price,
    priceYear,
    priceYr,
    priceFormatted,
    priceUSD,

    rateLabel: isFounder ? 'Founder rate' : '',
    tierLabel: isFounder ? 'Founding member' : 'Member',
    lockedForLife: isFounder ? 'Locked in for life' : '',
    rateLabelLower: isFounder ? 'founder rate' : '',
    tierLabelLower: isFounder ? 'founding member' : 'member',

    joinCtaLabel: isFounder ? 'Become a founding member' : 'Join the membership',
    cohortPitch: isFounder
      ? `The first ${FOUNDER_CAP} members shape what this becomes.`
      : '',
    cohortShort: isFounder ? `First ${FOUNDER_CAP}` : '',
    priceFullLine: isFounder
      ? `${priceYear} (founder rate, locked in for life)`
      : priceYear,
    founderTagline: isFounder
      ? `Founder rate ${priceYear}, locked in for life.`
      : `${priceYear} membership.`,
  };
});
