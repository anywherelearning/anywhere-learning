import type { Metadata } from 'next';
import Link from 'next/link';
import NameTracingTool from '@/components/tools/NameTracingTool';
import EmbedSnippet from '@/components/tools/EmbedSnippet';
import { NAME_TRACING, faqPageLd, softwareApplicationLd } from '@/lib/tools/tool-seo';

export const metadata: Metadata = {
  title: NAME_TRACING.title,
  description: NAME_TRACING.description,
  alternates: { canonical: 'https://anywherelearning.co/tools/name-tracing' },
  openGraph: {
    title: NAME_TRACING.title,
    description: NAME_TRACING.description,
    url: 'https://anywherelearning.co/tools/name-tracing',
    type: 'website',
  },
};

export default function NameTracingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationLd(NAME_TRACING)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageLd(NAME_TRACING.faqs)) }}
      />

      <main className="bg-cream">
        {/* ── Tool ── */}
        <section className="pb-10 pt-12 md:pt-16">
          <div className="mx-auto max-w-[1180px] px-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
              Free tool
            </p>
            <h1 className="font-display mt-2 text-4xl text-forest-dark md:text-5xl">
              {NAME_TRACING.h1}
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-gray-600">
              Type any name, pick a letter size, and download a clean printable tracing
              worksheet in seconds. No signup, no watermark.
            </p>
            <div className="mt-8">
              <NameTracingTool />
            </div>
          </div>
        </section>

        {/* ── Explanatory content ── */}
        <section className="border-t border-forest/10 bg-white py-14">
          <div className="prose-custom mx-auto max-w-3xl px-6">
            <h2 className="font-display text-3xl text-forest-dark">
              What this tool makes
            </h2>
            <p className="mt-4 text-gray-700">
              This generator creates US Letter tracing worksheets with standard school ruling:
              a solid baseline, a solid top line, and a dashed midline. Each row starts with a
              solid example of the name, followed by pale gray copies your child traces over.
              You choose the letter size, the letter style, how many practice rows you want,
              and whether to show the dashed midline. The download is a real PDF, so it prints
              crisply from any device, phone included.
            </p>

            <h2 className="font-display mt-10 text-3xl text-forest-dark">
              How to use it
            </h2>
            <p className="mt-4 text-gray-700">
              Type your child&apos;s name with a capital first letter and lowercase for the
              rest, the way it will be written on every label and list they ever see. Pick
              large letters for a brand-new writer, medium once they have some control, small
              for a confident kindergartner who is refining proportions. Print, hand over a
              chunky crayon or pencil, and sit nearby. That last part matters more than the
              worksheet: a few minutes of warm attention turns practice into something your
              child wants to come back to.
            </p>
            <p className="mt-4 text-gray-700">
              One printout can go a long way. Slide the page into a plastic sleeve and use a
              dry-erase marker, and the same sheet lasts for weeks. Many families print a
              fresh page every month or so and keep the old ones. Watching their own name go
              from wobbly to steady is one of the most convincing pieces of progress a young
              child can see.
            </p>

            <h2 className="font-display mt-10 text-3xl text-forest-dark">
              A former teacher&apos;s notes on name tracing
            </h2>
            <p className="mt-4 text-gray-700">
              A child&apos;s name is the best first word to write. It is deeply motivating,
              they see it constantly, and it gives them a small, fixed set of letters to
              master instead of the whole alphabet at once. In my classroom, children who
              could write their name walked in with visible confidence, and that confidence
              spilled into everything else we did with letters.
            </p>
            <p className="mt-4 text-gray-700">
              A few things I wish every parent knew. Reversed letters are normal and usually
              resolve on their own by age 6 or 7, so there is no need to drill corrections.
              Grip develops in stages, and forcing a perfect pencil hold too early tends to
              backfire; fat crayons and short sessions do more for fine motor control than
              any amount of insisting. And tracing is a bridge, not a destination. Once your
              child traces confidently, let them try a row freehand under the last traced
              row. The guides are still there to help, and the leap feels wonderful.
            </p>
            <p className="mt-4 text-gray-700">
              Most of all, keep it light. Five happy minutes beat twenty reluctant ones every
              single time. If today is not the day, the worksheet will still be here
              tomorrow.
            </p>

            {/* Cross-links */}
            <div className="mt-10 rounded-2xl bg-warm-gray p-6">
              <h3 className="font-display text-2xl text-forest-dark">Keep going</h3>
              <ul className="mt-3 space-y-2 text-gray-700">
                <li>
                  <Link href="/tools" className="font-semibold text-forest underline-offset-2 hover:underline">
                    See all our free tools
                  </Link>{' '}
                  for handwriting, sight words, and spelling practice.
                </li>
                <li>
                  <Link href="/quiz" className="font-semibold text-forest underline-offset-2 hover:underline">
                    Take the 2-minute quiz
                  </Link>{' '}
                  to find the one real-world skill your kid should build next.
                </li>
                {/* PRODUCT_LINK_PLACEHOLDER: map 2-3 relevant guides here (Amelie) */}
              </ul>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-14">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="font-display text-3xl text-forest-dark">
              Name tracing questions, answered
            </h2>
            <dl className="mt-6 space-y-6">
              {NAME_TRACING.faqs.map((faq) => (
                <div key={faq.question} className="rounded-2xl border border-forest/10 bg-white p-6">
                  <dt className="font-semibold text-forest-dark">{faq.question}</dt>
                  <dd className="mt-2 text-gray-700">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Embed ── */}
        <section className="border-t border-forest/10 bg-white py-14">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="font-display text-3xl text-forest-dark">
              Embed this tool on your site
            </h2>
            <p className="mt-3 text-gray-600">
              Run a homeschool blog or a parenting site? You&apos;re welcome to embed this
              generator for your readers, free. Paste this snippet anywhere HTML is allowed.
              A link back to us is appreciated.
            </p>
            <div className="mt-5">
              <EmbedSnippet toolSlug="name-tracing" toolName="Name Tracing Worksheet Generator" />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
