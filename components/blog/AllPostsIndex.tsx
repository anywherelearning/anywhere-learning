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
    <section className="bg-[#FFFDF8] py-10 md:py-12 shadow-[0_18px_30px_-20px_rgba(45,58,46,0.55)]" aria-labelledby="all-posts-heading">
      <div className="mx-auto max-w-[1180px] px-6 md:px-10">
        <div className="mb-5">
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

        {/* Folded by topic: the links stay in the server-rendered HTML for
            crawlers, but readers see one short row per topic until they open it. */}
        <div className="grid items-start gap-x-10 sm:grid-cols-2">
          {categories.map((cat) => {
            const meta = blogCategories[cat];
            const list = grouped.get(cat)!;
            return (
              <details key={cat} className="group border-b border-[#E6E0CD]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3.5 marker:content-none [&::-webkit-details-marker]:hidden">
                  <h3
                    className="m-0 inline-flex items-center gap-2 text-[12.5px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: meta.color }}
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: meta.color }} aria-hidden="true" />
                    {meta.label}
                    <span className="font-medium normal-case tracking-normal text-gray-400">{list.length}</span>
                  </h3>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true" className="shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-180">
                    <path d="M1 1.5 6 6.5l5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <ul className="m-0 list-none space-y-2 p-0 pb-5">
                  {list.map((post) => (
                    <li key={post.slug} className="text-[14.5px] leading-[1.45]">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-ink no-underline decoration-forest/30 underline-offset-2 hover:text-forest-dark hover:underline"
                      >
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}
