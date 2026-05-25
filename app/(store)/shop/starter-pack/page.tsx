import type { Metadata } from 'next';
import Link from 'next/link';
import ScrollReveal from '@/components/shared/ScrollReveal';
import CheckoutButton from '@/components/checkout/CheckoutButton';
import {
  IS_FOUNDER_PHASE,
  MEMBERSHIP_PRICE_YEAR,
  MEMBERSHIP_PRICE_YR,
  JOIN_CTA_LABEL,
} from '@/lib/membership';

export const metadata: Metadata = {
  title: 'The Starter Pack',
  description:
    '10 of our favorite activities + the Future-Ready Skills Map. $44.99 one-time. The first chapter of the Anywhere Learning library.',
  alternates: { canonical: 'https://anywherelearning.co/shop/starter-pack' },
  openGraph: {
    title: 'The Starter Pack | Anywhere Learning',
    description:
      '10 of our favorite activities + the Future-Ready Skills Map. $44.99 one-time, yours forever.',
    url: 'https://anywherelearning.co/shop/starter-pack',
    type: 'website',
  },
};

const starterPackLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'The Starter Pack',
  description:
    '10 of our favorite digital activity guides + the Future-Ready Skills Map parent guide. The first chapter of the Anywhere Learning library.',
  url: 'https://anywherelearning.co/shop/starter-pack',
  brand: { '@type': 'Brand', name: 'Anywhere Learning' },
  offers: {
    '@type': 'Offer',
    price: '44.99',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: ['US', 'CA', 'GB', 'AU', 'NZ'],
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 14,
      returnPolicyUrl: 'https://anywherelearning.co/terms#s4',
    },
  },
};

// Per-track colors — match the library spine palette on /shop exactly.
const TRACK_COLORS: Record<string, { color: string; soft: string }> = {
  'Real-World Math':            { color: '#588157', soft: '#E6EBDF' },
  'Entrepreneurship':           { color: '#C97B5C', soft: '#F2DECF' },
  'AI & Digital Literacy':      { color: '#B6913F', soft: '#F5E7BC' },
  'Communication & Writing':    { color: '#3A5A40', soft: '#CFDCC4' },
  'Planning & Problem-Solving': { color: '#588157', soft: '#E6EBDF' },
  'Creativity & Maker':         { color: '#C97B5C', soft: '#F2DECF' },
  'Outdoor & Nature':           { color: '#3A5A40', soft: '#CFDCC4' },
  'Worldschooling':             { color: '#8A8470', soft: '#DAD7CD' },
};

const activities = [
  {
    title: 'Write It Like a Pro',
    track: 'Communication & Writing',
    meta: 'Ages 9 to 14',
    desc: 'Real-world writing — emails, complaints, requests, persuasion. The kind that gets results.',
  },
  {
    title: 'Community Tour Guide',
    track: 'Communication & Writing',
    meta: 'Ages 6 to 14',
    desc: 'Kids write a guided tour of their own community. Voice, pacing, local storytelling.',
  },
  {
    title: 'Media & Info Check',
    track: 'AI & Digital Literacy',
    meta: 'Ages 9 to 14',
    desc: 'Check sources, spot bias, verify a claim before trusting it. Critical thinking for the AI age.',
  },
  {
    title: 'AI Basics: Myths, Facts & Smart Rules',
    track: 'AI & Digital Literacy',
    meta: 'Ages 9 to 14',
    desc: 'What AI actually is, what it cannot do, and how to use it without losing your judgment.',
  },
  {
    title: 'Micro-Business Challenge',
    track: 'Entrepreneurship',
    meta: 'Ages 9 to 14',
    desc: 'Plan, launch, run a real micro-business. Find customers, set prices, deliver, count profit.',
  },
  {
    title: 'Real-Life Budget Challenge',
    track: 'Real-World Math',
    meta: 'Ages 9 to 14',
    desc: 'Kids pick a real family weekend, set a budget, plan dinner, an outing, a small splurge.',
  },
  {
    title: 'Smart Shopper Lab',
    track: 'Real-World Math',
    meta: 'Ages 9 to 14',
    desc: 'Compare prices, read labels, make real purchasing calls. Unit pricing in their own hands.',
  },
  {
    title: 'Board Game Studio',
    track: 'Creativity & Maker',
    meta: 'Ages 6 to 14',
    desc: 'Design, build, and playtest an original board game. Systems thinking, iteration in action.',
  },
  {
    title: 'Create a Creature + Build Its Habitat',
    track: 'Creativity & Maker',
    meta: 'Ages 6 to 14',
    desc: 'Invent a creature, then build the habitat it would actually need. Biology meets design.',
  },
  {
    title: 'Problem-Solver Studio',
    track: 'Planning & Problem-Solving',
    meta: 'Ages 9 to 14',
    desc: 'Identify, brainstorm, prototype, test, iterate. Design thinking in five steps kids walk through.',
  },
];

