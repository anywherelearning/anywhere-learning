import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { users, subscriptions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { hasActiveMembership } from '@/lib/db/queries';

const MEMBERSHIP_PRICES: Record<string, string | undefined> = {
  monthly: process.env.STRIPE_MEMBERSHIP_MONTHLY_PRICE_ID,
  annual: process.env.STRIPE_MEMBERSHIP_ANNUAL_PRICE_ID,
};

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json();
    const priceId = MEMBERSHIP_PRICES[plan as string];
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Look up user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for existing active subscription
    const isMember = await hasActiveMembership(user[0].id);
    if (isMember) {
      return NextResponse.json(
        { error: 'Already an active member' },
        { status: 409 },
      );
    }

    const origin =
      process.env.NEXT_PUBLIC_URL ||
      req.headers.get('origin') ||
      'http://localhost:3000';

    // Build session params
    const sessionParams: Record<string, unknown> = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/account/library?welcome=true`,
      cancel_url: `${origin}/membership`,
      metadata: { clerkId, plan },
      allow_promotion_codes: true,
    };

    // Re-use existing Stripe Customer if available
    if (user[0].stripeCustomerId) {
      sessionParams.customer = user[0].stripeCustomerId;
    } else {
      sessionParams.customer_creation = 'always';
      sessionParams.customer_email = user[0].email;
    }

    const session = await stripe.checkout.sessions.create(
      sessionParams as Parameters<typeof stripe.checkout.sessions.create>[0],
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Membership checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
