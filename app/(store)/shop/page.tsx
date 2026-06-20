import type { Metadata } from 'next';
import Link from 'next/link';
import { getFallbackProducts, type FallbackProduct } from '@/lib/fallback-products';
import EmailForm from '@/components/EmailForm';
import ScrollReveal from '@/components/shared/ScrollReveal';
import LibraryFilters, { type LibraryRow } from './LibraryFilters';
import { SKILL_FAMILIES, getProductSkills } from '@/lib/skills';
import CategoryCoverCarousel from './CategoryCoverCarousel';
import BrowseAllLink from './BrowseAllLink';
import {
  IS_FOUNDER_PHASE,
  MEMBERSHIP_PRICE,
  MEMBERSHIP_PRICE_YEAR,
  MEMBERSHIP_PRICE_YR,
  MEMBERSHIP_PRICE_USD,
  POST_FOUNDER_PRICE_USD,
  FOUNDER_CAP,
  JOIN_CTA_LABEL,
  RATE_LABEL_LOWER,
  TIER_LABEL_LOWER,
} from '@/lib/membership';

export const metadata: Metadata = {
  title: 'The Library',
  description:
    'A toolkit for real life. Hands-on activities for the skills modern childhood does not make space for. Cooking, budgeting, building, pitching, planning. Designed by a teacher, for parents who want their kids capable, ready for real life.',
  alternates: { canonical: 'https://anywherelearning.co/shop' },
  openGraph: {
    title: 'The Library | Anywhere Learning',
    description:
      'A toolkit for real life. 100+ hands-on activities across nine categories, for kids 6 to 14.',
    url: 'https://anywherelearning.co/shop',
    type: 'website',
  },
};

interface Track {
  category: string;
  num: string;
  label: string;
  imgBg: string;
  color: string;
  deep: string;
  soft: string;
  spineColor: string;
  spineHeight: string;
  motif: string;
  headline: React.ReactNode;
  lead: string;
  ornamentAlt: string;
  skills: string[];
}

