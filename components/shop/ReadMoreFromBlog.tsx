import Link from 'next/link';
import { blogCategories, formatDate } from '@/lib/blog';
import { pickGuideForProduct, pickPostsForProduct } from '@/lib/cross-links';

interface ReadMoreFromBlogProps {
  productCategory: string;
  /** Stable per-page seed so neighbouring activities rotate through the pool. */
  seed: string;
  accentColor: string;
}

/**
 * Two blog posts and the matching pillar guide, shown on activity pages.
 * The library side's only crawlable path back to the editorial side, and the
 * "why this matters" context a parent wants before starting a trial.
 */
export default function ReadMoreFromBlog({ productCategory, seed, accentColor }: ReadMoreFromBlogProps) {
  const posts = pickPostsForProduct(productCategory, seed, 2);
  const guide = pickGuideForProduct(productCategory);
  if (posts.length === 0 && !guide) return null;

  return (
    <section className="py-12 border-t border-[#D8D4C5] bg-[#F7F4EC]" aria-labelledby="read-more-heading">
      <div className="mx-auto max-w-[1100px] px-6">
        <div className="mb-8">
          <p
            className="inline-flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: accentColor }}
          >
            <span className="w-[22px] h-px" style={{ background: accentColor }} />
            Read more
          </p>
          <h2
            id="read-more-heading"
            className="mt-3 font-display text-[clamp(1.625rem,3vw,2.25rem)] leading-[1.1] tracking-tight text-balance"
          >
            The thinking behind{' '}
            <em className="not-italic italic" style={{ color: accentColor }}>
              this activity.
            </em>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {guide && (
            <Link
              href={`/guides/${guide.slug}`}
              className="group bg-cream border border-[#D8D4C5] rounded-[12px] p-6 no-underline text-ink flex flex-col hover:-translate-y-0.5 hover:border-[#C9C5B7] transition-all duration-200"
            >
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-forest-dark">
                Family guide
              </span>
              <h3 className="font-display text-[20px] leading-[1.18] text-ink mt-2 mb-2">{guide.title}</h3>
              <p className="text-[14px] leading-[1.5] text-gray-600 m-0">{guide.hook}</p>
              <span className="mt-auto pt-4 font-semibold text-[13px] text-forest-dark group-hover:text-forest transition-colors">
                Read the guide &rarr;
              </span>
            </Link>
          )}
          {posts.map((post) => {
            const cat = blogCategories[post.category];
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-cream border border-[#D8D4C5] rounded-[12px] p-6 no-underline text-ink flex flex-col hover:-translate-y-0.5 hover:border-[#C9C5B7] transition-all duration-200"
              >
                <span
                  className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em]"
                  style={{ color: cat.color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} aria-hidden="true" />
                  {cat.label}
                </span>
                <h3 className="font-display text-[20px] leading-[1.18] text-ink mt-2 mb-2">{post.title}</h3>
                <p className="text-[14px] leading-[1.5] text-gray-600 m-0">{post.hook || post.excerpt}</p>
                <span className="mt-auto pt-4 flex items-center justify-between gap-3 text-[12.5px] text-gray-500">
                  <span>{formatDate(post.publishedAt)}</span>
                  <span className="font-semibold text-[13px] text-forest-dark group-hover:text-forest transition-colors">
                    Read article &rarr;
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
