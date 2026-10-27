import type { Metadata } from 'next';
import Link from 'next/link';
import { Tape, PAPER_SHADOW } from '@/components/shared/Paper';
import { stripe } from '@/lib/stripe';
import {
  MAP_FILES,
  OWNER_OFFER,
  OWNER_OFFER_HOURS,
  downloadUrl,
  filesFor,
  makeDownloadToken,
  type MapFileKey,
} from '@/lib/skills-map';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your Skills Map is ready',
  description: 'Download The Future-Ready Skills Map.',
  robots: { index: false, follow: false },
};

/**
 * Skills Map thank-you page. Downloads live here too, not only in the email,
 * so a buyer whose receipt lands in spam still gets their files right away.
 * The Stripe session is the proof of purchase: no account involved.
 */
export default async function SkillsMapThanks({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  let ok = false;
  let bonus = false;
  let email = '';
  let firstName = '';
  if (session_id && session_id.startsWith('cs_')) {
    try {
      const s = await stripe.checkout.sessions.retrieve(session_id);
      ok = s.metadata?.kind === 'skills-map' && s.payment_status === 'paid';
      bonus = s.metadata?.bonus === '1';
      email = s.customer_details?.email || '';
      firstName = s.customer_details?.name?.trim().split(/\s+/)[0] || '';
    } catch {
      ok = false;
    }
  }

  if (!ok || !session_id) {
    return (
      <main className="bg-[#F2EFE4] min-h-[60vh] grid place-items-center px-6 py-24 text-center">
        <div className="max-w-[520px]">
          <h1 className="font-display text-[34px] leading-tight">We couldn&apos;t find that purchase.</h1>
          <p className="mt-4 text-gray-600 text-[17px] leading-relaxed">
            If you just paid, your download links are on their way to your inbox. Nothing there after a
            few minutes? Write to{' '}
            <a className="text-forest underline" href="mailto:info@anywherelearning.co">info@anywherelearning.co</a>{' '}
            and Amelie will sort it out.
          </p>
        </div>
      </main>
    );
  }

  const origin = (process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co').replace(/\/$/, '');
  const token = makeDownloadToken(session_id, bonus);
  const files = filesFor(bonus);
  const mapFiles = files.filter((k) => !MAP_FILES[k].bonus);
  const bonusFiles = files.filter((k) => MAP_FILES[k].bonus);

  const FileButton = ({ k, primary }: { k: MapFileKey; primary?: boolean }) => (
    <a
      href={downloadUrl(origin, token, k)}
      className={
        primary
          ? 'flex items-center justify-between gap-3 bg-forest text-cream font-semibold py-3.5 px-5 rounded-xl text-[15.5px] hover:bg-forest-dark transition-colors'
          : 'flex items-center justify-between gap-3 bg-white border border-[#D8D4C5] text-forest-dark font-semibold py-3.5 px-5 rounded-xl text-[15.5px] hover:border-forest transition-colors'
      }
    >
      <span>{MAP_FILES[k].label}</span>
      <span aria-hidden="true">↓</span>
    </a>
  );

  return (
    <main className="bg-[#F2EFE4] pb-20">
      <section className="pt-20 md:pt-24 pb-10 text-center px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest-dark">Thank you{firstName ? `, ${firstName}` : ''}</p>
        <h1 className="mt-4 font-display text-[clamp(2.1rem,4.4vw,3.1rem)] leading-[1.06] tracking-[-0.018em]">
          Your Skills Map is <em className="not-italic italic text-forest">ready.</em>
        </h1>
        <p className="mt-4 max-w-[560px] mx-auto text-[17px] leading-[1.6] text-gray-600">
          Download it below. The same links are in your inbox{email ? ` (${email})` : ''}, so you can come back to them anytime.
        </p>
      </section>

      <section className="mx-auto max-w-[620px] px-6">
        <div className={`relative bg-white rounded-2xl px-6 pt-8 pb-6 ${PAPER_SHADOW}`}>
          <Tape />
          <h2 className="font-display text-[22px]">The Future-Ready Skills Map</h2>
          <div className="mt-4 flex flex-col gap-2.5">
            {mapFiles.map((k, i) => (
              <FileButton key={k} k={k} primary={i === 0} />
            ))}
          </div>
          {bonusFiles.length > 0 && (
            <>
              <h2 className="mt-7 font-display text-[22px]">
                Your course bonus: <em className="not-italic italic text-forest">Directions Challenge</em>
              </h2>
              <div className="mt-4 flex flex-col gap-2.5">
                {bonusFiles.map((k) => (
                  <FileButton key={k} k={k} />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="mt-8 rounded-2xl bg-[#E6EBDF] border border-[#C9D3BE] px-6 py-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest-dark">Start here, 10 minutes</p>
          <p className="mt-2 text-[16px] leading-[1.6] text-gray-700">
            Turn to <strong>page 5</strong>, the whole map on one page. Read down your kid&apos;s column,
            circle the two or three areas that feel most important right now, then pick one hands-on idea
            from those pages to try this week.
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-white border border-[#D8D4C5] px-6 py-7 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C97B5C]">For the next {OWNER_OFFER_HOURS} hours</p>
          <h2 className="mt-2 font-display text-[26px] leading-tight">
            {OWNER_OFFER.percentOff}% off your first year of the library
          </h2>
          <p className="mt-3 text-[16px] leading-[1.6] text-gray-600 max-w-[480px] mx-auto">
            Every area in the map has activities waiting: 120+ guides with your job and your kid&apos;s job at
            every step. Start with 7 days free. Nothing is charged today.
          </p>
          <Link
            href="/map-offer"
            prefetch={false}
            className="mt-5 inline-flex items-center gap-2 bg-forest text-cream font-semibold py-3.5 px-6 rounded-xl text-[15.5px] hover:bg-forest-dark transition-colors"
          >
            Try the library free for 7 days <span aria-hidden="true">→</span>
          </Link>
          <p className="mt-2 text-[12.5px] text-gray-500">Applied automatically · Yearly plan</p>
        </div>
      </section>
    </main>
  );
}
