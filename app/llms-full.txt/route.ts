/**
 * /llms-full.txt
 *
 * Companion to /llms.txt: inlines the full text of the most important pages
 * in a single file so AI retrieval tools (ChatGPT, Claude, Perplexity, etc.)
 * can grab comprehensive context for the brand in one fetch instead of
 * crawling the site.
 *
 * Content bundled:
 * - Brand header (name, tagline, mission, key facts)
 * - 3 pillar guides in full (real-world-learning, nature-based-learning,
 *   ai-digital-literacy) · the canonical reference content on the site
 * - 3 high-citability blog posts (deschooling stages, new to homeschooling,
 *   life skills before 12)
 * - Full FAQ
 * - Founder bio
 * - Product catalogue overview
 *
 * Auto-updates daily via ISR so content stays in sync without maintenance.
 */

import type { ContentBlock } from '@/lib/content-blocks';
import { getResourceBySlug } from '@/lib/resources';
import { getPostBySlug, formatDate } from '@/lib/blog';
import { allFaqItems } from '@/lib/faq-data';
import { getFallbackProducts } from '@/lib/fallback-products';

export const revalidate = 86400; // daily

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
          return b.text;
        case 'heading':
          return `${'#'.repeat(b.level + 1)} ${b.text}`; // h2 → ###, h3 → ####
        case 'pull-quote':
          return `> ${b.text}${b.attribution ? ` · ${b.attribution}` : ''}`;
        case 'list':
          return b.items
            .map((item, i) => (b.ordered ? `${i + 1}. ${item}` : `- ${item}`))
            .join('\n');
        case 'tip':
          return `**Tip · ${b.title}:** ${b.text}`;
        case 'summary':
          return `**Summary:** ${b.text}`;
        case 'faq':
          return b.items
            .map((q) => `**Q: ${q.question}**\n\nA: ${q.answer}`)
            .join('\n\n');
        default:
          return ''; // skip image/cta/product-callout/bundle-callout
      }
    })
    .filter(Boolean)
    .join('\n\n');
}

function pillarSection(slug: string, urlPrefix: '/guides' | '/blog'): string {
  const page = urlPrefix === '/guides' ? getResourceBySlug(slug) : getPostBySlug(slug);
  if (!page) return '';

  const url = `https://anywherelearning.co${urlPrefix}/${page.slug}`;
  const body = blocksToMarkdown(page.content);

  return [
    `## ${page.title}`,
    `Source: ${url}`,
    `Author: ${page.author.name} · ${('credentials' in page.author && page.author.credentials) || 'Former classroom teacher (B.Ed, M.Ed), 15 years'}`,
    `Published: ${formatDate(page.publishedAt)}${page.dateModified ? `  ·  Updated: ${formatDate(page.dateModified)}` : ''}`,
    ``,
    page.excerpt,
    ``,
    body,
  ].join('\n');
}

function productCatalogueOverview(): string {
  const products = getFallbackProducts()
    .filter((p) => p.isBundle || p.category === 'start-here')
    .slice(0, 12);

  return [
    `## Featured Products`,
    ``,
    products
      .map((p) => {
        const price = `$${(p.priceCents / 100).toFixed(2)}`;
        return `- **${p.name}** (${price}) · ${p.shortDescription}\n  https://anywherelearning.co/shop/${p.slug}`;
      })
      .join('\n'),
  ].join('\n');
}

export async function GET() {
  const pillarGuides = [
    pillarSection('real-world-learning', '/guides'),
    pillarSection('nature-based-learning', '/guides'),
    pillarSection('ai-digital-literacy', '/guides'),
  ].filter(Boolean);

  const pillarPosts = [
    pillarSection('five-stages-deschooling', '/blog'),
    pillarSection('new-to-homeschooling', '/blog'),
    pillarSection('life-skills-before-12', '/blog'),
  ].filter(Boolean);

  const faqSection = [
    `## Frequently Asked Questions`,
    ``,
    allFaqItems
      .map((q) => `**Q: ${q.question}**\n\nA: ${q.answer}`)
      .join('\n\n'),
  ].join('\n');

  const header = `# Anywhere Learning

> Low-prep activity guides for homeschool and worldschool families. Real-world learning for ages 6 to 14. Download, open on any device, and follow along with your kids.

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

- Home: https://anywherelearning.co
- Shop: https://anywherelearning.co/shop (60+ digital activity guides)
- Blog: https://anywherelearning.co/blog (40+ articles on homeschooling and worldschooling)
- Guides: https://anywherelearning.co/guides (pillar reference content)
- About: https://anywherelearning.co/about
- FAQ: https://anywherelearning.co/faq
- Free 7-day guide: https://anywherelearning.co/free-guide
- Contact: info@anywherelearning.co
- Pinterest: https://ca.pinterest.com/anywherelearning/
`;

  const body = [
    header,
    `---`,
    `# Pillar Guides`,
    ``,
    pillarGuides.join('\n\n---\n\n'),
    `---`,
    `# Reference Blog Posts`,
    ``,
    pillarPosts.join('\n\n---\n\n'),
    `---`,
    faqSection,
    `---`,
    productCatalogueOverview(),
  ].join('\n\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
