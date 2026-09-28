import Link from 'next/link';
import Image from 'next/image';
import { blogCategories, formatDate, type BlogPost } from '@/lib/blog';
import { PAPER_SHADOW } from '@/components/shared/Paper';

/**
 * A blog post as a lined recipe-box index card: the category colour across
 * the top, a small tilted photo, the title, and the teaser written on the
 * lines. Used on /blog and in "Keep reading" under each post.
 *
 * `wide` is the featured card: two columns, a bigger photo.
 */
export default function IndexCard({
  post,
  wide = false,
  priority = false,
  as: Heading = 'h3',
}: {
  post: BlogPost;
  wide?: boolean;
  priority?: boolean;
  as?: 'h2' | 'h3';
}) {
  const cat = blogCategories[post.category];
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group relative flex h-full flex-col bg-white text-inherit no-underline transition-transform duration-200 hover:-translate-y-1 ${PAPER_SHADOW}`}
    >
      <span aria-hidden="true" className="block h-2 shrink-0" style={{ background: cat.color }} />
      <div className={`grid gap-4 p-5 pb-3 ${wide ? 'sm:grid-cols-[1fr_220px] sm:gap-6 sm:p-6' : 'grid-cols-[1fr_92px]'}`}>
        <div className="min-w-0">
          <span className="block text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: cat.color }}>
            {wide ? `Latest · ${cat.label}` : cat.label}
          </span>
          <Heading
            className={`mt-1 font-display leading-tight tracking-tight text-[#2b2a26] group-hover:text-forest-dark ${
              wide ? 'text-[clamp(1.5rem,2.6vw,2.1rem)]' : 'text-[18px]'
            }`}
          >
            {post.title}
          </Heading>
        </div>
        <span
          className={`relative block rotate-3 self-start bg-white p-1 shadow-[0_6px_12px_-6px_rgba(0,0,0,0.4)] ${
            wide ? 'aspect-[4/3] max-sm:order-first' : 'aspect-square'
          }`}
        >
          <span className="relative block h-full w-full overflow-hidden bg-[#E6EBDF]">
            {post.heroImage && (
              <Image
                src={post.heroImage}
                alt={post.heroImageAlt || post.title}
                fill
                sizes={wide ? '(max-width: 640px) 90vw, 220px' : '92px'}
                priority={priority}
                className="object-cover"
                style={post.heroImagePosition ? { objectPosition: post.heroImagePosition } : undefined}
              />
            )}
          </span>
        </span>
      </div>
      {/* The teaser sits on the card's ruled lines */}
      <p
        className={`flex-1 px-5 font-display italic text-gray-600 ${wide ? 'text-[16px] sm:px-6' : 'text-[14.5px]'}`}
        style={{
          lineHeight: '28px',
          backgroundImage: 'repeating-linear-gradient(transparent 0 27px, #E3E8F0 27px 28px)',
        }}
      >
        {post.hook || post.excerpt}
      </p>
      <p className={`flex items-center justify-between gap-2 px-5 pb-4 pt-3 text-[12px] text-gray-500 ${wide ? 'sm:px-6' : ''}`}>
        <span>
          {formatDate(post.publishedAt)} {'·'} {post.readTimeMinutes} min
        </span>
        <span className="font-semibold text-forest-dark">
          Read <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
        </span>
      </p>
    </Link>
  );
}
