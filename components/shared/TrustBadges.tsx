const approaches = [
  'Charlotte Mason',
  'Montessori',
  'Unschool',
  'Worldschool',
  'Eclectic',
];

export default function TrustBadges() {
  return (
    <div className="max-w-xl mx-auto">
      {/* Approach pills - subtle, inline */}
      <div className="flex flex-wrap justify-center gap-2">
        {approaches.map((a, i) => (
          <span key={a} className="flex items-center gap-1.5">
            <span className="text-sm text-gray-400 font-medium">{a}</span>
            {i < approaches.length - 1 && (
              <span className="text-forest/20 text-xs mx-1" aria-hidden="true">&bull;</span>
            )}
          </span>
        ))}
      </div>

      {/* Benefits - minimal, spaced */}
      <div className="mt-5 flex flex-wrap justify-center gap-x-8 gap-y-2">
        <span className="flex items-center gap-2 text-sm text-gray-400">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-forest/40" aria-hidden="true">
            <path d="M13.3 4L6 11.3 2.7 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          No curriculum needed
        </span>
        <span className="flex items-center gap-2 text-sm text-gray-400">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-forest/40" aria-hidden="true">
            <path d="M13.3 4L6 11.3 2.7 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Works anywhere
        </span>
        <span className="flex items-center gap-2 text-sm text-gray-400">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-forest/40" aria-hidden="true">
            <path d="M13.3 4L6 11.3 2.7 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Adapts to your child
        </span>
      </div>
    </div>
  );
}
