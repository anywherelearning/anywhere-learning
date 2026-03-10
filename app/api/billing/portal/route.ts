import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { getUserByClerkId } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    const user = await getUserByClerkId(clerkId);
    if (!user?.stripeCustomerId) {
      return NextResponse.redirect(new URL('/membership', req.url));
    }

    const origin =
      process.env.NEXT_PUBLIC_URL ||
      req.headers.get('origin') ||
      'http://localhost:3000';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${origin}/account/library`,
    });

    return NextResponse.redirect(portalSession.url);
  } catch (error) {
    console.error('Billing portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 },
    );
  }
}
