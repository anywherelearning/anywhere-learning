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
import { IS_FOUNDER_PHASE, MEMBERSHIP_PRICE_YEAR } from '@/lib/membership';

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

type Tier = 'member' | 'trial';

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
const TRACK_OPTIONS = [
  { value: '', label: 'All areas' },
  ...TERRITORIES.map((t) => ({ value: t.slug, label: t.name })),
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
}: Props) {
  const [doneSet, setDoneSet] = useState<Set<string>>(new Set()); // completed on the trail
  const [pinned, setPinned] = useState<Record<string, boolean>>({});
  const [savedAdded, setSavedAdded] = useState<string | null>(null); // "added to trail" flash
  const [capModalOpen, setCapModalOpen] = useState(!!initialCapModal);
  const [skillsMapOpen, setSkillsMapOpen] = useState(false); // hero Skills Map menu

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
      if (trackFilter && !territoriesForSlug(a.slug).includes(trackFilter)) return false;
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
    <FirstRunRedirect />
    <main className="pb-12" style={{ background: 'linear-gradient(180deg,var(--am-bg1),var(--am-bg2))' }}>
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
              className="inline-flex items-center gap-1.5 bg-forest text-cream font-body font-semibold text-[12.5px] py-1.5 px-3.5 rounded-full border-0 cursor-pointer hover:bg-forest-dark transition-colors whitespace-nowrap"
            >
              Subscribe now to download
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </div>
      )}
      {/* HEADER — full-width band, sized to match This Month & Record */}
      <header className="relative overflow-hidden" style={{ minHeight: 'clamp(150px,20vw,206px)', background: 'linear-gradient(180deg, var(--am-sky1), var(--am-sky2))', padding: 'clamp(18px,2.5vw,26px) clamp(16px,4vw,40px) clamp(26px,3vw,38px)' }}>
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

        {/* SAVED STRIP */}
        {continueItems.length > 0 && (
          <div className="mx-auto max-w-[1180px] px-6">
            <div className="mt-6 pt-5 pb-4 border-t border-[rgba(58,44,23,0.12)] border-b border-b-[rgba(58,44,23,0.12)]">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--am-gold)] mb-3">
                Saved for later
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-1.5 -mx-1 px-1 scrollbar-thin">
                {continueItems.map((a) => {
                  const href = `/api/download/activity/${a.slug}?view=1`;
                  const flashed = savedAdded === a.slug;
                  const primaryArea = areasOf(a.slug)[0];
                  return (
                    <div
                      key={a.slug}
                      className="group relative flex-none w-[320px] bg-[var(--am-paper)] border border-[rgba(58,44,23,0.12)] rounded-[10px] py-3 px-3.5 grid grid-cols-[4px_1fr] gap-3 text-ink hover:border-[#C9C5B7] transition-colors"
                      style={{ borderLeft: `4px solid ${primaryArea?.color ?? a.trackColor}` }}
                    >
                      <span aria-hidden="true" />
                      <div className="min-w-0">
                        <div className="font-body font-semibold text-[10px] uppercase tracking-[0.14em] text-[var(--am-gold)] mb-1">★ Saved</div>
                        <Link
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          prefetch={false}
                          className="block no-underline text-ink"
                        >
                          <div className="font-[family-name:var(--font-plate)] text-[15px] leading-[1.25] mb-1 hover:text-forest-dark transition-colors">
                            {a.title}
                          </div>
                          <div className="font-body text-[12px] text-gray-500 tracking-wide">
                            {primaryArea?.name ?? a.categoryLabel} <Sep size="xs" /> {a.ageRange}
                          </div>
                        </Link>
                        <div className="flex items-center gap-2 mt-2.5">
                          {effortFor(a.slug) && (
                            <button
                              type="button"
                              onClick={() => {
                                addToWeek(a.slug, [FAMILY_TARGET]);
                                notifyLocalChanged();
                                setSavedAdded(a.slug);
                                window.setTimeout(() => setSavedAdded((s) => (s === a.slug ? null : s)), 2600);
                              }}
                              className={`inline-flex items-center gap-1.5 font-body font-semibold text-[12px] py-1.5 px-3 rounded-lg border transition-colors ${
                                flashed
                                  ? 'bg-forest border-forest text-cream'
                                  : 'bg-cream border-[#D8D4C5] text-forest-dark hover:border-forest hover:bg-[#EDE9DC]'
                              }`}
                            >
                              {flashed ? (
                                <>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12l5 5L20 6" /></svg>
                                  Added
                                </>
                              ) : (
                                <>
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4M12 13v4M10 15h4" /></svg>
                                  Add to trail
                                </>
                              )}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => togglePin(a.slug)}
                            className="font-body text-[12px] text-gray-500 hover:text-[#C97B5C] bg-transparent border-0 cursor-pointer transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      {/* Anchor for the paginator to scroll back to. Sits just above the
          sticky filter bar so Prev/Next lands the user at the start of the
          list instead of the very top of the page. */}
      <div id="library-top" className="scroll-mt-[80px] md:scroll-mt-[100px]" aria-hidden="true" />

      {/* FILTERS BAR */}
      <div className="sticky top-[54px] z-40 bg-[rgba(242,239,228,0.94)] backdrop-blur-[10px] border-y border-[rgba(58,44,23,0.12)]">
        <div className="mx-auto max-w-[1180px] px-6">
          <div className="py-3 space-y-2.5">
            {/* Row 1: the filters + sort, all together */}
            <div className="flex items-center gap-2 flex-wrap">
              <Dropdown
                label={
                  TRACK_OPTIONS.find((t) => t.value === trackFilter)?.label || 'All areas'
                }
                active={trackFilter !== ''}
                options={TRACK_OPTIONS}
                value={trackFilter}
                onChange={setTrackFilter}
              />
              <Dropdown
                label={ageFilter}
                active={ageFilter !== 'All ages'}
                options={AGE_OPTIONS.map((a) => ({ value: a, label: a }))}
                value={ageFilter}
                onChange={setAgeFilter}
              />
              <Dropdown
                label={STATUS_OPTIONS.find((s) => s.value === statusFilter)?.label || 'All statuses'}
                active={statusFilter !== 'all'}
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as LibFilter)}
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort"
                className="bg-[var(--am-paper)] border border-[rgba(58,44,23,0.12)] rounded-full py-1.5 pl-3.5 pr-8 font-body text-[13px] text-ink cursor-pointer appearance-none"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, transparent 50%, #4F5A50 50%), linear-gradient(135deg, #4F5A50 50%, transparent 50%)',
                  backgroundPosition: 'calc(100% - 14px) 50%, calc(100% - 9px) 50%',
                  backgroundSize: '5px 5px',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Row 2: search, under the filters */}
            <label className="relative block">
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
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search activities..."
                aria-label="Search activities"
                className="appearance-none border border-[rgba(58,44,23,0.12)] bg-[var(--am-paper)] rounded-full py-2 pr-3.5 pl-9 font-body text-[13.5px] text-ink outline-none w-full sm:w-[340px] focus:shadow-[0_0_0_1px_var(--color-forest),0_0_0_4px_rgba(88,129,87,0.18)] transition-shadow"
              />
            </label>
          </div>
          {activeFilterPills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pb-3">
              <span className="text-[11.5px] font-body font-bold uppercase tracking-[0.14em] text-[var(--am-gold)] mr-1">
                Filtering:
              </span>
              {activeFilterPills.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={p.clear}
                  className="inline-flex items-center gap-1.5 bg-[#F2DECF] text-[#7A3D24] font-body font-semibold text-[12px] px-2.5 py-1 rounded-full border-0 cursor-pointer hover:bg-[#E8D2C0] transition-colors"
                >
                  {p.label}
                  <span className="w-3.5 h-3.5 rounded-full bg-[#7A3D24] text-cream grid place-items-center text-[10px] leading-none">
                    &times;
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setTrackFilter('');
                  setAgeFilter('All ages');
                  setStatusFilter('all');
                  setQuery('');
                }}
                className="text-gray-500 font-body font-medium text-[12.5px] bg-transparent border-0 cursor-pointer underline decoration-gray-400/40 underline-offset-[3px] hover:text-forest-dark ml-1.5"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CONTEXT BAR */}
      <div className="mx-auto max-w-[1180px] px-6 pt-3 pb-1">
        <p className="font-body text-[13px] text-gray-500 tracking-wide">
          {filtered.length === 0
            ? 'No activities match'
            : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
          {sort !== 'recommended' && (
            <>
              {' · '}Sorted by {SORT_OPTIONS.find((o) => o.value === sort)?.label.toLowerCase()}
            </>
          )}
        </p>
      </div>

      {/* LIST */}
      <section className="pt-2 pb-12">
        <div className="mx-auto max-w-[1180px] px-6">
          {filtered.length > 0 ? (
            pagedItems.map((a) => {
              const isDone = doneSet.has(a.slug);
              const isPinned = !!pinned[a.slug];
              // Opening an activity from the dashboard goes straight to the PDF
              // (via the membership-aware download endpoint), opened inline in
              // the browser. The /shop/[slug] product page is for browsing the
              // catalogue, not for opening what you already own.
              const activityHref = `/api/download/activity/${a.slug}?view=1`;
              // Download button uses the same endpoint without ?view=1 → forced download
              const downloadHref = `/api/download/activity/${a.slug}`;
              // Skills-Map areas this activity builds — accent by the primary one.
              const areas = areasOf(a.slug);
              const accent = areas[0]?.color ?? a.trackColor;
              return (
                <div
                  key={a.slug}
                  className="group grid grid-cols-[28px_56px_1fr] sm:grid-cols-[28px_64px_1fr_auto] gap-x-3 gap-y-2 md:gap-4 items-start rounded-2xl border-l-[5px] py-4 pl-4 pr-4 mb-2.5 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-20px_rgba(45,58,46,0.6)]"
                  style={{ background: accent + '14', borderLeftColor: accent }}
                >
                  {/* Read-only done marker — a green check when completed on the
                      trail, blank otherwise (keeps the column for alignment). */}
                  {isDone ? (
                    <span
                      aria-label="Completed"
                      title="Completed on the trail"
                      className="w-6 h-6 self-center rounded-full grid place-items-center text-[12px] mx-auto bg-forest text-cream"
                    >
                      ✓
                    </span>
                  ) : (
                    <span aria-hidden="true" className="self-center" />
                  )}

                  {/* Cover thumbnail */}
                  <Link
                    href={activityHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    prefetch={false}
                    aria-label={`Open ${a.title}`}
                    className="block w-14 sm:w-16 aspect-[4/5] rounded-md overflow-hidden border-2 bg-[var(--am-paper)] no-underline shadow-[0_4px_10px_-6px_rgba(45,58,46,0.3)] transition-colors"
                    style={{ background: accent + '14' /* low-opacity fallback */, borderColor: accent + '4d' }}
                  >
                    {a.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.imageUrl}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover object-top transition-transform duration-300 ease-out group-hover:scale-[1.06]"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="w-full h-full grid place-items-center font-[family-name:var(--font-plate)] text-[20px]"
                        style={{ color: accent }}
                      >
                        {a.title.charAt(0)}
                      </span>
                    )}
                  </Link>

                  {/* Main column: title + description + meta */}
                  <div className="min-w-0">
                    <Link
                      href={activityHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      prefetch={false}
                      className="font-[family-name:var(--font-plate)] text-[16.5px] leading-[1.2] text-ink no-underline hover:text-forest-dark transition-colors"
                    >
                      {a.title}
                    </Link>
                    <p className="m-0 mt-1 text-[13.5px] leading-[1.45] text-gray-600 max-w-[640px]">
                      {a.excerpt}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                      {areas.slice(0, 2).map((t) => (
                        <span
                          key={t.slug}
                          className="inline-flex items-center gap-1.5 rounded-full pl-1.5 pr-2.5 py-1 font-body font-semibold text-[10.5px] uppercase tracking-[0.1em] text-forest-dark"
                          style={{ background: t.color + '22' }}
                        >
                          <span className="w-2 h-2 rounded-full" style={{ background: t.color }} aria-hidden="true" />
                          {t.name}
                        </span>
                      ))}
                      {areas.length > 2 && (
                        <span className="font-body font-semibold text-[10.5px] text-gray-500 tracking-wide">
                          +{areas.length - 2}
                        </span>
                      )}
                      <span className="font-body font-medium text-[11.5px] text-gray-500 tracking-wide">
                        {a.ageRange}
                      </span>
                    </div>
                  </div>

                  {/* Actions: own column on desktop; a full-width row below the
                      description on mobile so the description gets real width. */}
                  <div className="col-span-3 sm:col-span-1 flex items-start justify-end sm:justify-start gap-1.5 pt-0.5 sm:self-stretch">
                    <div className="hidden sm:flex flex-col items-end justify-between self-stretch min-h-[64px]">
                      <Link
                        href={activityHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        prefetch={false}
                        className="hidden sm:inline-flex items-center gap-1.5 bg-forest text-cream font-body font-semibold text-[12.5px] py-2 px-3.5 rounded-lg no-underline hover:bg-forest-dark transition-colors whitespace-nowrap"
                        aria-label={`Open ${a.title}`}
                      >
                        Open
                        <span aria-hidden="true">&rarr;</span>
                      </Link>
                    </div>
                    {effortFor(a.slug) && <AddToWeekButton slug={a.slug} title={a.title} />}
                    <a
                      href={downloadHref}
                      onClick={handleDownloadClick}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[rgba(58,44,23,0.12)] bg-[var(--am-paper)] text-gray-600 no-underline hover:border-forest hover:text-forest-dark transition-colors"
                      aria-label={tier === 'trial' ? `Download ${a.title} (membership required)` : `Download ${a.title}`}
                      title={tier === 'trial' ? 'Download with membership' : 'Download PDF'}
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
                        <path d="M12 3v12" />
                        <path d="M7 10l5 5 5-5" />
                        <path d="M5 21h14" />
                      </svg>
                    </a>
                    <button
                      type="button"
                      onClick={() => togglePin(a.slug)}
                      aria-label={isPinned ? `Remove ${a.title} from Saved` : `Save ${a.title} for later`}
                      title={isPinned ? 'Saved — click to remove' : 'Save for later'}
                      className={`w-8 h-8 rounded-lg grid place-items-center cursor-pointer transition-colors border ${
                        isPinned
                          ? 'bg-[#E6EBDF] border-[#C9D3BE] text-forest'
                          : 'bg-[var(--am-paper)] border-[rgba(58,44,23,0.12)] text-gray-500 hover:border-forest hover:text-forest-dark'
                      }`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill={isPinned ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth={isPinned ? '1' : '1.7'}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M12 2l2 6 6 1-5 4 2 7-5-4-5 4 2-7-5-4 6-1z" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 px-6 max-w-[520px] mx-auto">
              <p className="font-[family-name:var(--font-plate)] text-[22px] text-[#C97B5C] mb-2.5">
                No activities match those filters.
              </p>
              <p className="font-body text-[15px] text-gray-600 m-0">
                Try clearing one to see more, or{' '}
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setTrackFilter('');
                    setAgeFilter('All ages');
                    setStatusFilter('all');
                  }}
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
              className="mt-8 flex items-center justify-center gap-1.5 flex-wrap"
            >
              <button
                type="button"
                onClick={() => goToPage(1)}
                disabled={currentPage <= 1}
                className="inline-flex items-center bg-[var(--am-paper)] border border-[rgba(58,44,23,0.12)] text-ink font-body font-semibold text-[15px] py-2.5 px-3 rounded-[10px] hover:bg-[#F2EFE4] hover:border-[#C9C5B7] hover:-translate-y-px transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
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
                <span>Page</span>
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
                className="inline-flex items-center bg-[var(--am-paper)] border border-[rgba(58,44,23,0.12)] text-ink font-body font-semibold text-[15px] py-2.5 px-3 rounded-[10px] hover:bg-[#F2EFE4] hover:border-[#C9C5B7] hover:-translate-y-px transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
                aria-label="Last page"
                title="Last page"
              >
                <span aria-hidden="true">&raquo;</span>
              </button>
            </nav>
          )}
        </div>
      </section>

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

interface DropdownProps {
  label: string;
  active: boolean;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

function Dropdown({ label, active, options, value, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    // Close on any mousedown outside THIS dropdown — including on another
    // dropdown's button, so only one is ever open at a time.
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  // Escape closes and returns focus to the trigger; Arrow/Home/End move between
  // options; typing on the trigger with ArrowDown opens onto the first option.
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape' && open) {
      e.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    const items = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
    if (!items.length) return;
    const idx = items.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) { setOpen(true); return; } items[Math.min(idx + 1, items.length - 1)]?.focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[Math.max(idx - 1, 0)]?.focus(); }
    else if (e.key === 'Home') { e.preventDefault(); items[0]?.focus(); }
    else if (e.key === 'End') { e.preventDefault(); items[items.length - 1]?.focus(); }
  }

  return (
    <div className="relative" ref={ref} onKeyDown={onKeyDown}>
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 rounded-full border font-body text-[13px] px-3 py-1.5 cursor-pointer transition-colors ${
          active
            ? 'bg-[#E6EBDF] border-[#C9D3BE] text-forest-dark font-semibold'
            : 'bg-[var(--am-paper)] border-[rgba(58,44,23,0.12)] text-ink font-medium hover:border-[#C9C5B7]'
        }`}
      >
        {label}
        <span
          aria-hidden="true"
          className="w-[7px] h-[7px] border-r-[1.5px] border-b-[1.5px] border-current opacity-60"
          style={{ transform: 'rotate(45deg) translate(-1px, -1px)' }}
        />
      </button>
      {open && (
        <div role="menu" className="absolute left-0 top-[calc(100%+6px)] min-w-[180px] bg-[var(--am-paper)] border border-[rgba(58,44,23,0.12)] rounded-[10px] shadow-[0_18px_30px_-14px_rgba(45,58,46,0.25)] py-1.5 z-50">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="menuitem"
              aria-current={o.value === value || undefined}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
                triggerRef.current?.focus();
              }}
              className={`w-full text-left font-body text-[13.5px] px-3.5 py-2 cursor-pointer border-0 bg-transparent transition-colors ${
                o.value === value
                  ? 'bg-[#E6EBDF] text-forest-dark font-semibold'
                  : 'text-ink hover:bg-[#F2EFE4]'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
