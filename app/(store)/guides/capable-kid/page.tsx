import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import EmailForm from '@/components/EmailForm';
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
  '@type': 'CreativeWork',
  genre: 'Parenting guide',
  name: 'The Capable Kid Guide',
  description:
    'A free, age-by-age guide to the real-world skills kids can own from 6 to 14, with a simple method for handing each one over. Covers kitchen, money, communication, and self-management.',
  image: 'https://anywherelearning.co/images/capable-kid-cover.jpg',
  url: 'https://anywherelearning.co/guides/capable-kid',
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

// The skills as listed in the guide itself (pages 4 to 6), eight per band.
const AGE_BANDS = [
  {
    band: '6 to 8',
    name: 'The Early Wins',
    color: '#3A5A40',
    note: 'They desperately want to be big. Use it.',
    skills: [
      'A Simple Breakfast',
      'Pour and Pack',
      'Dressed for the Weather',
      'The Morning Routine',
      'Order Their Own Food',
      'Answer the Phone',
      'Pay and Wait for Change',
      'Bed, Pet, and Laundry',
    ],
  },
  {
    band: '9 to 11',
    name: 'Growing Independence',
    color: '#588157',
    note: 'The sweet spot. Push the independence harder than feels comfortable.',
    skills: [
      'Follow a Recipe',
      'Pack and Clear',
      'Make the Call',
      'Introduce Yourself',
      'Save and Wait',
      'Spot the Better Deal',
      'Laundry, Start to Finish',
      'On Time, by the Clock',
    ],
  },
  {
    band: '12 to 14',
    name: 'Real-World Ready',
    color: '#C97B5C',
    note: 'The dress rehearsal for adulthood. Better to fumble it now, with you nearby.',
    skills: [
      'Cook for the Family',
      'Build a Budget',
      'Earn Their Own Money',
      'Make the Appointment',
      'Speak for Themselves',
      'Run Their Own Schedule',
      'Handle an Emergency',
      'Find Their Own Way',
    ],
  },
];

