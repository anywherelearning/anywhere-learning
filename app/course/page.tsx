import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import CourseSignup from "@/components/course/CourseSignup";
import PageEyebrow from "@/components/shared/PageEyebrow";
import { COURSE, COURSE_DAYS, isCoursePageVisible } from "@/lib/course";

const DESCRIPTION =
  "A free 5-day email course from a former teacher of fifteen years: what real-world learning is, why it matters more now, how one real task carries the math, writing and life skills together, and the four moves to make it happen at home. Kids 6 to 14.";

// Under 155 so Google shows it whole. The longer DESCRIPTION stays in the Course schema.
const META_DESCRIPTION =
  "A free 5-day email course from a former teacher: what real-world learning is, and four moves to make it happen at home. For kids 6 to 14.";

export const metadata: Metadata = {
  // Absolute so the site suffix doesn't push it past the SERP cutoff
  title: { absolute: "Real-World Learning in 5 Days: Free Email Course" },
  description: META_DESCRIPTION,
  alternates: {
    canonical: "https://anywherelearning.co/course",
  },
  openGraph: {
    title: "Real-World Learning in 5 Days: Free Email Course | Anywhere Learning",
    description:
      "Five short emails from a former teacher: what real-world learning is, why it matters, and the four moves to make it happen at home. Free, for families with kids 6 to 14.",
    url: "https://anywherelearning.co/course",
    type: "website",
    images: [
      {
        url: "https://anywherelearning.co/og-default.jpg?v=3",
        width: 1200,
        height: 630,
        alt: "Real-World Learning in 5 Days, a free email course from Anywhere Learning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Real-World Learning in 5 Days: Free Email Course",
    description:
      "Five short emails from a former teacher: what real-world learning is, why it matters, and the four moves to make it happen at home.",
    images: ["https://anywherelearning.co/og-default.jpg?v=3"],
  },
};

const courseLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: COURSE.name,
  description: DESCRIPTION,
  url: "https://anywherelearning.co/course",
  isAccessibleForFree: true,
  inLanguage: "en",
  provider: {
    "@type": "Organization",
    name: "Anywhere Learning",
    url: "https://anywherelearning.co",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    category: "Free",
    url: "https://anywherelearning.co/course",
  },
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "online",
    courseSchedule: {
      "@type": "Schedule",
      duration: "PT5M",
      repeatFrequency: "Daily",
      repeatCount: 5,
    },
  },
};

const WHAT_YOU_LEARN = [
  "What real-world learning is, and the one-question test",
  "Why kids who do well at school can struggle with real life",
  "How one afternoon holds the math, the writing and the life skills",
  "The four moves I use at home, with real examples",
];

function Check() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="mt-[3px] h-[18px] w-[18px] shrink-0 text-forest"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4.5 10.5l3.5 3.5 7.5-8" />
    </svg>
  );
}

export default function CoursePage() {
  // Hidden in production until the Kit sequence exists. See COURSE.isLive.
  if (!isCoursePageVisible()) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseLd) }}
      />
      <SiteHeader />
      <main className="bg-[#F2EFE4]">
        {/* ── Hero ── outcome headline, what you get, one field ── */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 50% 0%, #ffffff 0%, #F2EFE4 55%, #EAE7D8 100%)",
            }}
          />
          <div className="relative mx-auto max-w-[760px] px-6 pb-16 pt-12 text-center md:pt-16">
            <PageEyebrow center className="al-fade">
              Free 5-day email course · Ages {COURSE.ageRange}
            </PageEyebrow>

            <h1 className="al-rise mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] leading-[1.04] tracking-tight text-balance">
              See the learning hiding in{" "}
              <span className="italic text-forest">your ordinary week.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-[54ch] text-[18px] leading-[1.7] text-gray-700">
              Five short emails from a former teacher of fifteen years who now does this
              with her own two kids. One a morning, a few minutes each.
            </p>

            <ul className="mx-auto mt-7 max-w-[500px] space-y-2.5 text-left">
              {WHAT_YOU_LEARN.map((item) => (
                <li key={item} className="flex gap-3 text-[16px] leading-[1.55] text-gray-700">
                  <Check />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mx-auto mt-8 max-w-[480px]">
              <CourseSignup id="hero" />
            </div>
          </div>
        </section>

        {/* ── The five days ── what lands in the inbox ── */}
        <section className="bg-cream">
          <div className="mx-auto max-w-[720px] px-6 py-16 md:py-20">
            <div className="text-center">
              <h2 className="font-display text-[clamp(1.85rem,4.5vw,2.75rem)] leading-[1.08] tracking-tight text-balance">
                What lands in your inbox
              </h2>
              <p className="mx-auto mt-4 max-w-[48ch] text-[16.5px] leading-[1.7] text-gray-600">
                One email a morning for five days, each a few minutes to read, most with
                one small thing to try that same day.
              </p>
            </div>

            <ol className="relative ml-3 mt-12 border-l-2 border-[#E1DBC6] pl-8 md:ml-6">
              {COURSE_DAYS.map((d, i) => (
                <li key={d.day} className={i === COURSE_DAYS.length - 1 ? "" : "pb-9"}>
                  <span
                    className="absolute -left-[13px] grid h-6 w-6 place-items-center rounded-full border-2 border-cream text-[11px] font-bold text-cream"
                    style={{ background: i === COURSE_DAYS.length - 1 ? "#d4a373" : "#588157" }}
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

        {/* ── Founder note ── */}
        <section className="bg-[#EDEADF]">
          <div className="mx-auto max-w-[640px] px-6 py-16 md:py-20">
            <div className="rounded-[22px] border border-[#E0DAC7] bg-[#FBF9F2] p-8 md:p-10">
              <p className="font-display text-[15px] italic text-gold-dark">A note from me</p>
              <p className="mt-4 text-[17px] leading-[1.75] text-gray-800">
                I taught for fifteen years, and somewhere along the way the kids started
                getting better at school and worse at life. I took a year off to travel and
                homeschool my own two, and I never went back.
              </p>
              <p className="mt-4 text-[17px] leading-[1.75] text-gray-800">
                This course is everything I wish someone had told me back then. Not a
                curriculum and not more on your plate. Just a clearer way of seeing the
                learning that&apos;s already in your house, and how to make more of it
                happen on purpose.
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
              Start with Day 1
            </h2>
            <p className="mx-auto mt-4 max-w-[44ch] text-[16.5px] leading-[1.65] text-cream/85">
              Pop your email in and the first one arrives in a few minutes. Free, five
              days, and you can unsubscribe any time.
            </p>
            <div className="mx-auto mt-8 max-w-[480px] rounded-2xl bg-cream p-6 shadow-[0_30px_60px_-40px_rgba(0,0,0,0.6)]">
              <CourseSignup id="footer" />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
