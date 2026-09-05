import Link from 'next/link';
import { blogCategories, getAllPosts, type BlogCategory, type BlogPost } from '@/lib/blog';

/**
 * Every published post, grouped by topic, as plain server-rendered links.
 *
 * The paginated grid above shows six posts per page across fifteen pages, and
 * a crawler that follows "Next" fifteen times is not guaranteed to get there.
 * This list gives every post a link from the blog hub in one hop, which is
 * what got the /shop library out of the same hole in August 2026.
 */
export default function AllPostsIndex() {
  const posts = getAllPosts();
  const grouped = new Map<BlogCategory, BlogPost[]>();
  for (const post of posts) {
    const list = grouped.get(post.category) ?? [];
    list.push(post);
    grouped.set(post.category, list);
  }
  const categories = (Object.keys(blogCategories) as BlogCategory[]).filter((c) => grouped.has(c));

  return (
    <section className="bg-cream py-14 md:py-16 border-b border-[#D8D4C5]" aria-labelledby="all-posts-heading">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
            <span className="w-[22px] h-px bg-forest inline-block" />
            The whole archive
          </p>
          <h2
            id="all-posts-heading"
            className="font-display text-[clamp(1.75rem,3.2vw,2.4rem)] leading-[1.1] tracking-tight mt-3 text-balance"
          >
            Every post, <span className="italic text-forest">by topic.</span>
          </h2>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-10 [column-fill:_balance]">
          {categories.map((cat) => {
            const meta = blogCategories[cat];
            const list = grouped.get(cat)!;
            return (
              <div key={cat} className="break-inside-avoid mb-9">
                <h3
                  className="inline-flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.16em] mb-3"
                  style={{ color: meta.color }}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: meta.color }} aria-hidden="true" />
                  {meta.label}
                  <span className="text-gray-400 font-medium tracking-normal normal-case">({list.length})</span>
                </h3>
                <ul className="m-0 p-0 list-none space-y-2">
                  {list.map((post) => (
                    <li key={post.slug} className="text-[14.5px] leading-[1.45]">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-ink no-underline hover:text-forest-dark hover:underline decoration-forest/30 underline-offset-2"
                      >
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
