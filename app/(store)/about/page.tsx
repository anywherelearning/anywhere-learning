import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Tape, Magnet, PAPER_SHADOW } from '@/components/shared/Paper';
import Testimonials from '@/components/home/Testimonials';
import { JOIN_CTA_LABEL, MEMBERSHIP_PRICE_YEAR, MONTHLY_PLAN_PRICE_MONTH } from '@/lib/membership';

const ABOUT_DESC =
  "I'm Amelie, former teacher (B.Ed, M.Ed, 15 years) and mom of two. I watched kids become less independent over 15 years in the classroom. Anywhere Learning is the hands-on, real-world activities I built so any parent can change that.";
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
        alt: 'Amelie Drouin, former teacher and founder of Anywhere Learning',
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
    title: 'The world is the classroom',
    description:
      'Kitchens, parks, airports, backyards. Learning happens everywhere once you know what to look for.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 11l9-7 9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-5h6v5" />
      </svg>
    ),
  },
  {
    title: 'Together, side by side',
    description:
      'Every activity is built for parent and kid to do together: you, doing real things with your kid.',
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
    title: 'Low prep, no stress',
    description:
      'Open it, pick an activity, go. I do the thinking so you can be present.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 12l5 5L20 6" />
      </svg>
    ),
  },
  {
    title: 'Flexible by design',
    description:
      'No schedules, no sequences. Use the guides at home, travelling, or anywhere in between.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 17c4-6 8-6 12 0s6 4 6 0" />
        <path d="M3 7c4-6 8-6 12 0s6 4 6 0" />
      </svg>
    ),
  },
];

