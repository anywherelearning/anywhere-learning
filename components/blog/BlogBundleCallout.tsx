import Link from 'next/link';
import Image from 'next/image';
import { IS_FOUNDER_PHASE, MEMBERSHIP_PRICE_YEAR } from '@/lib/membership';

interface BlogBundleCalloutProps {
  /** Original bundle slug — no longer used since bundles aren't sold standalone.
   *  Kept in the prop signature so existing content blocks don't need editing. */
  slug?: string;
  context?: string;
}

/**
 * The old per-category "bundle" products have been folded into the Membership.
 * This callout used to render a buy-the-bundle card; it now redirects to the
 * membership pitch with a soft "the full library is in the membership" framing.
 */
export default function BlogBundleCallout({ context }: BlogBundleCalloutProps) {
  return (
    <div className="my-10 md:my-14 rounded-2xl border border-forest/20 bg-gradient-to-br from-[#E6EBDF]/60 via-[#E6EBDF]/30 to-cream shadow-[0_2px_24px_-4px_rgba(58,90,64,0.15)] overflow-hidden">
      <div className="flex flex-col sm:flex-row items-stretch">
        {/* Visual side — homepage hero collage */}
        <div className="relative sm:w-40 md:w-48 shrink-0 aspect-[4/3] sm:aspect-auto bg-[#E6EBDF]">
          <Image
            src="/membership-hero.png"
            alt="The full Anywhere Learning library"
            fill
            sizes="(max-width: 640px) 100vw, 192px"
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-6 sm:p-7 flex flex-col justify-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-forest-dark mb-2">
            The full library
          </p>
          <h4 className="font-semibold text-gray-900 text-lg leading-snug mb-1.5">
            {context
              ? 'Want the whole library, not just this one?'
              : '100+ activities in one membership.'}
          </h4>
          <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
            {context ||
              `Real-world activities across eight categories. New ones added every quarter${
                IS_FOUNDER_PHASE ? ', and the founder rate locks in for life' : ''
              }.`}
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/join"
              className="inline-flex items-center rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-cream transition-all hover:bg-forest-dark hover:shadow-md hover:-translate-y-0.5"
            >
              Unlock with membership
            </Link>
            <span className="text-sm font-medium text-gray-400">
              {MEMBERSHIP_PRICE_YEAR}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
