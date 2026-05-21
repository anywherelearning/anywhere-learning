import Link from 'next/link';
import Image from 'next/image';
import { getMembership } from '@/lib/membership-runtime';

/** Logo (PNG icon + "anywhere learning" two-font lockup). */
function FooterLogo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 text-ink no-underline hover:opacity-85 transition-opacity"
      aria-label="Anywhere Learning home"
    >
      <Image
        src="/logo-icon-transparent.png"
        alt=""
        width={36}
        height={36}
        className="h-9 w-auto"
        aria-hidden="true"
      />
      <span className="inline-flex items-baseline gap-1">
        <span className="font-body font-normal text-[18px] text-ink tracking-wide">anywhere</span>
        <span className="font-display italic text-[19px] text-forest-dark leading-none">
          learning
        </span>
      </span>
    </Link>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9 22l2-7" />
      <path d="M8 11.5a4 4 0 1 1 7.5 2c-.5 1.5-2 2-3 2" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

export default async function SiteFooter() {
  // Pull live founder state from the DB so the CTA + tagline below switch
  // automatically once we hit 100 active members.
  const m = await getMembership();
  return (
    <footer className="bg-[#DAD7CD] border-t border-[#C9C5B7] pt-6 pb-4">
      <div className="mx-auto max-w-[1280px] px-6">
        {/* Columns */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-6 md:gap-6 mb-4">
          <div className="col-span-3 md:col-span-1">
            <FooterLogo />
            <p className="mt-1.5 font-display italic text-[14.5px] leading-[1.3] text-gray-600 max-w-[260px]">
              Hands-on activities for raising capable kids, ready for real life.
            </p>
            <p className="mt-1 text-[12px] text-gray-500">
              Built by Amelie. Made in Nelson, BC.
            </p>
            <div className="mt-2 flex gap-2 md:pl-[48px]">
              <a
                href="https://instagram.com/anywherelearning"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-[28px] h-[28px] rounded-full bg-cream border border-[#C9C5B7] grid place-items-center text-gray-600 hover:bg-[#E6EBDF] hover:text-forest-dark hover:-translate-y-px transition-all"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61587630845193"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-[28px] h-[28px] rounded-full bg-cream border border-[#C9C5B7] grid place-items-center text-gray-600 hover:bg-[#E6EBDF] hover:text-forest-dark hover:-translate-y-px transition-all"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://ca.pinterest.com/anywherelearning/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="w-[28px] h-[28px] rounded-full bg-cream border border-[#C9C5B7] grid place-items-center text-gray-600 hover:bg-[#E6EBDF] hover:text-forest-dark hover:-translate-y-px transition-all"
              >
                <PinterestIcon />
              </a>
            </div>
          </div>

          <FooterColumn title="The Library">
            <FooterLink href="/shop">Library</FooterLink>
            <FooterLink href="/join">Membership</FooterLink>
            <FooterLink href="/shop/starter-pack">Starter Pack</FooterLink>
            <FooterLink href="/free-guide">Free starter guide</FooterLink>
          </FooterColumn>

          <FooterColumn title="Read &amp; Learn">
            <FooterLink href="/guides">Pillar guides</FooterLink>
            <FooterLink href="/blog">Blog</FooterLink>
            <FooterLink href="/about">About Amelie</FooterLink>
            <FooterLink href="/faq">FAQ</FooterLink>
          </FooterColumn>

          <FooterColumn title="Support">
            <FooterLink href="/contact">Contact</FooterLink>
            <FooterLink href="/account">My account</FooterLink>
            <FooterLink href="/terms#refund-policy">Refund policy</FooterLink>
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
          </FooterColumn>
        </div>

        {/* Bottom strip */}
        <div className="pt-3 border-t border-[#C9C5B7] flex items-center justify-between gap-2 flex-wrap text-[12px] text-gray-500 max-md:flex-col max-md:text-center">
          <div className="inline-flex items-center gap-2 flex-wrap">
            <span>&copy; {new Date().getFullYear()} Anywhere Learning Co.</span>
            <span aria-hidden="true" className="w-[3px] h-[3px] rounded-full bg-[#C9C5B7] inline-block" />
            <span>Made with care</span>
          </div>
          <div className="inline-flex items-center gap-2 flex-wrap">
            {m.isFounderPhase && (
              <em className="font-display italic text-[#C97B5C] not-italic md:italic">
                Founding member rate locked in for life.
              </em>
            )}
            <Link
              href="/join"
              className="text-[#C97B5C] font-body font-semibold text-[13px] border-b border-[#C97B5C]/40 pb-[1px] no-underline hover:text-[#7A3D24] transition-colors"
            >
              {m.joinCtaLabel} &rarr;
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4
        className="font-body font-semibold text-[12px] uppercase tracking-[0.18em] text-gray-600 m-0 mb-2"
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <ul className="list-none p-0 m-0 flex flex-col gap-0.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="inline-block font-body text-[13px] md:text-[13.5px] leading-[1.5] text-gray-600 no-underline hover:text-forest-dark hover:translate-x-1 transition-all"
      >
        {children}
      </Link>
    </li>
  );
}
