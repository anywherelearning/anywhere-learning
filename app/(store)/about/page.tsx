import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import ScrollReveal from '@/components/shared/ScrollReveal';
import { JOIN_CTA_LABEL, MEMBERSHIP_PRICE_YEAR } from '@/lib/membership';

const ABOUT_DESC =
  "I'm Amelie, former teacher (B.Ed, M.Ed, 15 years) and mom of two. I watched kids become less independent over 15 years in the classroom. Anywhere Learning is the hands-on life skills activities I built so any parent can change that.";
const ABOUT_URL = 'https://anywherelearning.co/about';
const ABOUT_OG_IMAGE = 'https://anywherelearning.co/about-hero-amelie.jpeg';

export const metadata: Metadata = {
  title: 'About',
  description: ABOUT_DESC,
  alternates: { canonical: ABOUT_URL },
  openGraph: {
    title: 'About Amelie | Anywhere Learning',
    description: ABOUT_DESC,
    url: ABOUT_URL,
    type: 'profile',
    images: [
      {
        url: ABOUT_OG_IMAGE,
        width: 1200,
        height: 800,
        alt: 'Amelie Drouin — former teacher and founder of Anywhere Learning',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Amelie | Anywhere Learning',
    description: ABOUT_DESC,
    images: [ABOUT_OG_IMAGE],
  },
};

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://anywherelearning.co' },
    { '@type': 'ListItem', position: 2, name: 'About', item: ABOUT_URL },
  ],
};

const beliefs = [
  {
    bg: 'bg-[#E6EBDF]',
    border: 'border-[#C9D3BE]',
    color: 'text-forest-dark',
    title: 'The world is the classroom',
    description:
      'Kitchens, parks, airports, backyards: learning happens everywhere when you know what to look for.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 11l9-7 9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-5h6v5" />
      </svg>
    ),
  },
  {
    bg: 'bg-[#F2DECF]',
    border: 'border-[rgba(201,123,92,0.3)]',
    color: 'text-[#C97B5C]',
    title: 'Together, side by side',
    description:
      'Every activity is built for parent and kid to do together. Hands-on when it makes sense, screens when it does. The point is always the same: you, doing real things with your kid.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="9" cy="8" r="3" />
        <circle cx="16" cy="9" r="2.5" />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <path d="M14 20c0-2.5 1.8-4.5 4-5" />
      </svg>
    ),
  },
  {
    bg: 'bg-[#F5E7BC]',
    border: 'border-[rgba(182,145,63,0.35)]',
    color: 'text-[#B6913F]',
    title: 'Low prep, no stress',
    description:
      'Open it, pick an activity, and go. I do the thinking so you can focus on being present with your family.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 12l5 5L20 6" />
      </svg>
    ),
  },
  {
    bg: 'bg-[#E0EAD9]',
    border: 'border-[#C9D3BE]',
    color: 'text-forest-dark',
    title: 'Flexible by design',
    description:
      'No schedules, no sequences. Use the guides however you want, at home, travelling, or in between.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 17c4-6 8-6 12 0s6 4 6 0" />
        <path d="M3 7c4-6 8-6 12 0s6 4 6 0" />
      </svg>
    ),
  },
];

const approaches: Array<{ label: string; highlight?: boolean }> = [
  { label: 'Public school', highlight: true },
  { label: 'Private school', highlight: true },
  { label: 'Homeschool' },
  { label: 'Worldschool' },
  { label: 'Charlotte Mason' },
  { label: 'Montessori' },
  { label: 'Unschool' },
  { label: 'Eclectic' },
];

const personLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': 'https://anywherelearning.co/about#amelie',
  name: 'Amelie Drouin',
  givenName: 'Amelie',
  familyName: 'Drouin',
  jobTitle: 'Former Teacher & Founder of Anywhere Learning',
  description:
    'Former classroom teacher (B.Ed, M.Ed) with 15 years of experience who saw kids becoming less independent and resourceful. Creator of Anywhere Learning, hands-on life skills activities for families.',
  url: 'https://anywherelearning.co/about',
  image: 'https://anywherelearning.co/amelie.jpg',
  nationality: { '@type': 'Country', name: 'Canada' },
  sameAs: ['https://www.wikidata.org/wiki/Q139595767'],
  worksFor: { '@id': 'https://anywherelearning.co/#organization' },
  alumniOf: [
    {
      '@type': 'EducationalOrganization',
      name: 'Université de Sherbrooke',
      sameAs: 'https://www.wikidata.org/wiki/Q2579532',
    },
  ],
  hasCredential: [
    { '@type': 'EducationalOccupationalCredential', credentialCategory: 'degree', name: 'Bachelor of Education (B.Ed)' },
    { '@type': 'EducationalOccupationalCredential', credentialCategory: 'degree', name: 'Master of Education (M.Ed)' },
  ],
  knowsAbout: [
    'Life skills education',
    'Childhood independence',
    'Experiential education',
    'Real-world learning',
    'Homeschooling',
    'Worldschooling',
  ],
};

const profilePageLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  mainEntity: { '@id': 'https://anywherelearning.co/about#amelie' },
  name: 'About Amelie | Anywhere Learning',
  url: 'https://anywherelearning.co/about',
};

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <main>
        {/* ════════════════════════════════════════
            01 HERO
        ════════════════════════════════════════ */}
        <header className="bg-cream pt-12 md:pt-20 pb-14 md:pb-20 overflow-hidden">
          <div className="mx-auto max-w-[1180px] px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-center">
              <ScrollReveal direction="right">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                    <span className="w-[22px] h-px bg-forest inline-block" />
                    I&apos;m Amelie
                  </p>
                  <h1 className="font-display text-[clamp(2.25rem,4.8vw,4rem)] leading-[1.06] tracking-tight mt-5 text-balance">
                    After 15 years in the classroom, I left to give my own kids{' '}
                    <span className="italic text-forest">something different.</span>
                  </h1>
                  <p className="mt-6 text-[17px] md:text-[18.5px] leading-[1.65] text-gray-600 max-w-[560px]">
                    I left the classroom for more time with my own kids. Yes, time for academics.
                    But mostly time for the things modern childhood doesn&apos;t make space for:
                    how to plan a meal, manage a budget, fix what&apos;s broken, finish what they
                    start. The{' '}
                    <span className="font-display italic text-forest-dark">real-world skills</span>{' '}
                    kids today rarely get the chance to practice.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-2">
                    {['B.Ed', 'M.Ed', '15 yrs in the classroom', 'Mom of 2'].map((cred) => (
                      <span
                        key={cred}
                        className="bg-cream border border-[#D8D4C5] px-3.5 py-1.5 rounded-full text-[13px] text-gray-500"
                      >
                        {cred}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="left" delay={120}>
                <div className="relative max-lg:max-w-[480px] max-lg:mx-auto lg:scale-[1.15] lg:origin-right">
                  <div className="relative aspect-[4/3] -rotate-[2deg] rounded-[14px] border border-[#D8D4C5] overflow-hidden shadow-[0_30px_50px_-30px_rgba(45,58,46,0.45)]">
                    <Image
                      src="/about-hero-amelie.jpeg"
                      alt="Amelie with her two kids on a mountain hike"
                      fill
                      sizes="(max-width: 1024px) 90vw, 42vw"
                      quality={85}
                      priority
                      className="object-cover"
                    />
                  </div>
                  <span
                    className="absolute -bottom-3 -right-3 lg:-bottom-4 lg:-right-4 bg-cream border border-[#D8D4C5] font-display italic text-[18px] text-[#C97B5C] px-5 py-2 rounded-full rotate-[4deg] shadow-[0_10px_20px_-12px_rgba(45,58,46,0.35)]"
                    aria-hidden="true"
                  >
                    xo, Amelie
                  </span>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </header>

        {/* ════════════════════════════════════════
            02 STORY PART 1
        ════════════════════════════════════════ */}
        <section className="bg-gradient-to-b from-[#FFFEFA] to-[#F2EFE4] border-y border-[#D8D4C5] py-16 md:py-20">
          <div className="mx-auto max-w-[660px] px-6">
            <ScrollReveal>
              <div className="text-[18px] leading-[1.78] text-gray-600 space-y-6">
                <p>
                  <span className="font-display italic text-[60px] md:text-[74px] leading-none text-forest float-left pr-3 pt-1.5">I</span>
                  loved teaching. I really did. Watching kids light up when something clicked.
                  The small daily wins. The days when they were genuinely happy to be there,
                  leaning in and learning.
                </p>
                <p>
                  But over the years, a pattern kept showing up. The basic life skills that used
                  to come standard with childhood, today&apos;s kids just weren&apos;t getting.
                  Not because they were less capable. Because childhood today doesn&apos;t leave
                  them much room to practice.
                </p>
                <p>
                  Days scheduled wall-to-wall. Screens filling the in-between hours. Most chores
                  and decisions handled by adults before kids ever get the chance to try. The{' '}
                  <span className="font-display italic text-ink">real-world muscle</span>{' '}
                  builds through repetition, and most kids today just aren&apos;t getting the reps.
                </p>
                <p>
                  Twelve-year-olds who&apos;d never packed their own lunch. Teenagers who
                  panicked at the idea of making a phone call. Kids who could solve algebra but
                  freeze at the simplest real-world problem.
                </p>
                <p>
                  And I knew, even as their teacher, I couldn&apos;t close that gap from inside
                  the classroom. Not in the time we had, not within the system we worked in.
                </p>
                <p>
                  Then I looked at my own kids. They were 12 and 9. Living the same childhood
                  I was worried about for everyone else&apos;s.{' '}
                  <span className="font-display italic text-ink">Growing up in the days I wasn&apos;t home.</span>
                </p>
                <p>
                  So after 15 years, I made the hardest call of my career. I left the classroom
                  to come home to them.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ════════════════════════════════════════
            03 IMAGE 1: The leap
        ════════════════════════════════════════ */}
        <section className="bg-cream pt-14 md:pt-20 pb-10 md:pb-14">
          <div className="mx-auto max-w-[920px] px-6">
            <ScrollReveal>
              <div className="relative aspect-[16/9] rounded-[14px] overflow-hidden border border-[#D8D4C5] bg-[#DDE5D2] shadow-[0_28px_50px_-30px_rgba(45,58,46,0.32)]">
                <Image
                  src="/about-leap.jpg"
                  alt="Amelie and her kids at a mountain lake"
                  fill
                  sizes="(max-width: 920px) 100vw, 920px"
                  quality={75}
                  className="object-cover"
                />
              </div>
              <p className="mt-4 text-center font-display italic text-[17px] text-[#C97B5C]">Coming home.</p>
            </ScrollReveal>
          </div>
        </section>

        {/* ════════════════════════════════════════
            04 STORY PART 2
        ════════════════════════════════════════ */}
        <section className="bg-cream pb-20 md:pb-24">
          <div className="mx-auto max-w-[760px] px-6">
            <ScrollReveal>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                <span className="w-[22px] h-px bg-forest inline-block" />
                The shift
              </p>
              <h2 className="font-display text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.1] tracking-tight mt-3 text-balance">
                I came home for more time with my kids. And built{' '}
                <span className="italic text-forest">something for any parent</span> who wants
                the same.
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={80}>
              <div className="mt-8 max-w-[660px] text-[18px] leading-[1.78] text-gray-600 space-y-6">
                <p>
                  We do academics, of course. Math, reading, writing. But honestly, that&apos;s
                  the easy part. The harder, more important work is everything else: the planning
                  a meal, fixing the bike, running a small business, navigating a hard
                  conversation. The kind of learning{' '}
                  <span className="font-display italic text-ink">a school day never quite has room for.</span>
                </p>
                <p>
                  Most of our days now happen at the kitchen table, in the backyard, at the
                  grocery store, halfway up a hiking trail. Hands-on, low-prep, real-world.
                  Nobody is miserable. I&apos;m not exhausted. My kids are more engaged than I
                  ever saw them in a classroom.
                </p>
                <p>
                  I started making simple guides for our own days. Step-by-step prompts I could
                  grab on a rainy afternoon or pull out at the lake. Things that turn ordinary
                  moments into the kind of learning that actually sticks.
                </p>
                <p>
                  Not a curriculum. Not a replacement for school. Just a toolkit any parent can
                  use to bring real-world learning into the rhythm you already have. Whether
                  you homeschool, worldschool, send your kids to school, or just want more out of
                  weekends and summers.
                </p>
                <p>
                  Anywhere Learning is what I wish every parent had. The thinking, planning, and
                  prep already done.{' '}
                  <span className="font-display italic text-ink">Built by a teacher</span>, so
                  you can spend the time you have actually doing things with your kids.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ════════════════════════════════════════
            05 BELIEFS
        ════════════════════════════════════════ */}
        <section className="bg-cream pb-16 md:pb-20">
          <div className="mx-auto max-w-[1180px] px-6">
            <ScrollReveal>
              <div className="bg-[#F2EFE4] border border-[#D8D4C5] rounded-[18px] p-10 md:p-14">
                <div className="text-center max-w-[660px] mx-auto mb-10">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                    <span className="w-[22px] h-px bg-forest inline-block" />
                    What I believe
                  </p>
                  <h2 className="font-display text-[clamp(1.75rem,3.6vw,2.625rem)] leading-[1.1] tracking-tight mt-3.5 text-balance">
                    Learning should fit your life,{' '}
                    <span className="italic text-forest">not the other way around.</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[880px] mx-auto">
                  {beliefs.map((b, i) => (
                    <ScrollReveal key={b.title} delay={i * 60}>
                      <div className="h-full bg-cream border border-[#D8D4C5] rounded-[12px] p-7 transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_18px_30px_-22px_rgba(45,58,46,0.22)]">
                        <div className={`w-[42px] h-[42px] rounded-[12px] grid place-items-center mb-4 border ${b.bg} ${b.border} ${b.color}`}>
                          {b.icon}
                        </div>
                        <h3 className="font-display text-[22px] leading-[1.2] tracking-tight mb-2 text-ink">{b.title}</h3>
                        <p className="text-[15.5px] leading-[1.6] text-gray-600">{b.description}</p>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ════════════════════════════════════════
            06 FOR ANY FAMILY
        ════════════════════════════════════════ */}
        <section className="bg-cream pb-12 md:pb-16 text-center">
          <div className="mx-auto max-w-[760px] px-6">
            <ScrollReveal>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                <span className="w-[22px] h-px bg-forest inline-block" />
                For every family
              </p>
              <h2 className="font-display text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.08] tracking-tight mt-3.5 text-balance">
                You don&apos;t have to leave school to{' '}
                <span className="italic text-forest">build real skills.</span>
              </h2>
              <p className="mt-5 text-[17.5px] leading-[1.6] text-gray-600 max-w-[600px] mx-auto">
                You don&apos;t need to homeschool to give your kids more. If your kids are in
                school, these are the weekends, the summers, the after-dinner hour. If you
                homeschool or worldschool, they slot right into the day. Real-world learning
                fits any family, any approach.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-2.5">
                {approaches.map((a) =>
                  a.highlight ? (
                    <span
                      key={a.label}
                      className="inline-flex items-center gap-2 bg-[#E6EBDF] border border-[#C9D3BE] text-forest-dark font-semibold text-[14px] px-4 py-2 rounded-full"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-forest shrink-0" aria-hidden="true" />
                      {a.label}
                    </span>
                  ) : (
                    <span
                      key={a.label}
                      className="inline-flex items-center text-ink bg-[#F2EFE4] font-medium text-[14px] px-4 py-2 rounded-full transition-all hover:bg-[#DAD7CD] hover:-translate-y-0.5"
                    >
                      {a.label}
                    </span>
                  ),
                )}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ════════════════════════════════════════
            07 IMAGE 2: family
        ════════════════════════════════════════ */}
        <section className="bg-cream pb-16 md:pb-20">
          <div className="mx-auto max-w-[920px] px-6">
            <ScrollReveal>
              <div className="relative aspect-[16/9] rounded-[14px] overflow-hidden border border-[#D8D4C5] bg-[#CFDCC4] shadow-[0_28px_50px_-30px_rgba(45,58,46,0.32)]">
                <Image
                  src="/about-family.jpg"
                  alt="The whole family on a backcountry adventure in the snow"
                  fill
                  sizes="(max-width: 920px) 100vw, 920px"
                  quality={75}
                  className="object-cover"
                />
              </div>
              <p className="mt-4 text-center font-display italic text-[17px] text-[#C97B5C]">Us, doing the work.</p>
            </ScrollReveal>
          </div>
        </section>

        {/* ════════════════════════════════════════
            08 FINAL CTA
        ════════════════════════════════════════ */}
        <section className="bg-gradient-to-b from-cream to-[#F2EFE4] border-t border-[#D8D4C5] py-20 md:py-24 text-center mt-8">
          <div className="mx-auto max-w-[720px] px-6">
            <ScrollReveal>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                <span className="w-[22px] h-px bg-forest inline-block" />
                Ready when you are
              </p>
              <h2 className="font-display text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.06] tracking-tight mt-3.5 text-balance">
                Ready to try a <span className="italic text-forest">different kind</span> of learning?
              </h2>
              <p className="mt-5 text-[18px] leading-[1.55] text-gray-600 max-w-[560px] mx-auto">
                Start with the free guide, or unlock the full library as a founding member.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/start-trial"
                  className="inline-flex items-center gap-3 bg-forest text-cream font-semibold py-4 px-6 rounded-xl text-[15.5px] shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_-1px_0_rgba(0,0,0,0.10)_inset,0_12px_26px_-14px_rgba(58,90,64,0.55),0_2px_0_rgba(45,58,46,0.05)] hover:bg-forest-dark hover:-translate-y-px transition-all duration-200"
                >
                  {JOIN_CTA_LABEL}, {MEMBERSHIP_PRICE_YEAR}
                  <span className="inline-grid place-items-center w-[22px] h-[22px] rounded-full bg-white/[0.18]">&rarr;</span>
                </Link>
                <Link
                  href="/free-guide"
                  className="inline-flex items-center gap-2.5 border-[1.5px] border-forest text-forest-dark font-semibold py-[14px] px-[22px] rounded-xl text-[15px] hover:bg-[#E6EBDF] hover:-translate-y-px transition-all duration-200"
                >
                  Get your free guide
                  <span className="font-display italic text-base">&rarr;</span>
                </Link>
              </div>
              <div className="mt-5 flex justify-center">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-gray-500 font-medium text-[14.5px] border-b border-gray-300 pb-1 hover:text-forest-dark hover:border-forest transition-colors"
                >
                  Or browse individual activities
                  <span className="font-display italic text-[17px] leading-none">&rarr;</span>
                </Link>
              </div>
              <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] text-gray-500">
                <span>Founder rate $99/year locked in for life, or $15/month</span>
                <span className="w-[3px] h-[3px] rounded-full bg-[#C9C5B7]" aria-hidden="true" />
                <span>14-day money-back guarantee</span>
                <span className="w-[3px] h-[3px] rounded-full bg-[#C9C5B7]" aria-hidden="true" />
                <span>No credit card to try the free guide</span>
              </div>
              <p className="mt-12 font-display italic text-[24px] text-[#C97B5C]">xo, Amelie</p>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </>
  );
}
