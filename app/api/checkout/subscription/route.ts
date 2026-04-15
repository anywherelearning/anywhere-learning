import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';
import { hasActivePass } from '@/lib/subscription';

export async function POST(req: NextRequest) {
  try {
    const limited = await checkRateLimit(req, standardLimiter());
    if (limited) return limited;

    const siteUrl = process.env.NEXT_PUBLIC_URL;
    if (!siteUrl) {
      console.error('NEXT_PUBLIC_URL is not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const stripePriceId = process.env.STRIPE_ANNUAL_PASS_PRICE_ID;
    if (!stripePriceId) {
      console.error('STRIPE_ANNUAL_PASS_PRICE_ID is not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Collect email: from request body, or from Clerk auth
    const body = await req.json().catch(() => ({}));
    let email = typeof body.email === 'string' ? body.email.trim() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    let stripeCustomerId: string | undefined;

    // If logged in, check for existing subscription and get Stripe customer
    const { userId: clerkId } = await auth();
    if (clerkId) {
      const alreadyMember = await hasActivePass(clerkId);
      if (alreadyMember) {
        return NextResponse.json(
          { error: 'You already have an active Annual Pass' },
          { status: 400 },
        );
      }

      const dbUser = await db
        .select({ email: users.email, stripeCustomerId: users.stripeCustomerId })
        .from(users)
        .where(eq(users.clerkId, clerkId))
        .limit(1);

      if (dbUser.length > 0) {
        if (!email) email = dbUser[0].email;
        if (dbUser[0].stripeCustomerId) {
          stripeCustomerId = dbUser[0].stripeCustomerId;
        }
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: stripePriceId, quantity: 1 }],
      ...(stripeCustomerId
        ? { customer: stripeCustomerId }
        : email ? { customer_email: email } : {}),
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&type=subscription`,
      cancel_url: `${siteUrl}/annual-pass`,
      subscription_data: {
        metadata: {
          plan: 'annual-pass',
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Subscription checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
