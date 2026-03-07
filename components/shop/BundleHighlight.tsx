import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import {
  SparklesIcon,
  SunIcon,
  LeafIcon,
  PaletteIcon,
  LightbulbIcon,
  CompassIcon,
  CpuIcon,
} from './icons';

interface BundleHighlightProps {
  name: string;
  slug: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  activityCount: number | null;
}

export default function BundleHighlight({
  name,
  slug,
  priceCents,
  compareAtPriceCents,
  activityCount,
}: BundleHighlightProps) {
  const savings = compareAtPriceCents ? compareAtPriceCents - priceCents : 0;

  return (
    <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gold/15">
      {/* Warm gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold-light/[0.08] via-transparent to-forest/[0.03] pointer-events-none" />

      <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
        {/* Left: Stack of product mockups with category colors */}
        <div className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0">
          {/* Back cards with category color hints */}
          <div className="absolute inset-5 bg-[#fce8ed] rounded-xl shadow-sm border border-[#c47a8f]/15 transform -rotate-[6deg]" />
          <div className="absolute inset-4 bg-[#eef5ee] rounded-xl shadow-sm border border-forest/10 transform -rotate-[3deg]" />
          <div className="absolute inset-3 bg-[#fdf4ec] rounded-xl shadow border border-gold/15 transform rotate-[1deg]" />
          {/* Front card */}
          <div className="absolute inset-1 bg-white rounded-xl shadow-lg border border-forest/10 p-4 transform rotate-[3deg] flex flex-col items-center justify-center group-hover:rotate-0 transition-transform duration-500">
            <div className="w-8 h-8 rounded-full bg-forest/15 mb-3 flex items-center justify-center">
              <SparklesIcon className="w-4 h-4 text-forest" />
            </div>
            <p className="text-forest font-semibold text-xs text-center leading-snug mb-2">
              {name}
            </p>
            <div className="space-y-1.5 w-full px-3">
              <div className="h-1 bg-gray-200/80 rounded-full w-full" />
              <div className="h-1 bg-gray-200/80 rounded-full w-4/5" />
              <div className="h-1 bg-gray-200/80 rounded-full w-3/5" />
            </div>
          </div>

          {/* Best Value floating badge */}
          <div className="absolute -top-2 -right-2 bg-gold text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-pulse-glow z-10">
            BEST VALUE
          </div>
        </div>

        {/* Right: Copy + CTA */}
        <div className="relative text-center md:text-left flex-1">
          <p className="text-sm font-semibold text-gold uppercase tracking-[0.2em] mb-2">
            Save {savings > 0 ? Math.round((savings / (compareAtPriceCents || 1)) * 100) : 50}%
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-forest mb-3">
            The Master Bundle
          </h2>
          <p className="text-gray-500 mb-2 text-lg leading-relaxed">
            Every single activity pack we make.{' '}
            {activityCount ? `${activityCount}+` : '220+'} activities across all categories.
          </p>

          {/* Category tags */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center md:justify-start">
            {[
              { Icon: SunIcon, label: 'Seasonal' },
              { Icon: LeafIcon, label: 'Nature' },
              { Icon: PaletteIcon, label: 'Creativity' },
              { Icon: LightbulbIcon, label: 'Real-World' },
              { Icon: CompassIcon, label: 'Life Skills' },
              { Icon: CpuIcon, label: 'AI Literacy' },
            ].map((cat) => (
              <span
                key={cat.label}
                className="inline-flex items-center gap-1.5 bg-cream text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200/60"
              >
                <cat.Icon className="w-3.5 h-3.5" />
                {cat.label}
              </span>
            ))}
          </div>

          {/* Price block */}
          <div className="flex items-baseline gap-3 justify-center md:justify-start mb-6">
            <span className="text-4xl font-bold text-forest">
              {formatPrice(priceCents)}
            </span>
            {compareAtPriceCents && savings > 0 && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(compareAtPriceCents)}
                </span>
                <span className="bg-gold/15 text-gold text-sm font-bold px-4 py-1.5 rounded-full">
                  Save {formatPrice(savings)}
                </span>
              </>
            )}
          </div>

          <Link
            href={`/shop/${slug}`}
            className="shimmer-effect inline-block bg-forest hover:bg-forest-dark text-cream font-semibold py-4 px-10 rounded-2xl transition-all duration-300 hover:scale-[1.03] shadow-md hover:shadow-xl text-lg"
          >
            Get the Master Bundle &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
