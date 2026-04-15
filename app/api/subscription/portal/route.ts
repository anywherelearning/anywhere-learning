import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const limited = await checkRateLimit(req, standardLimiter());
    if (limited) return limited;

    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
    }

    const dbUser = await db
      .select({ stripeCustomerId: users.stripeCustomerId })
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (!dbUser.length || !dbUser[0].stripeCustomerId) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: dbUser[0].stripeCustomerId,
      return_url: `${siteUrl}/account/downloads`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Portal session error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 },
    );
  }
}
