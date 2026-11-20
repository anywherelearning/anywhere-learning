import type { Metadata } from "next";
import Image from "next/image";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import PageEyebrow from "@/components/shared/PageEyebrow";
import LiveSignup from "@/components/live/LiveSignup";
import { REASON_TO_LEARN } from "@/lib/workshop";

/**
 * /a-reason-to-learn: "tell me when it opens" for the 6-week group program
 * (plan: ~/Desktop/Anywhere Learning/GROUP-PROGRAM-PLAN-2027.md). No price and
 * no checkout yet: sign-ups open Jan 13, and this same URL becomes the sales
 * page then, so links shared in December keep working. Noindex until then.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `${REASON_TO_LEARN.name}: ${REASON_TO_LEARN.subtitle} | Anywhere Learning` },
  description:
    "Six weeks of real-world learning at home with Amelie and a small group of families. One guide a week, a weekly live call, personal replies. Starts February 1.",
  robots: { index: false, follow: true },
};

const FACTS: [string, string][] = [
  ["When", `${REASON_TO_LEARN.runsLabel}, 2027`],
  ["Each week", "One real-world guide your family does together, whenever suits you. Ages 6 to 14."],
  ["Live", "A 40-minute call on Zoom every Tuesday at 7 PM ET, recorded for every time zone."],
  ["Support", "A private group where you share how it went and I reply to you personally."],
  ["Small", `${REASON_TO_LEARN.capFamilies} families at most, so I can actually answer everyone.`],
  ["Included", "A full year of the activity library for new families, to keep going after week 6."],
];

async function signedInEmail(): Promise<string> {
  try {
    const { currentUser } = await import("@clerk/nextjs/server");
    const u = await currentUser();
    return u?.emailAddresses?.[0]?.emailAddress ?? "";
  } catch {
    return "";
  }
}

export default async function ReasonToLearnPage() {
  const email = await signedInEmail();

  return (
    <>
      <SiteHeader />
      <main className="bg-[#F2EFE4]">
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(120% 90% at 50% 0%, #ffffff 0%, #F2EFE4 55%, #EAE7D8 100%)" }}
          />
          <div className="relative mx-auto max-w-[860px] px-6 pb-16 pt-12 text-center md:pt-16">
            <PageEyebrow center className="al-fade">
              Coming in February · Small group
            </PageEyebrow>
            <h1 className="al-rise mt-4 font-display text-[clamp(2.5rem,6vw,4.25rem)] leading-[1.02] tracking-tight text-balance">
              A Reason to <span className="italic text-forest">Learn</span>
            </h1>
            <p className="mt-3 text-[19px] font-medium text-gray-700">{REASON_TO_LEARN.subtitle}</p>
            <p className="mx-auto mt-6 max-w-[56ch] text-[18px] leading-[1.7] text-gray-700">
              You don&apos;t need a worksheet to do math. You need a reason to do math. For six
              weeks, your family does one real project a week, alongside a small group of families
              and with me there to help when you get stuck.
            </p>

            <div className="mx-auto mt-8 max-w-[500px] rounded-2xl bg-white/80 p-6 text-left shadow-[0_24px_48px_-36px_rgba(45,58,46,0.6)]">
              <p className="mb-4 text-center text-[15.5px] leading-[1.6] text-gray-700">
                Sign-ups open <strong className="text-ink">{REASON_TO_LEARN.opensLabel}</strong>.
                Families on this list hear first.
              </p>
              <LiveSignup
                id="interest"
                endpoint="/api/reason-to-learn"
                trackAs="rtl"
                defaultEmail={email}
                buttonLabel="Tell me when it opens"
                finePrint="One email when sign-ups open. No obligation."
                successTitle="You're on the list."
                successBody={
                  <p>
                    I&apos;ll email you on {REASON_TO_LEARN.opensLabel}, the day sign-ups open,
                    before the rest of my list hears about it. Spots are limited to{" "}
                    {REASON_TO_LEARN.capFamilies} families.
                  </p>
                }
              />
            </div>
          </div>
        </section>

        <section className="bg-cream">
          <div className="mx-auto grid max-w-[1000px] gap-12 px-6 py-16 md:grid-cols-[1.2fr_0.8fr] md:items-center md:py-20">
            <div>
              <h2 className="font-display text-[clamp(1.85rem,4.5vw,2.6rem)] leading-[1.08] tracking-tight">
                How it works
              </h2>
              <dl className="mt-7 divide-y divide-[#E7E1CF] border-y border-[#E7E1CF]">
                {FACTS.map(([k, v]) => (
                  <div key={k} className="grid gap-1 py-4 sm:grid-cols-[100px_1fr] sm:gap-4">
                    <dt className="text-[13px] font-semibold uppercase tracking-[0.12em] text-forest">{k}</dt>
                    <dd className="text-[15.5px] leading-[1.6] text-gray-700">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <figure className="mx-auto w-full max-w-[300px] rotate-[-3deg] bg-white p-3 pb-4 shadow-[0_24px_48px_-22px_rgba(45,58,46,0.55)]">
              <div className="relative aspect-square overflow-hidden bg-[#eee]">
                <Image
                  src="/images/course/amelie.jpg"
                  alt="Amelie, founder of Anywhere Learning"
                  fill
                  sizes="300px"
                  className="object-cover object-[center_20%]"
                />
              </div>
              <figcaption className="mt-3 text-center text-[14px] leading-[1.5] text-gray-600">
                <span className="font-display text-[18px] italic text-forest-dark">Amelie</span>
                <br />
                Former teacher of 15 years, mom of two
              </figcaption>
            </figure>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
