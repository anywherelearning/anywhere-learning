import type { Metadata } from "next";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import ChallengeSignup from "@/components/challenge/ChallengeSignup";
import { CHALLENGE, CHALLENGE_DAYS } from "@/lib/challenge";

export const metadata: Metadata = {
  title: "The Free 5-Day Real-World Skills Challenge",
  description:
    "A free 5-day challenge for homeschool and worldschool families. One 20-minute real-world activity a day, no prep and no worksheets, led by you and done alongside a former teacher. Starts August 17.",
  alternates: {
    canonical: "https://anywherelearning.co/challenge",
  },
  openGraph: {
    title: "The Free 5-Day Real-World Skills Challenge | Anywhere Learning",
    description:
      "Five days, five real-world activities, twenty minutes a day, no prep. A free challenge for families with kids 6 to 14. Starts August 17.",
    url: "https://anywherelearning.co/challenge",
    type: "website",
  },
};

const eventLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: CHALLENGE.name,
  description:
    "A free 5-day challenge for homeschool and worldschool families. One short, real-world activity a day, parent-led, with the founder in the group every day.",
  startDate: CHALLENGE.startISO,
  endDate: CHALLENGE.endISO,
  eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  isAccessibleForFree: true,
  location: {
    "@type": "VirtualLocation",
    url: "https://anywherelearning.co/challenge",
  },
  organizer: {
    "@type": "Organization",
    name: "Anywhere Learning",
    url: "https://anywherelearning.co",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: "https://anywherelearning.co/challenge",
  },
};

