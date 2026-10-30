/**
 * Access grants: prepaid membership time with no Stripe subscription behind it.
 *
 * One tool for every "someone already paid, just let them in" case:
 *   - gift      a relative bought a year (gift checkout, coming next)
 *   - odyssey   Utah Fits All / other ESA marketplace order
 *   - charter   California charter or other school-funds order
 *   - coop      co-op or group license (one grant per family)
 *   - school    teacher license paid by a school
 *   - comp      free access you hand out yourself (giveaway winner, partner)
 *
 * A grant gives full member access (lib/access.ts) until endsAt. No card on
 * file, nothing renews. ~14 days before the end the member gets one "keep
 * going?" email, and after the end their Kit tags flip to lapsed (both run from
 * the daily renewal-reminders cron via runGrantLifecycle).
 */

import { db } from '@/lib/db';
import { accessGrants, subscriptions, users } from '@/lib/db/schema';
import { and, desc, eq, gt, isNull, lte, or } from 'drizzle-orm';
import { applyAndRemoveTags } from '@/lib/convertkit';
import { sendGrantEndingEmail, sendGrantWelcomeEmail } from '@/lib/resend';
import { findOrCreateClerkUser, generateSignInUrl, getClerk, upsertUser } from '@/lib/member-provision';

export const GRANT_SOURCES = ['gift', 'odyssey', 'charter', 'coop', 'school', 'comp'] as const;
export type GrantSource = (typeof GRANT_SOURCES)[number];

export const GRANT_SOURCE_LABELS: Record<GrantSource, string> = {
  gift: 'Gift',
  odyssey: 'Odyssey / ESA',
  charter: 'Charter / school funds',
  coop: 'Co-op license',
  school: 'School / teacher',
  comp: 'Comp (free)',
};

/** Days before endsAt the "your year ends soon" email goes out. */
export const GRANT_REMINDER_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;

function addMonths(from: Date, months: number): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() + months);
  return d;
}

export interface GrantInput {
  email: string;
  months: number;
  source: GrantSource;
  firstName?: string;
  lastName?: string;
  giftFrom?: string;
  giftMessage?: string;
  note?: string;
  /** Send the welcome email with the one-tap sign-in link. Default true. */
  sendEmail?: boolean;
  /** Scheduled gift: access, tags and the welcome email all wait until this
   *  moment (the daily cron activates it). Omit to start now. */
  startsOn?: Date;
  /** Gift checkout: the buyer's email and the paying Stripe session. */
  buyerEmail?: string;
  stripeSessionId?: string;
  /** Gift checkout only: the money is already taken, so grant even when the
   *  recipient already pays for a membership. The result carries a warning
   *  so the owner can cancel their renewal or refund. */
  allowWhilePaying?: boolean;
}

export type GrantResult =
  | { ok: true; grantId: string; startsAt: Date; endsAt: Date; extended: boolean; emailed: boolean; scheduled: boolean; warning?: string }
  | { ok: false; error: string };

/**
 * Give someone membership for `months`. Creates their Clerk account if they
 * don't have one, so the welcome link signs them straight in. If they already
 * hold a live grant, the new months stack onto its end instead of overlapping.
 */
