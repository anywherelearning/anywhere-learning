import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import EmailForm from '@/components/EmailForm';
import { FLAGSHIP_GUIDE } from '@/lib/flagship-guide';
import ScrollReveal from '@/components/shared/ScrollReveal';
import { IS_FOUNDER_PHASE, MEMBERSHIP_PRICE_YEAR } from '@/lib/membership';

export const metadata: Metadata = {
  title: '7 Days of Real-World Learning, Free Guide',
  description:
    'A free, low-prep activity guide for families who love hands-on, real-world learning. Seven real-world activities across seven categories. Zero worksheets.',
  alternates: {
    canonical: 'https://anywherelearning.co/free-guide',
  },
  openGraph: {
    title: '7 Days of Real-World Learning | Free Guide',
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
  '@type': 'Product',
  name: '7 Days of Real-World Learning',
  description:
    'A free, low-prep activity guide with 7 hands-on activities for families across outdoor & nature, real-world math, creativity, AI & digital, entrepreneurship, communication, and planning. Ages 6 to 14.',
  image: 'https://anywherelearning.co/images/free-guide-og.jpg',
  url: 'https://anywherelearning.co/free-guide',
  brand: { '@type': 'Brand', name: 'Anywhere Learning' },
  author: {
    '@type': 'Person',
    name: 'Amelie',
    jobTitle: 'Former Teacher & Founder',
    url: 'https://anywherelearning.co/about',
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: ['US', 'CA', 'GB', 'AU', 'NZ'],
      returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
      returnPolicyUrl: 'https://anywherelearning.co/terms#refund-policy',
    },
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

const pains = [
  {
    quote: "She aces her math tests, but freezes when I ask her to call the dentist.",
    ctx: 'School-smart. Life-shy.',
  },
  {
    quote: "By Saturday afternoon, we're all on screens. Side by side, miles apart.",
    ctx: 'Together time, gone missing.',
  },
  {
    quote: "Every year I say we'll do more with them. Every year, we don't.",
    ctx: 'Good intentions. Time slipping.',
  },
];

const philosophy = [
  {
    title: 'A guide for parents',
    body: 'Not a worksheet for kids. You set the stage, then step back. The activity is for parent and kid to do together.',
    accent: 'parents',
    bg: 'bg-[#E6EBDF]',
    border: 'border-[#C9D3BE]',
    color: 'text-forest-dark',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="8" cy="8" r="3" />
        <circle cx="16" cy="10" r="2.5" />
        <path d="M2 21c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <path d="M13 21c0-2.6 1.8-4.7 4-5" />
      </svg>
    ),
  },
  {
    title: 'Built for real life',
    body: 'Activities use the spaces and stuff you already have. Your kitchen, your backyard, your phone. No printing, no setup, no trip to the craft store.',
    accent: 'real life',
    bg: 'bg-[#F2DECF]',
    border: 'border-[rgba(201,123,92,0.3)]',
    color: 'text-[#C97B5C]',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
  {
    title: 'Reusable forever',
    body: 'Every activity scales from ages 6 to 14. Come back to it season after season as your kid grows.',
    accent: 'forever',
    bg: 'bg-[#F5E7BC]',
    border: 'border-[rgba(182,145,63,0.35)]',
    color: 'text-[#B6913F]',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 12c0-3 2.5-5 5-5s4 1.5 5 3.5S15 14 17 14s4-1 4-3.5" />
        <path d="M21 12c0 3-2.5 5-5 5s-4-1.5-5-3.5S9 10 7 10s-4 1-4 3.5" />
      </svg>
    ),
  },
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
        {/* ════════════════════════════════════════
            01 HERO
        ════════════════════════════════════════ */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-[1180px] px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-14 lg:gap-16 items-center">
              <ScrollReveal direction="right">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7A3D24] inline-flex items-center gap-2.5">
                    <span className="w-[22px] h-px bg-[#C97B5C] inline-block" />
                    Free download
                  </p>
                  <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.02] tracking-tight mt-4 text-balance">
                    7 days of <span className="italic text-forest">real-world</span> learning.
                  </h1>
                  <p className="mt-5 text-[18px] md:text-[19.5px] leading-[1.55] text-gray-600 max-w-[520px]">
                    Seven real-world activities across seven categories. Do them in a week, a
                    month, or whenever life makes room. A free guide for parents who want their
                    kids growing into{' '}
                    <span className="font-display italic text-forest-dark">capable, curious</span>{' '}
                    humans.
                  </p>
                  <div className="mt-8 max-w-[480px]">
                    <EmailForm variant="light" buttonText="Send me the free guide" guide={FLAGSHIP_GUIDE.guideTag} />
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="left" delay={100}>
                <div className="relative flex justify-center items-center min-h-[460px] md:min-h-[520px]">
                  {/* Real PDF cover */}
                  <div className="relative w-[280px] md:w-[320px] aspect-[8.5/11] -rotate-[3deg] rounded-[14px] border border-[#D8D4C5] overflow-hidden shadow-[0_30px_60px_-32px_rgba(45,58,46,0.45)]">
                    <Image
                      src="/images/free-guide-cover.jpg"
                      alt="7 Days of Real-World Learning free guide cover"
                      fill
                      sizes="(max-width: 768px) 280px, 320px"
                      quality={85}
                      priority
                      className="object-cover"
                    />
                  </div>
                  {/* Free sticker */}
                  <div
                    aria-hidden="true"
                    className="absolute top-3 right-[6%] w-[100px] h-[100px] md:w-[118px] md:h-[118px] rounded-full bg-[#C97B5C] text-cream grid place-items-center rotate-[10deg] shadow-[0_16px_26px_-10px_rgba(201,123,92,0.55)] z-10"
                  >
                    <div className="text-center font-display text-[13px] md:text-[15px] tracking-[0.04em] leading-none flex flex-col gap-1">
                      <span>FREE</span>
                      <span className="w-7 h-px bg-white/50 mx-auto" />
                      <span>PDF</span>
                      <span className="w-7 h-px bg-white/50 mx-auto" />
                      <span>DOWNLOAD</span>
                    </div>
                  </div>
                  {/* Real parent review, floating as an oval thought bubble over the cover's bottom-left */}
                  <figure className="absolute -bottom-5 -left-4 md:-left-14 z-20 w-[250px] md:w-[270px] -rotate-[2deg]">
                    <div className="bg-white border border-[#E4E0D2] rounded-full px-8 py-6 text-center shadow-[0_18px_32px_-16px_rgba(45,58,46,0.34)]">
                      <blockquote className="m-0">
                        <p className="text-[12.5px] leading-[1.5] text-gray-700 m-0">
                          &ldquo;We tried the Square Foot Safari and my son kept saying how much fun he was having.
                          Best afternoon outdoors we&apos;ve had together lately.&rdquo;
                        </p>
                        <figcaption className="mt-2.5 flex items-center justify-center gap-2">
                          <span
                            aria-hidden="true"
                            className="shrink-0 w-6 h-6 rounded-full inline-flex items-center justify-center font-bold text-[11px]"
                            style={{ background: 'rgba(58,90,64,0.12)', color: '#3A5A40' }}
                          >
                            V
                          </span>
                          <span className="text-[12px] text-forest-dark font-semibold">
                            Vickie
                            <span className="text-gray-500 font-normal"> &middot; mom of two</span>
                          </span>
                        </figcaption>
                      </blockquote>
                    </div>
                  </figure>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            02 PAIN POINTS
        ════════════════════════════════════════ */}
        <section className="bg-[#F2EFE4] border-y border-[#D8D4C5] py-20 md:py-24">
          <div className="mx-auto max-w-[1180px] px-6">
            <ScrollReveal>
              <div className="max-w-[760px] mx-auto text-center mb-12">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7A3D24] inline-flex items-center gap-2.5">
                  <span className="w-[22px] h-px bg-[#C97B5C] inline-block" />
                  The quiet frustrations
                </p>
                <h2 className="font-display text-[clamp(1.9rem,4vw,2.875rem)] leading-[1.08] tracking-tight mt-3.5 text-balance">
                  Does this sound <span className="italic text-forest">familiar?</span>
                </h2>
                <p className="mt-4 font-display italic text-[18px] text-[#C97B5C] text-balance">
                  You&apos;re not alone. Most parents we talk to say the same things.
                </p>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px] max-w-[1020px] mx-auto">
              {pains.map((p, i) => (
                <ScrollReveal key={i} delay={i * 80}>
                  <div className="h-full bg-cream border border-[#D8D4C5] rounded-[12px] p-7 shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_14px_26px_-22px_rgba(45,58,46,0.18)]">
                    <span className="block font-display italic text-[48px] leading-[0.6] text-[#C97B5C]/50 mb-1.5">
                      &ldquo;
                    </span>
                    <p className="font-display italic text-[19px] leading-[1.3] text-ink text-balance">
                      {p.quote}
                    </p>
                    <p className="mt-3.5 pt-3 border-t border-dashed border-[#C9C5B7] text-[13.5px] leading-[1.5] text-gray-500">
                      {p.ctx}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
            <ScrollReveal delay={200}>
              <p className="mt-12 mx-auto max-w-[640px] text-center font-display italic text-[20px] md:text-[21px] leading-[1.4] text-ink text-balance">
                You don&apos;t need more stuff. You just need{' '}
                <span className="text-forest-dark">seven real activities, ready when you are.</span>
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ════════════════════════════════════════
            03 7 DAYS
        ════════════════════════════════════════ */}
        <section className="bg-cream py-20 md:py-24">
          <div className="mx-auto max-w-[1180px] px-6">
            <ScrollReveal>
              <div className="max-w-[760px] mx-auto text-center mb-12">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                  <span className="w-[22px] h-px bg-forest inline-block" />
                  What&apos;s inside
                </p>
                <h2 className="font-display text-[clamp(1.9rem,4vw,2.875rem)] leading-[1.08] tracking-tight mt-3.5 text-balance">
                  Seven days. Seven{' '}
                  <span className="italic text-forest">real-world skills.</span>
                </h2>
                <p className="mt-4 text-[17.5px] text-gray-600">
                  Pick one.{' '}
                  <span className="font-display italic text-forest-dark">Try it today.</span>
                </p>
              </div>
            </ScrollReveal>
            <div className="max-w-[860px] mx-auto flex flex-col gap-[18px]">
              {days.map((d, i) => (
                <ScrollReveal key={d.num} delay={(i % 3) * 60}>
                  <div
                    className="relative bg-cream border border-[#D8D4C5] rounded-[14px] p-7 md:p-8 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 md:gap-8 items-start overflow-hidden shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_14px_26px_-22px_rgba(45,58,46,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_36px_-22px_rgba(45,58,46,0.28)] hover:border-[#C9C5B7]"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0 bottom-0 w-[3px]"
                      style={{ background: d.color }}
                    />
                    <div className="pl-1.5 flex flex-col gap-1">
                      <span
                        className="font-display italic text-[36px] md:text-[38px] leading-none tracking-tight"
                        style={{ color: d.color }}
                      >
                        {d.num}
                      </span>
                      <span
                        className="text-[11.5px] font-semibold uppercase tracking-[0.16em]"
                        style={{ color: d.color }}
                      >
                        {d.cat}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display text-[22px] md:text-[24px] leading-[1.16] tracking-tight text-balance text-ink mb-2.5">
                        {d.title}
                      </h3>
                      <p className="text-[16px] leading-[1.65] text-gray-600 m-0">{d.body}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            04 MID EMAIL CAPTURE
        ════════════════════════════════════════ */}
        <section className="bg-cream pb-16 md:pb-20">
          <div className="mx-auto max-w-[1180px] px-6">
            <ScrollReveal>
              <div className="max-w-[720px] mx-auto bg-[#E6EBDF] border border-[#C9D3BE] rounded-[18px] p-10 md:p-12 text-center shadow-[0_24px_44px_-34px_rgba(58,90,64,0.4)]">
                <p className="font-display italic text-[17px] text-forest-dark mb-1">
                  That&apos;s all seven.
                </p>
                <h3 className="font-display text-[clamp(1.625rem,3vw,2.125rem)] leading-[1.12] tracking-tight text-balance">
                  Want them in your inbox{' '}
                  <span className="italic text-forest-dark">right now?</span>
                </h3>
                <div className="mt-6 max-w-[480px] mx-auto">
                  <EmailForm variant="light" buttonText="Send me the free guide" guide={FLAGSHIP_GUIDE.guideTag} />
                </div>
                <p className="mt-3.5 text-[13px] text-gray-500">
                  Delivered instantly. No spam. Unsubscribe any time.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ════════════════════════════════════════
            05 PHILOSOPHY
        ════════════════════════════════════════ */}
        <section className="bg-[#F2EFE4] border-y border-[#D8D4C5] py-20 md:py-24">
          <div className="mx-auto max-w-[1180px] px-6">
            <ScrollReveal>
              <div className="max-w-[800px] mx-auto text-center mb-12">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                  <span className="w-[22px] h-px bg-forest inline-block" />
                  The philosophy
                </p>
                <h2 className="font-display text-[clamp(1.9rem,4vw,2.875rem)] leading-[1.08] tracking-tight mt-3.5 text-balance">
                  The goal isn&apos;t to teach kids{' '}
                  <span className="italic text-forest">about</span> life.
                </h2>
                <p className="mt-4 font-display italic text-[clamp(1.25rem,2.4vw,1.625rem)] leading-[1.36] text-[#C97B5C] text-balance">
                  It&apos;s to let them live it,{' '}
                  <span className="text-[#C97B5C]">with your guidance.</span>
                </p>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[980px] mx-auto">
              {philosophy.map((v, i) => (
                <ScrollReveal key={v.title} delay={i * 80}>
                  <div className="h-full bg-cream border border-[#D8D4C5] rounded-[12px] p-7 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_30px_-22px_rgba(45,58,46,0.22)]">
                    <div
                      className={`w-[44px] h-[44px] rounded-[12px] grid place-items-center mb-4 border ${v.bg} ${v.border} ${v.color}`}
                    >
                      {v.icon}
                    </div>
                    <h4 className="font-display text-[22px] leading-[1.18] tracking-tight text-ink mb-2">
                      {v.title.split(v.accent)[0]}
                      <span className="italic text-forest">{v.accent}</span>
                      {v.title.split(v.accent)[1]}
                    </h4>
                    <p className="text-[15.5px] leading-[1.6] text-gray-600 m-0">{v.body}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            06 FINAL CTA + MEMBERSHIP PS
        ════════════════════════════════════════ */}
        <section className="bg-[#F2EFE4] py-20 md:py-24 text-center">
          <div className="mx-auto max-w-[720px] px-6">
            <ScrollReveal>
              <h2 className="font-display text-[clamp(2.125rem,5vw,3.5rem)] leading-[1.06] tracking-tight text-balance">
                Ready to <span className="italic text-forest">start?</span>
              </h2>
              <p className="mt-5 text-[18px] leading-[1.55] text-gray-600 max-w-[520px] mx-auto">
                Download the free guide and try your first activity this week. No curriculum.
                No worksheets. Low prep.
              </p>
              <div className="mt-8 max-w-[480px] mx-auto">
                <EmailForm variant="light" buttonText="Send me the free guide" guide={FLAGSHIP_GUIDE.guideTag} />
              </div>
              <p className="mt-5 text-[14.5px] text-gray-500">
                Want the age-by-age skills version?{' '}
                <Link
                  href="/guides/capable-kid"
                  className="text-forest-dark font-semibold border-b border-forest/25 hover:text-forest hover:border-forest-dark transition-colors"
                >
                  Get the free Capable Kid Guide
                </Link>
              </p>
            </ScrollReveal>

            <ScrollReveal delay={120}>
              <div className="mt-14 mx-auto max-w-[600px] bg-cream border border-[#D8D4C5] rounded-[14px] p-7 md:p-8 text-center">
                <span className="block font-display italic text-[18px] text-[#C97B5C] mb-2">
                  Already know you want more?
                </span>
                <p className="text-[15px] leading-[1.6] text-gray-600 m-0">
                  The Anywhere Learning{' '}
                  <span className="font-display italic text-ink text-[16px]">membership</span>{' '}
                  unlocks 120+ guided activities like these.{' '}
                  {IS_FOUNDER_PHASE
                    ? `Founding members pay ${MEMBERSHIP_PRICE_YEAR}, locked in for life, or go monthly for $15.`
                    : `${MEMBERSHIP_PRICE_YEAR} or $15/month, cancel anytime.`}
                </p>
                <div className="mt-4 flex justify-center">
                  <Link
                    href="/join"
                    className="inline-flex items-center gap-2 text-forest-dark font-semibold text-[14.5px] border-b border-forest/25 pb-0.5 hover:text-forest hover:border-forest-dark transition-colors"
                  >
                    See the membership
                    <span className="font-display italic text-[17px] leading-none">&rarr;</span>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
