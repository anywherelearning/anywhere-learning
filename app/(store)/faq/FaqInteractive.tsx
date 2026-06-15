'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { MEMBERSHIP_PRICE_YEAR } from '@/lib/membership';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqGroup {
  id: string;
  eyebrow: string;
  title: string;
  titleAccent: string;
  items: FaqItem[];
}

interface Props {
  groups: FaqGroup[];
}

export default function FaqInteractive({ groups }: Props) {
  const [query, setQuery] = useState('');
  const [openKey, setOpenKey] = useState<string | null>(null);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (it) =>
            it.question.toLowerCase().includes(q) || it.answer.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [query, groups]);

  const noMatches = query.trim().length > 0 && filteredGroups.length === 0;

  const renderAnswer = (text: string) => {
    const parts = text.split(/(\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em
            key={i}
            className="font-display not-italic italic text-forest-dark text-[17.5px]"
          >
            {part.slice(1, -1)}
          </em>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      {/* SEARCH BAR */}
      <div className="sticky top-[65px] md:top-[73px] z-40 bg-cream/95 backdrop-blur-sm border-y border-[#D8D4C5]">
        <div className="mx-auto max-w-[1180px] px-6">
          <div className="py-4 flex justify-center">
            <label className="relative w-full max-w-[540px]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="absolute left-[18px] top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search questions..."
                aria-label="Search questions"
                className="w-full appearance-none border-0 bg-[#F2EFE4] rounded-full pl-12 pr-12 py-3.5 text-[15.5px] text-ink outline-none focus:bg-cream focus:shadow-[0_0_0_1px_var(--color-forest),0_0_0_4px_rgba(88,129,87,0.18)] transition-all"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#DAD7CD] border-0 cursor-pointer grid place-items-center text-gray-700 text-sm hover:bg-[#C9C5B7]"
                >
                  &times;
                </button>
              )}
            </label>
          </div>
        </div>
      </div>

      {/* CATEGORY PILLS */}
      <div className="border-b border-[#D8D4C5]">
        <div className="mx-auto max-w-[1180px] px-6">
          <div className="flex flex-wrap justify-center gap-2.5 py-6">
            {groups.map((g) => (
              <a
                key={g.id}
                href={`#${g.id}`}
                className="inline-flex items-center bg-[#F2EFE4] text-ink font-medium text-[13.5px] px-4 py-2 rounded-full hover:bg-[#E6EBDF] hover:text-forest-dark hover:-translate-y-0.5 transition-all"
              >
                {g.eyebrow}
              </a>
            ))}
            <a
              href="#section-still"
              className="inline-flex items-center bg-[#F2EFE4] text-ink font-medium text-[13.5px] px-4 py-2 rounded-full hover:bg-[#E6EBDF] hover:text-forest-dark hover:-translate-y-0.5 transition-all"
            >
              Still have questions?
            </a>
          </div>
        </div>
      </div>

      {/* NO MATCHES */}
      {noMatches && (
        <div className="text-center py-16 px-6 max-w-[480px] mx-auto">
          <div className="font-display italic text-[60px] text-[#C97B5C] mb-2.5 leading-none">&ldquo;</div>
          <h3 className="font-display text-[24px] text-ink mb-2.5">No matches found.</h3>
          <p className="text-[15px] text-gray-600 mb-5">
            Try a shorter search, or check a different keyword.
          </p>
          <button
            onClick={() => setQuery('')}
            className="text-forest-dark font-semibold border-b border-forest/25 pb-0.5 hover:text-forest hover:border-forest-dark transition-colors"
          >
            Clear the search and see everything
          </button>
        </div>
      )}

      {/* FAQ SECTIONS — each section gets a distinct background to break the pattern */}
      {filteredGroups.map((g, i) => {
        const bgClass = [
          'bg-[#E6EBDF] border-y border-[#C9D3BE]',
          'bg-cream',
          'bg-[#F2EFE4] border-y border-[#D8D4C5]',
          'bg-cream',
        ][i % 4];
        return (
          <section
            key={g.id}
            id={g.id}
            className={`scroll-mt-[180px] py-16 md:py-20 ${bgClass}`}
          >
            <div className="mx-auto max-w-[760px] px-6 mb-8">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                <span className="w-[22px] h-px bg-forest inline-block" />
                {g.eyebrow}
              </p>
              <h2 className="font-display text-[clamp(1.75rem,3.6vw,2.625rem)] leading-[1.08] tracking-tight mt-3.5 text-balance">
                {g.title}{' '}
                <span className="italic text-forest">{g.titleAccent}</span>
              </h2>
            </div>
            <div className="mx-auto max-w-[760px] px-6">
              {g.items.map((item, idx) => {
                const key = `${g.id}-${idx}`;
                const isOpen = openKey === key;
                return (
                  <div
                    key={key}
                    className={`border-b border-[#D8D4C5] ${idx === 0 ? 'border-t' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenKey(isOpen ? null : key)}
                      aria-expanded={isOpen}
                      className="w-full flex justify-between items-start gap-6 py-5 text-left cursor-pointer hover:text-forest-dark transition-colors"
                    >
                      <span className="font-display text-[clamp(1.05rem,2vw,1.375rem)] leading-[1.3] tracking-tight text-ink">
                        {item.question}
                      </span>
                      <span
                        className={`shrink-0 w-7 h-7 mt-1 rounded-full border border-[#C9C5B7] grid place-items-center text-gray-600 text-lg leading-none transition-all duration-200 ${
                          isOpen
                            ? 'rotate-45 bg-forest text-cream border-forest'
                            : ''
                        }`}
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </button>
                    {isOpen && (
                      <div className="pb-6 text-gray-600 text-[16.5px] leading-[1.7] max-w-[660px]">
                        {item.answer.split('\n\n').map((p, pi) => (
                          <p key={pi} className={pi > 0 ? 'mt-2.5' : ''}>
                            {renderAnswer(p)}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* STILL HAVE QUESTIONS — distinct CTA card on cream so it breaks the section pattern */}
      <section
        id="section-still"
        className="bg-cream py-20 md:py-24 scroll-mt-[180px]"
      >
        <div className="mx-auto max-w-[1180px] px-6">
          <div className="relative max-w-[760px] mx-auto bg-gradient-to-br from-[#F2DECF] to-[#E8C8AE] border border-[rgba(201,123,92,0.35)] rounded-[20px] p-10 md:p-14 text-center shadow-[0_28px_50px_-32px_rgba(201,123,92,0.45)] overflow-hidden">
            <span
              aria-hidden="true"
              className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/40 blur-2xl"
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-forest/10 blur-3xl"
            />
            <div className="relative">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7A3D24] inline-flex items-center gap-2.5">
                <span className="w-[22px] h-px bg-[#C97B5C] inline-block" />
                Still have questions?
              </p>
              <h2 className="font-display text-[clamp(1.875rem,4vw,3rem)] leading-[1.06] tracking-tight mt-3.5 text-balance">
                We&apos;re <span className="italic text-[#7A3D24]">always happy</span> to help.
              </h2>
              <p className="mt-5 text-[17.5px] leading-[1.55] text-gray-700 max-w-[520px] mx-auto">
                Reach out. We read every email and reply within 24 hours.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2.5 bg-forest text-cream font-semibold py-3.5 px-6 rounded-xl text-[15.5px] shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_-1px_0_rgba(0,0,0,0.10)_inset,0_12px_26px_-14px_rgba(58,90,64,0.55)] hover:bg-forest-dark hover:-translate-y-px transition-all duration-200"
                >
                  Contact us
                  <span className="inline-grid place-items-center w-[22px] h-[22px] rounded-full bg-white/[0.18]">&rarr;</span>
                </Link>
                <Link
                  href="/start-trial"
                  className="inline-flex items-center gap-2 text-forest-dark font-semibold text-[15px] border-b border-forest/25 pb-1 hover:text-forest hover:border-forest-dark transition-colors"
                >
                  Or join the membership for {MEMBERSHIP_PRICE_YEAR}
                  <span className="font-display italic text-[17px] leading-none">&rarr;</span>
                </Link>
              </div>
              <p className="mt-6 text-[13.5px] text-gray-600">
                Email{' '}
                <a
                  href="mailto:info@anywherelearning.co"
                  className="text-gray-700 underline decoration-gray-400 underline-offset-[3px] hover:text-forest-dark hover:decoration-forest-dark"
                >
                  info@anywherelearning.co
                </a>{' '}
                directly if you&apos;d rather skip the form.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
