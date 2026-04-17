import type { MetadataRoute } from 'next';

// Explicit AI crawler allowlist. For a cold-start brand, signal clarity
// beats permissive-default: naming the major AI crawlers makes it
// unambiguous that the site welcomes their indexing and training access.
// Excludes Bytespider (low citation value relative to crawl cost).
const AI_CRAWLERS = [
  'GPTBot',              // OpenAI / ChatGPT training
  'ChatGPT-User',        // OpenAI live web tool
  'OAI-SearchBot',       // OpenAI search index
  'ClaudeBot',           // Anthropic / Claude training
  'anthropic-ai',        // Anthropic (legacy UA)
  'Claude-Web',          // Anthropic live web tool
  'PerplexityBot',       // Perplexity
  'Google-Extended',     // Google Gemini training opt-in signal
  'Applebot-Extended',   // Apple Intelligence training
  'CCBot',               // Common Crawl (feeds many LLM training sets)
  'Amazonbot',           // Amazon / Alexa / Rufus
  'Meta-ExternalAgent',  // Meta AI
];

const DISALLOWED = ['/account/', '/api/', '/sign-in', '/sign-up', '/checkout/', '/app-login', '/app-account', '/library'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOWED,
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: DISALLOWED,
      })),
    ],
    sitemap: 'https://anywherelearning.co/sitemap.xml',
  };
}
