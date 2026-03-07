import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "I'm Amelie — a former teacher who left the classroom to give my own kids what the school system couldn't. Anywhere Learning is what I built along the way.",
  alternates: {
    canonical: "https://anywherelearning.co/about",
  },
};

const approaches = [
  "Charlotte Mason",
  "Montessori",
  "Worldschool",
  "Unschool",
  "Eclectic",
];

const values = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
    title: "The world is the classroom",
    description:
      "Kitchens, parks, airports, backyards — learning happens everywhere when you know what to look for.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: "Together time, not screen time",
    description:
      "Our activities are designed to be done together. No tablets, no apps — just you and your kids, hands-on.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "No prep, no stress",
    description:
      "Print it, pick an activity, and go. I do the thinking so you can focus on being present with your family.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: "Flexible by design",
    description:
      "No schedules, no sequences. Use the packs however you want — at home, travelling, or in between.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-cream">
      {/* Hero — personal, warm, sets the tone */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
          <p className="text-sm font-semibold text-gold uppercase tracking-[0.2em] mb-4">
            Meet Amelie
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-forest leading-[1.1] mb-6 text-balance">
            I was a teacher. Then I became a parent. And everything changed.
          </h1>
          <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">
            Anywhere Learning didn&apos;t start as a business. It started as a
            question I couldn&apos;t stop asking: why does the system I spent years
            working in fail so many of the kids sitting right in front of me?
          </p>
        </div>
      </section>

      {/* The real story — inside the system */}
      <section className="bg-warm-gradient py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="space-y-6 text-lg leading-relaxed text-gray-600">
            <p>
              I loved teaching. I loved watching kids light up when something
              clicked. But the longer I spent in the classroom, the harder it
              became to ignore what wasn&apos;t working.
            </p>
            <p>
              The system is built on a single assumption: that every child in a
              room should learn the same thing, in the same way, at the same
              pace. But that&apos;s not how kids work. The curious ones get bored
              waiting. The ones who need more time get left behind. And
              somewhere along the way, kids who walked in loving to learn start
              saying they hate school.
            </p>
            <p className="text-gray-800 font-medium text-xl md:text-2xl font-display text-forest">
              I watched it happen. Year after year. And I knew I didn&apos;t want
              that for my own kids.
            </p>
            <p>
              What bothered me most wasn&apos;t the reading or the maths — schools
              can teach those. It was everything they couldn&apos;t teach. How to
              think critically. How to solve a real problem, not a textbook one.
              How to budget, cook a meal, navigate a city, have a conversation
              with a stranger, or figure something out when nobody hands you the
              answer.
            </p>
            <p>
              The world is changing fast. AI is reshaping entire industries.
              The jobs our kids will do might not exist yet. And the school
              system is still running on a model designed for a world that
              doesn&apos;t exist anymore — teaching compliance when what kids
              actually need is curiosity, adaptability, and the confidence to
              figure things out on their own.
            </p>
          </div>
        </div>
      </section>

      {/* The pivot — becoming a homeschool parent */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <p className="text-sm font-semibold text-gold uppercase tracking-[0.2em] mb-4">
            The Leap
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-forest mb-8">
            So I left the classroom — and brought learning home.
          </h2>
          <div className="space-y-6 text-lg leading-relaxed text-gray-600">
            <p>
              When I started homeschooling, I did what most former teachers do —
              I tried to recreate school at the kitchen table. Lesson plans.
              Worksheets. A schedule on the fridge. It lasted about two weeks
              before my kids were miserable and I was exhausted.
            </p>
            <p>
              The breakthrough came when I stopped planning and started noticing.
              My kids were already learning — through cooking, building things,
              exploring outside, asking questions nobody had taught them to ask.
              They didn&apos;t need a curriculum. They needed someone to lean into
              their natural curiosity instead of working against it.
            </p>
            <p className="text-gray-800 font-medium text-xl md:text-2xl font-display text-forest">
              The learning was already happening. I just couldn&apos;t see it
              because it didn&apos;t look like school.
            </p>
            <p>
              I started creating simple activities that turned everyday
              moments — a walk in the park, a trip to the grocery store, a
              rainy afternoon — into meaningful learning experiences. No lesson
              plans. No grading. No prep. And my kids didn&apos;t just tolerate
              them. They asked for more.
            </p>
            <p>
              That&apos;s what became Anywhere Learning. Not a curriculum. Not a
              replacement for school. Just a collection of tools that help your
              kids build real-world skills through real life — wherever you are.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-warm-gradient py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-gold uppercase tracking-[0.2em] mb-4">
              What I Believe
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-forest">
              Learning should fit your life — not the other way around.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-2xl border border-gray-100 p-8"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-forest/[0.06] text-forest mb-5">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Works with any style */}
      <section className="bg-forest-section py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
          <p className="text-sm font-semibold text-gold-light uppercase tracking-[0.2em] mb-4">
            Works With Your Approach
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-cream mb-4">
            Whatever your style, these fit right in.
          </h2>
          <p className="text-cream/70 text-lg mb-10 max-w-xl mx-auto">
            I designed every pack to complement your philosophy — not replace it.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {approaches.map((style) => (
              <span
                key={style}
                className="inline-flex items-center gap-2 text-sm font-medium text-cream/90 bg-white/10 px-5 py-2.5 rounded-full border border-white/10"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {style}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — warm sign-off */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-2xl px-5 sm:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl text-forest mb-4">
            Ready to try a different kind of learning?
          </h2>
          <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto">
            Start with a free guide or browse the activity packs and see what
            fits your family.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              className="rounded-2xl bg-forest px-8 py-3.5 text-lg font-semibold text-cream transition-all hover:bg-forest-dark hover:shadow-md"
            >
              Browse Packs
            </Link>
            <Link
              href="/free-guide"
              className="rounded-2xl border-2 border-forest/20 px-8 py-3.5 text-lg font-semibold text-forest transition-all hover:border-forest/40 hover:bg-forest/5"
            >
              Get the Free Guide
            </Link>
          </div>
          <p className="mt-10 text-gray-400 text-sm italic">
            xo, Amelie
          </p>
        </div>
      </section>
    </div>
  );
}
