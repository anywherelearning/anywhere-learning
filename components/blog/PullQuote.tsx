interface PullQuoteProps {
  text: string;
  attribution?: string;
}

export default function PullQuote({ text, attribution }: PullQuoteProps) {
  return (
    <blockquote className="border-l-4 border-gold pl-6 md:pl-8 py-2 my-10 md:my-14">
      <p className="font-display text-2xl md:text-3xl text-forest leading-snug">
        {text}
      </p>
      {attribution && (
        <footer className="mt-3 text-sm text-gray-400">&mdash; {attribution}</footer>
      )}
    </blockquote>
  );
}
