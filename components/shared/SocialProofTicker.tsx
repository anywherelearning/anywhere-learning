const items = [
  'Life skills kids actually need',
  '100+ hands-on activity guides',
  'Created by a teacher (B.Ed, M.Ed)',
  'No curriculum needed',
  'Ages 6–14',
  'Works after school, weekends, and summers',
  '14-day refund guarantee',
  'New guides added regularly',
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
