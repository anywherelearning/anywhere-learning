import { getProductDescription } from '@/lib/product-descriptions';
import {
  TargetIcon,
  UsersIcon,
  ClockIcon,
  ZapIcon,
  BookOpenIcon,
} from '@/components/shop/icons';

interface ProductHighlightsProps {
  slug: string;
  description: string;
  category: string;
  activityCount: number | null;
  ageRange: string | null;
  isBundle: boolean;
}

export default function ProductHighlights({
  slug,
  description,
  category,
  activityCount,
  ageRange,
  isBundle,
}: ProductHighlightsProps) {
  const desc = getProductDescription(slug, description, category, activityCount, isBundle);

  const pills: { icon: typeof TargetIcon; label: string }[] = [
    { icon: BookOpenIcon, label: desc.format },
  ];

  if (activityCount) {
    pills.push({ icon: TargetIcon, label: `${activityCount} Activities` });
  }

  if (ageRange) {
    pills.push({ icon: UsersIcon, label: ageRange });
  }

  pills.push({ icon: ClockIcon, label: desc.duration });
  pills.push({ icon: ZapIcon, label: 'Instant PDF Download' });

  return (
    <div className="mb-6">
      {/* Info pills */}
      <div className="flex flex-wrap gap-2">
        {pills.map((pill, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 bg-white text-gray-600 text-xs font-medium px-3 py-2 rounded-full border border-gray-150 shadow-sm"
          >
            <pill.icon className="w-3.5 h-3.5 text-forest" />
            {pill.label}
          </span>
        ))}
      </div>

      {/* Skill tags */}
      {desc.skillTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {desc.skillTags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-forest/70 bg-forest/5 px-2.5 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
