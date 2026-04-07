import Link from 'next/link';
import Image from 'next/image';
import { blogCategories, formatDate, formatReadTime, type BlogPost } from '@/lib/blog';

interface BlogHeroProps {
  post: BlogPost;
}

export default function BlogHero({ post }: BlogHeroProps) {
  const cat = blogCategories[post.category];

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
      {/* Left: Image placeholder */}
      <Link href={`/blog/${post.slug}`} className="group">
        <div
          className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow"
          style={{ background: post.heroImage ? undefined : `linear-gradient(145deg, ${cat.color}25, ${cat.color}50)` }}
        >
          {post.heroImage ? (
            <Image
              src={post.heroImage}
              alt={post.heroImageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              style={post.heroImagePosition ? { objectPosition: post.heroImagePosition } : undefined}
            />
          ) : (
            <>
              {/* Decorative abstract shapes */}
              <div
                className="absolute top-[20%] right-[15%] w-24 h-24 rounded-full opacity-20 blur-xl"
                style={{ backgroundColor: cat.color }}
              />
              <div
                className="absolute bottom-[25%] left-[10%] w-32 h-32 rounded-full opacity-15 blur-2xl"
                style={{ backgroundColor: cat.color }}
              />
            </>
          )}
          {/* Category pill */}
          <span
            className="absolute top-4 left-4 text-xs font-semibold text-white px-3 py-1.5 rounded-full"
            style={{ backgroundColor: cat.color }}
          >
            {cat.label}
          </span>
          {/* Featured badge */}
          <span className="absolute top-4 right-4 text-xs font-bold text-forest bg-cream/90 backdrop-blur-sm px-3 py-1.5 rounded-full uppercase tracking-wider">
            Featured
          </span>
        </div>
      </Link>

      {/* Right: Text content */}
      <div>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-forest leading-[1.1] mb-4">
          <Link href={`/blog/${post.slug}`} className="hover:text-forest-dark transition-colors">
            {post.title}
          </Link>
        </h2>
        <p className="text-lg text-gray-500 leading-relaxed mb-6">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
          <div className="flex items-center gap-2">
            {post.author.avatarImage ? (
              <Image
                src={post.author.avatarImage}
                alt={post.author.name}
                width={28}
                height={28}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-cream text-xs font-semibold"
                style={{ backgroundColor: post.author.avatarColor }}
              >
                {post.author.name.charAt(0)}
              </div>
            )}
            <span>{post.author.name}</span>
          </div>
          <span>{formatDate(post.publishedAt)}</span>
          <span>{formatReadTime(post.readTimeMinutes)}</span>
        </div>
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-2 text-forest font-semibold group/link"
        >
          Read article
          <span className="group-hover/link:translate-x-1.5 transition-transform duration-300">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
