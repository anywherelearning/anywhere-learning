import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { resourceTopics, type ResourceTopic } from '@/lib/resources';
import { formatReadTime } from '@/lib/blog';

interface ResourceCardProps {
  slug: string;
  title: string;
  excerpt: string;
  topic: ResourceTopic;
  readTimeMinutes: number;
  relatedCount: number;
  heroImage?: string;
  heroImageAlt?: string;
  heroImagePosition?: string;
}

const topicIcons: Record<ResourceTopic, ReactNode> = {
  'real-world-learning': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  'nature-stem': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <path d="M12 22V8" /><path d="M5 12c0-5 7-10 7-10s7 5 7 10c0 3-2 5-7 5s-7-2-7-5z" />
    </svg>
  ),
  'worldschooling': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
  'creativity-maker': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
      <path d="M5 16l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
      <path d="M19 14l.5 1.5L21 16l-1.5.5L19 18l-.5-1.5L17 16l1.5-.5L19 14z" />
    </svg>
  ),
  'ai-digital-literacy': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 9h6M9 12h6M9 15h4" />
    </svg>
  ),
  'homeschool-journey': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" /><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
    </svg>
  ),
};

export default function ResourceCard({
  slug, title, excerpt, topic, readTimeMinutes, relatedCount, heroImage, heroImageAlt, heroImagePosition,
}: ResourceCardProps) {
  const topicMeta = resourceTopics[topic];

  return (
    <Link
      href={`/guides/${slug}`}
      className="group block rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
    >
      {/* Hero image or gradient header */}
      {heroImage ? (
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={heroImage}
            alt={heroImageAlt || title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            style={{ objectPosition: heroImagePosition || 'center' }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span
            className="absolute bottom-3 left-4 inline-block text-[10px] font-bold uppercase tracking-[0.14em] text-white px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: topicMeta.color }}
          >
            {topicMeta.label}
          </span>
        </div>
      ) : (
        <div
          className="relative px-6 pt-8 pb-6 flex items-start gap-4"
          style={{ background: `linear-gradient(135deg, ${topicMeta.color}10, ${topicMeta.color}25)` }}
        >
          <div
            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${topicMeta.color}18`, color: topicMeta.color }}
          >
            {topicIcons[topic]}
          </div>
          <div className="flex-1 min-w-0">
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-[0.14em] text-white px-2.5 py-0.5 rounded-full mb-2"
              style={{ backgroundColor: topicMeta.color }}
            >
              {topicMeta.label}
            </span>
            <h3 className="font-semibold text-gray-900 text-lg leading-snug group-hover:text-forest transition-colors line-clamp-2">
              {title}
            </h3>
          </div>
        </div>
      )}

      {/* Title (when hero image is shown, title moves below) */}
      {heroImage && (
        <div className="px-6 pt-4 pb-1">
          <h3 className="font-semibold text-gray-900 text-lg leading-snug group-hover:text-forest transition-colors line-clamp-2">
            {title}
          </h3>
        </div>
      )}

      {/* Body */}
      <div className="px-6 pb-6 pt-3">
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-5">
          {excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{formatReadTime(readTimeMinutes)}</span>
          {relatedCount > 0 && (
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-300">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              </svg>
              {relatedCount} related articles
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
