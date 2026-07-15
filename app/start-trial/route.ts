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
 * /join stays the membership INFO page, reachable from the "Membership" nav
 * item; action CTAs skip it entirely.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';
import { createMembershipCheckout } from '@/lib/membership-checkout';

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
  // without a plan; the /join toggle and /choose-plan cards link with one.
  const planParam = req.nextUrl.searchParams.get('plan');
  if (planParam !== 'annual' && planParam !== 'monthly') {
    return NextResponse.redirect(`${origin}/choose-plan`, 303);
  }
  const plan = planParam;

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
    return NextResponse.redirect(
      `${origin}/sign-up?redirect_url=${encodeURIComponent(
        plan === 'monthly' ? '/start-trial?plan=monthly' : '/start-trial',
      )}`,
      303,
    );
  }

  try {
    const result = await createMembershipCheckout({
      clerkId,
      email: clerkEmail,
      origin,
      plan,
    });
    if (result.ok) return NextResponse.redirect(result.url, 303);
    if (result.reason === 'already_member') {
      // Active member or trial member: nothing to buy, open the library.
      return NextResponse.redirect(`${origin}/account`, 303);
    }
  } catch (err) {
    console.error('[start-trial]', err);
  }

  // Anything unexpected: fall back to the membership page, whose
  // CheckoutButton flow shows inline errors.
  return NextResponse.redirect(`${origin}/join`, 303);
}
