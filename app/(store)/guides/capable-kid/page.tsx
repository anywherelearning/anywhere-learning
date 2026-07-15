import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import EmailForm from '@/components/EmailForm';
import ScrollReveal from '@/components/shared/ScrollReveal';
import { IS_FOUNDER_PHASE, MEMBERSHIP_PRICE_YEAR } from '@/lib/membership';

const GUIDE = 'capable-kid';

export const metadata: Metadata = {
  title: 'The Capable Kid Guide, Free by Age 6 to 14',
  description:
    'A free, age-by-age guide to what your kid can actually do from 6 to 14, and how to hand each skill over without losing your mind. Built by a former teacher.',
  alternates: {
    canonical: 'https://anywherelearning.co/guides/capable-kid',
  },
  openGraph: {
    title: 'The Capable Kid Guide | Free Download',
    description:
      'What your kid can actually do by age, and how to hand it over without losing your mind. A free guide from a former teacher.',
    url: 'https://anywherelearning.co/guides/capable-kid',
    type: 'website',
    images: [
      {
        url: 'https://anywherelearning.co/images/capable-kid-cover.jpg',
        width: 800,
        height: 1035,
        alt: 'The Capable Kid Guide cover | Anywhere Learning',
      },
    ],
  },
};

const guideLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'The Capable Kid Guide',
  description:
    'A free, age-by-age guide to the real-world skills kids can own from 6 to 14, with a simple method for handing each one over. Covers kitchen, money, communication, and self-management.',
  image: 'https://anywherelearning.co/images/capable-kid-cover.jpg',
  url: 'https://anywherelearning.co/guides/capable-kid',
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

const ages = [
  {
    band: 'Ages 6 to 8',
    cat: 'The Early Wins',
    body: 'They desperately want to be big. Use it. A simple breakfast, dressing for the weather, ordering their own food, paying and waiting for the change. Small wins that teach a kid they can be trusted.',
    color: '#3A5A40',
  },
  {
    band: 'Ages 9 to 11',
    cat: 'Growing Independence',
    body: 'The sweet spot. Following a recipe start to finish, making a real phone call, doing their own laundry, saving up instead of buying now. One full grown-up system they can own completely.',
    color: '#588157',
  },
  {
    band: 'Ages 12 to 14',
    cat: 'Real-World Ready',
    body: 'The dress rehearsal for adulthood. Cooking for the family on a budget, booking their own appointment, running their own schedule, knowing what to do in an emergency. Fumbled now, while you are still nearby.',
    color: '#C97B5C',
  },
];

const credentialed = [
  'Aces the test',
  'Memorizes the facts',
  'Follows the instructions',
  'Waits to be told what to do',
];

const capable = [
  'Calls the dentist',
  'Cooks the family dinner',
  'Solves the problem on their own',
  'Figures it out',
];

const method = [
  {
    title: 'Capable, not compliant',
    body: 'The goal was never a kid who obeys. It is a kid who can run their own life one day. Capability comes from doing, not from being told.',
    accent: 'compliant',
    bg: 'bg-[#E6EBDF]',
    border: 'border-[#C9D3BE]',
    color: 'text-forest-dark',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
  },
  {
    title: 'Hand it over in stages',
    body: 'Watch me, help me, I watch you, you are on your own. Most of us get stuck on stage one because doing it ourselves is faster today. It costs capability tomorrow.',
    accent: 'stages',
    bg: 'bg-[#F2DECF]',
    border: 'border-[rgba(201,123,92,0.3)]',
    color: 'text-[#C97B5C]',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 18h4l3-12 3 12h4" />
      </svg>
    ),
  },
  {
    title: 'One skill a month',
    body: 'Not a transformation. One thing. That is twelve a year, and a kid who learns twelve real skills a year is unrecognizable in three. Let it be lumpy.',
    accent: 'month',
    bg: 'bg-[#F5E7BC]',
    border: 'border-[rgba(182,145,63,0.35)]',
    color: 'text-[#B6913F]',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
];

