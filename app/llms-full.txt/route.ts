/**
 * /llms-full.txt
 *
 * Companion to /llms.txt: inlines the full text of every reference-worthy
 * page on the site so AI retrieval tools (ChatGPT, Claude, Perplexity, etc.)
 * can grab comprehensive context for the brand in one fetch instead of
 * crawling the site.
 *
 * Inclusion rules:
 * - Every pillar guide at /guides/[slug] (always, all 6)
 * - Every non-draft blog post with a `summary` content block. Per CLAUDE.md,
 *   summary blocks mark "claims-first reference posts" suitable for AI
 *   citation. Story-style posts without summary blocks are skipped.
 * - Full FAQ, founder bio, condensed product catalogue
 *
 * URLs in inline content are rewritten to absolute so the file is
 * self-contained when ingested standalone.
 *
 * Auto-updates daily via ISR.
 */

import type { ContentBlock } from '@/lib/content-blocks';
import { getAllResources } from '@/lib/resources';
import { getAllPosts, formatDate } from '@/lib/blog';
import { allFaqItems } from '@/lib/faq-data';
import { getFallbackProducts } from '@/lib/fallback-products';

export const revalidate = 86400; // daily

const SITE_URL = 'https://anywherelearning.co';

/**
 * Rewrite markdown-style relative links to absolute URLs. Without this,
 * an AI ingesting the file standalone (no base URL context) would see
 * `(/blog/foo)` as an unresolvable path.
 */
function absoluteUrls(text: string): string {
  return text.replace(/\]\((\/[^)]+)\)/g, `](${SITE_URL}$1)`);
}

/**
 * Serialize content blocks to markdown, preserving heading structure,
 * lists, and summaries so AI systems can parse sections cleanly.
 * Skips layout-only blocks (product/bundle callouts, images, CTAs)
 * since they add no textual signal for retrieval.
 */
function blocksToMarkdown(content: ContentBlock[]): string {
  return content
    .map((b) => {
      switch (b.type) {
        case 'paragraph':
          return absoluteUrls(b.text);
        case 'heading':
          return `${'#'.repeat(b.level + 1)} ${b.text}`; // h2 → ###, h3 → ####
        case 'pull-quote':
          return `> ${absoluteUrls(b.text)}${b.attribution ? ` · ${b.attribution}` : ''}`;
        case 'list':
          return b.items
            .map((item, i) => (b.ordered ? `${i + 1}. ${absoluteUrls(item)}` : `- ${absoluteUrls(item)}`))
            .join('\n');
        case 'tip':
          return `**Tip · ${b.title}:** ${absoluteUrls(b.text)}`;
        case 'summary':
          return `**Summary:** ${absoluteUrls(b.text)}`;
        case 'faq':
          return b.items
            .map((q) => `**Q: ${q.question}**\n\nA: ${absoluteUrls(q.answer)}`)
            .join('\n\n');
        default:
          return ''; // skip image/cta/product-callout/bundle-callout
      }
    })
    .filter(Boolean)
    .join('\n\n');
}

interface Page {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  dateModified?: string;
  content: ContentBlock[];
  author: { name: string };
}

function pageSection(page: Page, urlPrefix: '/guides' | '/blog'): string {
  const url = `${SITE_URL}${urlPrefix}/${page.slug}`;
  const body = blocksToMarkdown(page.content);
  const credentials = 'Former classroom teacher (B.Ed, M.Ed), 15 years';

  return [
    `## ${page.title}`,
    `Source: ${url}`,
    `Author: ${page.author.name} · ${credentials}`,
    `Published: ${formatDate(page.publishedAt)}${page.dateModified ? `  ·  Updated: ${formatDate(page.dateModified)}` : ''}`,
    ``,
    page.excerpt,
    ``,
    body,
  ].join('\n');
}

