function PillarIcon({ index }: { index: number }) {
  const svgProps = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "text-forest",
    "aria-hidden": true as const,
  };

  switch (index) {
    case 0:
      return (
        <svg {...svgProps}>
          <path d="M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5z" />
          <path d="M16 8L2 22" />
          <path d="M17.5 15H9" />
        </svg>
      );
    case 1:
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
      );
    case 2:
      return (
        <svg {...svgProps}>
          <path d="M4 21v-7" />
          <path d="M4 10V3" />
          <path d="M12 21v-9" />
          <path d="M12 8V3" />
          <path d="M20 21v-5" />
          <path d="M20 12V3" />
          <circle cx="4" cy="12" r="2" />
          <circle cx="12" cy="10" r="2" />
          <circle cx="20" cy="14" r="2" />
        </svg>
      );
    default:
      return null;
  }
}

const pillars = [
  {
    title: "No curriculum",
    description: "Pick one activity. Try it this week. That\u2019s enough.",
  },
  {
    title: "Works anywhere",
    description:
      "At home, travelling, on a grocery run, in the backyard.",
  },
  {
    title: "Adapts to your child",
    description:
      "Every activity includes a note on how to scale it for different ages.",
  },
];

export default function WhyItWorks() {
  return (
    <section className="bg-gold-light/20 py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-5 sm:px-8 text-center">
        <h2 className="font-display text-3xl md:text-5xl text-forest mb-3">
          The goal isn&apos;t to teach kids about life
        </h2>
        <p className="text-lg text-gray-600">
          It&apos;s to let them live it &mdash; with your guidance.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {pillars.map((pillar, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forest/10">
                <PillarIcon index={i} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-forest">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
