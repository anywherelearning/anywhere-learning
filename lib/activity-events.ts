/**
 * Member activity log + download cap.
 *
 * Every viewer open and PDF download by a member or trial lands in
 * `activity_events` (fire-and-forget, never blocks the response). The download
 * cap reads the same table: a member may download DOWNLOAD_CAP_PER_WINDOW
 * distinct guides in any rolling DOWNLOAD_CAP_WINDOW_DAYS window. Viewing is
 * never capped, and re-downloading a guide already taken inside the window is
 * free (it does not use another slot).
 *
 * Fails OPEN: if the database is unreachable the download is allowed. A
 * member who paid should never be locked out of their library by an outage;
 * the cap exists to slow bulk grabs, not to guarantee anything.
 */

import { and, eq, gt, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { activityEvents, users } from '@/lib/db/schema';
import { DOWNLOAD_CAP_PER_WINDOW, DOWNLOAD_CAP_WINDOW_DAYS } from '@/lib/membership';

export type ActivityEventKind = 'view' | 'download';

export interface DownloadAllowance {
  /** Whether this download may proceed. */
  allowed: boolean;
  /** Distinct guides downloaded inside the window (before this one). */
  used: number;
  /** DOWNLOAD_CAP_PER_WINDOW, echoed for UI copy. */
  cap: number;
  /** True when this exact guide was already downloaded inside the window
   *  (allowed regardless of the cap, uses no slot). */
  alreadyDownloaded: boolean;
  /** When the oldest download in the window ages out and a slot frees up.
   *  Null when nothing has been downloaded yet. */
  resetsAt: Date | null;
}

interface WindowRow {
  slug: string;
  firstAt: Date;
}

/**
 * Pure cap decision, separated from the DB so it can be unit-tested.
 * `rows` is one entry per distinct slug downloaded inside the window, with
 * the earliest download time for that slug.
 */
export function computeDownloadAllowance(
  rows: WindowRow[],
  slug: string,
  now: Date = new Date(),
): DownloadAllowance {
  const used = rows.length;
  const alreadyDownloaded = rows.some((r) => r.slug === slug);
  const oldest = rows.reduce<Date | null>(
    (min, r) => (min === null || r.firstAt < min ? r.firstAt : min),
    null,
  );
  const resetsAt = oldest
    ? new Date(oldest.getTime() + DOWNLOAD_CAP_WINDOW_DAYS * 24 * 60 * 60 * 1000)
    : null;
  // Defensive: a clock skew should never produce a reset date in the past.
  const safeResetsAt = resetsAt && resetsAt < now ? now : resetsAt;
  return {
    allowed: alreadyDownloaded || used < DOWNLOAD_CAP_PER_WINDOW,
    used,
    cap: DOWNLOAD_CAP_PER_WINDOW,
    alreadyDownloaded,
    resetsAt: safeResetsAt,
  };
}

function windowStart(now: Date = new Date()): Date {
  return new Date(now.getTime() - DOWNLOAD_CAP_WINDOW_DAYS * 24 * 60 * 60 * 1000);
}

/** Resolve the download allowance for an internal user id. */
export async function getDownloadAllowance(userId: string, slug: string): Promise<DownloadAllowance> {
  try {
    const rows = await db
      .select({
        slug: activityEvents.slug,
        firstAt: sql<Date>`min(${activityEvents.createdAt})`.mapWith((v) => new Date(v)),
      })
      .from(activityEvents)
      .where(
        and(
          eq(activityEvents.userId, userId),
          eq(activityEvents.kind, 'download'),
          gt(activityEvents.createdAt, windowStart()),
        ),
      )
      .groupBy(activityEvents.slug);
    return computeDownloadAllowance(rows, slug);
  } catch (err) {
    console.error('[activity-events] getDownloadAllowance failed, allowing:', err);
    return {
      allowed: true,
      used: 0,
      cap: DOWNLOAD_CAP_PER_WINDOW,
      alreadyDownloaded: false,
      resetsAt: null,
    };
  }
}

/** Same as getDownloadAllowance but keyed by Clerk id (for server pages). */
export async function getDownloadAllowanceForClerkId(
  clerkId: string,
  slug = '',
): Promise<DownloadAllowance | null> {
  try {
    const rows = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);
    if (!rows[0]) return null;
    return getDownloadAllowance(rows[0].id, slug);
  } catch (err) {
    console.error('[activity-events] getDownloadAllowanceForClerkId failed:', err);
    return null;
  }
}

/**
 * Record a view or download. Never throws; a failure only logs.
 *
 * Callers run this inside Next's `after()` so it completes after the response
 * is sent. A bare fire-and-forget promise is NOT safe on Vercel: the function
 * can be frozen the moment the redirect goes out, and the insert never lands.
 * `after()` keeps the function alive until the callback settles.
 */
export async function logActivityEvent(input: {
  userId: string;
  slug: string;
  kind: ActivityEventKind;
  tier: 'member' | 'trial';
  ipAddress?: string | null;
}): Promise<void> {
  try {
    await db.insert(activityEvents).values({
      userId: input.userId,
      slug: input.slug,
      kind: input.kind,
      tier: input.tier,
      ipAddress: input.ipAddress ?? null,
    });
  } catch (err) {
    console.error('[activity-events] log failed:', err);
  }
}
