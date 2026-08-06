import type { Metadata } from 'next';
import Link from 'next/link';
import SightWordsTool from '@/components/tools/SightWordsTool';
import { EmbedJumpLink, ToolFaqSection, ToolEmbedSection } from '@/components/tools/ToolSections';
import { SIGHT_WORDS, faqPageLd, softwareApplicationLd } from '@/lib/tools/tool-seo';

export const metadata: Metadata = {
  title: SIGHT_WORDS.title,
  description: SIGHT_WORDS.description,
  alternates: { canonical: 'https://anywherelearning.co/tools/sight-words' },
  openGraph: {
    title: SIGHT_WORDS.title,
    description: SIGHT_WORDS.description,
    url: 'https://anywherelearning.co/tools/sight-words',
    type: 'website',
  },
};

export default function SightWordsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationLd(SIGHT_WORDS)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageLd(SIGHT_WORDS.faqs)) }}
      />

      <main className="bg-cream">
        {/* ── Tool ── */}
        <section className="pb-10 pt-12 md:pt-16">
          <div className="mx-auto max-w-[1180px] px-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">Free tool</p>
            <h1 className="font-display mt-2 text-4xl text-forest-dark md:text-5xl">
              {SIGHT_WORDS.h1}
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-gray-600">
              Pick a Dolch or Fry list by grade, or type your own words, and print practice pages in
              seconds. Every list is built in. No signup, no watermark.
            </p>
            <div className="mt-8">
              <SightWordsTool />
            </div>
            <EmbedJumpLink />
          </div>
        </section>

        {/* ── Explanatory content ── */}
        <section className="border-t border-forest/10 bg-white py-14">
          <div className="prose-custom mx-auto max-w-3xl px-6">
            <h2 className="font-display text-3xl text-forest-dark">What this tool makes</h2>
            <p className="mt-4 text-gray-700">
              Choose a word list and this generator lays it out as printable practice rows with
              standard school ruling. All nine standard lists are included: the six Dolch lists from
              pre-primer through third grade plus the 95 Dolch nouns, and the Fry first, second, and
              third hundred. Pick one and the words load into an editable box, so you can delete
              everything your child already knows and keep only what is actually being worked on.
              You can also ignore the lists entirely and type your own words.
            </p>
            <p className="mt-4 text-gray-700">
              Two formats are available. Trace gives pale copies to write over. Trace, then write
              adds an empty ruled row at the end of each word so your child attempts it unaided,
              which is the row that tells you whether the word has genuinely stuck.
            </p>

            <h2 className="font-display mt-10 text-3xl text-forest-dark">
              Dolch or Fry: which list should we use?
            </h2>
            <p className="mt-4 text-gray-700">
              Both are standard, both are free to use, and the overlap between them is large. The
              Dolch list was compiled in the 1930s from children&apos;s books and is organized by
              grade band, which makes it the easier one to work through with a young child: finish
              pre-primer, move to primer, and so on. The Fry list is newer and ranked strictly by how
              often each word appears in printed English, in blocks of one hundred. If you want to
              teach the highest-value words first regardless of grade label, Fry is the more logical
              order.
            </p>
            <p className="mt-4 text-gray-700">
              In practice most families start with Dolch and never need anything else. The Fry lists
              are useful if you have an older child with gaps, because working in frequency order
              closes the most consequential gaps first.
            </p>

            <h2 className="font-display mt-10 text-3xl text-forest-dark">
              A former teacher&apos;s notes on sight words
            </h2>
            <p className="mt-4 text-gray-700">
              The most common mistake I saw was treating sight words as a memorization race. A child
              who can chant a list is not the same as a child who recognizes those words instantly
              inside a sentence, and only the second one helps with reading. Work on five to ten
              words at a time and stay with them until recognition is genuinely automatic, meaning
              no pause, no sounding out, no glance at you for confirmation.
            </p>
            <p className="mt-4 text-gray-700">
              It is also worth saying that sight words are a supplement to phonics, not a
              replacement for it. Most of these words are perfectly decodable; they are on the list
              because they are frequent, not because they are irregular. A child who has been taught
              to guess from word shape rather than sound things out will hit a wall around age eight
              when the words get longer. Teach the letter sounds, and use these lists for the words
              that genuinely break the rules and for building fluency.
            </p>
            <p className="mt-4 text-gray-700">
              Finally, get the words off the page and into the world. Spot them on menus, road signs,
              cereal boxes, and the pages of a favorite book. A word your child finds in the wild is
              worth several repetitions at a table, and it costs nothing.
            </p>

            {/* Cross-links */}
            <div className="mt-10 rounded-2xl bg-warm-gray p-6">
              <h3 className="font-display text-2xl text-forest-dark">Keep going</h3>
              <ul className="mt-3 space-y-2 text-gray-700">
                <li>
                  Practicing spelling as well?{' '}
                  <Link
                    href="/tools/spelling"
                    className="font-semibold text-forest underline-offset-2 hover:underline"
                  >
                    The spelling worksheet maker
                  </Link>{' '}
                  handles weekly lists and blank tests.
                </li>
                <li>
                  Want to practice full sentences?{' '}
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

        <ToolFaqSection tool={SIGHT_WORDS} heading="Sight word questions, answered" />
        <ToolEmbedSection tool={SIGHT_WORDS} />
      </main>
    </>
  );
}
