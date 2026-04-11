import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About",
  description:
    "I'm Amelie, a teacher with 15 years in the classroom, a B.Ed, and a Master's in Education. I left to give my own kids what the school system couldn't. Anywhere Learning is what I built along the way.",
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
      "Kitchens, parks, airports, backyards: learning happens everywhere when you know what to look for.",
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
      "Our activities are designed to be done together. No tablets, no apps, just you and your kids, hands-on.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Low prep, no stress",
    description:
      "Open it, pick an activity, and go. I do the thinking so you can focus on being present with your family.",
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
      "No schedules, no sequences. Use the guides however you want, at home, travelling, or in between.",
  },
];

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://anywherelearning.co/about#amelie",
  name: "Amelie",
  jobTitle: "Former Teacher & Founder of Anywhere Learning",
  description:
    "Former classroom teacher (B.Ed, M.Ed) with 15 years of experience who left to homeschool and worldschool her own kids. Creator of Anywhere Learning activity guides.",
  url: "https://anywherelearning.co/about",
  sameAs: ["https://ca.pinterest.com/anywherelearning/"],
  worksFor: {
    "@type": "Organization",
    name: "Anywhere Learning",
    url: "https://anywherelearning.co",
  },
  knowsAbout: [
    "Homeschooling",
    "Worldschooling",
    "Real-world learning",
    "Experiential education",
    "Charlotte Mason method",
    "Unschooling",
  ],
};

const profilePageLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  mainEntity: {
    "@id": "https://anywherelearning.co/about#amelie",
  },
  name: "About Amelie | Anywhere Learning",
  url: "https://anywherelearning.co/about",
};

