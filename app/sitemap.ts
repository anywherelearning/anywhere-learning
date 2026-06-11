import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAllPosts } from '@/lib/blog';
import { getAllResources } from '@/lib/resources';
import { getFallbackProducts } from '@/lib/fallback-products';
import { IDEAS_DATA } from '@/lib/ideas';

// When adding a new public page, add it to staticRoutes below.
// Excluded (not indexable): /sign-in, /sign-up, /account/*, /checkout/success

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogPosts = getAllPosts();
  const resourcePages = getAllResources();

  // Stamp static pages with the build/revalidation timestamp so each deploy
  // signals freshness to crawlers. Pages with their own per-content dates
  // (blog posts, guides, products) override this below.
  const siteLastUpdated = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: 'https://anywherelearning.co',
      lastModified: siteLastUpdated,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://anywherelearning.co/join',
      lastModified: siteLastUpdated,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://anywherelearning.co/shop',
      lastModified: siteLastUpdated,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://anywherelearning.co/shop/starter-pack',
      lastModified: siteLastUpdated,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: 'https://anywherelearning.co/blog',
      lastModified: siteLastUpdated,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://anywherelearning.co/guides',
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

  // NOTE: We don't sitemap /shop?category=X URLs anymore. These are query-string
  // filters on a single canonical /shop page — Google treats them as duplicate
  // content and they dilute crawl budget. Internal links (header nav + the
  // category sections on /shop itself) handle discovery instead.
  const categoryRoutes: MetadataRoute.Sitemap = [];

  const blogUrls: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `https://anywherelearning.co/blog/${post.slug}`,
    lastModified: new Date(post.dateModified || post.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const resourceUrls: MetadataRoute.Sitemap = resourcePages.map((r) => ({
    url: `https://anywherelearning.co/guides/${r.slug}`,
    lastModified: new Date(r.dateModified || r.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }));

  // /ideas — free printable activity checklists. Listing page + 8 category
  // pages + every individual list page. These are strong top-of-funnel SEO
  // landing pages, so they get solid priority. lastModified comes from real
  // per-list dates, not deploy time: Google ignores lastmod once it proves
  // unreliable, which forfeits recrawl prioritization site-wide.
  const ideaListDate = (list: { updated?: string; published?: string }) =>
    new Date(list.updated ?? list.published ?? '2026-06-10');
  const ideaCategoryDate = (cat: (typeof IDEAS_DATA)[number]) =>
    new Date(Math.max(...cat.lists.map((l) => ideaListDate(l).getTime())));
  const ideasHubDate = new Date(
    Math.max(...IDEAS_DATA.map((c) => ideaCategoryDate(c).getTime())),
  );

  const ideasRoutes: MetadataRoute.Sitemap = [
    {
      url: 'https://anywherelearning.co/ideas',
      lastModified: ideasHubDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...IDEAS_DATA.map((cat) => ({
      url: `https://anywherelearning.co/ideas/${cat.slug}`,
      lastModified: ideaCategoryDate(cat),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...IDEAS_DATA.flatMap((cat) =>
      cat.lists.map((list) => ({
        url: `https://anywherelearning.co/ideas/${list.slug}`,
        lastModified: ideaListDate(list),
        changeFrequency: 'monthly' as const,
        priority: 0.75,
      })),
    ),
  ];

  const baseRoutes = [...staticRoutes, ...categoryRoutes, ...blogUrls, ...resourceUrls, ...ideasRoutes];

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
    // DB unavailable - use fallback products so sitemap still includes product URLs
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
