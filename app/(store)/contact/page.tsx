import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import ScrollReveal from '@/components/shared/ScrollReveal';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    "Get in touch with Anywhere Learning. Questions about activity guides, the membership, or homeschooling? Amelie reads every email and replies within 48 hours.",
  alternates: { canonical: 'https://anywherelearning.co/contact' },
};

const contactLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Anywhere Learning',
  url: 'https://anywherelearning.co/contact',
  mainEntity: {
    '@type': 'Organization',
    name: 'Anywhere Learning',
    email: 'info@anywherelearning.co',
    url: 'https://anywherelearning.co',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'info@anywherelearning.co',
      availableLanguage: ['English'],
    },
  },
};

const quickCards = [
  {
    title: 'Common questions',
    body: "Refunds, ages, how the membership works, what's included. Most things are answered here.",
    href: '/faq',
    cta: 'Visit the FAQ',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 9a3 3 0 1 1 4.5 2.6c-.9.5-1.5 1.2-1.5 2.4" />
        <line x1="12" y1="17" x2="12" y2="17.01" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    title: "Not sure if it's for you?",
    body: 'Try the free starter guide. Seven real-world activities across seven categories. No commitment.',
    href: '/free-guide',
    cta: 'Get the free guide',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="8" width="18" height="13" rx="1.5" />
        <path d="M3 12h18" />
        <path d="M12 8v13" />
        <path d="M7.5 8C7.5 6 9 4.5 11 5.5c1 .5 1 2.5 1 2.5" />
        <path d="M16.5 8C16.5 6 15 4.5 13 5.5c-1 .5-1 2.5-1 2.5" />
      </svg>
    ),
  },
  {
    title: 'Curious about the membership?',
    body: 'See exactly what is included, what founding members get, and how cancellation works.',
    href: '/join',
    cta: 'Explore the membership',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z" />
        <path d="M4 17a3 3 0 0 1 3-3h12" />
        <line x1="8" y1="8" x2="14" y2="8" />
      </svg>
    ),
  },
];

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactLd) }}
      />
      <main className="bg-cream">
        {/* 01 PAGE HEADER */}
        <header className="bg-cream pt-16 md:pt-24 pb-10 md:pb-14 text-center">
          <div className="mx-auto max-w-[760px] px-6">
            <ScrollReveal>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                <span className="w-[22px] h-px bg-forest inline-block" />
                Get in touch
              </p>
              <h1 className="font-display text-[clamp(3rem,7vw,5.5rem)] leading-[1.02] tracking-tight mt-4 text-balance">
                Say <span className="italic text-forest">hello.</span>
              </h1>
              <p className="mt-5 text-[17px] md:text-[18.5px] leading-[1.55] text-gray-600 max-w-[620px] mx-auto">
                Questions, ideas, a story about your kid making dinner. I&apos;d love to hear
                from you.{' '}
                <span className="font-display italic text-forest-dark">Real human emails only.</span>{' '}
                No bots, no auto-responders.
              </p>
            </ScrollReveal>
          </div>
        </header>

        {/* 02 MAIN TWO-COLUMN: form + info */}
        <section className="bg-cream pb-16 md:pb-20">
          <div className="mx-auto max-w-[1180px] px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12 items-start">
              {/* LEFT: form */}
              <ScrollReveal>
                <ContactForm />
              </ScrollReveal>

              {/* RIGHT: info card */}
              <ScrollReveal delay={80}>
                <aside className="bg-[#F2EFE4] border border-[#D8D4C5] rounded-[18px] p-7 md:p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-[56px] h-[56px] rounded-full overflow-hidden border border-[#D8D4C5] shrink-0">
                      <Image
                        src="/amelie.jpg"
                        alt="Amelie"
                        fill
                        sizes="56px"
                        quality={80}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col leading-[1.3]">
                      <span className="font-display text-[20px] text-ink">Amelie</span>
                      <span className="text-[13px] text-gray-500">
                        Founder &middot; Teacher &middot; Mom of two
                      </span>
                    </div>
                  </div>

                  <p className="text-[15px] leading-[1.65] text-gray-600 m-0">
                    I read every email myself. If you&apos;ve got a question about the
                    membership, an activity, or homeschooling, or you just want to say hi,
                    I&apos;d love to hear from you.{' '}
                    <span className="font-display italic text-ink">
                      Real replies come from this exact inbox,
                    </span>{' '}
                    usually within 48 hours.
                  </p>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 mb-1.5">
                      Email
                    </p>
                    <a
                      href="mailto:info@anywherelearning.co"
                      className="font-display italic text-[20px] text-forest-dark hover:text-forest underline decoration-forest/25 underline-offset-[4px] hover:decoration-forest transition-colors"
                    >
                      info@anywherelearning.co
                    </a>
                    <p className="mt-1.5 text-[13px] text-gray-500 leading-[1.5] m-0">
                      <span className="font-display italic text-forest-dark">
                        For account or download help,
                      </span>{' '}
                      please include the email you used to purchase.
                    </p>
                  </div>

                  <div className="bg-[#E6EBDF] border border-[#C9D3BE] rounded-[12px] p-4 flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="w-8 h-8 shrink-0 rounded-full bg-cream border border-[#C9D3BE] grid place-items-center text-forest-dark"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <polyline points="12 7 12 12 15.5 14.5" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-[14px] font-semibold text-ink m-0 leading-[1.4]">
                        Typical response time: within 48 hours, Mon to Fri.
                      </p>
                      <p className="mt-1 text-[13px] text-gray-600 leading-[1.5] m-0">
                        Weekend emails get answered{' '}
                        <span className="font-display italic text-forest-dark">
                          Monday morning. Always.
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 mb-2.5">
                      Elsewhere
                    </p>
                    <ul className="space-y-2 list-none p-0 m-0">
                      <li>
                        <a
                          href="https://instagram.com/anywherelearning"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2.5 text-[14.5px] font-medium text-gray-600 hover:text-forest-dark transition-colors py-1"
                        >
                          <span className="w-[26px] h-[26px] rounded-full bg-cream border border-[#D8D4C5] grid place-items-center text-gray-600">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="5" />
                              <circle cx="12" cy="12" r="4" />
                              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                            </svg>
                          </span>
                          @anywherelearning on Instagram
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://ca.pinterest.com/anywherelearning/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2.5 text-[14.5px] font-medium text-gray-600 hover:text-forest-dark transition-colors py-1"
                        >
                          <span className="w-[26px] h-[26px] rounded-full bg-cream border border-[#D8D4C5] grid place-items-center text-gray-600">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="9" />
                              <path d="M9 22l2-7" />
                              <path d="M8 11.5a4 4 0 1 1 7.5 2c-.5 1.5-2 2-3 2" />
                            </svg>
                          </span>
                          @anywherelearning on Pinterest
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.facebook.com/profile.php?id=61587630845193"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2.5 text-[14.5px] font-medium text-gray-600 hover:text-forest-dark transition-colors py-1"
                        >
                          <span className="w-[26px] h-[26px] rounded-full bg-cream border border-[#D8D4C5] grid place-items-center text-gray-600">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.14 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.77l-.44 2.91h-2.33V22c4.78-.8 8.44-4.94 8.44-9.94z" />
                            </svg>
                          </span>
                          Anywhere Learning on Facebook
                        </a>
                      </li>
                    </ul>
                  </div>
                </aside>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* 03 BEFORE YOU EMAIL */}
        <section className="bg-cream pb-20 md:pb-24">
          <div className="mx-auto max-w-[1180px] px-6">
            <ScrollReveal>
              <div className="max-w-[1020px] mx-auto bg-[#F2EFE4] border border-[#D8D4C5] rounded-[18px] p-10 md:p-14">
                <div className="max-w-[600px] mx-auto text-center mb-10">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                    <span className="w-[22px] h-px bg-forest inline-block" />
                    Before you email
                  </p>
                  <h2 className="font-display text-[clamp(1.75rem,3.6vw,2.625rem)] leading-[1.08] tracking-tight mt-3.5 text-balance">
                    Your question might already be{' '}
                    <span className="italic text-forest">answered.</span>
                  </h2>
                  <p className="mt-4 font-display italic text-[17px] text-gray-600 leading-[1.45]">
                    Most questions we get fall into a few buckets. If yours is here, you&apos;ll
                    get an answer faster by checking these first.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px] max-w-[920px] mx-auto">
                  {quickCards.map((q, i) => (
                    <ScrollReveal key={q.title} delay={i * 70} className="h-full">
                      <div className="h-full bg-cream border border-[#D8D4C5] rounded-[12px] p-7 text-center flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_30px_-22px_rgba(45,58,46,0.22)] hover:border-[#C9C5B7]">
                        <div className="w-[46px] h-[46px] rounded-[12px] bg-[#F2DECF] border border-[rgba(201,123,92,0.3)] text-[#C97B5C] grid place-items-center mx-auto mb-4">
                          {q.icon}
                        </div>
                        <h3 className="font-display text-[22px] leading-[1.18] tracking-tight text-ink mb-2.5">
                          {q.title}
                        </h3>
                        <p className="text-[15px] leading-[1.55] text-gray-600 m-0 mb-5">
                          {q.body}
                        </p>
                        <Link
                          href={q.href}
                          className="mt-auto self-center inline-flex items-center gap-2 text-forest-dark font-semibold text-[14.5px] border-b border-forest/25 pb-0.5 hover:border-forest-dark hover:text-forest transition-colors"
                        >
                          {q.cta}
                          <span className="font-display italic text-lg leading-none">&rarr;</span>
                        </Link>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </>
  );
}
