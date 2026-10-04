/**
 * GET /start-trial — the direct-link funnel behind every "Start free trial"
 * CTA on the site (nav pill, shop banners, blog footers, etc).
 *
 * One link, four outcomes:
 *   - no ?plan yet          → /choose-plan (Stripe can't switch plans
 *     mid-session, so the yearly/monthly choice must happen before the
 *     checkout session is created)
 *   - signed out            → /sign-up (trial-framed) → back here → Stripe
 *   - signed in, eligible   → straight to Stripe Checkout
 *   - already member/trial  → their library
 *
 * The homepage carries the membership pitch, reachable from the "Membership" nav
 * item; action CTAs skip it entirely.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';
import { createMembershipCheckout } from '@/lib/membership-checkout';
import { FALL_OFFER, OFFER_COOKIE, isFallOfferActive } from '@/lib/fall-offer';

export const dynamic = 'force-dynamic';

function getSiteOrigin(req: NextRequest): string {
  if (process.env.NEXT_PUBLIC_URL) return process.env.NEXT_PUBLIC_URL.replace(/\/$/, '');
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  const host = req.headers.get('host') || 'localhost:3000';
  return `${proto}://${host}`;
}

export async function GET(req: NextRequest) {
  const limited = await checkRateLimit(req, standardLimiter());
  if (limited) return limited;

  const origin = getSiteOrigin(req);

  // No explicit plan chosen yet → show the yearly/monthly picker first.
  // Every generic "Start free trial" CTA (nav, shop banners, FAQ) links here
  // without a plan; the homepage toggle and /choose-plan cards link with one.
  const planParam = req.nextUrl.searchParams.get('plan');
  if (planParam !== 'annual' && planParam !== 'monthly') {
    return NextResponse.redirect(`${origin}/choose-plan`, 303);
  }
  const plan = planParam;

  // Fall offer from /fall: `?offer=fall`, or the cookie set on the way to
  // sign-up (in case the query string doesn't survive the round trip).
  const offer =
    isFallOfferActive() &&
    (req.nextUrl.searchParams.get('offer') === FALL_OFFER.slug ||
      req.cookies.get(OFFER_COOKIE)?.value === FALL_OFFER.slug)
      ? FALL_OFFER.slug
      : undefined;
  const withOffer = (res: NextResponse) => {
    if (offer) {
      res.cookies.set(OFFER_COOKIE, offer, {
        expires: new Date(FALL_OFFER.endsAt.getTime() + 3 * 60 * 60 * 1000),
        path: '/',
        sameSite: 'lax',
        httpOnly: true,
        secure: origin.startsWith('https'),
      });
    }
    return res;
  };

  let clerkId: string | null = null;
  let clerkEmail: string | undefined;
  let clerkConfigured = false;
  try {
    const a = await auth();
    clerkId = a.userId;
    clerkConfigured = true;
    if (clerkId) {
      const u = await currentUser();
      clerkEmail = u?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
    }
  } catch {
    /* Clerk not configured */
  }

  // No account yet → create one first (sign-up returns here when done).
  if (clerkConfigured && !clerkId) {
    const back = offer
      ? `/start-trial?plan=${plan}&offer=${offer}`
      : plan === 'monthly'
        ? '/start-trial?plan=monthly'
        : '/start-trial';
    return withOffer(
      NextResponse.redirect(`${origin}/sign-up?redirect_url=${encodeURIComponent(back)}`, 303),
    );
  }

  try {
    const result = await createMembershipCheckout({
      clerkId,
      email: clerkEmail,
      origin,
      plan,
      offer,
    });
    if (result.ok) return withOffer(NextResponse.redirect(result.url, 303));
    if (result.reason === 'already_member') {
      // Active member or trial member: nothing to buy, open the library.
      return NextResponse.redirect(`${origin}/account`, 303);
    }
  } catch (err) {
    console.error('[start-trial]', err);
  }

  // Anything unexpected: fall back to the membership page, whose
  // CheckoutButton flow shows inline errors.
  return NextResponse.redirect(`${origin}/#membership`, 303);
}
