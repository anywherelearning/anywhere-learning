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

  if (posts.length === 0) return null;

  return (
    <section className="pb-20 md:pb-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <ScrollReveal>
          <h2 className="font-display text-2xl sm:text-3xl text-forest mb-2">
            Keep Exploring
          </h2>
          <p className="text-gray-400 text-sm mb-10">
            Dive deeper with these related articles
          </p>
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <ScrollReveal key={post!.slug} delay={i * 80}>
              <BlogCard
                slug={post!.slug}
                title={post!.title}
                excerpt={post!.excerpt}
                category={post!.category}
                publishedAt={post!.publishedAt}
                readTimeMinutes={post!.readTimeMinutes}
                author={post!.author}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
