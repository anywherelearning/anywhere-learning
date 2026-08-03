'use client';

/**
 * The member-zone header — the single nav signed-in members see across every
 * /account surface (Home, Library, This Month, Record), plus a Resources
 * dropdown (the same marketing links as the public header) and an avatar menu
 * for account settings and sign out. Rendered once from the account layout, so
 * every member page gets it; SiteHeader hides itself on /account so there's no
 * double header.
 *
 * Self-contained: it reads the path to know the active tab and to point its
 * links at the /dev-*-preview routes when we're inside one (the same component
 * drives the real pages and the dev previews). The avatar uses the signed-in
 * user's photo, falling back to their first initial; Clerk is optional, matching
 * how SiteHeader guards it, so local preview (no publishable key) still renders.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

type NavKey = 'home' | 'library' | 'this-month' | 'record';

const HREFS: Record<NavKey, string> = {
  home: '/account/home',
  library: '/account',
  'this-month': '/account/this-month',
  record: '/account/record',
};

const ITEMS: { key: NavKey; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'library', label: 'Library' },
  { key: 'this-month', label: 'This Month' },
  { key: 'record', label: 'Record' },
];

// The same resources the public header offers, so members can reach the free
// content without leaving through the marketing home.
const RESOURCES = [
  { href: '/guides', label: 'Learn', desc: 'Guides and how-tos' },
  { href: '/blog', label: 'Blog', desc: 'Stories and ideas' },
  { href: '/ideas', label: 'Activity Ideas', desc: 'Free printable checklists' },
  { href: '/guides/capable-kid', label: 'Capable Kid Guide', desc: 'Free age-by-age skills map' },
  { href: '/free-guide', label: 'Free 7-Day Guide', desc: 'Seven activities, sent to your inbox' },
];

function activeKey(path: string): NavKey | null {
  if (path.startsWith('/account/home')) return 'home';
  if (path.startsWith('/account/this-month')) return 'this-month';
  if (path.startsWith('/account/record')) return 'record';
  if (path === '/account' || path.startsWith('/account/view')) return 'library';
  return null;
}

/** Tiny "opens in a new tab" glyph, for links that leave the member zone. */
function ExtIcon() {
  return (
    <svg className="mn-ext" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6" /><path d="M10 14L21 3" />
    </svg>
  );
}

/** Resources links, shown inside the avatar menu on mobile (where the bar's
 *  Resources dropdown is hidden to make room for the four tabs). */
function MobileResources() {
  return (
    <div className="mn-only-mobile">
      <div className="mn-menu-sep" />
      <div className="mn-menu-label">Resources</div>
      {RESOURCES.map((r) => (
        <Link key={r.href} href={r.href} target="_blank" rel="noopener noreferrer" className="mn-menu-item" role="menuitem">
          {r.label}<ExtIcon />
        </Link>
      ))}
    </div>
  );
}

