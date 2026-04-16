const thoughts = [
  {
    thought: "It's 10am and I still don't know what we're doing today.",
    follow: "Planning the day eats more energy than living it.",
  },
  {
    thought: "The curriculum's been open twice.",
    follow: "You bought it. You meant to. Life kept moving.",
  },
  {
    thought: "Am I doing enough?",
    follow: "The doubt shows up, even on good days.",
  },
];

export default function PainPoint() {
  return (
    <section className="bg-gold-light/10 py-14 md:py-20">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="text-center">
          <h2 className="font-display text-3xl md:text-5xl text-forest mb-3">
            Does this sound familiar?
          </h2>
          <p className="text-lg text-gray-600 mb-10">
            You&apos;re not alone. Most homeschool parents we talk to say the same things.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {thoughts.map((item, i) => (
            <div
              key={i}
              className="relative rounded-2xl bg-white p-6 pt-8 shadow-sm border border-gray-100"
            >
              <span
                aria-hidden="true"
                className="absolute -top-2 left-5 font-display text-6xl leading-none text-gold/50 select-none"
              >
                &ldquo;
              </span>
              <p className="text-base font-semibold text-forest leading-snug">
                {item.thought}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {item.follow}
              </p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-lg md:text-xl font-medium text-forest">
          You don&apos;t need a curriculum. You just need one activity a day for a week.
        </p>
      </div>
    </section>
  );
}
