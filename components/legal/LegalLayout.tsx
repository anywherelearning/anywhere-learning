'use client';

import { useState, type ReactNode } from 'react';

export interface LegalSection {
  id: string;
  title: string;
  content: ReactNode;
}

interface Props {
  eyebrow: string;
  title: ReactNode;
  sub: string;
  lastUpdated: string;
  sections: LegalSection[];
  helpline?: { lead: string; body: ReactNode };
}

export default function LegalLayout({
  eyebrow,
  title,
  sub,
  lastUpdated,
  sections,
  helpline,
}: Props) {
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  return (
    <main className="bg-cream">
      {/* HEADER */}
      <header className="bg-cream pt-16 md:pt-20 pb-10 md:pb-12 text-center">
        <div className="mx-auto max-w-[760px] px-6">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
            <span className="w-[22px] h-px bg-forest inline-block" />
            {eyebrow}
          </p>
          <h1 className="font-display text-[clamp(2.375rem,5.2vw,3.5rem)] leading-[1.04] tracking-tight mt-4 text-balance">
            {title}
          </h1>
          <p className="mt-4 max-w-[600px] mx-auto text-[17px] md:text-[18px] leading-[1.55] text-gray-600">
            {sub}
          </p>
          <p className="mt-4 text-[13.5px] font-medium text-gray-500 tracking-wide">
            Last updated: {lastUpdated}
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-[1180px] border-b border-[#D8D4C5]" />

      {/* LAYOUT */}
      <section className="pt-10 md:pt-12 pb-16 md:pb-20">
        <div className="mx-auto max-w-[1100px] px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 lg:gap-12 items-start">
            <aside>
              {/* Desktop TOC */}
              <nav
                aria-label="On this page"
                className="hidden lg:block sticky top-[96px]"
              >
                <h2 className="font-medium text-[11.5px] tracking-[0.18em] uppercase text-gray-500 m-0 mb-4 px-3 flex items-center gap-2.5">
                  <span aria-hidden="true" className="w-3.5 h-px bg-[#C9C5B7]" />
                  In this document
                </h2>
                <ul className="list-none p-0 m-0 border-t border-[#D8D4C5]">
                  {sections.map((s) => (
                    <li key={s.id} className="border-b border-[#D8D4C5]">
                      <a
                        href={`#${s.id}`}
                        className="block px-3 py-2.5 text-[14.5px] leading-[1.35] text-gray-600 hover:text-forest-dark hover:bg-[#F2EFE4] transition-colors no-underline border-l-[3px] border-transparent -ml-[3px]"
                      >
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Mobile TOC */}
              <details
                className="lg:hidden bg-[#F2EFE4] border border-[#D8D4C5] rounded-[12px] overflow-hidden"
                open={mobileTocOpen}
                onToggle={(e) => setMobileTocOpen((e.target as HTMLDetailsElement).open)}
              >
                <summary className="cursor-pointer px-5 py-4 flex items-center justify-between gap-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-ink list-none [&::-webkit-details-marker]:hidden">
                  Jump to section
                  <span
                    className={`w-6 h-6 rounded-full bg-cream grid place-items-center text-gray-500 text-sm transition-transform ${
                      mobileTocOpen ? 'rotate-180 bg-[#E6EBDF] text-forest-dark' : ''
                    }`}
                    aria-hidden="true"
                  >
                    ⌄
                  </span>
                </summary>
                <ul className="list-none p-0 m-0 border-t border-[#D8D4C5]">
                  {sections.map((s) => (
                    <li key={s.id} className="border-b border-[#D8D4C5] last:border-b-0">
                      <a
                        href={`#${s.id}`}
                        onClick={() => setMobileTocOpen(false)}
                        className="block px-5 py-3 text-[14.5px] text-gray-600 hover:text-forest-dark hover:bg-cream transition-colors no-underline"
                      >
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            </aside>

            <article className="max-w-[720px] text-[16.5px] leading-[1.7] text-gray-600 legal-content">
              {sections.map((s, i) => (
                <section
                  key={s.id}
                  className={i === 0 ? 'first-of-type:mt-0' : 'mt-12'}
                >
                  <h2
                    id={s.id}
                    className="font-display text-[clamp(1.5rem,2.6vw,1.875rem)] leading-[1.18] tracking-tight text-ink mb-3.5 text-balance scroll-mt-[110px]"
                  >
                    {s.title}
                  </h2>
                  <div>{s.content}</div>
                </section>
              ))}
            </article>
          </div>
        </div>
      </section>

      {/* HELPLINE */}
      {helpline && (
        <div className="max-w-[600px] mx-auto px-6 pb-14 text-center">
          <p className="font-display italic text-[17px] text-[#C97B5C] m-0 mb-1.5">
            {helpline.lead}
          </p>
          <p className="text-[15px] text-gray-600 leading-[1.6] m-0">{helpline.body}</p>
        </div>
      )}
    </main>
  );
}
