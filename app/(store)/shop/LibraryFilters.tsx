'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export interface LibraryRow {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  trackLabel: string;
  trackColor: string;
  ageRange: string;
  ageMin: number;
  ageMax: number;
  /** Skill-family slugs this activity belongs to (e.g. "critical-thinking-and-reasoning"). */
  skillFamilies: string[];
  /** Cover thumbnail. Falls back to a letter avatar when missing. */
  imageUrl?: string | null;
}

interface Props {
  rows: LibraryRow[];
  tracks: { value: string; label: string }[];
  skills?: { value: string; label: string; count: number }[];
  /** @deprecated kept for backwards compatibility; pagination now uses PAGE_SIZE. */
  initialShown?: number;
}

const AGE_OPTIONS: { value: string; label: string; min: number; max: number }[] = [
  { value: '6-8', label: 'Ages 6 to 8', min: 6, max: 8 },
  { value: '8-10', label: 'Ages 8 to 10', min: 8, max: 10 },
  { value: '10-12', label: 'Ages 10 to 12', min: 10, max: 12 },
  { value: '12-14', label: 'Ages 12 to 14', min: 12, max: 14 },
];

const PAGE_SIZE = 20;

export default function LibraryFilters({ rows, tracks, skills = [] }: Props) {
  const searchParams = useSearchParams();
  const initialTrack = searchParams.get('track') || '';
  const validInitialTrack = tracks.some((t) => t.value === initialTrack) ? initialTrack : '';
  const initialQuery = searchParams.get('q') || '';
  const initialSkill = searchParams.get('skill') || '';
  const validInitialSkill = skills.some((s) => s.value === initialSkill) ? initialSkill : '';

  const [query, setQuery] = useState(initialQuery);
  const [track, setTrack] = useState(validInitialTrack);
  const [age, setAge] = useState('');
  const [skill, setSkill] = useState(validInitialSkill);
  const [page, setPage] = useState(1);
  // Which filter dropdown (if any) is currently open. Lifted up so opening
  // one closes the others — preventing the three-popovers-on-screen bug.
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Sync filters with URL changes (track + query + skill from links)
  useEffect(() => {
    const nextTrack = searchParams.get('track') || '';
    const nextQuery = searchParams.get('q') || '';
    const nextSkill = searchParams.get('skill') || '';
    if (tracks.some((t) => t.value === nextTrack) || nextTrack === '') {
      setTrack(nextTrack);
    }
    if (skills.some((s) => s.value === nextSkill) || nextSkill === '') {
      setSkill(nextSkill);
    }
    setQuery(nextQuery);
    setPage(1);
  }, [searchParams, tracks, skills]);

  // Snap back to page 1 whenever any filter or the search changes locally.
  useEffect(() => {
    setPage(1);
  }, [query, track, age, skill]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const ageOpt = AGE_OPTIONS.find((a) => a.value === age);
    return rows.filter((r) => {
      if (q && !r.title.toLowerCase().includes(q) && !r.excerpt.toLowerCase().includes(q)) {
        return false;
      }
      if (track && r.category !== track) return false;
      if (ageOpt) {
        if (r.ageMin > ageOpt.max || r.ageMax < ageOpt.min) return false;
      }
      if (skill && !r.skillFamilies.includes(skill)) return false;
      return true;
    });
  }, [rows, query, track, age, skill]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const startIdx = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(currentPage * PAGE_SIZE, filtered.length);

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

  const trackLabel = tracks.find((t) => t.value === track)?.label;
  const ageLabel = AGE_OPTIONS.find((a) => a.value === age)?.label;
  const skillLabel = skills.find((s) => s.value === skill)?.label;
  const activePills = [
    trackLabel ? { label: trackLabel, clear: () => setTrack('') } : null,
    ageLabel ? { label: ageLabel, clear: () => setAge('') } : null,
    skillLabel ? { label: skillLabel, clear: () => setSkill('') } : null,
  ].filter((p): p is { label: string; clear: () => void } => p !== null);

  return (
    <>
      {/* Anchor for the paginator to scroll back to. Sits just above the
          sticky filter bar so Prev/Next lands the user at the start of the
          list instead of the very top of the page. */}
      <div id="library-top" className="scroll-mt-[80px] md:scroll-mt-[88px]" aria-hidden="true" />

      {/* Filter bar */}
      <div className="sticky top-[65px] md:top-[73px] z-30 bg-[#F2EFE4] border border-[#D8D4C5] rounded-[14px] p-4 mb-6 shadow-none transition-shadow">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="relative flex-1 min-w-[200px] max-w-[420px]">
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
              className="absolute left-[18px] top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              placeholder="Search activities..."
              aria-label="Search activities"
              /* 16px font on mobile prevents iOS Safari from auto-zooming
                 in when the input gets focus. */
              className="w-full appearance-none border-0 bg-cream rounded-full pl-11 pr-5 py-3 text-[16px] md:text-[14.5px] text-ink outline-none focus:shadow-[0_0_0_1px_var(--color-forest),0_0_0_4px_rgba(88,129,87,0.18)] transition-shadow"
            />
          </label>
          <div className="flex gap-2 flex-wrap items-center">
            {/* Filter chip labels stay generic ("Categories", "Ages", "Skills")
                even when a value is selected — the active selection shows
                below as a removable pill, so duplicating it on the chip
                makes the row jump around and pushes other chips off-line. */}
            <Dropdown
              id="category"
              isOpen={openDropdown === 'category'}
              onToggle={(o) => setOpenDropdown(o ? 'category' : null)}
              label="Categories"
              active={!!track}
              value={track}
              options={[{ value: '', label: 'All categories' }, ...tracks]}
              onChange={setTrack}
            />
            <Dropdown
              id="age"
              isOpen={openDropdown === 'age'}
              onToggle={(o) => setOpenDropdown(o ? 'age' : null)}
              label="Ages"
              active={!!age}
              value={age}
              options={[{ value: '', label: 'All ages' }, ...AGE_OPTIONS.map((a) => ({ value: a.value, label: a.label }))]}
              onChange={setAge}
            />
            {skills.length > 0 && (
              <Dropdown
                id="skill"
                isOpen={openDropdown === 'skill'}
                onToggle={(o) => setOpenDropdown(o ? 'skill' : null)}
                label="Skills"
                active={!!skill}
                value={skill}
                options={[
                  { value: '', label: 'All skills' },
                  ...skills.map((s) => ({ value: s.value, label: `${s.label} (${s.count})` })),
                ]}
                onChange={setSkill}
              />
            )}
          </div>
        </div>
        {activePills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2.5">
            {activePills.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={p.clear}
                className="inline-flex items-center gap-1.5 bg-[#E6EBDF] text-forest-dark font-semibold text-[12px] px-2.5 py-1 rounded-full hover:bg-[#D4DCC5] transition-colors"
              >
                {p.label}
                <span className="w-3.5 h-3.5 rounded-full bg-forest-dark text-cream grid place-items-center text-[10px] leading-none">
                  &times;
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      {visible.length > 0 ? (
        <div className="border-t border-[#D8D4C5] mt-2">
          {visible.map((r) => (
            <Link
              key={r.slug}
              href={`/shop/${r.slug}`}
              className="group grid grid-cols-[4px_auto_1fr_auto] gap-3.5 border-b border-[#D8D4C5] no-underline text-ink hover:bg-[#F2EFE4] transition-colors max-md:grid-cols-[4px_auto_1fr] max-md:gap-2.5"
            >
              <span
                className="row-span-2 md:row-span-1 row-start-1 col-start-1"
                style={{ background: r.trackColor }}
                aria-hidden="true"
              />
              {/* Cover thumbnail */}
              <span
                className="my-3 ml-3.5 w-12 sm:w-14 aspect-[4/5] rounded-md overflow-hidden border border-[#D8D4C5] bg-cream block shadow-[0_4px_10px_-6px_rgba(45,58,46,0.3)] group-hover:border-[#C9C5B7] transition-colors flex-shrink-0 self-center"
                style={{ background: r.trackColor + '14' }}
                aria-hidden="true"
              >
                {r.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.imageUrl}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <span
                    className="w-full h-full grid place-items-center font-display italic text-[18px]"
                    style={{ color: r.trackColor }}
                  >
                    {r.title.charAt(0)}
                  </span>
                )}
              </span>
              <div className="py-4 pr-1 min-w-0 self-center">
                <p className="font-display italic text-[17px] leading-[1.25] text-ink m-0 mb-1">
                  {r.title}
                </p>
                <p className="text-[13.5px] text-gray-500 leading-[1.5] m-0">{r.excerpt}</p>
              </div>
              <div className="py-4 px-2 flex items-center gap-2 flex-wrap justify-end max-md:col-span-3 max-md:col-start-1 max-md:pl-[22px] max-md:pt-0 max-md:pb-4 max-md:justify-start">
                <span className="bg-[#F2EFE4] text-gray-600 text-[12px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap">
                  {r.ageRange}
                </span>
                <span className="text-forest-dark font-semibold text-[13px] group-hover:text-forest transition-colors">
                  More details &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-6 font-display italic text-[18px] text-gray-500">
          No activities match those filters. Try clearing one.
        </div>
      )}

      <div className="pt-6 pb-3">
        <div className="text-center text-[13.5px] text-gray-500">
          Showing{' '}
          <span className="font-semibold text-ink">
            {startIdx}&ndash;{endIdx}
          </span>{' '}
          of <span className="font-semibold text-ink">{filtered.length}</span>.
        </div>
        {totalPages > 1 && (
          <nav
            aria-label="Library pagination"
            className="mt-4 flex items-center justify-center gap-1.5 flex-wrap"
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
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Custom Dropdown — replaces the native <select> because iOS Safari
// renders the option list as a free-floating popover that can land on
// the wrong side of the screen, and forces tiny option text. This
// version opens an inline menu directly below the button, with
// readable mobile-sized type and standard click-outside dismiss.
// ─────────────────────────────────────────────────────────────────
interface DropdownProps {
  /** Stable identifier — used to scope outside-click detection per dropdown. */
  id: string;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  label: string;
  active: boolean;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

function Dropdown({
  id,
  isOpen,
  onToggle,
  label,
  active,
  options,
  value,
  onChange,
}: DropdownProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Only close if the click is outside *this* dropdown. Other dropdowns
      // also wear data-dropdown attributes, but with different ids — that's
      // how we know a "click in another dropdown" should still close us.
      const owner = target.closest('[data-dropdown]');
      if ((owner as HTMLElement | null)?.dataset.dropdown !== id) {
        onToggle(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onToggle(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, id, onToggle]);

  return (
    <div className="relative" data-dropdown={id}>
      <button
        type="button"
        onClick={() => onToggle(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2.5 cursor-pointer transition-colors font-body text-[15px] md:text-[13.5px] ${
          active
            ? 'bg-[#E6EBDF] border-[#C9D3BE] text-forest-dark font-semibold'
            : 'bg-cream border-[#D8D4C5] text-ink font-medium hover:border-[#C9C5B7]'
        }`}
      >
        {label}
        <span
          aria-hidden="true"
          className="w-[8px] h-[8px] border-r-[1.5px] border-b-[1.5px] border-current opacity-60"
          style={{ transform: 'rotate(45deg) translate(-1px, -1px)' }}
        />
      </button>
      {isOpen && (
        <ul
          role="listbox"
          className="absolute left-0 top-[calc(100%+6px)] min-w-[200px] max-h-[60vh] overflow-y-auto bg-cream border border-[#D8D4C5] rounded-[10px] shadow-[0_18px_30px_-14px_rgba(45,58,46,0.25)] py-1.5 z-50 m-0 list-none p-0"
        >
          {options.map((o) => (
            <li key={o.value} className="m-0 p-0">
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                onClick={() => {
                  onChange(o.value);
                  onToggle(false);
                }}
                className={`w-full text-left font-body text-[15px] md:text-[14px] px-4 py-2.5 cursor-pointer border-0 bg-transparent transition-colors ${
                  o.value === value
                    ? 'bg-[#E6EBDF] text-forest-dark font-semibold'
                    : 'text-ink hover:bg-[#F2EFE4]'
                }`}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