export default function AboutPage() {
  return (
    <div className="bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageLd) }}
      />
      {/* Hero - personal, warm, sets the tone */}
      <section className="relative py-20 sm:py-28 md:py-32 overflow-hidden">
        <Image
          src="/about-hero-family.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[center_55%]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cream/90 via-cream/80 to-cream/40 lg:from-cream/85 lg:via-cream/70 lg:to-cream/25" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-cream to-transparent" />
        <div className="relative px-5 sm:px-10 lg:px-20">
          <div className="max-w-xl lg:max-w-2xl">
            <p className="text-sm font-semibold text-gold-dark uppercase tracking-[0.2em] mb-4">
              Meet Amelie
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-forest leading-[1.1] mb-6 text-balance">
              I spent 15 years in the classroom. Then I took my kids out of it.
            </h1>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              Anywhere Learning didn&apos;t start as a business. It started as a
              question I couldn&apos;t stop asking: why does the system I spent 15 years
              working in fail so many of the kids sitting right in front of me?
            </p>
          </div>
        </div>
      </section>

      {/* The real story - inside the system (forest bg for color) */}
      <section className="bg-forest-section py-12 md:py-16 relative overflow-hidden">
        <div className="absolute top-10 right-[8%] w-64 h-64 rounded-full border border-white/[0.04]" aria-hidden="true" />
        <div className="absolute bottom-10 left-[5%] w-40 h-40 rounded-full border border-white/[0.03]" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-5 sm:px-8">
          <div className="space-y-5 text-lg leading-relaxed text-cream/80">
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
            <p className="font-medium text-xl md:text-2xl font-display text-gold leading-snug">
              I watched it happen. Year after year. And I knew I didn&apos;t want
              that for my own kids.
            </p>
            <p>
              What bothered me most wasn&apos;t the reading or the maths. Schools
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
              doesn&apos;t exist anymore, teaching compliance when what kids
              actually need is curiosity, adaptability, and the confidence to
              figure things out on their own.
            </p>
          </div>
        </div>
      </section>

      {/* The travel discovery - warm gold accent section */}
      <section className="bg-gold/10 py-10 md:py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.08] to-transparent" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-5 sm:px-8">
          <div className="space-y-5 text-lg leading-relaxed text-gray-600">
            <p>
              I needed a break. A real one. So I took a year-long leave of
              absence, and our family hit the road. Seven months of
              travelling together. My kids were 12 and 9, and for the first
              time I was homeschooling them. No classroom. No system. Just us.
            </p>
            <p className="font-medium text-xl md:text-2xl font-display text-forest leading-snug">
              That trip changed everything. I saw what my kids had been
              missing inside the system, and how endless their possibilities
              were outside of it.
            </p>
            <p>
              It helped me make the decision I&apos;d been circling for years:
              leave the classroom for good and build something new. Something
              that would let me combine my endless creativity with what I
              cared about most, my own children&apos;s education.
            </p>
          </div>
        </div>
      </section>

      {/* The pivot - becoming a homeschool parent */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-lg mb-8">
            <Image
              src="/about-leap.jpg"
              alt="Amelie and her kids at a mountain lake"
              fill
              sizes="(max-width: 768px) 100vw, 720px"
              className="object-cover"
            />
          </div>
          <p className="text-sm font-semibold text-gold uppercase tracking-[0.2em] mb-3">
            The Leap
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-forest mb-6">
            So I left the classroom and brought learning home.
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-gray-600">
            <p>
              I did what most former teachers do at first: I started with
              lesson plans and worksheets. Old habits. But bit by bit,
              creativity started taking more space. We swapped the worksheets
              for hands-on projects, real-life experiments, things that got
              us all out of the house and into the world.
            </p>
            <p>
              Nobody was miserable. I wasn&apos;t exhausted. We were just&hellip;
              learning. Together. And my kids were more engaged than I&apos;d
              ever seen them.
            </p>
            <p className="text-gray-800 font-medium text-xl md:text-2xl font-display text-forest leading-snug">
              The learning was already happening. It just didn&apos;t look
              like school, and that was the whole point.
            </p>
            <p>
              I started creating simple activities that turned everyday
              moments, a walk in the park, a trip to the grocery store, a
              rainy afternoon, into meaningful learning experiences. No lesson
              plans. No grading. Low prep. And my kids didn&apos;t just tolerate
              them. They asked for more.
            </p>
            <p>
              That&apos;s what became Anywhere Learning. Not a curriculum. Not a
              replacement for school. Just a collection of tools that help your
              kids build real-world skills through real life, wherever you are.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-warm-gradient py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-gold uppercase tracking-[0.2em] mb-3">
              What I Believe
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-forest">
              Learning should fit your life, not the other way around.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-2xl border border-gray-100 p-7"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-forest/[0.06] text-forest mb-4">
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
      <section className="bg-forest-section py-12 md:py-16 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/[0.04]" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-5 sm:px-8 text-center">
          <p className="text-sm font-semibold text-gold-light uppercase tracking-[0.2em] mb-3">
            Works With Your Approach
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-cream mb-3">
            Whatever your style, these fit right in.
          </h2>
          <p className="text-cream/70 text-lg mb-8 max-w-xl mx-auto">
            I designed every guide to complement your philosophy, not replace it.
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

      {/* CTA - warm sign-off */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-2xl px-5 sm:px-8 text-center">
          <div className="relative w-full aspect-[4/3] max-w-sm mx-auto rounded-2xl overflow-hidden shadow-lg mb-8">
            <Image
              src="/about-family.jpg"
              alt="The whole family on a backcountry adventure in the snow"
              fill
              sizes="(max-width: 768px) 100vw, 384px"
              className="object-cover"
            />
          </div>
          <h2 className="font-display text-3xl md:text-4xl text-forest mb-3">
            Ready to try a different kind of learning?
          </h2>
          <p className="text-gray-500 text-lg mb-6 max-w-lg mx-auto">
            Start with a free guide or browse the activity guides and see what
            fits your family.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              className="rounded-2xl bg-forest px-8 py-3.5 text-lg font-semibold text-cream transition-all hover:bg-forest-dark hover:shadow-md"
            >
              Browse Guides
            </Link>
            <Link
              href="/free-guide"
              className="rounded-2xl border-2 border-forest/20 px-8 py-3.5 text-lg font-semibold text-forest transition-all hover:border-forest/40 hover:bg-forest/5"
            >
              Get the Free Guide
            </Link>
          </div>
          <p className="mt-8 text-gray-400 text-sm italic">
            xo, Amelie
          </p>
        </div>
      </section>
    </div>
  );
}
