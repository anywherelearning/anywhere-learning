const approaches = [
  'Charlotte Mason',
  'Montessori',
  'Unschool',
  'Worldschool',
  'Eclectic',
];

export default function TrustBadges() {
  return (
    <div className="bg-gold-light/20 rounded-2xl p-6">
      <p className="text-sm text-gray-500 mb-3">Works beautifully with:</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {approaches.map((a) => (
          <span
            key={a}
            className="bg-white text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200"
          >
            {a}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
        <span>&#x1F6AB; No curriculum needed</span>
        <span>&#x1F30D; Works anywhere</span>
        <span>&#x1F3AF; Adapts to your child</span>
      </div>
    </div>
  );
}
