import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import EmailForm from '@/components/EmailForm';
import { IS_FOUNDER_PHASE, MEMBERSHIP_PRICE_YEAR } from '@/lib/membership';

export const metadata: Metadata = {
  // Absolute so the site suffix doesn't push it past the SERP cutoff
  title: { absolute: 'Real-World Activities for Kids: Free 7-Day Guide' },
  description:
    'A free, low-prep activity guide for families who love hands-on, real-world learning. Seven real-world activities across seven categories. Zero worksheets.',
  alternates: {
    canonical: 'https://anywherelearning.co/free-guide',
  },
  openGraph: {
    title: 'Real-World Activities for Kids: Free 7-Day Guide for Families',
    description:
      'A free, low-prep activity guide for families who love hands-on, real-world learning. Seven real-world activities across seven categories. Zero worksheets.',
    url: 'https://anywherelearning.co/free-guide',
    type: 'website',
    images: [
      {
        url: 'https://anywherelearning.co/images/free-guide-og.jpg',
        width: 1200,
        height: 630,
        alt: '7 Days of Real-World Learning Free Guide | Anywhere Learning',
      },
    ],
  },
};

const freeGuideLd = {
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  genre: 'Parenting guide',
  name: '7 Days of Real-World Learning',
  description:
    'A free, low-prep activity guide with 7 hands-on activities for families across outdoor & nature, real-world math, creativity, AI & digital, entrepreneurship, communication, and planning. Ages 6 to 14.',
  image: 'https://anywherelearning.co/images/free-guide-og.jpg',
  url: 'https://anywherelearning.co/free-guide',
  publisher: { '@type': 'Organization', name: 'Anywhere Learning', url: 'https://anywherelearning.co' },
  author: {
    '@type': 'Person',
    name: 'Amelie',
    jobTitle: 'Former Teacher & Founder',
    url: 'https://anywherelearning.co/about',
  },
  isAccessibleForFree: true,
  inLanguage: 'en',
  audience: { '@type': 'Audience', audienceType: 'Parents of kids 6 to 14' },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    category: 'Free',
  },
};

const days = [
  {
    num: 'Day 1',
    cat: 'Outdoor & Nature',
    title: 'Square Foot Safari',
    body: 'Your kid picks one small patch of ground, stays with it, and discovers everything living inside. Real field scientists call this a quadrat study.',
    color: '#3A5A40',
  },
  {
    num: 'Day 2',
    cat: 'Real-World Math',
    title: 'The $20 Snack Mission',
    body: 'A real budget, real money, and real trade-offs at a real store. Math sticks when the numbers point at something kids care about.',
    color: '#588157',
  },
  {
    num: 'Day 3',
    cat: 'Creativity',
    title: 'Household Orchestra',
    body: 'Five random objects, twenty minutes, zero musical training. Real creativity comes from constraints, not unlimited options.',
    color: '#C97B5C',
  },
  {
    num: 'Day 4',
    cat: 'AI & Digital',
    title: 'Three AIs, One Question',
    body: "Ask the same question to ChatGPT, Claude, and Gemini, then watch your kid figure out when AI is bluffing. The single most important AI skill they can learn.",
    color: '#B6913F',
  },
  {
    num: 'Day 5',
    cat: 'Entrepreneurship',
    title: 'Complaint to Product',
    body: "Every great business started as somebody's complaint. Your kid turns one family annoyance into a real product idea.",
    color: '#C97B5C',
  },
  {
    num: 'Day 6',
    cat: 'Communication',
    title: 'The Two-Minute Story',
    body: 'Telling a clear, interesting story in two minutes is one of the most useful skills a person can have. It gets you jobs, friends, and dinner-party invitations.',
    color: '#588157',
  },
  {
    num: 'Day 7',
    cat: 'Planning',
    title: 'Plan a Mini Adventure',
    body: 'Your kid plans a real two-hour family outing, and the family actually goes. Real ownership of a real decision, from start to finish.',
    color: '#3A5A40',
  },
];

// The illustrated header from each day's page in the PDF, cut out as PNGs.
const DAY_ICONS = [
  'square-foot-safari',
  'snack-mission',
  'household-orchestra',
  'three-ais',
  'complaint-to-product',
  'two-minute-story',
  'mini-adventure',
].map((n) => `/images/free-guide-${n}.png`);

