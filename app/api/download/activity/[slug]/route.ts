/**
 * Membership-aware PDF download. Resolves the visitor's access tier and
 * redirects to the Vercel Blob URL when they're allowed in.
 *
 * Authorization rules:
 *   - member  → any activity (view + download), subject to the download cap
 *   - trial   → VIEW any activity (in the in-app viewer); NO downloads —
 *               downloading is the reason to convert to a paid membership
 *   - guest   → redirect home with a soft-explain banner
 *   - signed-out → redirect to /sign-in
 *
 * Download cap (members): DOWNLOAD_CAP_PER_WINDOW distinct guides per rolling
 * DOWNLOAD_CAP_WINDOW_DAYS (lib/membership.ts). Re-downloading a guide already
 * taken inside the window is free. Viewing is never capped. Over the cap →
 * bounce to /account with a banner explaining when a slot frees up.
 *
 * Modes:
 *   - default  → forces download (Content-Disposition: attachment); logged
 *   - ?view=1  → the in-app viewer page for everyone. The browser's built-in
 *                PDF viewer has its own download button (a download by
 *                another name), which would let trials download and members
 *                sidestep the cap. The Blob URL is only ever handed out here
 *                on a counted download.
 *   - ?check=1 → JSON {allowed, used, cap, resetsAt} so the dashboard/viewer
 *                can show the right modal instead of navigating.
 */

import { NextRequest, NextResponse, after } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDownloadUrl } from '@vercel/blob';
import { getAccessContextForClerkId } from '@/lib/access';
import { getActivityBlobUrl } from '@/lib/activity-blob-urls';
import { getDownloadAllowance, logActivityEvent } from '@/lib/activity-events';
import { relaxedLimiter, checkRateLimit } from '@/lib/rate-limit';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const limited = await checkRateLimit(req, relaxedLimiter());
  if (limited) return limited;

  const { slug } = await params;

  // Resolve identity
  let clerkId: string | null = null;
  try {
    const a = await auth();
    clerkId = a.userId;
  } catch {
    /* Clerk not configured */
  }
  // Helper: send the user to a friendly page instead of a raw 403/JSON
  // response. The download endpoint is hit by direct clicks (not XHR), so
  // a 302 redirect is the right UX — they land somewhere they can act.
  const origin = req.nextUrl.origin;
  const friendlyRedirect = (path: string, reason: string) =>
    NextResponse.redirect(
      `${origin}${path}?from=download&slug=${encodeURIComponent(slug)}&reason=${encodeURIComponent(reason)}`,
      303,
    );

  if (!clerkId) {
    // Not signed in → send to sign-in with a return path back to the activity
    return NextResponse.redirect(
      `${origin}/sign-in?next=${encodeURIComponent(`/api/download/activity/${slug}?view=1`)}`,
      303,
    );
  }

  // Resolve tier from the DB — only source of truth in production.
  const access = await getAccessContextForClerkId(clerkId);
  const tier = access.tier;
  if (tier === 'guest' || !access.userId) {
    // No active subscription → soft redirect home
    return friendlyRedirect('/', 'membership-required');
  }
  // 'member' / 'trial' → no further slug-level checks

  const isView = req.nextUrl.searchParams.get('view') === '1';
  const isCheck = req.nextUrl.searchParams.get('check') === '1';

  // Viewing happens in the in-app reader for everyone (see header comment).
  // The reader fetches bytes from /api/view/activity, which logs the view.
  if (isView) {
    return NextResponse.redirect(`${origin}/account/view/${encodeURIComponent(slug)}`, 303);
  }

  // Pre-flight check (no side effects): lets the dashboard/viewer decide
  // between navigating to the file and showing a modal.
  if (isCheck) {
    if (tier === 'trial') {
      return NextResponse.json({ allowed: false, reason: 'trial' });
    }
    const allowance = await getDownloadAllowance(access.userId, slug);
    return NextResponse.json({
      allowed: allowance.allowed,
      reason: allowance.allowed ? null : 'cap',
      used: allowance.used,
      cap: allowance.cap,
      resetsAt: allowance.resetsAt?.toISOString() ?? null,
    });
  }

  // Trial members cannot download. Downloading is the reason to subscribe, so
  // bounce them back to the library where the upgrade modal opens. Enforced
  // here (not just the UI) so pasting a download URL directly hits the wall.
  if (tier === 'trial') {
    return friendlyRedirect('/account', 'trial-upgrade-to-download');
  }

  // Download cap. Enforced here for the same reason: a pasted URL hits the
  // wall too. Fails open if the DB is unreachable (see lib/activity-events).
  const allowance = await getDownloadAllowance(access.userId, slug);
  if (!allowance.allowed) {
    return friendlyRedirect('/account', 'download-cap');
  }

  // Resolve the Blob URL
  const blobUrl = getActivityBlobUrl(slug);
  if (!blobUrl) {
    return friendlyRedirect('/account', 'activity-missing');
  }

  // Runs after the redirect is sent; see logActivityEvent for why after().
  const ipAddress = req.headers.get('x-forwarded-for');
  const userId = access.userId;
  after(() => logActivityEvent({ userId, slug, kind: 'download', tier, ipAddress }));

  // Redirect to the Blob CDN. (We briefly streamed the bytes through this
  // route to avoid exposing the public URL, but that stalled on Vercel —
  // headers arrive, body never flows — so members got 0-byte downloads.
  // Redirecting to the CDN is the proven-in-prod behavior. The minor URL-
  // exposure tradeoff is a pre-existing condition; a working private-delivery
  // approach (signed URLs) is a separate follow-up.)
  return NextResponse.redirect(getDownloadUrl(blobUrl), 302);
}
