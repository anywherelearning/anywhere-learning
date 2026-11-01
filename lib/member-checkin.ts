/**
 * Three-week personal check-in: a note Amelie sends herself, from her own
 * inbox, to every new member about 3 weeks after they join.
 *
 * Day 21 lands after a monthly member's first charge (day 7) and before their
 * second (day 37), and early in an annual member's year, so one check-in
 * reaches both. Gift and prepaid grant members are included, counted from the
 * day their access starts.
 *
 * Nothing goes to the member automatically. The daily cron emails Amelie one
 * digest: each family that hit 3 weeks, what they've done in the library, a
 * note drafted from that, and an "Open in Gmail" link that opens it ready to
 * edit and send from info@.
 *
 * The draft is a thank-you, not a nudge: who Amelie is, why she builds this,
 * and an open door for feedback. It never suggests an activity (the member
 * zone does that); it only mentions what they've already done.
 */

import { and, eq, gte, inArray, isNull, lte, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  accessGrants,
  activityEvents,
  memberState,
  sentEmails,
  subscriptions,
  users,
} from '@/lib/db/schema';
import { getClerk } from '@/lib/member-provision';
import { childAge, type Child } from '@/lib/member-profile';
import { sendOwnerAlertEmail } from '@/lib/resend';
import { planForPriceId } from '@/lib/stripe-prices';
import { GRANT_SOURCE_LABELS, type GrantSource } from '@/lib/access-grants';
import { kidsPhrase } from '@/lib/trial-midpoint';
import { getFallbackProductBySlug } from '@/lib/fallback-products';

const DAY = 24 * 60 * 60 * 1000;
const EMAIL_KIND = 'member_checkin';
/** Members are picked up from day 21. The window runs to day 35 so a missed
 *  cron run or a deploy gap never skips anyone; sent_emails stops repeats. */
const FROM_DAY = 21;
const TO_DAY = 35;
/** The owner's own test accounts never need a check-in. */
const IS_OWNER_TEST = /ameliedrouin|@anywherelearning\.co$/i;
const OWNER_INBOX = 'info@anywherelearning.co';

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

interface StateData {
  profile?: { children?: Child[] };
  week?: { items?: { slug: string }[] };
  completions?: { slug: string; at: string }[] | null;
}

export interface CheckinDraft {
  subject: string;
  body: string;
}

/**
 * The note itself, in Amelie's voice. A thank-you from a real person, not a
 * nudge: no activity suggestions (the member zone already picks the next one).
 * The one personal detail is what they've done, when they've done something.
 * Pure, so it can be tested.
 */
export function draftCheckin(opts: {
  firstName?: string;
  kids: Child[];
  /** Activities marked done, most recent first. */
  done: string[];
}): CheckinDraft {
  // Names without ages: "you and Eva (11)" reads like a form, not a note.
  const kids = kidsPhrase(opts.kids.map((k) => ({ ...k, birthMonth: null, age: null })));

  let noticed: string;
  if (opts.done.length) {
    const extra = opts.done.length - 1;
    const more = extra < 10 ? `${NUMBER_WORDS[extra]} more` : `${extra} more`;
    noticed = `I saw ${kids ? `you and ${kids}` : 'you'} did ${opts.done[0]}${
      extra > 0 ? `, and ${more} besides` : ''
    }. That honestly made my day. It's exactly what I hope for when I write these guides.`;
  } else {
    noticed =
      "Whether you've already dived in or life has been busy (it happens to all of us), I hope it's been a good fit for your family so far.";
  }

  return {
    subject: 'A thank you from Amelie',
    body: [
      `Hi ${opts.firstName || 'there'},`,
      "I'm Amelie, the person behind Anywhere Learning. You joined a few weeks ago, and I wanted to write to you myself to say thank you. It really means a lot to me.",
      noticed,
      `Anywhere Learning isn't a big company. It's me, a former teacher and homeschooling mom, building every guide with one goal: that it's genuinely useful for your family, easy to use, and full of real learning for ${
        kids || 'your kids'
      }.`,
      "So I'd love to hear how it's going. If something is confusing, missing, or just not working for your family, please tell me. And if something worked, I'd love to hear that too. Your feedback shapes what I build next.",
      "I'm always here if you need anything.",
      'Warmly,\nAmelie',
    ].join('\n\n'),
  };
}

