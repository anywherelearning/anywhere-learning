const items = [
  'Created for families learning differently',
  '220+ real-world activities',
  'Works with any homeschool style',
  'No curriculum needed',
  'Ages 4–14',
  'Download and use in minutes',
  '48-hour money-back guarantee',
  'Created by a worldschool mom',
];

export default function SocialProofTicker() {
  return (
    <div className="relative bg-forest overflow-hidden py-3" role="marquee" aria-label="Social proof highlights">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-forest to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-forest to-transparent z-10" />

      <div className="flex animate-marquee" aria-hidden="true">
        {[...items, ...items, ...items].map((item, i) => (
          <span
            key={i}
            className="flex-shrink-0 flex items-center gap-3 mx-6 text-sm font-medium text-cream/80 whitespace-nowrap"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
            {item}
          </span>
        ))}
      </div>

      {/* Screen-reader accessible version */}
      <div className="sr-only">
        {items.map((item, i) => (
          <span key={i}>{item}. </span>
        ))}
      </div>
    </div>
  );
}
