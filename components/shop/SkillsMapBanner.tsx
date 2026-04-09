import Link from 'next/link';
import Image from 'next/image';

/**
 * Promotional banner for "The Future-Ready Skills Map" product.
 * Positioned between the hero/trust strip and the savings explainer
 * on the shop page's "All Packs" view. Designed to feel like a
 * helpful store guide rather than an ad — warm, integrated, and
 * nature-inspired to match the brand aesthetic.
 */
export default function SkillsMapBanner() {
  return (
    <section className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
      <Link
        href="/shop/future-ready-skills-map"
        className="group block relative bg-white rounded-3xl border border-gold/15 shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden"
      >
        {/* Subtle warm gradient background */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-gold-light/[0.06] via-transparent to-forest/[0.03] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative flex flex-col sm:flex-row items-center gap-5 sm:gap-8 p-6 sm:p-8">
          {/* Product thumbnail */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-2xl overflow-hidden shadow-md border border-gray-100 group-hover:shadow-lg transition-shadow duration-300 bg-[#f7f5f0]">
            <Image
              src="/products/future-ready-skills-map.jpg"
              alt="The Future-Ready Skills Map, a 42-page parent guide"
              fill
              className="object-contain"
              sizes="(max-width: 640px) 80px, 96px"
            />
          </div>

          {/* Copy */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 mb-1.5">
              <p className="text-xs font-semibold text-gold uppercase tracking-[0.18em]">
                Start Here
              </p>
              <span className="hidden sm:inline text-gray-300" aria-hidden="true">
                /
              </span>
              <p className="text-xs font-medium text-forest/70">
                Free with any bundle
              </p>
            </div>

            <h2 className="font-display text-xl sm:text-2xl text-forest mb-1.5 group-hover:text-forest-dark transition-colors duration-300">
              The Future-Ready Skills Map
            </h2>

            <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
              10 essential skills your kids actually need, mapped by age with activities,
              milestones, and sample weeks. The roadmap that turns every activity guide into
              purposeful learning.
            </p>
          </div>

          {/* CTA arrow */}
          <div className="flex-shrink-0 hidden sm:flex items-center">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-forest group-hover:text-forest-dark transition-colors whitespace-nowrap">
              See the guide
              <svg
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </span>
          </div>

          {/* Mobile CTA text */}
          <span className="sm:hidden text-sm font-medium text-forest group-hover:text-forest-dark transition-colors inline-flex items-center gap-1.5">
            See the guide
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </span>
        </div>

        {/* Accent border at top — gold like the start-here category */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-gold via-gold-light to-gold"
          aria-hidden="true"
        />
      </Link>
    </section>
  );
}
