/**
 * POST /api/checkout/gift: the /gift form.
 *
 * Opens a one-time Stripe Checkout (payment mode) for a 12-month gift
 * membership. Stripe collects the buyer's email and card; the recipient's
 * details ride in session metadata, and the webhook turns the paid session
 * into an access grant (handleGiftPurchase).
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';
import { metaMatchToMetadata, userDataFromRequest } from '@/lib/meta-capi';
import { GIFT_MESSAGE_MAX, GIFT_MONTHS, GIFT_PRICE_USD, deliveryMoment } from '@/lib/gift';

export const dynamic = 'force-dynamic';

function getSiteOrigin(req: NextRequest): string {
  if (process.env.NEXT_PUBLIC_URL) return process.env.NEXT_PUBLIC_URL.replace(/\/$/, '');
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  const host = req.headers.get('host') || 'localhost:3000';
  return `${proto}://${host}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, standardLimiter());
  if (limited) return limited;

  const origin = getSiteOrigin(req);
  const back = (error: string) => NextResponse.redirect(`${origin}/gift?error=${encodeURIComponent(error)}#gift-form`, 303);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return back('Something went wrong. Please try again.');
  }
  const str = (k: string) => String(form.get(k) ?? '').trim();

  // Honeypot: real people never see or fill this field.
  if (str('website')) return NextResponse.redirect(`${origin}/gift`, 303);

  const recipientEmail = str('recipientEmail').toLowerCase();
  const recipientName = str('recipientName').slice(0, 60);
  const giftFrom = str('giftFrom').slice(0, 60);
  const giftMessage = str('giftMessage').slice(0, GIFT_MESSAGE_MAX);
  const when = str('when');
  const deliverOn = str('deliverOn');

  if (!EMAIL_RE.test(recipientEmail)) return back("Please check the parent's email address.");
  if (!recipientName) return back("Please add the parent's first name.");
  if (!giftFrom) return back('Please add your name, so they know who it is from.');
  const scheduledAt = when === 'date' ? deliveryMoment(deliverOn) : null;
  if (when === 'date' && !scheduledAt) return back('Please pick a delivery date between tomorrow and a year from now.');

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: GIFT_PRICE_USD * 100,
            product_data: {
              name: `Anywhere Learning gift membership (${GIFT_MONTHS} months)`,
              description: `For ${recipientName}'s family. Full library access, no card on their end, nothing renews.`,
              images: ['https://anywherelearning.co/email-library-hero-v2.jpg'],
            },
          },
        },
      ],
      customer_creation: 'always',
      billing_address_collection: 'auto',
      custom_text: {
        submit: {
          message: scheduledAt
            ? `We'll email the gift to ${recipientEmail} on the date you picked, and send you a printable gift card right away.`
            : `We'll email the gift to ${recipientEmail} as soon as you pay, and send you a printable gift card.`,
        },
      },
      success_url: `${origin}/gift/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/gift`,
      metadata: {
        kind: 'gift',
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        gift_from: giftFrom,
        gift_message: giftMessage,
        deliver_on: scheduledAt ? deliverOn : '',
        ...metaMatchToMetadata(userDataFromRequest(req)),
      },
    });
    if (session.url) return NextResponse.redirect(session.url, 303);
  } catch (err) {
    console.error('[checkout/gift]', err);
  }
  return back('We could not open checkout. Please try again in a moment.');
}
