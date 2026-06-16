'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import CheckoutButton from '@/components/checkout/CheckoutButton';
import ReviewModal from '@/components/shop/ReviewModal';
import TrialCapModal from '@/components/account/TrialCapModal';
import { IS_FOUNDER_PHASE, MEMBERSHIP_PRICE_YEAR, MEMBERSHIP_PRICE_USD } from '@/lib/membership';
import { STARTER_PACK_CREDIT_LABEL, firstYearPriceAfterCredit } from '@/lib/starter-pack-credit';

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

type Status = 'none' | 'started' | 'done';
type Tier = 'member' | 'starter' | 'trial';

export interface TrialInfo {
  /** ISO date the trial converts to a paid membership. */
  endsAt: string;
  /** Whether this trial member locked the founder rate (for upgrade copy). */
  isFounder: boolean;
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

// Track filter options (in order).
const TRACK_OPTIONS = [
  { value: '', label: 'All categories' },
  { value: 'real-world-math', label: 'Real-World Math' },
  { value: 'entrepreneurship', label: 'Entrepreneurship' },
  { value: 'ai-literacy', label: 'AI & Digital' },
  { value: 'communication-writing', label: 'Communication' },
  { value: 'planning-problem-solving', label: 'Planning' },
  { value: 'creativity-maker', label: 'Creativity' },
  { value: 'outdoor-learning', label: 'Outdoor & Nature' },
  { value: 'worldschooling', label: 'Worldschooling' },
];

const STATUS_OPTIONS: { value: 'all' | Status; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'none', label: 'Not started' },
  { value: 'started', label: 'Started' },
  { value: 'done', label: 'Done' },
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
  status: Record<string, Status>;
  pinned: Record<string, boolean>;
}

function loadState(): PersistedState {
  if (typeof window === 'undefined') return { status: {}, pinned: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { status: {}, pinned: {} };
    return JSON.parse(raw) as PersistedState;
  } catch {
    return { status: {}, pinned: {} };
  }
}

