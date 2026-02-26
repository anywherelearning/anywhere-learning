"use client";

import { useEffect, useRef } from "react";

function SkillIcon({ index }: { index: number }) {
  const svgProps = {
    width: 24,
    height: 24,
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
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      );
    case 1:
      return (
        <svg {...svgProps}>
          <path d="M12 22c4-2.5 6-6 6-10a8.5 8.5 0 00-3-6c0 3.5-2 5-3 6-1.5-2-2-4-2-6a8.5 8.5 0 00-4 6c0 4 2 7.5 6 10z" />
        </svg>
      );
    case 2:
      return (
        <svg {...svgProps}>
          <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
          <path d="M8 2v16" />
          <path d="M16 6v16" />
        </svg>
      );
    case 3:
      return (
        <svg {...svgProps}>
          <path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
      );
    case 4:
      return (
        <svg {...svgProps}>
          <path d="M12 3v18" />
          <path d="M5 7l7-4 7 4" />
          <path d="M3 13l2-6 2 6a3 3 0 01-4 0z" />
          <path d="M17 13l2-6 2 6a3 3 0 01-4 0z" />
        </svg>
      );
    case 5:
      return (
        <svg {...svgProps}>
          <rect x="2" y="6" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
          <circle cx="17" cy="14" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case 6:
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88" />
        </svg>
      );
    case 7:
      return (
        <svg {...svgProps}>
          <path d="M12 22V12" />
          <path d="M12 12C12 8 8 6 4 6c0 4 2.5 6 8 6" />
          <path d="M12 15c0-4 4-6 8-6 0 4-2.5 6-8 6" />
        </svg>
      );
    case 8:
      return (
        <svg {...svgProps}>
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5A8.48 8.48 0 0121 11v.5z" />
        </svg>
      );
    case 9:
      return (
        <svg {...svgProps}>
          <path d="M9 18h6" />
          <path d="M10 22h4" />
          <path d="M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z" />
        </svg>
      );
    default:
      return null;
  }
}

const skills = [
  {
    name: "Budget a family grocery run",
    why: "Money management starts with real decisions \u2014 not abstract lessons",
  },
  {
    name: "Plan a meal from scratch",
    why: "Cooking builds maths, science, creativity, and the deeply satisfying skill of feeding people you love",
  },
  {
    name: "Read a real map",
    why: "Spatial reasoning, independence, and confidence all get built the moment a child figures out where they are",
  },
  {
    name: "Write a meaningful letter",
    why: "Writing with a real purpose \u2014 to a real person, expecting a real response \u2014 develops communication in a way no worksheet ever will",
  },
  {
    name: "Negotiate (respectfully)",
    why: "Negotiation is one of the most underrated life skills \u2014 kids who learn it early are more confident, more articulate, and better at resolving conflict",
  },
  {
    name: "Manage a simple budget",
    why: "Kids who manage their own money \u2014 even small amounts \u2014 build judgment, patience, and an understanding of trade-offs that lasts a lifetime",
  },
  {
    name: "Navigate somewhere new",
    why: "True independence starts with the belief that you can find your way. That belief only comes from doing it",
  },
  {
    name: "Grow something",
    why: "Growing a plant teaches patience, responsibility, scientific observation, and the deeply grounding experience of caring for something alive",
  },
  {
    name: "Learn from a local",
    why: "The ability to ask good questions and learn from people with different lives is one of the most valuable social and intellectual skills a person can have",
  },
  {
    name: "Solve a real problem",
    why: "Problem-solving confidence comes from actually solving problems \u2014 not practising on hypothetical ones",
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
    <section className="bg-cream py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="text-center">
          <h2 className="font-display text-3xl md:text-5xl text-forest">
            What&apos;s inside the guide
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            10 real-world activities your kids can try this week &mdash; wherever you
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
              className="flex gap-4 rounded-2xl bg-white p-5 opacity-0 shadow-sm border border-gray-100/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-forest/10">
                <SkillIcon index={i} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{skill.name}</h3>
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
