import Link from 'next/link';

/**
 * The 2-minute quiz, offered early in the body of a life-skills page.
 *
 * BlogQuizCTA is the big end-of-article version. This one is a single line
 * of copy and a button, sized to sit under the summary box without pushing
 * the answer the reader came for off the screen. See QUIZ_FIRST_PAGES in
 * lib/lead-magnets.ts for which pages get it.
 */
export default function InlineQuizCard() {
  return (
    <aside
      aria-label="Free 2-minute quiz"
      className="my-8 md:my-10 rounded-2xl border border-[#C9D3BE] bg-[#E6EBDF] p-5 md:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-forest-dark mb-1.5">
          Free 2-minute quiz
        </p>
        <p className="font-display text-[1.3rem] md:text-[1.45rem] text-forest leading-[1.15] text-balance">
          What&apos;s your kid&apos;s missing life skill?
        </p>
        <p className="mt-1.5 text-[14.5px] text-gray-600 leading-relaxed">
          Eight quick questions. You get the one skill to focus on next and three activities to start with.
        </p>
      </div>
      <Link
        href="/quiz"
        className="shrink-0 self-start sm:self-center inline-flex items-center gap-2 rounded-xl bg-forest px-6 py-3 text-[15px] font-semibold text-cream transition-all hover:bg-forest-dark active:scale-[0.98] no-underline"
      >
        Take the quiz
        <span className="font-display italic text-[17px] leading-none">&rarr;</span>
      </Link>
    </aside>
  );
}
