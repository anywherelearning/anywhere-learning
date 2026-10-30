import type { Metadata } from 'next';
import Link from 'next/link';
import { stripe } from '@/lib/stripe';
import GiftCard from '@/components/gift/GiftCard';
import { getGiftCardBySession } from '@/lib/gift-card';
import RefreshSoon from './RefreshSoon';

export const metadata: Metadata = {
  title: 'Your gift is on its way',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/**
 * /gift/thanks: after Stripe. Shows the card right away when the webhook has
 * already created the grant; otherwise says so and re-checks in a few seconds
 * (the webhook usually lands within a second or two of the redirect).
 */
export default async function GiftThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  let paid = false;
  let recipientName = '';
  if (session_id?.startsWith('cs_')) {
    try {
      const s = await stripe.checkout.sessions.retrieve(session_id);
      paid = s.metadata?.kind === 'gift' && s.payment_status === 'paid';
      recipientName = s.metadata?.recipient_name || '';
    } catch {
      paid = false;
    }
  }

  if (!paid || !session_id) {
    return (
      <main className="grid min-h-[60vh] place-items-center bg-[#F2EFE4] px-6 py-24 text-center">
        <div className="max-w-[520px]">
          <h1 className="font-display text-[34px] leading-tight">We couldn&apos;t find that gift.</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-gray-600">
            If you just paid, your receipt and printable card are on their way to your inbox. Nothing
            there after a few minutes? Write to{' '}
            <a className="text-forest underline" href="mailto:info@anywherelearning.co">info@anywherelearning.co</a>{' '}
            and Amelie will sort it out.
          </p>
        </div>
      </main>
    );
  }

  const card = await getGiftCardBySession(session_id).catch(() => null);

  return (
    <main className="bg-[#F2EFE4] px-6 pt-12 pb-20 md:pt-16">
      <div className="mx-auto max-w-[720px] text-center">
        <span className="inline-flex items-center gap-2.5 text-[12.5px] font-medium uppercase tracking-[.16em] text-forest-dark before:block before:h-px before:w-[22px] before:bg-forest">
          Thank you
        </span>
        <h1 className="font-display mt-4 text-[clamp(2.1rem,4.6vw,3.4rem)] leading-[1.06] tracking-tight text-gray-900 text-balance">
          {card?.scheduled
            ? `Your gift for ${recipientName || 'the family'} is scheduled.`
            : `Your gift is on its way to ${recipientName || 'the family'}.`}
        </h1>
        <p className="mx-auto mt-4 max-w-[540px] text-[17px] leading-relaxed text-gray-600">
          Your receipt and this card are in your inbox too. Print the card or screenshot it, so there is
          something to give on the day.
        </p>
      </div>

      <div className="mt-10">
        {card ? (
          <>
            <GiftCard card={card} />
            <div className="mt-8 text-center">
              <Link
                href={`/gift/card/${card.grantId}`}
                className="inline-flex items-center gap-3 rounded-xl bg-forest px-6 py-4 text-[16px] font-semibold text-cream transition-all hover:-translate-y-px hover:bg-forest-dark"
              >
                Open the printable card
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20" aria-hidden="true">→</span>
              </Link>
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-[520px] text-center text-[16px] text-gray-600">
            <p>Wrapping your gift card… this page will refresh in a moment.</p>
            <RefreshSoon />
          </div>
        )}
      </div>
    </main>
  );
}
