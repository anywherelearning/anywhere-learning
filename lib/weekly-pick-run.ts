/**
 * Sends the weekly "one for this week" email (emails/WeeklyPick.tsx), from the
 * daily renewal-reminders cron (14:00 UTC, morning in North America).
 * Manual runs: GET /api/cron/weekly-pick?dry=1 (&force=1 ignores the launch date).
 *
 * Rhythm (Amelie, Nov 27 2026): each family's first email comes 7 days after
 * they became a paying member, then every 7 days after that, on their own day
 * of the week. Nobody gets one before WEEKLY_LAUNCH, so everyone already in
 * starts on Sunday Dec 6 2026. "Became a paying member" = the owner's
 * "Trial converted to paid" alert for that subscription when there is one
 * (sent_emails kind 'owner_alert:converted:<sub id>'), else the subscription's
 * start; for prepaid grants, the grant start.
 *
 * Who: active subscriptions not set to cancel (NOT trialing: trials already get
 * three emails in seven days) plus live prepaid grants, minus the owner's test
 * accounts and anyone who clicked "Stop the weekly pick".
 *
 * Bookkeeping lives in sent_emails, no new table:
 *   - 'weekly_pick:<YYYY-MM-DD>:<slug>'  one per send; the date gives the
 *     rhythm, the slug stops a suggestion coming back too soon.
 *   - 'weekly_pick_off'                   they turned it off.
 */