/** Avatar + dropdown for the signed-in member (Clerk configured). */
function AccountMenu({ open, onToggle }: { open: boolean; onToggle: (v: boolean) => void }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const name = user?.fullName || user?.firstName || '';
  const email = user?.primaryEmailAddress?.emailAddress || '';
  const initial = (user?.firstName || name || 'A').trim().charAt(0).toUpperCase() || 'A';
  const photo = user?.imageUrl || null;

  return (
    <div className="mn-acct">
      <button
        type="button"
        className="mn-avatar"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => onToggle(!open)}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="mn-avatar-img" />
        ) : (
          <span className="mn-avatar-initial">{initial}</span>
        )}
      </button>
      {open && (
        <div className="mn-menu" role="menu">
          {(name || email) && (
            <div className="mn-menu-head">
              {name && <div className="mn-menu-name">{name}</div>}
              {email && <div className="mn-menu-email">{email}</div>}
            </div>
          )}
          <button
            type="button"
            className="mn-menu-item"
            role="menuitem"
            onClick={() => {
              onToggle(false);
              window.dispatchEvent(new Event('al:open-tour'));
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.4-3 4" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            How it works
          </button>
          <Link href="/account/settings" className="mn-menu-item" role="menuitem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            Account settings
          </Link>
          <Link href="/contact" target="_blank" rel="noopener noreferrer" className="mn-menu-item" role="menuitem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
            Help &amp; support<ExtIcon />
          </Link>
          <MobileResources />
          <button type="button" className="mn-menu-item" role="menuitem" onClick={() => signOut({ redirectUrl: '/' })}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/** Static fallback for local preview without Clerk (no signed-in user). */
function AccountMenuFallback({ open, onToggle }: { open: boolean; onToggle: (v: boolean) => void }) {
  return (
    <div className="mn-acct">
      <button type="button" className="mn-avatar" aria-haspopup="menu" aria-expanded={open} aria-label="Account menu" onClick={() => onToggle(!open)}>
        <span className="mn-avatar-initial">A</span>
      </button>
      {open && (
        <div className="mn-menu" role="menu">
          <button type="button" className="mn-menu-item" role="menuitem" onClick={() => { onToggle(false); window.dispatchEvent(new Event('al:open-tour')); }}>How it works</button>
          <Link href="/account/settings" className="mn-menu-item" role="menuitem">Account settings</Link>
          <Link href="/contact" target="_blank" rel="noopener noreferrer" className="mn-menu-item" role="menuitem">Help &amp; support<ExtIcon /></Link>
          <MobileResources />
          <Link href="/" className="mn-menu-item" role="menuitem">Sign out</Link>
        </div>
      )}
    </div>
  );
}

export default function MemberNav() {
  const pathname = usePathname() || '';
  const hrefs = HREFS;
  const active = activeKey(pathname);
  const activeRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [menu, setMenu] = useState<'resources' | 'account' | null>(null);

  // Keep the current tab visible when the link row scrolls on narrow screens.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, []);

  // Close dropdowns on outside click and on route change.
  useEffect(() => setMenu(null), [pathname]);
  useEffect(() => {
    if (!menu) return;
    const onDoc = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMenu(null);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menu]);

  // The onboarding quiz is a full-screen flow — no member header there.
  if (pathname.startsWith('/account/welcome')) return null;

  return (
    <nav className="mn-nav lr-noprint" aria-label="Member area" ref={navRef}>
      <div className="mn-inner">
        <div className="mn-side mn-spacer" aria-hidden="true" />
        <div className="mn-links">
          {ITEMS.map((it) => {
            const on = active === it.key;
            return (
              <Link
                key={it.key}
                ref={on ? activeRef : undefined}
                href={hrefs[it.key]}
                aria-current={on ? 'page' : undefined}
                className={`mn-link${on ? ' mn-on' : ''}`}
              >
                {it.label}
              </Link>
            );
          })}
        </div>

        <div className="mn-side mn-right">
          {/* Resources dropdown — free marketing content, same as the public header */}
          <div className="mn-drop">
            <button
              type="button"
              className={`mn-link mn-link-btn${menu === 'resources' ? ' mn-open' : ''}`}
              aria-haspopup="menu"
              aria-expanded={menu === 'resources'}
              onClick={() => setMenu(menu === 'resources' ? null : 'resources')}
            >
              Resources
              <svg className="mn-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
            </button>
            {menu === 'resources' && (
              <div className="mn-menu mn-menu-wide mn-menu-left" role="menu">
                {RESOURCES.map((r) => (
                  <Link key={r.href} href={r.href} target="_blank" rel="noopener noreferrer" className="mn-menu-item mn-menu-item-rich" role="menuitem">
                    <span className="mn-menu-item-label">{r.label}<ExtIcon /></span>
                    <span className="mn-menu-item-desc">{r.desc}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          {hasClerk ? (
            <AccountMenu open={menu === 'account'} onToggle={(v) => setMenu(v ? 'account' : null)} />
          ) : (
            <AccountMenuFallback open={menu === 'account'} onToggle={(v) => setMenu(v ? 'account' : null)} />
          )}
        </div>
      </div>

      <style>{`
        .mn-nav{position:sticky;top:0;z-index:60;background:rgba(250,249,246,0.92);backdrop-filter:saturate(1.1) blur(8px);-webkit-backdrop-filter:saturate(1.1) blur(8px);border-bottom:1px solid rgba(61,92,59,0.12);font-family:'DM Sans',sans-serif}
        .mn-inner{max-width:1240px;margin:0 auto;height:54px;display:flex;align-items:center;gap:14px;padding:0 clamp(12px,4vw,40px)}
        .mn-side{flex:1 1 0;min-width:0;display:flex;align-items:center}
        .mn-links{flex:0 1 auto;display:flex;align-items:center;justify-content:center;gap:2px;min-width:0;overflow-x:auto;overflow-y:visible;scrollbar-width:none;-ms-overflow-style:none}
        .mn-links::-webkit-scrollbar{display:none}
        .mn-link{flex:0 0 auto;display:inline-flex;align-items:center;gap:4px;text-decoration:none;font-family:inherit;font-size:14px;font-weight:600;color:#6f7468;padding:8px 14px;border-radius:999px;white-space:nowrap;background:transparent;border:none;cursor:pointer;transition:background .15s ease,color .15s ease}
        .mn-link:hover{color:#3d5c3b;background:rgba(88,129,87,0.08)}
        .mn-on{color:#3d5c3b;background:rgba(88,129,87,0.14)}
        .mn-on:hover{background:rgba(88,129,87,0.18)}
        .mn-link-btn.mn-open{color:#3d5c3b;background:rgba(88,129,87,0.08)}
        .mn-caret{transition:transform .15s ease;opacity:.7}
        .mn-link-btn.mn-open .mn-caret{transform:rotate(180deg)}
        .mn-drop{position:relative;flex:0 0 auto}
        .mn-right{justify-content:flex-end;gap:6px}
        .mn-acct{position:relative}
        .mn-avatar{display:grid;place-items:center;width:36px;height:36px;border-radius:50%;border:1px solid rgba(61,92,59,0.25);background:#eef1e9;cursor:pointer;padding:0;overflow:hidden}
        .mn-avatar:hover{border-color:rgba(88,129,87,0.5)}
        .mn-avatar-img{width:100%;height:100%;object-fit:cover;display:block}
        .mn-avatar-initial{font-family:inherit;font-size:15px;font-weight:700;color:#3d5c3b}
        .mn-menu{position:absolute;top:calc(100% + 8px);right:0;min-width:210px;background:#fffdf9;border:1px solid rgba(61,92,59,0.14);border-radius:12px;box-shadow:0 20px 40px -16px rgba(45,58,46,0.35);padding:6px;z-index:70;animation:mnPop .14s ease}
        .mn-menu-wide{min-width:250px}
        @keyframes mnPop{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
        .mn-menu-head{padding:8px 10px 10px;border-bottom:1px solid rgba(61,92,59,0.1);margin-bottom:4px}
        .mn-menu-name{font-size:13.5px;font-weight:700;color:#2b2a26}
        .mn-menu-email{font-size:12px;color:#8a877c;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:220px}
        .mn-menu-item{display:flex;align-items:center;gap:9px;width:100%;text-align:left;text-decoration:none;font-family:inherit;font-size:13.5px;font-weight:600;color:#4a4a44;background:transparent;border:none;border-radius:8px;padding:9px 10px;cursor:pointer;transition:background .12s ease,color .12s ease}
        .mn-menu-item:hover{background:rgba(88,129,87,0.09);color:#3d5c3b}
        .mn-menu-item svg{flex:0 0 auto;opacity:.75}
        .mn-ext{opacity:.5;margin-left:4px;vertical-align:-1px}
        .mn-menu-item-label{display:inline-flex;align-items:center}
        .mn-menu-item-rich{flex-direction:column;align-items:flex-start;gap:1px}
        .mn-menu-item-label{font-size:13.5px;font-weight:700;color:#2b2a26}
        .mn-menu-item-rich:hover .mn-menu-item-label{color:#3d5c3b}
        .mn-menu-item-desc{font-size:11.5px;font-weight:500;color:#8a877c}
        .mn-only-mobile{display:none}
        .mn-menu-sep{height:1px;background:rgba(61,92,59,0.1);margin:6px 6px}
        .mn-menu-label{font-size:10.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#9a978c;padding:4px 10px 2px}
        @media (max-width:520px){
          .mn-inner{gap:6px;padding:0 12px}
          .mn-link{font-size:13.5px;padding:7px 10px}
          .mn-spacer{display:none}
          .mn-drop{display:none}       /* Resources moves into the avatar menu */
          .mn-only-mobile{display:block}
        }
        @media print{.mn-nav{display:none}}
      `}</style>
    </nav>
  );
}
