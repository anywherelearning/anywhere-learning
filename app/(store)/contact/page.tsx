import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Anywhere Learning. Questions about activity guides, orders, or homeschooling? We\u2019d love to hear from you.',
  alternates: { canonical: 'https://anywherelearning.co/contact' },
};

export default function ContactPage() {
  return (
    <div className="bg-cream">
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-gold uppercase tracking-widest mb-3">
              Get in Touch
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-forest leading-tight mb-4">
              We&apos;d Love to Hear From You
            </h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Whether you have a question about our activity guides, need help with an order,
              or just want to say hi, we&apos;re here for you.
            </p>
          </div>

          {/* Email Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-forest/5 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-forest" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Email Us</h2>
                <a
                  href="mailto:info@anywherelearning.co"
                  className="text-forest font-medium text-lg hover:text-forest-dark transition-colors"
                >
                  info@anywherelearning.co
                </a>
                <p className="text-sm text-gray-400 mt-2">
                  We usually respond within 24 hours.
                </p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            <a
              href="https://instagram.com/anywherelearning"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:border-forest/20 hover:shadow-md transition-all flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Instagram</p>
                <p className="text-xs text-gray-400">@anywherelearning</p>
              </div>
            </a>

            <a
              href="https://ca.pinterest.com/anywherelearning/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:border-forest/20 hover:shadow-md transition-all flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Pinterest</p>
                <p className="text-xs text-gray-400">@anywherelearning</p>
              </div>
            </a>
          </div>

          {/* FAQ Callout */}
          <div className="bg-gold-light/10 rounded-2xl p-8 border border-gold/10 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Looking for Quick Answers?
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Check out our FAQ page for common questions about activity guides,
              ages, refunds, and homeschooling approaches.
            </p>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 bg-forest hover:bg-forest-dark active:scale-[0.98] text-cream font-semibold py-3 px-6 rounded-xl transition-all text-sm"
            >
              View FAQ
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
