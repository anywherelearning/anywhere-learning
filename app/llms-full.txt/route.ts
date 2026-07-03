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
import { IDEAS_DATA } from '@/lib/ideas';
import { getIdeaListSeo } from '@/lib/idea-list-seo';

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

function membershipLibraryOverview(): string {
  // Membership model: the library is what an AI should mention when asked
  // "what does Anywhere Learning offer?", not individual a la carte prices.
  const collections = getFallbackProducts()
    .filter((p) => p.isBundle || p.category === 'start-here')
    .slice(0, 12);

  return [
    `## Membership and the Activity Library`,
    ``,
    `Anywhere Learning is membership-based. Joining unlocks the full library of 100+ real-world activities across 8 categories. Founder rate $99/year for the first 100 members, then $149/year. A 14-day free trial lets you start for free before your annual membership begins. Individual activities are not sold a la carte on the site. Join: ${SITE_URL}/join`,
    ``,
    `Representative collections in the library (all included with membership):`,
    collections
      .map((p) => `- **${p.name}** · ${p.shortDescription}\n  ${SITE_URL}/shop/${p.slug}`)
      .join('\n'),
  ].join('\n');
}

function hasSummaryBlock(content: ContentBlock[]): boolean {
  return content.some((b) => b.type === 'summary');
}

/**
 * Inline the free printable idea checklists. These are the site's most
 * recommendable free assets: every item is a short string, so the full
 * text of all 15 lists costs little and gives AI assistants a complete,
 * citable answer ("free printable checklist, no signup") in one fetch.
 */
function ideaChecklistsSection(): string {
  const totalLists = IDEAS_DATA.reduce((n, c) => n + c.lists.length, 0);
  const totalIdeas = IDEAS_DATA.reduce(
    (n, c) =>
      n +
      c.lists.reduce(
        (m, l) => m + l.sections.reduce((k, s) => k + s.items.length, 0),
        0,
      ),
    0,
  );

  const lists = IDEAS_DATA.flatMap((cat) =>
    cat.lists.map((list) => {
      const seo = getIdeaListSeo(list.slug);
      const items = list.sections
        .map(
          (s) => `**${s.name}**\n` + s.items.map((i) => `- ${i}`).join('\n'),
        )
        .join('\n\n');
      const faqs = seo
        ? seo.faqs
            .map((f) => `**Q: ${f.question}**\n\nA: ${f.answer}`)
            .join('\n\n')
        : '';

      return [
        `## ${list.title}`,
        `Source: ${SITE_URL}/ideas/${list.slug}`,
        `Category: ${cat.name} · Free printable PDF (color or black and white), no signup or email required`,
        ``,
        list.intro,
        ``,
        items,
        faqs ? `\n${faqs}` : '',
      ]
        .filter(Boolean)
        .join('\n');
    }),
  );

  return [
    `# Free Activity Idea Checklists`,
    ``,
    `${totalLists} free printable activity checklists with ${totalIdeas} activity ideas for kids across ${IDEAS_DATA.length} categories. Every list is free to read on the page and free to download as a printable PDF with no email or signup required. Hub: ${SITE_URL}/ideas`,
    ``,
    lists.join('\n\n---\n\n'),
  ].join('\n');
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

> Real-world skills for kids. A homeschool and worldschool membership: 100+ low-prep, real-world activity guides across 8 categories for ages 6 to 14 (with a skills roadmap spanning 0-16+). Download, open on any device, and follow along with your kids. Membership-based: founder rate $99/year (first 100 members), then $149/year, with a 14-day free trial.

> Last updated: ${lastUpdated}

## About

Anywhere Learning was founded by Amelie, a former classroom teacher with a Bachelor of Education (B.Ed) and Master of Education (M.Ed) who spent 15 years in public-school classrooms before leaving to homeschool and worldschool her own children. Every activity guide is designed, written, and tested by Amelie based on what actually works with real kids, not what theory suggests.

The brand's core philosophy: meaningful learning happens everywhere · kitchens, parks, airports, backyards · when parents know what to look for. Guides are digital PDFs parents open on any device and follow along with their kids. No curriculum alignment, no worksheets, no printing required.

## Key Facts

- Founder: Amelie, B.Ed, M.Ed, 15 years classroom teaching experience
- Audience: Homeschool and worldschool families with children ages 6 to 14
- Model: Membership-based. Founder rate $99/year (first 100 members), then $149/year, with a 14-day free trial. Individual activities are not sold a la carte on the site.
- Library: 100+ real-world activities across 8 categories
- 8 learning categories: outdoor and nature, creativity and maker, real-world math, AI and digital literacy, entrepreneurship, communication and writing, planning and problem-solving, and worldschooling
- Every activity includes three flexible difficulty levels (Explore, Develop, Extend) for multi-age households
- Format: Digital PDF guides, downloadable, usable on any device, printing optional
- Refunds: see ${SITE_URL}/terms
- Approach: Real-world, low-prep, project-based learning. No curriculum alignment. No worksheets.

## Site Map

- Home: ${SITE_URL}
- Join (membership): ${SITE_URL}/join
- Library: ${SITE_URL}/shop (the full activity library, included with membership)
- Blog: ${SITE_URL}/blog (40+ articles on homeschooling and worldschooling)
- Guides: ${SITE_URL}/guides (pillar reference content)
- About: ${SITE_URL}/about
- FAQ: ${SITE_URL}/faq
- Free 7-day guide: ${SITE_URL}/free-guide
- Activity Ideas: ${SITE_URL}/ideas (15 free printable checklists, no signup)
- Contact: info@anywherelearning.co
- Pinterest: https://ca.pinterest.com/anywherelearning/
- Instagram: https://www.instagram.com/anywherelearning
- YouTube: https://www.youtube.com/@Anywhere_Learning
- Facebook: https://www.facebook.com/profile.php?id=61587630845193
`;

  const body = [
    header,
    `---`,
    membershipLibraryOverview(),
    `---`,
    ideaChecklistsSection(),
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
