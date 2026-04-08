import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Anywhere Learning collects, uses, and protects your personal information.',
  alternates: { canonical: 'https://anywherelearning.co/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="bg-cream">
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          {/* Header */}
          <p className="text-sm font-semibold text-gold uppercase tracking-widest mb-3">
            Legal
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-forest leading-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-400 mb-12">
            Last updated: March 9, 2026
          </p>

          <div className="space-y-10 text-gray-600 text-sm leading-relaxed">
            {/* Intro */}
            <div>
              <p>
                At Anywhere Learning, your privacy matters to us. This policy explains what information we collect,
                how we use it, and the choices you have. We keep things simple and transparent, no fine print tricks.
              </p>
            </div>

            {/* What We Collect */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">What We Collect</h2>
              <p className="mb-3">When you use our site, we may collect:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li><span className="font-medium text-gray-700">Account information</span>: your name and email address when you create an account or make a purchase</li>
                <li><span className="font-medium text-gray-700">Order information</span>: what you purchased, when, and your download history</li>
                <li><span className="font-medium text-gray-700">Usage data</span>: pages you visit and how you interact with our site (collected anonymously via analytics)</li>
              </ul>
            </div>

            {/* Payment Processing */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Payment Processing</h2>
              <p>
                All payments are processed securely by <span className="font-medium text-gray-700">Stripe</span>.
                We never see, store, or have access to your credit card number or banking details. Stripe handles
                all payment data under their own security standards (PCI DSS Level 1).
              </p>
            </div>

            {/* Cookies */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Cookies &amp; Authentication</h2>
              <p>
                We use essential cookies to keep you signed in to your account (powered by Clerk).
                These are necessary for the site to function and cannot be disabled. We do not use
                advertising or tracking cookies.
              </p>
            </div>

            {/* Email */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Email Communications</h2>
              <p className="mb-3">
                If you sign up for our free guide or make a purchase, we may send you emails about:
              </p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Order confirmations and download links</li>
                <li>Helpful tips for using your activity packs</li>
                <li>New products and occasional promotions</li>
              </ul>
              <p className="mt-3">
                You can unsubscribe from marketing emails at any time by clicking the unsubscribe link
                in any email. We use ConvertKit (Kit) to manage our email list.
              </p>
            </div>

            {/* Analytics */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Analytics</h2>
              <p>
                We use Google Analytics to understand how visitors use our site, things like which
                pages are most popular and how people find us. This data is aggregated and anonymous.
                We don&apos;t use it to identify individual visitors.
              </p>
            </div>

            {/* Third-Party Services */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Third-Party Services</h2>
              <p className="mb-3">We work with these trusted services to run our site:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li><span className="font-medium text-gray-700">Stripe</span>: payment processing</li>
                <li><span className="font-medium text-gray-700">Clerk</span>: account authentication</li>
                <li><span className="font-medium text-gray-700">ConvertKit (Kit)</span>: email marketing</li>
                <li><span className="font-medium text-gray-700">Vercel</span>: website hosting</li>
                <li><span className="font-medium text-gray-700">Google Analytics</span>: anonymous site usage data</li>
              </ul>
              <p className="mt-3">
                Each service has its own privacy policy governing how they handle your data.
              </p>
            </div>

            {/* Children's Privacy */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Children&apos;s Privacy</h2>
              <p>
                Anywhere Learning is a resource for parents and guardians. Our site is not directed at
                children under 13, and we do not knowingly collect personal information from children.
                If you believe a child has provided us with personal information, please contact us and
                we will remove it promptly.
              </p>
            </div>

            {/* Data Retention */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Data Retention</h2>
              <p>
                We keep your account and order data for as long as your account is active, so you can
                always access your purchased downloads. If you&apos;d like your data deleted, just email us
                and we&apos;ll take care of it.
              </p>
            </div>

            {/* Your Rights */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Rights</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt out of marketing emails at any time</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, email us at{' '}
                <a href="mailto:info@anywherelearning.co" className="text-forest font-medium hover:text-forest-dark transition-colors">
                  info@anywherelearning.co
                </a>.
              </p>
            </div>

            {/* Security */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Data Security</h2>
              <p>
                We use SSL encryption across our entire site and rely on industry-standard security
                practices. Payments are handled by Stripe&apos;s secure infrastructure. While no system is
                100% secure, we take reasonable measures to protect your information.
              </p>
            </div>

            {/* Changes */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Changes to This Policy</h2>
              <p>
                We may update this policy from time to time. If we make significant changes, we&apos;ll
                update the &ldquo;Last updated&rdquo; date at the top of this page. We encourage you to
                review this page periodically.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-gold-light/10 rounded-2xl p-6 border border-gold/10">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Questions?</h2>
              <p>
                If you have any questions about this privacy policy, reach out to us at{' '}
                <a href="mailto:info@anywherelearning.co" className="text-forest font-medium hover:text-forest-dark transition-colors">
                  info@anywherelearning.co
                </a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
