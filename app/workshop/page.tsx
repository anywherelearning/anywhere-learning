import type { Metadata } from "next";
import Image from "next/image";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import PageEyebrow from "@/components/shared/PageEyebrow";
import LiveSignup, { LocalTime } from "@/components/live/LiveSignup";
import {
  WORKSHOP,
  WORKSHOP_DAY_LABEL,
  WORKSHOP_START,
  WORKSHOP_TIME_LABEL,
  isWorkshopOver,
} from "@/lib/workshop";

/**
 * /workshop: sign-up page for the free Jan 7 2027 launch workshop.
 * December's one call to action (reels, FB groups, Monthly Note, course end).
 * Noindex: it's a dated event. After the session it becomes a replay sign-up.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "One Real Task: Free Live Workshop with Amelie | Anywhere Learning" },
  description:
    "A free 40-minute live workshop: watch one real task teach math, writing and life skills at once, and leave with a plan for this weekend. For parents of kids 6 to 14.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "One Real Task: a free live workshop with Amelie",
    description:
      "Watch one real task teach math, writing and life skills at once. 40 minutes on Zoom, free, replay included.",
    url: "https://anywherelearning.co/workshop",
    type: "website",
    images: [{ url: "https://anywherelearning.co/og-default.jpg?v=6", width: 1200, height: 630 }],
  },
};

const AGENDA: [string, string, string][] = [
  [
    "10 min",
    "What real-world learning is",
    "A simple way to tell real-world learning from busywork, and why kids today get so little practice at real life.",
  ],
  [
    "20 min",
    "One real task, start to finish",
    "I walk you through the Budget Challenge, step by step: where the math shows up (prices, totals, a buffer), the writing (the plan and the pitch) and the life skills (choosing, cutting, owning a decision). Plus how to make it easier for a 6-year-old or bigger for a 14-year-old.",
  ],
  ["5 min", "Your questions", "Ask anything, out loud or in the chat."],
  [
    "5 min",
    "If you want more",
    "How the membership works, for anyone who's curious. A few minutes at the end, no pressure.",
  ],
];

const FAQ: [string, string][] = [
  [
    "What if I can't make it live?",
    "Sign up anyway. Everyone on the list gets the replay by email the next day.",
  ],
  [
    "Do I need to be on camera?",
    "No. Camera on or off, and nobody has to talk. You can just listen while you make dinner.",
  ],
  [
    "Do I need to homeschool?",
    "No. It's for any parent of a kid 6 to 14 who wants learning to feel more real, whether your kids are in school, at home, or somewhere in between.",
  ],
  [
    "Is it really free?",
    "Yes. No card, nothing to buy. At the end I'll explain how the membership works for anyone who wants more, and that's it.",
  ],
];

export default function WorkshopPage() {
  const over = isWorkshopOver();

  const signup = (id: string) => (
    <LiveSignup
      id={id}
      endpoint="/api/workshop"
      trackAs="workshop"
      buttonLabel={over ? "Send me the replay" : "Save my seat"}
      finePrint={
        over
          ? "Free. I'll email you the replay."
          : "Free. The Zoom link comes by email, and so does the replay."
      }
      successTitle={over ? "You're on the replay list." : "You're in."}
      successBody={
        over ? (
          <p>The replay comes to your inbox. Look in Promotions if you can&apos;t find it.</p>
        ) : (
          <p>
            A confirmation is on its way with a link to add it to your calendar. The Zoom link
            comes the day before. If you can&apos;t find it, look in Promotions.
          </p>
        )
      }
    />
  );

  return (
    <>
      <SiteHeader />
      <main className="bg-[#F2EFE4]">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(120% 90% at 30% 0%, #ffffff 0%, #F2EFE4 55%, #EAE7D8 100%)" }}
          />
          <div className="relative mx-auto grid max-w-[1100px] items-center gap-12 px-6 pb-16 pt-12 md:pt-16 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <PageEyebrow className="al-fade">
                {over ? "Free workshop replay" : "Free live workshop"} · Ages 6 to 14
              </PageEyebrow>
              <h1 className="al-rise mt-4 max-w-[640px] font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.04] tracking-tight text-balance">
                Watch one real task teach math, writing{" "}
                <span className="italic text-forest">and life skills.</span>
              </h1>
              <p className="mt-6 max-w-[54ch] text-[18px] leading-[1.7] text-gray-700">
                Forty minutes on Zoom with me, a former teacher of fifteen years. I&apos;ll take one
                real task from start to finish and show you where the learning hides. You leave
                with something your family can do this weekend.
              </p>

              {!over && (
                <div className="mt-7 inline-flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-[#E2DCC8] bg-white/80 px-5 py-3.5 text-[15px] text-gray-700">
                  <span className="font-semibold text-ink">{WORKSHOP_DAY_LABEL}</span>
                  <span>{WORKSHOP_TIME_LABEL} (5:00 PM PT)</span>
                  <span>{WORKSHOP.durationMin} minutes · Free</span>
                </div>
              )}
              {!over && (
                <LocalTime iso={WORKSHOP_START.toISOString()} className="mt-2 block text-[14px] text-gray-500" />
              )}

              <div className="mt-7 max-w-[500px]">{signup("hero")}</div>
            </div>

            <figure className="relative mx-auto w-full max-w-[340px] rotate-[3deg] bg-white p-3 pb-4 shadow-[0_24px_48px_-22px_rgba(45,58,46,0.55)]">
              <span className="absolute -top-3 left-1/2 z-10 h-6 w-20 -translate-x-1/2 rotate-[-3deg] bg-[#E8C99A]/70" />
              <div className="relative aspect-[3/4] overflow-hidden bg-[#eee]">
                <Image
                  src="/images/workshop/budget-challenge.jpg"
                  alt="A boy at the kitchen table with his notebook and laptop, planning a day out on a budget"
                  fill
                  priority
                  sizes="340px"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 text-center font-display text-[17px] italic text-gray-700">
                Planning a real day out, on a real budget
              </figcaption>
            </figure>
          </div>
        </section>

        {/* ── The 40 minutes ── */}
        <section className="bg-cream">
          <div className="mx-auto max-w-[860px] px-6 py-16 md:py-20">
            <h2 className="font-display text-[clamp(1.85rem,4.5vw,2.75rem)] leading-[1.08] tracking-tight text-balance">
              What we&apos;ll do in 40 minutes
            </h2>
            <ol className="mt-8 space-y-4">
              {AGENDA.map(([time, title, text]) => (
                <li
                  key={title}
                  className="grid gap-2 rounded-2xl border border-[#E7E1CF] bg-white p-5 sm:grid-cols-[88px_1fr] sm:gap-5 md:p-6"
                >
                  <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-forest">{time}</span>
                  <div>
                    <h3 className="text-[17px] font-semibold text-ink">{title}</h3>
                    <p className="mt-1.5 text-[15.5px] leading-[1.65] text-gray-600">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-[15.5px] leading-[1.65] text-gray-600">
              The Budget Challenge is written for ages 9 to 14, and I&apos;ll show you how to adjust
              it for younger kids. The way of looking at it works for anything your family does.
            </p>
          </div>
        </section>

        {/* ── Note from Amelie ── */}
        <section className="bg-[#EDEADF]">
          <div className="mx-auto max-w-[720px] px-6 py-16 md:py-20">
            <div className="relative rounded-[6px] bg-[#FBF9F2] p-8 pt-10 shadow-[0_24px_50px_-30px_rgba(45,58,46,0.5)] md:p-12">
              <figure className="relative mx-auto -mt-16 mb-6 w-[140px] rotate-[4deg] bg-white p-2 pb-2.5 shadow-[0_14px_28px_-16px_rgba(45,58,46,0.55)] md:float-right md:-mr-10 md:-mt-14 md:mb-0 md:ml-6 md:w-[160px]">
                <span className="absolute -top-3 left-1/2 z-10 h-6 w-16 -translate-x-1/2 rotate-[-3deg] bg-[#E8C99A]/70" />
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src="/images/course/amelie.jpg"
                    alt="Amelie, founder of Anywhere Learning"
                    fill
                    sizes="160px"
                    className="object-cover object-[center_20%]"
                  />
                </div>
              </figure>
              <p className="font-display text-[15px] italic text-gold-dark">Why I&apos;m doing this</p>
              <p className="mt-4 text-[17px] leading-[1.8] text-gray-800">
                I taught for fifteen years, then took a year off to travel and homeschool my own two,
                and never went back. The biggest thing I learned: you don&apos;t need a worksheet to
                do math. You need a reason to do math.
              </p>
              <p className="mt-4 text-[17px] leading-[1.8] text-gray-800">
                It&apos;s much easier to see than to explain, so I&apos;m going to show you, live,
                with one real task. Bring your questions.
              </p>
              <p className="mt-6 font-display text-[24px] text-forest-dark">Amelie</p>
              <p className="text-[13.5px] text-gray-500">Founder, Anywhere Learning · former teacher of 15 years</p>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="bg-cream">
          <div className="mx-auto max-w-[760px] px-6 py-16 md:py-20">
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.1] tracking-tight">
              Good questions
            </h2>
            <dl className="mt-8 divide-y divide-[#E7E1CF] border-y border-[#E7E1CF]">
              {FAQ.map(([q, a]) => (
                <div key={q} className="py-5">
                  <dt className="text-[17px] font-semibold text-ink">{q}</dt>
                  <dd className="mt-1.5 text-[15.5px] leading-[1.65] text-gray-600">{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="bg-forest">
          <div className="mx-auto max-w-[640px] px-6 py-16 text-center md:py-20">
            <h2 className="font-display text-[clamp(1.9rem,5vw,3rem)] leading-[1.06] tracking-tight text-cream text-balance">
              {over ? "Watch the replay" : "Save your seat"}
            </h2>
            {!over && (
              <p className="mt-3 text-[16.5px] leading-[1.65] text-cream/85">
                {WORKSHOP_DAY_LABEL} · {WORKSHOP_TIME_LABEL} · Free on Zoom
              </p>
            )}
            <div className="mt-8 rounded-2xl bg-cream p-6 text-left shadow-[0_30px_60px_-40px_rgba(0,0,0,0.6)]">
              {signup("footer")}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
