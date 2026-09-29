'use client';

/**
 * The parent's Learning Record: an auto-built, printable homeschool portfolio
 * page. On screen it's a scrapbook (stat tiles, the 12 skill-area tiles, a card
 * per finished activity with a big work-photo slot). Printing swaps in a plain
 * document version (cover, totals, coverage bars, a dated log table), set up
 * from the "Print the portfolio" dialog. Everything comes from the family's real completed activities, so the
 * parent never fills anything in. Designed to support US portfolio
 * requirements (a dated log of activities and progress per skill area) — see
 * the coverage audit + PA/NY rules. Framed as "supports your state's
 * requirements", not guaranteed compliance.
 */

import { useMemo, useState, useRef } from 'react';
import { childAge, loadProfile, DEMO_KIDS, type Child } from '@/lib/member-profile';
import { completionLog } from '@/lib/completions';
import { productDescriptions } from '@/lib/product-descriptions';
import { getProductSkills } from '@/lib/skills';
import { type Effort } from '@/lib/activity-effort';
import HeroScene from '@/components/account/HeroScene';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { TERRITORIES, territoriesForSlug } from '@/lib/roadmap';

// Per-effort estimates of instructional days + hours. Rough by design (a Project
// is 2 days for one family, 5 for another), so the parent can adjust them.
const DEFAULT_TIME_EST: Record<Effort, { days: number; hours: number }> = {
  Quick: { days: 1, hours: 0.75 },
  'Half-Day': { days: 1, hours: 3.5 },
  Project: { days: 3, hours: 6 },
};
const TIME_OVERRIDE_KEY = 'al_time_override_v1';
const PHOTOS_KEY = 'al_work_photos_v1';
const CUSTOM_SKILLS_KEY = 'al_custom_skills_v1';

// Every activity's skills: the OCR-derived canonical set when we have it, else
// the hand-tagged skillTags (all 120 activities carry those), so the record is
// never blank. Parents can add their own on top to match state requirements.
function baseSkills(slug: string): string[] {
  const canonical = getProductSkills(slug)?.canonical;
  if (canonical && canonical.length) return canonical.slice(0, 6);
  return productDescriptions[slug]?.skillTags?.slice(0, 6) ?? [];
}

function loadCustomSkills(): Record<string, string[]> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(CUSTOM_SKILLS_KEY) || '{}'); } catch { return {}; }
}

// Small screen-only input for adding a custom skill to an activity.
function SkillAdder({ onAdd }: { onAdd: (v: string) => void }) {
  const [v, setV] = useState('');
  const commit = () => { const t = v.trim(); if (t) onAdd(t); setV(''); };
  return (
    <input
      className="lr-noprint"
      value={v}
      onChange={(e) => setV(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } }}
      onBlur={commit}
      placeholder="+ add skill"
      aria-label="Add a skill for this activity"
      style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, border: '1px dashed rgba(61,92,59,0.4)', background: 'transparent', color: '#3d5c3b', width: 92, outline: 'none' }}
    />
  );
}

function loadOverrides(): Record<string, { days: number; hours: number }> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(TIME_OVERRIDE_KEY) || '{}');
  } catch {
    return {};
  }
}

function loadPhotos(): Record<string, string[]> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(PHOTOS_KEY) || '{}');
  } catch {
    return {};
  }
}
/** Downscale an uploaded image to keep localStorage small; returns a JPEG data URL. */
function resizeImage(file: File, max = 700): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('no canvas'));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.62));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** First one or two sentences of a description, for a concise portfolio line. */
function briefly(text: string): string {
  const parts = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  let out = parts[0]?.trim() ?? text;
  if (out.length < 90 && parts[1]) out += ' ' + parts[1].trim();
  return out;
}
import type { PlanActivity } from '@/lib/weekly-plan';
import { useEffect } from 'react';

function childLabel(c: Child, i: number) {
  return c.name.trim() || `Child ${i + 1}`;
}

type RangeId = 'all' | 'year' | 'q90' | 'custom';
const RANGES: { id: RangeId; label: string }[] = [
  { id: 'all', label: 'All time' },
  { id: 'year', label: 'This year' },
  { id: 'q90', label: 'Last 90 days' },
  { id: 'custom', label: 'Custom range…' },
];

const fmtShort = (t: number) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function rangeBounds(id: RangeId, from?: string, to?: string): { start: number; end: number; label: string } {
  const now = new Date();
  const end = now.getTime();
  if (id === 'year') {
    const s = new Date(now.getFullYear(), 0, 1).getTime();
    return { start: s, end, label: `Jan 1 – ${fmtShort(end)}` };
  }
  if (id === 'q90') {
    const s = end - 90 * 24 * 60 * 60 * 1000;
    return { start: s, end, label: `${fmtShort(s)} – ${fmtShort(end)}` };
  }
  if (id === 'custom') {
    const s = from ? new Date(`${from}T00:00:00`).getTime() : 0;
    const e = to ? new Date(`${to}T23:59:59`).getTime() : end;
    return { start: s, end: e, label: `${from ? fmtShort(s) : 'Start'} – ${to ? fmtShort(e) : 'Now'}` };
  }
  return { start: 0, end, label: 'All time' };
}

