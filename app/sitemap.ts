import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAllPosts } from '@/lib/blog';
import { getAllResources } from '@/lib/resources';
import { getFallbackProducts } from '@/lib/fallback-products';
import { IDEAS_DATA } from '@/lib/ideas';
import { CHALLENGE } from '@/lib/challenge';

// When adding a new public page, add it to staticRoutes below.
// Excluded (not indexable): /sign-in, /sign-up, /account/*, /checkout/success

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogPosts = getAllPosts();
  const resourcePages = getAllResources();

  // Real last-edit dates per static route. Do NOT stamp these with the build
  // timestamp: a lastmod that moves on every deploy without the content moving
  // is a signal Google explicitly discounts, and it costs trust on the entries
  // that are honest (blog posts, guides, products carry real per-content dates).
  //
  // When you meaningfully change one of these pages, bump its date here.
  // Dates below were taken from the last real commit touching each page.
  const STATIC_LAST_MODIFIED: Record<string, string> = {
    '': '2026-08-16',
    '/shop': '2026-08-16',
    '/blog': '2026-08-07',
    '/guides': '2026-08-07',
    '/about': '2026-08-07',
    '/free-guide': '2026-08-21',
    '/quiz': '2026-08-07',
    '/challenge': '2026-08-22',
    '/guides/capable-kid': '2026-08-21',
    '/faq': '2026-08-07',
    '/contact': '2026-08-07',
    '/privacy': '2026-08-04',
    '/terms': '2026-08-04',
  };

  const staticDate = (path: string) =>
    new Date(STATIC_LAST_MODIFIED[path] ?? '2026-08-04');

  // Baseline for entries with no real per-content date of their own. Fixed on
  // purpose, for the same reason as above: a stable wrong-ish date is better
  // than a date that churns every deploy.
  const CONTENT_BASELINE = new Date('2026-08-04');

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: 'https://anywherelearning.co',
      lastModified: staticDate(''),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://anywherelearning.co/shop',
      lastModified: staticDate('/shop'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://anywherelearning.co/blog',
      lastModified: staticDate('/blog'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://anywherelearning.co/guides',
      lastModified: staticDate('/guides'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://anywherelearning.co/about',
      lastModified: staticDate('/about'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://anywherelearning.co/free-guide',
      lastModified: staticDate('/free-guide'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://anywherelearning.co/quiz',
      lastModified: staticDate('/quiz'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Only listed while the challenge is open. Gated on the same flag that
    // makes the page render, so the sitemap can never advertise a 404.
    ...(CHALLENGE.isLive
      ? [
          {
            url: 'https://anywherelearning.co/challenge',
            lastModified: staticDate('/challenge'),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
          },
        ]
      : []),
    {
      url: 'https://anywherelearning.co/guides/capable-kid',
      lastModified: staticDate('/guides/capable-kid'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://anywherelearning.co/faq',
      lastModified: staticDate('/faq'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://anywherelearning.co/contact',
      lastModified: staticDate('/contact'),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: 'https://anywherelearning.co/privacy',
      lastModified: staticDate('/privacy'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://anywherelearning.co/terms',
      lastModified: staticDate('/terms'),
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
      lastModified: p.createdAt ? new Date(p.createdAt) : CONTENT_BASELINE,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...baseRoutes, ...productUrls];
  } catch {
    // DB unavailable - use fallback products so sitemap still includes product URLs
    const fallback = getFallbackProducts();
    const fallbackUrls = fallback.map((p) => ({
      url: `https://anywherelearning.co/shop/${p.slug}`,
      lastModified: CONTENT_BASELINE,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
    return [...baseRoutes, ...fallbackUrls];
  }
}
