/**
 * Membership-aware PDF download. Resolves the visitor's access tier and
 * redirects to the Vercel Blob URL when they're allowed in.
 *
 * Authorization rules:
 *   - member  → any activity
 *   - starter → only activities in STARTER_PACK_SLUGS, plus Skills Map
 *   - guest   → redirect to /join with a soft-explain banner
 *   - signed-out → redirect to /sign-in
 *
 * Two view modes via ?view=1:
 *   - default  → forces download (Content-Disposition: attachment)
 *   - ?view=1  → inline view (PDF opens in browser)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDownloadUrl } from '@vercel/blob';
import { getAccessTierForClerkId, type AccessTier } from '@/lib/access';
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
  const tier: AccessTier = await getAccessTierForClerkId(clerkId);
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

  // Resolve the Blob URL
  const blobUrl = getActivityBlobUrl(slug);
  if (!blobUrl) {
    return friendlyRedirect('/account', 'activity-missing');
  }

  // Inline (browser viewer) vs forced download
  const isView = req.nextUrl.searchParams.get('view') === '1';
  const target = isView ? blobUrl : getDownloadUrl(blobUrl);
  return NextResponse.redirect(target, 302);
}
