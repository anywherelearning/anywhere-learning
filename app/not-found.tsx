import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page not found',
  description:
    "We can't find what you're looking for. The page may have moved, the link might be old, or you may have followed a typo into the wild.",
  robots: { index: false, follow: false },
};

const OPTIONS = [
  {
    top: 'If you came for activities to do with your kids…',
    title: 'The Library.',
    cta: 'Open the library',
    href: '/shop',
  },
  {
    top: 'If you came to read something…',
    title: 'The blog and pillar guides.',
    cta: 'See the writing',
    href: '/blog',
  },
  {
    top: 'If you came to learn what this is…',
    title: 'About Anywhere Learning.',
    cta: 'About',
    href: '/about',
  },
  {
    top: 'If you came looking for help…',
    title: 'FAQ + contact.',
    cta: 'Get help',
    href: '/faq',
  },
];

export default function NotFound() {
  // SiteHeader/SiteFooter come from the (store) layout when a 404 happens
  // inside the store route group. For 404s outside any layout, the page still
  // renders cleanly (just without nav chrome) — acceptable for rare cases.
  return (
    <>
      <main className="bg-cream">
        {/* Hero */}
        <section className="pt-24 md:pt-28 pb-12 text-center">
          <div className="mx-auto max-w-[680px] px-6">
            <span
              aria-hidden="true"
              className="inline-block font-display italic leading-[0.92] tracking-[-0.04em] text-[#C97B5C] -rotate-[2deg]"
              style={{ fontSize: 'clamp(140px, 19vw, 180px)' }}
            >
              404
            </span>
            <svg
              className="block mx-auto mt-6 text-[#C97B5C]"
              width="80"
              height="10"
              viewBox="0 0 80 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M2 6 Q 14 1, 26 5 T 50 5 T 78 6" />
            </svg>
            <h1 className="mt-6 font-display italic text-[clamp(2rem,4.2vw,2.5rem)] leading-[1.1] tracking-[-0.014em] text-ink text-balance">
              This page took a detour.
            </h1>
            <p className="mt-6 max-w-[540px] mx-auto text-[18px] leading-[1.6] text-gray-600">
              We can&apos;t find what you&apos;re looking for. The page may have moved, the link might
              be old, or you may have followed a typo into the wild. Either way: here are a few good
              places to go next.
            </p>
          </div>
        </section>

        {/* Option cards */}
        <section className="pt-2 pb-14">
          <div className="mx-auto max-w-[720px] px-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {OPTIONS.map((opt) => (
              <Link
                key={opt.href}
                href={opt.href}
                className="group bg-cream border border-[#D8D4C5] rounded-[12px] p-6 no-underline text-ink flex flex-col shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_14px_26px_-22px_rgba(45,58,46,0.2)] hover:-translate-y-0.5 hover:shadow-[0_22px_36px_-22px_rgba(45,58,46,0.3)] hover:border-[#C9D3BE] transition-all duration-200"
              >
                <p className="font-display italic text-[14px] text-[#C97B5C] m-0 mb-2">{opt.top}</p>
                <h4 className="font-display italic text-[20px] leading-[1.18] tracking-[-0.006em] text-ink m-0 mb-5">
                  {opt.title}
                </h4>
                <span className="mt-auto inline-flex items-center gap-1.5 self-start font-body font-medium text-[14px] text-forest-dark border-b border-forest-dark/25 pb-px group-hover:text-forest group-hover:border-forest transition-colors">
                  {opt.cta}
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                    &rarr;
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

      </main>
    </>
  );
}