function saveState(state: PersistedState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [pinned, setPinned] = useState<Record<string, boolean>>({});
  const [capModalOpen, setCapModalOpen] = useState(!!initialCapModal);

  // Trial members are view-only: any download click opens the upgrade modal.
  // Members (and starters) navigate straight to the file.
  function handleDownloadClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (tier !== 'trial') return;
    e.preventDefault();
    setCapModalOpen(true);
  }

  // Filters
  const [query, setQuery] = useState('');
  const [trackFilter, setTrackFilter] = useState('');
  const [ageFilter, setAgeFilter] = useState('All ages');
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const [sort, setSort] = useState('recommended');
  const [activeReview, setActiveReview] = useState<{ slug: string; title: string } | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 24;

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const s = loadState();
    setStatus(s.status);
    setPinned(s.pinned);
  }, []);

  useEffect(() => {
    saveState({ status, pinned });
  }, [status, pinned]);

  const cycleStatus = (slug: string) => {
    setStatus((prev) => {
      const cur = prev[slug] || 'none';
      const next: Status = cur === 'none' ? 'started' : cur === 'started' ? 'done' : 'none';
      const out = { ...prev };
      if (next === 'none') delete out[slug];
      else out[slug] = next;
      return out;
    });
  };

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
  const doneCount = Object.values(status).filter((s) => s === 'done').length;
  const pinnedCount = Object.keys(pinned).length;
  const startedCount = Object.values(status).filter((s) => s === 'started').length;

  // "Continue" strip — pinned + started, capped at 6.
  const continueItems = useMemo(() => {
    const items = activities.filter(
      (a) => pinned[a.slug] || status[a.slug] === 'started',
    );
    return items.slice(0, 6);
  }, [activities, pinned, status]);

  // Filtered list
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = activities.filter((a) => {
      if (q && !a.title.toLowerCase().includes(q) && !a.excerpt.toLowerCase().includes(q)) {
        return false;
      }
      if (trackFilter && a.category !== trackFilter) return false;
      if (!ageMatches(a.ageRange, ageFilter)) return false;
      const cur = status[a.slug] || 'none';
      if (statusFilter !== 'all' && cur !== statusFilter) return false;
      return true;
    });
    if (sort === 'az') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'recent') {
      list = [...list].reverse();
    }
    return list;
  }, [activities, query, trackFilter, ageFilter, statusFilter, sort, status]);

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

  // Trial members get the full library view; only downloading is gated.
  const isMember = tier === 'member' || tier === 'trial';

  const trialEndsLabel = trial
    ? new Date(trial.endsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    : '';

  return (
    <>
    <main className="bg-cream pb-12">
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
      {/* HEADER */}
      <section className="pt-10 md:pt-12 pb-6">
        <div className="mx-auto max-w-[1180px] px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="font-display italic text-[12.5px] text-gray-500 mb-1">
                Welcome back, {userName}.
              </div>
              <h1 className="font-display text-[clamp(1.625rem,3vw,2rem)] leading-[1.1] tracking-[-0.012em] text-ink">
                Your{' '}
                <em className="not-italic italic text-forest">
                  {isMember ? 'library.' : 'Starter Pack.'}
                </em>
              </h1>
              <p className="mt-2 font-body text-[13px] text-gray-500 tracking-wide">
                {totalActivities} activities
                <Sep />
                {doneCount} done
                {pinnedCount > 0 && (
                  <>
                    <Sep />
                    {pinnedCount} pinned
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-x-3.5 gap-y-1 flex-wrap text-[13.5px]">
              <Link
                href="/account/settings"
                className="text-gray-600 font-body font-medium no-underline hover:text-forest-dark transition-colors"
              >
                Account
              </Link>
              <Sep />
              <Link
                href="/contact"
                className="text-gray-600 font-body font-medium no-underline hover:text-forest-dark transition-colors"
              >
                Help
              </Link>
            </div>
          </div>

          {/* CONTINUE STRIP */}
          {continueItems.length > 0 && (
            <div className="mt-6 pt-5 pb-4 border-t border-[#D8D4C5] border-b border-b-[#D8D4C5]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 mb-3">
                Continue
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-1.5 -mx-1 px-1 scrollbar-thin">
                {continueItems.map((a) => {
                  const isPinned = pinned[a.slug];
                  const isStarted = status[a.slug] === 'started';
                  const href = `/api/download/activity/${a.slug}?view=1`;
                  return (
                    <Link
                      key={a.slug}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      prefetch={false}
                      className="group relative flex-none w-[320px] bg-cream border border-[#D8D4C5] rounded-[10px] py-3 px-3.5 grid grid-cols-[4px_1fr] gap-3 no-underline text-ink hover:border-[#C9C5B7] hover:bg-[#F2EFE4] transition-all"
                    >
                      <span
                        aria-hidden="true"
                        className="rounded-sm self-stretch"
                        style={{ background: a.trackColor }}
                      />
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span
                            className={`inline-flex items-center gap-1 font-body font-semibold text-[10px] uppercase tracking-[0.14em] ${
                              isPinned
                                ? 'text-forest-dark'
                                : isStarted
                                  ? 'text-[#C97B5C]'
                                  : 'text-gray-500'
                            }`}
                          >
                            {isPinned ? '📌 Pinned' : isStarted ? '◐ Started' : ''}
                          </span>
                        </div>
                        <div className="font-display italic text-[15px] leading-[1.25] text-ink mb-1">
                          {a.title}
                        </div>
                        <div className="font-body text-[12px] text-gray-500 tracking-wide">
                          {a.categoryLabel} <Sep size="xs" /> {a.ageRange}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Anchor for the paginator to scroll back to. Sits just above the
          sticky filter bar so Prev/Next lands the user at the start of the
          list instead of the very top of the page. */}
      <div id="library-top" className="scroll-mt-[80px] md:scroll-mt-[100px]" aria-hidden="true" />

      {/* FILTERS BAR */}
      <div className="sticky top-[72px] z-40 bg-[rgba(242,239,228,0.94)] backdrop-blur-[10px] border-y border-[#D8D4C5]">
        <div className="mx-auto max-w-[1180px] px-6">
          <div className="flex items-center gap-2 flex-wrap py-3">
            <Dropdown
              label={
                TRACK_OPTIONS.find((t) => t.value === trackFilter)?.label || 'All categories'
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
              onChange={(v) => setStatusFilter(v as 'all' | Status)}
            />
            <div className="flex-1 min-w-[8px]" />
            <label className="relative">
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
                className="appearance-none border border-[#D8D4C5] bg-cream rounded-full py-2 pr-3.5 pl-9 font-body text-[13.5px] text-ink outline-none w-[180px] sm:w-[240px] focus:shadow-[0_0_0_1px_var(--color-forest),0_0_0_4px_rgba(88,129,87,0.18)] transition-shadow"
              />
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort"
              className="bg-cream border border-[#D8D4C5] rounded-full py-2 pl-3.5 pr-8 font-body text-[13px] text-ink cursor-pointer appearance-none"
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
          {activeFilterPills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pb-3">
              <span className="text-[11.5px] font-body font-semibold uppercase tracking-[0.12em] text-gray-500 mr-1">
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
          Showing {filtered.length} of {totalActivities}
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
              const s = status[a.slug] || 'none';
              const isPinned = !!pinned[a.slug];
              // Opening an activity from the dashboard goes straight to the PDF
              // (via the membership-aware download endpoint), opened inline in
              // the browser. The /shop/[slug] product page is for browsing the
              // catalogue, not for opening what you already own.
              const activityHref = `/api/download/activity/${a.slug}?view=1`;
              // Download button uses the same endpoint without ?view=1 → forced download
              const downloadHref = `/api/download/activity/${a.slug}`;
              // Skills Map entries are parent guides, not activities — no reviews.
              const isSkillsMap = a.slug.startsWith('skills-map-');
              return (
                <div
                  key={a.slug}
                  className="group grid grid-cols-[4px_28px_56px_1fr_auto] sm:grid-cols-[4px_28px_64px_1fr_auto] gap-3 md:gap-4 items-start border-b border-[#D8D4C5] py-4 pr-1 hover:bg-[#F2EFE4] transition-colors"
                >
                  <span
                    aria-hidden="true"
                    className="self-stretch rounded-sm"
                    style={{ background: a.trackColor }}
                  />
                  <button
                    type="button"
                    onClick={() => cycleStatus(a.slug)}
                    aria-label={`Status: ${s}. Click to cycle.`}
                    className={`w-6 h-6 self-center rounded-full grid place-items-center text-[12px] mx-auto cursor-pointer transition-colors border-[1.5px] ${
                      s === 'done'
                        ? 'bg-forest border-forest text-cream'
                        : s === 'started'
                          ? 'border-[#C97B5C]'
                          : 'bg-transparent border-[#D8D4C5] text-transparent hover:border-forest'
                    }`}
                    style={
                      s === 'started'
                        ? {
                            background:
                              'radial-gradient(circle at left center, #C97B5C 50%, transparent 50%)',
                          }
                        : undefined
                    }
                  >
                    {s === 'done' && '✓'}
                  </button>

                  {/* Cover thumbnail */}
                  <Link
                    href={activityHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    prefetch={false}
                    aria-label={`Open ${a.title}`}
                    className="block w-14 sm:w-16 aspect-[4/5] rounded-md overflow-hidden border border-[#D8D4C5] bg-cream no-underline shadow-[0_4px_10px_-6px_rgba(45,58,46,0.3)] group-hover:border-[#C9C5B7] transition-colors"
                    style={{ background: a.trackColor + '14' /* low-opacity fallback */ }}
                  >
                    {a.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.imageUrl}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="w-full h-full grid place-items-center font-display italic text-[20px]"
                        style={{ color: a.trackDeep }}
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
                      className="font-display italic text-[16.5px] leading-[1.2] text-ink no-underline hover:text-forest-dark transition-colors"
                    >
                      {a.title}
                    </Link>
                    <p className="m-0 mt-1 text-[13.5px] leading-[1.45] text-gray-600 max-w-[640px]">
                      {a.excerpt}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span
                        className="font-body font-semibold text-[10.5px] uppercase tracking-[0.14em]"
                        style={{ color: a.trackDeep }}
                      >
                        {a.categoryLabel}
                      </span>
                      <Sep size="xs" />
                      <span className="font-body font-medium text-[11.5px] text-gray-500 tracking-wide">
                        {a.ageRange}
                      </span>
                    </div>
                  </div>

                  {/* Actions column: Open + Write a review (stacked) | Download + Pin (icons) */}
                  <div className="flex items-start gap-1.5 pt-0.5 self-stretch">
                    <div className="flex flex-col items-end justify-between self-stretch min-h-[64px]">
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
                      {!isSkillsMap && (
                        <button
                          type="button"
                          onClick={() => setActiveReview({ slug: a.slug, title: a.title })}
                          className="hidden sm:inline-flex items-center font-body text-[11.5px] text-gray-500 hover:text-forest-dark transition-colors bg-transparent border-0 cursor-pointer underline decoration-gray-300 underline-offset-[3px] hover:decoration-forest-dark"
                        >
                          Write a review
                        </button>
                      )}
                    </div>
                    <a
                      href={downloadHref}
                      onClick={handleDownloadClick}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[#D8D4C5] bg-cream text-gray-600 no-underline hover:border-forest hover:text-forest-dark transition-colors"
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
                      aria-label={isPinned ? `Unpin ${a.title}` : `Pin ${a.title}`}
                      title={isPinned ? 'Unpin' : 'Pin'}
                      className={`w-8 h-8 rounded-lg grid place-items-center cursor-pointer transition-colors border ${
                        isPinned
                          ? 'bg-[#E6EBDF] border-[#C9D3BE] text-forest'
                          : 'bg-cream border-[#D8D4C5] text-gray-400 hover:border-forest hover:text-forest-dark'
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
              <p className="font-display italic text-[22px] text-[#C97B5C] mb-2.5">
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
                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="inline-flex items-center gap-2 bg-cream border border-[#D8D4C5] text-ink font-body font-semibold text-[13.5px] py-2.5 px-3.5 rounded-[10px] hover:bg-[#F2EFE4] hover:border-[#C9C5B7] hover:-translate-y-px transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
                aria-label="Previous page"
              >
                <span aria-hidden="true">&larr;</span>
                Prev
              </button>
              <label className="inline-flex items-center gap-2 font-display italic text-[14px] text-gray-500 px-1">
                <span>Page</span>
                <select
                  value={currentPage}
                  onChange={(e) => goToPage(parseInt(e.target.value, 10))}
                  aria-label="Jump to page"
                  className="bg-cream border border-[#D8D4C5] rounded-[10px] px-2.5 py-2 pr-7 font-body not-italic font-semibold text-[13.5px] text-forest-dark cursor-pointer focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/20"
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
                className="inline-flex items-center gap-2 bg-cream border border-[#D8D4C5] text-ink font-body font-semibold text-[13.5px] py-2.5 px-3.5 rounded-[10px] hover:bg-[#F2EFE4] hover:border-[#C9C5B7] hover:-translate-y-px transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
                aria-label="Next page"
              >
                Next
                <span aria-hidden="true">&rarr;</span>
              </button>
            </nav>
          )}
        </div>
      </section>

      {/* STARTER PACK UPGRADE — emphasizes the $45 credit so users know
          upgrading effectively costs $54 first year, not the full $99.
          Headline + sidebar both show the credit math. */}
      {tier === 'starter' && (
        <section className="pt-2 pb-14">
          <div className="mx-auto max-w-[980px] px-6">
            <div className="bg-[#E6EBDF] border border-[#C9D3BE] rounded-[16px] p-10 md:p-12 grid grid-cols-1 md:grid-cols-[1.3fr_0.7fr] gap-8 md:gap-10 items-center">
              <div>
                <p className="font-body font-semibold text-[11.5px] uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
                  <span className="w-[22px] h-px bg-forest inline-block" />
                  Your {STARTER_PACK_CREDIT_LABEL} credit is waiting
                </p>
                <h2 className="mt-3.5 font-display text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.08] tracking-[-0.012em] text-balance">
                  Unlock the other 90+ activities for{' '}
                  <em className="not-italic italic text-forest-dark">
                    ${firstYearPriceAfterCredit(MEMBERSHIP_PRICE_USD)} the first year.
                  </em>
                </h2>
                <p className="mt-3.5 mb-5 text-[15.5px] leading-[1.55] text-gray-600 max-w-[520px]">
                  We&apos;ll take{' '}
                  <strong className="text-forest-dark">
                    {STARTER_PACK_CREDIT_LABEL} off your first year
                  </strong>
                  . Same {STARTER_PACK_CREDIT_LABEL} you paid for the Starter Pack.{' '}
                  {IS_FOUNDER_PHASE
                    ? `${MEMBERSHIP_PRICE_YEAR} after that, locked in for life as a founding member.`
                    : `${MEMBERSHIP_PRICE_YEAR} on renewal.`}
                </p>
                <CheckoutButton
                  kind="membership"
                  className="inline-flex items-center gap-2.5 bg-forest text-cream font-body font-semibold py-3.5 px-5 rounded-xl text-[15px] shadow-[0_12px_26px_-14px_rgba(58,90,64,0.55)] hover:bg-forest-dark hover:-translate-y-px transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="inline-flex items-center gap-2.5">
                    Upgrade for ${firstYearPriceAfterCredit(MEMBERSHIP_PRICE_USD)} &rarr;
                  </span>
                </CheckoutButton>
              </div>
              <div className="font-display italic text-[clamp(1.375rem,2.8vw,1.875rem)] leading-[1.2] text-forest-dark text-center text-balance">
                90+ more activities.
                <br />
                <span className="not-italic">
                  <s className="opacity-50 mr-1.5">{MEMBERSHIP_PRICE_YEAR}</s>
                  <em>${firstYearPriceAfterCredit(MEMBERSHIP_PRICE_USD)}/yr 1</em>
                </span>
                {IS_FOUNDER_PHASE && (
                  <>
                    <br />
                    <em className="text-[16px] font-normal not-italic block mt-1 text-forest-dark/70">
                      Then locked in for life.
                    </em>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
    <TrialCapModal
      open={capModalOpen}
      onClose={() => setCapModalOpen(false)}
      trialEndsAt={trial?.endsAt ?? null}
      priceLabel={MEMBERSHIP_PRICE_YEAR}
      isFounder={trial?.isFounder ?? IS_FOUNDER_PHASE}
    />
    {activeReview && (
      <ReviewModal
        slug={activeReview.slug}
        productName={activeReview.title}
        onClose={() => setActiveReview(null)}
      />
    )}
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
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div className="relative" data-dropdown>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 rounded-full border font-body text-[13px] px-3 py-1.5 cursor-pointer transition-colors ${
          active
            ? 'bg-[#E6EBDF] border-[#C9D3BE] text-forest-dark font-semibold'
            : 'bg-cream border-[#D8D4C5] text-ink font-medium hover:border-[#C9C5B7]'
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
        <div className="absolute left-0 top-[calc(100%+6px)] min-w-[180px] bg-cream border border-[#D8D4C5] rounded-[10px] shadow-[0_18px_30px_-14px_rgba(45,58,46,0.25)] py-1.5 z-50">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
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
