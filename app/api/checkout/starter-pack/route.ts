/**
 * Starter Pack checkout. Creates a Stripe Checkout session in payment mode
 * for the $44.99 one-time purchase (10 favorite activities + Skills Map).
 *
 * Mirrors the shape of /api/checkout/membership for consistency.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { STRIPE_PRICES, requirePriceId } from '@/lib/stripe-prices';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';

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

    let clerkId: string | null = null;
    let clerkEmail: string | undefined;
    try {
      const a = await auth();
      clerkId = a.userId;
      if (clerkId) {
        const u = await currentUser();
        clerkEmail = u?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
      }
    } catch {
      /* Clerk not configured */
    }

    const priceId = requirePriceId(STRIPE_PRICES.STARTER_PACK_ONE_TIME, 'Starter Pack');
    const origin = getSiteOrigin(req);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_email: clerkEmail || customerEmail,
      client_reference_id: clerkId || undefined,
      payment_intent_data: {
        metadata: {
          kind: 'starter_pack',
          tier: 'starter',
          ...(clerkId && { clerk_id: clerkId }),
        },
      },
      success_url: `${origin}/checkout/success?tier=starter&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop/starter-pack?cancelled=1`,
      // Generate a recovery URL when the session expires unpaid. The
      // abandoned-checkout webhook reads `session.after_expiration.recovery.url`
      // and embeds it in the email's "Resume my order →" CTA so the buyer
      // returns to a pre-filled checkout. Only supported in `payment` mode.
      after_expiration: {
        recovery: {
          enabled: true,
          allow_promotion_codes: true,
        },
      },
      metadata: {
        kind: 'starter_pack',
        tier: 'starter',
        ...(clerkId && { clerk_id: clerkId }),
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe did not return a checkout URL' }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[checkout/starter-pack]', err);
    const isConfigError = message.includes('Stripe price ID') || message.includes('STRIPE_SECRET_KEY');
    return NextResponse.json(
      { error: isConfigError ? message : 'Could not start checkout. Please try again.' },
      { status: 500 },
    );
  }
}
