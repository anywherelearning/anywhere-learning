import type { Metadata } from 'next';
import Image from 'next/image';
import { PAPER_SHADOW, Tape } from '@/components/shared/Paper';
import { GIFT_MAX_SCHEDULE_DAYS, GIFT_MESSAGE_MAX, GIFT_PRICE_USD } from '@/lib/gift';
import GiftForm from './GiftForm';

export const metadata: Metadata = {
  title: 'Give a Year of Real-World Learning',
  description: `A gift that isn't more stuff: 12 months of hands-on, real-world activities the whole family does together. $${GIFT_PRICE_USD} once, nothing renews, delivered by email on the day you choose.`,
  alternates: { canonical: '/gift' },
  openGraph: {
    title: 'Give a Year of Real-World Learning | Anywhere Learning',
    description: "A gift that isn't more stuff: a year of real-world adventures for the whole family.",
    url: '/gift',
  },
};

export const dynamic = 'force-dynamic';

const ymd = (d: Date) => d.toISOString().slice(0, 10);

const WHAT_THEY_GET = [
  {
    title: 'The full library',
    body: 'Real-world activities for ages 6 to 14: cook, budget, build, grow, invent. Each guide adjusts to every kid.',
  },
  {
    title: 'A trail made for their kids',
    body: 'A few questions about the kids, and their adventure map opens with the first activity already picked.',
  },
  {
    title: 'Together time, not screen time',
    body: 'Low prep and done side by side. Parents open a guide on any device and follow along.',
  },
];

const STEPS = [
  { n: '1', title: 'Tell us who it is for', body: "The parent's name and email, and your name so they know who to thank." },
  { n: '2', title: 'Pick the day', body: 'Right away, or a birthday or Christmas morning. Their 12 months start that day.' },
  { n: '3', title: 'They open it', body: 'A gift email arrives with a one-tap button into the library. You get a printable card to wrap.' },
];

const FAQ = [
  {
    q: 'Does the family need to pay anything or enter a card?',
    a: 'No. The gift covers 12 months in full. There is no card on their end and nothing renews. Near the end of the year they get one note asking if they want to keep going.',
  },
  {
    q: 'What ages is it for?',
    a: 'Kids 6 to 14. Every guide has three levels, so siblings of different ages can do the same activity together.',
  },
  {
    q: 'Do they have to homeschool?',
    a: 'Not at all. Any family that wants hands-on, real-world learning at home can use it, on weekends, after school or over the holidays.',
  },
  {
    q: 'Can I give it as a surprise for a specific day?',
    a: 'Yes. Choose "On a date I choose" and the gift email lands that morning. You get a printable gift card right away, so there is something to wrap.',
  },
  {
    q: 'What if something goes wrong?',
    a: 'Write to info@anywherelearning.co and Amelie will sort it out personally.',
  },
];

/**
 * /gift: buy a 12-month membership for another family. Built for the holiday
 * window (grandparents and relatives), but evergreen for birthdays. The form
 * posts to /api/checkout/gift; the webhook creates the access grant.
 */
