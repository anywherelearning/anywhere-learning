import Link from 'next/link';
import ScrollReveal from '@/components/shared/ScrollReveal';

/**
 * End-of-article call to action: the "what's your kid's missing life skill?"
 * quiz. Replaces the old newsletter signup on blog posts, guides, and their
 * index pages. A warm reader who just finished an article is far more likely
 * to take a 2-minute quiz than sign up for a newsletter, and the quiz captures
 * their email at the result gate anyway (into the segmented quiz funnel).
 */
export default function BlogQuizCTA() {
  return (
    <section className="pt-2 pb-12">
      <div className="mx-auto max-w-[1180px] px-6">
        <ScrollReveal>
          <div className="max-w-[720px] mx-auto bg-[#E6EBDF] border border-[#C9D3BE] rounded-[18px] p-10 md:p-12 text-center shadow-[0_24px_44px_-34px_rgba(58,90,64,0.4)]">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
              <span className="w-[22px] h-px bg-forest inline-block" />
              2-minute quiz
            </p>
            <h2 className="font-display text-[clamp(1.75rem,3.4vw,2.4rem)] leading-[1.14] tracking-tight mt-3.5 text-balance">
              What&apos;s your kid&apos;s{' '}
              <span className="italic text-forest-dark">missing life skill?</span>
            </h2>
            <p className="mt-4 text-gray-600 text-[16px] leading-[1.6] max-w-[480px] mx-auto">
              Eight quick questions. At the end you get your kid&apos;s type, the one
              skill to focus on next, and three real activities to start with.
            </p>
            <div className="mt-6">
              <Link
                href="/quiz"
                className="inline-flex items-center gap-2 rounded-xl bg-forest px-7 py-3.5 text-[15px] font-semibold text-cream transition-all hover:bg-forest-dark active:scale-[0.98] no-underline"
              >
                Take the quiz
                <span className="font-display italic text-[17px] leading-none">&rarr;</span>
              </Link>
            </div>
            <p className="mt-3.5 text-[13px] text-gray-500">
              Free. No account needed. Takes about two minutes.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
