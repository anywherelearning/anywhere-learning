"use client";

import { useEffect, useRef } from "react";

const skills = [
  {
    emoji: "🛒",
    name: "Budget a family grocery run",
    why: "Money management starts with real decisions — not abstract lessons",
  },
  {
    emoji: "🍳",
    name: "Plan a meal from scratch",
    why: "Cooking builds maths, science, creativity, and the deeply satisfying skill of feeding people you love",
  },
  {
    emoji: "🗺️",
    name: "Read a real map",
    why: "Spatial reasoning, independence, and confidence all get built the moment a child figures out where they are",
  },
  {
    emoji: "✉️",
    name: "Write a meaningful letter",
    why: "Writing with a real purpose — to a real person, expecting a real response — develops communication in a way no worksheet ever will",
  },
  {
    emoji: "🤝",
    name: "Negotiate (respectfully)",
    why: "Negotiation is one of the most underrated life skills — kids who learn it early are more confident, more articulate, and better at resolving conflict",
  },
  {
    emoji: "💰",
    name: "Manage a simple budget",
    why: "Kids who manage their own money — even small amounts — build judgment, patience, and an understanding of trade-offs that lasts a lifetime",
  },
  {
    emoji: "🧭",
    name: "Navigate somewhere new",
    why: "True independence starts with the belief that you can find your way. That belief only comes from doing it",
  },
  {
    emoji: "🌱",
    name: "Grow something",
    why: "Growing a plant teaches patience, responsibility, scientific observation, and the deeply grounding experience of caring for something alive",
  },
  {
    emoji: "💬",
    name: "Learn from a local",
    why: "The ability to ask good questions and learn from people with different lives is one of the most valuable social and intellectual skills a person can have",
  },
  {
    emoji: "🔧",
    name: "Solve a real problem",
    why: "Problem-solving confidence comes from actually solving problems — not practising on hypothetical ones",
  },
];

export default function SkillsGrid() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    const cards = gridRef.current?.querySelectorAll("[data-skill-card]");
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-forest sm:text-4xl">
            What&apos;s inside the guide
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            10 real-world activities your kids can try this week — wherever you
            are.
          </p>
        </div>

        <div
          ref={gridRef}
          className="mt-12 grid gap-4 sm:grid-cols-2"
        >
          {skills.map((skill, i) => (
            <article
              key={i}
              data-skill-card
              style={{ animationDelay: `${i * 80}ms` }}
              className="flex gap-4 rounded-xl border-l-4 border-forest bg-cream p-5 opacity-0 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="text-2xl" aria-hidden="true">
                {skill.emoji}
              </span>
              <div>
                <h3 className="font-semibold text-forest">{skill.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  {skill.why}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
