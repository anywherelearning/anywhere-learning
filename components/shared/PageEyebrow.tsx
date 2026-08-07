/**
 * The small uppercase label above a heading, with its 22px rule.
 *
 *     —— ALL THE ACTIVITIES
 *
 * Nine pages had this hand-rolled with identical classes and four more had
 * near-misses (a gold version with no rule, a terracotta rule, a pill badge, or
 * nothing at all), so the same label rendered differently depending on where you
 * landed. This is the one copy.
 *
 * Pair it with a heading that inherits its colour and carries a single
 * `italic text-forest` accent phrase — that's the other half of the pattern.
 */
export default function PageEyebrow({
  children,
  tone = 'light',
  center = false,
  className = '',
}: {
  children: React.ReactNode;
  /** 'dark' for use over a forest or photo background. */
  tone?: 'light' | 'dark';
  /** Only needed when the parent isn't already text-center. */
  center?: boolean;
  className?: string;
}) {
  return (
    <p
      className={`${center ? 'flex justify-center' : 'inline-flex'} items-center gap-2.5 text-xs font-medium uppercase tracking-[0.18em] ${
        tone === 'dark' ? 'text-white/70' : 'text-forest-dark'
      } ${className}`}
    >
      <span
        className={`inline-block h-px w-[22px] ${tone === 'dark' ? 'bg-white/40' : 'bg-forest'}`}
        aria-hidden="true"
      />
      {children}
    </p>
  );
}
