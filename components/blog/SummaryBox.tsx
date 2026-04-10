import { parseInlineLinks } from '@/lib/content-blocks';

interface SummaryBoxProps {
  text: string;
  heading?: string;
}

export default function SummaryBox({ text, heading = 'In short' }: SummaryBoxProps) {
  return (
    <aside
      className="my-10 md:my-14 relative rounded-2xl border border-forest/[0.10] bg-gradient-to-br from-[#f0f5ef] via-[#f4f7f3] to-[#faf9f6] p-6 md:p-8 shadow-[0_2px_20px_-4px_rgba(88,129,87,0.08)]"
      role="note"
      aria-label="Article summary"
    >
      {/* Subtle decorative glow */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-forest/[0.03] blur-3xl pointer-events-none" />

      <div className="relative flex items-start gap-4 md:gap-5">
        {/* Icon */}
        <span className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-xl bg-forest/[0.08] flex items-center justify-center mt-0.5">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-forest"
            aria-hidden="true"
          >
            {/* Leaf / sprout icon - nature-aligned summary symbol */}
            <path d="M12 22V12" />
            <path d="M17 8c0 4-3.5 6-5 7.5" />
            <path d="M7 8c0 4 3.5 6 5 7.5" />
            <path d="M17 8c-4 0-6.5 1.5-8 4" />
            <path d="M7 8c4 0 6.5 1.5 8 4" />
            <path d="M7 8C7 4 9 2 12 2s5 2 5 6" />
          </svg>
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Label */}
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-forest/50 mb-2.5">
            {heading}
          </p>

          {/* Summary text */}
          <p className="text-[1.05rem] md:text-[1.1rem] leading-[1.75] text-gray-700 font-[450]">
            {parseInlineLinks(text)}
          </p>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="mt-6 flex items-center gap-2">
        <span className="h-px flex-1 bg-gradient-to-r from-forest/10 via-forest/[0.06] to-transparent" />
        <span className="w-1.5 h-1.5 rounded-full bg-forest/15" />
      </div>
    </aside>
  );
}