export default async function GiftPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const now = new Date();
  const minDate = ymd(new Date(now.getTime() + 24 * 60 * 60 * 1000));
  const maxDate = ymd(new Date(now.getTime() + (GIFT_MAX_SCHEDULE_DAYS - 1) * 24 * 60 * 60 * 1000));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Anywhere Learning Gift Membership (12 months)',
    description:
      "Twelve months of real-world, hands-on learning activities for families with kids 6 to 14, given as a gift. One payment, nothing renews.",
    image: 'https://anywherelearning.co/email-library-hero-v2.jpg',
    brand: { '@type': 'Brand', name: 'Anywhere Learning' },
    offers: {
      '@type': 'Offer',
      price: GIFT_PRICE_USD,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: 'https://anywherelearning.co/gift',
    },
  };

  return (
    <main className="bg-[#F2EFE4]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero ── */}
      <section className="px-6 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="mx-auto grid max-w-[1040px] items-center gap-12 md:grid-cols-[1.1fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2.5 text-[12.5px] font-medium uppercase tracking-[.16em] text-forest-dark before:block before:h-px before:w-[22px] before:bg-forest">
              A gift that isn&apos;t more stuff
            </span>
            <h1 className="font-display mt-4 text-[clamp(2.4rem,5.2vw,4.1rem)] leading-[1.04] tracking-tight text-gray-900 text-balance">
              Give a year of <em className="not-italic text-forest">real-world adventures.</em>
            </h1>
            <p className="mt-5 max-w-[520px] text-[17.5px] leading-relaxed text-gray-600">
              Twelve months of hands-on activities a family does together: cooking with fractions,
              planning a real budget, building, growing, inventing. The kids remember the day they ran
              the lemonade stand, not another toy.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a
                href="#gift-form"
                className="inline-flex items-center gap-3 rounded-xl bg-forest px-6 py-4 text-[16px] font-semibold text-cream shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_10px_24px_-12px_rgba(58,90,64,.5)] transition-all hover:-translate-y-px hover:bg-forest-dark"
              >
                Give the gift
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20" aria-hidden="true">→</span>
              </a>
              <span className="text-[15px] text-gray-600">
                <strong className="font-semibold text-gray-900">${GIFT_PRICE_USD} once.</strong> Nothing renews.
              </span>
            </div>
          </div>

          {/* The gift card, as it looks on paper */}
          <div className="relative mx-auto w-full max-w-[420px]">
            <div className={`relative rotate-[1.5deg] bg-[#FFFDF8] px-8 pb-9 pt-10 ${PAPER_SHADOW}`}>
              <Tape className="left-8 -rotate-6" />
              <Tape className="right-8 rotate-6" color="rgba(196,131,106,0.55)" />
              <div className="border-[1.5px] border-dashed border-gold px-6 py-7 text-center">
                <p className="text-[12px] font-semibold uppercase tracking-[.2em] text-[#B5803E]">A gift for your family</p>
                <p className="font-display mt-3 text-[30px] leading-tight text-gray-900">A year of real-world adventures</p>
                <p className="mt-5 text-[14px] uppercase tracking-[.14em] text-gray-400">with love from</p>
                <p className="mt-1 text-[38px] leading-none text-forest-dark" style={{ fontFamily: 'var(--font-display), cursive' }}>
                  Grandma Jo
                </p>
                <p className="mx-auto mt-5 max-w-[260px] text-[14px] leading-relaxed text-gray-500">
                  Your library opens on December 25. Look for an email from Anywhere Learning.
                </p>
              </div>
            </div>
            <span
              className="absolute -bottom-5 -left-4 grid h-24 w-24 -rotate-12 place-items-center rounded-full bg-[#C4836A] text-center text-[12.5px] font-semibold uppercase leading-tight tracking-[.08em] text-cream shadow-lg"
              aria-hidden="true"
            >
              Printable
              <br />
              card
              <br />
              included
            </span>
          </div>
        </div>
      </section>

      {/* ── What they get ── */}
      <section className="bg-cream px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-[1040px] items-center gap-12 md:grid-cols-[1fr_1.15fr]">
          <Image
            src="/email-library-hero-v2.jpg"
            alt="A fan of Anywhere Learning activity guides and the Future-Ready Skills Map"
            width={880}
            height={838}
            className="mx-auto w-full max-w-[420px] h-auto"
          />
          <div>
            <h2 className="font-display text-[clamp(1.9rem,3.6vw,2.6rem)] leading-tight text-gray-900">What the family gets</h2>
            <ul className="mt-7 flex flex-col gap-6">
              {WHAT_THEY_GET.map((item, i) => (
                <li key={item.title} className="flex gap-4">
                  <span
                    className="grid h-10 w-10 flex-none place-items-center rounded-full text-[17px] font-semibold text-white"
                    style={{ backgroundColor: ['#C4836A', '#588157', '#D4A373'][i] }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-[18px] font-semibold text-gray-900">{item.title}</h3>
                    <p className="mt-1 text-[15.5px] leading-relaxed text-gray-600">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── How giving works ── */}
      <section className="px-6 pt-16 md:pt-20">
        <div className="mx-auto max-w-[1040px]">
          <h2 className="font-display text-center text-[clamp(1.9rem,3.6vw,2.6rem)] leading-tight text-gray-900">
            How giving works
          </h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li
                key={s.n}
                className={`relative bg-white px-6 pb-7 pt-8 ${PAPER_SHADOW} ${['-rotate-[0.8deg]', 'rotate-[0.5deg]', '-rotate-[0.4deg]'][i]}`}
              >
                <span className="font-display text-[40px] italic leading-none text-gold">{s.n}</span>
                <h3 className="mt-3 text-[18px] font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-gray-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Order form ── */}
      <section id="gift-form" className="scroll-mt-24 px-6 pt-16 pb-16 md:pt-24 md:pb-20">
        <GiftForm
          priceUsd={GIFT_PRICE_USD}
          minDate={minDate}
          maxDate={maxDate}
          messageMax={GIFT_MESSAGE_MAX}
          error={error}
        />
      </section>

      {/* ── FAQ ── */}
      <section className="bg-cream px-6 py-16 md:py-20">
        <div className="mx-auto max-w-[720px]">
          <h2 className="font-display text-center text-[clamp(1.8rem,3.4vw,2.4rem)] leading-tight text-gray-900">
            Questions people ask
          </h2>
          <div className="mt-8 divide-y divide-[#E3E0D6] border-y border-[#E3E0D6]">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold text-gray-900">
                  {f.q}
                  <span className="text-[22px] leading-none text-forest transition group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-[15.5px] leading-relaxed text-gray-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
