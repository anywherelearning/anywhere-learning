'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { useFocusTrap } from '@/hooks/useFocusTrap';

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

interface AuthState {
  isSignedIn: boolean;
  initial: string;
  name: string;
  email: string;
  /** Profile image URL set in /account/settings. Null when user hasn't
   *  uploaded one (we show their initial as a letter avatar instead). */
  imageUrl: string | null;
  /** 'member' for active membership subscribers, 'starter' for one-time
   *  Starter Pack buyers, null for users without either. Read from Clerk's
   *  publicMetadata, which the webhook sets after each purchase. */
  tier: 'member' | 'starter' | null;
  /** True only if the user paid the founder rate ($99/yr first-100). False
   *  for post-founder members ($149/yr) and Starter Pack buyers. */
  founder: boolean;
}

/** Brand logo (PNG icon + brand name in two-font lockup, matches footer). */
function Logo() {
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
        priority
        aria-hidden="true"
      />
      <span className="inline-flex items-baseline gap-1">
        <span className="font-body font-normal text-[17px] text-ink tracking-wide">anywhere</span>
        <span className="font-display italic text-[18px] text-forest-dark leading-none">
          learning
        </span>
      </span>
    </Link>
  );
}

const NAV_ITEMS_BEFORE = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Library' },
  { href: '/join', label: 'Membership' },
];

const NAV_ITEMS_AFTER = [
  { href: '/about', label: 'About' },
];

const RESOURCES_ITEMS = [
  { href: '/guides', label: 'Learn', desc: 'Guides and how-tos' },
  { href: '/blog', label: 'Blog', desc: 'Stories and ideas' },
  { href: '/ideas', label: 'Activity Ideas', desc: 'Free printable checklists' },
];


