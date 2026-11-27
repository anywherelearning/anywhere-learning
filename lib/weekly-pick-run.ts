/**
 * Sends the Sunday "one for this week" email (emails/WeeklyPick.tsx), from the
 * daily renewal-reminders cron (14:00 UTC = Sunday morning in North America).
 * Manual runs: GET /api/cron/weekly-pick?dry=1 (&force=1 to run on a weekday).
 *
 * Who: active subscriptions not set to cancel (NOT trialing: trials already get
 * three emails in seven days) plus live prepaid grants, minus the owner's test
 * accounts and anyone who clicked "Stop the weekly pick".
 *
 * Bookkeeping lives in sent_emails, no new table:
 *   - 'weekly_pick:<YYYY-MM-DD>:<slug>'  one per member per Sunday; the slug
 *     part is how later weeks avoid repeating a suggestion.
 *   - 'weekly_pick_off'                   they turned it off.
 */

import { and, eq, gt, gte, inArray, isNull, like, lte, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { accessGrants, activityEvents, memberState, sentEmails, subscriptions, users } from '@/lib/db/schema';
import { generateSignInUrl, getClerk } from '@/lib/member-provision';
import { sendWeeklyPickEmail } from '@/lib/resend';
import { getThisMonth } from '@/lib/this-month';
import { kidsPhrase } from '@/lib/trial-midpoint';
import { pickWeekly } from '@/lib/weekly-pick';
import type { Child } from '@/lib/member-profile';

const IS_OWNER_TEST = /ameliedrouin|@anywherelearning\.co$/i;
const KIND_PREFIX = 'weekly_pick:';
export const WEEKLY_OFF_KIND = 'weekly_pick_off';
const DAY = 24 * 60 * 60 * 1000;
/** Reader opens older than this don't count as "you opened it recently". */
const VIEW_WINDOW_DAYS = 28;

interface StateData {
  profile?: { children?: Child[] };
  week?: { items?: { slug: string }[] };
  completions?: { slug: string; at: string }[] | null;
}

const easternParts = (d: Date) => {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(d);
  const get = (t: string) => f.find((p) => p.type === t)!.value;
  return { date: `${get('year')}-${get('month')}-${get('day')}`, weekday: get('weekday') };
};

export function weeklyStopUrl(userId: string): string {
  const base = (process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co').replace(/\/$/, '');
  return `${base}/api/email/weekly-off?t=${userId}`;
}

async function payingMembers(now: Date) {
  const subRows = await db
    .select({ userId: users.id, clerkId: users.clerkId, email: users.email })
    .from(subscriptions)
    .innerJoin(users, eq(subscriptions.userId, users.id))
    // Not members who already cancelled (access until period end): they chose
    // to leave, and a weekly nudge would read as pushy.
    .where(and(eq(subscriptions.status, 'active'), eq(subscriptions.cancelAtPeriodEnd, false)));
  const grantRows = await db
    .select({ userId: users.id, clerkId: users.clerkId, email: users.email })
    .from(accessGrants)
    .innerJoin(users, eq(accessGrants.userId, users.id))
    .where(and(isNull(accessGrants.revokedAt), lte(accessGrants.startsAt, now), gt(accessGrants.endsAt, now)));

  const byEmail = new Map<string, { userId: string; clerkId: string; email: string }>();
  for (const r of [...subRows, ...grantRows]) {
    const key = r.email.toLowerCase();
    if (!IS_OWNER_TEST.test(key) && !byEmail.has(key)) byEmail.set(key, r);
  }
  return byEmail;
}

export async function runWeeklyPicks({
  dryRun = false,
  force = false,
  now = new Date(),
}: { dryRun?: boolean; force?: boolean; now?: Date } = {}) {
  const { date, weekday } = easternParts(now);
  if (weekday !== 'Sun' && !force) return { date, skipped: 'not Sunday', due: 0, sent: 0 };

  const byEmail = await payingMembers(now);
  if (!byEmail.size) return { date, due: 0, sent: 0 };
  const emails = [...byEmail.keys()];

  // Already sent today, or turned off.
  const blocked = await db
    .select({ email: sentEmails.email, kind: sentEmails.kind })
    .from(sentEmails)
    .where(
      and(
        inArray(sentEmails.email, emails),
        sql`(${sentEmails.kind} = ${WEEKLY_OFF_KIND} OR ${sentEmails.kind} LIKE ${`${KIND_PREFIX}${date}:%`})`,
      ),
    );
  for (const b of blocked) byEmail.delete(b.email);
  const due = [...byEmail.values()];
  if (!due.length) return { date, due: 0, sent: 0 };

  // Earlier suggestions, newest first, so a guide doesn't come back too soon.
  const pastRows = await db
    .select({ email: sentEmails.email, kind: sentEmails.kind, sentAt: sentEmails.sentAt })
    .from(sentEmails)
    .where(and(like(sentEmails.kind, `${KIND_PREFIX}%`), inArray(sentEmails.email, due.map((d) => d.email.toLowerCase()))));
  const recentByEmail = new Map<string, string[]>();
  for (const r of [...pastRows].sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())) {
    const slug = r.kind.split(':')[2];
    if (!slug) continue;
    recentByEmail.set(r.email, [...(recentByEmail.get(r.email) ?? []), slug]);
  }

  const viewRows = await db
    .select({ userId: activityEvents.userId, slug: activityEvents.slug, opens: sql<number>`count(*)::int` })
    .from(activityEvents)
    .where(
      and(
        eq(activityEvents.kind, 'view'),
        gte(activityEvents.createdAt, new Date(now.getTime() - VIEW_WINDOW_DAYS * DAY)),
        inArray(activityEvents.userId, due.map((d) => d.userId)),
      ),
    )
    .groupBy(activityEvents.userId, activityEvents.slug);

  const stateRows = await db
    .select({ clerkId: memberState.clerkId, data: memberState.data })
    .from(memberState)
    .where(inArray(memberState.clerkId, due.map((d) => d.clerkId)));
  const stateByClerk = new Map(stateRows.map((s) => [s.clerkId, s.data as StateData]));

  const theme = getThisMonth(now);
  const monthSlugs = [...theme.skill.slugs, ...(theme.seasonal?.slugs ?? [])];

  let firstNames: Record<string, string | undefined> = {};
  if (!dryRun) {
    try {
      const clerk = getClerk();
      if (clerk) {
        const list = await clerk.users.getUserList({ userId: due.map((d) => d.clerkId), limit: due.length });
        firstNames = Object.fromEntries(list.data.map((u) => [u.id, u.firstName?.trim() || undefined]));
      }
    } catch (err) {
      console.error('[weekly-pick] clerk lookup failed (continuing without names):', err);
    }
  }

  const results: { email: string; ok: boolean; guide?: string; source?: string; error?: string }[] = [];
  for (const d of due) {
    try {
      const state = stateByClerk.get(d.clerkId) ?? {};
      const views: Record<string, number> = {};
      for (const v of viewRows) if (v.userId === d.userId) views[v.slug] = v.opens;
      const kids = state.profile?.children ?? [];
      const pick = pickWeekly({
        views,
        completions: state.completions ?? [],
        weekSlugs: (state.week?.items ?? []).map((i) => i.slug),
        kids,
        recent: recentByEmail.get(d.email.toLowerCase()) ?? [],
        monthSlugs,
        now,
      });
      if (!pick) {
        results.push({ email: d.email, ok: false, error: 'no guide to suggest' });
        continue;
      }
      if (dryRun) {
        results.push({ email: d.email, ok: true, guide: pick.guide.slug, source: pick.source });
        continue;
      }
      await sendWeeklyPickEmail({
        to: d.email,
        firstName: firstNames[d.clerkId],
        guide: pick.guide,
        source: pick.source,
        doneLastWeek: pick.doneLastWeek,
        kids: kidsPhrase(kids),
        monthTitle: theme.skill.title,
        guideUrl: await generateSignInUrl(d.clerkId, `/account/view/${pick.guide.slug}`),
        stopUrl: weeklyStopUrl(d.userId),
      });
      await db.insert(sentEmails).values({ email: d.email.toLowerCase(), kind: `${KIND_PREFIX}${date}:${pick.guide.slug}` });
      results.push({ email: d.email, ok: true, guide: pick.guide.slug, source: pick.source });
    } catch (err) {
      console.error(`[weekly-pick] failed for ${d.email}:`, err);
      results.push({ email: d.email, ok: false, error: err instanceof Error ? err.message : 'unknown' });
    }
  }

  const sent = results.filter((r) => r.ok).length;
  console.log(`[weekly-pick] ${date}: ${sent}/${due.length} ${dryRun ? 'would send' : 'sent'}`);
  return { date, dryRun, due: due.length, sent, results };
}