const testimonials = [
  {
    initials: 'JS',
    name: 'Jess',
    city: 'Portland, OR',
    role: 'Mom of three',
    quote:
      "I bought it on a Tuesday night thinking I'd try one or two. By Sunday we'd done four. By the end of the second week I'd upgraded to the membership.",
  },
  {
    initials: 'MA',
    name: 'Marcus',
    city: 'Atlanta, GA',
    role: 'Dad of two',
    quote:
      "The Skills Map was the part I didn't expect. It explained why I'd been feeling that life-skills gap, and what to actually do about it.",
  },
  {
    initials: 'PR',
    name: 'Priya',
    city: 'Toronto, ON',
    role: 'Mom of one',
    quote:
      "My 8-year-old planned dinner on day three. The kid hasn't cooked a meal in his life. I'm not exaggerating, I cried a little.",
  },
];

const faqs = [
  {
    q: "What's the difference between this and the membership?",
    a: `The Starter Pack is 10 of our favorite activities plus the Skills Map for $44.99 once, yours forever. The membership is ${MEMBERSHIP_PRICE_YEAR}${IS_FOUNDER_PHASE ? ' (founder rate)' : ''} and unlocks all 100+ activities, plus new ones every quarter. If you'd want to keep doing real-world learning for a year or more, the membership is the better deal. The Starter Pack is the way to test-drive the library first.`,
  },
  {
    q: 'How long does it take to do all 10 activities?',
    a: 'Most families work through the Starter Pack over 4 to 8 weeks, doing one or two activities a weekend. Some families blitz it in a month, some take a whole summer. There is no order, no schedule, no pressure. Pick the one that fits the day.',
  },
  {
    q: "What if my kids don't like it?",
    a: "14-day money-back guarantee. Email us within 14 days of buying and we will refund you in full. No questions, no friction. We'd rather you get your $44.99 back than feel grumpy about it.",
  },
  {
    q: 'Will I get charged again later?',
    a: "No. The Starter Pack is a one-time purchase. It is not a subscription. You won't see anything from us on your card again unless you choose to upgrade to the membership later.",
  },
];

// Skills Map "book cover" — used in hero + what's inside
function SkillsMapCover({
  className = '',
  size = 'lg',
}: {
  className?: string;
  size?: 'lg' | 'md';
}) {
  const padding = size === 'lg' ? 'p-7' : 'p-6';
  const titleSize = size === 'lg' ? 'text-[28px] md:text-[30px]' : 'text-[22px]';
  const topSize = size === 'lg' ? 'text-[11px]' : 'text-[10px]';
  return (
    <div
      className={`relative overflow-hidden rounded-[12px] text-cream flex flex-col justify-between ${padding} ${className}`}
      style={{
        background: 'linear-gradient(180deg, #3A5A40 0%, #588157 100%)',
      }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 100% 0%, rgba(233,199,107,0.18), transparent 60%), repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 1.5px, transparent 1.5px 12px)',
        }}
      />
      <span
        className={`relative font-body font-semibold uppercase tracking-[0.22em] ${topSize} opacity-85`}
      >
        A parent guide
      </span>
      <svg
        aria-hidden="true"
        viewBox="0 0 80 80"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`relative self-center my-2 ${size === 'lg' ? 'w-[80px] h-[80px]' : 'w-[60px] h-[60px]'} text-[#E9C76B]`}
      >
        <circle cx="40" cy="40" r="14" />
        <line x1="40" y1="18" x2="40" y2="8" />
        <line x1="40" y1="72" x2="40" y2="62" />
        <line x1="18" y1="40" x2="8" y2="40" />
        <line x1="72" y1="40" x2="62" y2="40" />
        <line x1="25" y1="25" x2="18" y2="18" />
        <line x1="55" y1="55" x2="62" y2="62" />
        <line x1="25" y1="55" x2="18" y2="62" />
        <line x1="55" y1="25" x2="62" y2="18" />
      </svg>
      <div className="relative">
        <h3 className={`font-display tracking-tight leading-[1.05] text-cream ${titleSize}`}>
          The Future-Ready{' '}
          <em className="not-italic italic" style={{ color: '#E9C76B' }}>
            Skills Map
          </em>
        </h3>
        <p className="mt-2 font-display italic text-[14px] opacity-90 m-0">
          A parent&apos;s framework for real-world learning.
        </p>
      </div>
      <span className="relative font-body font-semibold uppercase tracking-[0.18em] text-[10.5px] opacity-80">
        Anywhere Learning
      </span>
    </div>
  );
}

