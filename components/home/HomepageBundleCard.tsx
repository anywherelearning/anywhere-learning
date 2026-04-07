import Link from 'next/link';
import Image from 'next/image';

/** Thumbnail images for each bundle's included products (show up to 4) */
const bundleThumbnails: Record<string, { src: string; alt: string }[]> = {
  'seasonal-bundle': [
    { src: '/products/spring-outdoor-pack.jpg', alt: 'Spring Outdoor Pack' },
    { src: '/products/summer-outdoor-pack.jpg', alt: 'Summer Outdoor Pack' },
    { src: '/products/fall-outdoor-pack.jpg', alt: 'Fall Outdoor Pack' },
    { src: '/products/winter-outdoor-pack.jpg', alt: 'Winter Outdoor Pack' },
  ],
  'creativity-mega-bundle': [
    { src: '/products/board-game-studio.jpg', alt: 'Board Game Studio' },
    { src: '/products/rube-goldberg-machine.jpg', alt: 'Rube Goldberg Machine' },
    { src: '/products/mini-movie.jpg', alt: 'Mini Movie' },
    { src: '/products/imaginary-world.jpg', alt: 'Imaginary World' },
  ],
  'real-world-mega-bundle': [
    { src: '/products/budget-challenge.jpg', alt: 'Budget Challenge' },
    { src: '/products/smart-shopper.jpg', alt: 'Smart Shopper' },
    { src: '/products/travel-day.jpg', alt: 'Travel Day' },
    { src: '/products/kitchen-math-challenge.jpg', alt: 'Kitchen Math' },
  ],
  'ai-digital-bundle': [
    { src: '/products/ai-basics.jpg', alt: 'AI Basics' },
    { src: '/products/deepfake-spotter.jpg', alt: 'Deepfake Spotter' },
    { src: '/products/prompt-like-a-coach.jpg', alt: 'Prompt Like a Coach' },
    { src: '/products/hallucination-detective.jpg', alt: 'Hallucination Detective' },
  ],
  'real-world-math-bundle': [
    { src: '/products/backyard-campout-planner.jpg', alt: 'Backyard Campout Planner' },
    { src: '/products/garage-sale-math.jpg', alt: 'Garage Sale Math' },
    { src: '/products/road-trip-calculator.jpg', alt: 'Road Trip Calculator' },
    { src: '/products/farmers-market-challenge.jpg', alt: 'Farmers Market' },
  ],
  'communication-writing-bundle': [
    { src: '/products/adventure-story-map.jpg', alt: 'Adventure Story Map' },
    { src: '/products/family-debate-night.jpg', alt: 'Family Debate Night' },
    { src: '/products/mini-magazine-creator.jpg', alt: 'Mini Magazine Creator' },
    { src: '/products/trail-guide-creator.jpg', alt: 'Trail Guide Creator' },
  ],
  'entrepreneurship-bundle': [
    { src: '/products/brand-builder.jpg', alt: 'Brand Builder' },
    { src: '/products/shark-tank-pitch.jpg', alt: 'Shark Tank Pitch' },
    { src: '/products/marketing-campaign.jpg', alt: 'Marketing Campaign' },
    { src: '/products/product-design-lab.jpg', alt: 'Product Design Lab' },
  ],
  'planning-problem-solving-bundle': [
    { src: '/products/emergency-ready.jpg', alt: 'Emergency Ready' },
    { src: '/products/scavenger-hunt-designer.jpg', alt: 'Scavenger Hunt Designer' },
    { src: '/products/fix-it-detective.jpg', alt: 'Fix-It Detective' },
    { src: '/products/everyday-redesign.jpg', alt: 'Everyday Redesign' },
  ],
  'outdoor-mega-bundle': [
    { src: '/products/land-art-challenges.jpg', alt: 'Land Art Challenges' },
    { src: '/products/nature-walk-task-cards.jpg', alt: 'Nature Walk Cards' },
    { src: '/products/outdoor-stem-challenges.jpg', alt: 'STEM Challenges' },
    { src: '/products/nature-crafts.jpg', alt: 'Nature Crafts' },
  ],
};

/** Total number of products in each bundle (for "+X more" display) */
const bundleProductCount: Record<string, number> = {
  'seasonal-bundle': 4,
  'creativity-mega-bundle': 10,
  'real-world-mega-bundle': 10,
  'ai-digital-bundle': 10,
  'real-world-math-bundle': 10,
  'communication-writing-bundle': 10,
  'entrepreneurship-bundle': 10,
  'planning-problem-solving-bundle': 10,
  'outdoor-mega-bundle': 7,
};

interface HomepageBundleCardProps {
  name: string;
  slug: string;
  shortDescription: string;
  imageUrl: string | null;
  isBundle: boolean;
  activityCount: number | null;
  priceCents: number;
  isFreeWithBundle?: boolean;
}

export default function HomepageBundleCard({
  name,
  slug,
  shortDescription,
  imageUrl,
  isBundle,
  activityCount,
  priceCents,
  isFreeWithBundle,
}: HomepageBundleCardProps) {
  const thumbnails = bundleThumbnails[slug] || [];
  const totalProducts = bundleProductCount[slug] || thumbnails.length;
  const shownCount = Math.min(thumbnails.length, 4);
  const moreCount = totalProducts - shownCount;

  return (
    <Link href={`/shop/${slug}`} className="group block h-full">
      <div className="h-full flex flex-col bg-white rounded-2xl shadow-sm group-hover:shadow-xl group-hover:shadow-forest/[0.08] transition-all duration-300 group-hover:-translate-y-1 border border-gray-100/50 overflow-hidden">
        {/* Product Image */}
        <div className="relative aspect-[4/3] bg-cream overflow-hidden">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}

          {/* Badge */}
          {isBundle && (
            <div className="absolute top-3 right-3 bg-gold text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm z-10">
              Save 25%
            </div>
          )}

          {/* Activity count */}
          {activityCount && (
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm z-10">
              {activityCount} activities
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-5 md:p-6 flex-1 flex flex-col">
          <div className="min-h-[3.25rem] mb-1.5">
            <h3 className="font-semibold text-gray-900 text-lg leading-snug line-clamp-2 group-hover:text-forest transition-colors">
              {name}
            </h3>
          </div>

          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
            {shortDescription}
          </p>

          {/* Spacer pushes thumbnails + CTA to card bottom */}
          <div className="flex-1" />

          {/* Included product thumbnails — fixed height row for alignment */}
          <div className="h-14 flex items-center mb-3">
            {thumbnails.length > 0 ? (
              <div className="flex items-center -space-x-2.5" aria-hidden="true">
                {thumbnails.slice(0, 4).map((thumb, i) => (
                  <div
                    key={thumb.src}
                    className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-sm"
                    style={{ zIndex: 4 - i }}
                  >
                    <Image
                      src={thumb.src}
                      alt={thumb.alt}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                ))}
                {moreCount > 0 && (
                  <div className="flex items-center pl-3">
                    <span className="text-xs text-gray-400 font-medium">+{moreCount} more</span>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* CTA row */}
          <div className="flex items-center justify-between">
            {isFreeWithBundle ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest bg-forest/10 px-4 py-2 rounded-full">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6" />
                  <path d="M2 8h20v4H2z" />
                  <path d="M12 20V8" />
                  <path d="M12 8L8.5 2" />
                  <path d="M12 8l3.5-6" />
                </svg>
                Free with any bundle
              </span>
            ) : (
              <span className="text-sm font-medium text-forest bg-forest/5 px-4 py-2 rounded-full group-hover:bg-forest group-hover:text-cream transition-all duration-300">
                View bundle &rarr;
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
