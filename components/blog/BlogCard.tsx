import type { ReactNode } from 'react';
import Link from 'next/link';
import { blogCategories, formatDate, formatReadTime, type BlogCategory } from '@/lib/blog';

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  publishedAt: string;
  readTimeMinutes: number;
  author: { name: string };
}

const categoryIcons: Record<BlogCategory, ReactNode> = {
  'homeschool-life': (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><path d="M9 22V12h6v10" />
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
  'getting-started': (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
    </svg>
  ),
};

export default function BlogCard({
  slug, title, excerpt, category, publishedAt, readTimeMinutes, author,
}: BlogCardProps) {
  const cat = blogCategories[category];

  return (
    <Link
      href={`/blog/${slug}`}
      className="group block rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
    >
      {/* Image placeholder with category color */}
      <div
        className="relative aspect-[16/9] flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${cat.color}20, ${cat.color}40)` }}
      >
        <div className="text-gray-300 opacity-50" style={{ color: cat.color }}>
          {categoryIcons[category]}
        </div>
        {/* Category pill */}
        <span
          className="absolute top-3 left-3 text-xs font-semibold text-white px-3 py-1 rounded-full"
          style={{ backgroundColor: cat.color }}
        >
          {cat.label}
        </span>
      </div>

      {/* Card body */}
      <div className="p-5 md:p-6">
        <h3 className="font-semibold text-gray-900 text-lg leading-snug mb-2 group-hover:text-forest transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
          {excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{formatDate(publishedAt)}</span>
          <span className="flex items-center gap-3">
            <span>{formatReadTime(readTimeMinutes)}</span>
            <span className="hidden sm:inline">{author.name}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