// Mini activity preview card (3 of these float around the hero)
function ActivityPreviewCard({
  bandColor,
  className,
}: {
  bandColor: string;
  className: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`absolute rounded-[10px] bg-cream border border-[#D8D4C5] overflow-hidden shadow-[0_20px_36px_-22px_rgba(45,58,46,0.42)] ${className}`}
    >
      <div className="h-[42%]" style={{ background: bandColor }} />
      <div className="px-3.5 py-2.5 flex flex-col gap-1.5">
        <div className="h-1.5 rounded-[3px] bg-[#F2EFE4] w-[75%]" />
        <div className="h-1.5 rounded-[3px] bg-[#F2EFE4] w-[55%]" />
      </div>
    </div>
  );
}

export default function StarterPackPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(starterPackLd) }}
      />
      <main className="bg-cream">
        {/* BREADCRUMB */}
        <div className="bg-[#F2EFE4] border-b border-[#D8D4C5]">
          <div className="mx-auto max-w-[1180px] px-6">
            <nav
              aria-label="Breadcrumb"
              className="py-3.5 flex flex-wrap items-center gap-2.5 text-[13px] text-gray-500"
            >
              <Link
                href="/shop"
                className="text-gray-600 hover:text-forest-dark transition-colors no-underline"
              >
                Library
              </Link>
              <span aria-hidden="true" className="text-[#C9C5B7]">&rsaquo;</span>
              <span className="text-gray-500">The Starter Pack</span>
            </nav>
          </div>
        </div>

        {/* 01 HERO */}
        <section className="bg-cream pt-10 md:pt-16 lg:pt-20 pb-8 md:pb-12 lg:pb-16">
          <div className="mx-auto max-w-[1180px] px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-5 lg:gap-20 lg:items-center">
              {/* MOBILE-ONLY title — shows before the hero on small screens */}
              <ScrollReveal direction="right" className="lg:hidden">
                <div className="text-center">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7A3D24] inline-flex items-center gap-2.5">
                    <span className="w-[22px] h-px bg-[#C97B5C] inline-block" />
                    The Starter Pack
                  </p>
                  <h1 className="font-display text-[clamp(2.125rem,5.4vw,4rem)] leading-[1.04] tracking-tight mt-3 text-balance">
                    The complete first chapter{' '}
                    <span className="italic text-forest">of the library.</span>
                  </h1>
                </div>
              </ScrollReveal>

              {/* HERO VISUAL — col 2 on desktop, between title and rest on mobile */}
              <ScrollReveal direction="left" delay={100} className="lg:col-start-2 lg:row-span-1">
                <div className="flex flex-col gap-6 max-lg:max-w-[440px] max-lg:mx-auto max-lg:w-full">
                <div
                  aria-hidden="true"
                  className="relative w-full min-h-[340px] lg:min-h-[420px]"
                  style={{ aspectRatio: '5 / 4.5' }}
                >
                  {/* Skills Map cover — real PDF image on the left */}
                  <div
                    className="absolute z-[3] rounded-[12px] overflow-hidden border border-[#D8D4C5]"
                    style={{
                      left: '8%',
                      top: '6%',
                      width: '62%',
                      aspectRatio: '3 / 4',
                      transform: 'rotate(-3deg)',
                      boxShadow: '0 30px 60px -28px rgba(45,58,46,0.5)',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/skills-map-cover.jpg"
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                  </div>

                  {/* 3 floating activity cover images on the right */}
                  <div
                    aria-hidden="true"
                    className="absolute rounded-[10px] overflow-hidden border border-[#D8D4C5] shadow-[0_20px_36px_-22px_rgba(45,58,46,0.42)] z-[2] bg-cream"
                    style={{ right: '4%', top: '6%', width: '38%', aspectRatio: '4/5', transform: 'rotate(5deg)' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/products/write-like-a-pro.jpg"
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                  </div>
                  <div
                    aria-hidden="true"
                    className="absolute rounded-[10px] overflow-hidden border border-[#D8D4C5] shadow-[0_20px_36px_-22px_rgba(45,58,46,0.42)] z-[1] bg-cream"
                    style={{ right: '16%', top: '32%', width: '38%', aspectRatio: '4/5', transform: 'rotate(-4deg)' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/products/micro-business.jpg"
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                  </div>
                  <div
                    aria-hidden="true"
                    className="absolute rounded-[10px] overflow-hidden border border-[#D8D4C5] shadow-[0_20px_36px_-22px_rgba(45,58,46,0.42)] z-[2] bg-cream"
                    style={{ right: 0, bottom: '4%', width: '38%', aspectRatio: '4/5', transform: 'rotate(3deg)' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/products/ai-basics.jpg"
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                  </div>

                  {/* Activity cover peeking behind Skills Map (bottom-left) */}
                  <div
                    aria-hidden="true"
                    className="absolute rounded-[10px] overflow-hidden border border-[#D8D4C5] shadow-[0_20px_36px_-22px_rgba(45,58,46,0.42)] bg-cream z-[2]"
                    style={{
                      left: '-10%',
                      bottom: '8%',
                      width: '38%',
                      aspectRatio: '4/5',
                      transform: 'rotate(-7deg)',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/products/board-game-studio.jpg"
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                  </div>

                  {/* Price sticker */}
                  <div
                    aria-hidden="true"
                    className="absolute z-[5] rounded-full grid place-items-center text-cream text-center"
                    style={{
                      right: '-2%',
                      bottom: '-2%',
                      width: '110px',
                      height: '110px',
                      background: '#C97B5C',
                      transform: 'rotate(8deg)',
                      boxShadow: '0 16px 26px -10px rgba(201,123,92,0.55)',
                      padding: '10px',
                    }}
                  >
                    <div>
                      <span className="block font-display text-[24px] leading-none">$44.99</span>
                      <span className="block font-body uppercase tracking-[0.16em] text-[9.5px] mt-1 opacity-95 font-semibold">
                        One-time
                      </span>
                    </div>
                  </div>
                </div>

                </div>
              </ScrollReveal>

              {/* Title + description + price + CTA + trust — col 1 on desktop, after hero on mobile */}
              <ScrollReveal direction="right" delay={50} className="lg:col-start-1 lg:row-start-1">
                <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
                  {/* DESKTOP-ONLY title (mobile uses the dedicated block above) */}
                  <div className="hidden lg:block">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7A3D24] inline-flex items-center gap-2.5">
                      <span className="w-[22px] h-px bg-[#C97B5C] inline-block" />
                      The Starter Pack
                    </p>
                    <h1 className="font-display text-[clamp(2.375rem,5.4vw,4rem)] leading-[1.04] tracking-tight mt-3 text-balance mb-5">
                      The complete first chapter{' '}
                      <span className="italic text-forest">of the library.</span>
                    </h1>
                  </div>

                  <p className="text-[16.5px] md:text-[18.5px] leading-[1.55] text-gray-600 max-w-[560px]">
                    10 of our favorite activities across six categories, plus the Future-Ready
                    Skills Map: a parent guide that ties the whole library together. One-time
                    purchase, yours forever.
                  </p>

                  <div className="mt-6 flex items-center justify-center lg:justify-start gap-5 flex-wrap">
                    <div className="font-display text-[clamp(2.75rem,5vw,3.75rem)] leading-none text-ink">
                      $44.99
                    </div>
                    <div className="text-[13.5px] text-gray-500 leading-[1.5] text-left">
                      One-time
                      <br />
                      Instant download
                      <br />
                      14-day refund guarantee
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3.5">
                    <CheckoutButton
                      kind="starter-pack"
                      className="inline-flex items-center gap-2.5 bg-forest text-cream font-semibold py-4 px-7 rounded-xl text-[16px] shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_-1px_0_rgba(0,0,0,0.10)_inset,0_12px_26px_-14px_rgba(58,90,64,0.55)] hover:bg-forest-dark hover:-translate-y-px transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <span className="inline-flex items-center gap-2.5">
                        Get the Starter Pack
                        <span className="inline-grid place-items-center w-[22px] h-[22px] rounded-full bg-white/[0.18]">
                          &rarr;
                        </span>
                      </span>
                    </CheckoutButton>
                  </div>

                  <p className="mt-4 inline-flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1 text-[13px] text-gray-500">
                    <span>Works on any device</span>
                    <span className="w-[3px] h-[3px] rounded-full bg-[#C9C5B7]" aria-hidden="true" />
                    <span>No subscription</span>
                    <span className="w-[3px] h-[3px] rounded-full bg-[#C9C5B7]" aria-hidden="true" />
                    <span>Members get this included</span>
                  </p>

                  {/* Credit reassurance: lowers commitment anxiety for buyers
                      who are deciding between Starter Pack and full membership.
                      Frames the Starter Pack as risk-free first step. */}
                  <p
                    className="mt-3 inline-flex items-start gap-2 rounded-lg border px-3 py-2 text-[13px] leading-snug text-forest-dark"
                    style={{
                      background: '#E6EBDF',
                      borderColor: '#C9D3BE',
                      maxWidth: 460,
                    }}
                  >
                    <span aria-hidden="true" className="mt-px font-semibold">✓</span>
                    <span>
                      Want the full library later? Your{' '}
                      <strong>$45 Starter Pack credits</strong> toward your first year of
                      membership. Sign in with the same account at checkout to apply it.
                    </span>
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* 02 PROMISE */}
        <section className="bg-[#F2EFE4] border-t border-[#D8D4C5] py-20 md:py-20 text-center">
          <div className="mx-auto max-w-[760px] px-6">
            <ScrollReveal>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                <span className="w-[22px] h-px bg-forest inline-block" />
                What it is
              </p>
              <h2 className="mt-3.5 font-display text-[clamp(1.875rem,3.8vw,2.75rem)] leading-[1.08] tracking-tight text-balance">
                The fastest way to find out if real-world learning{' '}
                <span className="italic text-forest">works for your family.</span>
              </h2>
              <div className="mt-6 text-[17.5px] leading-[1.7] text-gray-600 text-pretty space-y-4 max-w-[640px] mx-auto">
                <p>
                  Most parents I talk to know they want their kids doing more real-world stuff. They
                  just don&apos;t know where to start, what to do first, or whether their kid will
                  actually go for it.
                </p>
                <p>
                  The Starter Pack solves all three problems at once. Our ten favorite activities,
                  a mix from six categories of the library. Plus the Future-Ready Skills Map:
                  the framework that explains what these activities build and why each one matters.
                  Done in any order, over a weekend, a month, or a summer. Your call.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 03 WHAT'S INSIDE — 2-column: Skills Map card + Activities card */}
        <section className="bg-cream py-20 md:py-20">
          <div className="mx-auto max-w-[1080px] px-6">
            <ScrollReveal>
              <div className="max-w-[720px] mx-auto text-center mb-12">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                  <span className="w-[22px] h-px bg-forest inline-block" />
                  What&apos;s inside
                </p>
                <h2 className="mt-3.5 font-display text-[clamp(1.875rem,3.8vw,2.875rem)] leading-[1.08] tracking-tight text-balance">
                  Ten activities. One framework.{' '}
                  <span className="italic text-forest">Yours forever.</span>
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-10 items-stretch">
              {/* Left column: Skills Map card + Why this mix card stacked */}
              <ScrollReveal className="h-full">
                <div className="h-full flex flex-col gap-8">
                  {/* Skills Map card */}
                  <div className="bg-cream border border-[#D8D4C5] rounded-[14px] p-8 shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_22px_40px_-28px_rgba(45,58,46,0.3)]">
                    <div className="max-w-[420px] mx-auto w-full mb-6">
                      <div className="relative aspect-[3/4] rounded-[12px] overflow-hidden border border-[#D8D4C5] shadow-[0_22px_40px_-28px_rgba(45,58,46,0.4)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/skills-map-cover.jpg"
                          alt="The Future-Ready Skills Map parent guide cover"
                          className="absolute inset-0 w-full h-full object-cover object-top"
                        />
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-forest-dark mb-2 block">
                      Included &middot; The framework
                    </span>
                    <h3 className="font-display text-[24px] leading-tight tracking-tight text-ink mb-2.5">
                      The Future-Ready{' '}
                      <span className="italic text-forest-dark">Skills Map</span>
                    </h3>
                    <p className="text-[15.5px] leading-[1.6] text-gray-600 m-0 mb-3.5">
                      A parent guide mapping the essential skills your kids actually need, by age,
                      with milestones, sample weeks, and how each activity in the library fits. The
                      roadmap that turns activities into purposeful learning.
                    </p>
                    <p className="m-0 font-display italic text-[14.5px] text-[#C97B5C]">
                      Included in the Starter Pack and the membership.
                    </p>
                  </div>

                  {/* Why this mix — Amelie's quote, its own card below */}
                  <div className="bg-[#F2EFE4] border border-[#D8D4C5] rounded-[14px] p-8">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C97B5C] mb-3">
                      Why this mix
                    </span>
                    <p className="font-display italic text-[16px] leading-[1.5] text-gray-600 text-pretty m-0">
                      &ldquo;I picked these ten for one reason: they consistently turn
                      &lsquo;meh&rsquo; into{' '}
                      <span className="text-ink not-italic italic">
                        &lsquo;wait, I want to do that again.&rsquo;
                      </span>{' '}
                      A mix from six categories so you see the range. By the time you&apos;ve
                      done four or five, you know whether this is your family&apos;s thing.&rdquo;
                    </p>
                    <p className="mt-3 font-display italic text-[14.5px] text-[#C97B5C] m-0">
                      &mdash; Amelie
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Activities card */}
              <ScrollReveal className="h-full" delay={80}>
                <div className="h-full bg-cream border border-[#D8D4C5] rounded-[14px] p-6 shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_22px_40px_-28px_rgba(45,58,46,0.3)]">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-forest-dark mb-2.5 pb-2.5 border-b border-[#D8D4C5]">
                    Included &middot; 10 activities
                  </div>
                  <ul className="list-none p-0 m-0 flex flex-col gap-1.5">
                    {activities.map((a, i) => {
                      const theme = TRACK_COLORS[a.track] || { color: '#588157', soft: '#E6EBDF' };
                      return (
                        <li
                          key={i}
                          className="grid grid-cols-[20px_1fr_auto] gap-3 px-3.5 py-2.5 items-start rounded-[10px] max-sm:grid-cols-[18px_1fr]"
                          style={{ background: theme.soft }}
                        >
                          <span
                            className="w-[18px] h-[18px] rounded-full grid place-items-center text-[10px] font-bold mt-[2px] bg-cream"
                            style={{ color: theme.color }}
                          >
                            ✓
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span
                              className="font-body font-semibold uppercase tracking-[0.14em] text-[10px]"
                              style={{ color: theme.color }}
                            >
                              {a.track}
                            </span>
                            <span className="font-display italic text-[16px] leading-[1.2] text-ink mt-0.5">
                              {a.title}
                            </span>
                            <span className="text-[12.5px] leading-[1.4] text-gray-700 mt-1">
                              {a.desc}
                            </span>
                          </div>
                          <span className="font-medium text-[11.5px] text-gray-600 whitespace-nowrap self-start text-right max-sm:col-span-2 max-sm:pl-[28px] max-sm:text-left max-sm:mt-[-2px] pt-[2px]">
                            {a.meta}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* 05 MID CTA */}
        <section className="bg-cream py-8">
          <div className="flex flex-col items-center gap-3.5">
            <CheckoutButton
              kind="starter-pack"
              className="inline-flex items-center gap-2.5 bg-forest text-cream font-semibold py-4 px-7 rounded-xl text-[16px] shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_-1px_0_rgba(0,0,0,0.10)_inset,0_12px_26px_-14px_rgba(58,90,64,0.55)] hover:bg-forest-dark hover:-translate-y-px transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="inline-flex items-center gap-2.5">
                Get the Starter Pack &mdash; $44.99
                <span className="inline-grid place-items-center w-[22px] h-[22px] rounded-full bg-white/[0.18]">
                  &rarr;
                </span>
              </span>
            </CheckoutButton>
            <p className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13.5px] text-gray-500 m-0">
              <span>Instant download</span>
              <span className="w-[3px] h-[3px] rounded-full bg-[#C9C5B7]" aria-hidden="true" />
              <span>Works on any device</span>
              <span className="w-[3px] h-[3px] rounded-full bg-[#C9C5B7]" aria-hidden="true" />
              <span>14-day refund guarantee</span>
            </p>
          </div>
        </section>

        {/* 06 THE MATH */}
        <section className="bg-[#E6EBDF] border-y border-[#C9D3BE] py-20 md:py-20">
          <div className="mx-auto max-w-[920px] px-6">
            <ScrollReveal>
              <div className="max-w-[720px] mx-auto text-center mb-10">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                  <span className="w-[22px] h-px bg-forest inline-block" />
                  The math
                </p>
                <h2 className="mt-3.5 font-display text-[clamp(1.875rem,3.6vw,2.625rem)] leading-[1.08] tracking-tight text-balance">
                  Is the Starter Pack <span className="italic text-forest">right for you?</span>
                </h2>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={80}>
              <div className="overflow-hidden rounded-[14px] border border-[#C9C5B7] bg-cream shadow-[0_22px_40px_-28px_rgba(45,58,46,0.3)]">
                {/* Header row */}
                <div className="grid grid-cols-[0.85fr_1fr_1fr] border-b border-[#D8D4C5] max-sm:grid-cols-[1fr_1fr] max-sm:[&_.lbl-cell]:hidden">
                  <div className="lbl-cell px-4 py-3.5 bg-cream" />
                  <div className="px-4 py-3.5 border-l border-[#D8D4C5] bg-cream">
                    <div className="font-display text-[17px] text-ink leading-[1.2]">
                      The Starter Pack
                    </div>
                    <div className="text-[11.5px] text-gray-600 mt-0.5">One-time</div>
                  </div>
                  <div className="px-4 py-3.5 border-l border-[#E5D27A] bg-[#F5E7BC] relative">
                    <span className="absolute top-2 right-2 inline-flex items-center bg-[#B6913F] text-cream font-body font-semibold text-[9px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full">
                      Best value
                    </span>
                    <div className="font-display text-[17px] text-[#7A5E1F] leading-[1.2]">
                      The Membership
                    </div>
                    <div className="text-[11.5px] text-[#7A5E1F]/80 mt-0.5">
                      {MEMBERSHIP_PRICE_YR}{IS_FOUNDER_PHASE && ' · Founder rate'}
                    </div>
                  </div>
                </div>
                {/* Body rows */}
                {[
                  { label: 'Price', a: '$44.99 one-time', b: IS_FOUNDER_PHASE ? `${MEMBERSHIP_PRICE_YEAR}, locked for life` : MEMBERSHIP_PRICE_YEAR },
                  { label: 'Activities', a: '10 + Skills Map', b: '100+ + Skills Map + quarterly drops' },
                  {
                    label: 'Best for',
                    a: 'Test the library before subscribing.',
                    b: "Make this our family's thing for years.",
                    italic: true,
                  },
                  { label: 'Refund', a: '14 days', b: '14 days' },
                ].map((row, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-[0.85fr_1fr_1fr] max-sm:grid-cols-[1fr_1fr] max-sm:[&_.lbl-cell]:hidden ${
                      i < 3 ? 'border-b border-[#D8D4C5]' : ''
                    }`}
                  >
                    <div className="lbl-cell px-4 py-3 text-[12px] font-body font-semibold uppercase tracking-[0.14em] text-gray-500 self-center">
                      {row.label}
                    </div>
                    <div className="px-4 py-3 border-l border-[#D8D4C5] text-[14px] text-ink leading-[1.4]">
                      <div className="sm:hidden text-[10.5px] font-semibold uppercase tracking-[0.14em] text-gray-500 mb-1">
                        {row.label}
                      </div>
                      <span className={row.italic ? 'font-display italic text-gray-700' : ''}>
                        {row.a}
                      </span>
                    </div>
                    <div className="px-4 py-3 border-l border-[#E5D27A] bg-[#F5E7BC]/40 text-[14px] text-ink leading-[1.4]">
                      <div className="sm:hidden text-[10.5px] font-semibold uppercase tracking-[0.14em] text-gray-500 mb-1">
                        &nbsp;
                      </div>
                      <span className={row.italic ? 'font-display italic text-gray-700' : ''}>
                        {row.b}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <p className="mt-6 text-center text-[15.5px] leading-[1.6] text-gray-600 max-w-[640px] mx-auto">
              The membership unlocks 90 more activities and adds new ones every quarter. If you&apos;d
              want to keep doing this past 30 days,{' '}
              <span className="font-display italic text-ink">the membership is the better deal.</span>
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3.5">
              <CheckoutButton
                kind="starter-pack"
                className="inline-flex items-center gap-2.5 border-[1.5px] border-forest text-forest-dark font-semibold py-[14px] px-[22px] rounded-xl text-[15px] hover:bg-[#E6EBDF] hover:-translate-y-px transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="inline-flex items-center gap-2.5">
                  Get the Starter Pack
                  <span className="font-display italic text-base">&rarr;</span>
                </span>
              </CheckoutButton>
              <Link
                href="/join"
                className="inline-flex items-center gap-2.5 bg-forest text-cream font-semibold py-3.5 px-6 rounded-xl text-[15.5px] shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_-1px_0_rgba(0,0,0,0.10)_inset,0_12px_26px_-14px_rgba(58,90,64,0.55)] hover:bg-forest-dark hover:-translate-y-px transition-all duration-200"
              >
                See the membership
                <span className="inline-grid place-items-center w-[22px] h-[22px] rounded-full bg-white/[0.18]">
                  &rarr;
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* 08 FAQ */}
        <section className="bg-cream border-y border-[#D8D4C5] py-16 md:py-20">
          <div className="mx-auto max-w-[760px] px-6">
            <ScrollReveal>
              <div className="text-center mb-8">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                  <span className="w-[22px] h-px bg-forest inline-block" />
                  Quick questions
                </p>
                <h2 className="mt-3.5 font-display text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.08] tracking-tight text-balance">
                  Before you <span className="italic text-forest">commit.</span>
                </h2>
              </div>
            </ScrollReveal>
            <div className="max-w-[760px] mx-auto">
              {faqs.map((item, i) => (
                <details
                  key={i}
                  className={`border-b border-[#D8D4C5] ${i === 0 ? 'border-t' : ''}`}
                >
                  <summary className="cursor-pointer flex justify-between items-start gap-6 py-5 list-none [&::-webkit-details-marker]:hidden font-display text-[clamp(1.05rem,2vw,1.3125rem)] leading-[1.3] text-ink hover:text-forest-dark transition-colors">
                    <span>{item.q}</span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 w-7 h-7 mt-1 rounded-full border border-[#C9C5B7] grid place-items-center text-gray-600 text-lg leading-none transition-all"
                    >
                      +
                    </span>
                  </summary>
                  <div className="pb-5 pr-1 text-gray-600 text-[16px] leading-[1.7]">
                    <p className="m-0">{item.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 09 FINAL CTA */}
        <section className="bg-[#F2EFE4] border-t border-[#D8D4C5] py-20 md:py-24 text-center">
          <div className="mx-auto max-w-[760px] px-6">
            <ScrollReveal>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                <span className="w-[22px] h-px bg-forest inline-block" />
                Ready?
              </p>
              <h2 className="mt-3.5 font-display text-[clamp(2rem,4.2vw,3rem)] leading-[1.08] tracking-tight text-balance">
                One purchase. Ten activities. The{' '}
                <span className="italic text-forest">first chapter</span> of a library that could
                quietly change your family&apos;s weekends.
              </h2>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
                <CheckoutButton
                  kind="starter-pack"
                  className="inline-flex items-center gap-2.5 bg-forest text-cream font-semibold py-4 px-7 rounded-xl text-[16px] shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_-1px_0_rgba(0,0,0,0.10)_inset,0_12px_26px_-14px_rgba(58,90,64,0.55)] hover:bg-forest-dark hover:-translate-y-px transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="inline-flex items-center gap-2.5">
                    Get the Starter Pack &mdash; $44.99
                    <span className="inline-grid place-items-center w-[22px] h-[22px] rounded-full bg-white/[0.18]">
                      &rarr;
                    </span>
                  </span>
                </CheckoutButton>
              </div>
              <p className="mt-6 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] text-gray-500">
                <span>Instant download</span>
                <span className="w-[3px] h-[3px] rounded-full bg-[#C9C5B7]" aria-hidden="true" />
                <span>14-day money-back guarantee</span>
                <span className="w-[3px] h-[3px] rounded-full bg-[#C9C5B7]" aria-hidden="true" />
                <span>Works on any device</span>
              </p>
              <p className="mt-6 text-[14.5px] text-gray-600">
                Or skip ahead. The membership unlocks the entire library for {MEMBERSHIP_PRICE_YEAR}.{' '}
                <Link
                  href="/join"
                  className="text-forest-dark font-semibold border-b border-forest/25 pb-px hover:text-forest hover:border-forest-dark transition-colors"
                >
                  {JOIN_CTA_LABEL} &rarr;
                </Link>
              </p>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </>
  );
}
