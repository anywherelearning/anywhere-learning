'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCapacitor } from './CapacitorProvider';

// ── Inline SVG icons ────────────────────────────────────────────

function ShopIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? '#588157' : '#9ca3af'}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Shopping bag */}
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function LibraryIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? '#588157' : '#9ca3af'}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Open book */}
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
    </svg>
  );
}

function AccountIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? '#588157' : '#9ca3af'}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* User silhouette */}
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// ── Tab definitions ─────────────────────────────────────────────

interface Tab {
  label: string;
  href: string;
  icon: (props: { active: boolean }) => React.JSX.Element;
  isActive: (pathname: string) => boolean;
}

const tabs: Tab[] = [
  {
    label: 'Shop',
    href: '/shop',
    icon: ShopIcon,
    isActive: (p) => p.startsWith('/shop'),
  },
  {
    label: 'Library',
    href: '/library',
    icon: LibraryIcon,
    isActive: (p) => p.startsWith('/library'),
  },
  {
    label: 'Account',
    href: '/app-account',
    icon: AccountIcon,
    isActive: (p) => p.startsWith('/app-account') || p.startsWith('/app-login'),
  },
];

// ── Component ───────────────────────────────────────────────────

export default function MobileTabBar() {
  const { isNative } = useCapacitor();
  const pathname = usePathname();

  // Only render inside the Capacitor native shell
  if (!isNative) return null;

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: '#faf9f6',
        borderTop: '1px solid #e5e2dc',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'space-around',
        height: `calc(56px + env(safe-area-inset-bottom, 0px))`,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        fontFamily: "'DM Sans', sans-serif",
        // Prevent content from sitting behind the bar
        WebkitBackdropFilter: 'saturate(180%) blur(12px)',
        backdropFilter: 'saturate(180%) blur(12px)',
      }}
    >
      {tabs.map((tab) => {
        const active = tab.isActive(pathname);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.label}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            aria-label={tab.label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              height: '56px',
              gap: '2px',
              textDecoration: 'none',
              color: active ? '#588157' : '#9ca3af',
              transition: 'color 0.2s ease',
              WebkitTapHighlightColor: 'transparent',
              // Prevent text selection on rapid taps
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            <Icon active={active} />
            <span
              style={{
                fontSize: '10px',
                fontWeight: active ? 600 : 500,
                lineHeight: 1,
                letterSpacing: '0.01em',
                transition: 'color 0.2s ease, font-weight 0.2s ease',
              }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
