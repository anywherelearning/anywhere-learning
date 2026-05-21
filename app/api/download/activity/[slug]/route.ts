/**
 * Membership-aware PDF download. Resolves the visitor's access tier and
 * redirects to the Vercel Blob URL when they're allowed in.
 *
 * Authorization rules:
 *   - member  → any activity
 *   - starter → only activities in STARTER_PACK_SLUGS, plus Skills Map
 *   - guest   → 401
 *
 * Two view modes via ?view=1:
 *   - default        → forces download (Content-Disposition: attachment)
 *   - ?view=1        → inline view (PDF opens in browser)
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
  if (!clerkId) {
    return NextResponse.json({ error: 'Sign in to download activities.' }, { status: 401 });
  }

  // Resolve tier from the DB — this is the only source of truth in
  // production. (The old `al_tier_preview` cookie fallback was a
  // sandbox-era hack that persisted access for 7 days in the browser,
  // which made refunded customers keep PDF access. Removed.)
  const tier: AccessTier = await getAccessTierForClerkId(clerkId);
  if (tier === 'guest') {
    return NextResponse.json({ error: 'Membership required.' }, { status: 403 });
  }

  // Tier-gated access check
  if (tier === 'starter') {
    const allowed = STARTER_PACK_SLUGS.has(slug) || SKILLS_MAP_SLUGS.has(slug);
    if (!allowed) {
      return NextResponse.json(
        { error: 'This activity is in the Membership only. Upgrade to unlock.' },
        { status: 403 },
      );
    }
  }
  // 'member' → no further checks

  // Resolve the Blob URL
  const blobUrl = getActivityBlobUrl(slug);
  if (!blobUrl) {
    return NextResponse.json(
      { error: 'Activity PDF not found.' },
      { status: 404 },
    );
  }

  // Inline (browser viewer) vs forced download
  const isView = req.nextUrl.searchParams.get('view') === '1';
  const target = isView ? blobUrl : getDownloadUrl(blobUrl);
  return NextResponse.redirect(target, 302);
}
