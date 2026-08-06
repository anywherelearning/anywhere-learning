import EmbedSnippet from './EmbedSnippet';
import type { ToolSeoConfig } from '@/lib/tools/tool-seo';

/**
 * The two sections every tool landing page ends with: the rendered FAQ (which
 * mirrors the FAQPage JSON-LD) and the embed snippet bloggers can copy.
 */

/** Small link shown directly under the tool, jumping to the embed section. */
export function EmbedJumpLink() {
  return (
    <p className="mt-4 text-sm text-gray-500">
      Run a blog or teach a class?{' '}
      <a
        href="#embed"
        className="font-semibold text-forest underline-offset-2 hover:underline"
      >
        Embed this tool on your own site, free
      </a>
      .
    </p>
  );
}

export function ToolFaqSection({ tool, heading }: { tool: ToolSeoConfig; heading: string }) {
  return (
    <section className="py-14">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="font-display text-3xl text-forest-dark">{heading}</h2>
        <dl className="mt-6 space-y-6">
          {tool.faqs.map((faq) => (
            <div key={faq.question} className="rounded-2xl border border-forest/10 bg-white p-6">
              <dt className="font-semibold text-forest-dark">{faq.question}</dt>
              <dd className="mt-2 text-gray-700">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function ToolEmbedSection({ tool }: { tool: ToolSeoConfig }) {
  return (
    <section id="embed" className="scroll-mt-24 border-t border-forest/10 bg-white py-14">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="font-display text-3xl text-forest-dark">Embed this tool on your site</h2>
        <p className="mt-3 text-gray-600">
          Run a homeschool blog or a parenting site? You&apos;re welcome to embed this generator
          for your readers, free. Paste this snippet anywhere HTML is allowed. A link back to us
          is appreciated.
        </p>
        <div className="mt-5">
          <EmbedSnippet toolSlug={tool.slug} toolName={tool.name} />
        </div>
      </div>
    </section>
  );
}
