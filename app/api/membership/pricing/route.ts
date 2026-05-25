/**
 * GET /api/membership/pricing
 *
 * Returns the price the current viewer should see for membership.
 * If they're signed in and bought the Starter Pack (and haven't yet
 * redeemed the credit), returns the discounted first-year price.
 *
 * Used by the join page / dashboard CTAs to render the right number.
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { MEMBERSHIP_PRICE_USD } from '@/lib/membership';
import {
  STARTER_PACK_CREDIT_USD,
  STARTER_PACK_CREDIT_LABEL,
  firstYearPriceAfterCredit,
} from '@/lib/starter-pack-credit';
import { getStarterPackCreditEligibility } from '@/lib/access';

export const runtime = 'nodejs';

export async function GET() {
  let clerkId: string | null = null;
  try {
    const a = await auth();
    clerkId = a.userId;
  } catch {
    /* Clerk not configured. Treat as guest. */
  }

  const eligibility = await getStarterPackCreditEligibility(clerkId);

  const standardPriceUsd = MEMBERSHIP_PRICE_USD;
  const firstYearPriceUsd = eligibility.eligible
    ? firstYearPriceAfterCredit(standardPriceUsd)
    : standardPriceUsd;

  // Debug fields included only in dev so you can self-diagnose why eligibility
  // resolved the way it did. Remove or gate before going live.
  const isDev = process.env.NODE_ENV !== 'production';

  return NextResponse.json({
    eligible: eligibility.eligible,
    reason: eligibility.reason,
    creditUsd: STARTER_PACK_CREDIT_USD,
    creditLabel: STARTER_PACK_CREDIT_LABEL,
    standardPriceUsd,
    firstYearPriceUsd,
    appliedAt: eligibility.appliedAt?.toISOString() ?? null,
    ...(isDev && {
      _debug: {
        signedIn: !!clerkId,
        clerkId,
        starterPackPurchasedAt: eligibility.starterPackPurchasedAt?.toISOString() ?? null,
      },
    }),
  });
}
