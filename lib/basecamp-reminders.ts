/**
 * Basecamp emails to members, run inside the daily renewal-reminders cron
 * (14:00 UTC, the morning in Eastern time):
 *
 *   - "Introducing Basecamp": once, on the date set in BASECAMP_ANNOUNCEMENTS
 *     (about a week before the first session).
 *   - "Basecamp is tomorrow": the day before every session, with the Zoom link.
 *
 * Members = active or trialing subscriptions, plus live prepaid grants. Each
 * address gets each email once (sent_emails kind 'basecamp_announce:<date>'
 * or 'basecamp_reminder:<date>').
 */

import { and, eq, gt, inArray, isNull, lte } from 'drizzle-orm';
import { db } from '@/lib/db';
import { accessGrants, sentEmails, subscriptions, users } from '@/lib/db/schema';
import { BASECAMP_ANNOUNCEMENTS, basecampZoomUrl, nextBasecamp } from '@/lib/basecamp';
import { getClerk } from '@/lib/member-provision';
import { sendBasecampAnnouncementEmail, sendBasecampReminderEmail } from '@/lib/resend';
import { getThisMonth } from '@/lib/this-month';

/** The owner's own test accounts don't need these. */
const IS_OWNER_TEST = /ameliedrouin|@anywherelearning\.co$/i;

const easternDate = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

async function currentMembers(now: Date) {
  const subRows = await db
    .select({ clerkId: users.clerkId, email: users.email })
    .from(subscriptions)
    .innerJoin(users, eq(subscriptions.userId, users.id))
    .where(inArray(subscriptions.status, ['active', 'trialing']));
  const grantRows = await db
    .select({ clerkId: users.clerkId, email: users.email })
    .from(accessGrants)
    .innerJoin(users, eq(accessGrants.userId, users.id))
    .where(and(isNull(accessGrants.revokedAt), lte(accessGrants.startsAt, now), gt(accessGrants.endsAt, now)));

  const byEmail = new Map<string, { clerkId: string; email: string }>();
  for (const r of [...subRows, ...grantRows]) {
    const key = r.email.toLowerCase();
    if (!IS_OWNER_TEST.test(key) && !byEmail.has(key)) byEmail.set(key, r);
  }
  return byEmail;
}

async function firstNamesFor(clerkIds: string[]) {
  try {
    const clerk = getClerk();
    if (!clerk || !clerkIds.length) return {};
    const list = await clerk.users.getUserList({ userId: clerkIds, limit: clerkIds.length });
    return Object.fromEntries(list.data.map((u) => [u.id, u.firstName?.trim() || undefined])) as Record<string, string | undefined>;
  } catch (err) {
    console.error('[basecamp] clerk lookup failed (continuing without names):', err);
    return {};
  }
}

export async function runBasecampReminders({ dryRun = false, now = new Date() } = {}) {
  const session = nextBasecamp(now);
  if (!session) return { session: null, email: null, due: 0, sent: 0 };

  const today = easternDate(now);
  const tomorrow = easternDate(new Date(now.getTime() + 24 * 60 * 60 * 1000));
  const which =
    session.date === tomorrow ? 'reminder' : BASECAMP_ANNOUNCEMENTS[session.date] === today ? 'announce' : null;
  if (!which) return { session: session.date, email: null, due: 0, sent: 0 };

  const zoomUrl = basecampZoomUrl();
  if (which === 'reminder' && !zoomUrl) {
    return { session: session.date, email: which, due: 0, sent: 0, error: 'BASECAMP_ZOOM_URL is not set' };
  }

  const kind = `basecamp_${which}:${session.date}`;
  const topic = getThisMonth(session.start).skill.title.replace(/^The month of /i, '').replace(/^./, (c) => c.toUpperCase());

  const byEmail = await currentMembers(now);
  if (byEmail.size) {
    const already = await db
      .select({ email: sentEmails.email })
      .from(sentEmails)
      .where(and(eq(sentEmails.kind, kind), inArray(sentEmails.email, [...byEmail.keys()])));
    for (const a of already) byEmail.delete(a.email);
  }
  const due = [...byEmail.values()];
  if (dryRun || !due.length) return { session: session.date, email: which, due: due.length, sent: 0, dryRun };

  const firstNames = await firstNamesFor(due.map((d) => d.clerkId));
  let sent = 0;
  for (const d of due) {
    try {
      const common = {
        to: d.email,
        firstName: firstNames[d.clerkId],
        dayLabel: session.dayLabel,
        timeLabel: session.timeLabel,
        topic,
      };
      if (which === 'reminder') await sendBasecampReminderEmail({ ...common, zoomUrl: zoomUrl! });
      else await sendBasecampAnnouncementEmail(common);
      await db.insert(sentEmails).values({ email: d.email.toLowerCase(), kind });
      sent++;
    } catch (err) {
      console.error(`[basecamp] ${which} failed for ${d.email}:`, err);
    }
  }
  console.log(`[basecamp] ${which} for ${session.date}: ${sent}/${due.length}`);
  return { session: session.date, email: which, due: due.length, sent };
}