// Real inside pages, fanned behind the cover in the hero (back to front).
const INSIDE_PAGES = [
  '/images/free-guide-page-06.jpg',
  '/images/free-guide-page-05.jpg',
  '/images/free-guide-page-04.jpg',
];

// What every activity page holds, as labelled on the pages themselves.
const PAGE_PARTS = [
  ['Written for you', 'A guide for the parent, not a worksheet for the kid'],
  ["You'll need", 'A short list of things you already have'],
  ['Explore, Develop, Extend', 'Three steps, so it grows with your kid'],
  ['Why this works', 'The real-world skill behind it, in plain words'],
  ['Try asking', 'Questions that get them thinking, not answers'],
];

export default function FreeGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(freeGuideLd) }}
      />
      <SiteHeader />
      <main className="bg-cream">
        {/* ── 01 Hero: copy and form beside the real guide, pages fanned out ── */}
        <section className="overflow-hidden bg-[#F2EFE4]">
          <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-6 pb-12 pt-10 md:pb-14 md:pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div>
              <p className="inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.18em] text-forest-dark">
                <span className="inline-block h-px w-[22px] bg-forest" />
                Free download
              </p>
              <h1 className="mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] leading-[1.04] tracking-tight text-balance">
                7 days of <span className="italic text-forest">real-world</span> learning.
              </h1>
              <p className="mt-5 max-w-[520px] text-[18px] leading-[1.6] text-gray-600">
                Seven real-world activities across seven categories. Do them in a week, a month,
                or whenever life makes room. A free guide for parents who want their kids growing
                into{' '}
                <span className="font-display italic text-forest-dark">capable, curious</span>{' '}
                humans.
              </p>
              <div className="mt-7 max-w-[480px]">
                <EmailForm variant="light" buttonText="Send me the free guide" />
              </div>
              <figure className="mt-6 flex max-w-[400px] gap-2.5 rounded-[12px] border border-[#E2DCC8] bg-cream/70 px-3.5 py-3">
                <span
                  aria-hidden="true"
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold"
                  style={{ background: 'rgba(58,90,64,0.12)', color: '#3A5A40' }}
                >
                  V
                </span>
                <blockquote className="m-0">
                  <p className="m-0 text-[12.5px] leading-[1.5] text-gray-700">
                    &ldquo;We tried the Square Foot Safari and my son kept saying how much fun he was
                    having. Best afternoon outdoors we&apos;ve had together lately.&rdquo;
                  </p>
                  <figcaption className="mt-1 text-[11.5px] font-semibold text-forest-dark">
                    Vickie <span className="font-normal text-gray-500">&middot; mom of two</span>
                  </figcaption>
                </blockquote>
              </figure>
            </div>

            <div className="relative mx-auto h-[380px] w-full max-w-[480px] sm:h-[460px]">
              {INSIDE_PAGES.map((src, i) => (
                <div
                  key={src}
                  aria-hidden="true"
                  className="absolute aspect-[8.5/11] w-[54%] overflow-hidden rounded-[10px] border border-[#D8D4C5] bg-white shadow-[0_24px_50px_-30px_rgba(45,58,46,0.5)]"
                  style={{ left: `${42 - i * 5}%`, top: `${6 + i * 3}%`, transform: `rotate(${11 - i * 5}deg)` }}
                >
                  <Image src={src} alt="" fill sizes="260px" className="object-cover object-top" />
                </div>
              ))}
              <div className="absolute left-[3%] top-[2%] z-10 aspect-[8.5/11] w-[58%] -rotate-[4deg] overflow-hidden rounded-[12px] border border-[#D8D4C5] shadow-[0_34px_64px_-30px_rgba(45,58,46,0.6)]">
                <Image
                  src="/images/free-guide-cover.jpg"
                  alt="7 Days of Real-World Learning free guide cover"
                  fill
                  sizes="(max-width: 768px) 60vw, 280px"
                  quality={85}
                  priority
                  className="object-cover"
                />
              </div>
              <span
                aria-hidden="true"
                className="absolute bottom-[4%] right-0 z-20 rotate-[4deg] rounded-full bg-[#C97B5C] px-5 py-2.5 font-display text-[15px] text-cream shadow-[0_16px_26px_-10px_rgba(201,123,92,0.55)]"
              >
                11 pages · free PDF
              </span>
            </div>
          </div>

        </section>

        {/* ── 02 What's inside: a real page, labelled, beside the seven days ── */}
        <section className="bg-cream py-14 md:py-16">
          <div className="mx-auto max-w-[1180px] px-6">
            <div className="mx-auto max-w-[680px] text-center">
              <h2 className="font-display text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.08] tracking-tight text-balance">
                Seven days. Seven <span className="italic text-forest">real-world skills.</span>
              </h2>
              <p className="mt-2 text-[17px] text-gray-600">
                Pick one. <span className="font-display italic text-forest-dark">Try it today.</span>
              </p>
            </div>

            <div className="mt-10 grid items-start gap-10 lg:grid-cols-[380px_1fr] lg:gap-12">
              <div className="lg:sticky lg:top-24">
                <div className="relative mx-auto aspect-[8.5/11] w-full max-w-[340px] overflow-hidden rounded-[12px] border border-[#D8D4C5] bg-white shadow-[0_30px_60px_-34px_rgba(45,58,46,0.55)]">
                  <Image
                    src="/images/free-guide-page-04.jpg"
                    alt="Inside the guide: the Day 1 page, Square Foot Safari"
                    fill
                    sizes="340px"
                    className="object-cover object-top"
                  />
                </div>
                <p className="mt-5 text-center font-display text-[16px] italic text-forest-dark">
                  Every activity page has
                </p>
                <ul className="mx-auto mt-3 max-w-[340px] list-none space-y-2 p-0">
                  {PAGE_PARTS.map(([t, d]) => (
                    <li key={t} className="rounded-[10px] bg-[#F2EFE4] px-4 py-2.5">
                      <span className="block text-[14px] font-semibold text-ink">{t}</span>
                      <span className="block text-[13px] text-gray-500">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <ol className="m-0 list-none divide-y divide-[#E6E0CD] rounded-[16px] border border-[#D8D4C5] bg-white p-0">
                {days.map((d, i) => (
                  <li key={d.num} className="grid grid-cols-[64px_1fr] gap-4 px-5 py-5 md:grid-cols-[76px_1fr] md:gap-5 md:px-7">
                    <div className="relative h-16 w-16 md:h-[76px] md:w-[76px]">
                      <Image src={DAY_ICONS[i]} alt="" fill sizes="76px" className="object-contain" />
                    </div>
                    <div>
                      <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: d.color }}>
                        {d.num} · {d.cat}
                      </p>
                      <h3 className="mt-0.5 font-display text-[21px] leading-tight tracking-tight text-ink">
                        {d.title}
                      </h3>
                      <p className="mt-1.5 text-[15px] leading-[1.6] text-gray-600">{d.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── 03 Final CTA ── */}
        <section className="bg-[#F2EFE4] py-14 text-center md:py-16">
          <div className="mx-auto max-w-[640px] px-6">
            <h2 className="font-display text-[clamp(2rem,4.6vw,3.25rem)] leading-[1.06] tracking-tight text-balance">
              Ready to <span className="italic text-forest">start?</span>
            </h2>
            <p className="mx-auto mt-3 max-w-[480px] text-[17.5px] leading-[1.55] text-gray-600">
              Download the free guide and try your first activity this week. No curriculum. No
              worksheets. Low prep.
            </p>
            <div className="mx-auto mt-6 max-w-[480px]">
              <EmailForm variant="light" buttonText="Send me the free guide" />
            </div>
            <p className="mt-6 text-[14.5px] text-gray-500">
              Already know you want more? The{' '}
              <Link
                href="/#membership"
                className="border-b border-forest/25 font-semibold text-forest-dark transition-colors hover:border-forest-dark hover:text-forest"
              >
                membership
              </Link>{' '}
              has 120+ guided activities like these
              {IS_FOUNDER_PHASE ? `, ${MEMBERSHIP_PRICE_YEAR} for founding members.` : '.'}
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
