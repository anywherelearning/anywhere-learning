import type { Metadata } from 'next';
import Link from 'next/link';
import LegalLayout, { type LegalSection } from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How we collect, use, and protect your personal information at Anywhere Learning, explained in plain language.',
  alternates: { canonical: 'https://anywherelearning.co/privacy' },
};

const EMAIL = 'info@anywherelearning.co';

const Em = ({ children }: { children: React.ReactNode }) => (
  <em className="font-display not-italic italic text-forest-dark text-[17.5px]">{children}</em>
);
const InlineLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="text-forest-dark underline decoration-forest/40 underline-offset-[3px] hover:decoration-forest-dark hover:decoration-2 transition-all"
  >
    {children}
  </a>
);
const MailLink = () => <InlineLink href={`mailto:${EMAIL}`}>{EMAIL}</InlineLink>;

const sections: LegalSection[] = [
  {
    id: 's1',
    title: 'What we collect',
    content: (
      <>
        <p className="mb-3.5">When you use our site, we may collect:</p>
        <ul className="list-disc pl-6 space-y-2 marker:text-forest">
          <li>
            <strong className="text-ink font-semibold">Account information:</strong> your name and email address when you create an account, sign up for the free guide, or make a purchase.
          </li>
          <li>
            <strong className="text-ink font-semibold">Order and subscription information:</strong> what you purchased or which membership you joined, when, and your access history.
          </li>
          <li>
            <strong className="text-ink font-semibold">Usage data:</strong> pages you visit and how you interact with our site (collected anonymously via analytics).
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 's2',
    title: 'Payment processing',
    content: (
      <p>
        All payments are processed securely by <strong className="text-ink font-semibold">Stripe</strong>. We never see, store, or have access to your credit card number or banking details. Stripe handles all payment data under their own security standards (<Em>PCI DSS Level 1</Em>). This applies to both the one-time starter pack purchase and recurring annual membership renewals.
      </p>
    ),
  },
  {
    id: 's3',
    title: 'Cookies & authentication',
    content: (
      <p>
        We use essential cookies to keep you signed in to your account (powered by Clerk). These are necessary for the site to function and cannot be disabled. <Em>We do not use advertising or third-party tracking cookies.</Em>
      </p>
    ),
  },
  {
    id: 's4',
    title: 'Email communications',
    content: (
      <>
        <p className="mb-3.5">
          If you sign up for our free guide, join the membership, or make a purchase, we may send you emails about:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2 marker:text-forest">
          <li>Order confirmations and download links.</li>
          <li>Membership renewals and important account changes.</li>
          <li>Helpful tips for using your activity guides.</li>
          <li>New activities, occasional promotions, and content from the blog.</li>
        </ul>
        <p>
          You can unsubscribe from marketing emails at any time by clicking the unsubscribe link in any email. Transactional emails (order confirmations, renewal notices, account changes) will still be sent because they relate to services you&apos;ve requested. We use ConvertKit (Kit) to manage our email list.
        </p>
      </>
    ),
  },
  {
    id: 's5',
    title: 'Analytics',
    content: (
      <p>
        We use Google Analytics to understand how visitors use our site, which pages are most popular, how people find us, what to improve. This data is <Em>aggregated and anonymous.</Em> We don&apos;t use it to identify individual visitors or target you with ads.
      </p>
    ),
  },
  {
    id: 's6',
    title: 'Third-party services',
    content: (
      <>
        <p className="mb-3.5">We work with these trusted services to run our site:</p>
        <div className="bg-[#F2EFE4] border-l-[3px] border-[#C97B5C] rounded-r-[10px] px-7 py-5 my-2 mb-4">
          <ul className="list-disc pl-6 space-y-2 marker:text-[#C97B5C]">
            <li>
              <strong className="text-ink font-semibold">Stripe</strong>: payment processing for one-time purchases and recurring memberships.
            </li>
            <li>
              <strong className="text-ink font-semibold">Clerk</strong>: account authentication.
            </li>
            <li>
              <strong className="text-ink font-semibold">ConvertKit (Kit)</strong>: email marketing.
            </li>
            <li>
              <strong className="text-ink font-semibold">Vercel</strong>: website hosting.
            </li>
            <li>
              <strong className="text-ink font-semibold">Google Analytics</strong>: anonymous site usage data.
            </li>
          </ul>
        </div>
        <p>
          Each service has its own privacy policy governing how they handle your data. We only share <Em>what&apos;s strictly necessary</Em> to provide our service.
        </p>
      </>
    ),
  },
  {
    id: 's7',
    title: "Children's privacy",
    content: (
      <div className="bg-[#F2EFE4] border-l-[3px] border-[#C97B5C] rounded-r-[10px] px-7 py-5 my-2">
        <p>
          Anywhere Learning is a resource for parents and guardians. Our site and membership are <Em>not directed at children under 13,</Em> and we do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will remove it promptly.
        </p>
      </div>
    ),
  },
  {
    id: 's8',
    title: 'Data retention',
    content: (
      <p>
        We keep your account, order, and subscription data for as long as your account is active, so you can always access your purchased downloads and membership content. If you&apos;d like your data deleted, just email us and we&apos;ll take care of it. Note that some financial records may be retained as required by tax and accounting regulations.
      </p>
    ),
  },
  {
    id: 's9',
    title: 'Your rights',
    content: (
      <>
        <p className="mb-3.5">You have the right to:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2 marker:text-forest">
          <li>Access the personal information we hold about you.</li>
          <li>Request correction of inaccurate data.</li>
          <li>Request deletion of your data.</li>
          <li>Opt out of marketing emails at any time.</li>
          <li>
            Cancel your membership at any time (see{' '}
            <Link
              href="/terms"
              className="text-forest-dark underline decoration-forest/40 underline-offset-[3px] hover:decoration-forest-dark hover:decoration-2 transition-all"
            >
              Terms of Service
            </Link>{' '}
            for refund details).
          </li>
        </ul>
        <p>
          To exercise any of these rights, email us at <MailLink />.
        </p>
      </>
    ),
  },
  {
    id: 's10',
    title: 'Data security',
    content: (
      <p>
        We use SSL encryption across our entire site and rely on industry-standard security practices. Payments are handled by Stripe&apos;s secure infrastructure. While no system is 100% secure, we take <Em>reasonable measures</Em> to protect your information.
      </p>
    ),
  },
  {
    id: 's11',
    title: 'Changes to this policy',
    content: (
      <p>
        We may update this policy from time to time. If we make significant changes, we&apos;ll update the &ldquo;Last updated&rdquo; date at the top of this page and notify members by email when changes affect them. We encourage you to review this page periodically.
      </p>
    ),
  },
  {
    id: 's12',
    title: 'Questions',
    content: (
      <p>
        If you have any questions about this privacy policy, reach out to us at <MailLink />. We respond to every email, <Em>usually within 48 hours.</Em>
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title={
        <>
          Privacy <span className="italic text-forest">policy.</span>
        </>
      }
      sub="How we collect, use, and protect your personal information, explained in plain language."
      lastUpdated="May 18, 2026"
      sections={sections}
      helpline={{
        lead: 'Have a question about this policy?',
        body: (
          <>
            Email{' '}
            <a
              href={`mailto:${EMAIL}`}
              className="text-forest-dark border-b border-forest/30 pb-px font-medium hover:text-forest hover:border-forest-dark transition-colors"
            >
              {EMAIL}
            </a>{' '}
            and we&apos;ll explain in plain English.
          </>
        ),
      }}
    />
  );
}
