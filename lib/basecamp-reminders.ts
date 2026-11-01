/**
 * The day-before Basecamp reminder. Runs inside the daily renewal-reminders
 * cron (14:00 UTC, the morning in Eastern time): when tomorrow is a Basecamp
 * date, every member gets "Basecamp is tomorrow" with the Zoom link.
 *
 * Members = active or trialing subscriptions, plus live prepaid grants. Each
 * address gets one reminder per session (sent_emails kind
 * 'basecamp_reminder:<date>').
 */

import { and, eq, gt, inArray, isNull, lte } from 'drizzle-orm';
import { db } from '@/lib/db';
import { accessGrants, sentEmails, subscriptions, users } from '@/lib/db/schema';
import { basecampZoomUrl, nextBasecamp } from '@/lib/basecamp';
import { getClerk } from '@/lib/member-provision';
import { sendBasecampReminderEmail } from '@/lib/resend';
import { getThisMonth } from '@/lib/this-month';

/** The owner's own test accounts don't need reminders. */
const IS_OWNER_TEST = /ameliedrouin|@anywherelearning\.co$/i;

const easternDate = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

export async function runBasecampReminders({ dryRun = false, now = new Date() } = {}) {
  const session = nextBasecamp(now);
  const zoomUrl = basecampZoomUrl();
  const tomorrow = easternDate(new Date(now.getTime() + 24 * 60 * 60 * 1000));
  if (!session || session.date !== tomorrow) return { session: session?.date ?? null, due: 0, sent: 0 };
  if (!zoomUrl) return { session: session.date, due: 0, sent: 0, error: 'BASECAMP_ZOOM_URL is not set' };

  const kind = `basecamp_reminder:${session.date}`;
  const topic = getThisMonth(session.start).skill.title.replace(/^The month of /i, '').replace(/^./, (c) => c.toUpperCase());

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
  if (!byEmail.size) return { session: session.date, due: 0, sent: 0 };

  const already = await db
    .select({ email: sentEmails.email })
    .from(sentEmails)
    .where(and(eq(sentEmails.kind, kind), inArray(sentEmails.email, [...byEmail.keys()])));
  for (const a of already) byEmail.delete(a.email);
  const due = [...byEmail.values()];
  if (dryRun || !due.length) return { session: session.date, due: due.length, sent: 0, dryRun };

  let firstNames: Record<string, string | undefined> = {};
  try {
    const clerk = getClerk();
    if (clerk) {
      const list = await clerk.users.getUserList({ userId: due.map((d) => d.clerkId), limit: due.length });
      firstNames = Object.fromEntries(list.data.map((u) => [u.id, u.firstName?.trim() || undefined]));
    }
  } catch (err) {
    console.error('[basecamp] clerk lookup failed (continuing without names):', err);
  }

  let sent = 0;
  for (const d of due) {
    try {
      await sendBasecampReminderEmail({
        to: d.email,
        firstName: firstNames[d.clerkId],
        dayLabel: session.dayLabel,
        timeLabel: session.timeLabel,
        topic,
        zoomUrl,
      });
      await db.insert(sentEmails).values({ email: d.email.toLowerCase(), kind });
      sent++;
    } catch (err) {
      console.error(`[basecamp] reminder failed for ${d.email}:`, err);
    }
  }
  console.log(`[basecamp] reminders for ${session.date}: ${sent}/${due.length}`);
  return { session: session.date, due: due.length, sent };
}
