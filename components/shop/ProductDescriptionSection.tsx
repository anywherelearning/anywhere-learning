import {
  getProductDescription,
  getBestFor,
  SHARED_ACTIVITY_STRUCTURE,
  SHARED_WHY_FAMILIES_LOVE_IT,
} from '@/lib/product-descriptions';

interface ProductDescriptionSectionProps {
  slug: string;
  description: string;
  category: string;
  activityCount: number | null;
  isBundle: boolean;
}

export default function ProductDescriptionSection({
  slug,
  description,
  category,
  activityCount,
  isBundle,
}: ProductDescriptionSectionProps) {
  const desc = getProductDescription(slug, description, category, activityCount, isBundle);
  const bestFor = getBestFor(category);

  return (
    <div className="space-y-8">
      {/* Opening paragraph */}
      <div>
        <p className="text-gray-700 text-base leading-relaxed">
          {desc.opening}
        </p>
      </div>

      {/* What's Included */}
      {!isBundle && desc.whatsIncluded.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            What&apos;s Included
          </h3>
          <ul className="space-y-2">
            {desc.whatsIncluded.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-forest mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span className="text-sm text-gray-600 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bundle: What's Included - list guides */}
      {isBundle && desc.whatsIncluded.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            What&apos;s Included
          </h3>
          <ul className="space-y-2">
            {desc.whatsIncluded.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-forest mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span className="text-sm text-gray-600 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Every Activity Includes */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          Every {desc.format === 'Project Guide' ? 'Project Guide' : 'Activity'} Includes
        </h3>
        <ul className="space-y-2">
          {SHARED_ACTIVITY_STRUCTURE.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 bg-gold rounded-full mt-2 flex-shrink-0" />
              <span className="text-sm text-gray-600 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Why Families Love It */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          Why Families Love It
        </h3>
        <ul className="space-y-2">
          {SHARED_WHY_FAMILIES_LOVE_IT.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <svg className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
              <span className="text-sm text-gray-600 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Best For */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          Best For
        </h3>
        <div className="flex flex-wrap gap-2">
          {bestFor.map((audience) => (
            <span
              key={audience}
              className="bg-white text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200"
            >
              {audience}
            </span>
          ))}
        </div>
      </div>

      {/* Closing tagline */}
      <div className="text-center pt-2">
        <p className="font-display text-xl text-gold">
          Low prep. Flexible. Meaningful learning, wherever you are.
        </p>
      </div>
    </div>
  );
}
