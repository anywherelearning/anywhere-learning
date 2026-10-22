/**
 * GET /api/checkout/skills-map — the "Get the Skills Map" button.
 *
 * Opens a Stripe Checkout session in payment mode. No account needed: Stripe
 * collects the email, the webhook delivers the files.
 *
 * `?ref=<Kit subscriber id>` comes from the course emails. If that reader
 * joined the course within COURSE_BONUS_DAYS, the session is flagged
 * `bonus=1` and the Directions Challenge is included.
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';
import { SKILLS_MAP, COURSE_BONUS_DAYS } from '@/lib/skills-map';
import { subscriberTaggedAt } from '@/lib/convertkit';
import { metaMatchToMetadata, userDataFromRequest } from '@/lib/meta-capi';

export const dynamic = 'force-dynamic';

function getSiteOrigin(req: NextRequest): string {
  if (process.env.NEXT_PUBLIC_URL) return process.env.NEXT_PUBLIC_URL.replace(/\/$/, '');
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  const host = req.headers.get('host') || 'localhost:3000';
  return `${proto}://${host}`;
}

export async function GET(req: NextRequest) {
  // Router prefetches must not create Stripe sessions (see /start-trial).
  if (req.headers.get('rsc') === '1' || req.headers.has('next-router-prefetch')) {
    return new NextResponse(null, { status: 204 });
  }
  const limited = await checkRateLimit(req, standardLimiter());
  if (limited) return limited;

  const origin = getSiteOrigin(req);
  const ref = req.nextUrl.searchParams.get('ref') || '';

  let bonus = false;
  if (ref) {
    const joined = await subscriberTaggedAt(ref, 'course-rwl');
    bonus = !!joined && Date.now() - joined.getTime() <= COURSE_BONUS_DAYS * 24 * 60 * 60 * 1000;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: SKILLS_MAP.stripePriceId, quantity: 1 }],
      customer_creation: 'always',
      billing_address_collection: 'auto',
      custom_text: {
        submit: {
          message: bonus
            ? 'Instant download: the Skills Map (phone, color and black & white) plus your course bonus, the full Directions Challenge guide.'
            : 'Instant download: the Skills Map in phone, color and black & white versions.',
        },
      },
      success_url: `${origin}/skills-map/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop/${SKILLS_MAP.slug}${ref ? `?ref=${encodeURIComponent(ref)}` : ''}`,
      metadata: {
        kind: 'skills-map',
        bonus: bonus ? '1' : '0',
        ...(ref && { kit_ref: ref.slice(0, 20) }),
        ...metaMatchToMetadata(userDataFromRequest(req)),
      },
    });
    if (session.url) return NextResponse.redirect(session.url, 303);
  } catch (err) {
    console.error('[checkout/skills-map]', err);
  }
  return NextResponse.redirect(`${origin}/shop/${SKILLS_MAP.slug}?error=checkout`, 303);
}