import { and, eq, gt, gte, inArray, isNull, like, lte, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { accessGrants, activityEvents, memberState, sentEmails, subscriptions, users } from '@/lib/db/schema';
import { generateSignInUrl, getClerk } from '@/lib/member-provision';
import { sendWeeklyPickEmail } from '@/lib/resend';
import { getThisMonth } from '@/lib/this-month';
import { kidsPhrase } from '@/lib/trial-midpoint';
import { isWeeklyDue, monthRecap, pickWeekly } from '@/lib/weekly-pick';
import type { Child } from '@/lib/member-profile';

const IS_OWNER_TEST = /ameliedrouin|@anywherelearning\.co$/i;
const KIND_PREFIX = 'weekly_pick:';
export const WEEKLY_OFF_KIND = 'weekly_pick_off';
/** First day anyone can get it (Eastern). Existing members all start here. */
export const WEEKLY_LAUNCH = '2026-12-06';
const DAY = 24 * 60 * 60 * 1000;
/** Reader opens older than this don't count as "you opened it recently". */
const VIEW_WINDOW_DAYS = 28;

interface StateData {
  profile?: { children?: Child[] };
  week?: { items?: { slug: string }[] };
  completions?: { slug: string; at: string }[] | null;
}

const easternDate = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

export function weeklyStopUrl(userId: string): string {
  const base = (process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co').replace(/\/$/, '');
  return `${base}/api/email/weekly-off?t=${userId}`;
}

interface Member {
  userId: string;
  clerkId: string;
  email: string;
  /** When they became a paying member (see header). */
  memberSince: Date;
}

async function payingMembers(now: Date) {
  const subRows = await db
    .select({
      userId: users.id,
      clerkId: users.clerkId,
      email: users.email,
      createdAt: subscriptions.createdAt,
      stripeSubscriptionId: subscriptions.stripeSubscriptionId,
    })
    .from(subscriptions)
    .innerJoin(users, eq(subscriptions.userId, users.id))
    // Not members who already cancelled (access until period end): they chose
    // to leave, and a weekly nudge would read as pushy.
    .where(and(eq(subscriptions.status, 'active'), eq(subscriptions.cancelAtPeriodEnd, false)));
  const grantRows = await db
    .select({ userId: users.id, clerkId: users.clerkId, email: users.email, startsAt: accessGrants.startsAt })
    .from(accessGrants)
    .innerJoin(users, eq(accessGrants.userId, users.id))
    .where(and(isNull(accessGrants.revokedAt), lte(accessGrants.startsAt, now), gt(accessGrants.endsAt, now)));

  // Trial-to-paid moments, from the owner alert the webhook logs at conversion.
  const convKinds = subRows.map((r) => `owner_alert:converted:${r.stripeSubscriptionId}`);
  const conversions = convKinds.length
    ? await db
        .select({ kind: sentEmails.kind, sentAt: sentEmails.sentAt })
        .from(sentEmails)
        .where(and(eq(sentEmails.email, 'owner'), inArray(sentEmails.kind, convKinds)))
    : [];
  const convertedAt = new Map(conversions.map((c) => [c.kind.split(':')[2], c.sentAt]));

  const byEmail = new Map<string, Member>();
  const add = (m: Member) => {
    const key = m.email.toLowerCase();
    if (!IS_OWNER_TEST.test(key) && !byEmail.has(key)) byEmail.set(key, m);
  };
  for (const r of subRows) {
    add({ ...r, memberSince: convertedAt.get(r.stripeSubscriptionId) ?? r.createdAt });
  }
  for (const r of grantRows) add({ ...r, memberSince: r.startsAt });
  return byEmail;
}

export async function runWeeklyPicks({
  dryRun = false,
  force = false,
  now = new Date(),
}: { dryRun?: boolean; force?: boolean; now?: Date } = {}) {
  const date = easternDate(now);
  if (date < WEEKLY_LAUNCH && !force) return { date, skipped: `starts ${WEEKLY_LAUNCH}`, due: 0, sent: 0 };

  const byEmail = await payingMembers(now);
  if (!byEmail.size) return { date, due: 0, sent: 0 };
  const emails = [...byEmail.keys()];

  const optedOut = await db
    .select({ email: sentEmails.email })
    .from(sentEmails)
    .where(and(inArray(sentEmails.email, emails), eq(sentEmails.kind, WEEKLY_OFF_KIND)));
  for (const o of optedOut) byEmail.delete(o.email);

  // Every earlier weekly email, newest first: the last one sets the rhythm,
  // and the slugs stop a guide coming back too soon.
  const pastRows = byEmail.size
    ? await db
        .select({ email: sentEmails.email, kind: sentEmails.kind, sentAt: sentEmails.sentAt })
        .from(sentEmails)
        .where(and(like(sentEmails.kind, `${KIND_PREFIX}%`), inArray(sentEmails.email, [...byEmail.keys()])))
    : [];
  const recentByEmail = new Map<string, string[]>();
  const lastSentByEmail = new Map<string, Date>();
  for (const r of [...pastRows].sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())) {
    if (!lastSentByEmail.has(r.email)) lastSentByEmail.set(r.email, r.sentAt);
    const slug = r.kind.split(':')[2];
    if (slug) recentByEmail.set(r.email, [...(recentByEmail.get(r.email) ?? []), slug]);
  }

  const due = [...byEmail.entries()]
    .filter(([email, m]) => isWeeklyDue({ memberSince: m.memberSince, lastSent: lastSentByEmail.get(email), now }))
    .map(([, m]) => m);
  if (!due.length) return { date, due: 0, sent: 0 };

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

  const results: { email: string; ok: boolean; guide?: string; source?: string; quiet?: boolean; recap?: string; error?: string }[] = [];
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
        const last = lastSentByEmail.get(d.email.toLowerCase());
        const firstOfMonth = !last || easternDate(last).slice(0, 7) !== date.slice(0, 7);
        const recap = firstOfMonth ? monthRecap(state.completions ?? [], now) : null;
        results.push({
          email: d.email,
          ok: true,
          guide: pick.guide.slug,
          source: pick.source,
          ...(pick.quiet && { quiet: true }),
          ...(recap && { recap: `${recap.month}: ${recap.activities.length} done` }),
        });
        continue;
      }
      // A recap of last month rides along in the first weekly email of each
      // new month (Eastern), and only when they marked something done.
      const last = lastSentByEmail.get(d.email.toLowerCase());
      const firstOfMonth = !last || easternDate(last).slice(0, 7) !== date.slice(0, 7);
      const recap = firstOfMonth ? monthRecap(state.completions ?? [], now) : null;

      await sendWeeklyPickEmail({
        to: d.email,
        firstName: firstNames[d.clerkId],
        guide: pick.guide,
        source: pick.source,
        doneLastWeek: pick.doneLastWeek,
        quiet: pick.quiet,
        recap,
        // First names only, no ages (her call Nov 27): "Maya", "Elijah and Indie".
        kids: kidsPhrase(kids.map((k) => ({ ...k, birthMonth: null, age: null }))),
        monthTitle: theme.skill.title,
        weekIndex: recentByEmail.get(d.email.toLowerCase())?.length ?? 0,
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
