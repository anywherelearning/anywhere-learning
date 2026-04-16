"use client";

import { useEffect, useRef } from "react";

function DayIcon({ index }: { index: number }) {
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
    // Day 1 — Outdoor & Nature (leaf)
    case 0:
      return (
        <svg {...svgProps}>
          <path d="M12 22c4-2.5 6-6 6-10a8.5 8.5 0 00-3-6c0 3.5-2 5-3 6-1.5-2-2-4-2-6a8.5 8.5 0 00-4 6c0 4 2 7.5 6 10z" />
          <path d="M12 22V12" />
        </svg>
      );
    // Day 2 — Real-World Math (dollar sign)
    case 1:
      return (
        <svg {...svgProps}>
          <path d="M12 1v22" />
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      );
    // Day 3 — Creativity (music note)
    case 2:
      return (
        <svg {...svgProps}>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
    // Day 4 — AI & Digital (sparkle/wand)
    case 3:
      return (
        <svg {...svgProps}>
          <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" />
          <path d="M5 19l.8-1.8L7.6 16.4l-1.8-.8L5 13.8l-.8 1.8L2.4 16.4l1.8.8L5 19z" />
          <path d="M19 20l.5-1.2 1.2-.5-1.2-.5L19 16.6l-.5 1.2-1.2.5 1.2.5L19 20z" />
        </svg>
      );
    // Day 5 — Entrepreneurship (lightbulb)
    case 4:
      return (
        <svg {...svgProps}>
          <path d="M9 18h6" />
          <path d="M10 22h4" />
          <path d="M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z" />
        </svg>
      );
    // Day 6 — Communication (speech bubbles)
    case 5:
      return (
        <svg {...svgProps}>
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      );
    // Day 7 — Planning (calendar + check)
    case 6:
      return (
        <svg {...svgProps}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4" />
          <path d="M8 2v4" />
          <path d="M3 10h18" />
          <path d="M9 16l2 2 4-4" />
        </svg>
      );
    default:
      return null;
  }
}

const days = [
  {
    day: "Day 1",
    domain: "Outdoor & Nature",
    activity: "Square Foot Safari",
    why: "Your kid picks one small patch of ground, stays with it, and discovers everything living inside. Real field scientists call this a quadrat study.",
  },
  {
    day: "Day 2",
    domain: "Real-World Math",
    activity: "The $20 Snack Mission",
    why: "A real budget, real money, and real trade-offs at a real store. Math sticks when the numbers point at something kids care about.",
  },
  {
    day: "Day 3",
    domain: "Creativity",
    activity: "Household Orchestra",
    why: "Five random objects, 20 minutes, zero musical training. Real creativity comes from constraints, not unlimited options.",
  },
  {
    day: "Day 4",
    domain: "AI & Digital",
    activity: "Three AIs, One Question",
    why: "Ask the same question to ChatGPT, Claude, and Gemini \u2014 then watch your kid figure out when AI is bluffing. The single most important AI skill they can learn.",
  },
  {
    day: "Day 5",
    domain: "Entrepreneurship",
    activity: "Complaint \u2192 Product",
    why: "Every great business started as somebody\u2019s complaint. Your kid turns one family annoyance into a real product idea.",
  },
  {
    day: "Day 6",
    domain: "Communication",
    activity: "The Two-Minute Story",
    why: "Telling a clear, interesting story in two minutes is one of the most useful skills a person can have. It gets you jobs, friends, and dinner-party invitations.",
  },
  {
    day: "Day 7",
    domain: "Planning",
    activity: "Plan a Mini Adventure",
    why: "Your kid plans a real 2-hour family outing \u2014 and the family actually goes. Real ownership of a real decision, from start to finish.",
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

    const cards = gridRef.current?.querySelectorAll("[data-day-card]");
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-cream py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="text-center">
          <h2 className="font-display text-3xl md:text-5xl text-forest">
            What&apos;s inside the guide
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            Seven hands-on activities across seven different real-world skills.
            Pick one. Try it today.
          </p>
        </div>

        <div
          ref={gridRef}
          className="mt-8 grid gap-4 sm:grid-cols-2"
        >
          {days.map((item, i) => (
            <article
              key={i}
              data-day-card
              style={{ animationDelay: `${i * 80}ms` }}
              className="flex gap-4 rounded-2xl bg-white p-5 opacity-0 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-forest/10">
                <DayIcon index={i} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">
                  {item.day} &middot; {item.domain}
                </p>
                <h3 className="mt-1 font-semibold text-gray-800">{item.activity}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  {item.why}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