export async function grantAccess(input: GrantInput): Promise<GrantResult> {
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'That email address looks wrong.' };
  if (!GRANT_SOURCES.includes(input.source)) return { ok: false, error: 'Unknown source.' };
  const months = Math.round(input.months);
  if (!(months >= 1 && months <= 36)) return { ok: false, error: 'Months must be between 1 and 36.' };

  const clerkUser = await findOrCreateClerkUser(email, input.firstName?.trim() || undefined, input.lastName?.trim() || undefined);
  if (!clerkUser) return { ok: false, error: 'Could not create or find the Clerk account. Check CLERK_SECRET_KEY.' };
  const userId = await upsertUser({ clerkId: clerkUser.id, email });

  const now = new Date();

  // A paying member doesn't need a grant on top: it would silently cover a
  // lapsed card. Cancel or refund their subscription first if that's the plan.
  const paying = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        or(eq(subscriptions.status, 'active'), eq(subscriptions.status, 'past_due')),
        eq(subscriptions.cancelAtPeriodEnd, false),
        gt(subscriptions.currentPeriodEnd, now),
      ),
    )
    .limit(1);
  let warning: string | undefined;
  if (paying.length > 0) {
    const msg = `${email} already has an active paid membership in Stripe.`;
    if (!input.allowWhilePaying) return { ok: false, error: msg };
    warning = `${msg} Cancel their renewal or refund so they aren't charged on top of the gift.`;
    console.warn('[grants]', warning);
  }

  const live = await db
    .select({ id: accessGrants.id, endsAt: accessGrants.endsAt })
    .from(accessGrants)
    .where(and(eq(accessGrants.userId, userId), isNull(accessGrants.revokedAt), gt(accessGrants.endsAt, now)))
    .orderBy(desc(accessGrants.endsAt))
    .limit(1);
  const extended = live.length > 0;
  const requested = input.startsOn && input.startsOn > now ? input.startsOn : now;
  // Stacked grants start when the current one ends, so the record shows the
  // real coverage window. Access stays continuous either way.
  const startsAt = extended && live[0].endsAt > requested ? live[0].endsAt : requested;
  const endsAt = addMonths(startsAt, months);
  // A top-up announces itself now; a scheduled gift waits for its date.
  const scheduled = !extended && startsAt > now;

  const inserted = await db
    .insert(accessGrants)
    .values({
      userId,
      email,
      source: input.source,
      giftFrom: input.giftFrom?.trim() || null,
      giftMessage: input.giftMessage?.trim() || null,
      buyerEmail: input.buyerEmail?.trim().toLowerCase() || null,
      stripeSessionId: input.stripeSessionId || null,
      note: input.note?.trim() || null,
      startsAt,
      endsAt,
    })
    .onConflictDoNothing({ target: accessGrants.stripeSessionId })
    .returning();
  if (inserted.length === 0) return { ok: false, error: 'This payment already created a grant.' };
  const grant = inserted[0];

  let emailed = false;
  if (!scheduled) {
    emailed = await activateGrant(grant, clerkUser.id, {
      firstName: input.firstName?.trim() || undefined,
      sendEmail: input.sendEmail !== false,
      extended,
      months,
    });
  }

  return { ok: true, grantId: grant.id, startsAt, endsAt, extended, emailed, scheduled, warning };
}

type GrantRow = typeof accessGrants.$inferSelect;

/**
 * Turn a grant on for the member: Kit tags, Clerk badge, welcome email. Runs
 * at grant time, or from the daily cron when a scheduled gift's date arrives.
 * Stamps welcomeSentAt either way so it runs once. Returns whether the email
 * went out.
 */
async function activateGrant(
  grant: GrantRow,
  clerkId: string,
  opts: { firstName?: string; sendEmail: boolean; extended: boolean; months: number },
): Promise<boolean> {
  // Kit: same 'member' tag paying members get, plus where the grant came from
  // so each channel can be counted and emailed on its own.
  try {
    await applyAndRemoveTags(grant.email, {
      add: ['member', `grant-${grant.source}`],
      remove: ['lapsed-member', 'refunded', 'member-canceled', 'trial-canceled', 'checkout-abandoned'],
    });
  } catch (err) {
    console.error('[grants] kit tag failed:', err);
  }

  // Header badge mirror (the DB stays the source of truth; see /api/user/access).
  try {
    await getClerk()?.users.updateUserMetadata(clerkId, { publicMetadata: { tier: 'member', founder: false } });
  } catch (err) {
    console.warn('[grants] could not write tier metadata:', err);
  }

  let emailed = false;
  if (opts.sendEmail) {
    try {
      const firstName = opts.firstName || (await clerkFirstName(clerkId));
      const signInUrl = await generateSignInUrl(clerkId, '/account/welcome');
      await sendGrantWelcomeEmail({
        to: grant.email,
        firstName,
        signInUrl,
        source: grant.source as GrantSource,
        giftFrom: grant.giftFrom || undefined,
        giftMessage: grant.giftMessage || undefined,
        months: opts.months,
        endsAt: grant.endsAt.toISOString(),
        extended: opts.extended,
      });
      emailed = true;
    } catch (err) {
      console.error('[grants] welcome email failed:', err);
    }
  }

  await db.update(accessGrants).set({ welcomeSentAt: new Date() }).where(eq(accessGrants.id, grant.id));
  return emailed;
}

/** Whole months between two dates, for the welcome email's "a year" copy. */
function monthsBetween(a: Date, b: Date): number {
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / (30.44 * DAY_MS)));
}

/** End a grant now (refund, mistake, duplicate). Access drops immediately. */
export async function revokeGrant(grantId: string): Promise<void> {
  await db.update(accessGrants).set({ revokedAt: new Date() }).where(eq(accessGrants.id, grantId));
}

