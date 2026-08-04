import ScrollReveal from '@/components/shared/ScrollReveal';

// Product-outcome testimonials (families using the activities). Star-rated on
// purpose: this IS a product review, which visually separates it from the
// star-free founder-credibility block (Testimonials) that follows on the home
// page. Quotes mirror the /join page so proof stays consistent across the funnel.
const CARDS = [
  {
    text: "Honestly thought they'd hate it. We picked a recipe together, she had the list and bossed me around the aisles, then all three of us were in the kitchen fighting over the measuring cups. It was messy but we laughed a lot.",
    initials: 'ML',
    name: 'Marie-Eve · Alberta · Girl 8, boy 12',
    tilt: '-rotate-[.55deg]',
  },
  {
    text: "My boys and I planned a whole day out together with a real budget. They argued about the arcade versus mini golf for a solid twenty minutes. I just kept asking questions, they kept solving them. We ended up squeezing in both.",
    initials: 'DL',
    name: 'Diana · Texas · Boy 10, boy 13',
    tilt: 'rotate-[.5deg]',
  },
];

export default function FamilyProof({ immediate = false }: { immediate?: boolean }) {
  return (
    <section id="families" className="py-14 md:py-16 scroll-mt-24">
      <div className="mx-auto max-w-[1180px] px-6">
        <ScrollReveal immediate={immediate}>
          <div className="max-w-[760px] mx-auto text-center mb-12">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark flex items-center justify-center gap-2.5 mb-4">
              <span className="w-[22px] h-px bg-forest inline-block" />
              Parents talking
            </p>
            <h2 className="font-display text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.06] tracking-tight mt-3.5">
              Families <span className="italic text-forest">already doing this.</span>
            </h2>
            <p className="mt-4 text-lg text-gray-500 text-balance">
              Real outcomes, not &ldquo;love this app&rdquo; reviews. We asked parents to
              tell us about their kid, not the product.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={80} immediate={immediate}>
          <div className="grid gap-5 md:grid-cols-2 max-w-[900px] mx-auto">
            {CARDS.map((card, i) => (
              <article
                key={i}
                className={`flex flex-col rounded-[14px] border border-forest/15 bg-[#E6EBDF] px-6 py-7 shadow-[0_12px_24px_-22px_rgba(45,58,46,.2)] ${card.tilt}`}
              >
                <div
                  className="mb-2.5 font-display text-lg italic tracking-wider text-[#c4836a]"
                  aria-label="5 out of 5 stars"
                >
                  ★★★★★
                </div>
                <blockquote className="font-display text-xl italic leading-[1.35] text-gray-900">
                  &ldquo;{card.text}&rdquo;
                </blockquote>
                <footer className="mt-4 flex items-center gap-2.5 border-t border-dashed border-[#d4c4a8] pt-3.5 text-[13.5px] text-gray-400">
                  <span
                    aria-hidden="true"
                    className="grid h-[30px] w-[30px] place-items-center rounded-full border border-gray-200 bg-gradient-to-br from-[#e8dcc8] to-[#d4c4a8] text-xs font-semibold text-gray-500"
                  >
                    {card.initials}
                  </span>
                  <cite className="not-italic">{card.name}</cite>
                </footer>
              </article>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
