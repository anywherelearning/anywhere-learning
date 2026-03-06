import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAllPosts } from '@/lib/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogPosts = getAllPosts();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: 'https://anywherelearning.co',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://anywherelearning.co/shop',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://anywherelearning.co/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://anywherelearning.co/free-guide',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  const blogUrls: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `https://anywherelearning.co/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const baseRoutes = [...staticRoutes, ...blogUrls];

  if (!process.env.DATABASE_URL) return baseRoutes;

  try {
    const allProducts = await db
      .select()
      .from(products)
      .where(eq(products.active, true));

    const productUrls = allProducts.map((p) => ({
      url: `https://anywherelearning.co/shop/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...baseRoutes, ...productUrls];
  } catch {
    return baseRoutes;
  }
}
