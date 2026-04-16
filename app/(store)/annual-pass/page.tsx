import type { Metadata } from 'next';
import Link from 'next/link';
import ScrollReveal from '@/components/shared/ScrollReveal';
import FAQSection from '@/components/shared/FAQSection';
import AnnualPassCTA from '@/components/annual-pass/AnnualPassCTA';
import { CategoryIcon } from '@/components/shop/icons';

export const metadata: Metadata = {
  title: 'Annual Pass | All Guides, One Price',
  description:
    'Get instant access to every Anywhere Learning activity guide for $99/year. 90+ real-world learning guides for homeschool and worldschool families, with new guides added monthly.',
  openGraph: {
    title: 'Annual Pass | All Guides, One Price',
    description:
      'Get instant access to every Anywhere Learning activity guide for $99/year. 90+ real-world learning guides for homeschool and worldschool families.',
    images: [
      {
        url: 'https://anywherelearning.co/og-default.png',
        width: 1200,
        height: 630,
      },
    ],
  },
};

const faqItems = [
  {
    question: 'What do I get with the Annual Pass?',
    answer:
      'Instant access to every activity guide in the Anywhere Learning store. That includes all individual guides, all bundles, and every new guide we add throughout the year. You can open and use them on any device.',
  },
  {
    question: 'How do I access my guides?',
    answer:
      'After subscribing, sign in and visit your Downloads page. Every guide in the store will be available to open or download. New guides appear automatically as we publish them.',
  },
  {
    question: 'What happens when my year is up?',
    answer:
      'Your pass renews automatically at your locked-in rate. You can cancel anytime from your account. If you cancel, you keep access until the end of your billing period.',
  },
  {
    question: 'I already bought some guides. Is the pass still worth it?',
    answer:
      'If you own 2 or more bundles, the pass gives you everything else for the price of about one more bundle. Plus you get every new guide we add, so the value keeps growing.',
  },
  {
    question: 'Can I still buy individual guides instead?',
    answer:
      'Absolutely. Individual guides and bundles are still available. The Annual Pass is an option for families who want everything without picking and choosing.',
  },
  {
    question: 'How often do you add new guides?',
    answer:
      'We publish at least one new bundle (8-10 guides) every month. Pass members get them automatically at no extra cost.',
  },
  {
    question: 'Is there a monthly option?',
    answer:
      'The Annual Pass is available as a yearly subscription only. This keeps the price low and gives you a full year to explore everything at your own pace.',
  },
];

const categories = [
  { value: 'start-here', name: 'Start Here', desc: 'Future-Ready Skills Map + foundations', count: '4 guides' },
  { value: 'creativity-anywhere', name: 'Creativity Anywhere', desc: 'Open-ended projects, design thinking', count: '10 guides' },
  { value: 'outdoor-learning', name: 'Outdoor Learning', desc: 'Backyard, park, and trail explorations', count: '10 guides' },
  { value: 'ai-literacy', name: 'AI & Digital', desc: 'Critical thinking about tech and AI', count: '10 guides' },
  { value: 'real-world-math', name: 'Real-World Math', desc: 'Budgeting, kitchen math, money skills', count: '10 guides' },
  { value: 'communication-writing', name: 'Communication & Writing', desc: 'Real writing with real purpose', count: '10 guides' },
  { value: 'entrepreneurship', name: 'Entrepreneurship', desc: 'Plan, launch, and pitch real businesses', count: '10 guides' },
  { value: 'planning-problem-solving', name: 'Planning & Problem-Solving', desc: 'Logistics, strategy, real decisions', count: '10 guides' },
  { value: 'bundle', name: 'Seasonal Packs', desc: 'Spring, summer, fall, and winter guides', count: '4 packs' },
];