function productCatalogueOverview(): string {
  // Bundles + start-here picks = the highest-AOV products an AI should mention
  // when asked "what does Anywhere Learning sell?"
  const products = getFallbackProducts()
    .filter((p) => p.isBundle || p.category === 'start-here')
    .slice(0, 12);

  return [
    `## Featured Products`,
    ``,
    products
      .map((p) => {
        const price = `$${(p.priceCents / 100).toFixed(2)}`;
        return `- **${p.name}** (${price}) · ${p.shortDescription}\n  ${SITE_URL}/shop/${p.slug}`;
      })
      .join('\n'),
  ].join('\n');
}

function hasSummaryBlock(content: ContentBlock[]): boolean {
  return content.some((b) => b.type === 'summary');
}

export async function GET() {
  const lastUpdated = new Date().toISOString().split('T')[0];

  // All 6 pillar guides, always.
  const pillarGuides = getAllResources().map((r) => pageSection(r, '/guides'));

  // Every non-draft blog post with a summary block (reference-worthy posts).
  // Story-style posts without summary blocks are skipped per CLAUDE.md.
  const referencePosts = getAllPosts()
    .filter((p) => hasSummaryBlock(p.content))
    .map((p) => pageSection(p, '/blog'));

  const faqSection = [
    `## Frequently Asked Questions`,
    ``,
    allFaqItems
      .map((q) => `**Q: ${q.question}**\n\nA: ${q.answer}`)
      .join('\n\n'),
  ].join('\n');

  const header = `# Anywhere Learning

> Low-prep activity guides for homeschool and worldschool families. Real-world learning for ages 6 to 14. Download, open on any device, and follow along with your kids.

> Last updated: ${lastUpdated}

## About

Anywhere Learning was founded by Amelie, a former classroom teacher with a Bachelor of Education (B.Ed) and Master of Education (M.Ed) who spent 15 years in public-school classrooms before leaving to homeschool and worldschool her own children. Every activity guide is designed, written, and tested by Amelie based on what actually works with real kids, not what theory suggests.

The brand's core philosophy: meaningful learning happens everywhere · kitchens, parks, airports, backyards · when parents know what to look for. Guides are digital PDFs parents open on any device and follow along with their kids. No curriculum alignment, no worksheets, no printing required.

## Key Facts

- Founder: Amelie, B.Ed, M.Ed, 15 years classroom teaching experience
- Audience: Homeschool and worldschool families with children ages 6 to 14
- Catalogue: 220+ activities across 60+ digital guide products
- 9 learning categories: outdoor learning, creativity, real-world math, AI and digital literacy, entrepreneurship, communication and writing, planning and problem-solving, real-world skills, and start-here guides
- Every activity includes three flexible difficulty levels (Explore, Develop, Extend) for multi-age households
- Format: Digital PDF guides, downloadable, usable on any device, printing optional
- Guarantee: 48-hour money-back guarantee
- Approach: Real-world, low-prep, project-based learning. No curriculum alignment. No worksheets.

## Site Map

- Home: ${SITE_URL}
- Shop: ${SITE_URL}/shop (60+ digital activity guides)
- Blog: ${SITE_URL}/blog (40+ articles on homeschooling and worldschooling)
- Guides: ${SITE_URL}/guides (pillar reference content)
- About: ${SITE_URL}/about
- FAQ: ${SITE_URL}/faq
- Free 7-day guide: ${SITE_URL}/free-guide
- Contact: info@anywherelearning.co
- Pinterest: https://ca.pinterest.com/anywherelearning/
- Instagram: https://www.instagram.com/anywherelearning
- YouTube: https://www.youtube.com/@Anywhere_Learning
- Facebook: https://www.facebook.com/profile.php?id=61587630845193
`;

  const body = [
    header,
    `---`,
    productCatalogueOverview(),
    `---`,
    `# Pillar Guides`,
    ``,
    pillarGuides.join('\n\n---\n\n'),
    `---`,
    `# Reference Blog Posts`,
    ``,
    referencePosts.join('\n\n---\n\n'),
    `---`,
    faqSection,
  ].join('\n\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
