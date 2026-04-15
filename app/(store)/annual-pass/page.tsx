import type { Metadata } from 'next';
import ScrollReveal from '@/components/shared/ScrollReveal';
import FAQSection from '@/components/shared/FAQSection';
import AnnualPassCTA from '@/components/annual-pass/AnnualPassCTA';

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
  { name: 'Creativity', icon: '🎨', count: '10 guides' },
  { name: 'Real-World Skills', icon: '🔧', count: '10 guides' },
  { name: 'AI & Digital Literacy', icon: '💡', count: '10 guides' },
  { name: 'Real-World Math', icon: '📐', count: '10 guides' },
  { name: 'Outdoor & Nature', icon: '🌿', count: '7 guides' },
  { name: 'Communication & Writing', icon: '✍️', count: '10 guides' },
  { name: 'Entrepreneurship', icon: '🚀', count: '10 guides' },
  { name: 'Planning & Problem-Solving', icon: '🧩', count: '10 guides' },
  { name: 'Seasonal Packs', icon: '☀️', count: '4 packs' },
];

export default function AnnualPassPage() {
  return (
    <main>
      {/* ─── Hero ─── */}
      <section className="relative py-20 md:py-28 bg-forest-section overflow-hidden">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center">
          <ScrollReveal>
            <p className="text-gold font-semibold text-sm tracking-widest uppercase mb-4">
              Annual Pass
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-cream leading-tight mb-6">
              Every guide. One simple price.
            </h1>
            <p className="text-cream/80 text-lg sm:text-xl max-w-2xl mx-auto mb-4">
              Stop choosing between bundles. Get instant access to every activity guide
              in the store, plus every new guide we add throughout the year.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <div className="mt-10 inline-flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-3xl px-10 py-8 border border-white/10">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-bold text-cream">$99</span>
                <span className="text-cream/60 text-lg">/year</span>
              </div>
              <p className="text-gold text-sm font-medium mb-1">Founding Member Rate</p>
              <p className="text-cream/50 text-xs mb-6">$149/year after founding period ends</p>
              <AnnualPassCTA size="large" />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={250}>
            <p className="mt-6 text-cream/40 text-sm">
              Cancel anytime. Access until end of billing period.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Value Proposition ─── */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <ScrollReveal>
            <h2 className="font-display text-3xl sm:text-4xl text-forest text-center mb-4">
              Why families choose the Annual Pass
            </h2>
            <p className="text-gray-500 text-center max-w-2xl mx-auto mb-14">
              More value, less deciding. Here is how the pass compares.
            </p>
          </ScrollReveal>

          {/* Comparison Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <ScrollReveal delay={0}>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center h-full">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Individual Guide</p>
                <p className="text-2xl font-bold text-gray-800 mb-2">$5 - $9</p>
                <p className="text-gray-500 text-sm">One guide, one topic</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center h-full">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Bundle</p>
                <p className="text-2xl font-bold text-gray-800 mb-2">~$45</p>
                <p className="text-gray-500 text-sm">8-10 guides in one category</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="bg-forest rounded-2xl p-6 text-center h-full ring-2 ring-gold/40">
                <p className="text-gold text-xs uppercase tracking-wider mb-3">Annual Pass</p>
                <p className="text-2xl font-bold text-cream mb-2">$99/year</p>
                <p className="text-cream/70 text-sm">Every guide. New ones included.</p>
              </div>
            </ScrollReveal>
          </div>

          {/* Stats */}
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-forest">90+</p>
                <p className="text-gray-500 text-sm mt-1">Activity guides</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-forest">11</p>
                <p className="text-gray-500 text-sm mt-1">Themed bundles</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-forest">$500+</p>
                <p className="text-gray-500 text-sm mt-1">Total store value</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-forest">Monthly</p>
                <p className="text-gray-500 text-sm mt-1">New guides added</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── What's Included ─── */}
      <section className="py-20 md:py-28 bg-forest-subtle-gradient">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <ScrollReveal>
            <h2 className="font-display text-3xl sm:text-4xl text-forest text-center mb-4">
              Everything in the store
            </h2>
            <p className="text-gray-500 text-center max-w-2xl mx-auto mb-14">
              Real-world activities across 9 categories, designed for ages 6 to 14.
              Low prep, no curriculum, endlessly reusable.
            </p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, i) => (
              <ScrollReveal key={cat.name} delay={i * 60}>
                <div className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-gray-100/50">
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <p className="font-medium text-gray-800">{cat.name}</p>
                    <p className="text-sm text-gray-400">{cat.count}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={200}>
            <p className="text-center text-gray-400 text-sm mt-8">
              Plus the Future-Ready Skills Map, seasonal packs, and every new guide we publish.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <ScrollReveal>
            <h2 className="font-display text-3xl sm:text-4xl text-forest text-center mb-14">
              How the Annual Pass works
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { step: '1', title: 'Subscribe', desc: 'Choose the Annual Pass and check out in under a minute.' },
              { step: '2', title: 'Access Everything', desc: 'Every guide appears in your library instantly. Open on any device.' },
              { step: '3', title: 'Get New Guides', desc: 'New guides added monthly show up automatically. No extra cost.' },
            ].map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 120}>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-forest/10 text-forest font-bold text-lg flex items-center justify-center mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-16 md:py-20 bg-forest-section">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <ScrollReveal>
            <h2 className="font-display text-3xl sm:text-4xl text-cream mb-4">
              Ready to get everything?
            </h2>
            <p className="text-cream/70 mb-8 max-w-xl mx-auto">
              Join as a founding member at $99/year and lock in your rate.
              New guides every month, no extra cost.
            </p>
            <AnnualPassCTA size="large" />
            <p className="mt-4 text-cream/40 text-sm">
              Cancel anytime. Your founding rate stays locked for as long as you are subscribed.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <ScrollReveal>
            <h2 className="font-display text-3xl sm:text-4xl text-forest text-center mb-12">
              Questions? We have answers
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
