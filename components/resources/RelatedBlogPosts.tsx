'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { getPostBySlug } from '@/lib/blog';
import BlogCard from '@/components/blog/BlogCard';
import ScrollReveal from '@/components/shared/ScrollReveal';

interface RelatedBlogPostsProps {
  slugs: string[];
}

export default function RelatedBlogPosts({ slugs }: RelatedBlogPostsProps) {
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter(Boolean);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-blog-card]');
    const distance = card ? card.offsetWidth + 24 : 340;
    el.scrollBy({ left: direction === 'left' ? -distance : distance, behavior: 'smooth' });
  };

  if (posts.length === 0) return null;

  return (
    <section className="pb-10 md:pb-14">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <ScrollReveal>
          <h2 className="font-display text-2xl sm:text-3xl text-forest mb-2">
            Keep Exploring
          </h2>
          <p className="text-gray-400 text-sm mb-10">
            Dive deeper with these related articles
          </p>
        </ScrollReveal>

        <div className="relative">
          {/* Left arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-11 h-11 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-forest hover:text-cream hover:border-forest transition-all duration-200"
              aria-label="Previous post"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Right arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-11 h-11 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-forest hover:text-cream hover:border-forest transition-all duration-200"
              aria-label="Next post"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          {/* Scrollable track */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mb-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {posts.map((post, i) => (
              <div
                key={post!.slug}
                data-blog-card
                className="snap-start shrink-0 w-[calc(100%-2rem)] sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
              >
                <ScrollReveal delay={i * 80}>
                  <BlogCard
                    slug={post!.slug}
                    title={post!.title}
                    excerpt={post!.excerpt}
                    category={post!.category}
                    heroImage={post!.heroImage}
                    heroImageAlt={post!.heroImageAlt}
                  />
                </ScrollReveal>
              </div>
            ))}
          </div>

          {/* Fade edges */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-cream to-transparent pointer-events-none z-10" />
          )}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-cream to-transparent pointer-events-none z-10" />
          )}
        </div>
      </div>
    </section>
  );
}
