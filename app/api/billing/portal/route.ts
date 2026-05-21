/**
 * Creates a Stripe Customer Portal session for the signed-in user and redirects
 * the browser there. The portal lets members:
 *   - update their default payment method
 *   - view + download invoices
 *   - cancel / resume their subscription
 *   - change billing email
 *
 * Requires:
 *   - Clerk auth (so we can look up the user's stripeCustomerId)
 *   - The user has a stripeCustomerId on file
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';

function getOrigin(req: NextRequest): string {
  if (process.env.NEXT_PUBLIC_URL) return process.env.NEXT_PUBLIC_URL.replace(/\/$/, '');
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  const host = req.headers.get('host') || 'localhost:3000';
  return `${proto}://${host}`;
}

async function handle(req: NextRequest) {
  const limited = await checkRateLimit(req, standardLimiter());
  if (limited) return limited;

  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  const user = rows[0];
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: 'No billing account on file.' }, { status: 404 });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${getOrigin(req)}/account/settings#subscription`,
    });
    return NextResponse.redirect(session.url, 303);
  } catch (err) {
    console.error('[billing/portal]', err);
    return NextResponse.json(
      { error: 'Could not open billing portal. Please try again.' },
      { status: 500 },
    );
  }
}

export const GET = handle;
export const POST = handle;
