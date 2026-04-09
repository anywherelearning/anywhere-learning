import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service and refund policy for Anywhere Learning digital activity guides.',
  alternates: { canonical: 'https://anywherelearning.co/terms' },
};

export default function TermsPage() {
  return (
    <div className="bg-cream">
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          {/* Header */}
          <p className="text-sm font-semibold text-gold uppercase tracking-widest mb-3">
            Legal
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-forest leading-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-400 mb-12">
            Last updated: March 9, 2026
          </p>

          <div className="space-y-10 text-gray-600 text-sm leading-relaxed">
            {/* Intro */}
            <div>
              <p>
                Welcome to Anywhere Learning. By using our website and purchasing our products, you agree
                to these terms. Please read them carefully; they&apos;re straightforward, we promise.
              </p>
            </div>

            {/* Products */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Our Products</h2>
              <p>
                Anywhere Learning sells digital activity guides in PDF format. These are downloadable
                products, not physical goods. After purchase, you receive instant access to download
                your files. Our guides are designed for parents and guardians to use with their children
                (ages 4&ndash;14) for real-world, hands-on learning.
              </p>
            </div>

            {/* License */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">License &amp; Usage</h2>
              <p className="mb-3">When you purchase a product, you receive a personal license to:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Download and use the product with your own family</li>
                <li>Open and view on any of your personal devices</li>
                <li>Print copies for your own household use</li>
                <li>Reuse the activities year after year with your children</li>
              </ul>
              <p className="mt-4 mb-3">You may <span className="font-medium text-gray-700">not</span>:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Share, redistribute, or resell the files to others</li>
                <li>Upload the files to any public or shared platform</li>
                <li>Use the content for commercial purposes (co-ops, tutoring businesses, etc.) without a separate license</li>
                <li>Modify, rebrand, or claim the content as your own</li>
              </ul>
              <p className="mt-3">
                If you&apos;re a co-op leader or tutor interested in using our materials, reach out to us at{' '}
                <a href="mailto:info@anywherelearning.co" className="text-forest font-medium hover:text-forest-dark transition-colors">
                  info@anywherelearning.co
                </a>{' '}
                and we&apos;ll work something out.
              </p>
            </div>

            {/* Refund Policy - highlighted */}
            <div className="bg-forest/5 rounded-2xl p-6 border border-forest/10">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Refund Policy</h2>
              <p className="mb-3">
                Because our products are digital downloads delivered instantly, we offer a{' '}
                <span className="font-semibold text-forest">48-hour refund window</span> from the time of purchase.
              </p>
              <ul className="list-disc list-inside space-y-1.5 ml-2 mb-3">
                <li>To request a refund, email <a href="mailto:info@anywherelearning.co" className="text-forest font-medium hover:text-forest-dark transition-colors">info@anywherelearning.co</a> within 48 hours of your purchase</li>
                <li>Include your order email and the product name</li>
                <li>No questions asked. We want you to be happy</li>
                <li>Refunds are processed to your original payment method within 5&ndash;10 business days</li>
              </ul>
              <p>
                After 48 hours, digital purchases are final. We encourage you to check out the free
                preview samples available on product pages before purchasing.
              </p>
            </div>

            {/* Payments */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Payments</h2>
              <p>
                All prices are listed in USD. Payments are processed securely through Stripe. We do not
                store or have access to your payment card details. Upon successful payment, your download
                links are available immediately.
              </p>
            </div>

            {/* Intellectual Property */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Intellectual Property</h2>
              <p>
                All content on this site, including activity guides, text, images, icons, and design,
                is the property of Anywhere Learning and is protected by copyright. You may not reproduce,
                distribute, or create derivative works without our written permission.
              </p>
            </div>

            {/* Accounts */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Account</h2>
              <p>
                You may create an account to access your purchased downloads. You&apos;re responsible for
                keeping your login credentials secure. If you suspect unauthorized access to your account,
                please contact us immediately.
              </p>
            </div>

            {/* Liability */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Limitation of Liability</h2>
              <p>
                Our products are educational activity guides provided &ldquo;as is.&rdquo; While we work hard to
                create high-quality content, Anywhere Learning is not liable for any indirect, incidental,
                or consequential damages arising from the use of our products. Parents and guardians are
                responsible for supervising their children during all activities.
              </p>
            </div>

            {/* Governing Law */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Governing Law</h2>
              <p>
                These terms are governed by the laws of Canada. Any disputes will be resolved under
                Canadian jurisdiction.
              </p>
            </div>

            {/* Changes */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Changes to These Terms</h2>
              <p>
                We may update these terms from time to time. Changes take effect when posted on this page.
                Continued use of our site after changes constitutes acceptance of the updated terms.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-gold-light/10 rounded-2xl p-6 border border-gold/10">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Questions?</h2>
              <p>
                If you have questions about these terms or our refund policy, email us at{' '}
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