/** Short label for the range button (compact, no year on presets). */
function rangeButtonLabel(id: RangeId): string {
  return RANGES.find((r) => r.id === id)?.label.replace('…', '') ?? 'All time';
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const COVER_KEY = 'al_record_cover_v1';
type CoverFields = { lastName: string; preparedBy: string; grade: string; schoolYear: string };
const EMPTY_COVER: CoverFields = { lastName: '', preparedBy: '', grade: '', schoolYear: '' };

const PAPER = '0 1px 0 rgba(58,44,23,0.06), 0 18px 36px -22px rgba(58,44,23,0.45)';
const plate: React.CSSProperties = { fontFamily: 'var(--font-plate),sans-serif', fontWeight: 800 };
const mono: React.CSSProperties = { fontFamily: 'var(--font-catalog),monospace', textTransform: 'uppercase', letterSpacing: '0.14em' };
const TILE_TINTS = ['#e6ecdf', '#f4e6d4', '#e3ebee', '#efe3e6'];
const PAGE_SIZE = 9;

export default function LearningRecord({
  activities,
  preview = false,
}: {
  activities: PlanActivity[];
  preview?: boolean;
}) {
  const [children, setChildren] = useState<Child[]>([]);
  const [kidIdx, setKidIdx] = useState(0);
  const [range, setRange] = useState<RangeId>('all');
  const [rangeOpen, setRangeOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const rangeRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(PAGE_SIZE); // cards shown on screen
  const [photos, setPhotos] = useState<Record<string, string[]>>({});
  const [customSkills, setCustomSkills] = useState<Record<string, string[]>>({});
  const [overrides, setOverrides] = useState<Record<string, { days: number; hours: number }>>({});
  const [editTimeKey, setEditTimeKey] = useState<string | null>(null); // which card's time is open
  const [skillsOpen, setSkillsOpen] = useState<string | null>(null); // which card's skills are open
  // optional cover fields for the printout, remembered per kid
  const [covers, setCovers] = useState<Record<string, CoverFields>>({});
  const [bw, setBw] = useState(false); // print in black & white (save colour ink)
  const [printOpen, setPrintOpen] = useState(false);

  function setOverride(key: string, base: { days: number; hours: number }, field: 'days' | 'hours', value: number) {
    setOverrides((prev) => {
      const cur = prev[key] ?? base;
      const next = { ...prev, [key]: { ...cur, [field]: Math.max(0, value) } };
      try { localStorage.setItem(TIME_OVERRIDE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }
  function resetOverride(key: string) {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[key];
      try { localStorage.setItem(TIME_OVERRIDE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }

  async function addPhoto(key: string, file: File) {
    try {
      const url = await resizeImage(file);
      setPhotos((prev) => {
        const next = { ...prev, [key]: [...(prev[key] ?? []), url] };
        try { localStorage.setItem(PHOTOS_KEY, JSON.stringify(next)); } catch { /* quota */ }
        return next;
      });
    } catch { /* ignore bad image */ }
  }
  function removePhoto(key: string, idx: number) {
    setPhotos((prev) => {
      const next = { ...prev, [key]: (prev[key] ?? []).filter((_, i) => i !== idx) };
      if (next[key].length === 0) delete next[key];
      try { localStorage.setItem(PHOTOS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }

  function addSkill(slug: string, name: string) {
    const v = name.trim();
    if (!v) return;
    setCustomSkills((prev) => {
      const cur = prev[slug] ?? [];
      if (cur.some((s) => s.toLowerCase() === v.toLowerCase()) || baseSkills(slug).some((s) => s.toLowerCase() === v.toLowerCase())) return prev;
      const next = { ...prev, [slug]: [...cur, v] };
      try { localStorage.setItem(CUSTOM_SKILLS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }
  function removeSkill(slug: string, name: string) {
    setCustomSkills((prev) => {
      const next = { ...prev, [slug]: (prev[slug] ?? []).filter((s) => s !== name) };
      if (next[slug].length === 0) delete next[slug];
      try { localStorage.setItem(CUSTOM_SKILLS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }

  useEffect(() => {
    if (!editTimeKey) return;
    const onDoc = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-time-cell]')) setEditTimeKey(null);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [editTimeKey]);

  useEffect(() => {
    if (!rangeOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (rangeRef.current && !rangeRef.current.contains(e.target as Node)) setRangeOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [rangeOpen]);

  useEffect(() => {
    // Guest teaser: show the generic demo family (matches the Home trail), not
    // the browser's real or stale data. The record stays empty (blurred behind
    // the paywall anyway); the point is the chips/header read Maya & Theo.
    if (preview) {
      setChildren(DEMO_KIDS);
      setReady(true);
      return;
    }
    setChildren(loadProfile()?.children ?? []);
    setPhotos(loadPhotos());
    setCustomSkills(loadCustomSkills());
    setOverrides(loadOverrides());
    try { setCovers(JSON.parse(localStorage.getItem(COVER_KEY) || '{}')); } catch { /* ignore */ }
    setReady(true);
  }, [preview]);

  const bySlug = useMemo(() => {
    const m = new Map<string, PlanActivity>();
    activities.forEach((a) => m.set(a.slug, a));
    return m;
  }, [activities]);

  // The 12 Future-Ready Skills Map areas — the same taxonomy the Library and
  // Focus areas use. An activity can build several, so coverage is richer than
  // a one-category-per-activity count.
  const catUniverse = useMemo(() => {
    const m = new Map<string, { label: string; color: string }>();
    for (const t of TERRITORIES) m.set(t.slug, { label: t.name, color: t.color });
    return m;
  }, []);

  const kid = children[kidIdx];
  const kidId = kid ? (kid.id ?? childLabel(kid, kidIdx)) : '';
  const bounds = rangeBounds(range, customFrom, customTo);

  // Back to the first screenful whenever the filtered set changes.
  useEffect(() => { setShown(PAGE_SIZE); }, [kidId, range, customFrom, customTo]);

  const record = useMemo(() => {
    const rows = completionLog()
      .filter((c) => c.child === kidId)
      .filter((c) => {
        const t = Date.parse(c.at);
        return t >= bounds.start && t <= bounds.end;
      })
      .map((c) => ({ ...c, a: bySlug.get(c.slug) }))
      .filter((r): r is typeof r & { a: PlanActivity } => Boolean(r.a))
      .sort((x, y) => y.at.localeCompare(x.at)); // newest first

    // completions per Skills-Map area (an activity builds several, so it counts
    // toward each area it develops)
    const catCount: Record<string, number> = {};
    for (const r of rows) for (const terr of territoriesForSlug(r.a.slug)) catCount[terr] = (catCount[terr] ?? 0) + 1;
    const covered = Object.keys(catCount).length;

    return { rows, catCount, covered };
  }, [kidId, bySlug, bounds.start, bounds.end]);

  if (!ready) return null;

  if (children.length === 0) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center', color: '#6f6c63' }}>
        Add your kids first, then their learning record fills in automatically.
      </div>
    );
  }

  const kidName = childLabel(kid, kidIdx);
  const age = childAge(kid);
  const cover = covers[kidId] ?? EMPTY_COVER;
  function setCover(field: keyof CoverFields, value: string) {
    setCovers((prev) => {
      const next = { ...prev, [kidId]: { ...(prev[kidId] ?? EMPTY_COVER), [field]: value } };
      try { localStorage.setItem(COVER_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }
  const genDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const cats = [...catUniverse.entries()]
    .map(([slug, meta]) => ({ slug, ...meta, n: record.catCount[slug] ?? 0 }))
    .sort((a, b) => b.n - a.n);
  const maxCat = Math.max(1, ...cats.map((c) => c.n));

  // Per-row time: a manual override for that activity if set, else the effort
  // estimate. Editing one row flows straight into the totals.
  const rowKey = (r: { slug: string; child: string; at: string }) => `${r.slug}__${r.child}__${r.at}`;
  const rowEst = (r: { slug: string; child: string; at: string; a: PlanActivity }) =>
    overrides[rowKey(r)] ?? DEFAULT_TIME_EST[r.a.effort];
  const timeLabel = (e: { days: number; hours: number }) => {
    const hrs = e.hours < 1 ? `${Math.round(e.hours * 60)} min` : `${e.hours} ${e.hours === 1 ? 'hr' : 'hrs'}`;
    return `≈ ${hrs}${e.days > 1 ? ` · ${e.days} days` : ''}`;
  };
  const areasOf = (slug: string) => territoriesForSlug(slug).map((s) => ({ slug: s, ...catUniverse.get(s)! })).filter((t) => t.label);

  const estTotals = record.rows.reduce(
    (acc, r) => {
      const e = rowEst(r);
      acc.days += e.days;
      acc.hours += e.hours;
      return acc;
    },
    { days: 0, hours: 0 },
  );
  const roundHrs = Math.round(estTotals.hours * 10) / 10;
  const stats = [
    { n: `${record.rows.length}`, l: record.rows.length === 1 ? 'Activity completed' : 'Activities completed' },
    { n: `${record.covered} of ${catUniverse.size}`, l: 'Skill areas reached' },
    { n: `≈ ${estTotals.days}`, l: 'Days (estimated)' },
    { n: `≈ ${roundHrs}`, l: 'Hours (estimated)' },
  ];
  const coverLine = [cover.preparedBy && `Prepared by ${cover.preparedBy}`, cover.grade && `Grade ${cover.grade}`, cover.schoolYear && `School year ${cover.schoolYear}`].filter(Boolean).join(' · ');

  function doPrint() {
    setPrintOpen(false);
    // let the dialog unmount before the print snapshot is taken
    window.setTimeout(() => window.print(), 60);
  }

  return (
    <div className="lr-page" style={{ background: 'linear-gradient(180deg,var(--am-bg1),var(--am-bg2))', minHeight: '100vh', paddingBottom: 60, color: 'var(--am-ink)' }}>
      <style>{`
        .lr-printonly { display: none; }
        .lr-bw { filter: grayscale(1); }
        .lr-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
        @media (min-width:760px){.lr-stats{grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}}
        .lr-areas{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
        @media (min-width:560px){.lr-areas{grid-template-columns:repeat(3,minmax(0,1fr))}}
        @media (min-width:860px){.lr-areas{grid-template-columns:repeat(6,minmax(0,1fr))}}
        .lr-cards{display:grid;gap:22px;align-items:start}
        @media (min-width:640px){.lr-cards{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media (min-width:980px){.lr-cards{grid-template-columns:repeat(3,minmax(0,1fr))}}
        .lr-card{transition:transform .2s ease}
        .lr-card:hover{transform:rotate(0deg)!important}
        .lr-add{transition:transform .15s ease}.lr-add:hover{transform:translateY(-1px)}
        .lr-time-pop{right:auto;left:0}
        @media print {
          .lr-noprint { display: none !important; }
          .lr-printonly { display: block !important; }
          nav, footer, header[class] { display: none !important; }
          .lr-page { background: #fff !important; padding: 0 !important; min-height: 0 !important; }
          /* own inner margin too, so the sheet never touches the paper edge even
             when the print window's margins are set to None */
          .lr-doc { box-sizing: border-box; width: 100%; max-width: 100%; padding: 0.35in 0.4in; }
          .lr-doc table { table-layout: fixed; width: 100%; }
          .lr-doc td { overflow-wrap: anywhere; }
          .lr-doc, .lr-doc * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .lr-log-row { break-inside: avoid; page-break-inside: avoid; }
          @page { margin: 0.5in; }
        }
      `}</style>

      {/* ══ SCREEN: the scrapbook ══════════════════════════════════════════ */}
      <div className="lr-noprint">
        <header style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, var(--am-sky1), var(--am-sky2))', padding: 'clamp(22px,3vw,32px) clamp(16px,4vw,40px) clamp(34px,4vw,48px)' }}>
          <HeroScene tone="light" hillHeight={100} />
          <div style={{ position: 'relative', maxWidth: 1080, margin: '0 auto' }}>
            <div style={{ ...mono, fontSize: 12, fontWeight: 700, color: 'var(--am-trail)' }}>Learning record</div>
            <h1 style={{ ...plate, fontSize: 'clamp(34px,6vw,56px)', letterSpacing: '-0.03em', lineHeight: 1, margin: '8px 0 0', color: 'var(--am-ink)' }}>
              {range === 'all' ? `${kidName}'s learning so far` : range === 'year' ? `${kidName}'s year so far` : `${kidName}'s learning`}
            </h1>
            <p style={{ fontSize: 16.5, color: 'var(--am-muted)', margin: '12px 0 0', maxWidth: '52ch', lineHeight: 1.55 }}>
              Everything {kidName} finishes lands here on its own. Add a photo of the work, then print it as a portfolio whenever you need one.
            </p>
          </div>
        </header>

        <div style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(22px,3.5vw,36px) clamp(16px,4vw,40px) 0' }}>
          {/* controls */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 24 }}>
            {children.length > 1 && children.map((c, i) => (
              <button key={c.id ?? i} type="button" onClick={() => setKidIdx(i)} aria-pressed={i === kidIdx} style={chip(i === kidIdx)}>{childLabel(c, i)}</button>
            ))}
            {/* Time range — one dropdown with presets + a custom range */}
            <div ref={rangeRef} style={{ position: 'relative', marginLeft: children.length > 1 ? 6 : 0 }}>
              <button
                type="button"
                onClick={() => setRangeOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={rangeOpen}
                style={{ ...chip(range !== 'all'), display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
                {range === 'custom' ? (customFrom || customTo ? bounds.label : 'Custom range') : rangeButtonLabel(range)}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: rangeOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}><path d="M6 9l6 6 6-6" /></svg>
              </button>
              {rangeOpen && (
                <div role="menu" style={{ position: 'absolute', left: 0, top: 'calc(100% + 6px)', zIndex: 50, width: 'min(232px, calc(100vw - 44px))', background: '#fffdf9', border: '1px solid rgba(61,92,59,0.18)', borderRadius: 12, boxShadow: '0 20px 44px -18px rgba(45,58,46,0.5)', padding: 6 }}>
                  {RANGES.filter((r) => r.id !== 'custom').map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => { setRange(r.id); setRangeOpen(false); }}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 11px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: range === r.id ? 700 : 500, background: range === r.id ? '#E6EBDF' : 'transparent', color: range === r.id ? '#3d5c3b' : '#54524b' }}
                    >
                      {r.label}
                    </button>
                  ))}
                  <div style={{ borderTop: '1px solid rgba(61,92,59,0.12)', margin: '5px 4px' }} />
                  <div style={{ padding: '4px 7px 7px' }}>
                    <div style={{ ...mono, fontSize: 10, letterSpacing: '.08em', color: 'var(--am-gold)', marginBottom: 6 }}>Custom range</div>
                    <label style={dateRow}><span style={dateLbl}>From</span>
                      <input type="date" value={customFrom} max={customTo || undefined} onChange={(e) => { setCustomFrom(e.target.value); setRange('custom'); }} style={dateInput} />
                    </label>
                    <label style={{ ...dateRow, marginTop: 6 }}><span style={dateLbl}>To</span>
                      <input type="date" value={customTo} min={customFrom || undefined} onChange={(e) => { setCustomTo(e.target.value); setRange('custom'); }} style={dateInput} />
                    </label>
                  </div>
                </div>
              )}
            </div>
            <button type="button" onClick={() => setPrintOpen(true)} className="hover:brightness-95" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 999, fontSize: 14, fontWeight: 700, color: '#faf9f6', background: '#588157', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <PrintIcon /> Print the portfolio
            </button>
          </div>

          {/* stat tiles */}
          <div className="lr-stats">
            {stats.map((m, i) => (
              <div key={m.l} style={{ background: TILE_TINTS[i], borderRadius: 16, padding: '18px 18px 16px', transform: `rotate(${[-1, 0.8, -0.6, 1][i]}deg)` }}>
                <div style={{ ...plate, fontSize: 'clamp(28px,4vw,40px)', lineHeight: 1, whiteSpace: 'nowrap' }}>{m.n}</div>
                <div style={{ fontSize: 13, color: 'var(--am-muted)', marginTop: 6 }}>{m.l}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--am-muted)', margin: '14px 0 0' }}>
            Days and hours are estimated from each activity&apos;s length. Tap any activity&apos;s time to adjust it.
          </p>

          {/* area tiles */}
          <h2 style={{ ...plate, fontSize: 'clamp(24px,3.4vw,32px)', margin: '40px 0 4px' }}>Where the learning landed</h2>
          <p style={{ fontSize: 14, color: 'var(--am-muted)', margin: '0 0 16px' }}>The 12 areas of the Future-Ready Skills Map. Most activities build more than one.</p>
          <div className="lr-areas">
            {cats.map((c) => (
              <div key={c.slug} style={{ borderRadius: 12, padding: '12px 12px 10px', background: c.n ? c.color : 'transparent', border: c.n ? '1.5px solid transparent' : '1.5px dashed rgba(58,44,23,0.2)', color: c.n ? '#fff' : 'var(--am-muted)' }}>
                <div style={{ ...plate, fontSize: 24, lineHeight: 1 }}>{c.n || <span aria-hidden="true">&middot;</span>}</div>
                <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6, lineHeight: 1.2 }}>{c.label}{c.n ? '' : <span className="sr-only"> (not yet)</span>}</div>
              </div>
            ))}
          </div>

          {/* activity cards */}
          <h2 style={{ ...plate, fontSize: 'clamp(24px,3.4vw,32px)', margin: '44px 0 16px' }}>What {kidName} did</h2>
          {record.rows.length === 0 ? (
            <p style={{ fontSize: 14.5, color: 'var(--am-muted)', margin: 0, padding: '22px 20px', background: '#fffdf8', borderRadius: 14, boxShadow: PAPER, lineHeight: 1.55 }}>
              Nothing here yet{range !== 'all' ? ' for these dates' : ''}. When {kidName} finishes an activity, mark it done in the Library and it shows up here with the date.
            </p>
          ) : (
            <>
              <div className="lr-cards">
                {record.rows.slice(0, shown).map((r, i) => {
                  const pkey = `${r.slug}__${r.child}`;
                  const pics = photos[pkey] ?? [];
                  const key = rowKey(r);
                  const est = rowEst(r);
                  const overridden = !!overrides[key];
                  const skills = baseSkills(r.a.slug);
                  const extra = customSkills[r.a.slug] ?? [];
                  return (
                    <article key={key} className="lr-card" style={{ background: '#fffdf8', borderRadius: 14, boxShadow: PAPER, transform: `rotate(${[-0.6, 0.5, -0.3, 0.6, -0.5, 0.3][i % 6]}deg)` }}>
                      <div style={{ position: 'relative', aspectRatio: '4 / 3', background: '#f1ece1', borderRadius: '14px 14px 0 0' }}>
                        {pics.length > 0 ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={pics[0]} alt={`${kidName}'s work: ${r.a.title}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px 14px 0 0', display: 'block' }} />
                            <button type="button" onClick={() => removePhoto(pkey, 0)} aria-label="Remove this photo" title="Remove photo" style={photoX}>×</button>
                          </>
                        ) : (
                          <>
                            {/* no photo yet: the guide's cover, whole, on a soft tint of its colour */}
                            <span aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: '14px 14px 0 0', overflow: 'hidden', background: `linear-gradient(160deg, ${r.a.trackColor}26, ${r.a.trackColor}10)`, display: 'grid', placeItems: 'center' }}>
                              {r.a.imageUrl ? (
                                // A 4:5 cover at 84% of the 4:3 slot's height is 50.4% of its width.
                                <span style={{ position: 'absolute', top: '8%', left: '24.8%', width: '50.4%', height: '84%', borderRadius: 5, border: '4px solid #fffdf8', boxShadow: PAPER, overflow: 'hidden', background: '#fffdf8', transform: `rotate(${i % 2 ? 2.5 : -2.5}deg)` }}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={r.a.imageUrl} alt="" loading="lazy" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                                </span>
                              ) : (
                                <span style={{ ...plate, fontSize: 44, color: r.a.trackDeep, opacity: 0.5 }}>{r.a.title.charAt(0)}</span>
                              )}
                            </span>
                            <label className="lr-add" style={{ position: 'absolute', right: 10, bottom: 10, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,253,248,0.94)', color: '#3d5c3b', fontSize: 12, fontWeight: 700, padding: '6px 11px', borderRadius: 999, cursor: 'pointer', boxShadow: '0 6px 14px -8px rgba(40,30,10,0.55)' }}>
                              <CameraIcon small />
                              Add a photo
                              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) addPhoto(pkey, f); e.currentTarget.value = ''; }} />
                            </label>
                          </>
                        )}
                        <span style={{ position: 'absolute', top: 10, left: 10, background: '#fffdf8', ...mono, fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 6, letterSpacing: '0.06em', color: 'var(--am-ink)' }}>
                          {new Date(r.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        {pics.length > 0 && <span style={{ position: 'absolute', right: 10, bottom: -18, width: 46, aspectRatio: '4 / 5', borderRadius: 5, border: '3px solid #fffdf8', boxShadow: PAPER, overflow: 'hidden', background: r.a.trackColor + '22' }}>
                          {r.a.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={r.a.imageUrl} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
                          )}
                        </span>}
                      </div>
                      <div style={{ padding: '14px 16px 14px' }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.25, paddingRight: pics.length ? 44 : 0, margin: 0 }}>{r.a.title}</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                          {areasOf(r.a.slug).map((t) => <span key={t.slug} style={{ fontSize: 11, fontWeight: 600, color: '#fff', background: t.color, padding: '2px 8px', borderRadius: 999 }}>{t.label}</span>)}
                        </div>

                        {/* extra photos, if more than one */}
                        {pics.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10, alignItems: 'center' }}>
                            {pics.slice(1).map((url, pi) => (
                              <span key={pi} style={{ position: 'relative', width: 46, height: 46, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(61,92,59,0.16)' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt="Work sample" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button type="button" onClick={() => removePhoto(pkey, pi + 1)} aria-label="Remove this photo" style={{ ...photoX, width: 16, height: 16, fontSize: 11, lineHeight: '14px', top: 2, right: 2 }}>×</button>
                              </span>
                            ))}
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#588157', cursor: 'pointer' }}>
                              + Add another photo
                              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) addPhoto(pkey, f); e.currentTarget.value = ''; }} />
                            </label>
                          </div>
                        )}

                        {/* time + skills */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12, paddingTop: 10, borderTop: '1px dashed rgba(61,92,59,0.16)' }}>
                          <div style={{ position: 'relative' }} data-time-cell>
                            <button
                              type="button"
                              onClick={() => setEditTimeKey(editTimeKey === key ? null : key)}
                              title="Adjust the time for this activity"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12.5, color: overridden ? '#588157' : 'var(--am-muted)', fontWeight: overridden ? 600 : 400 }}
                            >
                              {timeLabel(est)}
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ opacity: 0.55 }}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                            </button>
                            {editTimeKey === key && (
                              <div className="lr-time-pop" style={{ position: 'absolute', bottom: 'calc(100% + 6px)', zIndex: 40, width: 174, background: '#fffdf9', border: '1px solid rgba(61,92,59,0.18)', borderRadius: 10, boxShadow: '0 16px 34px -16px rgba(45,58,46,0.5)', padding: 10 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '7px 8px', alignItems: 'center' }}>
                                  <span style={{ fontSize: 12, color: 'var(--am-muted)' }}>Hours</span>
                                  <input type="number" min={0} step={0.25} value={est.hours} onChange={(e) => setOverride(key, est, 'hours', Number(e.target.value))} style={estNum} />
                                  <span style={{ fontSize: 12, color: 'var(--am-muted)' }}>Days</span>
                                  <input type="number" min={0} step={0.5} value={est.days} onChange={(e) => setOverride(key, est, 'days', Number(e.target.value))} style={estNum} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 9 }}>
                                  {overridden ? (
                                    <button type="button" onClick={() => resetOverride(key)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 11.5, color: 'var(--am-muted)', textDecoration: 'underline' }}>Reset</button>
                                  ) : <span />}
                                  <button type="button" onClick={() => setEditTimeKey(null)} style={{ fontSize: 12, fontWeight: 600, color: '#faf9f6', background: '#588157', border: 'none', borderRadius: 8, padding: '5px 12px', cursor: 'pointer' }}>Done</button>
                                </div>
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setSkillsOpen(skillsOpen === key ? null : key)}
                            aria-expanded={skillsOpen === key}
                            style={{ marginLeft: 'auto', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: '#588157' }}
                          >
                            Skills ({skills.length + extra.length}) {skillsOpen === key ? '−' : '+'}
                          </button>
                        </div>
                        {skillsOpen === key && (
                          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
                            {skills.map((s) => (
                              <span key={s} style={{ fontSize: 11, color: '#3d5c3b', background: 'rgba(61,92,59,0.09)', border: '1px solid rgba(61,92,59,0.18)', borderRadius: 999, padding: '2px 8px' }}>{s}</span>
                            ))}
                            {extra.map((s) => (
                              <span key={s} style={{ fontSize: 11, color: '#7a3d24', background: 'rgba(201,123,92,0.12)', border: '1px solid rgba(201,123,92,0.3)', borderRadius: 999, padding: '2px 3px 2px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                {s}
                                <button type="button" onClick={() => removeSkill(r.a.slug, s)} aria-label={`Remove ${s}`} style={{ border: 'none', background: 'rgba(201,123,92,0.22)', color: '#7a3d24', borderRadius: '50%', width: 15, height: 15, lineHeight: '13px', fontSize: 11, cursor: 'pointer', padding: 0 }}>×</button>
                              </span>
                            ))}
                            <SkillAdder onAdd={(v) => addSkill(r.a.slug, v)} />
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
              {record.rows.length > shown && (
                <div style={{ textAlign: 'center', marginTop: 28 }}>
                  <button type="button" onClick={() => setShown((n) => n + PAGE_SIZE)} style={{ ...chip(false), padding: '10px 20px', fontSize: 14 }}>
                    Show more ({record.rows.length - shown} left)
                  </button>
                </div>
              )}
            </>
          )}

          <p style={{ fontSize: 12, color: 'var(--am-muted)', lineHeight: 1.55, margin: '44px 0 0', maxWidth: '80ch' }}>
            The printed portfolio is designed to support common homeschool portfolio requirements (a dated log of educational activities and progress across skill areas). Requirements vary by state; check your state&apos;s rules and, where required, have a qualified evaluator review it.
          </p>
        </div>
      </div>

      {/* ══ PRINT: the clean document ═════════════════════════════════════ */}
      <div className={`lr-printonly lr-doc${bw ? ' lr-bw' : ''}`} style={{ color: '#2b2a26', background: '#fff' }}>
        <div style={{ borderBottom: '2px solid #588157', paddingBottom: 14, marginBottom: 18 }}>
          <div style={{ ...mono, fontSize: 10.5, fontWeight: 700, color: '#b8862f' }}>Anywhere Learning · Home Education Record</div>
          <h1 style={{ ...plate, fontSize: 34, color: '#3d5c3b', margin: '6px 0 4px', lineHeight: 1.05 }}>{kidName}{cover.lastName ? ` ${cover.lastName}` : ''}&apos;s Learning Record</h1>
          <div style={{ fontSize: 12.5, color: '#6f6c63' }}>{age != null ? `Age ${age} · ` : ''}{bounds.label} · generated {genDate}</div>
          {coverLine && <div style={{ fontSize: 12.5, color: '#6f6c63', marginTop: 3 }}>{coverLine}</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 18 }}>
          {stats.map((m, i) => (
            <div key={m.l} style={{ padding: '2px 12px', borderLeft: i ? '1px solid rgba(61,92,59,0.18)' : 'none' }}>
              <div style={{ ...plate, fontSize: 24, color: '#3d5c3b', lineHeight: 1 }}>{m.n}</div>
              <div style={{ fontSize: 10.5, color: '#6f6c63', marginTop: 4 }}>{m.l}</div>
            </div>
          ))}
        </div>

        <h2 style={docH2}>Coverage by area</h2>
        <p style={docNote}>Which Future-Ready skills the completed activities build. Most activities build several areas, so each counts toward more than one.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 28px', breakInside: 'avoid' }}>
          {cats.map((c) => (
            <div key={c.slug} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 22px', gap: 8, alignItems: 'center', fontSize: 11.5, opacity: c.n ? 1 : 0.5 }}>
              <span>{c.label}</span>
              <span style={{ height: 8, borderRadius: 8, background: 'rgba(88,129,87,0.12)' }}><span style={{ display: 'block', height: '100%', width: `${(c.n / maxCat) * 100}%`, background: c.color, borderRadius: 8 }} /></span>
              <span style={{ textAlign: 'right', color: '#6f6c63' }}>{c.n || '–'}</span>
            </div>
          ))}
        </div>

        <section className="lr-log-section" style={{ marginTop: 22 }}>
          <h2 style={docH2}>Log of activities</h2>
          <p style={docNote}>Every activity completed, newest first. A contemporaneous log of educational work.</p>
          {record.rows.length === 0 ? (
            <p style={{ fontSize: 12.5, color: '#6f6c63' }}>No activities completed in this range.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
              <thead>
                <tr style={{ ...mono, fontSize: 8.5, color: '#b8862f', textAlign: 'left' }}>
                  <th style={{ padding: '6px 6px 6px 0', fontWeight: 700, width: 78 }}>Date</th>
                  <th style={{ padding: 6, fontWeight: 700 }}>Activity</th>
                  <th style={{ padding: 6, fontWeight: 700, width: 118 }}>Areas</th>
                  <th style={{ padding: '6px 0 6px 6px', fontWeight: 700, width: 74, textAlign: 'right' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {record.rows.map((r) => {
                  const pics = photos[`${r.slug}__${r.child}`] ?? [];
                  const extra = customSkills[r.a.slug] ?? [];
                  return (
                    <tr key={rowKey(r)} className="lr-log-row" style={{ borderTop: '1px solid rgba(61,92,59,0.14)', verticalAlign: 'top' }}>
                      <td style={{ padding: '10px 6px 10px 0', color: '#6f6c63' }}>{fmtDate(r.at)}</td>
                      <td style={{ padding: '10px 6px' }}>
                        <div style={{ fontWeight: 700, fontSize: 12.5 }}>{r.a.title}</div>
                        <div style={{ color: '#6f6c63', marginTop: 2, lineHeight: 1.45 }}>{briefly(productDescriptions[r.a.slug]?.opening ?? r.a.excerpt)}</div>
                        <div style={{ marginTop: 4, color: '#3d5c3b' }}><b>Skills:</b> {[...baseSkills(r.a.slug), ...extra].join(', ')}</div>
                        {pics.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                            {pics.map((url, pi) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img key={pi} src={url} alt="Work sample" style={{ width: 170, height: 170, objectFit: 'cover', borderRadius: 8 }} />
                            ))}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px 6px', color: '#6f6c63' }}>{areasOf(r.a.slug).map((t) => t.label).join(', ') || r.a.categoryLabel}</td>
                      <td style={{ padding: '10px 0 10px 6px', textAlign: 'right', lineHeight: 1.35 }}>{timeLabel(rowEst(r)).replace(' · ', '\n').split('\n').map((t, ti) => <span key={ti} style={{ display: 'block' }}>{t}</span>)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        <p style={{ fontSize: 10.5, color: '#6f6c63', lineHeight: 1.5, margin: '20px 0 0', borderTop: '1px solid rgba(61,92,59,0.14)', paddingTop: 10 }}>
          This record is generated from the family&apos;s completed Anywhere Learning activities. It is designed to support common homeschool portfolio requirements (a dated log of educational activities and progress across skill areas). Requirements vary by state; check your state&apos;s specific rules and, where required, have a qualified evaluator review your portfolio.
        </p>
      </div>

      {printOpen && (
        <PrintSetup
          kidName={kidName}
          count={record.rows.length}
          rangeLabel={bounds.label}
          cover={cover}
          onCover={setCover}
          bw={bw}
          onBw={setBw}
          onPrint={doPrint}
          onClose={() => setPrintOpen(false)}
        />
      )}
    </div>
  );
}

/* ── the "set up the printout" dialog ──────────────────────────────────── */
function PrintSetup({
  kidName, count, rangeLabel, cover, onCover, bw, onBw, onPrint, onClose,
}: {
  kidName: string;
  count: number;
  rangeLabel: string;
  cover: CoverFields;
  onCover: (f: keyof CoverFields, v: string) => void;
  bw: boolean;
  onBw: (v: boolean) => void;
  onPrint: () => void;
  onClose: () => void;
}) {
  const trapRef = useFocusTrap(true);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const label = (t: string) => <div style={{ ...mono, fontSize: 10.5, fontWeight: 700, color: 'var(--am-trail)', marginBottom: 8 }}>{t}</div>;
  return (
    <div className="lr-noprint" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(30,24,16,0.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div ref={trapRef} role="dialog" aria-modal="true" aria-label="Print the portfolio" style={{ position: 'relative', width: '100%', maxWidth: 420, maxHeight: '90vh', overflowY: 'auto', background: 'var(--am-paper)', borderRadius: 20, padding: 'clamp(20px,4vw,26px)', boxShadow: '0 40px 90px -30px rgba(20,14,6,0.7)' }}>
        <button type="button" onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 12, right: 12, width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(58,44,23,0.08)', color: '#3d3527', fontSize: 18, lineHeight: 1 }}>×</button>
        <h2 style={{ ...plate, fontSize: 24, color: 'var(--am-ink)', margin: '0 40px 4px 0', lineHeight: 1.1 }}>Print the portfolio</h2>
        <p style={{ fontSize: 13.5, color: 'var(--am-muted)', margin: '0 0 18px', lineHeight: 1.5 }}>
          {kidName}&apos;s record, {count} {count === 1 ? 'activity' : 'activities'}, {rangeLabel.toLowerCase() === 'all time' ? 'all time' : rangeLabel}. It prints as a clean document with every activity, photo and skill.
        </p>
        {label('On the cover (optional)')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input value={cover.lastName} onChange={(e) => onCover('lastName', e.target.value)} placeholder="Last name" aria-label="Last name" style={preparedInput} />
          <input value={cover.grade} onChange={(e) => onCover('grade', e.target.value)} placeholder="Grade" aria-label="Grade" style={preparedInput} />
          <input value={cover.preparedBy} onChange={(e) => onCover('preparedBy', e.target.value)} placeholder="Prepared by" aria-label="Prepared by" style={preparedInput} />
          <input value={cover.schoolYear} onChange={(e) => onCover('schoolYear', e.target.value)} placeholder="School year" aria-label="School year" style={preparedInput} />
        </div>
        <div style={{ marginTop: 18 }}>
          {label('Print in')}
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" onClick={() => onBw(false)} aria-pressed={!bw} style={chip(!bw)}>Color</button>
            <button type="button" onClick={() => onBw(true)} aria-pressed={bw} style={chip(bw)}>Black &amp; white</button>
          </div>
        </div>
        <button type="button" onClick={onPrint} className="hover:brightness-95" style={{ marginTop: 22, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, background: '#588157', color: '#fff', fontWeight: 700, fontSize: 15, padding: '13px', borderRadius: 12, border: 'none', cursor: 'pointer' }}>
          <PrintIcon /> Print or save as PDF
        </button>
        <p style={{ fontSize: 12, color: 'var(--am-muted)', margin: '10px 0 0', textAlign: 'center' }}>To get a PDF, pick &ldquo;Save as PDF&rdquo; in the print window.</p>
      </div>
    </div>
  );
}

function PrintIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M6 14h12v7H6z" /></svg>;
}
function CameraIcon({ small }: { small?: boolean }) {
  const n = small ? 14 : 26;
  return <svg width={n} height={n} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={small ? undefined : { display: 'block', margin: '0 auto 6px' }}><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>;
}

function chip(sel: boolean): React.CSSProperties {
  return {
    padding: '7px 13px', borderRadius: 9999, cursor: 'pointer', fontSize: 13, fontWeight: 600,
    background: sel ? '#588157' : '#fffdf9', color: sel ? '#faf9f6' : '#54524b',
    border: `1.5px solid ${sel ? '#588157' : 'rgba(61,92,59,0.2)'}`,
  };
}
const photoX: React.CSSProperties = { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.55)', color: '#fff', cursor: 'pointer', fontSize: 15, lineHeight: '22px', padding: 0 };
const preparedInput: React.CSSProperties = { fontSize: 13.5, padding: '9px 11px', borderRadius: 9, border: '1px solid rgba(61,92,59,0.2)', background: '#fffdf9', color: '#2b2a26', width: '100%', minWidth: 0 };
const dateRow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8 };
const dateLbl: React.CSSProperties = { fontSize: 12, color: 'var(--am-muted)', width: 34, flex: 'none' };
const dateInput: React.CSSProperties = { flex: 1, minWidth: 0, fontSize: 12.5, padding: '6px 8px', borderRadius: 8, border: '1px solid rgba(61,92,59,0.22)', background: '#faf9f6', color: '#2b2a26' };
const estNum: React.CSSProperties = { width: 62, fontSize: 13, padding: '6px 8px', borderRadius: 8, border: '1px solid rgba(61,92,59,0.22)', background: '#faf9f6', color: '#2b2a26', textAlign: 'center' };
const docH2: React.CSSProperties = { fontFamily: 'var(--font-plate),sans-serif', fontSize: 18, fontWeight: 800, color: '#588157', margin: '0 0 2px' };
const docNote: React.CSSProperties = { fontSize: 11, color: '#6f6c63', margin: '0 0 10px', lineHeight: 1.45 };
