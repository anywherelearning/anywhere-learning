import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import JoinFaqAccordion from '@/components/join/JoinFaqAccordion';
import { joinFaqs } from '@/lib/join-faqs';
import StickyFounderBar from '@/components/join/StickyFounderBar';
import CheckoutButton from '@/components/checkout/CheckoutButton';
import {
  IS_FOUNDER_PHASE,
  MEMBERSHIP_PRICE_USD,
  MEMBERSHIP_PRICE,
  MEMBERSHIP_PRICE_YEAR,
  POST_FOUNDER_PRICE_USD,
  FOUNDER_CAP,
} from '@/lib/membership';

const FOUNDER_FLOOR = 12;
// TODO: replace with real subscriber count from DB when membership is live
const actualSubscribers = 0;
const founderClaimed = Math.max(FOUNDER_FLOOR, actualSubscribers);
const founderRemaining = FOUNDER_CAP - founderClaimed;

const OG_IMAGE = 'https://anywherelearning.co/membership-hero.png';
const PAGE_URL = 'https://anywherelearning.co/join';
const META_TITLE = IS_FOUNDER_PHASE
  ? `Join the Membership | $${MEMBERSHIP_PRICE_USD}/year Founder Price`
  : `Join the Membership | $${MEMBERSHIP_PRICE_USD}/year`;
const META_DESC = IS_FOUNDER_PHASE
  ? `Unlimited access to 100+ guided life-skills activities for kids ages 6 to 14. Built by a teacher. $${MEMBERSHIP_PRICE_USD}/year founder rate for the first ${FOUNDER_CAP} members, locked in for life.`
  : `Unlimited access to 100+ guided life-skills activities for kids ages 6 to 14. Built by a teacher. $${MEMBERSHIP_PRICE_USD}/year, cancel anytime.`;

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESC,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: META_TITLE,
    description: META_DESC,
    url: PAGE_URL,
    type: 'website',
    images: [{ url: OG_IMAGE, width: 1200, height: 900, alt: 'The Anywhere Learning library' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: META_TITLE,
    description: META_DESC,
    images: [OG_IMAGE],
  },
};

/* ─── Shared CTA block (used in multiple sections) ─── */
function CtaBlock({
  center = false,
  darkMode = false,
  m,
}: {
  center?: boolean;
  darkMode?: boolean;
  /** Live membership state — passed from the JoinPage server component. */
  m: { isFounderPhase: boolean; priceYear: string };
}) {
  return (
    <div
      className={`inline-flex flex-col gap-3 ${center ? 'items-center text-center' : 'items-start'}`}
    >
      <CheckoutButton
        kind="membership"
        className="inline-flex items-center gap-3.5 rounded-xl bg-forest px-7 py-[18px] text-[17px] font-semibold text-cream shadow-[inset_0_1px_0_rgba(255,255,255,.18),inset_0_-1px_0_rgba(0,0,0,.1),0_10px_24px_-12px_rgba(58,90,64,.5)] transition-all hover:-translate-y-px hover:bg-forest-dark hover:shadow-[inset_0_1px_0_rgba(255,255,255,.22),inset_0_-1px_0_rgba(0,0,0,.12),0_16px_30px_-10px_rgba(58,90,64,.55)] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <span className="inline-flex items-center gap-3.5">
          {m.isFounderPhase ? 'Claim Founder Price · ' : 'Join the Membership · '}
          {m.priceYear}
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20 transition-transform">
            →
          </span>
        </span>
      </CheckoutButton>
      <div
        className={`text-sm ${darkMode ? 'text-[#B7BFB6]' : 'text-gray-500'}`}
      >
        {m.isFounderPhase && (
          <span className={`line-through ${darkMode ? 'text-[#7F8B80]' : 'text-gray-400'} font-medium mr-1`}>
            ${POST_FOUNDER_PRICE_USD}
          </span>
        )}
        <span className={`font-bold ${darkMode ? 'text-gold-light' : 'text-forest-dark'}`}>
          {m.priceYear}
        </span>
        {m.isFounderPhase && (
          <>
            {' · '}
            <span className="font-display italic text-[15px] text-[#c4836a]">
              Locked in for life
            </span>
          </>
        )}
      </div>
      <div
        className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] ${darkMode ? 'text-[#9AA59B]' : 'text-gray-400'}`}
      >
        <span className="flex items-center gap-1.5">
          <span className={`font-bold ${darkMode ? 'text-gold-light' : 'text-forest'}`}>✓</span> 14-day
          money-back guarantee
        </span>
        <span className={`h-[3px] w-[3px] rounded-full ${darkMode ? 'bg-[#4C5A4D]' : 'bg-[#d4c4a8]'}`} />
        <span>Instant access</span>
        <span className={`h-[3px] w-[3px] rounded-full ${darkMode ? 'bg-[#4C5A4D]' : 'bg-[#d4c4a8]'}`} />
        <span>Cancel anytime</span>
      </div>
    </div>
  );
}

/* ─── Eyebrow label ─── */
function Eyebrow({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 text-[12.5px] font-medium uppercase tracking-[.16em] text-forest-dark before:block before:h-px before:w-[22px] before:bg-forest ${className}`}
    >
      {children}
    </span>
  );
}

