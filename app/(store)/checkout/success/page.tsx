import type { Metadata } from 'next';
import Link from 'next/link';
import Confetti from '@/components/checkout/Confetti';
import SandboxTierCookie from '@/components/checkout/SandboxTierCookie';
import { MEMBERSHIP_PRICE_FORMATTED } from '@/lib/membership';
import { getMembership } from '@/lib/membership-runtime';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "You're in!",
  description: 'Your purchase is confirmed. Welcome to Anywhere Learning.',
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{
    session_id?: string;
    token?: string;
    /** 'member' for $99/yr membership, 'starter' for Starter Pack. Defaults to member. */
    tier?: 'member' | 'starter';
    /** First name from the Stripe session, displayed in the greeting. */
    name?: string;
    /** Email the receipt was sent to, displayed in "In your inbox". */
    email?: string;
    /** Order number to display, e.g. AW-2026-04829 */
    order?: string;
  }>;
}

// TODO: When Stripe membership is wired up, fetch the session via
// stripe.checkout.sessions.retrieve(session_id) and pull name, email,
// tier, and a real order number from session.metadata / customer_details.
// For now, the page reads from query params + sensible defaults so the
// design is testable without a live Stripe session.
async function resolveContext(searchParams: Awaited<PageProps['searchParams']>) {
  const tier: 'member' | 'starter' = searchParams.tier === 'starter' ? 'starter' : 'member';
  const firstName = searchParams.name?.trim() || '';
  const email = searchParams.email?.trim() || '';
  const order =
    searchParams.order?.trim() ||
    `AW-${new Date().getUTCFullYear()}-${Math.floor(10000 + Math.random() * 89999)}`;
  return { tier, firstName, email, order };
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const { tier, firstName, email, order } = await resolveContext(sp);

  const isMember = tier === 'member';
  // Live founder state so the receipt copy + Amelie's note reflect the
  // actual phase at view time, not whatever IS_FOUNDER_PHASE was when
  // this code was deployed.
  const m = await getMembership();

  const content = isMember
    ? {
        flourish: "You're in.",
        eyebrow: `Membership confirmed · ${m.tierLabel}`,
        h1Greeting: firstName ? `You're in, ${firstName}.` : "You're in.",
        h1Suffix: 'Welcome to the family.',
        lead: m.isFounderPhase
          ? `Your founding member rate (${m.priceYear}, locked in for life) is active. Full library access is yours starting now. Below is everything you need to get started.`
          : `Your membership (${m.priceYear}) is active. Full library access is yours starting now. Below is everything you need to get started.`,
        ctaCard: {
          leadLine: "Don't wait for the weekend.",
          headlinePrefix: 'Start with three activities we',
          headlineEm: 'picked for you.',
          body: 'We curated a starting trio based on what tends to land best for new members. Open your library to see them.',
          ctaLabel: 'Open my library',
          ctaHref: '/account',
        },
        receipt: {
          product: 'Anywhere Learning Annual Membership',
          price: MEMBERSHIP_PRICE_FORMATTED,
          note: m.isFounderPhase
            ? 'Founding rate · Locks in for life · Annual renewal'
            : 'Annual renewal',
          inboxItems: [
            email ? `Payment receipt from Stripe (sent to ${email})` : 'Payment receipt from Stripe',
            'A welcome note from Amelie (within an hour)',
            'Renewal reminder 14 days before your year is up',
          ],
        },
        amelie: m.isFounderPhase
          ? "Hi. I'm Amelie. I built this because I wanted my own two kids learning things school doesn't have time for. You signed up early enough that what I make next gets shaped by what you tell me. Write me at info@anywherelearning.co — I read all of it. Thanks for being here. xo Amelie"
          : "Hi. I'm Amelie. I built this because I wanted my own two kids learning things school doesn't have time for. Write me at info@anywherelearning.co — I read all of it. Thanks for being here. xo Amelie",
        helpLinks: [
          { label: 'Trouble accessing? Email us →', href: '/contact' },
          { label: 'Got billed wrong? Let us know →', href: '/contact' },
          { label: 'Need to cancel? See policy →', href: '/terms#refund-policy' },
        ],
      }
    : {
        flourish: 'You got it.',
        eyebrow: 'Purchase confirmed · Starter Pack',
        h1Greeting: firstName ? `You got it, ${firstName}.` : 'You got it.',
        h1Suffix: 'Now the fun starts.',
        lead: 'Your Starter Pack is yours forever. The Skills Map and 10 activities are ready to open. Below is everything you need to start this week.',
        ctaCard: {
          leadLine: "Don't wait for the weekend.",
          headlinePrefix: 'Open your Starter Pack and',
          headlineEm: 'pick day one.',
          body: 'The Skills Map is a 10-minute read that sets the table. Then pick an activity from the ten you own.',
          ctaLabel: 'Open my Starter Pack',
          ctaHref: '/account',
        },
        receipt: {
          product: 'The Real-World Starter Pack',
          price: '$44.99',
          note: 'One-time · Yours forever',
          inboxItems: [
            email ? `Payment receipt from Stripe (sent to ${email})` : 'Payment receipt from Stripe',
            'A welcome note from Amelie (within an hour)',
          ],
        },
        amelie:
          "Hi. I'm Amelie. I built this because I wanted my own two kids learning real-world skills, not just school skills. I hand-picked these 10 activities for one reason — they're the ones that turn 'meh' into 'wait, I want to do that again.' Write me at info@anywherelearning.co if something's off or you want to tell me what's working. xo Amelie",
        helpLinks: [
          { label: 'Trouble accessing? Email us →', href: '/contact' },
          { label: 'Got billed wrong? Let us know →', href: '/contact' },
          { label: 'Want a refund? 14-day guarantee →', href: '/terms#refund-policy' },
        ],
      };

  return (
    <>
      <SandboxTierCookie tier={tier} />
      <Confetti />
      <main className="bg-cream pb-16">
        {/* HERO */}
        <section className="pt-20 md:pt-24 pb-12 text-center">
          <div className="mx-auto max-w-[720px] px-6">
            <div
              className="inline-block font-display italic text-[#C97B5C] leading-none tracking-[-0.02em] -rotate-2 mb-3.5"
              style={{ fontSize: 'clamp(3.5rem, 9vw, 6rem)' }}
            >
              {content.flourish}
            </div>
            <div className="my-6 flex items-center justify-center gap-2.5" aria-hidden="true">
              <span className="w-[60px] h-px bg-[#C9C5B7]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#C97B5C]" />
              <span className="w-[60px] h-px bg-[#C9C5B7]" />
            </div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
              <span className="w-[22px] h-px bg-forest inline-block" />
              {content.eyebrow}
            </p>
            <h1 className="mt-4 font-display text-[clamp(2.125rem,4.4vw,3.25rem)] leading-[1.06] tracking-[-0.018em] text-balance">
              {content.h1Greeting}{' '}
              <em className="not-italic italic text-forest">{content.h1Suffix}</em>
            </h1>
            <p className="mt-5 max-w-[600px] mx-auto text-[17px] md:text-[18px] leading-[1.6] text-gray-600 text-pretty">
              {content.lead}
            </p>
          </div>
        </section>

        {/* PRIMARY CTA — simple centered button */}
        <section className="pt-2 pb-10 text-center">
          <Link
            href={content.ctaCard.ctaHref}
            className="inline-flex items-center gap-2.5 bg-forest text-cream font-body font-semibold py-4 px-7 rounded-xl text-[16px] shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_-1px_0_rgba(0,0,0,0.10)_inset,0_12px_26px_-14px_rgba(58,90,64,0.55)] hover:bg-forest-dark hover:-translate-y-px transition-all duration-200"
          >
            {content.ctaCard.ctaLabel}
            <span className="inline-grid place-items-center w-[22px] h-[22px] rounded-full bg-white/[0.18]">
              &rarr;
            </span>
          </Link>
        </section>

        {/* RECEIPT */}
        <section className="pt-2 pb-8">
          <div className="mx-auto max-w-[720px] px-6">
            <div className="bg-cream border border-[#D8D4C5] rounded-[12px] p-7 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Your purchase */}
              <div>
                <h4 className="font-body font-semibold text-[11.5px] uppercase tracking-[0.18em] text-forest-dark m-0 mb-3">
                  Your purchase
                </h4>
                <div className="font-display italic text-[19px] text-ink leading-[1.2] mb-2">
                  {content.receipt.product}
                </div>
                <div
                  className="font-display text-[30px] text-ink leading-none"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {content.receipt.price}
                </div>
                <div className="mt-2 font-display italic text-[13.5px] text-[#C97B5C]">
                  {content.receipt.note}
                </div>
                <div
                  className="mt-3.5 pt-3 border-t border-dashed border-[#C9C5B7] text-[12.5px] text-gray-500"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  Order #{order}
                </div>
              </div>

              {/* In your inbox */}
              <div>
                <h4 className="font-body font-semibold text-[11.5px] uppercase tracking-[0.18em] text-forest-dark m-0 mb-3">
                  In your inbox
                </h4>
                <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
                  {content.receipt.inboxItems.map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 items-start text-[14.5px] text-gray-600 leading-[1.5]"
                    >
                      <span className="text-forest font-bold flex-none mt-0.5" aria-hidden="true">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* AMELIE NOTE */}
        <section className="pt-2 pb-8">
          <div className="mx-auto max-w-[640px] px-6">
            <div className="bg-[#F2EFE4] border border-[#D8D4C5] rounded-[12px] p-7 md:p-8 grid grid-cols-[48px_1fr] gap-4 md:gap-5 items-start">
              <div
                aria-hidden="true"
                className="w-12 h-12 rounded-full bg-[#E6EBDF] border border-[#C9D3BE] grid place-items-center text-forest-dark font-display italic text-[22px] leading-none"
                style={{ paddingBottom: '3px' }}
              >
                A
              </div>
              <div>
                <div className="font-body font-semibold text-[10.5px] uppercase tracking-[0.18em] text-[#C97B5C] mb-2">
                  A note from Amelie
                </div>
                <p className="m-0 font-display italic text-[17.5px] leading-[1.55] text-ink text-pretty">
                  {content.amelie}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HELP ROW */}
        <div className="mx-auto max-w-[720px] px-6 pt-6 flex flex-wrap justify-center items-center gap-x-5 gap-y-2 text-[13.5px]">
          {content.helpLinks.map((link, i) => (
            <span key={link.href + i} className="inline-flex items-center gap-x-5">
              <Link
                href={link.href}
                className="text-gray-600 font-body font-medium no-underline hover:text-forest-dark transition-colors"
              >
                {link.label}
              </Link>
              {i < content.helpLinks.length - 1 && (
                <span
                  aria-hidden="true"
                  className="w-[3px] h-[3px] rounded-full bg-[#C9C5B7] inline-block"
                />
              )}
            </span>
          ))}
        </div>
      </main>
    </>
  );
}
