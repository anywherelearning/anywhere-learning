'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const categories = [
  { value: '', label: 'All Posts' },
  { value: 'homeschool-life', label: 'Homeschool Life' },
  { value: 'nature-learning', label: 'Nature Learning' },
  { value: 'real-world-skills', label: 'Real-World Skills' },
  { value: 'travel-worldschool', label: 'Travel & Worldschool' },
  { value: 'getting-started', label: 'Getting Started' },
  { value: 'creativity-maker', label: 'Creativity & Maker' },
  { value: 'ai-digital-literacy', label: 'AI & Digital Literacy' },
];

export default function BlogCategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get('category') || '';

  function handleFilter(category: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    router.push(`/blog?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide" role="tablist">
      {categories.map((cat) => (
        <button
          key={cat.value}
          role="tab"
          aria-selected={active === cat.value}
          onClick={() => handleFilter(cat.value)}
          className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
            active === cat.value
              ? 'bg-forest text-cream shadow-sm'
              : 'bg-white text-gray-600 hover:bg-forest/5 hover:text-forest border border-gray-200'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