/** Most recent grants first, for the admin page. */
export async function listGrants(limit = 200) {
  return db.select().from(accessGrants).orderBy(desc(accessGrants.createdAt)).limit(limit);
}

async function clerkFirstName(clerkId: string): Promise<string | undefined> {
  try {
    const u = await getClerk()?.users.getUser(clerkId);
    return u?.firstName?.trim() || undefined;
  } catch {
    return undefined;
  }
}

/** Is this user still covered after `after`, by a later grant or a live subscription? */
async function coveredAfter(userId: string, after: Date, excludeGrantId: string): Promise<boolean> {
  const later = await db
    .select({ id: accessGrants.id })
    .from(accessGrants)
    .where(and(eq(accessGrants.userId, userId), isNull(accessGrants.revokedAt), gt(accessGrants.endsAt, after)))
    .limit(2);
  if (later.some((g) => g.id !== excludeGrantId)) return true;
  const sub = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        or(eq(subscriptions.status, 'active'), eq(subscriptions.status, 'trialing')),
        gt(subscriptions.currentPeriodEnd, after),
      ),
    )
    .limit(1);
  return sub.length > 0;
}

/**
 * Daily housekeeping, called from the renewal-reminders cron:
 *   0. Scheduled gifts whose start date has arrived get activated.
 *   1. "Your year ends on X" email, once, inside the last 14 days. The
 *      reminderSentAt stamp (not a 24h window) makes it safe if a run is
 *      missed or doubled.
 *   2. Grants that ended: swap Kit tags to lapsed, once (endedAt stamp).
 * Both skip members who stay covered by a stacked grant or a subscription.
 */
export async function runGrantLifecycle(): Promise<{ activated: number; reminded: number; ended: number; errors: number }> {
  const now = new Date();
  let activated = 0;
  let reminded = 0;
  let ended = 0;
  let errors = 0;

  // Scheduled gifts whose day has come: tags, badge, welcome email.
  const due = await db
    .select({ grant: accessGrants, clerkId: users.clerkId })
    .from(accessGrants)
    .innerJoin(users, eq(accessGrants.userId, users.id))
    .where(and(isNull(accessGrants.revokedAt), isNull(accessGrants.welcomeSentAt), lte(accessGrants.startsAt, now)));
  for (const { grant, clerkId } of due) {
    try {
      await activateGrant(grant, clerkId, {
        sendEmail: true,
        extended: false,
        months: monthsBetween(grant.startsAt, grant.endsAt),
      });
      activated++;
    } catch (err) {
      errors++;
      console.error(`[grants] activation failed for ${grant.email}:`, err);
    }
  }

  const dueReminders = await db
    .select({ grant: accessGrants, clerkId: users.clerkId })
    .from(accessGrants)
    .innerJoin(users, eq(accessGrants.userId, users.id))
    .where(
      and(
        isNull(accessGrants.revokedAt),
        isNull(accessGrants.reminderSentAt),
        gt(accessGrants.endsAt, now),
        lte(accessGrants.endsAt, new Date(now.getTime() + GRANT_REMINDER_DAYS * DAY_MS)),
      ),
    );
  for (const { grant, clerkId } of dueReminders) {
    try {
      if (!(await coveredAfter(grant.userId, grant.endsAt, grant.id))) {
        const signInUrl = await generateSignInUrl(clerkId, '/choose-plan');
        await sendGrantEndingEmail({
          to: grant.email,
          firstName: await clerkFirstName(clerkId),
          endsAt: grant.endsAt.toISOString(),
          source: grant.source as GrantSource,
          signInUrl,
        });
        reminded++;
      }
      await db.update(accessGrants).set({ reminderSentAt: now }).where(eq(accessGrants.id, grant.id));
    } catch (err) {
      errors++;
      console.error(`[grants] reminder failed for ${grant.email}:`, err);
    }
  }

  const finished = await db
    .select()
    .from(accessGrants)
    .where(and(isNull(accessGrants.revokedAt), isNull(accessGrants.endedAt), lte(accessGrants.endsAt, now)));
  for (const grant of finished) {
    try {
      if (!(await coveredAfter(grant.userId, now, grant.id))) {
        await applyAndRemoveTags(grant.email, { add: ['lapsed-member'], remove: ['member'] });
        ended++;
      }
      await db.update(accessGrants).set({ endedAt: now }).where(eq(accessGrants.id, grant.id));
    } catch (err) {
      errors++;
      console.error(`[grants] end-of-grant tags failed for ${grant.email}:`, err);
    }
  }

  return { activated, reminded, ended, errors };
}