export default function ChallengePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLd) }}
      />
      <SiteHeader />
      <main className="bg-[#F2EFE4]">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 50% 0%, #ffffff 0%, #F2EFE4 55%, #EAE7D8 100%)",
            }}
          />
          <div className="relative mx-auto max-w-[760px] px-6 pb-16 pt-14 text-center md:pt-20">
            <p className="al-fade inline-flex items-center gap-2.5 rounded-full border border-[#DcCFA8] bg-white/70 px-4 py-1.5 text-[12.5px] font-semibold uppercase tracking-[0.13em] text-[#7A3D24]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C97B5C]" />
              Free 5-day challenge · Starts {CHALLENGE.startLabel}
            </p>

            <h1 className="al-rise mt-6 font-display text-[clamp(2.5rem,7vw,4.25rem)] leading-[1.02] tracking-tight text-balance">
              Five days.{" "}
              <span className="italic text-forest">Five real-world skills.</span>{" "}
              One capable kid.
            </h1>

            <p className="mx-auto mt-6 max-w-[54ch] text-[18px] leading-[1.7] text-gray-700">
              One 20-minute real-life activity a day, for five days. No prep, no
              printing, no worksheets. You lead it with your kid, and I&apos;m in
              the group every single day, doing it right alongside you.
            </p>

            <div className="mx-auto mt-8 max-w-[480px]">
              <ChallengeSignup id="hero" />
            </div>

            <p className="mt-6 text-[14px] text-gray-500">
              For families with kids roughly {CHALLENGE.ageRange}. Runs{" "}
              {CHALLENGE.rangeLabel}, {CHALLENGE.year}.
            </p>
          </div>
        </section>

        {/* ── The five days ── a trail, not a grid ── */}
        <section className="bg-cream">
          <div className="mx-auto max-w-[720px] px-6 py-16 md:py-20">
            <div className="text-center">
              <h2 className="font-display text-[clamp(1.85rem,4.5vw,2.75rem)] leading-[1.08] tracking-tight text-balance">
                What the five days look like
              </h2>
              <p className="mx-auto mt-4 max-w-[48ch] text-[16.5px] leading-[1.7] text-gray-600">
                A gentle build across the week. Each day is one small thing, done
                together, that quietly grows a real-world skill.
              </p>
            </div>

            <ol className="relative mt-12 ml-3 border-l-2 border-[#E1DBC6] pl-8 md:ml-6">
              {CHALLENGE_DAYS.map((d, i) => (
                <li key={d.day} className={i === CHALLENGE_DAYS.length - 1 ? "" : "pb-9"}>
                  <span
                    className="absolute -left-[13px] grid h-6 w-6 place-items-center rounded-full border-2 border-cream text-[11px] font-bold text-cream"
                    style={{ background: i === CHALLENGE_DAYS.length - 1 ? "#d4a373" : "#588157" }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-forest">
                    {d.day}
                  </p>
                  <h3 className="mt-1 font-display text-[23px] leading-tight text-ink">
                    {d.title}
                  </h3>
                  <p className="mt-2 max-w-[52ch] text-[15.5px] leading-[1.65] text-gray-600">
                    {d.blurb}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="bg-[#EDEADF]">
          <div className="mx-auto max-w-[880px] px-6 py-16 md:py-20">
            <h2 className="text-center font-display text-[clamp(1.85rem,4.5vw,2.75rem)] leading-[1.08] tracking-tight">
              How it works
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                {
                  h: "A daily nudge, two ways",
                  b: "Each morning you get a short email plus a post in our pop-up group with that day's activity. Open it, do it, done in about 20 minutes.",
                },
                {
                  h: "You lead, together",
                  b: "These are parent-led on purpose. You do the activity with your kid, not hand them a screen. That shared time is the whole point.",
                },
                {
                  h: "I'm in it with you",
                  b: "Post a photo or a comment when you finish and I'll reply, every day. It's a small group, so you get me, not a support inbox.",
                },
              ].map((c) => (
                <div
                  key={c.h}
                  className="rounded-2xl border border-[#E0DAC7] bg-cream p-6"
                >
                  <h3 className="font-display text-[21px] leading-tight text-forest-dark">
                    {c.h}
                  </h3>
                  <p className="mt-2.5 text-[15px] leading-[1.65] text-gray-600">
                    {c.b}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Founder note ── damaging admission = credibility ── */}
        <section className="bg-cream">
          <div className="mx-auto max-w-[640px] px-6 py-16 md:py-20">
            <div className="rounded-[22px] border border-[#E0DAC7] bg-[#FBF9F2] p-8 md:p-10">
              <p className="font-display text-[15px] italic text-gold-dark">
                A note from me
              </p>
              <p className="mt-4 text-[17px] leading-[1.75] text-gray-800">
                I&apos;ll be honest with you. I&apos;m one mom, not a company. I
                taught for fifteen years, watched kids slowly lose the everyday
                life skills that used to come for free, and eventually took a year
                off to travel and homeschool my own two. I never went back.
              </p>
              <p className="mt-4 text-[17px] leading-[1.75] text-gray-800">
                This challenge is the simplest version of what we do at our kitchen
                table and on the road. It&apos;s free, it&apos;s low-key, and
                because it&apos;s small, you actually get me. Come see what your kid
                can do with five real-world days.
              </p>
              <p className="mt-5 font-display text-[22px] text-forest-dark">Amelie</p>
              <p className="text-[13.5px] text-gray-500">
                Founder, Anywhere Learning · former teacher of 15 years
              </p>
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="bg-forest">
          <div className="mx-auto max-w-[620px] px-6 py-16 text-center md:py-20">
            <h2 className="font-display text-[clamp(1.9rem,5vw,3rem)] leading-[1.06] tracking-tight text-cream text-balance">
              Save your free spot
            </h2>
            <p className="mx-auto mt-4 max-w-[44ch] text-[16.5px] leading-[1.65] text-cream/85">
              We start {CHALLENGE.startLabel}. Pop your email in and I&apos;ll send
              you everything you need, plus the link to our group.
            </p>
            <div className="mx-auto mt-8 max-w-[480px] rounded-2xl bg-cream p-6 shadow-[0_30px_60px_-40px_rgba(0,0,0,0.6)]">
              <ChallengeSignup id="footer" />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
