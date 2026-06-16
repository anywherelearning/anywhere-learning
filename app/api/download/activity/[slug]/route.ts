/**
 * Membership-aware PDF download. Resolves the visitor's access tier and
 * redirects to the Vercel Blob URL when they're allowed in.
 *
 * Authorization rules:
 *   - member  → any activity (view + download)
 *   - trial   → VIEW any activity (in the in-app viewer); NO downloads —
 *               downloading is the reason to convert to a paid membership
 *   - starter → only activities in STARTER_PACK_SLUGS, plus Skills Map
 *   - guest   → redirect to /join with a soft-explain banner
 *   - signed-out → redirect to /sign-in
 *
 * Modes:
 *   - default  → forces download (Content-Disposition: attachment)
 *   - ?view=1  → inline view. Members/starters get the raw PDF in the
 *                browser; TRIAL members get the in-app viewer page instead,
 *                because the browser's built-in PDF viewer has its own
 *                download button (a download by another name).
 *   - ?check=1 → JSON {allowed} so the dashboard/viewer can show the
 *                upgrade-to-download modal instead of navigating.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDownloadUrl } from '@vercel/blob';
import { getAccessContextForClerkId } from '@/lib/access';
import { STARTER_PACK_SLUGS } from '@/lib/membership';
import { getActivityBlobUrl } from '@/lib/activity-blob-urls';
import { relaxedLimiter, checkRateLimit } from '@/lib/rate-limit';

const SKILLS_MAP_SLUGS = new Set(['skills-map-color', 'skills-map-bw']);

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
  if (tier === 'guest') {
    // No active subscription or starter pack → soft redirect to /join
    return friendlyRedirect('/join', 'membership-required');
  }

  // Tier-gated access check
  if (tier === 'starter') {
    const allowed = STARTER_PACK_SLUGS.has(slug) || SKILLS_MAP_SLUGS.has(slug);
    if (!allowed) {
      // Starter buyer trying to access a member-only activity → upgrade prompt
      return friendlyRedirect('/join', 'starter-upgrade');
    }
  }
  // 'member' → no further checks

  const isView = req.nextUrl.searchParams.get('view') === '1';
  const isCheck = req.nextUrl.searchParams.get('check') === '1';

  // Pre-flight check (no side effects): lets the dashboard/viewer decide
  // between navigating to the file and showing the upgrade-to-download modal.
  // Trial members can't download at all; everyone else can.
  if (isCheck) {
    return NextResponse.json({ allowed: tier !== 'trial' });
  }

  // Trial viewing happens in the in-app viewer, not the browser's PDF viewer,
  // because the native viewer's own download button is a download by another
  // name. Trials are view-only.
  if (tier === 'trial' && isView) {
    return NextResponse.redirect(`${origin}/account/view/${encodeURIComponent(slug)}`, 303);
  }

  // Trial members cannot download. Downloading is the reason to subscribe, so
  // bounce them back to the library where the upgrade modal opens. Enforced
  // here (not just the UI) so pasting a download URL directly hits the wall.
  if (tier === 'trial' && !isView) {
    return friendlyRedirect('/account', 'trial-upgrade-to-download');
  }

  // Resolve the Blob URL
  const blobUrl = getActivityBlobUrl(slug);
  if (!blobUrl) {
    return friendlyRedirect('/account', 'activity-missing');
  }

  // Redirect to the Blob CDN. (We briefly streamed the bytes through this
  // route to avoid exposing the public URL, but that stalled on Vercel —
  // headers arrive, body never flows — so members got 0-byte downloads.
  // Redirecting to the CDN is the proven-in-prod behavior. The minor URL-
  // exposure tradeoff is a pre-existing condition; a working private-delivery
  // approach (signed URLs) is a separate follow-up.)
  //   ?view=1 → inline (opens in the browser)
  //   default → forced download (Content-Disposition: attachment)
  const target = isView ? blobUrl : getDownloadUrl(blobUrl);
  return NextResponse.redirect(target, 302);
}
