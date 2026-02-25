const pillars = [
  {
    emoji: "🚫",
    title: "No curriculum",
    description: "Pick one activity. Try it this week. That's enough.",
  },
  {
    emoji: "🌍",
    title: "Works anywhere",
    description:
      "At home, travelling, on a grocery run, in the backyard.",
  },
  {
    emoji: "🎯",
    title: "Adapts to your child",
    description:
      "Every activity includes a note on how to scale it for different ages.",
  },
];

export default function WhyItWorks() {
  return (
    <section className="bg-gold-light/20 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-forest sm:text-4xl">
          The goal isn&apos;t to teach kids about life
        </h2>
        <p className="mt-3 text-lg text-gray-600">
          It&apos;s to let them live it — with your guidance.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {pillars.map((pillar, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-4xl" aria-hidden="true">
                {pillar.emoji}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-forest">
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
