import type { BlogPost } from '@/lib/blog';
import BlogCard from './BlogCard';
import ScrollReveal from '@/components/shared/ScrollReveal';

interface RelatedPostsProps {
  posts: BlogPost[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section>
      <h2 className="font-display text-2xl md:text-3xl text-forest mb-8">
        Keep Reading
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => (
          <ScrollReveal key={post.slug} delay={i * 100}>
            <BlogCard
              slug={post.slug}
              title={post.title}
              excerpt={post.excerpt}
              category={post.category}
              heroImage={post.heroImage}
              heroImageAlt={post.heroImageAlt}
              compact
            />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