/* ─── Categories data ─── */
const categories = [
  {
    name: 'Real-World Math',
    desc: 'Budgeting a grocery run, planning a meal, running a garage sale, tracking savings. Math that lives outside the workbook.',
    count: 13,
    ages: '6–14',
  },
  {
    name: 'Planning & Problem-Solving',
    desc: 'Planning a road trip, redesigning something broken, packing like a pro, building an emergency plan. Figuring things out before asking.',
    count: 14,
    ages: '6–14',
  },
  {
    name: 'Entrepreneurship',
    desc: 'Building a brand, running a pricing experiment, pitching an idea, designing a product. Real business thinking, kid-sized.',
    count: 11,
    ages: '6–14',
  },
  {
    name: 'Communication & Writing',
    desc: 'Writing a real review, interviewing a neighbour, running a family debate night, creating a mini magazine. Words that go somewhere.',
    count: 11,
    ages: '6–14',
  },
  {
    name: 'AI & Digital Literacy',
    desc: 'Spotting deepfakes, prompting AI like a coach, mapping a digital footprint, catching hallucinations. Smart kids, smarter tech habits.',
    count: 11,
    ages: '9–14',
  },
  {
    name: 'Creativity',
    desc: 'Building a Rube Goldberg machine, inventing a sport, designing a theme park, making a mini movie. Not crafts. Real making.',
    count: 10,
    ages: '6–14',
  },
  {
    name: 'Outdoor & Nature',
    desc: 'Seasonal outdoor packs, nature journals, STEM challenges, land art, learning missions. Four seasons of getting outside.',
    count: 11,
    ages: '6–14',
  },
  {
    name: 'Worldschooling',
    desc: 'Exploring currencies, interviewing locals, mapping streets, comparing everyday life across cultures. Learning that starts wherever you are.',
    count: 10,
    ages: '6–14',
  },
];

