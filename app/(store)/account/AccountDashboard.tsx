'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import TrialCapModal from '@/components/account/TrialCapModal';
import AddToWeekButton from '@/components/account/AddToWeekButton';
import FirstRunRedirect from '@/components/account/FirstRunRedirect';
import HeroScene from '@/components/account/HeroScene';
import { TERRITORIES, territoriesForSlug } from '@/lib/roadmap';
import { completionLog } from '@/lib/completions';
import { addToWeek, FAMILY_TARGET } from '@/lib/week';
import { effortFor } from '@/lib/activity-effort';
import { notifyLocalChanged } from '@/lib/account-sync';
import { DOWNLOAD_CAP_WINDOW_DAYS, IS_FOUNDER_PHASE, MEMBERSHIP_PRICE_YEAR } from '@/lib/membership';

export interface DashboardActivity {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categoryLabel: string;
  trackColor: string;
  trackDeep: string;
  ageRange: string;
  imageUrl?: string | null;
}

// 'guest' renders the full library as a preview; the account layout covers it
// with the soft-paywall teaser. Guests are treated like members here (no trial
// banner, no download cap) since the teaser sits on top regardless.
type Tier = 'member' | 'trial' | 'guest';

export interface TrialInfo {
  /** ISO date the trial converts to a paid membership. */
  endsAt: string;
  /** Whether this trial member locked the founder rate (for upgrade copy). */
  isFounder: boolean;
  /** Plan-correct upgrade price, e.g. "$99/year" or "$15/month". */
  priceLabel?: string;
}

interface Props {
  userName: string;
  tier: Tier;
  activities: DashboardActivity[];
  trial?: TrialInfo | null;
  /** Open the upgrade-to-download modal on mount (e.g. server bounced a
   *  direct download URL back here with ?reason=trial-upgrade-to-download). */
  initialCapModal?: boolean;
  /** Set when the download endpoint bounced a member here for hitting the
   *  rolling download cap (?reason=download-cap). Renders the banner. */
  downloadCap?: { used: number; cap: number; resetsAt: string | null } | null;
}

const AGE_OPTIONS = ['All ages', '6–8', '8–10', '10–12', '12–14'];

// Area filter options — the 12 Future-Ready Skills Map areas (one taxonomy
// across the member Library, Record, and Focus areas). An activity builds
// several, so it appears under each area it develops.
const TERR = new Map(TERRITORIES.map((t) => [t.slug, t]));
/** The Skills-Map areas an activity builds, as territory defs (ordered). */
function areasOf(slug: string) {
  return territoriesForSlug(slug)
    .map((s) => TERR.get(s))
    .filter((t): t is (typeof TERRITORIES)[number] => !!t);
}
// Sentinel for the travel-only worldschooling filter. It's a shop category,
// not one of the 12 Skills-Map areas, so it can't clash with a territory slug.
const WORLDSCHOOLING_FILTER = 'worldschooling';

const TRACK_OPTIONS = [
  { value: '', label: 'All areas' },
  ...TERRITORIES.map((t) => ({ value: t.slug, label: t.name })),
  { value: WORLDSCHOOLING_FILTER, label: 'Worldschooling · travel' },
];

type LibFilter = 'all' | 'done' | 'todo' | 'saved';
const STATUS_OPTIONS: { value: LibFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'todo', label: 'To do' },
  { value: 'done', label: 'Done' },
  { value: 'saved', label: 'Saved' },
];

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'recent', label: 'Recently added' },
  { value: 'az', label: 'Alphabetical' },
];

/** Parse "Ages 8-14" → [8, 14]. Returns nulls if unparseable. */
function parseAge(range: string): [number, number] | null {
  const m = range.replace(/–/g, '-').match(/(\d+)\s*-\s*(\d+)/);
  if (!m) return null;
  return [parseInt(m[1], 10), parseInt(m[2], 10)];
}

function ageMatches(activityRange: string, filter: string): boolean {
  if (filter === 'All ages') return true;
  const ageRange = parseAge(activityRange);
  const filterRange = parseAge(filter);
  if (!ageRange || !filterRange) return true;
  return !(ageRange[0] > filterRange[1] || ageRange[1] < filterRange[0]);
}

const STORAGE_KEY = 'al_account_state_v1';

interface PersistedState {
  pinned: Record<string, boolean>;
}

