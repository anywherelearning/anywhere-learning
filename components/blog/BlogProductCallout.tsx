import Link from 'next/link';
import Image from 'next/image';
import { getFallbackProductBySlug } from '@/lib/fallback-products';
import {
  STARTER_PACK_SLUGS,
  STARTER_PACK_PRICE,
  MEMBERSHIP_PRICE_YEAR,
} from '@/lib/membership';

interface BlogProductCalloutProps {
  /** The activity slug the post wants to highlight. Used to look up the product
   *  cover + name. The buy CTA always points to either the Starter Pack
   *  (if the activity is in it) or the Membership (otherwise). */
  slug: string;
  context?: string;
}

export default function BlogProductCallout({ slug, context }: BlogProductCalloutProps) {
  const product = getFallbackProductBySlug(slug);
  if (!product) return null;

  const inStarterPack = STARTER_PACK_SLUGS.has(slug);

  // Card content depends on whether this activity is bundled in the Starter Pack
  // (cheap, one-time, easy yes) or only available in the Membership.
  const pitch = inStarterPack
    ? {
        eyebrow: 'In the Starter Pack',
        body: context || product.shortDescription,
        ctaLabel: 'See the Starter Pack',
        ctaHref: '/shop/starter-pack',
        priceLine: `${STARTER_PACK_PRICE} · one-time`,
      }
    : {
        eyebrow: 'In the Membership',
        body: context || product.shortDescription,
        ctaLabel: 'Unlock with membership',
        ctaHref: '/join',
        priceLine: `${MEMBERSHIP_PRICE_YEAR} · 100+ activities`,
      };

  return (
    // Standard vertical margin. The injector (lib content-blocks pipeline)
    // places this callout inside body text — between two paragraphs of a
    // section — so it never lands next to another card (tip / summary /
    // pull-quote / bundle-callout). No need to over-pad to compensate.
    <div className="my-10 md:my-14 rounded-2xl bg-white border border-gray-100/80 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Activity cover.
            Mobile: cover sits directly on the card (no cream backdrop, no
            big padded frame). Slight tilt + drop shadow make it read like a
            real PDF resting on the page. Pulled down so it visually
            anchors into the content block below instead of floating in
            empty space. Desktop keeps the original full-fill left column. */}
        <div className="relative sm:w-40 md:w-48 shrink-0 sm:aspect-auto sm:bg-[#f7f5f0] flex justify-center pt-4 pb-1 sm:p-0">
          <div className="relative w-[170px] aspect-[4/5] sm:w-full sm:h-full sm:aspect-auto rounded-md sm:rounded-none overflow-hidden sm:overflow-hidden -rotate-[1.5deg] sm:rotate-0 shadow-[0_14px_24px_-16px_rgba(45,58,46,0.35)] sm:shadow-none ring-1 ring-gray-100 sm:ring-0">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 170px, 192px"
                className="object-cover object-top"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-300 text-sm">{product.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content. Mobile-centered (stacked layout reads better when the
            cover above and the CTA below all align on a vertical axis).
            Desktop reverts to left-aligned so it sits naturally next to
            the side-by-side cover. */}
        <div className="flex-1 px-5 py-4 sm:p-7 flex flex-col justify-center items-center sm:items-start text-center sm:text-left">
          <p className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-[0.12em] text-forest/60 mb-1 sm:mb-2">
            {pitch.eyebrow}
          </p>
          <h4 className="font-semibold text-gray-900 text-[15.5px] sm:text-lg leading-snug mb-1 sm:mb-1.5">
            {product.name}
          </h4>
          <p className="text-[13px] sm:text-sm text-gray-500 leading-relaxed mb-3 sm:mb-4">
            {pitch.body}
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 flex-wrap">
            <Link
              href={pitch.ctaHref}
              className="inline-flex items-center rounded-full bg-forest px-4 sm:px-6 py-2 sm:py-2.5 text-[13px] sm:text-sm font-semibold text-cream transition-all hover:bg-forest-dark hover:shadow-md hover:-translate-y-0.5"
            >
              {pitch.ctaLabel}
            </Link>
            <span className="text-[12.5px] sm:text-sm font-medium text-gray-400">
              {pitch.priceLine}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
