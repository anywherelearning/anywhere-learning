/**
 * Daily cron: the day-7 trial check-in email.
 *
 * Trials get a welcome email on day 0 and the "ends in 3 days" heads-up on
 * day 11 (Stripe's trial_will_end). Nothing in between, which is exactly when
 * people either start using the library or forget it. This fills that gap with
 * one personal note pointing at one guide.
 *
 * How it works:
 *   1. Vercel Cron hits GET /api/cron/trial-midpoint daily (vercel.json),
 *      authed with CRON_SECRET like the renewal-reminders cron.
 *   2. Match subscriptions that are still trialing, not set to cancel, started
 *      at least 6 days ago, and end 6 to 8 days from now (the 14-day trial's
 *      midpoint, with a day of slack so a missed run doesn't skip anyone).
 *   3. Skip anyone already in sent_emails with kind 'trial_midpoint', so the
 *      2-day window never sends twice.
 *   4. Read their activity (reader opens) and member state (kids, map pick,
 *      "We did it!" completions), pick the version + guide via
 *      lib/trial-midpoint.ts, and send with a one-tap sign-in link that lands
 *      in the reader on that guide.
 *
 * Pass ?dry=1 to see who would get what without sending anything.
 */

import { NextRequest, NextResponse } from 'next/server';
import { and, eq, gte, inArray, lt, lte, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { activityEvents, memberState, sentEmails, subscriptions, users } from '@/lib/db/schema';
import { sendTrialMidpointEmail } from '@/lib/resend';
import { kidsPhrase, pickMidpoint } from '@/lib/trial-midpoint';
import type { Child } from '@/lib/member-profile';

export const dynamic = 'force-dynamic';

const DAY = 24 * 60 * 60 * 1000;
const EMAIL_KIND = 'trial_midpoint';

interface StateData {
  profile?: { children?: Child[] };
  week?: { items?: { slug: string }[] };
  completions?: { slug: string; at: string }[] | null;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const dryRun = req.nextUrl.searchParams.get('dry') === '1';

  const now = Date.now();
  const rows = await db
    .select({
      userId: subscriptions.userId,
      trialEnd: subscriptions.currentPeriodEnd,
      clerkId: users.clerkId,
      email: users.email,
    })
    .from(subscriptions)
    .innerJoin(users, eq(subscriptions.userId, users.id))
    .where(
      and(
        eq(subscriptions.status, 'trialing'),
        eq(subscriptions.cancelAtPeriodEnd, false),
        lte(subscriptions.createdAt, new Date(now - 6 * DAY)),
        gte(subscriptions.currentPeriodEnd, new Date(now + 6 * DAY)),
        lt(subscriptions.currentPeriodEnd, new Date(now + 8 * DAY)),
      ),
    );

  if (rows.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No trials at the midpoint today.' });
  }

  const emails = rows.map((r) => r.email.toLowerCase());
  const already = await db
    .select({ email: sentEmails.email })
    .from(sentEmails)
    .where(and(eq(sentEmails.kind, EMAIL_KIND), inArray(sentEmails.email, emails)));
  const alreadySent = new Set(already.map((a) => a.email));
  const due = rows.filter((r) => !alreadySent.has(r.email.toLowerCase()));

  if (due.length === 0) {
    return NextResponse.json({ sent: 0, message: 'Everyone at the midpoint already got it.' });
  }

  const viewRows = await db
    .select({
      userId: activityEvents.userId,
      slug: activityEvents.slug,
      opens: sql<number>`count(*)::int`,
    })
    .from(activityEvents)
    .where(
      and(
        eq(activityEvents.kind, 'view'),
        inArray(activityEvents.userId, due.map((r) => r.userId)),
      ),
    )
    .groupBy(activityEvents.userId, activityEvents.slug);

  const stateRows = await db
    .select({ clerkId: memberState.clerkId, data: memberState.data })
    .from(memberState)
    .where(inArray(memberState.clerkId, due.map((r) => r.clerkId)));
  const stateByClerk = new Map(stateRows.map((s) => [s.clerkId, s.data as StateData]));

  // First names + one-tap sign-in links come from Clerk. Both are nice-to-haves:
  // without them the email says "there" and the button goes through sign-in.
  let clerk: Awaited<ReturnType<typeof getClerk>> = null;
  let firstNameByClerkId: Record<string, string | undefined> = {};
  try {
    clerk = await getClerk();
    if (clerk) {
      const list = await clerk.users.getUserList({
        userId: due.map((r) => r.clerkId),
        limit: due.length,
      });
      firstNameByClerkId = Object.fromEntries(
        list.data.map((u) => [u.id, u.firstName?.trim() || undefined]),
      );
    }
  } catch (err) {
    console.error('[cron] trial-midpoint clerk lookup failed (continuing without names):', err);
  }

  const results: { email: string; ok: boolean; variant?: string; guide?: string; error?: string }[] = [];
  for (const row of due) {
    try {
      const state = stateByClerk.get(row.clerkId) ?? {};
      const views: Record<string, number> = {};
      for (const v of viewRows) if (v.userId === row.userId) views[v.slug] = v.opens;
      const completed = [...(state.completions ?? [])]
        .sort((a, b) => a.at.localeCompare(b.at))
        .map((c) => c.slug);
      const kids = state.profile?.children ?? [];

      const pick = pickMidpoint({
        views,
        completed,
        weekSlugs: (state.week?.items ?? []).map((i) => i.slug),
        kids,
      });
      if (!pick) {
        results.push({ email: row.email, ok: false, error: 'no guide to suggest' });
        continue;
      }

      if (dryRun) {
        results.push({
          email: row.email,
          ok: true,
          variant: pick.variant,
          guide: pick.next ? `${pick.guide.slug} -> ${pick.next.slug}` : pick.guide.slug,
        });
        continue;
      }

      const guideUrl = await signInUrl(clerk, row.clerkId, `/account/view/${pick.guide.slug}`);
      const nextUrl = pick.next
        ? await signInUrl(clerk, row.clerkId, `/account/view/${pick.next.slug}`)
        : undefined;

      await sendTrialMidpointEmail({
        to: row.email,
        firstName: firstNameByClerkId[row.clerkId],
        variant: pick.variant,
        guide: pick.guide,
        next: pick.next,
        done: pick.done,
        kids: kidsPhrase(kids),
        trialEndDate: row.trialEnd.toISOString(),
        guideUrl,
        nextUrl,
      });
      await db.insert(sentEmails).values({ email: row.email.toLowerCase(), kind: EMAIL_KIND });
      results.push({ email: row.email, ok: true, variant: pick.variant, guide: pick.guide.slug });
    } catch (err) {
      console.error(`[cron] trial-midpoint email failed for ${row.email}:`, err);
      results.push({
        email: row.email,
        ok: false,
        error: err instanceof Error ? err.message : 'unknown',
      });
    }
  }

  const sent = results.filter((r) => r.ok).length;
  console.log(`[cron] trial midpoint: ${sent}/${due.length} ${dryRun ? 'would send' : 'sent'}`);

  return NextResponse.json({ dryRun, matched: due.length, sent, results });
}

async function getClerk() {
  if (!process.env.CLERK_SECRET_KEY) return null;
  const { createClerkClient } = await import('@clerk/backend');
  return createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
}

/** One-tap sign-in link that lands on `destination`; falls back to plain sign-in. */
async function signInUrl(
  clerk: Awaited<ReturnType<typeof getClerk>>,
  clerkId: string,
  destination: string,
): Promise<string> {
  const base = process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co';
  const redirect = encodeURIComponent(destination);
  const fallback = `${base}/sign-in?redirect_url=${redirect}`;
  if (!clerk) return fallback;
  try {
    const token = await clerk.signInTokens.createSignInToken({
      userId: clerkId,
      expiresInSeconds: 60 * 60 * 24 * 7,
    });
    return `${base}/sign-in?__clerk_ticket=${token.token}&redirect_url=${redirect}`;
  } catch (err) {
    console.error('[cron] trial-midpoint sign-in token failed:', err);
    return fallback;
  }
}