function loadState(): PersistedState {
  if (typeof window === 'undefined') return { pinned: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { pinned: {} };
    const parsed = JSON.parse(raw) as { pinned?: Record<string, boolean> };
    return { pinned: parsed.pinned ?? {} };
  } catch {
    return { pinned: {} };
  }
}

function saveState(state: PersistedState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    notifyLocalChanged();
  } catch {
    /* ignore quota errors */
  }
}

export default function AccountDashboard({
  userName,
  tier,
  activities,
  trial,
  initialCapModal,
  downloadCap,
}: Props) {
  const [doneSet, setDoneSet] = useState<Set<string>>(new Set()); // completed on the trail
  const [pinned, setPinned] = useState<Record<string, boolean>>({});
  const [savedAdded, setSavedAdded] = useState<string | null>(null); // "added to trail" flash
  const [capModalOpen, setCapModalOpen] = useState(!!initialCapModal);
  const [capBannerOpen, setCapBannerOpen] = useState(!!downloadCap);
  const [skillsMapOpen, setSkillsMapOpen] = useState(false); // hero Skills Map menu
  const [filtersOpen, setFiltersOpen] = useState(false); // phones: the fold-out filter panel

  // Trial members are view-only: any download click opens the upgrade modal.
  // Members navigate straight to the file.
  function handleDownloadClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (tier !== 'trial') return;
    e.preventDefault();
    setCapModalOpen(true);
  }

  // Filters
  const [query, setQuery] = useState('');
  const [trackFilter, setTrackFilter] = useState('');
  const [ageFilter, setAgeFilter] = useState('All ages');
  const [statusFilter, setStatusFilter] = useState<LibFilter>('all');
  const [sort, setSort] = useState('recommended');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const s = loadState();
    setPinned(s.pinned);
    // "Done" mirrors the trail: an activity the family completed shows as done
    // here. Read-only — you finish activities on the trail, not in the library.
    setDoneSet(new Set(completionLog().map((l) => l.slug)));
  }, []);

  // Persist pins — but skip the initial render so we don't overwrite stored
  // pins with the empty default before hydration runs.
  const pinsHydrated = useRef(false);
  useEffect(() => {
    if (!pinsHydrated.current) { pinsHydrated.current = true; return; }
    saveState({ pinned });
  }, [pinned]);

  const togglePin = (slug: string) => {
    setPinned((prev) => {
      const out = { ...prev };
      if (out[slug]) delete out[slug];
      else out[slug] = true;
      return out;
    });
  };

  // Derived stats
  const totalActivities = activities.length;
  const doneCount = activities.filter((a) => doneSet.has(a.slug)).length;
  const pinnedCount = Object.keys(pinned).length;

  // How many activities build each Skills-Map area (sidebar counts).
  const areaCounts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const a of activities) {
      for (const t of territoriesForSlug(a.slug)) out[t] = (out[t] ?? 0) + 1;
      if (a.category === WORLDSCHOOLING_FILTER) out[WORLDSCHOOLING_FILTER] = (out[WORLDSCHOOLING_FILTER] ?? 0) + 1;
    }
    return out;
  }, [activities]);

  // "Saved" strip — activities the parent bookmarked, capped at 6.
  const continueItems = useMemo(() => {
    return activities.filter((a) => pinned[a.slug]).slice(0, 6);
  }, [activities, pinned]);

  // Filtered list
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = activities.filter((a) => {
      if (q && !a.title.toLowerCase().includes(q) && !a.excerpt.toLowerCase().includes(q)) {
        return false;
      }
      if (trackFilter === WORLDSCHOOLING_FILTER) {
        if (a.category !== WORLDSCHOOLING_FILTER) return false;
      } else if (trackFilter && !territoriesForSlug(a.slug).includes(trackFilter)) {
        return false;
      }
      if (!ageMatches(a.ageRange, ageFilter)) return false;
      if (statusFilter === 'done' && !doneSet.has(a.slug)) return false;
      if (statusFilter === 'todo' && doneSet.has(a.slug)) return false;
      if (statusFilter === 'saved' && !pinned[a.slug]) return false;
      return true;
    });
    if (sort === 'az') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'recent') {
      // "Recently added" = reverse of catalog order, which getFallbackProducts()
      // returns oldest-first. If that source order ever changes, revisit this.
      list = [...list].reverse();
    }
    return list;
  }, [activities, query, trackFilter, ageFilter, statusFilter, sort, doneSet, pinned]);

  // Reset to page 1 whenever the filtered set changes (filters, sort, search).
  useEffect(() => {
    setPage(1);
  }, [query, trackFilter, ageFilter, statusFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedItems = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );

  // Jump to a page + scroll the list anchor into view. rAF defers the scroll
  // until after React has flushed the new list — without it, the smooth-scroll
  // animation gets cancelled by layout shift on boundary clicks (Prev → 1,
  // Next → last), which is why those weren't scrolling before.
  function goToPage(p: number) {
    setPage(p);
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        document
          .getElementById('library-top')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  const activeFilterPills: { label: string; clear: () => void }[] = [];
  if (trackFilter) {
    activeFilterPills.push({
      label: TRACK_OPTIONS.find((t) => t.value === trackFilter)?.label || trackFilter,
      clear: () => setTrackFilter(''),
    });
  }
  if (ageFilter !== 'All ages') {
    activeFilterPills.push({ label: ageFilter, clear: () => setAgeFilter('All ages') });
  }
  if (statusFilter !== 'all') {
    activeFilterPills.push({
      label: STATUS_OPTIONS.find((s) => s.value === statusFilter)?.label || statusFilter,
      clear: () => setStatusFilter('all'),
    });
  }

  const trialEndsLabel = trial
    ? new Date(trial.endsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    : '';

  return (
    <>
    <FirstRunRedirect hasAccess={tier !== 'guest'} />
    <main className="pb-4 sm:pb-12" style={{ background: 'linear-gradient(180deg,var(--am-bg1),var(--am-bg2))' }}>
      {/* TRIAL STRIP: viewing is unlimited; downloading requires membership.
          The strip doubles as the easy upgrade entry point. */}
      {tier === 'trial' && trial && (
        <div className="border-b border-[#C9D3BE] bg-[#E6EBDF]">
          <div className="mx-auto max-w-[1180px] px-6 py-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[13.5px] text-forest-dark">
            <span className="font-body">
              <strong className="font-semibold">Free trial</strong>
              <Sep />
              Read every guide in your browser
              <Sep />
              Membership starts {trialEndsLabel}
            </span>
            <button
              type="button"
              onClick={() => setCapModalOpen(true)}
              className="tap inline-flex items-center gap-1.5 bg-forest text-cream font-body font-semibold text-[12.5px] py-1.5 px-3.5 rounded-full border-0 cursor-pointer hover:bg-forest-dark transition-colors whitespace-nowrap"
            >
              Subscribe now to download
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </div>
      )}
      {/* DOWNLOAD CAP STRIP: a member tried to download past the rolling
          cap. Reading stays unlimited; say when a slot frees up. */}
      {tier === 'member' && downloadCap && capBannerOpen && (
        <div className="border-b border-[#E8D4C2] bg-[#F7EBE2]" role="status">
          <div className="mx-auto max-w-[1180px] px-6 py-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[13.5px] text-[#7A3D24]">
            <span className="font-body">
              <strong className="font-semibold">Download limit reached</strong>
              <Sep />
              You&apos;ve saved {downloadCap.cap} different guides in the last {DOWNLOAD_CAP_WINDOW_DAYS} days
              <Sep />
              {downloadCap.resetsAt
                ? `Next download opens ${new Date(downloadCap.resetsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
                : 'More open up as older downloads age out'}
              <Sep />
              Keep reading every guide in your browser, as much as you like
            </span>
            <button
              type="button"
              onClick={() => setCapBannerOpen(false)}
              className="inline-flex items-center bg-transparent border border-[#E8D4C2] text-[#7A3D24] font-body font-semibold text-[12.5px] py-1.5 px-3.5 rounded-full cursor-pointer hover:bg-[#F2DFD0] transition-colors whitespace-nowrap"
            >
              Got it
            </button>
          </div>
        </div>
      )}
      {/* HEADER — full-width band, sized to match This Month & Record */}
      {/* No overflow-hidden here: the Skills Map menu opens below its button,
          near this header's bottom edge, and clipping cut it off after the
          first item. The HeroScene below has its own overflow-hidden, which is
          the layer that actually needs it. */}
      <header className="relative" style={{ minHeight: 'clamp(150px,20vw,206px)', background: 'linear-gradient(180deg, var(--am-sky1), var(--am-sky2))', padding: 'clamp(18px,2.5vw,26px) clamp(16px,4vw,40px) clamp(26px,3vw,38px)' }}>
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <HeroScene tone="light" hillHeight={100} />
        </div>
        <div className="relative mx-auto max-w-[1180px] flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="font-[family-name:var(--font-catalog)] text-[11.5px] uppercase tracking-[0.14em] text-[var(--am-trail)] mb-2">
                Welcome back, {userName}
              </div>
              <h1 className="font-[family-name:var(--font-plate)] font-extrabold text-[clamp(32px,6vw,52px)] leading-[1.02] tracking-[-0.02em] text-ink">
                Your{' '}
                <em className="not-italic text-forest">
                  library.
                </em>
              </h1>
              <p className="mt-2 font-body text-[13px] text-gray-500 tracking-wide">
                {totalActivities} activities
                <Sep />
                {doneCount} done
                {pinnedCount > 0 && (
                  <>
                    <Sep />
                    {pinnedCount} saved
                  </>
                )}
              </p>
            </div>
            <div className="relative flex items-center gap-x-3.5 gap-y-1 flex-wrap text-[13.5px]">
              <button
                type="button"
                onClick={() => setSkillsMapOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={skillsMapOpen}
                title="Open the Future-Ready Skills Map"
                className="inline-flex items-center gap-1.5 bg-forest text-cream font-body font-semibold py-2 px-4 rounded-lg hover:bg-forest-dark transition-colors cursor-pointer"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4z" />
                  <path d="M9 4v13M15 6.5v13" />
                </svg>
                Skills Map
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`transition-transform ${skillsMapOpen ? 'rotate-180' : ''}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {skillsMapOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSkillsMapOpen(false)} aria-hidden="true" />
                  <div role="menu" className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-[rgba(58,44,23,0.14)] bg-[var(--am-paper)] p-1.5 shadow-[0_20px_44px_-16px_rgba(45,58,46,0.5)]">
                    <div className="px-2.5 pt-1.5 pb-1 font-[family-name:var(--font-catalog)] text-[10px] uppercase tracking-[0.12em] text-gold-dark">Open the Skills Map</div>
                    <Link
                      href="/api/download/activity/skills-map-color?view=1"
                      target="_blank"
                      rel="noopener noreferrer"
                      prefetch={false}
                      onClick={() => setSkillsMapOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 no-underline text-ink font-body text-[13.5px] font-medium hover:bg-[#F2EFE4] transition-colors"
                    >
                      <span className="w-4 h-4 rounded-full" style={{ background: 'linear-gradient(135deg,#B6913F,#c4836a)' }} aria-hidden="true" />
                      Full color
                    </Link>
                    <Link
                      href="/api/download/activity/skills-map-bw?view=1"
                      target="_blank"
                      rel="noopener noreferrer"
                      prefetch={false}
                      onClick={() => setSkillsMapOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 no-underline text-ink font-body text-[13.5px] font-medium hover:bg-[#F2EFE4] transition-colors"
                    >
                      <span className="w-4 h-4 rounded-full border border-[rgba(58,44,23,0.25)]" style={{ background: 'linear-gradient(135deg,#e8e6df,#9a968c)' }} aria-hidden="true" />
                      Black &amp; white
                      <span className="ml-auto text-[11px] text-gray-500">print</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

      {/* Anchor for the paginator to scroll back to. */}
      <div id="library-top" className="scroll-mt-[70px]" aria-hidden="true" />

      <div className="lib-wrap mx-auto max-w-[1180px] px-4 sm:px-6 pt-6 sm:pt-8">
        {/* ── SIDEBAR: search + filters (a fold-out panel on phones) ── */}
        <aside className="lib-side">
          <label className="relative block">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search activities..."
              aria-label="Search activities"
              className="appearance-none w-full border border-[rgba(58,44,23,0.14)] bg-[#fffdf8] rounded-full py-2.5 pr-4 pl-10 font-body text-[14px] text-ink outline-none focus:shadow-[0_0_0_1px_var(--color-forest),0_0_0_4px_rgba(88,129,87,0.18)] transition-shadow"
            />
          </label>

          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
            className="lib-filters-toggle mt-3 w-full items-center justify-between rounded-full border border-[rgba(58,44,23,0.14)] bg-[#fffdf8] py-2.5 px-4 font-body font-semibold text-[14px] text-ink cursor-pointer"
          >
            <span>Filters{activeFilterPills.length > 0 ? ` (${activeFilterPills.length})` : ''}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`transition-transform ${filtersOpen ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" /></svg>
          </button>

          <div className={`lib-filters${filtersOpen ? ' is-open' : ''}`}>
            <div className="lib-side-label">Skill areas</div>
            <div className="grid gap-0.5" role="group" aria-label="Skill area">
              {[{ value: '', label: 'All areas', color: '', n: totalActivities }, ...TERRITORIES.map((t) => ({ value: t.slug, label: t.name, color: t.color, n: areaCounts[t.slug] ?? 0 })), { value: WORLDSCHOOLING_FILTER, label: 'Worldschooling · travel', color: '#8A8470', n: areaCounts[WORLDSCHOOLING_FILTER] ?? 0 }].map((o) => {
                const on = trackFilter === o.value;
                return (
                  <button
                    key={o.value || 'all'}
                    type="button"
                    onClick={() => setTrackFilter(o.value)}
                    aria-pressed={on}
                    title={o.value === WORLDSCHOOLING_FILTER ? "Travel-based activities. Add these when you're on the road." : undefined}
                    className={`flex items-center gap-2.5 w-full text-left rounded-lg py-[7px] px-2.5 font-body text-[13.5px] border-0 cursor-pointer transition-colors ${on ? 'bg-[#e6ecdf] text-forest-dark font-semibold' : 'bg-transparent text-ink hover:bg-[rgba(58,44,23,0.05)]'}`}
                  >
                    {o.color && <span aria-hidden="true" className="w-[9px] h-[9px] rounded-full flex-none" style={{ background: o.color }} />}
                    <span className="min-w-0 flex-1">{o.label}</span>
                    <span className={`text-[12.5px] ${on ? 'text-forest-dark' : 'text-gray-500'}`}>{o.n}</span>
                  </button>
                );
              })}
            </div>

            <div className="lib-side-label">Ages</div>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Ages">
              {AGE_OPTIONS.map((a) => (
                <button key={a} type="button" onClick={() => setAgeFilter(a)} aria-pressed={ageFilter === a} className="lib-pill" data-on={ageFilter === a || undefined}>
                  {a === 'All ages' ? 'All' : a}
                </button>
              ))}
            </div>

            <div className="lib-side-label">Show</div>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Show">
              {STATUS_OPTIONS.map((s) => (
                <button key={s.value} type="button" onClick={() => setStatusFilter(s.value)} aria-pressed={statusFilter === s.value} className="lib-pill" data-on={statusFilter === s.value || undefined}>
                  {s.value === 'all' ? 'All' : s.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── MAIN: saved, then the list ── */}
        <div className="min-w-0">
          {continueItems.length > 0 && (
            <div className="mb-6">
              <div className="font-[family-name:var(--font-catalog)] text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--am-trail)] mb-2.5">★ Saved for later</div>
              <div className="flex gap-2.5 overflow-x-auto pb-1.5 -mx-1 px-1 scrollbar-thin">
                {continueItems.map((a) => {
                  const href = `/api/download/activity/${a.slug}?view=1`;
                  const flashed = savedAdded === a.slug;
                  return (
                    <div key={a.slug} className="flex-none flex items-center gap-3 bg-[#fffdf8] rounded-[14px] p-2.5 pr-4 shadow-[0_1px_0_rgba(58,44,23,0.06),0_14px_28px_-20px_rgba(58,44,23,0.45)]">
                      <Link href={href} target="_blank" rel="noopener noreferrer" prefetch={false} aria-label={`Open ${a.title}`} className="block w-11 aspect-[4/5] rounded-[5px] overflow-hidden bg-[var(--am-paper)] flex-none">
                        {a.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.imageUrl} alt="" loading="lazy" className="w-full h-full object-cover object-top" />
                        )}
                      </Link>
                      <div className="min-w-0">
                        <Link href={href} target="_blank" rel="noopener noreferrer" prefetch={false} className="tap block font-body font-bold text-[13.5px] leading-tight text-ink no-underline hover:text-forest-dark max-w-[220px] truncate">
                          {a.title}
                        </Link>
                        <div className="flex items-center gap-3 mt-1">
                          {effortFor(a.slug) && (
                            <button
                              type="button"
                              onClick={() => {
                                addToWeek(a.slug, [FAMILY_TARGET]);
                                notifyLocalChanged();
                                setSavedAdded(a.slug);
                                window.setTimeout(() => setSavedAdded((s) => (s === a.slug ? null : s)), 2600);
                              }}
                              className="tap bg-transparent border-0 p-0 cursor-pointer font-body font-semibold text-[12px] text-forest hover:text-forest-dark"
                            >
                              {flashed ? '✓ Added' : '+ Add to trail'}
                            </button>
                          )}
                          <button type="button" onClick={() => togglePin(a.slug)} className="tap bg-transparent border-0 p-0 cursor-pointer font-body text-[12px] text-gray-500 hover:text-[#C97B5C]">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <p className="m-0 font-body text-[13px] text-gray-500">
              {filtered.length === 0
                ? 'No activities match'
                : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort"
              className="bg-[#fffdf8] border border-[rgba(58,44,23,0.14)] rounded-full py-2 pl-4 pr-9 font-body text-[13px] text-ink cursor-pointer appearance-none"
              style={{
                backgroundImage: 'linear-gradient(45deg, transparent 50%, #4F5A50 50%), linear-gradient(135deg, #4F5A50 50%, transparent 50%)',
                backgroundPosition: 'calc(100% - 16px) 50%, calc(100% - 11px) 50%',
                backgroundSize: '5px 5px',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {activeFilterPills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              {activeFilterPills.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={p.clear}
                  className="inline-flex items-center gap-1.5 bg-[#F2DECF] text-[#7A3D24] font-body font-semibold text-[12px] px-2.5 py-1 rounded-full border-0 cursor-pointer hover:bg-[#E8D2C0] transition-colors"
                >
                  {p.label}
                  <span className="w-3.5 h-3.5 rounded-full bg-[#7A3D24] text-cream grid place-items-center text-[10px] leading-none">&times;</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => { setTrackFilter(''); setAgeFilter('All ages'); setStatusFilter('all'); setQuery(''); }}
                className="text-gray-500 font-body font-medium text-[12.5px] bg-transparent border-0 cursor-pointer underline decoration-gray-400/40 underline-offset-[3px] hover:text-forest-dark ml-1.5"
              >
                Clear all
              </button>
            </div>
          )}

          {filtered.length > 0 ? (
            <div className="bg-[#fffdf8] rounded-[18px] shadow-[0_1px_0_rgba(58,44,23,0.06),0_18px_36px_-22px_rgba(58,44,23,0.45)] overflow-hidden">
              {pagedItems.map((a, i) => {
                const isDone = doneSet.has(a.slug);
                const isPinned = !!pinned[a.slug];
                // Opening goes straight to the guide in the reader; the download
                // button uses the same endpoint without ?view=1.
                const activityHref = `/api/download/activity/${a.slug}?view=1`;
                const downloadHref = `/api/download/activity/${a.slug}`;
                const areas = areasOf(a.slug);
                const accent = areas[0]?.color ?? a.trackColor;
                return (
                  <div
                    key={a.slug}
                    className="lib-row group"
                    style={{ borderTop: i ? '1px solid rgba(58,44,23,0.08)' : 'none' }}
                  >
                    {/* cover, with a done badge */}
                    <Link
                      href={activityHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      prefetch={false}
                      aria-label={`Open ${a.title}`}
                      className="lib-cover relative block aspect-[4/5] rounded-[7px] no-underline"
                      style={{ background: accent + '14' }}
                    >
                      <span className="block w-full h-full rounded-[7px] overflow-hidden shadow-[0_1px_0_rgba(58,44,23,0.06),0_10px_20px_-12px_rgba(58,44,23,0.5)]">
                        {a.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.imageUrl} alt="" loading="lazy" className="w-full h-full object-cover object-top transition-transform duration-300 ease-out group-hover:scale-[1.05]" />
                        ) : (
                          <span aria-hidden="true" className="w-full h-full grid place-items-center font-[family-name:var(--font-plate)] text-[22px]" style={{ color: accent }}>{a.title.charAt(0)}</span>
                        )}
                      </span>
                      {isDone && (
                        <span aria-label="Completed" title="Completed on the trail" className="absolute -bottom-1.5 -right-1.5 w-[22px] h-[22px] rounded-full grid place-items-center bg-forest text-cream text-[11px] border-2 border-[#fffdf8]">✓</span>
                      )}
                    </Link>

                    {/* title, description, areas + ages */}
                    <div className="min-w-0">
                      <Link
                        href={activityHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        prefetch={false}
                        className="tap font-[family-name:var(--font-plate)] font-extrabold text-[17px] leading-[1.2] text-ink no-underline hover:text-forest-dark transition-colors"
                      >
                        {a.title}
                      </Link>
                      <p className="m-0 mt-1 text-[13.5px] leading-[1.45] text-gray-600">{a.excerpt}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-[12px] text-gray-500">
                        {areas.slice(0, 3).map((t) => (
                          <span key={t.slug} className="inline-flex items-center gap-1.5">
                            <span aria-hidden="true" className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                            {t.name}
                          </span>
                        ))}
                        {areas.length > 3 && <span>+{areas.length - 3}</span>}
                        <span>{a.ageRange}</span>
                      </div>
                    </div>

                    {/* actions */}
                    <div className="lib-actions">
                      <Link
                        href={activityHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        prefetch={false}
                        className="inline-flex items-center gap-1.5 bg-forest text-cream font-body font-semibold text-[13px] py-2 px-4 rounded-[10px] no-underline hover:bg-forest-dark transition-colors whitespace-nowrap"
                        aria-label={`Open ${a.title}`}
                      >
                        Open <span aria-hidden="true">&rarr;</span>
                      </Link>
                      {effortFor(a.slug) && <AddToWeekButton slug={a.slug} title={a.title} variant="text" />}
                      <div className="flex items-center gap-1">
                        <a
                          href={downloadHref}
                          onClick={handleDownloadClick}
                          className="w-8 h-8 rounded-lg grid place-items-center text-gray-500 no-underline hover:bg-[rgba(58,44,23,0.06)] hover:text-forest-dark transition-colors"
                          aria-label={tier === 'trial' ? `Download ${a.title} (membership required)` : `Download ${a.title}`}
                          title={tier === 'trial' ? 'Download with membership' : 'Download PDF'}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 21h14" /></svg>
                        </a>
                        <button
                          type="button"
                          onClick={() => togglePin(a.slug)}
                          aria-label={isPinned ? `Remove ${a.title} from Saved` : `Save ${a.title} for later`}
                          aria-pressed={isPinned}
                          title={isPinned ? 'Saved, click to remove' : 'Save for later'}
                          className={`w-8 h-8 rounded-lg grid place-items-center cursor-pointer border-0 bg-transparent transition-colors hover:bg-[rgba(58,44,23,0.06)] ${isPinned ? 'text-[#b8862f]' : 'text-gray-500 hover:text-forest-dark'}`}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isPinned ? '1' : '1.7'} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2l2 6 6 1-5 4 2 7-5-4-5 4 2-7-5-4 6-1z" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 px-6 bg-[#fffdf8] rounded-[18px]">
              <p className="font-[family-name:var(--font-plate)] font-extrabold text-[22px] text-[#C97B5C] mb-2.5">
                No activities match those filters.
              </p>
              <p className="font-body text-[15px] text-gray-600 m-0">
                Try clearing one to see more, or{' '}
                <button
                  type="button"
                  onClick={() => { setQuery(''); setTrackFilter(''); setAgeFilter('All ages'); setStatusFilter('all'); }}
                  className="text-forest-dark font-body font-semibold underline decoration-forest/25 underline-offset-2 bg-transparent border-0 cursor-pointer hover:text-forest"
                >
                  clear all filters
                </button>
                .
              </p>
            </div>
          )}

          {/* Paginator — Prev · 1 2 [3] 4 5 · Next */}
          {totalPages > 1 && (
            <nav
              aria-label="Library pagination"
              className="mt-6 sm:mt-8 flex items-center justify-center gap-1.5 flex-wrap"
            >
              <button
                type="button"
                onClick={() => goToPage(1)}
                disabled={currentPage <= 1}
                className="hidden sm:inline-flex items-center bg-[var(--am-paper)] border border-[rgba(58,44,23,0.12)] text-ink font-body font-semibold text-[15px] py-2.5 px-3 rounded-[10px] hover:bg-[#F2EFE4] hover:border-[#C9C5B7] hover:-translate-y-px transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
                aria-label="First page"
                title="First page"
              >
                <span aria-hidden="true">&laquo;</span>
              </button>
              <button
                type="button"
                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="inline-flex items-center gap-2 bg-[var(--am-paper)] border border-[rgba(58,44,23,0.12)] text-ink font-body font-semibold text-[13.5px] py-2.5 px-3.5 rounded-[10px] hover:bg-[#F2EFE4] hover:border-[#C9C5B7] hover:-translate-y-px transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
                aria-label="Previous page"
              >
                <span aria-hidden="true">&larr;</span>
                Prev
              </button>
              <label className="inline-flex items-center gap-2 font-[family-name:var(--font-plate)] text-[14px] text-gray-500 px-1">
                {/* Hidden on phones so Prev · page · Next fit one row at 320px.
                    The select keeps its own aria-label, so nothing is lost. */}
                <span className="hidden sm:inline">Page</span>
                <select
                  value={currentPage}
                  onChange={(e) => goToPage(parseInt(e.target.value, 10))}
                  aria-label="Jump to page"
                  className="bg-[var(--am-paper)] border border-[rgba(58,44,23,0.12)] rounded-[10px] px-2.5 py-2 pr-7 font-body not-italic font-semibold text-[13.5px] text-forest-dark cursor-pointer focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/20"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <span>of {totalPages}</span>
              </label>
              <button
                type="button"
                onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className="inline-flex items-center gap-2 bg-[var(--am-paper)] border border-[rgba(58,44,23,0.12)] text-ink font-body font-semibold text-[13.5px] py-2.5 px-3.5 rounded-[10px] hover:bg-[#F2EFE4] hover:border-[#C9C5B7] hover:-translate-y-px transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
                aria-label="Next page"
              >
                Next
                <span aria-hidden="true">&rarr;</span>
              </button>
              <button
                type="button"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage >= totalPages}
                className="hidden sm:inline-flex items-center bg-[var(--am-paper)] border border-[rgba(58,44,23,0.12)] text-ink font-body font-semibold text-[15px] py-2.5 px-3 rounded-[10px] hover:bg-[#F2EFE4] hover:border-[#C9C5B7] hover:-translate-y-px transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
                aria-label="Last page"
                title="Last page"
              >
                <span aria-hidden="true">&raquo;</span>
              </button>
            </nav>
          )}
        </div>
      </div>
      <style>{`
        .lib-wrap{display:grid;gap:22px;padding-bottom:48px}
        @media (min-width:960px){.lib-wrap{grid-template-columns:260px minmax(0,1fr);gap:34px;align-items:start}.lib-side{position:sticky;top:74px}}
        .lib-side-label{font-family:var(--font-catalog),monospace;font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--am-trail);margin:22px 0 8px}
        .lib-filters-toggle{display:flex}
        .lib-filters{display:none}
        .lib-filters.is-open{display:block}
        @media (min-width:960px){.lib-filters-toggle{display:none}.lib-filters{display:block}}
        .lib-pill{padding:6px 12px;border-radius:999px;font-size:13px;font-weight:600;cursor:pointer;background:#fffdf8;color:#3d3527;border:1.5px solid rgba(58,44,23,.12);transition:background .15s,border-color .15s}
        .lib-pill:hover{border-color:rgba(88,129,87,.45)}
        .lib-pill[data-on]{background:#588157;color:#fff;border-color:#588157}
        .lib-row{display:grid;grid-template-columns:64px minmax(0,1fr);gap:8px 14px;padding:16px;align-items:start;transition:background .15s}
        .lib-row:hover{background:rgba(88,129,87,.04)}
        .lib-cover{width:64px}
        .lib-actions{grid-column:1 / -1;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
        @media (min-width:640px){
          .lib-row{grid-template-columns:76px minmax(0,1fr) auto;gap:18px;padding:16px 18px;align-items:center}
          .lib-cover{width:76px}
          .lib-actions{grid-column:auto;flex-direction:column;align-items:flex-end;gap:6px}
        }
      `}</style>

    </main>
    <TrialCapModal
      open={capModalOpen}
      onClose={() => setCapModalOpen(false)}
      trialEndsAt={trial?.endsAt ?? null}
      priceLabel={trial?.priceLabel ?? MEMBERSHIP_PRICE_YEAR}
      isFounder={trial?.isFounder ?? IS_FOUNDER_PHASE}
    />
    </>
  );
}

function Sep({ size = 'sm' }: { size?: 'xs' | 'sm' }) {
  const dim = size === 'xs' ? '2px' : '3px';
  return (
    <span
      aria-hidden="true"
      className="inline-block rounded-full bg-[#C9C5B7] align-middle mx-2"
      style={{ width: dim, height: dim }}
    />
  );
}
