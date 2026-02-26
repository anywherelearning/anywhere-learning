import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
  ];

  if (!process.env.DATABASE_URL) return staticRoutes;

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

    return [...staticRoutes, ...productUrls];
  } catch {
    return staticRoutes;
  }
}