// The four stages from "The method that actually works" (page 2), in the guide's words.
const STAGES = [
  ['Watch me', 'You do the whole thing while they observe and you narrate.'],
  ['Help me', 'They do part, you do the rest. Hand over the easy, safe pieces first.'],
  ['I watch you', 'They do the whole thing while you sit on your hands and let it be slow and imperfect.'],
  ['You are on your own', 'They own it. You stop checking.'],
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

export default function CapableKidGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(guideLd) }}
      />
      <main className="bg-cream">
        {/* ── 01 Hero: the promise and the form, beside a report card and a life card ── */}
        <section className="overflow-hidden bg-forest-dark text-cream">
          <div className="mx-auto grid max-w-[1140px] items-center gap-10 px-6 py-12 md:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
            <div>
              <p className="inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.18em] text-gold-light">
                <span className="inline-block h-px w-[22px] bg-gold-light" />
                Free guide · Ages 6 to 14
              </p>
              <h1 className="mt-4 font-display text-[clamp(2.25rem,5vw,3.9rem)] leading-[1.04] tracking-tight text-balance">
                Raise a kid who can{' '}
                <span className="italic text-gold-light">figure things out.</span>
              </h1>
              <p className="mt-5 max-w-[520px] text-[18px] leading-[1.6] text-cream/80">
                A free, age-by-age guide to what your kid can{' '}
                <span className="font-display italic text-cream">actually do</span> from 6 to 14,
                and how to hand each skill over without the meltdown. Built by a former teacher.
              </p>
              <div className="mt-7 max-w-[500px] rounded-[16px] bg-cream p-4 text-[#2b2a26]">
                <EmailForm
                  variant="light"
                  guide={GUIDE}
                  buttonText="Send me the guide"
                  successBody="While you wait, the membership turns every skill in here into a done-for-you activity."
                />
              </div>
            </div>

            <figure className="m-0">
              <div className="relative mx-auto h-[385px] w-full max-w-[440px] sm:h-[360px]">
                <div className="absolute left-0 top-4 w-[80%] -rotate-6 sm:w-[66%] rounded-[14px] bg-[#F7F3E8] p-5 text-[#2b2a26] shadow-xl">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">Report card</p>
                  <ul className="m-0 mt-3 list-none space-y-2 p-0">
                    {credentialed.map((c) => (
                      <li key={c} className="flex items-center justify-between gap-3 text-[14px] text-gray-500">
                        {c}
                        <span className="font-display text-[18px] text-gray-400">A+</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="absolute bottom-0 right-0 w-[80%] rotate-3 sm:w-[68%] rounded-[14px] bg-white p-5 text-[#2b2a26] shadow-2xl">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-forest">Life card</p>
                  <ul className="m-0 mt-3 list-none space-y-2 p-0">
                    {capable.map((c) => (
                      <li key={c} className="flex items-center gap-2.5 text-[14.5px] font-semibold">
                        <span
                          aria-hidden="true"
                          className="grid h-5 w-5 shrink-0 place-items-center rounded-[5px] bg-forest text-[11px] text-white"
                        >
                          &#10003;
                        </span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <figcaption className="mt-6 text-center font-display text-[17px] italic leading-snug text-cream/80">
                School measures one. Life asks for the other.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* ── 02 The life card, by age: the 24 skills from the guide ── */}
        <section className="bg-cream py-14 md:py-16">
          <div className="mx-auto max-w-[1140px] px-6">
            <div className="mx-auto max-w-[680px] text-center">
              <h2 className="font-display text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.08] tracking-tight text-balance">
                The life card, <span className="italic text-forest">by age.</span>
              </h2>
              <p className="mt-2 text-[17px] text-gray-600">
                Three age bands, twenty-four real skills.{' '}
                <span className="font-display italic text-forest-dark">Pick one to start.</span>
              </p>
            </div>
            <div className="mt-9 grid gap-5 md:grid-cols-3">
              {AGE_BANDS.map((a) => (
                <div
                  key={a.band}
                  className="rounded-[22px] bg-white p-6 outline-dashed outline-2 outline-offset-[-10px]"
                  style={{ outlineColor: `${a.color}66` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-[23px] leading-tight" style={{ color: a.color }}>
                      {a.name}
                    </h3>
                    <span
                      className="mt-1 shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-bold text-white"
                      style={{ background: a.color }}
                    >
                      Ages {a.band}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[14px] leading-[1.5] text-gray-500">{a.note}</p>
                  <ul className="m-0 mt-4 list-none space-y-2 p-0">
                    {a.skills.map((s) => (
                      <li
                        key={s}
                        className="flex items-center gap-2.5 border-b border-dashed border-[#E6E0CD] pb-2 text-[15px] text-[#2b2a26] last:border-0"
                      >
                        <span
                          aria-hidden="true"
                          className="h-[18px] w-[18px] shrink-0 rounded-[4px] border-2 border-[#CFC9B6]"
                        />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 The method: four stages ── */}
        <section className="border-y border-[#D8D4C5] bg-[#F2EFE4] py-14 md:py-16">
          <div className="mx-auto max-w-[1140px] px-6">
            <div className="mx-auto max-w-[680px] text-center">
              <h2 className="font-display text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.08] tracking-tight text-balance">
                Hand it over <span className="italic text-forest">in stages.</span>
              </h2>
              <p className="mt-2 text-[17px] leading-[1.55] text-gray-600">
                Most of us live in stage one forever because doing it ourselves is faster today. It
                costs capability tomorrow.
              </p>
            </div>
            <ol className="m-0 mt-9 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
              {STAGES.map(([t, d], i) => (
                <li key={t} className="rounded-[16px] border border-[#E2DCC8] bg-white p-5">
                  <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#C97B5C]">
                    Stage {i + 1}
                  </span>
                  <h3 className="mt-1 font-display text-[20px] leading-tight">{t}</h3>
                  <p className="mt-1.5 text-[14.5px] leading-[1.55] text-gray-600">{d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── 04 Final CTA with the cover ── */}
        <section className="bg-cream py-14 md:py-16">
          <div className="mx-auto grid max-w-[980px] items-center gap-10 px-6 md:grid-cols-[260px_1fr]">
            <div className="relative mx-auto aspect-[8.5/11] w-[210px] -rotate-3 overflow-hidden rounded-[14px] border border-[#D8D4C5] shadow-[0_30px_60px_-32px_rgba(45,58,46,0.5)] md:w-full">
              <Image
                src="/images/capable-kid-cover.jpg"
                alt="The Capable Kid Guide free cover"
                fill
                sizes="(max-width: 768px) 210px, 260px"
                quality={85}
                className="object-cover"
              />
            </div>
            <div className="max-md:text-center">
              <h2 className="font-display text-[clamp(2rem,4.6vw,3.1rem)] leading-[1.06] tracking-tight text-balance">
                Pick one skill. <span className="italic text-forest">Hand it over.</span>
              </h2>
              <p className="mt-3 max-w-[500px] text-[17.5px] leading-[1.55] text-gray-600 max-md:mx-auto">
                Get the free guide, choose one skill from your kid&apos;s age band, and start this
                week. No curriculum. Low prep.
              </p>
              <div className="mt-6 max-w-[480px] max-md:mx-auto">
                <EmailForm variant="light" guide={GUIDE} buttonText="Send me the guide" />
              </div>
              <p className="mt-5 text-[14.5px] text-gray-500">
                Already know you want more? The{' '}
                <Link
                  href="/#membership"
                  className="border-b border-forest/25 font-semibold text-forest-dark transition-colors hover:border-forest-dark hover:text-forest"
                >
                  membership
                </Link>{' '}
                turns every skill in this guide into a done-for-you activity
                {IS_FOUNDER_PHASE ? `, ${MEMBERSHIP_PRICE_YEAR} for founding members.` : '.'}
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
