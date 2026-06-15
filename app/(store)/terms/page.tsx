import type { Metadata } from 'next';
import LegalLayout, { type LegalSection } from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The agreement between you and Anywhere Learning when you use our site, buy our activities, or join our membership.',
  alternates: { canonical: 'https://anywherelearning.co/terms' },
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
    title: 'Our products',
    content: (
      <>
        <p className="mb-3.5">Anywhere Learning offers three things, and only three:</p>
        <ul className="list-disc pl-6 mb-3.5 marker:text-forest space-y-2">
          <li>
            <strong className="text-ink font-semibold">Free starter guide</strong>: a free 7-activity PDF (one across each of our seven categories), delivered to your inbox after you give us your email address.
          </li>
          <li>
            <strong className="text-ink font-semibold">Starter pack</strong>: a one-time $44.99 purchase of 10 hand-picked digital activity guides, delivered instantly to your account.
          </li>
          <li>
            <strong className="text-ink font-semibold">Annual membership</strong>: a recurring annual subscription that provides access to our complete library of activity guides, new content added quarterly, and member-only resources.
          </li>
        </ul>
        <p>
          All products are digital. We do not sell physical goods, individual activity guides, or any other bundles outside of the three offerings listed above. Our guides are designed for parents and guardians to use with their children (ages 6 to 14) for <Em>real-world, hands-on learning.</Em>
        </p>
      </>
    ),
  },
  {
    id: 's2',
    title: 'Membership terms',
    content: (
      <div className="bg-[#F2EFE4] border-l-[3px] border-[#C97B5C] rounded-r-[10px] px-7 py-5 my-2 mb-4">
        <p className="mb-3.5">When you join the Anywhere Learning annual membership, you agree to the following:</p>
        <ol className="list-decimal pl-6 space-y-2.5 marker:text-[#C97B5C] marker:font-display marker:italic">
          <li>
            <strong className="text-ink font-semibold">Free trial.</strong> New members start with a <Em>14-day free trial.</Em> A payment card is required to start, but you are charged $0 during the trial. During the trial you can open and read every guide in your browser. Downloading guides as PDFs is a membership benefit and is not available during the trial; you can start your membership anytime to unlock downloads. Unless you cancel before the trial ends, your membership starts automatically and your card is charged the annual rate. We email you 3 days before your trial ends. Cancel anytime during the trial from your account settings: you keep reading access through the end of your 14 days and you will not be charged. One free trial per customer.
          </li>
          <li>
            <strong className="text-ink font-semibold">Annual billing.</strong> Your membership is charged once per year starting the day your free trial ends (or the day you join, if no trial applies). We do not offer monthly billing at this time.
          </li>
          <li>
            <strong className="text-ink font-semibold">Founding member rate.</strong> The first 100 members pay <Em>$99/year.</Em> After the first 100 founders, the membership price increases to $149/year for new members. Founding members keep their $99/year rate <Em>locked in for life</Em> as long as their membership remains active and uninterrupted.
          </li>
          <li>
            <strong className="text-ink font-semibold">Auto-renewal.</strong> Memberships automatically renew at the rate you joined at (founders renew at $99, post-founders at $149). We send a renewal reminder email 14 days before your renewal date.
          </li>
          <li>
            <strong className="text-ink font-semibold">Cancellation.</strong> You can cancel anytime from your account or by emailing us. Your access continues until the end of your paid year, after which the membership ends and you won&apos;t be billed again.
          </li>
          <li>
            <strong className="text-ink font-semibold">Rejoining.</strong> If you cancel and rejoin later, you&apos;ll pay the membership price in effect at that time. Founder pricing does not return after cancellation.
          </li>
          <li>
            <strong className="text-ink font-semibold">Content access.</strong> Your membership provides access to our library while your subscription is active. Activities you&apos;ve downloaded to your devices remain yours to keep and use indefinitely, subject to the license terms below.
          </li>
        </ol>
      </div>
    ),
  },
  {
    id: 's3',
    title: 'License & usage',
    content: (
      <>
        <p className="mb-3.5">
          When you purchase the starter pack or join the membership, you receive a <Em>personal license</Em> to:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2 marker:text-forest">
          <li>Download and use the products with your own family.</li>
          <li>Open and view on any of your personal devices.</li>
          <li>Print copies for your own household use.</li>
          <li>Reuse activities year after year with your children.</li>
        </ul>
        <p className="mb-3.5">You may not:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2 marker:text-forest">
          <li>Share, redistribute, or resell our files to others.</li>
          <li>Upload our files to any public or shared platform (Google Drive shares, Dropbox public folders, social media, file-sharing sites, etc).</li>
          <li>Use the content for commercial purposes (co-ops, tutoring businesses, classroom instruction, paid workshops, etc) without a separate license.</li>
          <li>Modify, rebrand, or claim our content as your own.</li>
        </ul>
        <p>
          If you&apos;re a co-op leader, tutor, or educator interested in using our materials with a group, reach out to us at <MailLink /> and <Em>we&apos;ll work something out.</Em>
        </p>
      </>
    ),
  },
  {
    id: 's4',
    title: 'Refund policy',
    content: (
      <div className="bg-[#F2EFE4] border-l-[3px] border-[#C97B5C] rounded-r-[10px] px-7 py-5 my-2 mb-4 space-y-4">
        <div className="pl-[18px] border-l border-[#D8D4C5]">
          <span className="block font-display italic text-[18px] text-[#C97B5C] mb-2">For the annual membership</span>
          <p>
            <strong className="text-ink font-semibold">14-day money-back guarantee.</strong> If the membership isn&apos;t right for you, email <MailLink /> within 14 days of your first charge for a full refund, <Em>no questions asked.</Em> Refunds are processed within 5 to 10 business days to the original payment method. This guarantee applies on top of the free trial: cancel during the trial and you&apos;re never charged at all.
          </p>
        </div>
        <div className="pl-[18px] border-l border-[#D8D4C5]">
          <span className="block font-display italic text-[18px] text-[#C97B5C] mb-2">For the starter pack</span>
          <p className="mb-2.5">
            Because the starter pack is delivered instantly as a one-time digital purchase, we offer a <Em>14-day refund window</Em> from the time of purchase, <Em>no questions asked.</Em>
          </p>
          <ul className="list-disc pl-6 space-y-1.5 marker:text-[#C97B5C] mb-2.5">
            <li>
              To request a refund, email <MailLink /> within 14 days of your purchase.
            </li>
            <li>Include the email you used to purchase.</li>
            <li>Refunds are processed within 5 to 10 business days to the original payment method.</li>
          </ul>
          <p>
            After 14 days, all starter pack purchases are final. We encourage you to try our free starter guide first to see if Anywhere Learning is a good fit for your family.
          </p>
        </div>
        <div className="pl-[18px] border-l border-[#D8D4C5]">
          <span className="block font-display italic text-[18px] text-[#C97B5C] mb-2">For renewal charges</span>
          <p>
            We send a renewal reminder 14 days before your annual renewal. If you forget to cancel and your card is charged for a renewal you didn&apos;t want, email us within 7 days of the renewal charge and <Em>we&apos;ll process a full refund.</Em>
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 's5',
    title: 'Payments & billing',
    content: (
      <ul className="list-disc pl-6 space-y-2 marker:text-forest">
        <li>All prices are listed in USD unless otherwise noted.</li>
        <li>Payments are processed securely through Stripe.</li>
        <li>We do not store or have access to your payment card details.</li>
        <li>
          Upon successful payment, your download links and/or membership access are available <Em>immediately.</Em>
        </li>
        <li>For memberships, you&apos;ll receive a renewal reminder 14 days before your annual renewal date.</li>
        <li>Failed renewals may result in your membership being paused. We&apos;ll email you to update your payment method.</li>
      </ul>
    ),
  },
  {
    id: 's6',
    title: 'Intellectual property',
    content: (
      <p>
        All content on this site, including activity guides, text, images, illustrations, icons, branding, and design, is the property of Anywhere Learning and is protected by copyright. You may not reproduce, distribute, or create derivative works without our written permission. Your purchase grants you a <Em>personal-use license</Em> as described above. It does not transfer any ownership rights.
      </p>
    ),
  },
  {
    id: 's7',
    title: 'Your account',
    content: (
      <p>
        You may create an account to access your purchased downloads and membership content. You&apos;re responsible for keeping your login credentials secure. If you suspect unauthorized access to your account, please contact us immediately at <MailLink />.
      </p>
    ),
  },
  {
    id: 's8',
    title: 'Limitation of liability',
    content: (
      <p>
        Our products are educational activity guides provided <Em>&ldquo;as is.&rdquo;</Em> While we work hard to create high-quality content, Anywhere Learning is not liable for any indirect, incidental, or consequential damages arising from the use of our products. Parents and guardians are responsible for supervising their children during all activities, evaluating the suitability of any activity for their children&apos;s ages and abilities, and following appropriate safety practices.
      </p>
    ),
  },
  {
    id: 's9',
    title: 'Governing law',
    content: (
      <p>
        These terms are governed by the laws of Canada. Any disputes will be resolved under Canadian jurisdiction.
      </p>
    ),
  },
  {
    id: 's10',
    title: 'Changes to these terms',
    content: (
      <p>
        We may update these terms from time to time. Significant changes affecting active members will be communicated by email <Em>at least 30 days before</Em> taking effect. Continued use of our site or membership after changes take effect constitutes acceptance of the updated terms.
      </p>
    ),
  },
  {
    id: 's11',
    title: 'Questions',
    content: (
      <p>
        If you have questions about these terms, our refund policy, or anything else, email us at <MailLink />. We respond to every email, <Em>usually within 48 hours.</Em>
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title={
        <>
          Terms of <span className="italic text-forest">service.</span>
        </>
      }
      sub="The agreement between you and Anywhere Learning when you use our site, buy our activities, or join our membership."
      lastUpdated="May 18, 2026"
      sections={sections}
      helpline={{
        lead: 'Have a question about these terms?',
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