function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const pathname = usePathname();
  const focusTrapRef = useFocusTrap(mobileOpen);
  const accountRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const [auth, setAuth] = useState<AuthState>({
    isSignedIn: false,
    initial: '',
    name: '',
    email: '',
    imageUrl: null,
    tier: null,
    founder: false,
  });

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
    setResourcesOpen(false);
  }, [pathname]);

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Esc closes things
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setAccountOpen(false);
        setResourcesOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Click-outside for account dropdown
  useEffect(() => {
    if (!accountOpen) return;
    const onClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [accountOpen]);

  // Click-outside for resources dropdown
  useEffect(() => {
    if (!resourcesOpen) return;
    const onClick = (e: MouseEvent) => {
      if (resourcesRef.current && !resourcesRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [resourcesOpen]);

  // Body scroll lock when mobile menu open
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Auth state is pushed up from <ClerkAuthBridge /> below, which only mounts
  // when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set.

  return (
    <>
      {hasClerk && <ClerkAuthBridge onChange={setAuth} />}

      <header
        className={`sticky top-0 z-50 bg-[#DAD7CD] transition-all duration-200 ${
          scrolled
            ? 'border-b border-[#C9C5B7] shadow-[0_4px_14px_-10px_rgba(45,58,46,0.15)]'
            : 'border-b border-transparent'
        }`}
      >
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="flex items-center justify-between gap-6 py-4">
            <Logo />

            {/* Primary nav - desktop */}
            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-8 list-none p-0 m-0">
                {NAV_ITEMS_BEFORE.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`relative inline-block font-body font-medium text-[15px] py-1.5 transition-colors no-underline ${
                          active
                            ? 'text-forest-dark'
                            : 'text-gray-600 hover:text-forest-dark'
                        }`}
                      >
                        {item.label}
                        {active && (
                          <span
                            aria-hidden="true"
                            className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-1 h-1 rounded-full bg-forest"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}

                {/* Resources dropdown */}
                <li>
                  <div ref={resourcesRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setResourcesOpen((o) => !o)}
                      aria-haspopup="menu"
                      aria-expanded={resourcesOpen}
                      className={`relative inline-flex items-center gap-1 font-body font-medium text-[15px] py-1.5 transition-colors bg-transparent border-0 cursor-pointer ${
                        RESOURCES_ITEMS.some((r) => isActive(pathname, r.href))
                          ? 'text-forest-dark'
                          : 'text-gray-600 hover:text-forest-dark'
                      }`}
                    >
                      Resources
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className={`transition-transform duration-200 ${resourcesOpen ? 'rotate-180' : ''}`}
                      >
                        <path d="M3 4.5L6 7.5L9 4.5" />
                      </svg>
                      {RESOURCES_ITEMS.some((r) => isActive(pathname, r.href)) && (
                        <span
                          aria-hidden="true"
                          className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-1 h-1 rounded-full bg-forest"
                        />
                      )}
                    </button>
                    {/* Always in the DOM (crawlable links); toggled with CSS */}
                    <div
                      role="menu"
                      className={`absolute left-1/2 -translate-x-1/2 top-[calc(100%+12px)] w-[240px] bg-cream border border-[#D8D4C5] rounded-[12px] shadow-[0_18px_40px_-16px_rgba(45,58,46,0.3)] py-2 z-[70] ${resourcesOpen ? '' : 'hidden'}`}
                    >
                        {RESOURCES_ITEMS.map((item) => {
                          const active = isActive(pathname, item.href);
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              role="menuitem"
                              className={`flex flex-col gap-0.5 px-4 py-3 no-underline hover:bg-[#F2EFE4] transition-colors ${
                                active ? 'bg-[#F2EFE4]' : ''
                              }`}
                            >
                              <span className={`font-body font-semibold text-[14px] ${active ? 'text-forest-dark' : 'text-ink'}`}>
                                {item.label}
                              </span>
                              <span className="font-body text-[12px] text-gray-500">
                                {item.desc}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                  </div>
                </li>

                {NAV_ITEMS_AFTER.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`relative inline-block font-body font-medium text-[15px] py-1.5 transition-colors no-underline ${
                          active
                            ? 'text-forest-dark'
                            : 'text-gray-600 hover:text-forest-dark'
                        }`}
                      >
                        {item.label}
                        {active && (
                          <span
                            aria-hidden="true"
                            className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-1 h-1 rounded-full bg-forest"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Right zone */}
            <div className="flex items-center gap-3 lg:gap-4">
              {auth.isSignedIn ? (
                <>
                  <Link
                    href="/account/plan"
                    className="hidden lg:inline-flex items-center gap-2 bg-forest text-cream font-body font-semibold text-[14.5px] px-3.5 py-1.5 rounded-full no-underline hover:bg-forest-dark transition-colors"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="5" width="18" height="16" rx="2" />
                      <path d="M3 9h18M8 3v4M16 3v4" />
                    </svg>
                    My Plan
                  </Link>
                  <Link
                    href="/account"
                    className="hidden lg:inline-flex items-center gap-2 text-forest-dark font-body font-medium text-[14.5px] px-3.5 py-1.5 rounded-full no-underline hover:bg-[#E6EBDF] hover:text-forest transition-colors"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z" />
                      <path d="M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z" />
                    </svg>
                    My Library
                  </Link>
                  <div ref={accountRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setAccountOpen((o) => !o)}
                      aria-haspopup="menu"
                      aria-expanded={accountOpen}
                      aria-controls="account-menu"
                      aria-label={`Account menu for ${auth.name || 'member'}`}
                      className="w-8 h-8 rounded-full bg-[#F2EFE4] border border-[#DAD7CD] overflow-hidden grid place-items-center text-forest-dark font-display italic text-[15px] hover:border-forest hover:scale-105 transition-all"
                    >
                      {auth.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={auth.imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        auth.initial || 'M'
                      )}
                    </button>
                    {accountOpen && (
                      <div
                        id="account-menu"
                        role="menu"
                        className="absolute right-0 top-[calc(100%+10px)] w-60 bg-cream border border-[#D8D4C5] rounded-[12px] shadow-[0_18px_40px_-16px_rgba(45,58,46,0.3)] py-2 z-[70]"
                      >
                        <div className="px-4 pt-3 pb-3.5 border-b border-[#D8D4C5] mb-1.5">
                          <div className="font-display italic text-[17px] text-ink leading-[1.2]">
                            {auth.name || 'Member'}
                          </div>
                          {auth.email && (
                            <div className="text-[12.5px] text-gray-500 mt-0.5 truncate">
                              {auth.email}
                            </div>
                          )}
                        </div>
                        <AccountMenuItem href="/account">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z" />
                            <path d="M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z" />
                          </svg>
                          My Library
                        </AccountMenuItem>
                        <AccountMenuItem href="/account/plan">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <rect x="3" y="5" width="18" height="16" rx="2" />
                            <path d="M3 9h18M8 3v4M16 3v4" />
                          </svg>
                          My Plan
                        </AccountMenuItem>
                        <AccountMenuItem href="/account/settings">Account settings</AccountMenuItem>
                        <AccountMenuItem href="/contact">Help &amp; support</AccountMenuItem>
                        <div className="h-px bg-[#D8D4C5] my-1.5" />
                        <SignOutItem />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/free-guide"
                    className="hidden lg:inline-block text-gray-600 font-body font-medium text-[14.5px] py-1 hover:text-forest-dark transition-colors no-underline"
                  >
                    Free guide
                  </Link>
                  <span
                    aria-hidden="true"
                    className="hidden lg:inline-block w-px h-4 bg-[#C9C5B7]"
                  />
                  <Link
                    href="/sign-in"
                    className="hidden md:inline-block text-gray-600 font-body font-medium text-[14.5px] py-1 hover:text-forest-dark transition-colors no-underline"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/start-trial"
                    className="hidden sm:inline-flex items-center gap-1.5 bg-forest text-cream font-body font-semibold text-[14.5px] px-4 py-2 rounded-full no-underline shadow-[0_8px_18px_-10px_rgba(58,90,64,0.5)] hover:bg-forest-dark hover:-translate-y-px hover:shadow-[0_12px_24px_-10px_rgba(58,90,64,0.6)] transition-all"
                  >
                    Start free trial
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </>
              )}

              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                className="lg:hidden w-10 h-10 rounded-full bg-cream border border-[#C9C5B7] grid place-items-center text-forest-dark cursor-pointer shadow-[0_4px_10px_-6px_rgba(45,58,46,0.25)] hover:bg-[#E6EBDF] hover:border-forest hover:-translate-y-px transition-all"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          ref={focusTrapRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="fixed inset-0 z-[80] bg-cream overflow-y-auto"
        >
          <div className="mx-auto max-w-[1280px] px-6 py-6 pb-10">
            <div className="flex items-center justify-between mb-6">
              <Logo />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="w-9 h-9 rounded-full bg-[#F2EFE4] text-gray-600 text-[22px] leading-none grid place-items-center border-0 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {auth.isSignedIn && (
              <div className="mb-5 py-3.5 px-4 bg-[#E6EBDF] border border-[#C9D3BE] rounded-[10px]">
                <div className="font-body font-medium text-[13px] text-gray-600">Signed in as</div>
                <div className="font-display italic text-[18px] text-forest-dark mt-0.5">
                  {auth.name || 'Member'}
                </div>
                {auth.email && (
                  <div className="text-[11.5px] text-gray-500 mt-0.5 truncate">{auth.email}</div>
                )}
              </div>
            )}

            <ul className="list-none p-0 m-0 flex flex-col">
              {auth.isSignedIn && (
                <li>
                  <Link
                    href="/account"
                    className="flex items-center gap-2.5 py-4 border-b border-[#D8D4C5] font-display text-[24px] text-forest-dark no-underline"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z" />
                      <path d="M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z" />
                    </svg>
                    My Library
                  </Link>
                </li>
              )}
              {NAV_ITEMS_BEFORE.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center py-4 border-b border-[#D8D4C5] font-display text-[24px] text-ink no-underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <MobileResourcesAccordion />
              {NAV_ITEMS_AFTER.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center py-4 border-b border-[#D8D4C5] font-display text-[24px] text-ink no-underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3.5 items-center">
              {auth.isSignedIn ? (
                <>
                  <Link
                    href="/account"
                    className="w-full max-w-[380px] inline-flex items-center justify-center gap-2 bg-forest text-cream font-body font-semibold text-[15px] py-3.5 px-5 rounded-xl no-underline hover:bg-forest-dark transition-all"
                  >
                    My Library &rarr;
                  </Link>
                  <Link
                    href="/account"
                    className="text-gray-600 font-body font-medium text-[14.5px] no-underline"
                  >
                    Account settings
                  </Link>
                  <MobileSignOutLink />
                </>
              ) : (
                <>
                  <Link
                    href="/free-guide"
                    className="w-full max-w-[380px] inline-flex items-center justify-center gap-2 border-[1.5px] border-forest text-forest-dark font-body font-semibold text-[15px] py-3 px-5 rounded-xl no-underline hover:bg-[#E6EBDF] transition-all"
                  >
                    Get the free guide &rarr;
                  </Link>
                  <Link
                    href="/sign-in"
                    className="text-gray-600 font-body font-medium text-[14.5px] no-underline"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/start-trial"
                    className="w-full max-w-[380px] inline-flex items-center justify-center gap-2 bg-forest text-cream font-body font-semibold text-[15px] py-3.5 px-5 rounded-xl no-underline hover:bg-forest-dark transition-all"
                  >
                    Start free trial &rarr;
                  </Link>
                </>
              )}
            </div>

            <p className="mt-9 text-center font-display italic text-[14px] text-[#C97B5C]">
              Built by Amelie. Made in Nelson, BC.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function AccountMenuItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex items-center gap-2.5 px-4 py-2.5 font-body text-[14px] font-medium text-ink no-underline hover:bg-[#F2EFE4] transition-colors"
    >
      {children}
    </Link>
  );
}

/** Collapsible Resources section for the mobile menu. */
function MobileResourcesAccordion() {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-4 border-b border-[#D8D4C5] font-display text-[24px] text-ink bg-transparent border-x-0 border-t-0 cursor-pointer text-left"
      >
        Resources
        <svg
          width="16"
          height="16"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`transition-transform duration-200 text-gray-400 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M3 4.5L6 7.5L9 4.5" />
        </svg>
      </button>
      {/* Always in the DOM (crawlable links); toggled with CSS */}
      <ul className={`list-none p-0 m-0 pl-5 border-b border-[#D8D4C5] ${open ? '' : 'hidden'}`}>
        {RESOURCES_ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex flex-col py-3.5 no-underline"
            >
              <span className="font-display text-[20px] text-forest-dark">{item.label}</span>
              <span className="font-body text-[13px] text-gray-500 mt-0.5">{item.desc}</span>
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}

/** Inline sign-out menu item. Uses Clerk's signOut() then redirects home. */
function SignOutItem() {
  const { signOut } = useClerk();
  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => signOut({ redirectUrl: '/' })}
      className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 font-body text-[14px] font-medium text-gray-500 bg-transparent border-0 cursor-pointer hover:bg-[#F2EFE4] transition-colors"
    >
      Sign out
    </button>
  );
}

function MobileSignOutLink() {
  const { signOut } = useClerk();
  return (
    <button
      type="button"
      onClick={() => signOut({ redirectUrl: '/' })}
      className="text-gray-500 font-body font-medium text-[14.5px] bg-transparent border-0 cursor-pointer"
    >
      Sign out
    </button>
  );
}

/** Reads Clerk auth state and pushes it up to SiteHeader via the onChange prop.
 *  Isolated so the hook is only mounted when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set. */
function ClerkAuthBridge({ onChange }: { onChange: (s: AuthState) => void }) {
  const { isSignedIn, user } = useUser();
  useEffect(() => {
    if (!isSignedIn || !user) {
      onChange({
        isSignedIn: false,
        initial: '',
        name: '',
        email: '',
        imageUrl: null,
        tier: null,
        founder: false,
      });
      return;
    }
    const name =
      user.fullName ||
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      user.username ||
      'Member';
    const initial = (name || 'M').trim().charAt(0).toUpperCase();
    const email = user.primaryEmailAddress?.emailAddress || '';
    // Avatar — only treat as "uploaded" if the user actually set one. Clerk
    // returns an auto-generated identicon otherwise, which we'd rather hide
    // in favor of the letter avatar.
    const imageUrl =
      user.hasImage && !user.imageUrl?.includes('clerk.com/identicon')
        ? user.imageUrl
        : null;
    // Tier + founder are stamped onto publicMetadata by the Stripe webhook.
    const meta = user.publicMetadata as { tier?: 'member' | 'starter'; founder?: boolean };
    onChange({
      isSignedIn: true,
      initial,
      name,
      email,
      imageUrl,
      tier: meta.tier || null,
      founder: !!meta.founder,
    });
  }, [isSignedIn, user, onChange]);
  return null;
}
