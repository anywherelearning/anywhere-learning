interface PullQuoteProps {
  text: string;
  attribution?: string;
}

export default function PullQuote({ text, attribution }: PullQuoteProps) {
  return (
    <blockquote className="relative my-14 md:my-20 py-8 md:py-10">
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full bg-gradient-to-b from-gold/60 via-gold/30 to-transparent" />

      {/* Decorative quotation mark */}
      <div className="pl-6 md:pl-10">
        <svg width="32" height="24" viewBox="0 0 32 24" className="text-gold/25 mb-4" fill="currentColor">
          <path d="M0 18.4C0 12.267 2.133 7.6 6.4 4.4 8.533 2.8 10.8 1.733 13.2.8l1.6 3.2C11.467 5.333 9.333 7.467 8.4 9.6c-.667 1.333-.8 2.4-.4 3.2.4.667 1.133 1.067 2.2 1.2 2.133.267 3.6 1.333 4.4 3.2.533 1.333.533 2.667 0 4-.8 2-2.533 3.267-5.2 3.8-3.6.533-6.4-.667-8.4-3.6-.667-1.067-1-2.133-1-3.2zm17.6 0c0-6.133 2.133-10.8 6.4-14C26.133 2.8 28.4 1.733 30.8.8l1.6 3.2c-3.333 1.333-5.467 3.467-6.4 5.6-.667 1.333-.8 2.4-.4 3.2.4.667 1.133 1.067 2.2 1.2 2.133.267 3.6 1.333 4.4 3.2.533 1.333.533 2.667 0 4-.8 2-2.533 3.267-5.2 3.8-3.6.533-6.4-.667-8.4-3.6-.667-1.067-1-2.133-1-3.2z" />
        </svg>
        <p className="font-display text-[1.5rem] md:text-[1.75rem] lg:text-[1.9rem] text-forest leading-[1.35] max-w-xl">
          {text}
        </p>
        {attribution && (
          <footer className="mt-5 flex items-center gap-3">
            <span className="w-6 h-px bg-gold/40" />
            <span className="text-[13px] text-gray-400 font-medium tracking-wide">{attribution}</span>
          </footer>
        )}
      </div>
    </blockquote>
  );
}
