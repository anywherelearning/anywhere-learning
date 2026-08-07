import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { memberState } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAccessTierForClerkId } from '@/lib/access';

export const dynamic = 'force-dynamic';

/**
 * Where a sign-in actually lands.
 *
 *   no membership yet   → /account/home     (adventure map behind the paywall)
 *   first ever sign-in  → /account/welcome  (the onboarding quiz, which then
 *                                            exits to /account/home itself)
 *   every one after     → /account/home     (the adventure map)
 *
 * "Home" here is the member's adventure map, the first tab in the member nav,
 * not the marketing homepage at /.
 *
 * Guests are checked first and never see onboarding: the welcome quiz asks a
 * parent to set up explorers, which is meaningless to someone who cannot open
 * an activity yet. They land in the member zone like everyone else and the
 * account layout draws its teaser over the top, so the answer to "what do I
 * get?" is the real product, faded, rather than a form they cannot use.
 *
 * The onboarding test mirrors FirstRunRedirect exactly: a member counts as
 * onboarded once they have a profile OR once they've been shown the welcome
 * step and skipped it. Keep the two in step — FirstRunRedirect still runs
 * inside /account and catches anyone who arrives by another route.
 */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;

  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(`${origin}/sign-in`, 303);

  // Fails closed to 'guest' on a DB error, matching the account layout, so a
  // blip shows the teaser rather than leaking the zone.
  const tier = await getAccessTierForClerkId(userId);
  if (tier === 'guest') return NextResponse.redirect(`${origin}/account/home`, 303);

  try {
    const rows = await db
      .select({ data: memberState.data })
      .from(memberState)
      .where(eq(memberState.clerkId, userId))
      .limit(1);

    const data = rows[0]?.data as { profile?: unknown; onboarded?: unknown } | undefined;
    const seenWelcome = Boolean(data?.profile) || Boolean(data?.onboarded);

    if (!seenWelcome) return NextResponse.redirect(`${origin}/account/welcome`, 303);
  } catch {
    // Profile lookup failed: fall back to /account (the library), the one member
    // page carrying FirstRunRedirect, so the same decision still gets made
    // client-side once sync settles. /account/home would skip that check and a
    // brand-new member would never see onboarding.
    return NextResponse.redirect(`${origin}/account`, 303);
  }

  return NextResponse.redirect(`${origin}/account/home`, 303);
}
