import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { memberState } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * Where a sign-in actually lands.
 *
 *   first ever sign-in  → /account/welcome  (the onboarding quiz, which then
 *                                            exits to /account/home itself)
 *   every one after     → /account/home     (the adventure map)
 *
 * "Home" here is the member's adventure map, the first tab in the member nav,
 * not the marketing homepage at /.
 *
 * The decision needs the member's kids profile, which lives in `member_state`
 * on the server and in localStorage on the client. Doing it here, server-side,
 * means the browser goes straight to the right page instead of rendering the
 * library and then bouncing.
 *
 * The test mirrors FirstRunRedirect exactly: a member counts as onboarded once
 * they have a profile OR once they've been shown the welcome step and skipped
 * it. Keep the two in step — FirstRunRedirect still runs inside /account and
 * catches anyone who reaches the member zone by another route.
 */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;

  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(`${origin}/sign-in`, 303);

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
    // DB unreachable: fall back to /account (the library), which is the one
    // member page carrying FirstRunRedirect, so the same decision still gets
    // made client-side once sync settles. /account/home would skip that check
    // and a brand-new member would never see onboarding.
    return NextResponse.redirect(`${origin}/account`, 303);
  }

  return NextResponse.redirect(`${origin}/account/home`, 303);
}
