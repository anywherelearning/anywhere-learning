'use client';

/**
 * The parent's Learning Record: an auto-built, printable homeschool portfolio
 * page. Everything comes from the family's real completed activities, so the
 * parent never fills anything in. Designed to support US portfolio
 * requirements (a dated log of activities and progress per skill area) — see
 * the coverage audit + PA/NY rules. Framed as "supports your state's
 * requirements", not guaranteed compliance.
 */

import { useMemo, useState, useRef } from 'react';
import { childAge, loadProfile, type Child } from '@/lib/member-profile';
import { completionLog } from '@/lib/completions';
import { productDescriptions } from '@/lib/product-descriptions';
import { getProductSkills } from '@/lib/skills';
import { type Effort } from '@/lib/activity-effort';
import HeroScene from '@/components/account/HeroScene';
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

export default function LearningRecord({ activities }: { activities: PlanActivity[] }) {
  const [children, setChildren] = useState<Child[]>([]);
  const [kidIdx, setKidIdx] = useState(0);
  const [range, setRange] = useState<RangeId>('all');
  const [rangeOpen, setRangeOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const rangeRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [logPage, setLogPage] = useState(0); // activity-log pagination
  const [photos, setPhotos] = useState<Record<string, string[]>>({});
  const [customSkills, setCustomSkills] = useState<Record<string, string[]>>({});
  const [overrides, setOverrides] = useState<Record<string, { days: number; hours: number }>>({});
  const [editTimeKey, setEditTimeKey] = useState<string | null>(null); // which row's time is open
  // optional portfolio fields the parent fills in (kept controlled so they print)
  const [lastName, setLastName] = useState('');
  const [preparedBy, setPreparedBy] = useState('');
  const [grade, setGrade] = useState('');
  const [schoolYear, setSchoolYear] = useState('');
  const [bw, setBw] = useState(false); // print in black & white (save colour ink)

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
    setChildren(loadProfile()?.children ?? []);
    setPhotos(loadPhotos());
    setCustomSkills(loadCustomSkills());
    setOverrides(loadOverrides());
    setReady(true);
  }, []);

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

  // Reset to the first page whenever the filtered set changes.
  useEffect(() => { setLogPage(0); }, [kidId, range, customFrom, customTo]);

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

    const days = new Set(rows.map((r) => r.at.slice(0, 10))).size;

    // completions per Skills-Map area (an activity builds several, so it counts
    // toward each area it develops)
    const catCount: Record<string, number> = {};
    for (const r of rows) for (const terr of territoriesForSlug(r.a.slug)) catCount[terr] = (catCount[terr] ?? 0) + 1;
    const covered = Object.keys(catCount).length;

    return { rows, days, catCount, covered };
  }, [kidId, range, bySlug, bounds.start, bounds.end]);

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
  const genDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const cats = [...catUniverse.entries()]
    .map(([slug, meta]) => ({ slug, ...meta, n: record.catCount[slug] ?? 0 }))
    .sort((a, b) => b.n - a.n);
  const maxCat = Math.max(1, ...cats.map((c) => c.n));

  // Per-row time: a manual override for that activity if set, else the effort
  // estimate. Editing one row flows straight into the totals below.
  const rowKey = (r: { slug: string; child: string; at: string }) => `${r.slug}__${r.child}__${r.at}`;
  const rowEst = (r: { slug: string; child: string; at: string; a: PlanActivity }) =>
    overrides[rowKey(r)] ?? DEFAULT_TIME_EST[r.a.effort];

  // Estimated instructional days + hours across the completed activities.
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

  return (
    <div style={{ background: 'linear-gradient(180deg,var(--am-bg1),var(--am-bg2))', minHeight: '100vh', paddingBottom: 60, color: 'var(--am-ink)' }}>
      <style>{`
        .lr-log-off { display: none !important; }
        .lr-printonly { display: none; }
        /* black & white mode desaturates the whole sheet (screen + print) */
        .lr-bw { filter: grayscale(1); }
        @media print {
          .lr-noprint { display: none !important; }
          .lr-printonly { display: block !important; }
          nav, footer, header[class] { display: none !important; }
          /* keep every background/colour (coverage bars, badges) in the PDF */
          .lr-page, .lr-page * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .lr-page { background: #fff !important; padding: 0 !important; }
          .lr-sheet { box-shadow: none !important; border: none !important; margin: 0 !important; max-width: none !important; }
          /* a printed portfolio lists every activity, not just the on-screen page */
          .lr-log-off { display: flex !important; }
          /* the log starts on its own page (an activity with a photo is too tall
             to squeeze under the heading on page 1), then flows across pages —
             never splitting a single activity */
          .lr-log-section { break-before: page; page-break-before: always; }
          .lr-log-row { break-inside: avoid; page-break-inside: avoid; }
          /* work-sample photos are tiny on screen but large in the portfolio PDF */
          .lr-photo { width: 210px !important; height: 210px !important; border-radius: 10px !important; }
          @page { margin: 1.4cm; }
        }
      `}</style>

      {/* screen-only storybook banner — hidden when printing so the sheet stays a clean document */}
      <header className="lr-noprint" style={{ position: 'relative', overflow: 'hidden', minHeight: 'clamp(150px,20vw,206px)', background: 'linear-gradient(180deg, var(--am-sky1), var(--am-sky2))', padding: 'clamp(18px,2.5vw,26px) clamp(16px,4vw,40px) clamp(26px,3vw,38px)' }}>
        <HeroScene tone="light" hillHeight={100} />
        <div style={{ position: 'relative', maxWidth: 860, margin: '0 auto' }}>
          <div style={{ fontFamily: 'var(--font-catalog),monospace', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--am-trail)', marginBottom: 8 }}>
            Anywhere Learning · Home Education Record
          </div>
          <div style={{ fontFamily: 'var(--font-plate),sans-serif', fontSize: 'clamp(32px,6vw,52px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--am-ink)', lineHeight: 1.02 }}>
            The learning keeps adding up
          </div>
          <p style={{ fontSize: 16, color: 'var(--am-muted)', margin: '12px 0 0', maxWidth: '48ch', lineHeight: 1.55 }}>
            Everything your family finishes gathers itself here into a portfolio you can print any time.
          </p>
        </div>
      </header>

      <div className="lr-page" style={{ padding: 'clamp(16px,4vw,40px) clamp(12px,4vw,40px)' }}>
        {/* controls */}
        <div className="lr-noprint" style={{ maxWidth: 860, margin: '0 auto 16px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {children.length > 1 && (
              <div style={{ display: 'inline-flex', gap: 5 }}>
                {children.map((c, i) => (
                  <button key={c.id ?? i} onClick={() => setKidIdx(i)} style={chip(i === kidIdx)}>{childLabel(c, i)}</button>
                ))}
              </div>
            )}
            <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              {/* Time range — one dropdown with presets + a custom range */}
              <div ref={rangeRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setRangeOpen((o) => !o)}
                  aria-haspopup="menu"
                  aria-expanded={rangeOpen}
                  style={{ ...chip(range !== 'all'), display: 'inline-flex', alignItems: 'center', gap: 7 }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
                  {range === 'custom' ? (customFrom || customTo ? bounds.label : 'Custom range') : rangeButtonLabel(range)}
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: rangeOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}><path d="M6 9l6 6 6-6" /></svg>
                </button>
                {rangeOpen && (
                  <div role="menu" style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 50, width: 232, background: '#fffdf9', border: '1px solid rgba(61,92,59,0.18)', borderRadius: 12, boxShadow: '0 20px 44px -18px rgba(45,58,46,0.5)', padding: 6 }}>
                    {RANGES.filter((r) => r.id !== 'custom').map((r) => (
                      <button
                        key={r.id}
                        onClick={() => { setRange(r.id); setRangeOpen(false); }}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 11px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: range === r.id ? 700 : 500, background: range === r.id ? '#E6EBDF' : 'transparent', color: range === r.id ? '#3d5c3b' : '#54524b' }}
                      >
                        {r.label}
                      </button>
                    ))}
                    <div style={{ borderTop: '1px solid rgba(61,92,59,0.12)', margin: '5px 4px' }} />
                    <div style={{ padding: '4px 7px 7px' }}>
                      <div style={{ fontFamily: 'var(--font-catalog),monospace', fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--am-gold)', marginBottom: 6 }}>Custom range</div>
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
              {/* colour vs black & white for the printout */}
              <div style={{ display: 'inline-flex', border: '1px solid rgba(61,92,59,0.2)', borderRadius: 9999, overflow: 'hidden', background: '#fffdf9' }}>
                <button onClick={() => setBw(false)} title="Print in full colour" style={{ ...printToggle, background: !bw ? '#588157' : 'transparent', color: !bw ? '#faf9f6' : '#54524b' }}>Color</button>
                <button onClick={() => setBw(true)} title="Print in black &amp; white (saves ink)" style={{ ...printToggle, background: bw ? '#54524b' : 'transparent', color: bw ? '#faf9f6' : '#54524b' }}>B&amp;W</button>
              </div>
              <button onClick={() => window.print()} className="hover:brightness-95" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 15px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, color: '#faf9f6', background: '#588157', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M6 14h12v7H6z" /></svg>
                Print / Save as PDF
              </button>
            </div>
          </div>
        </div>

        {/* the sheet */}
        <div className={`lr-sheet${bw ? ' lr-bw' : ''}`} style={{ maxWidth: 860, margin: '0 auto', background: '#fffdf9', border: '1px solid rgba(88,129,87,0.16)', borderRadius: 16, padding: 'clamp(22px,4vw,44px)', boxShadow: '0 3px 16px -8px rgba(70,55,30,0.16)' }}>
          {/* cover */}
          <div style={{ borderBottom: '2px solid #588157', paddingBottom: 18, marginBottom: 22 }}>
            <div style={{ fontFamily: 'var(--font-catalog),monospace', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--am-gold)', marginBottom: 6 }}>Anywhere Learning · Home Education Record</div>
            <h1 style={{ fontFamily: 'var(--font-plate),sans-serif', fontSize: 'clamp(30px,5vw,44px)', fontWeight: 800, letterSpacing: '-0.015em', color: '#3d5c3b', margin: '0 0 8px', lineHeight: 1.03 }}>{kidName}{lastName ? ` ${lastName}` : ''}&apos;s Learning Record</h1>
            <div style={{ fontSize: 14, color: '#6f6c63' }}>
              {age != null ? `Age ${age} · ` : ''}{bounds.label} · generated {genDate}
            </div>
            {/* print-only: the filled optional fields, since the inputs below are screen-only */}
            {(preparedBy || grade || schoolYear) && (
              <div className="lr-printonly" style={{ fontSize: 13, color: '#6f6c63', marginTop: 4 }}>
                {[preparedBy && `Prepared by ${preparedBy}`, grade && `Grade ${grade}`, schoolYear && `School year ${schoolYear}`].filter(Boolean).join(' · ')}
              </div>
            )}
            <div className="lr-noprint" style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, maxWidth: 460 }}>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name (optional)" style={{ ...preparedInput, width: '100%', minWidth: 0 }} />
              <input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="Grade (optional)" style={{ ...preparedInput, width: '100%', minWidth: 0 }} />
              <input value={preparedBy} onChange={(e) => setPreparedBy(e.target.value)} placeholder="Prepared by (optional)" style={{ ...preparedInput, width: '100%', minWidth: 0 }} />
              <input value={schoolYear} onChange={(e) => setSchoolYear(e.target.value)} placeholder="School year (optional)" style={{ ...preparedInput, width: '100%', minWidth: 0 }} />
            </div>
          </div>

          {/* metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10, marginBottom: 10 }}>
            {[
              { n: `${record.rows.length}`, l: 'Activities completed' },
              { n: `${record.covered} of ${catUniverse.size}`, l: 'Areas covered' },
              { n: `≈ ${estTotals.days}`, l: 'Days (estimated)' },
              { n: `≈ ${roundHrs}`, l: 'Hours (estimated)' },
            ].map((m) => (
              <div key={m.l} style={{ background: '#faf9f6', borderRadius: 12, padding: '13px 12px', border: '1px solid rgba(88,129,87,0.12)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-plate),sans-serif', fontSize: 26, fontWeight: 800, color: '#3d5c3b', lineHeight: 1, whiteSpace: 'nowrap' }}>{m.n}</div>
                <div style={{ fontSize: 11.5, color: 'var(--am-muted)', marginTop: 5, lineHeight: 1.25 }}>{m.l}</div>
              </div>
            ))}
          </div>
          <p className="lr-noprint" style={{ fontSize: 12, color: 'var(--am-muted)', margin: '0 0 26px' }}>
            Days &amp; hours are estimated from each activity&apos;s length — tap any activity&apos;s time below to adjust it.
          </p>

          {/* area coverage */}
          <Section title="Coverage by area" note="Which Future-Ready skills the completed activities build. Most activities build several areas, so each counts toward more than one.">
            {record.rows.length === 0 ? (
              <Empty>No activities completed in this range yet.</Empty>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {cats.map((c) => {
                  return (
                    <div key={c.slug} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 96px', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: '#2b2a26', fontWeight: c.n > 0 ? 600 : 400, opacity: c.n > 0 ? 1 : 0.55 }}>{c.label}</span>
                      <span style={{ height: 12, borderRadius: 999, background: 'rgba(88,129,87,0.1)', overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: '100%', width: `${(c.n / maxCat) * 100}%`, background: c.color, borderRadius: 999 }} />
                      </span>
                      <span style={{ fontSize: 12, color: '#6f6c63', textAlign: 'right' }}>{c.n === 0 ? '–' : `${c.n} ${c.n === 1 ? 'activity' : 'activities'}`}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          {/* activity log */}
          <Section title="Log of activities" note="Every activity completed, newest first. A contemporaneous log of educational work." breakable className="lr-log-section">
            {record.rows.length === 0 ? (
              <Empty>Nothing logged in this range yet.</Empty>
            ) : (() => {
              const PER_PAGE = 5;
              const pageCount = Math.max(1, Math.ceil(record.rows.length / PER_PAGE));
              const page = Math.min(logPage, pageCount - 1);
              const from = page * PER_PAGE;
              return (
                <>
                  <div>
                    {record.rows.map((r, i) => {
                      const onPage = i >= from && i < from + PER_PAGE;
                      const skills = baseSkills(r.a.slug);
                      const extra = customSkills[r.a.slug] ?? [];
                      return (
                        <div
                          key={i}
                          className={`lr-log-row${onPage ? '' : ' lr-log-off'}`}
                          style={{ display: 'flex', gap: 16, alignItems: 'flex-start', borderTop: '1px solid rgba(61,92,59,0.1)', padding: '14px 0' }}
                        >
                          {/* cover photo */}
                          <div style={{ flex: 'none', width: 66, aspectRatio: '4 / 5', borderRadius: 9, overflow: 'hidden', border: '1px solid rgba(61,92,59,0.14)', background: r.a.trackColor + '18' }}>
                            {r.a.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              // eager, not lazy: off-page rows are display:none on
                              // screen, so a lazy cover would never load and would
                              // print blank. The record is a bounded list, so load all.
                              <img src={r.a.imageUrl} alt="" loading="eager" decoding="sync" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: r.a.trackColor, fontFamily: 'var(--font-plate),sans-serif', fontWeight: 800, fontSize: 22 }}>{r.a.title.charAt(0)}</div>
                            )}
                          </div>

                          {/* title + description (gets the room) */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, color: '#2b2a26', fontSize: 14.5, lineHeight: 1.25 }}>{r.a.title}</div>
                            <div style={{ color: 'var(--am-muted)', fontSize: 12.5, marginTop: 3, lineHeight: 1.5 }}>{briefly(productDescriptions[r.a.slug]?.opening ?? r.a.excerpt)}</div>
                            <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#3d5c3b', marginRight: 1 }}>Skills:</span>
                              {skills.map((s) => (
                                <span key={s} style={{ fontSize: 11, color: '#3d5c3b', background: 'rgba(61,92,59,0.09)', border: '1px solid rgba(61,92,59,0.18)', borderRadius: 999, padding: '2px 8px' }}>{s}</span>
                              ))}
                              {extra.map((s) => (
                                <span key={s} style={{ fontSize: 11, color: '#7a3d24', background: 'rgba(201,123,92,0.12)', border: '1px solid rgba(201,123,92,0.3)', borderRadius: 999, padding: '2px 3px 2px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  {s}
                                  <button type="button" className="lr-noprint" onClick={() => removeSkill(r.a.slug, s)} aria-label={`Remove ${s}`} style={{ border: 'none', background: 'rgba(201,123,92,0.22)', color: '#7a3d24', borderRadius: '50%', width: 15, height: 15, lineHeight: '13px', fontSize: 11, cursor: 'pointer', padding: 0 }}>×</button>
                                </span>
                              ))}
                              <SkillAdder onAdd={(v) => addSkill(r.a.slug, v)} />
                            </div>
                            {/* work-sample photos — shown in print, add/remove screen-only */}
                            {(() => {
                              const key = `${r.slug}__${r.child}`;
                              const pics = photos[key] ?? [];
                              return (
                                <div style={{ marginTop: 8 }}>
                                  {pics.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                      {pics.map((url, pi) => (
                                        <div key={pi} className="lr-photo" style={{ position: 'relative', width: 78, height: 78, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(61,92,59,0.16)' }}>
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img src={url} alt="Work sample" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                          <button className="lr-noprint" onClick={() => removePhoto(key, pi)} title="Remove photo" style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.55)', color: '#fff', cursor: 'pointer', fontSize: 12, lineHeight: '16px', padding: 0 }}>×</button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <label className="lr-noprint" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: pics.length ? 8 : 4, fontSize: 12, fontWeight: 600, color: '#588157', cursor: 'pointer' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                                    {pics.length ? 'Add another photo' : 'Add a photo of their work'}
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) addPhoto(key, f); e.currentTarget.value = ''; }} />
                                  </label>
                                </div>
                              );
                            })()}
                          </div>

                          {/* date / area / time — stacked in one narrow column */}
                          <div style={{ flex: 'none', width: 132 }}>
                            <MetaLine label="Date" value={fmtDate(r.at)} />
                            <MetaLine
                              label={territoriesForSlug(r.a.slug).length > 1 ? 'Areas' : 'Area'}
                              value={territoriesForSlug(r.a.slug).map((s) => catUniverse.get(s)?.label).filter(Boolean).join(', ') || r.a.categoryLabel}
                            />
                            {/* editable per-activity time — click to adjust; flows into totals */}
                            {(() => {
                              const key = rowKey(r);
                              const est = rowEst(r);
                              const editing = editTimeKey === key;
                              const overridden = !!overrides[key];
                              const hrs = est.hours < 1 ? `${Math.round(est.hours * 60)} min` : `${est.hours} ${est.hours === 1 ? 'hr' : 'hrs'}`;
                              const label = `≈ ${hrs}${est.days > 1 ? ` · ${est.days} days` : ''}`;
                              return (
                                <div style={{ position: 'relative', marginBottom: 7 }} data-time-cell>
                                  <span style={{ fontFamily: 'var(--font-catalog),monospace', fontSize: 9.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--am-gold)' }}>Time</span>
                                  <button
                                    onClick={() => setEditTimeKey(editing ? null : key)}
                                    title="Adjust the time for this activity"
                                    style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12.5, lineHeight: 1.3, color: overridden ? '#588157' : '#54524b', fontWeight: overridden ? 600 : 400 }}
                                  >
                                    {label}
                                    <svg className="lr-noprint" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ opacity: 0.55 }}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                                  </button>
                                  {editing && (
                                    <div className="lr-noprint" style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', zIndex: 40, width: 174, background: '#fffdf9', border: '1px solid rgba(61,92,59,0.18)', borderRadius: 10, boxShadow: '0 16px 34px -16px rgba(45,58,46,0.5)', padding: 10 }}>
                                      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '7px 8px', alignItems: 'center' }}>
                                        <span style={{ fontSize: 12, color: 'var(--am-muted)' }}>Hours</span>
                                        <input type="number" min={0} step={0.25} value={est.hours} onChange={(e) => setOverride(key, est, 'hours', Number(e.target.value))} style={estNum} />
                                        <span style={{ fontSize: 12, color: 'var(--am-muted)' }}>Days</span>
                                        <input type="number" min={0} step={0.5} value={est.days} onChange={(e) => setOverride(key, est, 'days', Number(e.target.value))} style={estNum} />
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 9 }}>
                                        {overridden ? (
                                          <button onClick={() => resetOverride(key)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 11.5, color: 'var(--am-muted)', textDecoration: 'underline' }}>Reset</button>
                                        ) : <span />}
                                        <button onClick={() => setEditTimeKey(null)} style={{ fontSize: 12, fontWeight: 600, color: '#faf9f6', background: '#588157', border: 'none', borderRadius: 8, padding: '5px 12px', cursor: 'pointer' }}>Done</button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {pageCount > 1 && (
                    <div className="lr-noprint" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12.5, color: 'var(--am-muted)' }}>{record.rows.length} activities · page {page + 1} of {pageCount}</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="button" disabled={page === 0} onClick={() => setLogPage(page - 1)} style={pageBtn(page === 0)}>← Prev</button>
                        <button type="button" disabled={page >= pageCount - 1} onClick={() => setLogPage(page + 1)} style={pageBtn(page >= pageCount - 1)}>Next →</button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </Section>

          <p style={{ fontSize: 11.5, color: 'var(--am-muted)', lineHeight: 1.5, margin: '26px 0 0', borderTop: '1px solid rgba(61,92,59,0.1)', paddingTop: 14 }}>
            This record is generated from your family's completed Anywhere Learning activities. It is designed to support common homeschool portfolio requirements (a dated log of educational activities and progress across skill areas). Requirements vary by state; check your state's specific rules and, where required, have a qualified evaluator review your portfolio.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, note, children, breakable, className }: { title: string; note?: string; children: React.ReactNode; breakable?: boolean; className?: string }) {
  return (
    <section className={className} style={{ marginBottom: 26, breakInside: breakable ? 'auto' : 'avoid' }}>
      <h2 style={{ fontFamily: 'var(--font-plate),sans-serif', fontSize: 22, fontWeight: 800, color: '#588157', margin: '0 0 2px' }}>{title}</h2>
      {note && <p style={{ fontSize: 12.5, color: 'var(--am-muted)', margin: '0 0 12px', lineHeight: 1.5 }}>{note}</p>}
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 13, color: 'var(--am-muted)', margin: 0, padding: '14px 16px', background: 'var(--pack-panel)', borderRadius: 10, lineHeight: 1.5 }}>
      {children}
    </p>
  );
}

function chip(sel: boolean): React.CSSProperties {
  return {
    padding: '7px 13px', borderRadius: 9999, cursor: 'pointer', fontSize: 13, fontWeight: 600,
    background: sel ? '#588157' : '#fffdf9', color: sel ? '#faf9f6' : '#54524b',
    border: `1.5px solid ${sel ? '#588157' : 'rgba(61,92,59,0.2)'}`,
  };
}
const preparedInput: React.CSSProperties = { fontSize: 13, padding: '7px 11px', borderRadius: 9, border: '1px solid rgba(61,92,59,0.2)', background: '#faf9f6', color: '#2b2a26', minWidth: 180 };
const dateRow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8 };
const dateLbl: React.CSSProperties = { fontSize: 12, color: 'var(--am-muted)', width: 34, flex: 'none' };
const dateInput: React.CSSProperties = { flex: 1, minWidth: 0, fontSize: 12.5, padding: '6px 8px', borderRadius: 8, border: '1px solid rgba(61,92,59,0.22)', background: '#faf9f6', color: '#2b2a26' };
const estNum: React.CSSProperties = { width: 62, fontSize: 13, padding: '6px 8px', borderRadius: 8, border: '1px solid rgba(61,92,59,0.22)', background: '#faf9f6', color: '#2b2a26', textAlign: 'center' };
const printToggle: React.CSSProperties = { border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, padding: '7px 13px' };

// One "Date / Area / Time" line in the log row's right-hand column.
function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 7 }}>
      <span style={{ fontFamily: 'var(--font-catalog),monospace', fontSize: 9.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--am-gold)' }}>{label}</span>
      <span style={{ fontSize: 12.5, color: '#54524b', lineHeight: 1.3 }}>{value}</span>
    </div>
  );
}

function pageBtn(disabled: boolean): React.CSSProperties {
  return {
    fontSize: 12.5, fontWeight: 600, padding: '7px 13px', borderRadius: 9,
    border: '1px solid rgba(61,92,59,0.2)', background: '#fffdf9',
    color: disabled ? '#b6b2a6' : '#588157',
    cursor: disabled ? 'default' : 'pointer',
  };
}