const comparisonRows = [
  { label: 'Activity guides included', individual: '1', bundle: '8-10', pass: '90+' },
  { label: 'New guides added monthly', individual: false, bundle: false, pass: true },
  { label: 'Access to every category', individual: false, bundle: false, pass: true },
  { label: 'Future-Ready Skills Map', individual: false, bundle: 'Bonus', pass: true },
  { label: 'Seasonal packs', individual: false, bundle: false, pass: true },
  { label: 'Use year after year', individual: true, bundle: true, pass: true },
  { label: 'Open on any device', individual: true, bundle: true, pass: true },
  { label: 'Cancel anytime', individual: 'N/A', bundle: 'N/A', pass: true },
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-forest/10">
        <svg className="w-4 h-4 text-forest" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100">
        <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
    );
  }
  return <span className="text-sm text-gray-700 font-medium">{value}</span>;
}

function PassCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gold/25">
        <svg className="w-4 h-4 text-gold-dark" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100">
        <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
    );
  }
  return <span className="text-sm text-forest font-semibold">{value}</span>;
}

export default function AnnualPassPage() {
  return (
    <main>
      {/* ─── Hero ─── */}
      <section className="relative py-20 md:py-28 bg-forest-section overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-32 -right-32 w-[32rem] h-[32rem] rounded-full bg-gold/5 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-32 w-[32rem] h-[32rem] rounded-full bg-forest-dark/30 blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center relative">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" aria-hidden="true" />
              <p className="text-gold-light font-semibold text-xs tracking-widest uppercase">
                Founding Member Rate
              </p>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-cream leading-[1.1] mb-6 text-balance">
              Every guide.
              <br />
              <span className="text-gold-light">Half the price.</span>
            </h1>
            <p className="text-cream/75 text-lg sm:text-xl max-w-2xl mx-auto">
              Stop choosing between bundles. Get instant access to every activity
              guide in the store, plus every new guide we add throughout the year.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <div className="mt-10 inline-flex flex-col items-center bg-cream rounded-3xl px-8 sm:px-12 py-8 border-2 border-gold shadow-2xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-forest-dark text-gold text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full border border-gold/40">
                Best Value
              </div>
              <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest mb-2 mt-1">
                Annual Pass
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-bold text-forest tracking-tight">$99</span>
                <span className="text-gray-500 text-lg">/year</span>
              </div>
              <div className="flex items-center gap-2 mt-2 mb-6">
                <span className="text-gray-400 text-sm line-through">$149</span>
                <span className="text-gold-dark text-sm font-semibold">Save $50 as founding member</span>
              </div>
              <AnnualPassCTA size="large" variant="forest" className="w-full" />
              <p className="mt-4 text-gray-500 text-xs">
                Cancel anytime &middot; Access through end of billing period
              </p>
            </div>
          </ScrollReveal>

          {/* Social proof bar */}
          <ScrollReveal delay={250}>
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-cream/60 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gold-light" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" /></svg>
                <span>90+ guides ready to open</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gold-light" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>New guides every month</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gold-light" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                <span>Instant access</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── The Math ─── */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <ScrollReveal>
            <p className="text-center text-xs font-semibold text-gold-dark uppercase tracking-widest mb-3">
              The Math
            </p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-forest text-center mb-4 text-balance">
              Buy it all for less than three bundles.
            </h2>
            <p className="text-gray-600 text-center max-w-2xl mx-auto mb-14">
              Adding up individual bundles gets expensive quickly. Here&apos;s what you actually pay with and without the pass.
            </p>
          </ScrollReveal>

          {/* Comparison table */}
          <ScrollReveal delay={100}>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header row */}
              <div className="grid grid-cols-[1.5fr_1fr_1fr_1.2fr] gap-2 sm:gap-4 px-4 sm:px-8 py-5 border-b border-gray-100 bg-warm-gray/40">
                <div />
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Individual</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-700 mt-1">$5 - $9</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Bundle</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-700 mt-1">~$45</p>
                </div>
                <div className="text-center rounded-xl bg-gold/10 -my-2 py-2 relative">
                  <p className="text-xs text-gold-dark uppercase tracking-wider font-semibold">Annual Pass</p>
                  <p className="text-sm sm:text-base font-bold text-forest mt-1">$99/year</p>
                </div>
              </div>

              {/* Rows */}
              {comparisonRows.map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-[1.5fr_1fr_1fr_1.2fr] gap-2 sm:gap-4 px-4 sm:px-8 py-4 items-center ${i !== comparisonRows.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <p className="text-sm sm:text-base text-gray-700">{row.label}</p>
                  <div className="flex justify-center"><Cell value={row.individual} /></div>
                  <div className="flex justify-center"><Cell value={row.bundle} /></div>
                  <div className="flex justify-center bg-gold/5 rounded-xl -my-2 py-2"><PassCell value={row.pass} /></div>
                </div>
              ))}
            </div>

            <p className="text-center text-gray-500 text-sm mt-8">
              Buying every bundle individually would run you over $500. The pass is $99.
              <span className="text-forest font-semibold"> You keep the other $400.</span>
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── What's Included ─── */}
      <section className="py-20 md:py-28 bg-forest-subtle-gradient">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <ScrollReveal>
            <p className="text-center text-xs font-semibold text-gold-dark uppercase tracking-widest mb-3">
              What&apos;s Included
            </p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-forest text-center mb-4 text-balance">
              Nine categories. Zero limits.
            </h2>
            <p className="text-gray-600 text-center max-w-2xl mx-auto mb-14">
              Real-world activities for ages 6 to 14. Low prep, no curriculum, endlessly reusable.
              Every category is yours the moment you subscribe.
            </p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {categories.map((cat, i) => (
              <ScrollReveal key={cat.value} delay={i * 40}>
                <div className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-forest/20 hover:shadow-md transition-all duration-200 h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-forest/8 group-hover:bg-forest/12 flex items-center justify-center flex-shrink-0 transition-colors">
                      <CategoryIcon category={cat.value} className="w-6 h-6 text-forest" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 leading-tight">{cat.name}</h3>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed mb-2">{cat.desc}</p>
                      <p className="text-xs font-medium text-gold-dark">{cat.count}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={200}>
            <div className="mt-12 p-6 sm:p-8 bg-white rounded-2xl border border-gold/20 max-w-3xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-gold-dark" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-2.121 0-3.879-.879-3.879-2.818 0-1.94 1.758-3.182 3.879-3.182.768 0 1.536.219 2.121.659L15 7.318M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">The bonus you don&apos;t have to pay for</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Every new guide we publish goes straight into your library. We ship at least one new bundle (8-10 guides) every month. Your $99 unlocks today&apos;s catalog and tomorrow&apos;s.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <ScrollReveal>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-forest text-center mb-4 text-balance">
              Up and running in under a minute.
            </h2>
            <p className="text-gray-600 text-center max-w-xl mx-auto mb-14">
              No onboarding. No setup. Just sign up and open the guide your kids would love most right now.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Subscribe', desc: 'Check out in under a minute. Founding rate locks in.' },
              { step: '02', title: 'Open your library', desc: 'Every guide appears instantly. Open on any device, no printing needed.' },
              { step: '03', title: 'Keep getting more', desc: 'New guides drop into your library every month. No extra cost, no action needed.' },
            ].map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 120}>
                <div className="relative">
                  <div className="font-display text-6xl text-forest/10 font-bold mb-2 leading-none">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-forest text-xl mb-2">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-20 md:py-28 bg-forest-section relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gold/5 blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center relative">
          <ScrollReveal>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-cream mb-4 text-balance">
              One price. Everything unlocked.
            </h2>
            <p className="text-cream/70 text-lg mb-8 max-w-xl mx-auto">
              Lock in the founding rate of $99/year before it jumps to $149.
              Every new guide, always included.
            </p>
            <AnnualPassCTA size="large" />
            <p className="mt-5 text-cream/40 text-sm">
              Cancel anytime &middot; Keep access through end of billing period
            </p>
            <Link
              href="/shop"
              className="inline-block mt-10 text-cream/60 hover:text-cream text-sm underline underline-offset-4 decoration-cream/20 hover:decoration-cream/60 transition-colors"
            >
              Prefer to buy one bundle instead? Browse the shop
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <ScrollReveal>
            <p className="text-center text-xs font-semibold text-gold-dark uppercase tracking-widest mb-3">
              FAQ
            </p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-forest text-center mb-12 text-balance">
              Good questions, real answers.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <FAQSection items={faqItems} />
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
