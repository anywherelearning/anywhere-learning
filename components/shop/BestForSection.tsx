import { getBestFor } from '@/lib/product-descriptions';

interface BestForSectionProps {
  category: string;
}

/** Renders the "Best For" audience chips as a standalone block.
 *  Extracted from ProductDescriptionSection so single-activity pages can
 *  keep Best For on the right column while the description lives on the left. */
export default function BestForSection({ category }: BestForSectionProps) {
  const bestFor = getBestFor(category);

  return (
    <div className="mb-8">
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
  );
}
