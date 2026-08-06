import type { Metadata } from 'next';
import Link from 'next/link';
import HandwritingTool from '@/components/tools/HandwritingTool';
import { EmbedJumpLink, ToolFaqSection, ToolEmbedSection } from '@/components/tools/ToolSections';
import { HANDWRITING, faqPageLd, softwareApplicationLd } from '@/lib/tools/tool-seo';

export const metadata: Metadata = {
  title: HANDWRITING.title,
  description: HANDWRITING.description,
  alternates: { canonical: 'https://anywherelearning.co/tools/handwriting' },
  openGraph: {
    title: HANDWRITING.title,
    description: HANDWRITING.description,
    url: 'https://anywherelearning.co/tools/handwriting',
    type: 'website',
  },
};

export default function HandwritingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationLd(HANDWRITING)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageLd(HANDWRITING.faqs)) }}
      />

      <main className="bg-cream">
        {/* ── Tool ── */}
        <section className="pb-10 pt-12 md:pt-16">
          <div className="mx-auto max-w-[1180px] px-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">Free tool</p>
            <h1 className="font-display mt-2 text-4xl text-forest-dark md:text-5xl">
              {HANDWRITING.h1}
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-gray-600">
              Type any words or sentences and get a clean printable practice sheet in seconds.
              Print, pre-cursive, or joined cursive. No signup, no watermark.
            </p>
            <div className="mt-8">
              <HandwritingTool />
            </div>
            <EmbedJumpLink />
          </div>
        </section>

        {/* ── Explanatory content ── */}
        <section className="border-t border-forest/10 bg-white py-14">
          <div className="prose-custom mx-auto max-w-3xl px-6">
            <h2 className="font-display text-3xl text-forest-dark">What this tool makes</h2>
            <p className="mt-4 text-gray-700">
              This generator turns whatever you type into US Letter practice sheets with standard
              school ruling: a solid baseline, a solid top line, and a dashed midline showing where
              short letters stop. Each line you type becomes its own group of practice rows, so a
              single page can hold one tricky word, a full sentence, or five unrelated things your
              child needs to work on this week. You pick the letter style, the size, how many rows
              each line gets, and whether the sheet ends with an empty row for writing unaided.
            </p>
            <p className="mt-4 text-gray-700">
              The download is a real PDF rather than a print dialog, which matters more than it
              sounds. It means you can make a sheet on your phone while standing in the kitchen,
              save it, and print it later from anywhere. It also means the spacing you see in the
              preview is exactly what comes out of the printer.
            </p>

            <h2 className="font-display mt-10 text-3xl text-forest-dark">
              Choosing what goes on the page
            </h2>
            <p className="mt-4 text-gray-700">
              The single biggest lever on whether handwriting practice works is what you ask a child
              to write. Nonsense repetition teaches letter shapes and nothing else, and children can
              feel that. Real words teach shapes plus spelling plus meaning, and they feel like they
              are for something.
            </p>
            <p className="mt-4 text-gray-700">
              A few things that reliably land: a sentence from the book you are reading aloud right
              now, a note to a grandparent who will actually receive it, the names of everyone in
              the family including the pets, a joke they think is funny, a list for the shop, or a
              caption for a drawing they are proud of. If your child is at the stage of flipping b
              and d, put both in a line together so the difference is right there in their own
              handwriting rather than in your correction.
            </p>

            <h2 className="font-display mt-10 text-3xl text-forest-dark">
              A former teacher&apos;s notes on handwriting
            </h2>
            <p className="mt-4 text-gray-700">
              Handwriting is a physical skill before it is an academic one. The muscles that control
              a pencil are small and slow to develop, and no amount of instruction hurries them
              along. Children who play with playdough, thread beads, use scissors, and build with
              small blocks tend to arrive at neat handwriting sooner than children who did worksheets
              instead. If practice is going badly, the answer is often less writing and more of the
              other things, not more drilling.
            </p>
            <p className="mt-4 text-gray-700">
              Two other things I wish more parents heard early. Letter reversals are developmentally
              normal well into age 6 or 7 and usually resolve without intervention, so gentle
              noticing beats correction. And pencil grip is worth watching but not worth a battle:
              the mature tripod grip develops in stages, and a child forced into it too early often
              compensates with tension in the wrist and shoulder that shows up as messy writing
              years later.
            </p>
            <p className="mt-4 text-gray-700">
              Keep sessions short, sit nearby, and stop while it still looks good. Five focused
              minutes with a parent in the room does more than twenty minutes alone at a table, and
              it protects the thing that matters most at this age, which is a child who does not
              dread picking up a pencil.
            </p>

            {/* Cross-links */}
            <div className="mt-10 rounded-2xl bg-warm-gray p-6">
              <h3 className="font-display text-2xl text-forest-dark">Keep going</h3>
              <ul className="mt-3 space-y-2 text-gray-700">
                <li>
                  Just starting out?{' '}
                  <Link
                    href="/tools/name-tracing"
                    className="font-semibold text-forest underline-offset-2 hover:underline"
                  >
                    The name tracing generator
                  </Link>{' '}
                  is the gentler first step.
                </li>
                <li>
                  Working on reading too?{' '}
                  <Link
                    href="/tools/sight-words"
                    className="font-semibold text-forest underline-offset-2 hover:underline"
                  >
                    Sight words worksheets
                  </Link>{' '}
                  cover the Dolch and Fry lists.
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

        <ToolFaqSection tool={HANDWRITING} heading="Handwriting questions, answered" />
        <ToolEmbedSection tool={HANDWRITING} />
      </main>
    </>
  );
}
