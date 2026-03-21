// ─── Shared Content Block Types & Rendering ───
// Used by both blog posts and resource pillar pages.

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PullQuote from '@/components/blog/PullQuote';
import BlogProductCallout from '@/components/blog/BlogProductCallout';
import BlogBundleCallout from '@/components/blog/BlogBundleCallout';
import SummaryBox from '@/components/blog/SummaryBox';

export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'pull-quote'; text: string; attribution?: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'image'; alt: string; caption?: string; src?: string }
  | { type: 'cta'; text: string; href: string; label: string }
  | { type: 'tip'; title: string; text: string }
  | { type: 'faq'; items: { question: string; answer: string }[] }
  | { type: 'product-callout'; slug: string; context?: string }
  | { type: 'bundle-callout'; slug: string; context?: string }
  | { type: 'summary'; text: string; heading?: string };

/** Backward-compatible alias */
export type BlogContentBlock = ContentBlock;

/* ─── Helpers ─── */

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getTableOfContents(content: ContentBlock[]) {
  const items = content
    .filter((b): b is { type: 'heading'; level: 2; text: string } => b.type === 'heading' && b.level === 2)
    .map((b) => ({ text: b.text, id: slugify(b.text) }));

  if (content.some((b) => b.type === 'faq')) {
    items.push({ text: 'Frequently asked questions', id: 'faq' });
  }

  return items;
}

export function getArticleBodyText(content: ContentBlock[]): string {
  return content
    .map((b) => {
      if (b.type === 'paragraph') return b.text;
      if (b.type === 'heading') return b.text;
      if (b.type === 'pull-quote') return b.text;
      if (b.type === 'list') return b.items.join(' ');
      if (b.type === 'tip') return b.text;
      if (b.type === 'summary') return b.text;
      return '';
    })
    .filter(Boolean)
    .join(' ');
}

/* ─── Inline Markdown Link Parser ─── */