const approaches: Array<{ label: string }> = [
  { label: 'Public school' },
  { label: 'Private school' },
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
    'Former classroom teacher (B.Ed, M.Ed) with 15 years of experience who saw kids becoming less independent and resourceful. Creator of Anywhere Learning, hands-on real-world activities that carry academics and life skills in the same task.',
  url: 'https://anywherelearning.co/about',
  image: 'https://anywherelearning.co/amelie.jpg',
  nationality: { '@type': 'Country', name: 'Canada' },
  sameAs: [
    'https://www.wikidata.org/wiki/Q139595767',
    'https://ca.pinterest.com/anywherelearning/',
    'https://www.instagram.com/anywherelearning',
    'https://www.facebook.com/anywherelearning.co',
    'https://www.youtube.com/@Anywhere_Learning',
  ],
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
    'Real-world learning',
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

const BELIEF_MAGNETS = ['#588157', '#C97B5C', '#d4a373', '#3A5A40'];
const BELIEF_TILT = [-1.5, 1, -1, 1.5];

/** A photo in a white border, taped at the top, with an optional caption. */
function Snapshot({
  src,
  alt,
  caption,
  rot = 0,
  aspect = 'aspect-[4/3]',
  sizes = '260px',
  priority = false,
  className = '',
}: {
  src: string;
  alt: string;
  caption?: string;
  rot?: number;
  aspect?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure
      className={`relative m-0 bg-white p-2.5 pb-3 ${PAPER_SHADOW} ${className}`}
      style={{ transform: `rotate(${rot}deg)` }}
    >
      <Tape />
      <div className={`relative ${aspect} overflow-hidden`}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
      {caption && (
        <figcaption className="mt-2 text-center font-display text-[15px] italic text-gray-700">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {/* The whole page is a letter from Amelie, taped to the fridge in
          sheets, with photos clipped around it. */}
      <main className="overflow-hidden bg-[#E9EEE6]">
        {/* ── 01 Letter, page one: who I am ── */}
        <header className="px-4 pb-8 pt-10 sm:px-6 md:pt-14">
          <div className="relative mx-auto max-w-[780px]">
            <div className={`relative -rotate-[0.5deg] bg-[#FFFDF8] p-7 pt-10 md:p-12 ${PAPER_SHADOW}`}>
              <Tape className="left-10 -rotate-6" />
              <Tape className="right-10 rotate-3" color="rgba(169,193,163,0.85)" />
              <p className="inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.18em] text-forest-dark">
                <span className="inline-block h-px w-[22px] bg-forest" />
                I&apos;m Amelie
              </p>
              <h1 className="mt-4 font-display text-[clamp(2.1rem,4.6vw,3.4rem)] leading-[1.05] tracking-tight text-balance">
                After 15 years in the classroom, I left to give my own kids{' '}
                <span className="italic text-forest">something different.</span>
              </h1>
              <p className="mt-5 text-[17.5px] leading-[1.75] text-gray-700">
                I left the classroom for more time with my own kids. Some of it for academics, but
                mostly for what modern childhood doesn&apos;t make room for: planning a meal,
                managing a budget, fixing what&apos;s broken, finishing what they start. The{' '}
                <span className="font-display italic text-forest-dark">real-world skills</span> kids
                rarely get to practice.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['B.Ed', 'M.Ed', '15 yrs in the classroom', 'Mom of 2'].map((cred) => (
                  <span
                    key={cred}
                    className="rounded-full border border-[#D8D4C5] bg-white px-3.5 py-1.5 text-[13px] text-gray-600"
                  >
                    {cred}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-[13px] text-gray-500">
                As heard on the{' '}
                <a
                  href="https://whereparentstalk.com/featured/how-to-teach-kids-life-skills-through-everyday-activities-real-world-learning-that-works/"
                  target="_blank"
                  rel="noopener"
                  className="border-b border-gray-300 pb-px transition-colors hover:border-forest hover:text-forest-dark"
                >
                  Where Parents Talk podcast
                </a>
              </p>
            </div>

            {/* Photos clipped around the letter on wide screens */}
            <div className="absolute -right-60 top-8 hidden w-[240px] xl:block">
              <Snapshot
                src="/about-hero-amelie.jpeg"
                alt="Amelie with her two kids on a mountain hike"
                caption="Us, most days"
                rot={6}
                priority
              />
            </div>
            <div className="absolute -left-56 top-40 hidden w-[200px] xl:block">
              <Snapshot
                src="/images/about/selfie-on-the-rocks.jpg"
                alt="Amelie and her son crouched on the rocks by the water"
                rot={-5}
                aspect="aspect-[3/4]"
              />
            </div>
          </div>

          {/* Same photos, side by side under the letter on smaller screens */}
          <div className="mx-auto mt-10 grid max-w-[560px] grid-cols-2 items-start gap-5 xl:hidden">
            <Snapshot
              src="/about-hero-amelie.jpeg"
              alt="Amelie with her two kids on a mountain hike"
              caption="Us, most days"
              rot={-3}
              aspect="aspect-[3/4]"
              priority
            />
            <Snapshot
              src="/images/about/selfie-on-the-rocks.jpg"
              alt="Amelie and her son crouched on the rocks by the water"
              rot={3}
              aspect="aspect-[3/4]"
            />
          </div>
        </header>

        {/* ── 02 Letter, page two: what I saw in the classroom ── */}
        <section className="px-4 py-8 sm:px-6">
          <div className="relative mx-auto max-w-[740px]">
            <div className="absolute -right-60 top-10 hidden w-[220px] xl:block">
              <Snapshot
                src="/images/about/family-selfie.jpg"
                alt="Amelie and her two kids in life jackets on a boat"
                caption="My two"
                rot={5}
                aspect="aspect-[4/3]"
              />
            </div>
            <div className="absolute -left-60 top-[45%] hidden w-[220px] xl:block">
              <Snapshot
                src="/images/about/hiking-trail.jpg"
                alt="Two kids hiking a rocky mountain trail"
                rot={-4}
                aspect="aspect-[4/3]"
              />
            </div>
          <div className={`relative rotate-[0.6deg] bg-[#FFFDF8] p-7 pt-10 md:p-12 ${PAPER_SHADOW}`}>
            <Tape className="left-1/2 -translate-x-1/2 rotate-2" />
            <div className="space-y-6 text-[17.5px] leading-[1.78] text-gray-700">
              <p>
                <span className="float-left pr-3 pt-1.5 font-display text-[60px] italic leading-none text-forest md:text-[72px]">
                  I
                </span>
                loved teaching. The moments when something clicked, the small daily wins, the days
                kids were genuinely happy to be there.
              </p>
              <p>
                But over the years, a pattern kept showing up. Kids weren&apos;t less capable. They
                just had fewer chances to practice. Days scheduled wall to wall, screens filling the
                in-between hours, and most chores and decisions handled by adults before kids got to
                try. The <span className="font-display italic text-ink">real-world muscle</span>{' '}
                builds through repetition, and they weren&apos;t getting the reps.
              </p>
              <p>
                I saw it in class every day. Kids who waited to be told what to do the moment a task
                came without step-by-step instructions. Kids who stopped after one wrong answer. And
                I couldn&apos;t close that gap from inside the classroom, not in the time we had.
              </p>
              <p>
                Then I looked at my own kids, 12 and 9, living the same childhood I worried about
                for everyone else&apos;s.{' '}
                <span className="font-display italic text-ink">
                  Growing up in the days I wasn&apos;t home.
                </span>{' '}
                So after 15 years, I made the hardest call of my career and came home to them.
              </p>
            </div>
          </div>
          </div>
          <Snapshot
            src="/about-leap.jpg"
            alt="Amelie and her kids at a mountain lake"
            caption="Coming home."
            rot={-2}
            aspect="aspect-[16/10]"
            sizes="(max-width: 640px) 90vw, 520px"
            className="mx-auto -mt-2 w-[88%] max-w-[520px]"
          />
        </section>

        {/* ── 03 Letter, page three: what we do now ── */}
        <section className="px-4 py-8 sm:px-6">
          <div className="relative mx-auto max-w-[740px]">
            <div className="absolute -left-56 top-16 hidden w-[220px] xl:block">
              <Snapshot
                src="/images/about/holding-a-find.jpg"
                alt="Amelie's son holding a find in his open hands"
                rot={-5}
                aspect="aspect-[3/4]"
              />
            </div>
            <div className="absolute -right-60 top-[50%] hidden w-[220px] xl:block">
              <Snapshot
                src="/images/about/paddleboard.jpg"
                alt="Amelie's daughter paddleboarding on a mountain lake at sunset"
                rot={4}
                aspect="aspect-[4/3]"
              />
            </div>
          <div className={`relative -rotate-[0.5deg] bg-[#FFFDF8] p-7 pt-10 md:p-12 ${PAPER_SHADOW}`}>
            <Tape className="left-12 -rotate-3" color="rgba(169,193,163,0.85)" />
            <p className="inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.18em] text-forest-dark">
              <span className="inline-block h-px w-[22px] bg-forest" />
              The shift
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.7rem,3.4vw,2.5rem)] leading-[1.1] tracking-tight text-balance">
              I came home for more time with my kids. And built{' '}
              <span className="italic text-forest">something for any parent</span> who wants the
              same.
            </h2>
            <div className="mt-7 space-y-6 text-[17.5px] leading-[1.78] text-gray-700">
              <p>
                We still do math, reading and writing, just not at a separate desk. Planning a meal
                is fractions and budgeting. Fixing the bike is measurement. Running a small business
                is pricing, writing and negotiating. The skills and the schoolwork arrive in the same
                task, and that is the part{' '}
                <span className="font-display italic text-ink">
                  a school day never quite has room for.
                </span>
              </p>
              <p>
                Most of our days happen at the kitchen table, in the backyard, at the grocery store
                or halfway up a hiking trail. Nobody is miserable, I&apos;m not exhausted, and my
                kids are more engaged than I&apos;ve ever seen them.
              </p>
              <p>
                I started writing simple guides for our own days, and Anywhere Learning grew out of
                them. Not a curriculum, not a replacement for school. Just the thinking, planning and
                prep already done,{' '}
                <span className="font-display italic text-ink">built by a teacher</span>, so you can
                spend your time doing things with your kids. At home, on the road, or on weekends and
                summers around school.
              </p>
            </div>
            <p className="mt-7 font-display text-[26px] italic text-[#C97B5C]">xo, Amelie</p>
          </div>
          </div>

          {/* The same two photos under the letter on smaller screens */}
          <div className="mx-auto mt-10 grid max-w-[560px] grid-cols-2 items-start gap-5 xl:hidden">
            <Snapshot
              src="/images/about/holding-a-find.jpg"
              alt="Amelie's son holding a find in his open hands"
              rot={-3}
              aspect="aspect-[3/4]"
            />
            <Snapshot
              src="/images/about/paddleboard.jpg"
              alt="Amelie's daughter paddleboarding on a mountain lake at sunset"
              rot={3}
              aspect="aspect-[3/4]"
            />
          </div>
        </section>

        {/* ── 04 What I believe: four cards held by magnets ── */}
        <section className="px-6 py-12 md:py-14">
          <div className="mx-auto max-w-[1080px]">
            <h2 className="mx-auto max-w-[680px] text-center font-display text-[clamp(1.75rem,3.6vw,2.5rem)] leading-[1.1] tracking-tight text-balance">
              Learning should fit your life,{' '}
              <span className="italic text-forest">not the other way around.</span>
            </h2>
            <ul className="m-0 mt-10 grid list-none gap-x-5 gap-y-8 p-0 sm:grid-cols-2 lg:grid-cols-4">
              {beliefs.map((b, i) => (
                <li
                  key={b.title}
                  className={`relative bg-white p-6 pt-8 ${PAPER_SHADOW}`}
                  style={{ transform: `rotate(${BELIEF_TILT[i]}deg)` }}
                >
                  <Magnet color={BELIEF_MAGNETS[i]} />
                  <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#F2EFE4] text-forest-dark">
                    {b.icon}
                  </div>
                  <h3 className="mt-3 font-display text-[20px] leading-tight tracking-tight">{b.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-[1.6] text-gray-600">{b.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 05 For every family ── */}
        <section className="px-6 pb-14">
          <div className="mx-auto grid max-w-[1000px] items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
            <div className="max-md:text-center">
              <h2 className="font-display text-[clamp(1.75rem,3.6vw,2.5rem)] leading-[1.1] tracking-tight text-balance">
                You don&apos;t have to leave school to{' '}
                <span className="italic text-forest">build real skills.</span>
              </h2>
              <p className="mt-4 text-[17px] leading-[1.65] text-gray-600">
                You don&apos;t need to homeschool. If your kids are in school, this is your weekends,
                summers and the hour after dinner. If you homeschool or worldschool, it slots right
                into your day.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 max-md:justify-center">
                {approaches.map((a) => (
                  <span
                    key={a.label}
                    className="rounded-full bg-white px-4 py-2 text-[14px] font-medium text-ink shadow-[0_4px_10px_-6px_rgba(45,58,46,0.35)]"
                  >
                    {a.label}
                  </span>
                ))}
              </div>
            </div>
            <Snapshot
              src="/about-family.jpg"
              alt="The whole family on a backcountry adventure in the snow"
              caption="Us, doing the work."
              rot={3}
              aspect="aspect-[4/5]"
              sizes="(max-width: 768px) 80vw, 380px"
              className="mx-auto w-[82%] max-w-[380px]"
            />
          </div>
        </section>

        {/* ── 06 In their words: third-party credibility ── */}
        <Testimonials />

        {/* ── 07 Final CTA: a note pinned to the fridge ── */}
        <section className="px-6 py-14 md:py-16">
          <div className={`relative mx-auto max-w-[680px] -rotate-1 bg-forest-dark p-8 pt-11 text-center text-cream md:p-11 md:pt-12 ${PAPER_SHADOW}`}>
            <Magnet color="#C97B5C" size={28} />
            <h2 className="font-display text-[clamp(1.9rem,4.2vw,2.9rem)] leading-[1.06] tracking-tight text-balance">
              Ready to try a <span className="italic text-gold-light">different kind</span> of
              learning?
            </h2>
            <p className="mx-auto mt-4 max-w-[500px] text-[17px] leading-[1.55] text-cream/80">
              Start with the free guide, or unlock the full library as a founding member.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/start-trial"
                className="inline-flex items-center gap-2 rounded-xl bg-cream px-6 py-3.5 text-[15.5px] font-semibold text-forest-dark no-underline transition-colors hover:bg-white"
              >
                {JOIN_CTA_LABEL}, {MEMBERSHIP_PRICE_YEAR} <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link
                href="/free-guide"
                className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-cream/70 px-5 py-3 text-[15px] font-semibold text-cream no-underline transition-colors hover:bg-white/10"
              >
                Get your free guide <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
            <Link
              href="/shop"
              className="mt-5 inline-block border-b border-cream/40 pb-0.5 text-[14.5px] font-medium text-cream/80 no-underline transition-colors hover:text-cream"
            >
              Or browse the activities &rarr;
            </Link>
            <p className="mt-6 text-[13px] leading-[1.6] text-cream/70">
              Founder rate {MEMBERSHIP_PRICE_YEAR} locked in for life, or {MONTHLY_PLAN_PRICE_MONTH}
              {' · '}14-day money-back guarantee{' · '}No credit card to try the free guide
            </p>
            <p className="mt-2 text-[13px] text-cream/70">
              Anywhere Learning is 100% secular. Part of the{' '}
              <a
                href="https://seahomeschoolers.com/"
                target="_blank"
                rel="noopener"
                className="border-b border-cream/40 pb-px text-cream/85 hover:text-cream"
              >
                SEA Homeschoolers
              </a>{' '}
              community.
            </p>
            <p className="mt-7 font-display text-[24px] italic text-gold-light">xo, Amelie</p>
          </div>
        </section>
      </main>
    </>
  );
}