export default function CapableKidGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(guideLd) }}
      />
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
                    Raise a kid who can{' '}
                    <span className="italic text-forest">figure things out.</span>
                  </h1>
                  <p className="mt-5 text-[18px] md:text-[19.5px] leading-[1.55] text-gray-600 max-w-[520px]">
                    A free, age-by-age guide to what your kid can{' '}
                    <span className="font-display italic text-forest-dark">actually do</span> from
                    6 to 14, and how to hand each skill over without the meltdown. Built by a former
                    teacher.
                  </p>
                  <div className="mt-8 max-w-[480px]">
                    <EmailForm
                      variant="light"
                      guide={GUIDE}
                      buttonText="Send me the guide"
                      successBody="While you wait, the membership turns every skill in here into a done-for-you activity."
                    />
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="left" delay={100}>
                <div className="relative flex justify-center items-center min-h-[520px] md:min-h-[600px]">
                  <div className="relative w-[330px] md:w-[400px] aspect-[8.5/11] -rotate-[3deg] rounded-[14px] border border-[#D8D4C5] overflow-hidden shadow-[0_30px_60px_-32px_rgba(45,58,46,0.45)]">
                    <Image
                      src="/images/capable-kid-cover.jpg"
                      alt="The Capable Kid Guide free cover"
                      fill
                      sizes="(max-width: 768px) 330px, 400px"
                      quality={85}
                      priority
                      className="object-cover"
                    />
                  </div>
                  <div
                    aria-hidden="true"
                    className="absolute top-3 right-[6%] w-[100px] h-[100px] md:w-[118px] md:h-[118px] rounded-full bg-[#C97B5C] text-cream grid place-items-center rotate-[10deg] shadow-[0_16px_26px_-10px_rgba(201,123,92,0.55)] z-10"
                  >
                    <div className="text-center font-display text-[13px] md:text-[15px] tracking-[0.04em] leading-none flex flex-col gap-1">
                      <span>FREE</span>
                      <span className="w-7 h-px bg-white/50 mx-auto" />
                      <span>PDF</span>
                      <span className="w-7 h-px bg-white/50 mx-auto" />
                      <span>GUIDE</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            02 CREDENTIALED VS CAPABLE
        ════════════════════════════════════════ */}
        <section className="bg-[#F2EFE4] border-y border-[#D8D4C5] py-20 md:py-24">
          <div className="mx-auto max-w-[1180px] px-6">
            <ScrollReveal>
              <div className="max-w-[760px] mx-auto text-center mb-12">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7A3D24] inline-flex items-center gap-2.5">
                  <span className="w-[22px] h-px bg-[#C97B5C] inline-block" />
                  Credentialed vs capable
                </p>
                <h2 className="font-display text-[clamp(1.9rem,4vw,2.875rem)] leading-[1.08] tracking-tight mt-3.5 text-balance">
                  School measures one.{' '}
                  <span className="italic text-forest">Life asks for the other.</span>
                </h2>
                <p className="mt-4 font-display italic text-[18px] text-[#C97B5C] text-balance">
                  A kid can be brilliant on paper and still freeze the moment life needs them to act.
                </p>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[820px] mx-auto">
              {/* Credentialed, muted */}
              <ScrollReveal>
                <div className="h-full bg-cream border border-[#D8D4C5] rounded-[14px] p-7 md:p-8">
                  <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-gray-400 mb-5">
                    Credentialed
                  </p>
                  <ul className="flex flex-col gap-3.5 m-0 p-0 list-none">
                    {credentialed.map((c) => (
                      <li key={c} className="flex items-center gap-3 text-[16px] text-gray-400">
                        <span
                          aria-hidden="true"
                          className="shrink-0 w-[22px] h-[22px] rounded-full border border-[#D8D4C5] grid place-items-center text-gray-400"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                            <path d="M18 6 6 18M6 6l12 12" />
                          </svg>
                        </span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
              {/* Capable, highlighted */}
              <ScrollReveal delay={100}>
                <div className="h-full bg-[#E6EBDF] border border-[#C9D3BE] rounded-[14px] p-7 md:p-8 shadow-[0_18px_34px_-26px_rgba(58,90,64,0.45)]">
                  <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-forest-dark mb-5">
                    Capable
                  </p>
                  <ul className="flex flex-col gap-3.5 m-0 p-0 list-none">
                    {capable.map((c) => (
                      <li key={c} className="flex items-center gap-3 text-[16px] font-medium text-ink">
                        <span
                          aria-hidden="true"
                          className="shrink-0 w-[22px] h-[22px] rounded-full bg-forest text-cream grid place-items-center"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            </div>
            <ScrollReveal delay={200}>
              <p className="mt-12 mx-auto max-w-[640px] text-center font-display italic text-[20px] md:text-[21px] leading-[1.4] text-ink text-balance">
                This guide is the second list,{' '}
                <span className="text-forest-dark">handed over one skill at a time.</span>
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ════════════════════════════════════════
            03 WHAT'S INSIDE, BY AGE
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
                  What they can do, <span className="italic text-forest">by age.</span>
                </h2>
                <p className="mt-4 text-[17.5px] text-gray-600">
                  Three age bands, twenty-four real skills.{' '}
                  <span className="font-display italic text-forest-dark">Pick one to start.</span>
                </p>
              </div>
            </ScrollReveal>
            <div className="max-w-[860px] mx-auto flex flex-col gap-[18px]">
              {ages.map((a, i) => (
                <ScrollReveal key={a.band} delay={(i % 3) * 60}>
                  <div className="relative bg-cream border border-[#D8D4C5] rounded-[14px] p-7 md:p-8 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 md:gap-8 items-start overflow-hidden shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_14px_26px_-22px_rgba(45,58,46,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_36px_-22px_rgba(45,58,46,0.28)] hover:border-[#C9C5B7]">
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0 bottom-0 w-[3px]"
                      style={{ background: a.color }}
                    />
                    <div className="pl-1.5 flex flex-col gap-1">
                      <span
                        className="font-display italic text-[28px] md:text-[30px] leading-none tracking-tight"
                        style={{ color: a.color }}
                      >
                        {a.band}
                      </span>
                      <span
                        className="text-[11.5px] font-semibold uppercase tracking-[0.16em]"
                        style={{ color: a.color }}
                      >
                        {a.cat}
                      </span>
                    </div>
                    <div>
                      <p className="text-[16px] leading-[1.65] text-gray-600 m-0">{a.body}</p>
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
                  The whole age-by-age breakdown.
                </p>
                <h3 className="font-display text-[clamp(1.625rem,3vw,2.125rem)] leading-[1.12] tracking-tight text-balance">
                  Want it in your inbox{' '}
                  <span className="italic text-forest-dark">right now?</span>
                </h3>
                <div className="mt-6 max-w-[480px] mx-auto">
                  <EmailForm variant="light" guide={GUIDE} buttonText="Send me the guide" />
                </div>
                <p className="mt-3.5 text-[13px] text-gray-500">
                  Delivered instantly. No spam. Unsubscribe any time.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ════════════════════════════════════════
            05 THE METHOD
        ════════════════════════════════════════ */}
        <section className="bg-[#F2EFE4] border-y border-[#D8D4C5] py-20 md:py-24">
          <div className="mx-auto max-w-[1180px] px-6">
            <ScrollReveal>
              <div className="max-w-[800px] mx-auto text-center mb-12">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                  <span className="w-[22px] h-px bg-forest inline-block" />
                  The method
                </p>
                <h2 className="font-display text-[clamp(1.9rem,4vw,2.875rem)] leading-[1.08] tracking-tight mt-3.5 text-balance">
                  Confidence does not come{' '}
                  <span className="italic text-forest">first.</span>
                </h2>
                <p className="mt-4 font-display italic text-[clamp(1.25rem,2.4vw,1.625rem)] leading-[1.36] text-[#C97B5C] text-balance">
                  Competence comes first, and confidence{' '}
                  <span className="text-[#C97B5C]">follows it.</span>
                </p>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[980px] mx-auto">
              {method.map((v, i) => (
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
                Pick one skill. <span className="italic text-forest">Hand it over.</span>
              </h2>
              <p className="mt-5 text-[18px] leading-[1.55] text-gray-600 max-w-[520px] mx-auto">
                Get the free guide, choose one skill from your kid&apos;s age band, and start this
                week. No curriculum. Low prep.
              </p>
              <div className="mt-8 max-w-[480px] mx-auto">
                <EmailForm variant="light" guide={GUIDE} buttonText="Send me the guide" />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={120}>
              <div className="mt-14 mx-auto max-w-[600px] bg-cream border border-[#D8D4C5] rounded-[14px] p-7 md:p-8 text-center">
                <span className="block font-display italic text-[18px] text-[#C97B5C] mb-2">
                  Already know you want more?
                </span>
                <p className="text-[15px] leading-[1.6] text-gray-600 m-0">
                  The Anywhere Learning{' '}
                  <span className="font-display italic text-ink text-[16px]">membership</span>{' '}
                  turns every skill in this guide into a done-for-you activity, 120+ of them.{' '}
                  {IS_FOUNDER_PHASE
                    ? `Founding members pay ${MEMBERSHIP_PRICE_YEAR}, locked in for life.`
                    : `${MEMBERSHIP_PRICE_YEAR}, cancel anytime.`}
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
    </>
  );
}
