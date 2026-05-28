'use client';

import { useState, useCallback, useEffect } from 'react';
import DashboardToday from './DashboardToday';
import DashboardTracker from './DashboardTracker';
import DashboardCalendar from './DashboardCalendar';
import DashboardPlan from './DashboardPlan';
import FamilyManager from './FamilyManager';
import { ToastProvider } from './Toast';
import { fetchChildren } from './dashboard-api';
import { ChildAvatar } from './dashboard-shared';
import type { Child } from './dashboard-types';

const TABS = [
  { key: 'today', label: 'Today' },
  { key: 'plan', label: 'Plan' },
  { key: 'log', label: 'Activity Log' },
  { key: 'calendar', label: 'Calendar' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

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

  const jumpToTab = useCallback((tab: TabKey) => setActiveTab(tab), []);

  // If the currently-focused kid is removed via FamilyManager, drop back to All.
  useEffect(() => {
    if (focusedKidId && !children.some((c) => c.id === focusedKidId)) {
      setFocusedKidId(null);
    }
  }, [children, focusedKidId]);

  return (
    <ToastProvider>
    <div className="dashboard-root min-h-screen bg-cream font-sans text-forest">
      {/* Tab bar with family setup button */}
      <div className="sticky top-[71px] z-40 border-b border-forest/10 bg-cream px-4 md:px-8">
        <div className="flex gap-0 items-center dashboard-tabs">
          <div className="flex gap-0 flex-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === tab.key
                    ? 'border-forest text-forest font-semibold'
                    : 'border-transparent text-forest/50 hover:text-forest/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setFamilyOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-forest/70 hover:text-forest cursor-pointer rounded-full border border-forest/10 hover:border-forest/30 transition-colors"
            style={{ fontFamily: '"DM Sans"' }}
            aria-label="Family setup"
          >
            {children.length > 0 ? (
              <>
                <span className="flex -space-x-1.5">
                  {children.slice(0, 3).map((c) => (
                    <span key={c.id} style={{ border: '2px solid #faf9f6', borderRadius: '50%', display: 'inline-flex' }}>
                      <ChildAvatar child={c} size={20} />
                    </span>
                  ))}
                </span>
                <span className="hidden sm:inline">
                  {children.length} {children.length === 1 ? 'kid' : 'kids'}
                </span>
              </>
            ) : (
              <>
                <span aria-hidden style={{ fontSize: 14 }}>👪</span>
                <span>Set up family</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Kid-context strip — appears below the tab bar when 2+ kids exist.
          Lets the user focus the whole dashboard on a single kid.
          Hidden when there's 0 or 1 kid (no useful choice). */}
      {children.length >= 2 && (
        <div className="sticky z-30 border-b border-forest/10 bg-cream/80 backdrop-blur-sm px-4 md:px-8 py-2"
             style={{ top: 'calc(71px + 49px)' }}>
          <div
            className="flex items-center gap-2 overflow-x-auto"
            role="tablist"
            aria-label="Focus dashboard on a specific kid"
          >
            <span
              className="hidden sm:inline shrink-0 mr-1"
              style={{
                fontFamily: '"DM Sans"',
                fontSize: 11,
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: '#7B8378',
                fontWeight: 500,
              }}
            >
              Focus
            </span>
            <KidPill
              active={focusedKidId === null}
              onClick={() => setFocusedKidId(null)}
              label="Family Activity"
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

      {/* Tab content */}
      <div className="px-4 md:px-8 py-6 md:py-10">
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
 * Kid focus pill. "All kids" shows a small house glyph; specific kid shows
 * their avatar (color + emoji/initial). Active state uses the kid's color
 * for the border so it's visually unique per child.
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
  const accent = child?.color || '#588157';
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className="flex items-center gap-1.5 shrink-0 transition-colors"
      style={{
        appearance: 'none',
        cursor: 'pointer',
        background: active ? `${accent}1A` : 'transparent',
        border: `1px solid ${active ? accent : '#E5E0D2'}`,
        color: active ? accent : '#4F5A50',
        fontFamily: '"DM Sans"',
        fontWeight: active ? 600 : 500,
        fontSize: 12.5,
        padding: child ? '3px 12px 3px 4px' : '6px 12px',
        borderRadius: 999,
        whiteSpace: 'nowrap',
      }}
    >
      {child ? (
        <ChildAvatar child={child} size={20} />
      ) : (
        <span aria-hidden style={{ fontSize: 12, marginLeft: 2 }}>◇</span>
      )}
      {label}
    </button>
  );
}
