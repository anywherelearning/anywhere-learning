import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { blogCategories, type BlogCategory } from '@/lib/blog';

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt: string;
  /** Curated one-line teaser. Falls back to excerpt when not set. */
  hook?: string;
  category: BlogCategory;
  heroImage?: string;
  heroImageAlt?: string;
  /** Clamp title/excerpt for equal-height carousels */
  compact?: boolean;
}

const categoryIcons: Record<BlogCategory, ReactNode> = {
  'ai-digital-literacy': (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 9h6" /><path d="M9 13h6" /><path d="M9 17h4" />
    </svg>
  ),
  'creativity-maker': (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
    </svg>
  ),
  'homeschool-journey': (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" /><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
    </svg>
  ),
  'nature-learning': (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <path d="M12 22V8" /><path d="M5 12c0-5 7-10 7-10s7 5 7 10c0 3-2 5-7 5s-7-2-7-5z" />
    </svg>
  ),
  'real-world-skills': (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  'travel-worldschool': (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
};

export default function BlogCard({
  slug, title, excerpt, hook, category, heroImage, heroImageAlt, compact,
}: BlogCardProps) {
  const cat = blogCategories[category];
  const teaser = hook || excerpt;

  return (
    <Link
      href={`/blog/${slug}`}
      className="group h-full flex flex-col rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
    >
      {/* Image or placeholder with category color */}
      <div
        className="relative aspect-[16/9] flex items-center justify-center overflow-hidden flex-shrink-0"
        style={{ background: heroImage ? undefined : `linear-gradient(135deg, ${cat.color}20, ${cat.color}40)` }}
      >
        {heroImage ? (
          <Image
            src={heroImage}
            alt={heroImageAlt || title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="text-gray-300 opacity-50" style={{ color: cat.color }}>
            {categoryIcons[category]}
          </div>
        )}
        {/* Category pill */}
        <span
          className="absolute top-3 left-3 text-xs font-semibold text-white px-3 py-1 rounded-full"
          style={{ backgroundColor: cat.color }}
        >
          {cat.label}
        </span>
      </div>

      {/* Card body */}
      <div className="p-5 md:p-6 flex-1 flex flex-col">
        <h3 className={`font-semibold text-gray-900 text-lg leading-snug mb-2 group-hover:text-forest transition-colors ${compact ? 'line-clamp-2' : ''}`}>
          {title}
        </h3>
        <p className={`text-sm text-gray-500 leading-relaxed ${compact ? 'line-clamp-3' : ''}`}>
          {teaser}
        </p>
      </div>
    </Link>
  );
}
