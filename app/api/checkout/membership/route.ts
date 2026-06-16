/**
 * Membership checkout (XHR flow). Creates a Stripe Checkout session in
 * subscription mode via the shared builder in lib/membership-checkout and
 * returns its URL as JSON. Used by CheckoutButton on /join and the upgrade
 * blocks. Direct-link CTAs go through GET /start-trial instead.
 *
 * POST body (all optional):
 *   email — pre-fills the Stripe Checkout email field
 *
 * Returns: { url: string } — redirect the browser to this URL.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';
import { createMembershipCheckout } from '@/lib/membership-checkout';

function getSiteOrigin(req: NextRequest): string {
  if (process.env.NEXT_PUBLIC_URL) return process.env.NEXT_PUBLIC_URL.replace(/\/$/, '');
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  const host = req.headers.get('host') || 'localhost:3000';
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  try {
    const limited = await checkRateLimit(req, standardLimiter());
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const emailInput = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const customerEmail = emailRegex.test(emailInput) ? emailInput : undefined;

    // Require sign-in for membership checkout. This serves two purposes:
    //   1. Lets us reliably apply the Starter Pack credit to eligible buyers
    //      (we need a Clerk userId to look up their purchase history).
    //   2. Prevents the bad outcome where a Starter Pack buyer pays full $99
    //      because they hadn't signed in — they'd lose their $45 credit.
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
      /* Clerk not configured — skip the auth gate entirely. */
    }
    if (clerkConfigured && !clerkId) {
      // Send signed-out visitors to sign-UP, not sign-in: the trial CTA's
      // audience is overwhelmingly new customers with no account yet, and the
      // sign-in page's "welcome back" framing dead-ends them. After account
      // creation they land on /start-trial, which sends them straight to
      // Stripe. Existing members get a "Sign in" link on the sign-up page.
      return NextResponse.json(
        {
          error: 'sign_in_required',
          message: 'Create a free account to start your trial. Takes a few seconds, and your library remembers where you left off.',
          signInUrl: `/sign-up?redirect_url=${encodeURIComponent('/start-trial')}`,
        },
        { status: 401 },
      );
    }

    const result = await createMembershipCheckout({
      clerkId,
      email: clerkEmail || customerEmail,
      origin: getSiteOrigin(req),
    });

    if (!result.ok && result.reason === 'already_member') {
      return NextResponse.json(
        {
          error: 'already_member',
          message: 'Your membership is already active. Everything is waiting in your library.',
        },
        { status: 409 },
      );
    }
    if (!result.ok) {
      return NextResponse.json({ error: 'Stripe did not return a checkout URL' }, { status: 500 });
    }

    return NextResponse.json({ url: result.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    // Don't leak Stripe internals to the client
    console.error('[checkout/membership]', err);
    const isConfigError = message.includes('Stripe price ID') || message.includes('STRIPE_SECRET_KEY');
    return NextResponse.json(
      { error: isConfigError ? message : 'Could not start checkout. Please try again.' },
      { status: 500 },
    );
  }
}
