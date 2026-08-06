import type { Metadata } from 'next';
import Link from 'next/link';
import SpellingTool from '@/components/tools/SpellingTool';
import { EmbedJumpLink, ToolFaqSection, ToolEmbedSection } from '@/components/tools/ToolSections';
import { SPELLING, faqPageLd, softwareApplicationLd } from '@/lib/tools/tool-seo';

export const metadata: Metadata = {
  title: SPELLING.title,
  description: SPELLING.description,
  alternates: { canonical: 'https://anywherelearning.co/tools/spelling' },
  openGraph: {
    title: SPELLING.title,
    description: SPELLING.description,
    url: 'https://anywherelearning.co/tools/spelling',
    type: 'website',
  },
};

export default function SpellingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationLd(SPELLING)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageLd(SPELLING.faqs)) }}
      />

      <main className="bg-cream">
        {/* ── Tool ── */}
        <section className="pb-10 pt-12 md:pt-16">
          <div className="mx-auto max-w-[1180px] px-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">Free tool</p>
            <h1 className="font-display mt-2 text-4xl text-forest-dark md:text-5xl">
              {SPELLING.h1}
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-gray-600">
              Type this week&apos;s words once and print practice sheets or a blank numbered test.
              Same list, three formats. No signup, no watermark.
            </p>
            <div className="mt-8">
              <SpellingTool />
            </div>
            <EmbedJumpLink />
          </div>
        </section>

        {/* ── Explanatory content ── */}
        <section className="border-t border-forest/10 bg-white py-14">
          <div className="prose-custom mx-auto max-w-3xl px-6">
            <h2 className="font-display text-3xl text-forest-dark">What this tool makes</h2>
            <p className="mt-4 text-gray-700">
              Enter your words once and this generator produces three different sheets from the same
              list. Trace gives pale copies to write over, which puts the letter sequence into the
              hand as well as the eye. Trace, then write adds an empty ruled row after the traced
              ones so your child attempts each word unaided. Blank test prints numbered empty rows
              with no words at all, for the read-aloud test at the end of the week.
            </p>
            <p className="mt-4 text-gray-700">
              Everything comes out as a real PDF on US Letter with standard school ruling, so you can
              build the week&apos;s sheets on a phone and print them later. Nothing is stored and
              nothing is required from you, no account and no email.
            </p>

            <h2 className="font-display mt-10 text-3xl text-forest-dark">
              A weekly rhythm that actually works
            </h2>
            <p className="mt-4 text-gray-700">
              The oldest routine in the book is still the good one. Introduce the list on Monday with
              the trace format so the words go in through the hand. Midweek, print trace-then-write
              and see which words survive without support; those are the ones to focus on. On Friday,
              print the blank test, read the words aloud, and let your child write them.
            </p>
            <p className="mt-4 text-gray-700">
              Two refinements make a real difference. First, build the list around a pattern rather
              than picking ten unrelated words. A list of -ight words, or words that double the
              consonant before adding -ing, teaches a rule that transfers to words your child has
              never seen. A random list only ever teaches those ten words. Second, keep a running
              list of words your child misspells in their own writing and fold a few of those in.
              Those are the words that genuinely matter to them.
            </p>

            <h2 className="font-display mt-10 text-3xl text-forest-dark">
              A former teacher&apos;s notes on spelling
            </h2>
            <p className="mt-4 text-gray-700">
              The Friday-test-then-forget cycle is the most common frustration parents bring me, and
              it is not a discipline problem. It happens when words are memorized as arbitrary letter
              strings rather than learned as patterns. Memorized strings decay in about a fortnight.
              Patterns stick, because the brain has somewhere to file them.
            </p>
            <p className="mt-4 text-gray-700">
              It also helps to remember that spelling and reading develop on different schedules. A
              child can read a word fluently a year or more before they can spell it reliably, and
              this gap is completely normal rather than a sign that something is wrong. Pushing hard
              on spelling before a child reads comfortably tends to produce anxiety rather than
              accuracy.
            </p>
            <p className="mt-4 text-gray-700">
              And go easy on the test itself. Read each word, use it in a sentence, then read it
              again; it gives a child time to picture the word and removes the guesswork on
              homophones. If the test goes badly, that is information rather than a verdict. The
              words they missed are simply next week&apos;s list.
            </p>

            {/* Cross-links */}
            <div className="mt-10 rounded-2xl bg-warm-gray p-6">
              <h3 className="font-display text-2xl text-forest-dark">Keep going</h3>
              <ul className="mt-3 space-y-2 text-gray-700">
                <li>
                  Younger reader?{' '}
                  <Link
                    href="/tools/sight-words"
                    className="font-semibold text-forest underline-offset-2 hover:underline"
                  >
                    Sight words worksheets
                  </Link>{' '}
                  cover the full Dolch and Fry lists.
                </li>
                <li>
                  Need neater letters first?{' '}
                  <Link
                    href="/tools/handwriting"
                    className="font-semibold text-forest underline-offset-2 hover:underline"
                  >
                    The handwriting generator
                  </Link>{' '}
                  takes any text you type.
                </li>
                <li>
                  <Link
                    href="/quiz"
                    className="font-semibold text-forest underline-offset-2 hover:underline"
                  >
                    Take the 2-minute quiz
                  </Link>{' '}
                  to find the one real-world skill your kid should build next.
                </li>
                {/* PRODUCT_LINK_PLACEHOLDER: map 2-3 relevant guides here (Amelie) */}
              </ul>
            </div>
          </div>
        </section>

        <ToolFaqSection tool={SPELLING} heading="Spelling questions, answered" />
        <ToolEmbedSection tool={SPELLING} />
      </main>
    </>
  );
}
