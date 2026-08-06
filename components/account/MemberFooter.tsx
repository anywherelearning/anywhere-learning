import Link from 'next/link';
import Image from 'next/image';

/**
 * A small, quiet footer for the member zone. The big marketing SiteFooter is
 * hidden on /account, so this carries the real brand wordmark and a couple of
 * housekeeping links, centered. Out-of-zone links open in a new tab so the
 * member never loses their place in the app.
 */
export default function MemberFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mf lr-noprint print:hidden">
      <div className="mf-inner">
        <Link href="/account/home" className="mf-brand" aria-label="Anywhere Learning home">
          <Image src="/logo-wordmark.png" alt="Anywhere Learning" width={220} height={45} className="mf-logo" priority />
        </Link>
        <nav className="mf-links" aria-label="Footer">
          <Link href="/contact" target="_blank" rel="noopener noreferrer" className="mf-link">Help &amp; support</Link>
          <Link href="/about" target="_blank" rel="noopener noreferrer" className="mf-link">About</Link>
          <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="mf-link">Privacy</Link>
          <Link href="/terms" target="_blank" rel="noopener noreferrer" className="mf-link">Terms</Link>
        </nav>
        <span className="mf-copy">&copy; {year} Anywhere Learning</span>
      </div>
      <style>{`
        .mf{border-top:1px solid rgba(61,92,59,0.12);background:var(--am-bg1,#faf9f6);font-family:'DM Sans',sans-serif}
        .mf-inner{max-width:1240px;margin:0 auto;padding:26px clamp(16px,4vw,40px) 28px;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center}
        .mf-brand{display:inline-flex}
        .mf-logo{height:44px;width:auto}
        .mf-links{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:20px}
        .mf-link{font-size:13px;font-weight:600;color:#6f7468;text-decoration:none;transition:color .15s ease}
        .mf-link:hover{color:#3d5c3b}
        .mf-copy{font-size:12.5px;color:#9a978c}
        /* Mobile: the footer is housekeeping, not a destination. Tighten every
           gap so it stops eating a third of the screen on a phone. */
        @media screen and (max-width:640px){
          .mf-inner{padding:18px 16px 20px;gap:9px}
          .mf-logo{height:32px}
          .mf-links{gap:6px 16px}
          .mf-link{font-size:12.5px}
          .mf-copy{font-size:11.5px}
        }
        @media print{.mf{display:none}}
      `}</style>
    </footer>
  );
}
