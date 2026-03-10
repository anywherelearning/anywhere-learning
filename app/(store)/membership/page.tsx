import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUserByClerkId, hasActiveMembership, getActiveProducts } from '@/lib/db/queries';
import PricingToggle from '@/components/membership/PricingToggle';

export const metadata: Metadata = {
  title: 'Membership',
  description:
    'Get instant access to every Anywhere Learning activity pack with one simple membership. Browse, open, and use — all in your browser.',
  alternates: {
    canonical: 'https://anywherelearning.co/membership',
  },
};

const benefits = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    ),
    title: 'Every pack, instantly',
    description: 'Open any activity pack in your browser the moment you join. No waiting, no extra purchases.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
    title: 'New packs included',
    description: 'Every new activity pack we create is automatically added to your library at no extra cost.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    title: 'Use on any device',
    description: 'Open your packs on a phone, tablet, or laptop. Works anywhere you have a browser.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </svg>
    ),
    title: 'Cancel anytime',
    description: 'No contracts, no commitments. Cancel from your account in two clicks if it\'s not the right fit.',
  },
];

const faqs = [
  {
    q: 'What do I get with a membership?',
    a: 'Instant access to every activity pack in the library — current and future. You can browse and open them directly in your browser on any device.',
  },
  {
    q: 'Can I still download the PDFs?',
    a: 'Membership gives you in-browser access to everything. If you also want to download a specific pack to keep forever, you can purchase it individually from the shop.',
  },
  {
    q: 'What\'s the difference between buying and membership?',
    a: 'When you buy an individual pack, you get a downloadable PDF that\'s yours to keep forever. With a membership, you get in-browser access to the entire library for as long as you\'re subscribed. Many families do both — membership for browsing, and individual purchases for their favorites.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, always. Cancel from your account page and you\'ll keep access until the end of your billing period. No questions asked.',
  },
  {
    q: 'Is the annual plan worth it?',
    a: 'The annual plan works out to $12.49/month — that\'s 37% less than monthly. If you think you\'ll use the packs for more than a couple of months, it\'s a great deal.',
  },
];

export default async function MembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  // If user is already a member, redirect to library
  try {
    const { userId: clerkId } = await auth();
    if (clerkId) {
      const user = await getUserByClerkId(clerkId);
      if (user) {
        const isMember = await hasActiveMembership(user.id);
        if (isMember) redirect('/account/library');
      }
    }
  } catch {
    // Auth may not be configured — continue showing page
  }

  const { expired } = await searchParams;

  // Get product count for dynamic copy
  let productCount = 40;
  try {
    const allProducts = await getActiveProducts();
    const individuals = allProducts.filter((p) => !p.isBundle);
    productCount = individuals.length;
  } catch {
    // Fallback count
  }

  return (
    <div className="bg-cream">
      {/* Expired membership banner */}
      {expired && (
        <div className="bg-gold/10 border-b border-gold/20 py-3 text-center">
          <p className="text-sm text-gray-600">
            Your membership has expired. Renew below to get your library back.
          </p>
        </div>
      )}

      {/* Hero */}
      <section className="pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
          <p className="text-sm font-semibold text-gold uppercase tracking-[0.2em] mb-4">
            Membership
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-forest leading-[1.1] mb-6 text-balance">
            Every activity pack. One simple membership.
          </h1>
          <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">
            Stop buying packs one at a time. Get instant access to all {productCount}+ activities
            in your browser — plus everything new we add.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="pb-12 md:pb-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <PricingToggle />
        </div>
      </section>

      {/* What you get */}
      <section className="bg-forest-section py-12 md:py-16 relative overflow-hidden">
        <div className="absolute top-10 right-[8%] w-64 h-64 rounded-full border border-white/[0.04]" aria-hidden="true" />
        <div className="absolute bottom-10 left-[5%] w-40 h-40 rounded-full border border-white/[0.03]" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl text-cream mb-3">
              What&apos;s included
            </h2>
            <p className="text-cream/60 text-lg">
              Everything you need, nothing you don&apos;t.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-6"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-gold-light mb-4">
                  {b.icon}
                </div>
                <h3 className="text-lg font-semibold text-cream mb-2">{b.title}</h3>
                <p className="text-cream/60 text-sm leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <h2 className="font-display text-3xl md:text-4xl text-forest text-center mb-10">
            Membership vs. Individual Packs
          </h2>
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left font-medium text-gray-500 py-3 px-5"></th>
                  <th className="text-center font-semibold text-forest py-3 px-5">
                    Membership
                  </th>
                  <th className="text-center font-semibold text-gray-600 py-3 px-5">
                    Individual
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Access to all packs', true, false],
                  ['New packs included', true, false],
                  ['In-browser viewing', true, false],
                  ['Downloadable PDF', false, true],
                  ['Yours to keep forever', false, true],
                  ['Use on any device', true, true],
                ].map(([feature, member, individual], i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="py-3 px-5 text-gray-700">{feature as string}</td>
                    <td className="py-3 px-5 text-center">
                      {member ? (
                        <svg className="w-5 h-5 text-forest mx-auto" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        <span className="text-gray-300">&mdash;</span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-center">
                      {individual ? (
                        <svg className="w-5 h-5 text-forest mx-auto" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        <span className="text-gray-300">&mdash;</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-sm text-gray-400 mt-4">
            Many families use both — membership to browse, individual purchases to keep their favorites forever.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-warm-gradient py-12 md:py-16">
        <div className="mx-auto max-w-2xl px-5 sm:px-8">
          <h2 className="font-display text-3xl md:text-4xl text-forest text-center mb-10">
            Questions? Answers.
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-gray-800 font-medium hover:text-forest transition-colors list-none [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <svg
                    className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-4 text-gray-500 leading-relaxed text-sm">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl text-forest mb-3">
            Ready to unlock everything?
          </h2>
          <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto">
            Start with the plan that fits and get instant access to the full library.
          </p>
          <PricingToggle />
          <p className="mt-8 text-sm text-gray-400">
            Not ready for a membership?{' '}
            <Link href="/shop" className="text-forest hover:underline">
              Browse individual packs
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