const TRACKS: Track[] = [
  {
    category: 'real-world-math',
    num: '01',
    label: 'Real-World Math',
    imgBg: '#DDE5D2',
    color: '#588157',
    deep: '#3A5A40',
    soft: '#E6EBDF',
    spineColor: '#588157',
    spineHeight: '95%',
    motif: '$',
    headline: (
      <>
        Math your kids will <em className="not-italic italic text-forest">actually use.</em>
      </>
    ),
    lead: 'Budgeting, shopping, cooking math, real spending decisions. Math that points at something kids care about, taught the way it actually shows up in life.',
    ornamentAlt: 'Money + math symbol',
    skills: [
      'Budgeting',
      'Mental math',
      'Cost comparison',
      'Estimation',
      'Smart spending',
      'Financial literacy',
      'Decision-making',
    ],
  },
  {
    category: 'entrepreneurship',
    num: '02',
    label: 'Entrepreneurship',
    imgBg: '#F2DECF',
    color: '#C97B5C',
    deep: '#7A3D24',
    soft: '#F2DECF',
    spineColor: '#C97B5C',
    spineHeight: '88%',
    motif: '¢',
    headline: (
      <>
        Plan, build, and pitch{' '}
        <em className="not-italic italic" style={{ color: '#C97B5C' }}>
          real (small) businesses.
        </em>
      </>
    ),
    lead: 'From a backyard lemonade stand to a Shark Tank pitch, these activities walk kids through the actual mechanics of building something people want. Brand, price, sell, learn.',
    ornamentAlt: 'Cents symbol',
    skills: [
      'Pitching',
      'Pricing',
      'Branding',
      'Customer empathy',
      'Resilience',
      'Risk-taking',
      'Negotiation',
      'Marketing',
    ],
  },
  {
    category: 'ai-literacy',
    num: '03',
    label: 'AI & Digital Literacy',
    imgBg: '#F5E7BC',
    color: '#B6913F',
    deep: '#7A5E1F',
    soft: '#F5E7BC',
    spineColor: '#B6913F',
    spineHeight: '100%',
    motif: '⌘',
    headline: (
      <>
        Smart, critical,{' '}
        <em className="not-italic italic" style={{ color: '#B6913F' }}>
          responsible tech use.
        </em>
      </>
    ),
    lead: "Your kids will use AI every day of their adult lives. These activities teach them how. What AI can do, where it bluffs, how algorithms shape what they see, and what it means to live with a digital footprint.",
    ornamentAlt: 'Command key symbol',
    skills: [
      'Critical thinking',
      'Source-checking',
      'Bias awareness',
      'Digital safety',
      'Prompting',
      'Pattern recognition',
      'Tech ethics',
    ],
  },
  {
    category: 'communication-writing',
    num: '04',
    label: 'Communication & Writing',
    imgBg: '#CFDCC4',
    color: '#3A5A40',
    deep: '#26331F',
    soft: '#CFDCC4',
    spineColor: '#3A5A40',
    spineHeight: '92%',
    motif: '✎',
    headline: (
      <>
        Real-world writing for kids who{' '}
        <em className="not-italic italic" style={{ color: '#3A5A40' }}>
          have something to say.
        </em>
      </>
    ),
    lead: 'Not five-paragraph essays. Real letters. Real interviews. Real product reviews. Writing as a tool for getting heard, getting things done, and being understood.',
    ornamentAlt: 'Pencil symbol',
    skills: [
      'Storytelling',
      'Public speaking',
      'Persuasion',
      'Active listening',
      'Clear instructions',
      'Audience awareness',
      'Interviewing',
    ],
  },
  {
    category: 'planning-problem-solving',
    num: '05',
    label: 'Planning & Problem-Solving',
    imgBg: '#DDE5D2',
    color: '#588157',
    deep: '#3A5A40',
    soft: '#E6EBDF',
    spineColor: '#588157',
    spineHeight: '100%',
    motif: '⊞',
    headline: (
      <>
        Tackle real logistics,{' '}
        <em className="not-italic italic text-forest">plan real adventures.</em>
      </>
    ),
    lead: 'Plan a Saturday on $30. Fix what broke. Pack for a real trip. The skill of breaking a fuzzy problem into clear steps, quietly built one activity at a time.',
    ornamentAlt: 'Grid + planning symbol',
    skills: [
      'Prioritization',
      'Sequencing',
      'Logistics',
      'Adaptability',
      'Resourcefulness',
      'Time management',
      'Decision-making',
    ],
  },
  {
    category: 'creativity-maker',
    num: '06',
    label: 'Creativity & Maker',
    imgBg: '#F2DECF',
    color: '#C97B5C',
    deep: '#7A3D24',
    soft: '#F2DECF',
    spineColor: '#A85A38',
    spineHeight: '85%',
    motif: '✂',
    headline: (
      <>
        Open-ended projects that{' '}
        <em className="not-italic italic" style={{ color: '#C97B5C' }}>
          build design thinking.
        </em>
      </>
    ),
    lead: 'Not glittery crafts. Real creative problem-solving. Invent something, design something, build something, and live with what you made. The skills behind every invention, every business, every solution.',
    ornamentAlt: 'Scissors symbol',
    skills: [
      'Design thinking',
      'Iteration',
      'Hands-on building',
      'Systems thinking',
      'Invention',
      'Visual planning',
      'Prototyping',
    ],
  },
  {
    category: 'outdoor-learning',
    num: '07',
    label: 'Outdoor & Nature',
    imgBg: '#CFDCC4',
    color: '#3A5A40',
    deep: '#26331F',
    soft: '#CFDCC4',
    spineColor: '#3A5A40',
    spineHeight: '100%',
    motif: '☘',
    headline: (
      <>
        Backyards, parks, and trails{' '}
        <em className="not-italic italic" style={{ color: '#3A5A40' }}>
          as classrooms.
        </em>
      </>
    ),
    lead: 'The most underrated educational space on the planet is the patch of grass behind the house. These activities turn outside time into learning time without any kid noticing the difference.',
    ornamentAlt: 'Shamrock symbol',
    skills: [
      'Observation',
      'Curiosity',
      'Risk assessment',
      'Independence',
      'Sensory engagement',
      'Environmental awareness',
      'Physical confidence',
    ],
  },
  {
    category: 'worldschooling',
    num: '08',
    label: 'Worldschooling',
    imgBg: '#DAD7CD',
    color: '#8A8470',
    deep: '#5A5240',
    soft: '#DAD7CD',
    spineColor: '#8A8470',
    spineHeight: '90%',
    motif: '✈',
    headline: (
      <>
        Travel-ready learning for{' '}
        <em className="not-italic italic" style={{ color: '#8A8470' }}>
          families exploring the world.
        </em>
      </>
    ),
    lead: "Whether you're worldschooling full-time or just on a two-week trip. These are the activities that turn travel into learning. Cultural curiosity, currency math, and real-world communication wherever you land.",
    ornamentAlt: 'Plane symbol',
    skills: [
      'Cultural curiosity',
      'Adaptability',
      'Cross-cultural communication',
      'Geography',
      'Empathy',
      'Travel logistics',
      'Currency conversion',
    ],
  },
  {
    category: 'emotional-social-skills',
    num: '09',
    label: 'Emotional & Social Skills',
    imgBg: '#F4E4E9',
    color: '#B6748A',
    deep: '#7A4858',
    soft: '#F4E4E9',
    spineColor: '#B6748A',
    spineHeight: '93%',
    motif: '♡',
    headline: (
      <>
        Tools for big feelings and{' '}
        <em className="not-italic italic" style={{ color: '#B6748A' }}>
          real connection.
        </em>
      </>
    ),
    lead: "The skills modern childhood doesn't make space for. Naming a feeling, repairing after a fight, sitting with disappointment, doing hard things alone. Real self-regulation and social skills built one practice at a time.",
    ornamentAlt: 'Heart symbol',
    skills: [
      'Self-regulation',
      'Emotional awareness',
      'Empathy',
      'Resilience',
      'Conflict resolution',
      'Independence',
      'Communication',
    ],
  },
];

