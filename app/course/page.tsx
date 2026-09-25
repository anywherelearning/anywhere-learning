import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
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

// Real photos from our own weeks, fanned across the hero like a scrapbook.
// [file in /images/course, caption, alt, rotation in degrees]
const POLAROIDS: [string, string, string, number][] = [
  ["popcorn-stand", "Popcorn stand", "A girl selling bags of popcorn at her own stand", -7],
  ["gold-panning", "Panning for gold", "Two kids panning for gold in a water trough", 4],
  ["pupusas", "Making pupusas", "A girl cooking pupusas on a griddle", -3],
  ["building-with-dad", "Building with Dad", "A girl and her dad building a wooden frame with a drill", 5],
  ["chopping-garlic", "Dinner prep", "A boy chopping garlic for dinner", -5],
  ["sitter-business", "Pitching his idea", "A boy standing behind his business poster at a table", 3],
  ["kitchen-science", "Kitchen science", "Two girls doing a colour experiment at the kitchen counter", -4],
];

const CTA_PHOTOS: [string, string, string][] = [
  ["washboard", "A girl washing clothes on a washboard", "left-0 top-6 -rotate-6"],
  ["banana-bread", "A boy baking banana bread", "right-0 top-0 rotate-[5deg]"],
  ["feeding-birds", "A girl holding out seeds for the birds", "left-16 bottom-0 rotate-[-2deg]"],
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
        {/* ── Hero ── headline, a fan of real photos, one field ── */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 50% 0%, #ffffff 0%, #F2EFE4 55%, #EAE7D8 100%)",
            }}
          />
          <div className="relative mx-auto max-w-[1200px] px-6 pb-16 pt-12 text-center md:pt-14">
            <PageEyebrow center className="al-fade">
              Free 5-day email course · Ages {COURSE.ageRange}
            </PageEyebrow>
            <h1 className="al-rise mx-auto mt-4 max-w-[820px] font-display text-[clamp(2.25rem,5vw,4rem)] leading-[1.04] tracking-tight text-balance">
              See the learning hiding in{" "}
              <span className="italic text-forest">your ordinary week.</span>
            </h1>

            {/* A 3x2 collage on phones (the seventh photo drops out), a fan on desktop */}
            <ul className="mx-auto mt-9 grid max-w-[360px] grid-cols-3 gap-x-2 gap-y-4 md:mt-10 md:flex md:max-w-none md:items-end md:justify-center md:gap-0 md:pb-6">
              {POLAROIDS.map(([file, caption, alt, rot], i) => (
                <li
                  key={file}
                  className={`relative bg-white p-1.5 pb-2 shadow-[0_14px_28px_-16px_rgba(45,58,46,0.5)] transition-transform duration-300 hover:z-10 hover:!rotate-0 md:w-[168px] md:shrink-0 md:p-2.5 md:pb-3 md:shadow-[0_18px_34px_-18px_rgba(45,58,46,0.5)] md:hover:-translate-y-2 ${
                    i === 0 ? "" : "md:-ml-[14px]"
                  } ${i === POLAROIDS.length - 1 ? "max-md:hidden" : ""}`}
                  style={{ transform: `rotate(${rot}deg) translateY(${i % 2 ? 10 : 0}px)` }}
                >
                  <div className="relative aspect-square overflow-hidden bg-[#eee]">
                    <Image
                      src={`/images/course/${file}.jpg`}
                      alt={alt}
                      fill
                      sizes="(min-width: 768px) 170px, 120px"
                      priority={i < 4}
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-1.5 truncate font-display text-[12px] italic text-gray-700 md:mt-2 md:text-[15px]">
                    {caption}
                  </p>
                </li>
              ))}
            </ul>

            <p className="mx-auto mt-8 max-w-[54ch] text-[18px] leading-[1.7] text-gray-700">
              Every one of these is real-world learning. Five short emails from a former teacher
              of fifteen years show you how to see it, and how to make more of it happen.
            </p>
            <div className="mx-auto mt-7 max-w-[480px]">
              <CourseSignup id="hero" />
            </div>
          </div>
        </section>

        {/* ── The five days, shown as the inbox they land in ── */}
        <section className="bg-cream">
          <div className="mx-auto grid max-w-[1100px] gap-12 px-6 py-16 md:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <h2 className="font-display text-[clamp(1.85rem,4.5vw,2.75rem)] leading-[1.08] tracking-tight text-balance">
                What lands in your inbox
              </h2>
              <p className="mt-4 max-w-[40ch] text-[16.5px] leading-[1.7] text-gray-600">
                One email a morning for five days, each a few minutes to read, most with one
                small thing to try that same day.
              </p>
              <ul className="mt-7 space-y-2.5">
                {WHAT_YOU_LEARN.map((item) => (
                  <li key={item} className="flex gap-3 text-[15.5px] leading-[1.55] text-gray-700">
                    <Check />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="overflow-hidden rounded-[20px] border border-[#E2DCC8] bg-white shadow-[0_30px_60px_-40px_rgba(45,58,46,0.45)]">
              <div className="flex items-center gap-2 border-b border-[#EEE9DA] bg-[#FAF8F2] px-5 py-3" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-[#E0B4A4]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#E8C99A]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#A9C1A3]" />
                <span className="ml-3 text-[13px] font-medium text-gray-500">Inbox</span>
              </div>
              <ol>
                {COURSE_DAYS.map((d, i) => (
                  <li
                    key={d.day}
                    className={`flex gap-4 px-5 py-5 ${i < COURSE_DAYS.length - 1 ? "border-b border-[#F0EBDD]" : ""} ${i === 0 ? "bg-[#F6F8F2]" : ""}`}
                  >
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                      <Image
                        src="/images/course/amelie.jpg"
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover object-[center_20%]"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className={`text-[14px] ${i === 0 ? "font-bold text-ink" : "font-semibold text-gray-700"}`}>
                          Amelie, Anywhere Learning
                        </p>
                        <p className="shrink-0 text-[12px] font-semibold uppercase tracking-[0.1em] text-forest">
                          {d.day}
                        </p>
                      </div>
                      <h3 className={`mt-0.5 text-[15.5px] text-ink ${i === 0 ? "font-bold" : "font-semibold"}`}>
                        {d.title}
                      </h3>
                      <p className="mt-1 text-[14px] leading-[1.55] text-gray-500">{d.blurb}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── Founder note, a letter with a taped photo ── */}
        <section className="bg-[#EDEADF]">
          <div className="mx-auto max-w-[720px] px-6 py-16 md:py-20">
            <div className="relative rounded-[6px] bg-[#FBF9F2] p-8 pt-10 shadow-[0_24px_50px_-30px_rgba(45,58,46,0.5)] md:p-12">
              <figure className="relative mx-auto -mt-16 mb-6 w-[140px] rotate-[4deg] md:float-right md:-mr-10 md:-mt-14 md:mb-0 md:ml-6 bg-white p-2 pb-2.5 shadow-[0_14px_28px_-16px_rgba(45,58,46,0.55)] md:-mr-10 md:w-[170px]">
                <span className="absolute -top-3 left-1/2 z-10 h-6 w-16 -translate-x-1/2 rotate-[-3deg] bg-[#E8C99A]/70" />
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src="/images/course/amelie.jpg"
                    alt="Amelie, founder of Anywhere Learning"
                    fill
                    sizes="170px"
                    className="object-cover object-[center_20%]"
                  />
                </div>
              </figure>
              <p className="font-display text-[15px] italic text-gold-dark">A note from me</p>
              <p className="mt-4 text-[17px] leading-[1.8] text-gray-800">
                I taught for fifteen years, and somewhere along the way the kids started getting
                better at school and worse at life. I took a year off to travel and homeschool my
                own two, and I never went back.
              </p>
              <p className="mt-4 text-[17px] leading-[1.8] text-gray-800">
                This course is everything I wish someone had told me back then. Not a curriculum
                and not more on your plate. Just a clearer way of seeing the learning that&apos;s
                already in your house, and how to make more of it happen on purpose.
              </p>
              <p className="mt-6 font-display text-[24px] text-forest-dark">Amelie</p>
              <p className="text-[13.5px] text-gray-500">
                Founder, Anywhere Learning · former teacher of 15 years
              </p>
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="bg-forest">
          <div className="mx-auto grid max-w-[1000px] items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-20">
            <div className="text-center md:text-left">
              <h2 className="font-display text-[clamp(1.9rem,5vw,3rem)] leading-[1.06] tracking-tight text-cream text-balance">
                Start with Day 1
              </h2>
              <p className="mt-4 max-w-[40ch] text-[16.5px] leading-[1.65] text-cream/85 max-md:mx-auto">
                Pop your email in and the first one arrives in a few minutes. Free, five days,
                and you can unsubscribe any time.
              </p>
              <div className="mt-8 rounded-2xl bg-cream p-6 text-left shadow-[0_30px_60px_-40px_rgba(0,0,0,0.6)]">
                <CourseSignup id="footer" />
              </div>
            </div>
            <div className="relative mx-auto hidden h-[340px] w-full max-w-[380px] md:block">
              {CTA_PHOTOS.map(([file, alt, pos]) => (
                <div
                  key={file}
                  className={`absolute w-[170px] bg-white p-2 pb-6 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)] ${pos}`}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image src={`/images/course/${file}.jpg`} alt={alt} fill sizes="170px" className="object-cover" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