export function parseInlineLinks(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const isExternal = match[2].startsWith('http');
    parts.push(
      isExternal ? (
        <a
          key={match.index}
          href={match[2]}
          className="text-forest underline decoration-forest/30 underline-offset-2 hover:decoration-forest/60 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          {match[1]}
        </a>
      ) : (
        <Link
          key={match.index}
          href={match[2]}
          className="text-forest underline decoration-forest/30 underline-offset-2 hover:decoration-forest/60 transition-colors"
        >
          {match[1]}
        </Link>
      )
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

/* ─── Content Block Renderer ─── */

export function renderBlock(block: ContentBlock, index: number, isFirstParagraph: boolean) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p
          key={index}
          className={`text-[1.075rem] leading-[1.85] text-gray-600 mb-8 ${
            isFirstParagraph
              ? 'first-letter:text-[3.4rem] first-letter:font-display first-letter:text-forest first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-[0.75]'
              : ''
          }`}
        >
          {parseInlineLinks(block.text)}
        </p>
      );
    case 'heading':
      if (block.level === 2)
        return (
          <h2
            key={index}
            id={slugify(block.text)}
            className="mt-16 mb-6 scroll-mt-24 group"
          >
            <span className="block font-semibold text-[1.55rem] md:text-[1.7rem] text-forest leading-[1.25] tracking-[-0.01em]">
              {block.text}
            </span>
            <span className="block w-10 h-[2px] bg-gold/50 mt-3 rounded-full" />
          </h2>
        );
      return (
        <h3 key={index} className="font-semibold text-lg text-gray-800 mt-10 mb-4 leading-snug tracking-[-0.01em]">
          {block.text}
        </h3>
      );
    case 'pull-quote':
      return (
        <PullQuote
          key={index}
          text={block.text}
          attribution={block.attribution}
        />
      );
    case 'list':
      if (block.ordered) {
        return (
          <ol key={index} className="mb-8 space-y-3.5 pl-0 list-none">
            {block.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3.5 text-[1.075rem] leading-[1.85] text-gray-600">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-forest/8 text-forest text-xs font-semibold flex items-center justify-center mt-[5px] ring-1 ring-forest/[0.08]">
                  {i + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        );
      }
      return (
        <ul key={index} className="mb-8 space-y-3.5 pl-0 list-none">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3.5 text-[1.075rem] leading-[1.85] text-gray-600">
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-forest/40 mt-[11px]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case 'image':
      return (
        <figure key={index} className="my-12 md:my-16">
          {block.src ? (
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
              <Image
                src={block.src}
                alt={block.alt}
                fill
                sizes="(max-width: 768px) 100vw, 680px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="aspect-[16/9] rounded-2xl bg-warm-gradient border border-gray-100/50 flex items-center justify-center">
              <span className="text-gray-300 text-sm">{block.alt}</span>
            </div>
          )}
          {block.caption && (
            <figcaption className="mt-3 text-center text-[13px] text-gray-400 italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case 'cta':
      return (
        <div
          key={index}
          className="my-12 md:my-16 rounded-2xl border border-gold/15 bg-gradient-to-br from-[#fefbf6] via-[#fdf6ec] to-[#faf9f6] p-7 md:p-9 shadow-[0_2px_24px_-4px_rgba(212,163,115,0.12)]"
        >
          <div className="flex flex-col md:flex-row items-center gap-5 md:gap-7">
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gold/12 flex items-center justify-center rotate-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-gold -rotate-3">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div className="text-center md:text-left flex-1">
              <p className="text-gray-600 leading-relaxed text-[15px]">{block.text}</p>
            </div>
            <Link
              href={block.href}
              className="inline-block rounded-full bg-forest px-7 py-3 text-sm font-semibold text-cream transition-all hover:bg-forest-dark hover:shadow-lg hover:-translate-y-0.5 flex-shrink-0"
            >
              {block.label}
            </Link>
          </div>
        </div>
      );
    case 'tip':
      return (
        <div
          key={index}
          className="my-12 md:my-16 relative bg-white rounded-2xl p-6 md:p-8 border border-forest/[0.08] shadow-[0_1px_12px_-2px_rgba(88,129,87,0.06)]"
        >
          <div className="absolute -top-3 left-6 bg-cream px-3">
            <span className="text-[10px] font-bold text-forest uppercase tracking-[0.18em]">
              {block.title}
            </span>
          </div>
          <div className="flex items-start gap-4 pt-1">
            <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-forest/[0.06] flex items-center justify-center mt-0.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-forest">
                <path d="M9 18h6M12 2a7 7 0 00-2 13.7V17a1 1 0 001 1h2a1 1 0 001-1v-1.3A7 7 0 0012 2z" />
              </svg>
            </span>
            <p className="text-gray-600 leading-[1.7] text-[1.05rem] flex-1">{block.text}</p>
          </div>
        </div>
      );
    case 'faq':
      return (
        <div key={index} className="my-12 md:my-16">
          <h2 id="faq" className="font-semibold text-[1.35rem] text-forest mb-6 scroll-mt-24">Frequently asked questions</h2>
          <div className="space-y-3">
            {block.items.map((item, i) => (
              <details
                key={i}
                className="group rounded-xl border border-gray-100/60 bg-white shadow-[0_1px_8px_-2px_rgba(0,0,0,0.03)] overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer text-[1.05rem] font-medium text-gray-800 leading-snug hover:text-forest transition-colors [&::-webkit-details-marker]:hidden list-none">
                  {item.question}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 text-gray-300 group-open:rotate-180 transition-transform">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div className="px-6 pb-5 text-gray-600 text-[1.02rem] leading-[1.75]">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      );
    case 'product-callout':
      return <BlogProductCallout key={index} slug={block.slug} context={block.context} />;
    case 'bundle-callout':
      return <BlogBundleCallout key={index} slug={block.slug} context={block.context} />;
    case 'summary':
      return <SummaryBox key={index} text={block.text} heading={block.heading} />;
  }
}
