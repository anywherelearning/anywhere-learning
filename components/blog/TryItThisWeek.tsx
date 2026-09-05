import Link from 'next/link';
import { coverSrc } from '@/lib/cover';
import { CATEGORY_LABELS } from '@/lib/categories';
import { pickActivities } from '@/lib/cross-links';

interface TryItThisWeekProps {
  /** Product category to draw from (see lib/cross-links.ts for the maps). */
  productCategory: string;
  /** Activity slug to lead with, usually the page's recommended product. */
  prefer?: string;
  /** Stable per-page seed so neighbouring pages rotate through the pool. */
  seed: string;
}

/**
 * Three activities from the library, matched to the article's category.
 * Server-rendered plain links: this is the editorial side's only crawlable
 * path into /shop/*, so it has to be real anchors, not a client carousel.
 */
export default function TryItThisWeek({ productCategory, prefer, seed }: TryItThisWeekProps) {
  const activities = pickActivities(productCategory, { prefer, seed, limit: 3 });
  if (activities.length === 0) return null;

  return (
    <section
      className="bg-[#F2EFE4] border-y border-[#D8D4C5] py-14 md:py-16"
      aria-labelledby="try-it-heading"
    >
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
            <span className="w-[22px] h-px bg-forest inline-block" />
            Try it this week
          </p>
          <h2
            id="try-it-heading"
            className="font-display text-[clamp(1.75rem,3.2vw,2.4rem)] leading-[1.1] tracking-tight mt-3 text-balance"
          >
            Activities that put this <span className="italic text-forest">into practice.</span>
          </h2>
          <p className="mt-3 text-[15.5px] leading-[1.6] text-gray-600 max-w-[620px]">
            Guided, low-prep, and done together. Open one on any device and follow along with
            your kids.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {activities.map((p) => (
            <Link
              key={p.slug}
              href={`/shop/${p.slug}`}
              className="group bg-cream border border-[#D8D4C5] rounded-[12px] overflow-hidden no-underline text-ink flex flex-col shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_14px_26px_-22px_rgba(45,58,46,0.2)] hover:-translate-y-0.5 hover:shadow-[0_22px_36px_-22px_rgba(45,58,46,0.3)] hover:border-[#C9C5B7] transition-all duration-200"
            >
              <div className="relative aspect-[16/10] overflow-hidden border-b border-[#D8D4C5] bg-[#E6EBDF]">
                {p.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverSrc(p.imageUrl)}
                    alt={p.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-forest-dark">
                  <span className="w-1.5 h-1.5 rounded-full bg-forest" aria-hidden="true" />
                  {CATEGORY_LABELS[p.category] || p.category}
                  {p.ageRange && <span className="text-gray-400 normal-case tracking-normal font-medium">· Ages {p.ageRange}</span>}
                </span>
                <h3 className="font-display italic text-[19px] leading-[1.18] text-ink mt-1.5 mb-2">
                  {p.name}
                </h3>
                <p className="text-[14px] leading-[1.5] text-gray-600 m-0">{p.shortDescription}</p>
                <span className="mt-3.5 pt-3.5 border-t border-dashed border-[#C9C5B7] font-semibold text-[13px] text-forest-dark group-hover:text-forest transition-colors">
                  See the activity &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-6 text-[13.5px] text-gray-500">
          Every activity is included with the membership.{' '}
          <Link
            href="/#membership"
            className="text-forest-dark font-medium underline decoration-forest/30 underline-offset-2 hover:text-forest"
          >
            See how it works
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