/** Opens the note in Gmail as info@, ready to edit and send. */
export function gmailComposeUrl(to: string, draft: CheckinDraft): string {
  const q = new URLSearchParams({
    authuser: OWNER_INBOX,
    view: 'cm',
    fs: '1',
    to,
    su: draft.subject,
    body: draft.body,
  });
  return `https://mail.google.com/mail/?${q.toString()}`;
}

interface Due {
  userId: string;
  clerkId: string;
  email: string;
  startedAt: Date;
  /** 'Monthly', 'Annual', or the grant source, e.g. 'Gift'. */
  plan: string;
  cancelling: boolean;
}

const fmt = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' });

/**
 * Find every member at 3 weeks who hasn't had a check-in drafted, and email
 * Amelie one digest with a note for each. `dryRun` returns the digest without
 * sending it or marking anyone done; `fromDay`/`toDay` widen the window for a
 * one-off catch-up of earlier members.
 */
export async function runMemberCheckins({
  dryRun = false,
  fromDay = FROM_DAY,
  toDay = TO_DAY,
}: { dryRun?: boolean; fromDay?: number; toDay?: number } = {}) {
  const now = Date.now();
  const from = new Date(now - toDay * DAY);
  const to = new Date(now - fromDay * DAY);

  const subRows = await db
    .select({
      userId: subscriptions.userId,
      clerkId: users.clerkId,
      email: users.email,
      startedAt: subscriptions.createdAt,
      priceId: subscriptions.stripePriceId,
      cancelling: subscriptions.cancelAtPeriodEnd,
    })
    .from(subscriptions)
    .innerJoin(users, eq(subscriptions.userId, users.id))
    .where(
      and(
        eq(subscriptions.status, 'active'),
        gte(subscriptions.createdAt, from),
        lte(subscriptions.createdAt, to),
      ),
    );

  const grantRows = await db
    .select({
      userId: accessGrants.userId,
      clerkId: users.clerkId,
      email: users.email,
      startedAt: accessGrants.startsAt,
      source: accessGrants.source,
    })
    .from(accessGrants)
    .innerJoin(users, eq(accessGrants.userId, users.id))
    .where(
      and(
        isNull(accessGrants.revokedAt),
        gte(accessGrants.startsAt, from),
        lte(accessGrants.startsAt, to),
      ),
    );

  const byEmail = new Map<string, Due>();
  for (const r of subRows) {
    byEmail.set(r.email.toLowerCase(), {
      userId: r.userId,
      clerkId: r.clerkId,
      email: r.email,
      startedAt: r.startedAt,
      plan: planForPriceId(r.priceId) === 'monthly' ? 'Monthly' : 'Annual',
      cancelling: r.cancelling,
    });
  }
  for (const r of grantRows) {
    const key = r.email.toLowerCase();
    if (byEmail.has(key)) continue;
    byEmail.set(key, {
      userId: r.userId,
      clerkId: r.clerkId,
      email: r.email,
      startedAt: r.startedAt,
      plan: GRANT_SOURCE_LABELS[r.source as GrantSource] ?? 'Prepaid',
      cancelling: false,
    });
  }

  const candidates = [...byEmail.entries()]
    .filter(([email]) => !IS_OWNER_TEST.test(email))
    .map(([, d]) => d);
  if (!candidates.length) return { due: 0, sent: false };

  const already = await db
    .select({ email: sentEmails.email })
    .from(sentEmails)
    .where(
      and(
        eq(sentEmails.kind, EMAIL_KIND),
        inArray(sentEmails.email, candidates.map((c) => c.email.toLowerCase())),
      ),
    );
  const done = new Set(already.map((a) => a.email));
  const due = candidates.filter((c) => !done.has(c.email.toLowerCase()));
  if (!due.length) return { due: 0, sent: false };

  const viewRows = await db
    .select({
      userId: activityEvents.userId,
      slug: activityEvents.slug,
      opens: sql<number>`count(*)::int`,
    })
    .from(activityEvents)
    .where(and(eq(activityEvents.kind, 'view'), inArray(activityEvents.userId, due.map((d) => d.userId))))
    .groupBy(activityEvents.userId, activityEvents.slug);

  const stateRows = await db
    .select({ clerkId: memberState.clerkId, data: memberState.data })
    .from(memberState)
    .where(inArray(memberState.clerkId, due.map((d) => d.clerkId)));
  const stateByClerk = new Map(stateRows.map((s) => [s.clerkId, s.data as StateData]));

  // First names are a nice-to-have: without them the note says "Hi there".
  let firstNames: Record<string, string | undefined> = {};
  try {
    const clerk = getClerk();
    if (clerk) {
      const list = await clerk.users.getUserList({ userId: due.map((d) => d.clerkId), limit: due.length });
      firstNames = Object.fromEntries(list.data.map((u) => [u.id, u.firstName?.trim() || undefined]));
    }
  } catch (err) {
    console.error('[checkin] clerk lookup failed (continuing without names):', err);
  }

  const sections: string[] = [];
  for (const [i, d] of due.entries()) {
    const state = stateByClerk.get(d.clerkId) ?? {};
    const views: Record<string, number> = {};
    for (const v of viewRows) if (v.userId === d.userId) views[v.slug] = v.opens;
    const completed = [...(state.completions ?? [])]
      .sort((a, b) => a.at.localeCompare(b.at))
      .map((c) => c.slug);
    const kids = state.profile?.children ?? [];
    const doneNames = [...new Set([...completed].reverse())]
      .map((s) => getFallbackProductBySlug(s)?.name)
      .filter((n): n is string => !!n);

    const kidLine = kids.length
      ? kids
          .map((k) => {
            const age = childAge(k);
            return age !== null ? `${k.name} (${age})` : k.name;
          })
          .join(', ')
      : 'no kids added';
    const doneCount = new Set(completed).size;
    const header = [
      `${i + 1}. ${d.email}`,
      `   ${d.plan} · joined ${fmt(d.startedAt)}${d.cancelling ? ' · SET TO CANCEL' : ''} · kids: ${kidLine}`,
      `   Library: ${doneCount} marked done, ${Object.keys(views).length} guides opened`,
    ];

    const draft = draftCheckin({ firstName: firstNames[d.clerkId], kids, done: doneNames });
    sections.push(
      [
        ...header,
        '',
        `   Open in Gmail, ready to edit and send:`,
        `   ${gmailComposeUrl(d.email, draft)}`,
        '',
        `   Subject: ${draft.subject}`,
        '   ----',
        draft.body
          .split('\n')
          .map((l) => (l ? `   ${l}` : ''))
          .join('\n'),
        '   ----',
      ].join('\n'),
    );
  }

  const n = due.length;
  const subject = `Check in with ${n} ${n === 1 ? 'family' : 'families'} at 3 weeks`;
  const text = [
    `${n === 1 ? 'One member has' : `${n} members have`} been with you about 3 weeks. Each note below is a thank-you drafted for that family. Tap "Open in Gmail", make it yours, and send.`,
    ...sections,
    'You get this once per member, around day 21, so monthly members hear from you between their first and second charge.',
  ].join('\n\n');

  if (dryRun) return { due: n, sent: false, subject, text };

  await sendOwnerAlertEmail({ subject, text });
  await db.insert(sentEmails).values(due.map((d) => ({ email: d.email.toLowerCase(), kind: EMAIL_KIND })));
  return { due: n, sent: true };
}
