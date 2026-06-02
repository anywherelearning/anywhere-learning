'use client';

import { useState, useCallback, useEffect } from 'react';
import DashboardToday from './DashboardToday';
import DashboardTracker from './DashboardTracker';
import DashboardCalendar from './DashboardCalendar';
import DashboardPlan, { type PlanSubTab } from './DashboardPlan';
import FamilyManager from './FamilyManager';
import { ToastProvider } from './Toast';
import { fetchChildren } from './dashboard-api';
import { ALIcons, ALTokens, ChildAvatar } from './dashboard-shared';
import type { Child } from './dashboard-types';

const TABS = [
  { key: 'today', label: 'Today' },
  { key: 'plan', label: 'Plan' },
  { key: 'log', label: 'Activity Log' },
  { key: 'calendar', label: 'Calendar' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

// Icon + bottom-nav label per tab. Editorial top bar stays text-only,
// the phone bottom nav gets icon + label so it reads at a glance.
const TAB_META: Record<TabKey, { Icon: typeof ALIcons.Sun; mobileLabel: string }> = {
  today:    { Icon: ALIcons.Sun,  mobileLabel: 'Today' },
  plan:     { Icon: ALIcons.Path, mobileLabel: 'Plan' },
  log:      { Icon: ALIcons.Book, mobileLabel: 'Log' },
  calendar: { Icon: ALIcons.Cal,  mobileLabel: 'Calendar' },
};

/**
 * Selected-kid focus is `null` for the "All kids" / family-wide view, or a
 * specific child id for a focused single-kid view. The selection persists
 * across tab switches but resets on page reload — keeping URLs shareable
 * and the default state always inclusive.
 */
type FocusedKidId = string | null;

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const [children, setChildren] = useState<Child[]>([]);
  const [familyOpen, setFamilyOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [focusedKidId, setFocusedKidId] = useState<FocusedKidId>(null);
  // Plan tab's sub-tab lives here so sibling tabs (Today's "Browse the full
  // library" CTA, etc.) can deep-link into a specific sub-view via jumpToTab.
  const [planSubTab, setPlanSubTab] = useState<PlanSubTab>('ai');

  useEffect(() => {
    fetchChildren()
      .then((rows) => {
        setChildren(rows);
        setLoaded(true);
      })
      .catch((err) => {
        console.error(err);
        setLoaded(true);
      });
  }, []);

  // Accepts an optional `subTab` so callers can land directly on a Plan
  // sub-view in one click (e.g. Today's "Browse the full library" → library).
  const jumpToTab = useCallback((tab: TabKey, subTab?: PlanSubTab) => {
    setActiveTab(tab);
    if (tab === 'plan' && subTab) setPlanSubTab(subTab);
  }, []);

  // If the currently-focused kid is removed via FamilyManager, drop back to All.
  useEffect(() => {
    if (focusedKidId && !children.some((c) => c.id === focusedKidId)) {
      setFocusedKidId(null);
    }
  }, [children, focusedKidId]);

  return (
    <ToastProvider>
      <div
        className="dashboard-root min-h-screen"
        style={{
          background: ALTokens.color.cream,
          color: ALTokens.color.ink,
          fontFamily: ALTokens.font,
        }}
      >
        {/* ─── Almanac top bar: hairline divider, gold underline on active tab ─── */}
        <div
          className="sticky z-40 al-topbar"
          style={{
            top: 71,
            background: 'rgba(250,249,246,0.92)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderBottom: `1px solid ${ALTokens.color.line}`,
          }}
        >
          <div
            className="mx-auto flex items-center justify-between gap-3 al-topbar-inner"
            style={{
              maxWidth: 1120,
              padding: '0 16px',
              minHeight: 60,
            }}
          >
            {/* Desktop tabs (hidden on phone where BottomNav takes over) */}
            <nav
              className="al-top-tabs"
              aria-label="Dashboard sections"
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {TABS.map((tab) => {
                const on = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    aria-current={on ? 'page' : undefined}
                    className="cursor-pointer"
                    style={{
                      position: 'relative',
                      padding: '18px 10px',
                      background: 'none',
                      border: 'none',
                      fontFamily: ALTokens.font,
                      fontSize: 15,
                      fontWeight: on ? 700 : 500,
                      color: on ? ALTokens.color.forestInk : ALTokens.color.muted,
                      transition: `color 160ms ${ALTokens.ease}`,
                    }}
                  >
                    {tab.label}
                    {on && (
                      <span
                        aria-hidden
                        style={{
                          position: 'absolute',
                          left: 10,
                          right: 10,
                          bottom: 0,
                          height: 2,
                          background: ALTokens.color.gold,
                          borderRadius: 2,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Mobile: current tab label + icon, swap for the BottomNav at the bottom */}
            <div
              className="al-mobile-title"
              style={{ display: 'none', alignItems: 'center', gap: 10 }}
            >
              {(() => {
                const meta = TAB_META[activeTab];
                return (
                  <>
                    <meta.Icon size={20} color={ALTokens.color.forest} />
                    <span
                      style={{
                        fontSize: 17,
                        fontWeight: 700,
                        color: ALTokens.color.ink,
                      }}
                    >
                      {TABS.find((t) => t.key === activeTab)?.label}
                    </span>
                  </>
                );
              })()}
            </div>

            {/* Family setup pill (always visible on the right) */}
            <button
              type="button"
              onClick={() => setFamilyOpen(true)}
              aria-label="Family setup"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: children.length > 0 ? '5px 14px 5px 6px' : '7px 14px',
                background: ALTokens.color.paper,
                border: `1px solid ${ALTokens.color.line}`,
                borderRadius: ALTokens.radius.pill,
                cursor: 'pointer',
                fontFamily: ALTokens.font,
                fontSize: 13.5,
                fontWeight: 600,
                color: ALTokens.color.ink,
                transition: `all 160ms ${ALTokens.ease}`,
                flexShrink: 0,
              }}
            >
              {children.length > 0 ? (
                <>
                  <span style={{ display: 'inline-flex' }}>
                    {children.slice(0, 3).map((c, i) => (
                      <span
                        key={c.id}
                        style={{
                          marginLeft: i === 0 ? 0 : -6,
                          border: `2px solid ${ALTokens.color.paper}`,
                          borderRadius: '50%',
                          display: 'inline-flex',
                        }}
                      >
                        <ChildAvatar child={c} size={22} />
                      </span>
                    ))}
                  </span>
                  <span className="hidden sm:inline">
                    {children.length} {children.length === 1 ? 'kid' : 'kids'}
                  </span>
                </>
              ) : (
                <>
                  <ALIcons.Plus size={14} color={ALTokens.color.forest} />
                  <span>Set up family</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Kid focus strip (only when 2+ kids). Hairline divider, pill chips. */}
        {children.length >= 2 && (
          <div
            className="sticky z-30 al-focus-strip"
            style={{
              top: 'calc(71px + 61px)',
              background: 'rgba(250,249,246,0.88)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderBottom: `1px solid ${ALTokens.color.line}`,
              padding: '8px 16px',
            }}
          >
            <div
              className="mx-auto flex items-center gap-2 overflow-x-auto"
              style={{ maxWidth: 1120 }}
              role="tablist"
              aria-label="Focus dashboard on a specific kid"
            >
              <span
                className="hidden sm:inline shrink-0 mr-1"
                style={{
                  fontFamily: ALTokens.font,
                  fontSize: 11,
                  letterSpacing: '.18em',
                  textTransform: 'uppercase',
                  color: ALTokens.color.goldDark,
                  fontWeight: 700,
                }}
              >
                Focus
              </span>
              <KidPill
                active={focusedKidId === null}
                onClick={() => setFocusedKidId(null)}
                label="Family"
              />
              {children.map((child) => (
                <KidPill
                  key={child.id}
                  active={focusedKidId === child.id}
                  onClick={() => setFocusedKidId(child.id)}
                  label={child.name}
                  child={child}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab content with a soft cross-fade per tab switch */}
        <div
          key={activeTab}
          className="px-4 md:px-8 py-6 md:py-10 al-tab-pane"
          style={{ animation: `al-fade 320ms ${ALTokens.ease}` }}
        >
          {activeTab === 'today' && (
            <DashboardToday
              onJumpToTab={jumpToTab}
              children={children}
              focusedKidId={focusedKidId}
              onChildrenChange={setChildren}
              onOpenFamilySetup={() => setFamilyOpen(true)}
              initialLoaded={loaded}
            />
          )}
          {activeTab === 'plan' && (
            <DashboardPlan
              children={children}
              focusedKidId={focusedKidId}
              onChildrenChange={setChildren}
              onOpenFamilySetup={() => setFamilyOpen(true)}
              subTab={planSubTab}
              onSubTabChange={setPlanSubTab}
            />
          )}
          {activeTab === 'log' && (
            <DashboardTracker
              onJumpToTab={jumpToTab}
              children={children}
              focusedKidId={focusedKidId}
              onFocusedKidChange={setFocusedKidId}
              onChildrenChange={setChildren}
              onOpenFamilySetup={() => setFamilyOpen(true)}
            />
          )}
          {activeTab === 'calendar' && (
            <DashboardCalendar
              onJumpToTab={jumpToTab}
              children={children}
              focusedKidId={focusedKidId}
              onChildrenChange={setChildren}
              onOpenFamilySetup={() => setFamilyOpen(true)}
            />
          )}
        </div>

        {/* Phone bottom nav (hidden on desktop via CSS) */}
        <nav
          className="al-bottom-nav"
          aria-label="Dashboard sections"
          style={{
            position: 'sticky',
            bottom: 0,
            zIndex: 40,
            background: 'rgba(250,249,246,0.95)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderTop: `1px solid ${ALTokens.color.line}`,
            display: 'none',
            justifyContent: 'space-around',
            alignItems: 'stretch',
            padding: '6px 4px calc(6px + env(safe-area-inset-bottom))',
          }}
        >
          {TABS.map((tab) => {
            const on = activeTab === tab.key;
            const meta = TAB_META[tab.key];
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                aria-current={on ? 'page' : undefined}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  padding: '7px 2px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: ALTokens.font,
                  fontSize: 10.5,
                  fontWeight: on ? 700 : 500,
                  color: on ? ALTokens.color.forest : ALTokens.color.muted,
                }}
              >
                <meta.Icon
                  size={21}
                  color={on ? ALTokens.color.forest : ALTokens.color.muted}
                />
                {meta.mobileLabel}
              </button>
            );
          })}
        </nav>

        <FamilyManager
          open={familyOpen}
          onClose={() => setFamilyOpen(false)}
          children={children}
          onChange={setChildren}
        />
      </div>
    </ToastProvider>
  );
}

/**
 * Kid focus pill in the Almanac aesthetic. "Family" uses a leaf glyph,
 * specific kids show their illustrated avatar. Active pill fills with
 * the forest wash; inactive stays cream on a hairline.
 */
function KidPill({
  active,
  onClick,
  label,
  child,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  child?: Child;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      style={{
        appearance: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        cursor: 'pointer',
        background: active ? 'rgba(88,129,87,0.10)' : ALTokens.color.paper,
        border: `1px solid ${active ? ALTokens.color.forest : ALTokens.color.line}`,
        color: active ? ALTokens.color.forestInk : ALTokens.color.body,
        fontFamily: ALTokens.font,
        fontWeight: active ? 700 : 600,
        fontSize: 13,
        padding: child ? '4px 13px 4px 5px' : '7px 14px',
        borderRadius: ALTokens.radius.pill,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        transition: `all 150ms ${ALTokens.ease}`,
      }}
    >
      {child ? (
        <ChildAvatar child={child} size={22} />
      ) : (
        <ALIcons.Leaf
          size={13}
          color={active ? ALTokens.color.forest : ALTokens.color.muted}
        />
      )}
      {label}
    </button>
  );
}