function bucketForAge(range: string | null | undefined): { min: number; max: number; label: string } {
  if (!range) return { min: 6, max: 14, label: 'Ages 6 to 14' };
  const m = range.replace(/–/g, '-').match(/(\d+)\s*-\s*(\d+)/);
  if (m) return { min: parseInt(m[1], 10), max: parseInt(m[2], 10), label: range };
  return { min: 6, max: 14, label: range };
}

export default function ShopPage() {
  const products = getFallbackProducts().filter(
    (p) => p.category !== 'bundle' && p.category !== 'start-here',
  );

  // Build rows for the full library list
  const rows: LibraryRow[] = products.map((p): LibraryRow => {
    const track = TRACKS.find((t) => t.category === p.category);
    const age = bucketForAge(p.ageRange);
    const skills = getProductSkills(p.slug);
    return {
      slug: p.slug,
      title: p.name,
      excerpt: p.shortDescription,
      category: p.category,
      trackLabel: track?.label || p.category,
      trackColor: track?.color || '#588157',
      ageRange: age.label,
      ageMin: age.min,
      ageMax: age.max,
      skillFamilies: skills?.families || [],
      imageUrl: p.imageUrl ?? null,
    };
  });

  const totalActivities = products.length;

  // Pick top 4 activities per category for the inline category lists
  const productsByCategory: Record<string, FallbackProduct[]> = {};
  for (const p of products) {
    (productsByCategory[p.category] ||= []).push(p);
  }

  // Per-category cover order tweaks: featured activity first in each carousel
  const featuredFirst: Record<string, string> = {
    'outdoor-learning': 'outdoor-stem-challenges',
    'creativity-maker': 'imaginary-world',
    'planning-problem-solving': 'travel-day',
    'communication-writing': 'family-debate-night',
    'ai-literacy': 'ai-basics',
  };
  for (const [cat, slug] of Object.entries(featuredFirst)) {
    const arr = productsByCategory[cat];
    if (!arr) continue;
    const idx = arr.findIndex((p) => p.slug === slug);
    if (idx > 0) {
      const [item] = arr.splice(idx, 1);
      arr.unshift(item);
    }
  }

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'The Library',
    description:
      'A toolkit for real life. 100+ hands-on activities across nine categories, for kids 6 to 14.',
    url: 'https://anywherelearning.co/shop',
    publisher: {
      '@type': 'Organization',
      name: 'Anywhere Learning',
      url: 'https://anywherelearning.co',
    },
  };

  // Book-spine shelf rendered as a local helper so we can show it in two
  // places without duplicating ~80 lines of styled JSX:
  //   - desktop: in the right column (unchanged)
  //   - mobile:  inline between the headline and the descriptive paragraph
  //              (per design: hero sits between title and description)
  const BookShelf = () => (
    <div className="relative py-6">
      <div
        role="list"
        aria-label="Library categories"
        className="relative flex items-end justify-center px-3 pb-4"
        style={{
          gap: '6px',
          height: '380px',
          transform: 'rotate(-1.5deg)',
        }}
      >
        {TRACKS.map((t, i) => (
          <Link
            key={t.category}
            href={`#track-${t.category}`}
            aria-label={`Jump to ${t.label} section`}
            className="relative shelf-spine transition-transform duration-200 ease-out hover:-translate-y-1.5 hover:shadow-[inset_0_4px_0_rgba(255,255,255,0.16),0_22px_32px_-18px_rgba(45,58,46,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            style={{
              flex: '1 1 0',
              minWidth: 0,
              height: t.spineHeight,
              minHeight: '220px',
              background: t.spineColor,
              borderRadius: '6px 6px 2px 2px',
              color: '#fff',
              boxShadow:
                'inset 0 4px 0 rgba(255,255,255,0.12), inset 0 -6px 0 rgba(0,0,0,0.12), 0 14px 22px -14px rgba(45,58,46,0.45)',
              overflow: 'visible',
              textDecoration: 'none',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '10px',
                left: 0,
                right: 0,
                textAlign: 'center',
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                top: '36px',
                width: '18px',
                height: '1px',
                background: 'rgba(255,255,255,0.45)',
              }}
            />
            <span
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%) rotate(-90deg)',
                transformOrigin: 'center',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-body)',
                fontSize: '12.5px',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: '#FAF9F6',
                letterSpacing: '0.18em',
                overflow: 'visible',
              }}
            >
              {t.label}
            </span>
          </Link>
        ))}
      </div>
      <div
        style={{
          width: '90%',
          margin: '0 auto',
          height: '8px',
          background: 'linear-gradient(180deg, #DAD7CD 0%, #C9C5B7 100%)',
          borderRadius: '0 0 6px 6px',
          boxShadow: '0 12px 24px -14px rgba(45,58,46,0.32)',
        }}
      />
      <p className="mt-5 text-center font-display italic text-[17px] text-[#C97B5C]">
        100+ activities. Nine categories.{' '}
        <span className="italic">One toolkit.</span>
      </p>
    </div>
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <main className="bg-cream">
        {/* 01 HERO */}
        <section className="bg-cream pt-16 md:pt-20 pb-12 md:pb-16">
          <div className="mx-auto max-w-[1180px] px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1.18fr_0.82fr] gap-12 lg:gap-16 items-center">
              <ScrollReveal direction="right">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                    <span className="w-[22px] h-px bg-forest inline-block" />
                    The library
                  </p>
                  <h1 className="font-display text-[clamp(2.5rem,5.8vw,4.25rem)] leading-[1.04] tracking-tight mt-4 text-balance">
                    A toolkit for real life.{' '}
                    <span className="italic text-forest">Browse the full library.</span>
                  </h1>

                  {/* Mobile-only hero: sits between headline and description.
                      Desktop keeps the shelf in the right column (below).
                      Negative top/bottom margins tighten the gap to the
                      surrounding text (BookShelf has its own internal py-6). */}
                  <div className="lg:hidden mt-2 -mb-4 -mx-1">
                    <BookShelf />
                  </div>

                  <p className="mt-5 max-w-[540px] text-[17.5px] md:text-[18.5px] leading-[1.55] text-gray-600">
                    Hands-on activities for the skills modern childhood doesn&apos;t make space
                    for. Cooking, budgeting, building, pitching, planning. Designed by a teacher,
                    for parents who want their kids{' '}
                    <span className="font-display italic text-forest-dark">
                      capable, ready for real life.
                    </span>
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {['Ages 6 to 14', '3 skill levels', 'New each quarter'].map(
                      (pill) => (
                        <span
                          key={pill}
                          className="inline-flex items-center gap-1.5 bg-[#F2EFE4] text-gray-600 font-medium text-[13px] px-3.5 py-1.5 rounded-full whitespace-nowrap"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-forest" aria-hidden="true" />
                          {pill}
                        </span>
                      ),
                    )}
                  </div>
                  <div className="mt-8 flex flex-wrap gap-3.5">
                    <Link
                      href="/start-trial"
                      className="inline-flex items-center gap-2.5 bg-forest text-cream font-semibold py-3.5 px-6 rounded-xl text-[15.5px] shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_-1px_0_rgba(0,0,0,0.10)_inset,0_12px_26px_-14px_rgba(58,90,64,0.55)] hover:bg-forest-dark hover:-translate-y-px transition-all duration-200"
                    >
                      Unlock everything &mdash; {MEMBERSHIP_PRICE_YR}
                      <span className="inline-grid place-items-center w-[22px] h-[22px] rounded-full bg-white/[0.18]">
                        &rarr;
                      </span>
                    </Link>
                    <Link
                      href="/shop/starter-pack"
                      className="inline-flex items-center gap-2.5 border-[1.5px] border-forest text-forest-dark font-semibold py-[14px] px-[22px] rounded-xl text-[15px] hover:bg-[#E6EBDF] hover:-translate-y-px transition-all duration-200"
                    >
                      Or try the Starter Pack
                      <span className="font-display italic text-base">&rarr;</span>
                    </Link>
                  </div>
                  <p className="mt-4 text-[13.5px] text-gray-500">
                    Already know what you want?{' '}
                    <a
                      href="#full-library"
                      className="font-semibold text-forest-dark border-b border-forest/30 hover:text-forest hover:border-forest transition-colors"
                    >
                      Skip to the library &rarr;
                    </a>
                  </p>
                </div>
              </ScrollReveal>

              {/* Book-spine shelf — desktop only. On mobile the same shelf
                  renders inline between the headline and description above. */}
              <ScrollReveal direction="left" delay={100} className="hidden lg:block">
                <BookShelf />
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* 02 THREE PATHS */}
        <section className="bg-cream pb-14">
          <div className="mx-auto max-w-[1180px] px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <Link
                href="/free-guide"
                className="bg-cream border border-[#D8D4C5] rounded-[14px] p-5 flex items-center justify-between gap-4 hover:-translate-y-0.5 hover:shadow-[0_16px_28px_-22px_rgba(45,58,46,0.24)] hover:border-[#C9C5B7] transition-all duration-200 no-underline text-ink"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gray-500 mb-1.5">
                    Free
                  </div>
                  <div className="font-display text-[21px] leading-[1.1] text-ink mb-1">
                    Free Starter Guide
                  </div>
                  <p className="text-[13.5px] text-gray-600 leading-[1.45] m-0">
                    7 activities. Sent by email. Zero commitment.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-display text-[24px] leading-none text-ink mb-1.5">$0</div>
                  <span className="font-semibold text-[13px] text-forest-dark border-b border-forest/25 pb-[1px]">
                    Get it &rarr;
                  </span>
                </div>
              </Link>

              <Link
                href="/shop/starter-pack"
                className="bg-[#F2EFE4] border border-[rgba(201,123,92,0.3)] border-l-[3px] border-l-[#C97B5C] rounded-[14px] p-5 flex items-center justify-between gap-4 hover:-translate-y-0.5 hover:shadow-[0_16px_28px_-22px_rgba(45,58,46,0.24)] transition-all duration-200 no-underline text-ink"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#C97B5C] mb-1.5">
                    One-time
                  </div>
                  <div className="font-display text-[21px] leading-[1.1] text-ink mb-1">
                    The Starter Pack
                  </div>
                  <p className="text-[13.5px] text-gray-600 leading-[1.45] m-0">
                    10 of our favorite activities. Yours forever.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-display text-[24px] leading-none text-ink mb-1.5">$44.99</div>
                  <span className="font-semibold text-[13px] text-forest-dark border-b border-forest/25 pb-[1px]">
                    See it &rarr;
                  </span>
                </div>
              </Link>

              <Link
                href="/join"
                className="bg-[#E6EBDF] border border-[#C9D3BE] rounded-[14px] p-5 flex items-center justify-between gap-4 hover:-translate-y-0.5 hover:shadow-[0_16px_28px_-22px_rgba(45,58,46,0.24)] transition-all duration-200 no-underline text-ink"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-forest-dark mb-1.5">
                    Best value
                  </div>
                  <div className="font-display text-[21px] leading-[1.1] text-ink mb-1">
                    Membership
                  </div>
                  <p className="text-[13.5px] text-gray-600 leading-[1.45] m-0">
                    All 100+ activities + quarterly drops.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-display text-[24px] leading-none text-ink mb-1.5">
                    {MEMBERSHIP_PRICE}
                    <small className="text-[12px] text-gray-500 font-body font-normal">/yr</small>
                  </div>
                  <span className="font-semibold text-[13px] text-forest-dark border-b border-forest/25 pb-[1px]">
                    Join &rarr;
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* 03 TRACKS — compact horizontal cards, scales as categories grow */}
        <section className="bg-cream pt-6 pb-2">
          <div className="mx-auto max-w-[1180px] px-6">
            <div className="border-t border-[#D8D4C5]">
              {TRACKS.map((t) => {
                const all = productsByCategory[t.category] || [];
                const count = all.length;
                const covers = all.map((p) => ({
                  src: `/products/${p.slug}.jpg`,
                  alt: `${p.name} cover`,
                }));
                // Aggregate canonical skills across every OCR-extracted product
                // in this category, then take the most common 8 as the section
                // headline pills. Falls back to the hand-curated t.skills only
                // if no product in this category had OCR data.
                const freq = new Map<string, number>();
                for (const p of all) {
                  const s = getProductSkills(p.slug);
                  if (!s) continue;
                  for (const k of s.canonical) freq.set(k, (freq.get(k) || 0) + 1);
                }
                const aggregatedSkills = freq.size > 0
                  ? [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k]) => k)
                  : t.skills;
                return (
                  <article
                    key={t.category}
                    id={`track-${t.category}`}
                    className="border-b border-[#D8D4C5] py-7 md:py-8 scroll-mt-24"
                  >
                    <ScrollReveal>
                      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-5 md:gap-7 items-start">
                        <CategoryCoverCarousel
                          covers={covers}
                          bg={t.imgBg}
                          motif={t.motif}
                          motifColor={t.color}
                        />

                        {/* Content */}
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-3 mb-1.5">
                            <span
                              className="font-display italic text-[40px] md:text-[44px] leading-none tracking-tight"
                              style={{ color: t.color }}
                            >
                              {t.num}
                            </span>
                            <span
                              className="text-[12px] font-semibold uppercase tracking-[0.16em]"
                              style={{ color: t.deep }}
                            >
                              {t.label}
                            </span>
                            <span
                              className="ml-auto text-[12px] font-medium text-gray-500 whitespace-nowrap"
                            >
                              {count} {count === 1 ? 'activity' : 'activities'}
                            </span>
                          </div>
                          <h2 className="font-display text-[clamp(1.4rem,2.4vw,1.875rem)] leading-[1.12] tracking-tight text-balance">
                            {t.headline}
                          </h2>
                          <p className="mt-2 mb-3.5 text-[14.5px] leading-[1.55] text-gray-600 max-w-[640px]">
                            {t.lead}
                          </p>

                          {/* Life skills built across these activities */}
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 mb-2">
                            Skills built
                          </p>
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {aggregatedSkills.map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center text-[12.5px] font-medium px-2.5 py-1 rounded-full"
                                style={{
                                  background: t.soft,
                                  color: t.deep,
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-4 flex-wrap">
                            <BrowseAllLink
                              track={t.category}
                              className="font-semibold text-[13.5px] border-b border-current pb-[1px] opacity-85 hover:opacity-100 transition-opacity"
                              style={{ color: t.deep }}
                            >
                              Browse all {count} &rarr;
                            </BrowseAllLink>
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 04 FULL LIBRARY LIST */}
        <section className="bg-cream pt-12 md:pt-16 pb-8" id="full-library">
          <div className="mx-auto max-w-[1180px] px-6">
            <ScrollReveal>
              <div className="max-w-[760px] mx-auto text-center mb-10">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                  <span className="w-[22px] h-px bg-forest inline-block" />
                  Browse everything
                </p>
                <h2 className="mt-3.5 font-display text-[clamp(1.75rem,3.6vw,2.625rem)] leading-[1.08] tracking-tight text-balance">
                  The full library:{' '}
                  <span className="italic text-forest">100+ activities.</span>
                </h2>
                <p className="mt-3.5 text-[16.5px] text-gray-600">
                  Search, filter, sort. Find exactly what you&apos;re looking for.
                </p>
              </div>
            </ScrollReveal>
            <LibraryFilters
              rows={rows}
              tracks={TRACKS.map((t) => ({ value: t.category, label: t.label }))}
              skills={SKILL_FAMILIES.map((f) => ({ value: f.slug, label: f.name, count: f.count }))}
            />
          </div>
        </section>

        {/* 05 UNLOCK — Membership + Starter Pack side by side */}
        <section className="bg-cream pt-12 md:pt-16 pb-16" id="starter-pack">
          <div className="mx-auto max-w-[1180px] px-6">
            <ScrollReveal>
              <div className="max-w-[760px] mx-auto text-center mb-10">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                  <span className="w-[22px] h-px bg-forest inline-block" />
                  Ready to unlock
                </p>
                <h2 className="mt-3.5 font-display text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.08] tracking-tight text-balance">
                  Two ways in. <span className="italic text-forest">Pick yours.</span>
                </h2>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-7 max-w-[1000px] mx-auto items-stretch">
                {/* Membership (primary) */}
                <div className="bg-[#E6EBDF] border border-[#C9D3BE] rounded-[18px] p-8 md:p-10 flex flex-col">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                    <span className="w-[22px] h-px bg-forest inline-block" />
                    All 100+ activities
                  </p>
                  <h3 className="mt-3.5 font-display text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.1] tracking-tight text-balance">
                    Unlock everything for{' '}
                    <span className="italic text-forest-dark">{MEMBERSHIP_PRICE_YEAR}.</span>
                  </h3>
                  <p className="mt-3.5 text-[15.5px] leading-[1.6] text-gray-600">
                    {IS_FOUNDER_PHASE
                      ? `The full library plus quarterly new content, locked in at $${MEMBERSHIP_PRICE_USD} for life as a founding member. After the first ${FOUNDER_CAP} members, $${POST_FOUNDER_PRICE_USD}/year.`
                      : 'The full library plus quarterly new content. Cancel anytime.'}
                  </p>
                  <div className="mt-5 flex flex-col gap-2 text-[14px] text-gray-700">
                    <span className="inline-flex items-center gap-2"><span className="text-forest font-bold">✓</span> 100+ activities, all categories</span>
                    <span className="inline-flex items-center gap-2"><span className="text-forest font-bold">✓</span> New content every quarter</span>
                    {IS_FOUNDER_PHASE && (
                      <span className="inline-flex items-center gap-2"><span className="text-forest font-bold">✓</span> Founder rate locked for life</span>
                    )}
                  </div>
                  <div className="mt-auto pt-6">
                    <Link
                      href="/start-trial"
                      className="inline-flex items-center gap-2.5 bg-forest text-cream font-semibold py-3.5 px-6 rounded-xl text-[15.5px] shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_-1px_0_rgba(0,0,0,0.10)_inset,0_12px_26px_-14px_rgba(58,90,64,0.55)] hover:bg-forest-dark hover:-translate-y-px transition-all duration-200"
                    >
                      {JOIN_CTA_LABEL}
                      <span className="inline-grid place-items-center w-[22px] h-[22px] rounded-full bg-white/[0.18]">
                        &rarr;
                      </span>
                    </Link>
                    <p className="mt-3 text-[13px] text-gray-500">
                      14-day money-back guarantee &middot; Cancel anytime
                    </p>
                  </div>
                </div>

                {/* Starter Pack (secondary) */}
                <div className="bg-[#F2EFE4] border border-[#D8D4C5] rounded-[18px] p-8 md:p-10 flex flex-col">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7A3D24] inline-flex items-center gap-2.5">
                    <span className="w-[22px] h-px bg-[#C97B5C] inline-block" />
                    Not ready for the membership?
                  </p>
                  <h3 className="mt-3.5 font-display text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.1] tracking-tight text-balance">
                    Start with the{' '}
                    <span className="italic text-[#C97B5C]">Starter Pack.</span>
                  </h3>
                  <p className="mt-3.5 text-[15.5px] leading-[1.6] text-gray-600">
                    10 of our favorite activities across the library. $44.99 one-time. Yours forever.
                    A real entry point into the toolkit, no subscription required.
                  </p>
                  <div className="mt-5 flex flex-col gap-2 text-[14px] text-gray-700">
                    <span className="inline-flex items-center gap-2"><span className="text-[#C97B5C] font-bold">✓</span> 10 of our favorite activities</span>
                    <span className="inline-flex items-center gap-2"><span className="text-[#C97B5C] font-bold">✓</span> One-time $44.99, no subscription</span>
                    <span className="inline-flex items-center gap-2"><span className="text-[#C97B5C] font-bold">✓</span> Yours forever, reusable year after year</span>
                  </div>
                  <div className="mt-auto pt-6">
                    <Link
                      href="/shop/starter-pack"
                      className="inline-flex items-center gap-2.5 border-[1.5px] border-forest text-forest-dark font-semibold py-[14px] px-[22px] rounded-xl text-[15px] hover:bg-[#E6EBDF] hover:-translate-y-px transition-all duration-200"
                    >
                      See the Starter Pack
                      <span className="font-display italic text-base">&rarr;</span>
                    </Link>
                    <p className="mt-3 text-[13px] text-gray-500">
                      Instant download &middot; Yours forever
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 07 EMAIL CAPTURE — compact inline */}
        <section className="bg-cream pt-2 pb-12">
          <div className="mx-auto max-w-[760px] px-6 text-center">
            <ScrollReveal>
              <p className="font-display italic text-[18px] md:text-[20px] text-gray-700 leading-[1.4] max-w-[520px] mx-auto mb-4 text-balance">
                Or just{' '}
                <span className="text-forest-dark">stay in the loop</span>{' '}
                &mdash; new activities and ideas, when we have something worth sharing.
              </p>
              <div className="max-w-[460px] mx-auto">
                <EmailForm variant="light" buttonText="Subscribe" />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 08 FAQ */}
        <section className="bg-cream pb-12">
          <div className="mx-auto max-w-[760px] px-6">
            <ScrollReveal>
              <div className="text-center mb-8">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                  <span className="w-[22px] h-px bg-forest inline-block" />
                  Common questions
                </p>
                <h2 className="font-display text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.08] tracking-tight mt-3.5 text-balance">
                  The library, <span className="italic text-forest">briefly explained.</span>
                </h2>
              </div>
            </ScrollReveal>
            <div className="max-w-[760px] mx-auto">
              {[
                {
                  q: 'Can I buy individual activities?',
                  a: `No. Activities are only available through the membership (${MEMBERSHIP_PRICE_YEAR}${IS_FOUNDER_PHASE ? ' founder rate' : ''}) or the Starter Pack ($44.99 for 10 activities). The free guide is the lowest-commitment way to try us out before deciding.`,
                },
                {
                  q: "What's the difference between the Starter Pack and the membership?",
                  a: `The Starter Pack is 10 of our favorite activities for $44.99 once, yours forever. The membership unlocks everything: 100+ activities, plus new ones every quarter, for ${MEMBERSHIP_PRICE_YEAR}${IS_FOUNDER_PHASE ? ' as a founding member' : ''}. If you want to keep doing real-world learning for a year, the membership is the better deal.`,
                },
              ].map((item, i) => (
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
            <div className="text-center mt-6">
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 text-forest-dark font-semibold text-[14.5px] border-b border-forest/25 pb-[1px] hover:text-forest hover:border-forest-dark transition-colors"
              >
                See all questions
                <span className="font-display italic text-base">&rarr;</span>
              </Link>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