export default async function JoinPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string; reason?: string; slug?: string }>;
}) {
  // Pull live founder state. The static IS_FOUNDER_PHASE constant is still
  // used above for SEO metadata (crawlers can lag a few hours) and for the
  // module-level structured-data block — both are non-critical to flip
  // instantly. Page-visible copy below uses `m` so the founder framing
  // closes automatically the moment the 100th member is provisioned.
  const m = await import('@/lib/membership-runtime').then((x) => x.getMembership());

  // Soft banner for visitors who landed on /join from a gated entry point —
  // a PDF link they couldn't open, or /account when they have no access.
  // The download endpoint + account page redirect here with ?from=…&reason=…
  const sp = (await searchParams) || {};
  const isStarterUpgrade = sp.reason === 'starter-upgrade';
  const isNoAccess = sp.reason === 'no-access';
  const isMembershipRequired = sp.reason === 'membership-required';
  const bannerMessage = isStarterUpgrade
    ? "That activity is in the full membership. Upgrade once and unlock everything."
    : isNoAccess
      ? "Your library access has ended. Become a member to open it again."
      : isMembershipRequired
        ? "Become a member to open that activity, plus the rest of the library."
        : null;
  const productLd = {
    '@context': 'https://schema.org',
    '@type': ['Product', 'Service'],
    name: 'Anywhere Learning Membership',
    description: META_DESC,
    image: OG_IMAGE,
    brand: { '@type': 'Brand', name: 'Anywhere Learning' },
    provider: {
      '@type': 'Organization',
      name: 'Anywhere Learning',
      url: 'https://anywherelearning.co',
    },
    audience: { '@type': 'EducationalAudience', educationalRole: 'Parent' },
    offers: {
      '@type': 'Offer',
      url: PAGE_URL,
      priceCurrency: 'USD',
      price: String(MEMBERSHIP_PRICE_USD),
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: MEMBERSHIP_PRICE_USD,
        priceCurrency: 'USD',
        unitText: 'YEAR',
      },
      availability: 'https://schema.org/InStock',
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'US',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      seller: { '@type': 'Organization', name: 'Anywhere Learning' },
    },
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: joinFaqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://anywherelearning.co' },
      { '@type': 'ListItem', position: 2, name: 'Membership', item: PAGE_URL },
    ],
  };

  // Hero photo + price sticker + activity card extracted so the same block
  // can render in two places without duplicating ~50 lines of styled JSX:
  //   - desktop (md+): right column of the hero grid (unchanged)
  //   - mobile:        inline between the headline and description paragraph
  //                    (per design: hero sits between title and description)
  const HeroPhoto = () => (
    <div className="relative">
      <div className="relative aspect-[4/5] -rotate-[1.2deg] overflow-hidden rounded-[14px] border border-gray-200 bg-[#f5f0e8] shadow-[0_30px_50px_-28px_rgba(45,58,46,.3)]">
        <Image
          src="/images/join-hero.jpeg"
          alt="Young girl standing with arms crossed in front of a giant cedar tree"
          fill
          className="object-cover"
          priority
        />
      </div>
      {/* Price sticker */}
      <div
        className="absolute -right-3.5 top-8 grid h-[140px] w-[140px] rotate-[8deg] place-items-center rounded-full bg-[#c4836a] text-center text-cream shadow-[0_12px_24px_-10px_rgba(201,123,92,.5)] max-md:right-[6%] max-md:-top-5 max-md:h-[120px] max-md:w-[120px]"
        aria-hidden="true"
      >
        <div>
          <span className="block text-[13px] italic opacity-90">
            {m.isFounderPhase ? 'Founder rate' : 'Member rate'}
          </span>
          <span className="block font-display text-4xl italic max-md:text-[28px]">
            ${m.priceUSD}<span className="text-lg">/yr</span>
          </span>
          {m.isFounderPhase && (
            <span className="mt-1 block text-[11px] font-medium uppercase tracking-[.14em] opacity-85">
              (usually <s>${POST_FOUNDER_PRICE_USD}</s>)
            </span>
          )}
        </div>
      </div>
      {/* Activity card */}
      <div
        className="absolute -left-5 -bottom-5 w-[185px] rotate-[3deg] rounded-[10px] border border-gray-200 bg-cream p-3.5 pb-3 text-[13.5px] leading-snug text-gray-500 shadow-[0_18px_28px_-22px_rgba(45,58,46,.35)] max-md:left-[6%]"
        aria-hidden="true"
      >
        <strong className="mb-0.5 block font-display text-[17px] italic text-forest-dark">
          This week's activity
        </strong>
        Keep pedaling when the hill gets steep.
      </div>
    </div>
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <main className="pb-24 lg:pb-0">
        {/* ═══ Contextual banner — shown only when arriving from a gated
            download attempt (the API route redirects here with
            ?from=download&reason=...) ═══ */}
        {bannerMessage && (
          <div className="border-b border-[#c4836a]/35 bg-[#f5e1d2]/70 px-6 py-3">
            <div className="mx-auto flex max-w-[1120px] items-center justify-center gap-2 text-center text-[14px] text-[#7A3D24]">
              <span aria-hidden="true">→</span>
              <span>{bannerMessage}</span>
            </div>
          </div>
        )}

        {/* ═══ 1. HERO ═══ */}
        <section className="relative px-6 pt-10 pb-14 md:pt-10 md:pb-16">
          <div className="mx-auto grid max-w-[1120px] items-center gap-10 md:grid-cols-[1.05fr_.95fr] md:gap-16">
            {/* Copy side */}
            <div>
              {/* Founder pill */}
              <span className="inline-flex items-center gap-2 rounded-full border border-[#c4836a]/45 bg-[#f5e1d2] px-3.5 py-1.5 text-[11.5px] font-semibold uppercase tracking-[.12em] text-[#7A3D24]">
                <span className="h-1.5 w-1.5 flex-shrink-0 animate-pulse rounded-full bg-[#c4836a]" />
                <em className="not-italic font-bold text-[#c4836a]">{founderClaimed}/{FOUNDER_CAP}</em>
                <span className="opacity-70">·</span>
                Founder spots claimed
              </span>

              <div className="mt-2.5">
                <span className="inline-flex items-center gap-2.5 rounded-full border border-gray-200 bg-cream px-3.5 py-1.5 text-[13.5px] text-gray-500">
                  <span className="h-[7px] w-[7px] rounded-full bg-forest shadow-[0_0_0_0_rgba(88,129,87,.55)] animate-pulse" />
                  Built for parents who want more than great grades
                </span>
              </div>

              <h1 className="mt-5 text-balance font-display text-[clamp(40px,6vw,72px)] leading-[1.04] tracking-tight text-gray-900">
                Your kid is smart.
                <br />
                But can they{' '}
                <span className="relative whitespace-nowrap">
                  <span className="relative z-[1]">handle hard</span>
                  <span className="absolute left-[-2%] right-[-2%] bottom-[.04em] -z-0 h-[.34em] rounded-[.3em_.8em_.2em_.6em/.6em_.3em_.8em_.2em] bg-gradient-to-r from-gold/55 via-gold-light/70 to-gold/55" />
                </span>
                <em className="font-display not-italic text-forest">?</em>
              </h1>

              {/* Mobile-only hero: sits between headline and description.
                  Desktop keeps the photo block in the right column (below).
                  Extra bottom margin gives the absolutely-positioned activity
                  card room before the description paragraph. */}
              <div className="md:hidden mt-6 mb-10 px-4">
                <HeroPhoto />
              </div>

              <p className="mt-5 max-w-[540px] text-[20px] leading-relaxed text-gray-500">
                100+ guided activities that teach the life skills school
                doesn't: cooking, budgeting, self-regulation, problem-solving,
                real-world math, and more. Built by a teacher who left the
                classroom to have more time to get her kids ready for
                life. {m.price} for the year.
              </p>

              <div className="mt-8">
                <CtaBlock m={m} />
              </div>
            </div>

            {/* Photo side — desktop only. On mobile the same block renders
                inline between the headline and description above. */}
            <div className="hidden md:block">
              <HeroPhoto />
            </div>
          </div>
        </section>

        {/* ═══ 2. PROBLEM ═══ */}
        <section
          className="border-y border-gray-200 bg-[#f5f0e8] px-6 py-16 max-md:py-10"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 720px 480px at 20% 0%, rgba(255,255,255,0.55), transparent 65%), radial-gradient(ellipse 560px 380px at 90% 100%, rgba(218,209,189,0.45), transparent 70%)',
          }}
        >
          <div className="mx-auto max-w-[1120px]">
            <div className="mx-auto mb-10 max-w-[760px] text-center">
              <Eyebrow>The quiet worry</Eyebrow>
              <h2 className="mt-3.5 text-balance font-display text-[clamp(32px,4.2vw,52px)] leading-[1.08] tracking-tight">
                You're not imagining it.{' '}
                <em className="font-display not-italic text-forest">Something's missing.</em>
              </h2>
              <p className="mt-4 text-[18px] leading-relaxed text-gray-500">
                The thoughts that catch you off guard in the middle of a
                normal day.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  quote: (
                    <>
                      She got a 95 on her math test but{' '}
                      <span className="bg-gradient-to-b from-transparent from-60% to-[rgba(233,199,107,.5)] to-60% px-0.5">
                        can't make a sandwich
                      </span>{' '}
                      without asking what goes on it.
                    </>
                  ),
                  when: 'Making school lunches, Tuesday',
                },
                {
                  quote: (
                    <>
                      He fell apart because{' '}
                      <span className="bg-gradient-to-b from-transparent from-60% to-[rgba(233,199,107,.5)] to-60% px-0.5">
                        he lost a board game
                      </span>
                      . He's ten.
                    </>
                  ),
                  when: 'Family game night, Friday',
                },
                {
                  quote: (
                    <>
                      I asked her to{' '}
                      <span className="bg-gradient-to-b from-transparent from-60% to-[rgba(233,199,107,.5)] to-60% px-0.5">
                        figure it out herself
                      </span>
                      . She just stood there.
                    </>
                  ),
                  when: 'After school, Wednesday',
                },
              ].map((card, i) => (
                <article
                  key={i}
                  className="relative flex flex-col rounded-[14px] border border-gray-200 bg-cream px-7 py-7 shadow-[inset_0_1px_0_rgba(255,255,255,.5),0_14px_26px_-22px_rgba(45,58,46,.18)]"
                >
                  <span className="absolute right-5 top-4 font-display text-6xl italic leading-none text-[#c4836a]/50">
                    "
                  </span>
                  <p className="font-display text-[23px] italic leading-[1.3] text-gray-900">
                    {card.quote}
                  </p>
                  <div className="mt-auto flex items-center gap-2 border-t border-dashed border-[#d4c4a8] pt-3.5 text-[13px] text-gray-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                    {card.when}
                  </div>
                </article>
              ))}
            </div>

          </div>
        </section>

        {/* ═══ 3. SHIFT ═══ */}
        <section className="px-6 py-16 max-md:py-10">
          <div className="mx-auto max-w-[740px] text-center">
            <Eyebrow>What's changed</Eyebrow>
            <p className="mt-4 text-balance font-display text-[clamp(26px,3vw,34px)] leading-[1.35] text-gray-900">
              Today's kids are growing up{' '}
              <em className="font-display not-italic text-forest">
                more scheduled, more supervised,
              </em>{' '}
              and less life-prepared than any generation before.
            </p>
            <p className="mt-8 text-[16.5px] leading-relaxed text-gray-500">
              It's not the fault of the kids. It's not the fault of the parents.
              It's the shape of modern childhood: scheduled, screened, optimized
              for tests that don't measure whether a twelve-year-old can scramble
              an egg or talk to a stranger at a register.
            </p>
            <p className="mt-3.5 text-[16.5px] leading-relaxed text-gray-500">
              A generation ago, kids learned this stuff{' '}
              <em className="font-display italic text-forest-dark text-[18px]">
                by accident.
              </em>{' '}
              They walked to the corner store with a wrinkled five-dollar bill.
              They were bored enough to invent things. They watched a parent fix
              the sink and ended up holding the wrench.
            </p>
            <p className="mt-3.5 text-[16.5px] leading-relaxed text-gray-500">
              Today, most of that has been engineered out of the day. And it
              shows:{' '}
              <em className="font-display italic text-forest-dark text-[18px]">
                only 8% of hiring managers say Gen Z is prepared for the job.
              </em>{' '}
              The biggest gap isn't technical skill. It's communication,
              problem-solving, and knowing how to work with other people.
            </p>
            <p className="mt-3.5 text-[16.5px] leading-relaxed text-gray-500">
              The research is clear: self-regulation, executive function, and
              real-world confidence aren't built through screens or textbooks.
              They're built through practice. Cooking a meal. Managing a budget.
              Navigating a disagreement. Finishing something hard.
            </p>
            <p className="mt-3.5 text-[16.5px] leading-relaxed text-gray-500">
              This isn't a school problem or a homeschool problem. It's a
              childhood-in-2026 problem, and it's the one Anywhere Learning was
              built to close.
            </p>
            <p className="mt-5 text-[12.5px] leading-relaxed text-gray-400">
              Sources: Criteria Hiring Report, Education Endowment Foundation,
              NAEYC, Psychology Today
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-2.5">
              {[
                'For public-schoolers',
                'For homeschoolers',
                'For worldschoolers',
                'For after-school',
                'For summer',
                'For weekends',
                'For "screen time, but better"',
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-gray-200 bg-cream px-3.5 py-1.5 text-[13px] text-gray-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ 3b. FOUNDER OFFER ═══
            Only rendered while the founder phase is still open. Once the
            100th member joins, the entire section disappears so post-
            founder visitors don't see a stale "first 100" pitch. */}
        {m.isFounderPhase && (
        <section className="px-6 py-14 max-md:py-10">
          <div className="mx-auto max-w-[720px] rounded-[18px] border border-[#c4836a]/40 bg-[#f5e1d2] px-11 py-12 text-center shadow-[0_28px_50px_-32px_rgba(201,123,92,.5)] max-md:px-6 max-md:py-9">
            <Eyebrow className="text-[#7A3D24] before:bg-[#c4836a]">
              A note from Amelie
            </Eyebrow>
            <h2 className="mt-3 text-balance font-display text-[clamp(28px,3.6vw,40px)] leading-[1.14] tracking-tight text-gray-900">
              The first 100 members get a deal{' '}
              <em className="font-display italic text-[#7A3D24]">
                I can't keep offering.
              </em>
            </h2>

            <div className="mx-auto mt-4 max-w-[580px] text-left text-[16.5px] leading-[1.7] text-gray-500">
              <p className="mb-3.5">
                I'm launching Anywhere Learning Membership the way I wish more
                small businesses would: by giving the people who show up first
                something{' '}
                <em className="font-display italic text-[17.5px] text-[#7A3D24]">
                  real,
                </em>{' '}
                not a coupon code.
              </p>
              <p className="mb-3.5">
                The first {FOUNDER_CAP} members pay{' '}
                <em className="font-display italic text-[17.5px] text-[#7A3D24]">
                  ${MEMBERSHIP_PRICE_USD} a year.
                </em>{' '}
                After that, the price goes to ${POST_FOUNDER_PRICE_USD}.
              </p>
              <p className="mb-3.5">
                If you join as one of the first {FOUNDER_CAP}, your rate is{' '}
                <em className="font-display italic text-[17.5px] text-[#7A3D24]">
                  locked in for life.
                </em>{' '}
                You&apos;ll renew at ${MEMBERSHIP_PRICE_USD} every year, forever, even when new members are
                paying ${POST_FOUNDER_PRICE_USD} or more.
              </p>
              <p className="mb-3.5">
                Why ${MEMBERSHIP_PRICE_USD}? Because I&apos;d rather have {FOUNDER_CAP} families using this and
                telling me what's working than charge full price to a smaller
                group. Early members shape what this becomes.
              </p>
              <p className="mb-3.5">
                Why cap it at 100? Because when the 100th member joins, the
                price goes up and stays up. No "limited time offer" that runs
                forever.
              </p>
              <p className="font-display text-xl italic text-gray-900">
                xo,
                <br />
                Amelie
              </p>
            </div>

            {/* Progress bar */}
            <div className="mx-auto mt-8 max-w-[480px]">
              <div className="mb-2.5 flex items-center justify-between text-[13.5px] font-medium tracking-[.04em] text-gray-500">
                <span>
                  <span className="font-display text-[22px] italic text-[#c4836a]">
                    {founderClaimed}
                  </span>{' '}
                  / {FOUNDER_CAP} founding spots claimed
                </span>
                <span className="text-gray-400">{founderRemaining} spots remaining</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full border border-[#c4836a]/30 bg-white/70">
                <div className="relative h-full rounded-full bg-gradient-to-r from-[#c4836a] to-[#A85A38]" style={{ width: `${(founderClaimed / FOUNDER_CAP) * 100}%` }}>
                  <span className="absolute -right-px top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-[#c4836a] shadow-[0_0_0_3px_rgba(242,222,207,.95)]" />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <CtaBlock center m={m} />
            </div>
          </div>
        </section>
        )}

        {/* ═══ 4. INSIDE / CATEGORIES ═══ */}
        <section
          id="categories"
          className="border-y border-gray-200 bg-[#f5f0e8] px-6 py-16 max-md:py-10"
        >
          <div className="mx-auto max-w-[1120px]">
            <div className="mx-auto mb-10 max-w-[760px] text-center">
              <Eyebrow>What's inside</Eyebrow>
              <h2 className="mt-3.5 text-balance font-display text-[clamp(32px,4.2vw,52px)] leading-[1.08] tracking-tight">
                100+ activities.{' '}
                <em className="font-display not-italic text-forest">One yes.</em>
              </h2>
              <p className="mt-4 text-[18px] leading-relaxed text-gray-500">
                Families use these activities to budget a grocery run, plan a
                Saturday on public transit, finish hard puzzles, and survive
                rainy afternoons with something better than a screen. The
                categories below are how we organize them, but the point is the
                doing, not the taxonomy.
              </p>
            </div>

            {/* Stats row */}
            <div className="mb-8 flex flex-wrap justify-center gap-x-11 gap-y-5">
              {[
                { n: '8', label: 'Categories' },
                { n: '100+', label: 'Activities' },
                { n: '6–14', label: 'Ages' },
                { n: '3', label: 'Levels each' },
                { n: 'Quarterly', label: 'New additions' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <span className="block font-display text-[46px] italic leading-none text-forest">
                    {stat.n}
                  </span>
                  <span className="mt-2 block text-[12.5px] uppercase tracking-[.12em] text-gray-400">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Category grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <article
                  key={cat.name}
                  className="rounded-[14px] border border-gray-200 bg-cream px-5 py-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-20px_rgba(45,58,46,.25)]"
                >
                  <h3 className="mb-2 font-display text-2xl leading-tight tracking-tight text-gray-900">
                    {cat.name}
                  </h3>
                  <p className="text-[14.5px] leading-relaxed text-gray-500">
                    {cat.desc}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-dashed border-[#d4c4a8] pt-3.5 text-[12.5px] text-gray-400">
                    <span>{cat.count} activities</span>
                    <span className="rounded-full bg-[#E6EBDF] px-2.5 py-0.5 text-xs font-medium text-forest-dark">
                      Ages {cat.ages}
                    </span>
                  </div>
                </article>
              ))}
            </div>

            {/* Coming soon note */}
            <p className="mt-6 text-center text-[14px] text-gray-400">
              More categories coming soon.
            </p>

            {/* Levels note */}
            <div className="mt-9 flex flex-wrap items-center justify-between gap-5 rounded-[14px] border border-gray-200 bg-cream px-6 py-5">
              <p className="min-w-[280px] flex-1 font-display text-xl italic leading-snug text-gray-900">
                Every activity comes in{' '}
                <b className="not-italic font-medium text-forest-dark">
                  three levels
                </b>{' '}
                :{' '}
                <b className="not-italic font-medium text-forest-dark">
                  Explore
                </b>{' '}
                for getting started,{' '}
                <b className="not-italic font-medium text-forest-dark">
                  Develop
                </b>{' '}
                for building confidence,{' '}
                <b className="not-italic font-medium text-forest-dark">
                  Extend
                </b>{' '}
                for going deeper. Bring siblings to the same kitchen counter
                without anyone feeling overwhelmed or under-challenged.
              </p>
              <div className="flex gap-2">
                {['Explore', 'Develop', 'Extend'].map((level) => (
                  <span
                    key={level}
                    className="rounded-full bg-[#E6EBDF] px-3.5 py-1.5 text-[12.5px] font-medium tracking-[.02em] text-forest-dark"
                  >
                    {level}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 5. HOW IT WORKS ═══ */}
        <section className="px-6 py-16 max-md:py-10">
          <div className="mx-auto max-w-[1120px]">
            <div className="mx-auto mb-10 max-w-[760px] text-center">
              <Eyebrow>How it works</Eyebrow>
              <h2 className="mt-3.5 text-balance font-display text-[clamp(32px,4.2vw,52px)] leading-[1.08] tracking-tight">
                Three steps.{' '}
                <em className="font-display not-italic text-forest">
                  That's it.
                </em>
              </h2>
              <p className="mt-4 text-[18px] leading-relaxed text-gray-500">
                No printing. No prep nights. No new app to learn at 10pm. Open
                it, pick something, do it together.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  num: 'i',
                  title: 'Join',
                  desc: `One payment, ${m.price}. Instant access to all categories and the full library. Works on any phone, tablet or laptop.`,
                },
                {
                  num: 'ii',
                  title: 'Browse',
                  desc: "Pick by mood, by weather, by what's in the fridge, or by what your kid needs to grow into next. Browse by category and jump in.",
                },
                {
                  num: 'iii',
                  title: 'Do it together',
                  desc: 'Each activity has a short parent prep, a clear walkthrough, and the "what to say when they get stuck" script. Then you go live it.',
                },
              ].map((step) => (
                <div
                  key={step.num}
                  className="rounded-[14px] border border-gray-200 bg-cream px-7 py-7"
                >
                  <div className="mb-4 grid h-[50px] w-[50px] place-items-center rounded-full border border-forest bg-[#E6EBDF] font-display text-[26px] italic text-forest-dark">
                    {step.num}
                  </div>
                  <h3 className="mb-2 font-display text-[28px] leading-tight tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-[15.5px] leading-relaxed text-gray-500">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ 7. TESTIMONIALS (placeholder structure) ═══ */}
        <section className="px-6 py-16 max-md:py-10">
          <div className="mx-auto max-w-[1120px]">
            <div className="mx-auto mb-10 max-w-[760px] text-center">
              <Eyebrow>Parents talking</Eyebrow>
              <h2 className="mt-3.5 text-balance font-display text-[clamp(32px,4.2vw,52px)] leading-[1.08] tracking-tight">
                From the families{' '}
                <em className="font-display not-italic text-forest">
                  already doing this.
                </em>
              </h2>
              <p className="mt-4 text-[18px] leading-relaxed text-gray-500">
                Real outcomes, not "love this app!!" reviews. We ask parents to
                tell us about their kid, not the product.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {[
                {
                  text: "Honestly thought they'd hate it. We picked a recipe together, she had the list and bossed me around the aisles, then all three of us were in the kitchen fighting over the measuring cups. It was messy but we laughed a lot.",
                  initials: 'ML',
                  name: 'Marie-Eve · Alberta · Girl 8, boy 12',
                  tilt: '-rotate-[.55deg]',
                },
                {
                  text: "My fifteen-year-old is hard to impress and she pulled me in to brainstorm with her. Her sister joined. We sat at the kitchen table for over an hour just talking and figuring it out together. I learned things about her I didn't know.",
                  initials: 'LD',
                  name: 'Laura · Quebec · Girl 12, girl 15',
                  tilt: 'rotate-[.5deg]',
                },
                {
                  text: "My boys and I planned a whole day out together with a real budget. They argued about the arcade versus mini golf for a solid twenty minutes. I just kept asking questions, they kept solving them. We ended up squeezing in both.",
                  initials: 'DL',
                  name: 'Diana · Texas · Boy 10, boy 13',
                  tilt: 'rotate-[.5deg]',
                },
                {
                  text: "She actually enjoyed the hike this time. I didn't have to cheer her up the whole way up, she was busy looking for stuff on the cards. We talked the entire walk back down. It was a nice moment.",
                  initials: 'CS',
                  name: 'Christine · British Columbia · Girl 10',
                  tilt: '-rotate-[.55deg]',
                },
              ].map((card, i) => (
                <article
                  key={i}
                  className={`flex flex-col rounded-[14px] border border-forest/15 bg-[#E6EBDF] px-6 py-7 shadow-[0_12px_24px_-22px_rgba(45,58,46,.2)] ${card.tilt}`}
                >
                  <div className="mb-2.5 font-display text-lg italic tracking-wider text-[#c4836a]">
                    ★★★★★
                  </div>
                  <blockquote className="font-display text-xl italic leading-[1.35] text-gray-900">
                    &ldquo;{card.text}&rdquo;
                  </blockquote>
                  <div className="mt-4 flex items-center gap-2.5 border-t border-dashed border-[#d4c4a8] pt-3.5 text-[13.5px] text-gray-400">
                    <span className="grid h-[30px] w-[30px] place-items-center rounded-full border border-gray-200 bg-gradient-to-br from-[#e8dcc8] to-[#d4c4a8] text-xs font-semibold text-gray-500">
                      {card.initials}
                    </span>
                    {card.name}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ 7b. PICTURE A SATURDAY ═══ */}
        <section
          className="border-y border-gray-200 bg-[#f5f0e8] px-6 py-16 max-md:py-10"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 700px 440px at 50% 0%, rgba(255,255,255,0.6), transparent 65%), radial-gradient(ellipse 520px 360px at 80% 100%, rgba(235,205,179,0.3), transparent 70%)',
          }}
        >
          <div className="mx-auto max-w-[720px] text-center">
            <Eyebrow>What this actually looks like</Eyebrow>
            <p className="mt-4 text-balance font-display text-[clamp(26px,3vw,34px)] leading-[1.35] text-gray-900">
              Picture a Saturday{' '}
              <em className="font-display not-italic text-forest">
                in three months.
              </em>
            </p>
            <p className="mt-8 text-[16.5px] leading-relaxed text-gray-500">
              It's a regular afternoon. You pull up an activity on your phone
              and walk her through the first step. Today it's{' '}
              <em className="font-display italic text-forest-dark text-[18px]">
                planning dinner.
              </em>
            </p>
            <p className="mt-3.5 text-[16.5px] leading-relaxed text-gray-500">
              She checks the fridge, writes the list, does the math at the
              store. You're there if she gets stuck, but she's the one figuring
              it out. Back home, she reads the recipe and cooks. You help when
              she asks. Dinner is fine.{' '}
              <em className="font-display italic text-forest-dark text-[18px]">
                The point isn't dinner.
              </em>
            </p>
            <p className="mt-3.5 text-[16.5px] leading-relaxed text-gray-500">
              The point is: she did it. You guided her the first time. Next
              month, she'll do it on her own. That's how life skills actually
              stick. Not from a lecture, not from a worksheet. From doing real
              things, with someone nearby who lets them try.
            </p>
            <p className="mt-7">
              <em className="font-display text-[22px] italic text-forest-dark">
                That&apos;s what&apos;s on the other side of {m.price}.
              </em>
            </p>

          </div>
        </section>

        {/* ═══ 8. FAQ ═══ */}
        <section className="px-6 py-16 max-md:py-10">
          <div className="mx-auto max-w-[760px]">
            <div className="mx-auto mb-9 max-w-[760px] text-center">
              <Eyebrow>Real questions, honest answers</Eyebrow>
              <h2 className="mt-3.5 text-balance font-display text-[clamp(32px,4.2vw,52px)] leading-[1.08] tracking-tight">
                The things{' '}
                <em className="font-display not-italic text-forest">
                  parents actually ask.
                </em>
              </h2>
            </div>
            <JoinFaqAccordion />
          </div>
        </section>

        {/* ═══ 10. FINAL CTA ═══ */}
        <section
          className="border-t border-[#E8D4C2] bg-[#F7EBE2] px-6 py-16 text-center max-md:py-10"
          id="checkout"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 760px 480px at 50% 0%, rgba(255,255,255,0.55), transparent 65%), radial-gradient(ellipse 600px 420px at 50% 100%, rgba(232,196,170,0.4), transparent 70%)',
          }}
        >
          <div className="mx-auto max-w-[740px]">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-[#c4836a]/45 bg-[#f5e1d2] px-4 py-2 text-[12.5px] font-semibold uppercase tracking-[.14em] text-[#7A3D24]">
              <span className="h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-[#c4836a]" />
              Only <em className="not-italic font-bold text-[#c4836a]">{founderRemaining}</em>{' '}
              founding spots left
            </span>

            <h2 className="mt-4 text-balance font-display text-[clamp(38px,5.2vw,64px)] leading-[1.06] tracking-tight">
              Your kids are{' '}
              <em className="font-display not-italic text-forest">
                only this age once.
              </em>
            </h2>

            <p className="mt-5 text-[18px] leading-relaxed text-gray-500">
              Another year of "I should really do more with them," or{' '}
              <strong className="font-display italic text-[22px] text-[#c4836a]">
                ninety-nine dollars and a Saturday afternoon
              </strong>{' '}
              where your kid builds a budget, plans a road trip, or starts a business from the kitchen table.
              <br />
              <br />
              {m.isFounderPhase && (
                <span className="font-display italic text-[18px] text-[#c4836a]">
                  Founder rate ({m.priceYear}, locked in for life) ends at {m.founderCap} members.
                  After that, ${POST_FOUNDER_PRICE_USD}.
                </span>
              )}
            </p>

            <div className="mt-9 flex justify-center">
              <CtaBlock center m={m} />
            </div>

            <p className="mt-4 font-display text-sm italic text-gray-400">
              Worst case: you get {MEMBERSHIP_PRICE} back. Best case: your
              twelve-year-old plans dinner, and you locked in this rate forever.
            </p>
          </div>
        </section>
      </main>

      <StickyFounderBar claimed={founderClaimed} cap={FOUNDER_CAP} />
    </>
  );
}
