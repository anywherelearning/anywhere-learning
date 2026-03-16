import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAllPosts } from '@/lib/blog';
import { getFallbackProducts } from '@/lib/fallback-products';

// When adding a new public page, add it to staticRoutes below.
// Excluded (not indexable): /sign-in, /sign-up, /account/*, /checkout/success

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogPosts = getAllPosts();

  // Use a fixed date for static pages so crawlers see real change signals
  const siteLastUpdated = new Date('2026-03-14');

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: 'https://anywherelearning.co',
      lastModified: siteLastUpdated,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://anywherelearning.co/shop',
      lastModified: siteLastUpdated,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://anywherelearning.co/blog',
      lastModified: siteLastUpdated,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://anywherelearning.co/about',
      lastModified: siteLastUpdated,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://anywherelearning.co/free-guide',
      lastModified: siteLastUpdated,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://anywherelearning.co/faq',
      lastModified: siteLastUpdated,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://anywherelearning.co/contact',
      lastModified: siteLastUpdated,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: 'https://anywherelearning.co/privacy',
      lastModified: siteLastUpdated,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://anywherelearning.co/terms',
      lastModified: siteLastUpdated,
      changeFrequency: 'yearly',
      priority: 0.3,
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
      lastModified: p.createdAt ? new Date(p.createdAt) : siteLastUpdated,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...baseRoutes, ...productUrls];
  } catch {
    // DB unavailable — use fallback products so sitemap still includes product URLs
    const fallback = getFallbackProducts();
    const fallbackUrls = fallback.map((p) => ({
      url: `https://anywherelearning.co/shop/${p.slug}`,
      lastModified: siteLastUpdated,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
    return [...baseRoutes, ...fallbackUrls];
  }
}
