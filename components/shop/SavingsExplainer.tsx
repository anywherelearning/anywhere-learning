import Image from 'next/image';
import Link from 'next/link';

export default function SavingsExplainer() {
  return (
    <section className="relative py-12 md:py-16 overflow-hidden bg-forest-section">
      {/* Decorative leaves — match hero pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <svg
          className="absolute -left-2 top-6 w-16 md:w-20 opacity-[0.08] animate-soft-float hidden md:block"
          viewBox="0 0 100 100"
          fill="#faf9f6"
        >
          <path d="M50 5 Q65 25 80 40 Q65 45 50 70 Q35 45 20 40 Q35 25 50 5Z" />
          <path d="M50 20 L50 70" stroke="#faf9f6" strokeWidth="1" fill="none" />
        </svg>
        <svg
          className="absolute right-4 top-2 w-14 md:w-18 opacity-[0.06] animate-soft-float hidden md:block"
          style={{ animationDelay: '2.5s' }}
          viewBox="0 0 100 100"
          fill="#d4a373"
        >
          <path d="M50 5 Q65 25 80 40 Q65 45 50 70 Q35 45 20 40 Q35 25 50 5Z" />
        </svg>
        <div
          className="absolute left-[12%] bottom-8 w-2.5 h-2.5 rounded-full bg-gold/20 animate-soft-float hidden md:block"
          style={{ animationDelay: '1.5s' }}
        />
        <div
          className="absolute right-[18%] top-10 w-2 h-2 rounded-full bg-cream/10 animate-soft-float hidden md:block"
          style={{ animationDelay: '3.5s' }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl px-5 sm:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="font-display text-2xl md:text-3xl text-cream">
            Two Ways to Save
          </h2>
          <p className="text-cream/60 mt-2">
            No codes, no hoops. Savings happen automatically at checkout.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Bundles Card */}
          <div className="bg-white rounded-3xl border border-gray-100/50 border-t-[3px] border-t-forest shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-6 md:p-8 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25-9.75 5.25-9.75-5.25 4.179-2.25" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-forest bg-forest/10 px-3 py-1 rounded-full uppercase tracking-wider">
                Best Deal
              </span>
            </div>

            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              Grab a Bundle
            </h3>

            <p className="text-3xl md:text-4xl font-bold text-forest-dark mb-3">
              Save 25%+
            </p>

            <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">
              The biggest savings and the easiest choice. Pick a themed collection and you&apos;re set — no decisions, no math, just download and go.
            </p>

            {/* Bundle cover thumbnails */}
            <div className="flex -space-x-3 mb-5" aria-hidden="true">
              {[
                { src: '/products/four-seasons-bundle.jpg', alt: 'Full Seasonal Bundle' },
                { src: '/products/mega-bundle-creativity.jpg', alt: 'Creativity Mega Bundle' },
                { src: '/products/mega-bundle-ai-digital.jpg', alt: 'AI & Digital Bundle' },
                { src: '/products/nature-art-bundle.jpg', alt: 'Nature Art Bundle' },
              ].map((bundle, i) => (
                <div
                  key={bundle.src}
                  className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-white shadow-sm"
                  style={{ zIndex: 4 - i }}
                >
                  <Image
                    src={bundle.src}
                    alt={bundle.alt}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
              ))}
              <div className="flex items-center pl-5">
                <span className="text-xs text-gray-400 font-medium">+2 more</span>
              </div>
            </div>

            <Link
              href="/shop?category=bundle"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-forest hover:text-forest-dark transition-colors mt-auto"
            >
              Browse Bundles
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* Mobile "or" divider */}
          <div className="flex items-center gap-3 -my-1 md:hidden" aria-hidden="true">
            <div className="flex-1 h-px bg-cream/20" />
            <span className="text-xs text-cream/50 font-medium">or</span>
            <div className="flex-1 h-px bg-cream/20" />
          </div>

          {/* Mix & Match Card */}
          <div className="bg-white rounded-3xl border border-gray-100/50 border-t-[3px] border-t-gold shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gold-dark bg-gold/10 px-3 py-1 rounded-full uppercase tracking-wider">
                Want Flexibility?
              </span>
            </div>

            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              Mix & Match
            </h3>

            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Want to pick across categories? Choose any combination and discounts kick in automatically:
            </p>

            {/* Tier rows */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center justify-between bg-cream rounded-xl px-4 py-2.5 border border-gray-100">
                <span className="text-sm font-medium text-gray-700">5 packs</span>
                <span className="text-sm font-bold text-gold-dark bg-gold/10 px-3 py-0.5 rounded-full">10% off</span>
              </div>
              <div className="flex items-center justify-between bg-cream rounded-xl px-4 py-2.5 border border-gray-100">
                <span className="text-sm font-medium text-gray-700">7 packs</span>
                <span className="text-sm font-bold text-gold-dark bg-gold/10 px-3 py-0.5 rounded-full">15% off</span>
              </div>
              <div className="flex items-center justify-between bg-gold/[0.08] rounded-xl px-4 py-2.5 border border-gold/20">
                <span className="text-sm font-medium text-gray-700">10+ packs</span>
                <span className="text-sm font-bold text-white bg-gold px-3 py-0.5 rounded-full">20% off</span>
              </div>
            </div>

            <Link
              href="#pick-packs"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-dark hover:text-gold transition-colors"
            >
              Start Picking
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center mt-6 md:mt-8 text-sm text-cream/60">
          Already have a bundle in your cart? Individual packs still get their own discount on top.
        </p>
      </div>
    </section>
  );
}
