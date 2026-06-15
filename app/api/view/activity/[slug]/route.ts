/**
 * Streams an activity PDF for the in-app viewer (same-origin, inline only).
 *
 * Exists so trial members can READ any guide without ever being handed the
 * Vercel Blob URL — the in-app viewer fetches from here and renders pages to
 * canvas. Authorization mirrors the download endpoint's view rules:
 *   member/trial → any activity, starter → their pack + Skills Map,
 *   guest/signed-out → 403/401 JSON (this endpoint is XHR-only).
 *
 * A determined user can still capture bytes from the network tab; the goal
 * is removing the one-click "download" button the native PDF viewer offers,
 * not DRM.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
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

  let clerkId: string | null = null;
  try {
    const a = await auth();
    clerkId = a.userId;
  } catch {
    /* Clerk not configured */
  }
  if (!clerkId) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  const access = await getAccessContextForClerkId(clerkId);
  if (access.tier === 'guest') {
    return NextResponse.json({ error: 'Membership required' }, { status: 403 });
  }
  if (access.tier === 'starter' && !STARTER_PACK_SLUGS.has(slug) && !SKILLS_MAP_SLUGS.has(slug)) {
    return NextResponse.json({ error: 'Not in your pack' }, { status: 403 });
  }

  const blobUrl = getActivityBlobUrl(slug);
  if (!blobUrl) {
    return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
  }

  const upstream = await fetch(blobUrl);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: 'Could not load the guide' }, { status: 502 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline',
      // Private: never cache a member-gated file on shared caches.
      'Cache-Control': 'private, max-age=0, no-store',
      ...(upstream.headers.get('content-length')
        ? { 'Content-Length': upstream.headers.get('content-length')! }
        : {}),
    },
  });
}
