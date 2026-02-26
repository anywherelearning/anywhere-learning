const approaches = [
  'Charlotte Mason',
  'Montessori',
  'Unschool',
  'Worldschool',
  'Eclectic',
];

const badges = [
  { icon: '🚫', label: 'No curriculum needed' },
  { icon: '🌍', label: 'Works anywhere' },
  { icon: '🎯', label: 'Adapts to your child' },
];

export default function TrustBadges() {
  return (
    <div className="rounded-xl bg-gold-light/20 p-6">
      {/* Philosophy approaches */}
      <p className="mb-3 text-sm font-medium text-gray-600">Works for:</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {approaches.map((a) => (
          <span
            key={a}
            className="rounded-full bg-cream px-3 py-1 text-xs font-medium text-forest"
          >
            {a}
          </span>
        ))}
      </div>

      {/* Icon badges */}
      <div className="flex flex-wrap gap-4">
        {badges.map((b) => (
          <span
            key={b.label}
            className="flex items-center gap-1.5 text-sm text-gray-700"
          >
            <span aria-hidden="true">{b.icon}</span>
            {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}
