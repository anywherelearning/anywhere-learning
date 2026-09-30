'use client';

/**
 * This Month — the member zone's monthly editorial page. The hero is a wall
 * calendar page: the month's family challenge as a streak chart the family
 * ticks off day by day (saved with the challenge in lib/month-challenge, so
 * the Adventure Map home still sees accepted and finished challenges). Below
 * it, each themed set shows three covers fanned like a hand of cards; "See
 * all" opens the full set, and a cover opens the activity card with "Add to
 * a trail". The reading, books and tips sit in one slim strip.
 *
 * All data is resolved server-side in ../(store)/account/this-month/page.tsx
 * (content in lib/this-month.ts) and passed in as plain props.
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import HeroScene from '@/components/account/HeroScene';
import { minsLabel, hexToRgba } from '@/lib/activity-visuals';
import { areaMetaForSlug } from '@/lib/roadmap';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { addToWeek, weekSlugs, FAMILY_TARGET } from '@/lib/week';
import { loadProfile, childAge, type Child } from '@/lib/member-profile';
import { readChallenges, writeChallenge, clearChallenge, type MonthChallengeEntry } from '@/lib/month-challenge';
import type { Effort } from '@/lib/activity-effort';

export type MonthActivity = {
  slug: string;
  title: string;
  category: string;
  categoryLabel: string;
  effort: Effort;
  imageUrl?: string | null;
  trackColor: string;
  trackDeep: string;
  description?: string;
  href: string;
};

export type BookRec = {
  /** Age band this pick suits, e.g. "Ages 6–10". */
  ages: string;
  title: string;
  author: string;
  /** Cover image path in /public (e.g. /books/lemonade-in-winter.jpg). Optional. */
  cover?: string;
  /** Where the cover/title links to (author or publisher book page). Opens in a new tab. */
  link?: string;
};

export type SectionExtras = {
  /** An internal blog post to read → /blog/[slug]. heroImage is resolved server-side. */
  read?: { slug: string; title: string; minutes?: number; heroImage?: string };
  /** Read-together picks — a younger and an older book for the same theme. */
  books?: BookRec[];
  /** The flexible third card. Swap its contents every month. Items with a url
   *  render as external links (games/videos); items without render as bullets. */
  extra?: { title: string; note?: string; items: { label: string; url?: string }[] };
  /** One-line "why this matters" note for the parent. */
  mindset?: string;
};

export type MonthSection = {
  eyebrow: string;
  title: string;
  blurb: string;
  accent: string;
  accentDeep: string;
  activities: MonthActivity[];
  extras?: SectionExtras;
};

export type ThisMonthData = {
  month: string;
  /** Calendar year of `month`, for the hero calendar's weekdays. */
  year: number;
  intro: string;
  challengeId: string;
  skill: MonthSection;
  seasonal: MonthSection;
  challenge: { title: string; short: string; text: string };
};

/* ── tiny cover with graceful fallback ─────────────────────────────────── */
function Cover({ a, className, style }: { a: MonthActivity; className?: string; style?: React.CSSProperties }) {
  if (a.imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={a.imageUrl} alt="" loading="lazy" className={className} style={{ objectFit: 'cover', objectPosition: 'top', ...style }} />;
  }
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{ display: 'grid', placeItems: 'center', background: `linear-gradient(135deg, ${hexToRgba(a.trackColor, 0.24)}, ${hexToRgba(a.trackDeep, 0.14)})`, ...style }}
    >
      <span style={{ fontFamily: 'var(--font-plate),sans-serif', fontSize: 46, fontWeight: 800, color: a.trackDeep, opacity: 0.55 }}>{a.title.charAt(0)}</span>
    </span>
  );
}

/* ── effort pill that floats over an image ─────────────────────────────── */
function EffortPill({ effort, corner = 'tr' }: { effort: Effort; corner?: 'tr' | 'bl' }) {
  const pos: React.CSSProperties = corner === 'bl' ? { bottom: 10, left: 10 } : { top: 10, right: 10 };
  return (
    <span
      style={{
        position: 'absolute', ...pos, zIndex: 2,
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(6px)',
        color: '#3d3527', fontFamily: 'var(--font-catalog),monospace', fontSize: 10.5, fontWeight: 700,
        letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 9px', borderRadius: 999,
        boxShadow: '0 4px 12px -6px rgba(40,30,10,0.5)',
      }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
      {minsLabel(effort)}
    </span>
  );
}

/* ── activity detail modal (description + add to a trail) ──────────────── */
function ActivityModal({ a, accent, accentDeep, onClose }: { a: MonthActivity; accent: string; accentDeep: string; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const trapRef = useFocusTrap(mounted);
  useEffect(() => {
    setMounted(true);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow; };
  }, [onClose]);
  if (!mounted) return null;

  return createPortal(
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(30,24,16,0.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div ref={trapRef} role="dialog" aria-modal="true" aria-label={a.title} style={{ width: '100%', maxWidth: 380, maxHeight: '90vh', overflowY: 'auto', background: 'var(--am-paper)', borderRadius: 20, boxShadow: '0 40px 90px -30px rgba(20,14,6,0.7)' }} className="tm-modal">
        <div style={{ position: 'relative', aspectRatio: '1 / 1', overflow: 'hidden', background: hexToRgba(accent, 0.1) }}>
          <Cover a={a} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectPosition: 'top' }} />
          <span aria-hidden="true" style={{ position: 'absolute', top: 12, left: 12, zIndex: 2, width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.92)', boxShadow: '0 4px 12px -6px rgba(40,30,10,0.5)' }}>
            <span style={{ width: 11, height: 11, borderRadius: '50%', background: areaMetaForSlug(a.slug)[0]?.color ?? accentDeep }} />
          </span>
          <EffortPill effort={a.effort} corner="bl" />
          <button type="button" onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 12, right: 12, zIndex: 3, width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.92)', color: '#3d3527', display: 'grid', placeItems: 'center', boxShadow: '0 4px 12px -6px rgba(40,30,10,0.5)' }}>
            <CloseIcon />
          </button>
        </div>
        <div style={{ padding: 'clamp(18px,4vw,24px)' }}>
          <div style={{ fontFamily: 'var(--font-catalog),monospace', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: accentDeep, marginBottom: 6 }}>{areaMetaForSlug(a.slug).map((t) => t.name).slice(0, 2).join(' · ') || a.categoryLabel}</div>
          <h3 style={{ fontFamily: 'var(--font-plate),sans-serif', fontSize: 'clamp(21px,4vw,26px)', fontWeight: 800, color: 'var(--am-ink)', margin: '0 0 10px', lineHeight: 1.12 }}>{a.title}</h3>
          {a.description && <p style={{ fontSize: 14, color: 'var(--am-muted)', lineHeight: 1.6, margin: '0 0 18px' }}>{a.description}</p>}
          <AddToTrail slug={a.slug} title={a.title} accent={accent} accentDeep={accentDeep} />
          <Link href={a.href} style={{ display: 'inline-block', marginTop: 12, fontSize: 13.5, fontWeight: 600, color: accentDeep, textDecoration: 'none' }} className="tm-linkrow">Open full guide →</Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ── "add to a trail" — labeled button, expands inline (modal-safe) ────── */
function AddToTrail({ slug, title, accent, accentDeep }: { slug: string; title: string; accent: string; accentDeep: string }) {
  const [children, setChildren] = useState<Child[]>([]);
  const [added, setAdded] = useState(false);
  const [choosing, setChoosing] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);

  useEffect(() => {
    setChildren(loadProfile()?.children ?? []);
    setAdded(weekSlugs().has(slug));
  }, [slug]);

  const label = (c: Child, i: number) => c.name.trim() || `Child ${i + 1}`;
  function addFor(target: string, where: string) {
    addToWeek(slug, [target]);
    setAdded(true);
    setChoosing(false);
    setConfirm(where);
    window.setTimeout(() => setConfirm(null), 3200);
  }
  function onAdd() {
    if (children.length <= 1) addFor(FAMILY_TARGET, 'to the trail');
    else setChoosing((v) => !v);
  }

  const opt: React.CSSProperties = { display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13.5, color: 'var(--am-ink)' };
  return (
    <div>
      <button
        type="button"
        onClick={onAdd}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 999, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: '#fff', background: added ? accentDeep : accent, boxShadow: `0 12px 26px -14px ${hexToRgba(accentDeep, 0.8)}` }}
      >
        {added ? <CheckIcon /> : <PlusIcon />}
        {added ? 'On a trail, add again?' : 'Add to a trail'}
      </button>

      {choosing && (
        <div style={{ marginTop: 10, background: hexToRgba(accent, 0.08), border: `1px solid ${hexToRgba(accent, 0.22)}`, borderRadius: 12, padding: 6 }}>
          <p style={{ margin: 0, padding: '4px 12px', fontFamily: 'var(--font-catalog),monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: accentDeep }}>Add to</p>
          <button type="button" onClick={() => addFor(FAMILY_TARGET, 'to the family trail')} style={{ ...opt, fontWeight: 700, color: accentDeep }}>
            Whole family
            <span style={{ display: 'block', fontWeight: 400, fontSize: 11.5, color: 'var(--am-muted)' }}>Next stop on the home trail</span>
          </button>
          <div style={{ margin: '4px 0', borderTop: `1px solid ${hexToRgba(accent, 0.18)}` }} />
          <p style={{ margin: 0, padding: '4px 12px', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--am-muted)' }}>On their own</p>
          {children.map((c, i) => (
            <button key={c.id ?? i} type="button" onClick={() => addFor(c.id ?? label(c, i), `to ${label(c, i)}'s trail`)} style={opt}>
              {label(c, i)}{childAge(c) != null ? ` (${childAge(c)})` : ''}
            </button>
          ))}
        </div>
      )}

      {confirm && (
        <p style={{ margin: '10px 0 0', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 600, color: accentDeep }}>
          <CheckIcon /> Added {confirm}
        </p>
      )}
    </div>
  );
}

/* ── book cover (image, or a styled spine fallback) ────────────────────── */
function BookCover({ book, accent, accentDeep, size = 48 }: { book: BookRec; accent: string; accentDeep: string; size?: number }) {
  const box: React.CSSProperties = { flexShrink: 0, width: size, aspectRatio: '2 / 3', borderRadius: 6, overflow: 'hidden', boxShadow: '0 6px 14px -8px rgba(40,30,10,0.55)' };
  if (book.cover) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={book.cover} alt={`${book.title} cover`} loading="lazy" style={{ ...box, objectFit: 'cover' }} />;
  }
  return (
    <span aria-hidden="true" style={{ ...box, display: 'grid', placeItems: 'center', padding: 4, textAlign: 'center', background: `linear-gradient(150deg, ${hexToRgba(accent, 0.85)}, ${hexToRgba(accentDeep, 0.9)})` }}>
      <span style={{ fontFamily: 'var(--font-plate),sans-serif', fontSize: 8.5, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>{book.title}</span>
    </span>
  );
}

/* ── a bottom-sheet style dialog shared by "See all" and the extras ─────── */
function Sheet({ label, onClose, children, maxWidth = 560 }: { label: string; onClose: () => void; children: React.ReactNode; maxWidth?: number }) {
  const [mounted, setMounted] = useState(false);
  const trapRef = useFocusTrap(mounted);
  useEffect(() => {
    setMounted(true);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow; };
  }, [onClose]);
  if (!mounted) return null;

  return createPortal(
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(30,24,16,0.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div ref={trapRef} role="dialog" aria-modal="true" aria-label={label} className="tm-modal" style={{ position: 'relative', width: '100%', maxWidth, maxHeight: '88vh', overflowY: 'auto', background: 'var(--am-paper)', borderRadius: 20, padding: 'clamp(18px,4vw,26px)', boxShadow: '0 40px 90px -30px rgba(20,14,6,0.7)' }}>
        <button type="button" onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 12, right: 12, width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(58,44,23,0.08)', color: '#3d3527', display: 'grid', placeItems: 'center' }}>
          <CloseIcon />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}

const mono: React.CSSProperties = { fontFamily: 'var(--font-catalog),monospace', textTransform: 'uppercase', letterSpacing: '0.14em' };
const plate: React.CSSProperties = { fontFamily: 'var(--font-plate),sans-serif', fontWeight: 800 };
const PAPER = '0 1px 0 rgba(58,44,23,0.06), 0 18px 36px -22px rgba(58,44,23,0.45)';

/* ── the hero's wall calendar: the family challenge as a streak chart ──── */
function CalendarLeaf({ id, month, year, title, short, text }: { id: string; month: string; year: number; title: string; short: string; text: string }) {
  const [entry, setEntry] = useState<MonthChallengeEntry | null>(null);
  const [ready, setReady] = useState(false);
  const [today, setToday] = useState<{ y: number; m: number; d: number } | null>(null);

  useEffect(() => {
    setEntry(readChallenges()[id] ?? null);
    const n = new Date();
    setToday({ y: n.getFullYear(), m: n.getMonth(), d: n.getDate() });
    setReady(true);
  }, [id]);

  const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  // Monday-first grid: how many blank cells before the 1st.
  const lead = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  // Days you can tick: nothing in the future.
  const lastTickable = !today ? 0
    : today.y > year || (today.y === year && today.m > monthIndex) ? daysInMonth
    : today.y === year && today.m === monthIndex ? today.d
    : 0;
  const isToday = (d: number) => !!today && today.y === year && today.m === monthIndex && today.d === d;

  const status = entry?.status ?? 'idle';
  const days = new Set(entry?.days ?? []);

  const save = (next: MonthChallengeEntry | null) => {
    setEntry(next);
    if (next) writeChallenge(id, next); else clearChallenge(id);
  };
  const base = (s: 'accepted' | 'done'): MonthChallengeEntry => ({ status: s, month, title, at: new Date().toISOString(), days: [...days] });
  const toggleDay = (d: number) => {
    if (!entry) return;
    const next = new Set(days);
    if (next.has(d)) next.delete(d); else next.add(d);
    save({ ...entry, days: [...next].sort((a, b) => a - b) });
  };

  const flag = '#d0684a';
  const live = status !== 'idle';
  return (
    <div className="tm-leaf" style={{ position: 'relative', background: '#fffdf8', borderRadius: 6, boxShadow: '0 30px 60px -30px rgba(58,44,23,0.55)', padding: '30px clamp(16px,3vw,22px) 20px' }}>
      <span aria-hidden="true" style={{ position: 'absolute', top: -9, left: 22, right: 22, display: 'flex', justifyContent: 'space-between' }}>
        {Array.from({ length: 11 }).map((_, i) => <span key={i} style={{ width: 8, height: 18, borderRadius: 4, background: '#8d8474', boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.25)' }} />)}
      </span>
      {status === 'done' && <Confetti />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
        <span style={{ ...mono, display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 700, color: '#b8492f' }}><FlagIcon /> Family challenge</span>
        {live && <span style={{ ...mono, fontSize: 10.5, color: 'var(--am-muted)', letterSpacing: '0.08em' }}>{days.size} of {daysInMonth}</span>}
      </div>
      <h2 style={{ ...plate, fontSize: 'clamp(23px,3vw,27px)', letterSpacing: '-0.01em', color: 'var(--am-ink)', margin: '6px 0 4px', lineHeight: 1.05 }}>{title}</h2>
      <p style={{ fontSize: 13.5, color: 'var(--am-muted)', margin: '0 0 12px', lineHeight: 1.5 }}>
        {short}{live && status !== 'done' ? ' Tap a day when it happens.' : ''}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 5, opacity: live ? 1 : 0.55, transition: 'opacity .3s' }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i} aria-hidden="true" style={{ ...mono, fontSize: 9.5, textAlign: 'center', color: 'var(--am-muted)', letterSpacing: 0 }}>{d}</span>)}
        {Array.from({ length: lead }).map((_, i) => <span key={`b${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1;
          const on = days.has(d);
          const can = live && status !== 'done' && d <= lastTickable;
          return (
            <button
              key={d}
              type="button"
              disabled={!can}
              onClick={() => toggleDay(d)}
              aria-pressed={on}
              aria-label={`${month} ${d}${on ? ', done' : ''}`}
              className="tm-day"
              style={{
                aspectRatio: '1', borderRadius: 7, display: 'grid', placeItems: 'center', padding: 0,
                fontSize: 12, fontWeight: 600, cursor: can ? 'pointer' : 'default',
                background: on ? flag : 'rgba(58,44,23,0.05)', color: on ? '#fff' : 'var(--am-muted)',
                border: isToday(d) && !on ? `2px solid ${flag}` : '1px solid rgba(58,44,23,0.06)',
              }}
            >
              {on ? <CheckIcon /> : d}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, minHeight: 42 }}>
        {!ready ? null : status === 'idle' ? (
          <button type="button" onClick={() => save(base('accepted'))} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: flag, color: '#fff', fontWeight: 800, fontSize: 14, padding: '11px 20px', borderRadius: 999, border: 'none', cursor: 'pointer', boxShadow: '0 12px 26px -14px rgba(156,58,36,0.8)' }}>
            Accept this challenge <span aria-hidden="true">&rarr;</span>
          </button>
        ) : status === 'accepted' ? (
          <>
            <button type="button" onClick={() => save(base('done'))} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: flag, color: '#fff', fontWeight: 800, fontSize: 13.5, padding: '10px 18px', borderRadius: 999, border: 'none', cursor: 'pointer' }}>
              <MedalIcon small /> We did it
            </button>
            <button type="button" onClick={() => save(null)} className="tap" style={{ background: 'none', border: 'none', color: 'var(--am-muted)', fontSize: 12.5, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
              Not this month
            </button>
          </>
        ) : (
          <>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...plate, fontSize: 19, color: '#b8492f' }}><MedalIcon /> You did it!</span>
            <button type="button" onClick={() => save({ ...base('accepted'), days: [...days] })} className="tap" style={{ background: 'none', border: 'none', color: 'var(--am-muted)', fontSize: 12.5, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
              Undo
            </button>
          </>
        )}
      </div>

      <details className="tm-how" style={{ marginTop: 10, borderTop: '1px dashed rgba(58,44,23,0.18)', paddingTop: 10 }}>
        <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#b8492f' }}>How it works</summary>
        <p style={{ fontSize: 13.5, color: 'var(--am-muted)', lineHeight: 1.6, margin: '8px 0 0' }}>{text}</p>
      </details>
    </div>
  );
}

/* ── three covers fanned like a hand of cards ──────────────────────────── */
function Fan({ section, onOpen, onAll }: { section: MonthSection; onOpen: (a: MonthActivity) => void; onAll: () => void }) {
  const { activities, accentDeep } = section;
  const three = activities.slice(0, 3);
  // middle card on top
  const pos = three.length === 3
    ? [{ left: '6%', top: 26, rot: -8, z: 1 }, { left: '29%', top: 0, rot: 0, z: 3 }, { left: '52%', top: 26, rot: 8, z: 2 }]
    : three.map((_, i) => ({ left: `${14 + i * 30}%`, top: 12, rot: i ? 5 : -5, z: i + 1 }));
  return (
    <div className="tm-fan">
      {three.map((a, i) => (
        <button
          key={a.slug}
          type="button"
          onClick={() => onOpen(a)}
          aria-label={`Open ${a.title}`}
          className="tm-fan-card"
          style={{ left: pos[i].left, top: pos[i].top, zIndex: pos[i].z, transform: `rotate(${pos[i].rot}deg)`, ['--r' as string]: `${pos[i].rot}deg` }}
        >
          <Cover a={a} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        </button>
      ))}
      {activities.length > 0 && (
        <button type="button" onClick={onAll} className="tm-fan-all" style={{ background: accentDeep }}>
          See all {activities.length} activities <span aria-hidden="true">&rarr;</span>
        </button>
      )}
    </div>
  );
}

/* ── every activity in a set, as covers ────────────────────────────────── */
function AllSheet({ section, onPick, onClose }: { section: MonthSection; onPick: (a: MonthActivity) => void; onClose: () => void }) {
  return (
    <Sheet label={section.title} onClose={onClose} maxWidth={640}>
      <div style={{ ...mono, fontSize: 11, fontWeight: 700, color: section.accentDeep }}>{section.eyebrow}</div>
      <h3 style={{ ...plate, fontSize: 'clamp(22px,4vw,28px)', color: 'var(--am-ink)', margin: '6px 44px 16px 0', lineHeight: 1.08 }}>{section.title}</h3>
      <div className="tm-all">
        {section.activities.map((a) => (
          <button key={a.slug} type="button" onClick={() => onPick(a)} className="tm-all-card">
            <span style={{ position: 'relative', display: 'block', aspectRatio: '4 / 5', borderRadius: 10, overflow: 'hidden', boxShadow: PAPER, background: '#fffdf8' }}>
              <Cover a={a} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
            </span>
            <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: 'var(--am-ink)', marginTop: 8, lineHeight: 1.25 }}>{a.title}</span>
            <span style={{ display: 'block', fontSize: 12, color: 'var(--am-muted)', marginTop: 2 }}>{minsLabel(a.effort)}</span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

/* ── the slim strip: Read this · Read together · Try this too ──────────── */
function agesSpan(books: BookRec[]): string {
  const nums = books.flatMap((b) => (b.ages.match(/\d+/g) ?? []).map(Number));
  if (!nums.length) return '';
  return `, ages ${Math.min(...nums)} to ${Math.max(...nums)}`;
}

function ExtrasStrip({ section }: { section: MonthSection }) {
  const [open, setOpen] = useState<'books' | 'extra' | null>(null);
  const { extras, accent, accentDeep } = section;
  if (!extras || (!extras.read && !extras.books?.length && !extras.extra)) return null;

  const label = (t: string) => <span style={{ ...mono, display: 'block', fontSize: 9.5, fontWeight: 700, color: accentDeep, marginBottom: 2 }}>{t}</span>;
  const titleStyle: React.CSSProperties = { display: 'block', fontSize: 13.5, fontWeight: 700, color: 'var(--am-ink)', lineHeight: 1.25 };

  return (
    <div className="tm-strip">
      {extras.read && (
        <Link href={`/blog/${extras.read.slug}`} target="_blank" rel="noopener noreferrer" className="tm-chip">
          {extras.read.heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={extras.read.heroImage} alt="" loading="lazy" style={{ width: 46, height: 46, objectFit: 'cover', borderRadius: 9, flexShrink: 0 }} />
          ) : (
            <span style={{ width: 46, height: 46, borderRadius: 9, flexShrink: 0, display: 'grid', placeItems: 'center', background: hexToRgba(accent, 0.16), color: accentDeep }}><BookIcon /></span>
          )}
          <span style={{ minWidth: 0 }}>{label('Read this')}<span style={titleStyle}>{extras.read.title.split(' (')[0]}</span></span>
        </Link>
      )}
      {extras.books && extras.books.length > 0 && (
        <button type="button" onClick={() => setOpen('books')} className="tm-chip">
          <span style={{ display: 'flex', flexShrink: 0, width: 46, justifyContent: 'center' }}>
            {extras.books.slice(0, 2).map((b, i) => (
              <span key={b.title} style={{ marginLeft: i ? -12 : 0, transform: `rotate(${i ? 6 : -5}deg)` }}>
                <BookCover book={b} accent={accent} accentDeep={accentDeep} size={30} />
              </span>
            ))}
          </span>
          <span style={{ minWidth: 0 }}>{label('Read together')}<span style={titleStyle}>{extras.books.length} {extras.books.length === 1 ? 'book' : 'books'}{agesSpan(extras.books)}</span></span>
        </button>
      )}
      {extras.extra && (
        <button type="button" onClick={() => setOpen('extra')} className="tm-chip">
          <span style={{ width: 46, height: 46, borderRadius: 9, flexShrink: 0, display: 'grid', placeItems: 'center', background: hexToRgba(accent, 0.16), color: accentDeep }}><SparkIcon /></span>
          <span style={{ minWidth: 0 }}>{label('Try this too')}<span style={titleStyle}>{extras.extra.title}</span></span>
        </button>
      )}

      {open === 'books' && extras.books && (
        <Sheet label="Read together" onClose={() => setOpen(null)} maxWidth={440}>
          <div style={{ ...mono, fontSize: 11, fontWeight: 700, color: accentDeep, display: 'inline-flex', alignItems: 'center', gap: 7 }}><OpenBookIcon /> Read together</div>
          <p style={{ fontSize: 14, color: 'var(--am-muted)', margin: '8px 40px 16px 0', lineHeight: 1.5 }}>A younger and an older pick for this theme.</p>
          <div style={{ display: 'grid', gap: 16 }}>
            {extras.books.map((b) => {
              const inner = (
                <>
                  <BookCover book={b} accent={accent} accentDeep={accentDeep} size={56} />
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'inline-block', ...mono, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em', color: accentDeep, background: hexToRgba(accent, 0.16), padding: '2px 7px', borderRadius: 999, marginBottom: 5 }}>{b.ages}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 700, color: 'var(--am-ink)', lineHeight: 1.25 }}>{b.title}{b.link && <ExtIcon />}</span>
                    <span style={{ display: 'block', fontSize: 12.5, color: 'var(--am-muted)', marginTop: 2 }}>by {b.author}</span>
                  </span>
                </>
              );
              return b.link ? (
                <a key={b.title} href={b.link} target="_blank" rel="noopener noreferrer" className="tm-linkrow" style={{ display: 'flex', gap: 14, alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>{inner}</a>
              ) : (
                <span key={b.title} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>{inner}</span>
              );
            })}
          </div>
        </Sheet>
      )}

      {open === 'extra' && extras.extra && (
        <Sheet label={extras.extra.title} onClose={() => setOpen(null)} maxWidth={460}>
          <div style={{ ...mono, fontSize: 11, fontWeight: 700, color: accentDeep, display: 'inline-flex', alignItems: 'center', gap: 7 }}><SparkIcon /> Try this too</div>
          <h3 style={{ ...plate, fontSize: 24, color: 'var(--am-ink)', margin: '6px 40px 6px 0', lineHeight: 1.1 }}>{extras.extra.title}</h3>
          {extras.extra.note && <p style={{ fontSize: 13.5, color: 'var(--am-muted)', lineHeight: 1.5, margin: '0 0 6px' }}>{extras.extra.note}</p>}
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            {extras.extra.items.map((it) => it.url ? (
              <a key={it.label} href={it.url} target="_blank" rel="noopener noreferrer" className="tm-linkrow" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--am-ink)', fontSize: 14.5, fontWeight: 500 }}>
                <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 8, display: 'grid', placeItems: 'center', background: hexToRgba(accent, 0.18), color: accentDeep }}><PlayIcon /></span>
                <span style={{ minWidth: 0, flex: 1 }}>{it.label}</span>
                <ExtIcon />
              </a>
            ) : (
              <span key={it.label} style={{ display: 'flex', gap: 10, fontSize: 14.5, color: 'var(--am-ink)', lineHeight: 1.5 }}>
                <span style={{ flexShrink: 0, marginTop: 8, width: 6, height: 6, borderRadius: '50%', background: accent }} />
                <span>{it.label}</span>
              </span>
            ))}
          </div>
        </Sheet>
      )}
    </div>
  );
}

/* ── a themed set: text on one side, the fanned covers on the other ────── */
function Section({ section, flip }: { section: MonthSection; flip?: boolean }) {
  const [active, setActive] = useState<MonthActivity | null>(null);
  const [all, setAll] = useState(false);
  const { accent, accentDeep } = section;
  return (
    <section>
      <div className={flip ? 'tm-sec tm-sec-flip' : 'tm-sec'}>
        {section.activities.length > 0 && <Fan section={section} onOpen={setActive} onAll={() => setAll(true)} />}
        <div className="tm-sec-text">
          <div style={{ ...mono, fontSize: 11.5, fontWeight: 700, color: accentDeep }}>{section.eyebrow}</div>
          <h2 style={{ ...plate, fontSize: 'clamp(28px,4.2vw,40px)', letterSpacing: '-0.02em', color: 'var(--am-ink)', margin: '6px 0 10px', lineHeight: 1.04 }}>{section.title}</h2>
          <p style={{ fontSize: 15.5, color: 'var(--am-muted)', lineHeight: 1.6, margin: 0, maxWidth: '58ch' }}>{section.blurb}</p>
          {section.extras?.mindset && (
            <p style={{ margin: '16px 0 0', fontSize: 14.5, fontStyle: 'italic', lineHeight: 1.55, color: accentDeep, borderLeft: `3px solid ${accent}`, paddingLeft: 12, maxWidth: '58ch' }}>
              {section.extras.mindset}
            </p>
          )}
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <ExtrasStrip section={section} />
      </div>

      {all && (
        <AllSheet
          section={section}
          onClose={() => setAll(false)}
          onPick={(a) => { setAll(false); setActive(a); }}
        />
      )}
      {active && <ActivityModal a={active} accent={accent} accentDeep={accentDeep} onClose={() => setActive(null)} />}
    </section>
  );
}

/* ── small building blocks ─────────────────────────────────────────────── */

function FlagIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 22V4M4 4h12l-2 4 2 4H4" /></svg>;
}
function BookIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></svg>;
}
function PlayIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>;
}
function SparkIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l1.9 5.6L19.5 9l-4.6 3.4L16.4 18 12 14.7 7.6 18l1.5-5.6L4.5 9l5.6-1.4z" /></svg>;
}
function ExtIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, opacity: 0.5 }}><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>;
}
function CloseIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>;
}
function PlusIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>;
}
function OpenBookIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>;
}
function CheckIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>;
}
function MedalIcon({ small }: { small?: boolean }) {
  const n = small ? 17 : 26;
  return <svg width={n} height={n} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="15" r="6" /><path d="M12 12v0M8.5 9 6 2h4l1.5 4M15.5 9 18 2h-4l-1.5 4" /><path d="m12 13.5 1 2 2 .2-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L9 15.7l2-.2z" /></svg>;
}

function Confetti() {
  const bits = [
    [8, '#ffd66b'], [20, '#fff'], [33, '#ffb38a'], [47, '#ffe9a8'], [60, '#fff'], [73, '#ffd66b'], [86, '#ffb38a'], [94, '#fff'],
  ] as const;
  return (
    <span aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {bits.map(([x, c], i) => (
        <span key={i} style={{ position: 'absolute', left: `${x}%`, top: -12, width: 8, height: 8, borderRadius: i % 2 ? '50%' : 2, background: c, opacity: 0.9, animation: `tmFall ${2.4 + (i % 3) * 0.6}s linear ${(i % 4) * 0.2}s infinite` }} />
      ))}
    </span>
  );
}


/* ── page shell ────────────────────────────────────────────────────────── */
export default function ThisMonthView(data: ThisMonthData) {
  const lineup: [string, string, string][] = [
    [data.skill.accent, data.skill.eyebrow, data.skill.title],
    [data.seasonal.accent, data.seasonal.eyebrow, data.seasonal.title],
    ['#d0684a', 'Family challenge', data.challenge.title],
  ];
  return (
    <main style={{ position: 'relative', background: 'linear-gradient(180deg,var(--am-bg1),var(--am-bg2))', minHeight: '100vh', color: 'var(--am-ink)', overflow: 'hidden' }}>
      <style>{`
        @keyframes tmFall{0%{transform:translateY(0) rotate(0)}100%{transform:translateY(420px) rotate(360deg)}}
        @keyframes tmPop{0%{opacity:0;transform:translateY(10px) scale(.98)}100%{opacity:1;transform:none}}
        .tm-modal{animation:tmPop .22s ease}
        .tm-hero{display:grid;gap:34px;align-items:center}
        @media (min-width:860px){.tm-hero{grid-template-columns:1fr 360px;gap:40px}}
        .tm-leaf{transform:rotate(1.2deg)}
        @media (max-width:520px){.tm-leaf{transform:none}}
        .tm-day:not(:disabled):hover{box-shadow:0 0 0 2px rgba(208,104,74,.45)}
        .tm-how summary{list-style:none}
        .tm-how summary::-webkit-details-marker{display:none}
        .tm-how summary::after{content:' +'}
        .tm-how[open] summary::after{content:' \\2212'}
        .tm-lineup{list-style:none;padding:0;margin:20px 0 0;display:grid;gap:9px}
        .tm-lineup li{display:grid;grid-template-columns:10px 1fr;column-gap:10px;align-items:baseline;font-size:15px}
        .tm-lineup .k{font-family:var(--font-catalog),monospace;text-transform:uppercase;letter-spacing:.14em;font-size:10.5px;color:var(--am-muted)}
        @media (min-width:560px){.tm-lineup li{grid-template-columns:10px 150px 1fr}}
        @media (max-width:559px){.tm-lineup .t{grid-column:2}}
        .tm-sec{display:grid;gap:26px;align-items:center}
        .tm-sec .tm-sec-text{order:-1}
        @media (min-width:820px){
          .tm-sec{grid-template-columns:380px 1fr;gap:48px}
          .tm-sec .tm-sec-text{order:0}
          .tm-sec-flip{grid-template-columns:1fr 380px}
          .tm-sec-flip .tm-fan{order:2}
        }
        .tm-fan{position:relative;height:clamp(250px,62vw,300px);max-width:400px;width:100%;margin:0 auto}
        @media (min-width:820px){.tm-fan{height:290px}}
        .tm-fan-card{position:absolute;width:42%;aspect-ratio:4/5;padding:0;border:5px solid #fffdf8;border-radius:9px;overflow:hidden;cursor:pointer;background:#fffdf8;box-shadow:0 22px 40px -22px rgba(58,44,23,.6);transition:transform .25s ease}
        .tm-fan-card:hover,.tm-fan-card:focus-visible{transform:rotate(var(--r)) translateY(-8px)!important}
        .tm-fan-all{position:absolute;bottom:0;left:50%;transform:translateX(-50%);z-index:4;color:#fff;font-weight:700;font-size:13.5px;padding:9px 17px;border-radius:999px;border:none;cursor:pointer;white-space:nowrap;box-shadow:${PAPER}}
        .tm-fan-all:hover{filter:brightness(1.1)}
        .tm-strip{display:grid;gap:10px}
        @media (min-width:760px){.tm-strip{grid-template-columns:repeat(3,1fr)}}
        .tm-chip{display:flex;gap:12px;align-items:center;min-width:0;text-align:left;background:#fffdf8;border:none;border-radius:12px;padding:12px 14px;box-shadow:${PAPER};cursor:pointer;text-decoration:none;color:inherit;font:inherit;transition:transform .2s ease}
        .tm-chip:hover{transform:translateY(-2px)}
        .tm-all{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
        @media (min-width:520px){.tm-all{grid-template-columns:repeat(3,1fr)}}
        .tm-all-card{display:block;text-align:left;background:none;border:none;padding:0;cursor:pointer;font:inherit;transition:transform .2s ease}
        .tm-all-card:hover{transform:translateY(-3px)}
        .tm-linkrow{transition:transform .15s ease}
        .tm-linkrow:hover{transform:translateX(2px)}
        @media (prefers-reduced-motion:reduce){.tm-fan-card,.tm-chip,.tm-all-card,.tm-linkrow{transition:none}}
      `}</style>

      {/* hero: the month, its lineup, and the challenge calendar */}
      <header style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, var(--am-sky1), var(--am-sky2))', padding: 'clamp(26px,3.5vw,40px) clamp(16px,4vw,40px) clamp(44px,5vw,64px)' }}>
        <HeroScene tone="light" hillHeight={110} />
        <div className="tm-hero" style={{ position: 'relative', maxWidth: 1040, margin: '0 auto' }}>
          <div>
            <div style={{ ...mono, fontSize: 12, fontWeight: 700, color: 'var(--am-trail)' }}>This month at Anywhere Learning</div>
            <h1 style={{ ...plate, fontSize: 'clamp(46px,8vw,84px)', letterSpacing: '-0.035em', color: 'var(--am-ink)', margin: '10px 0 0', lineHeight: 0.95 }}>{data.month}</h1>
            <p style={{ fontSize: 17, color: 'var(--am-muted)', margin: '14px 0 0', maxWidth: '40ch', lineHeight: 1.55 }}>{data.intro}</p>
            <ul className="tm-lineup">
              {lineup.map(([c, k, t]) => (
                <li key={k}>
                  <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 3, background: c, transform: 'translateY(1px)' }} />
                  <span className="k">{k}</span>
                  <span className="t" style={{ fontWeight: 600 }}>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <CalendarLeaf id={data.challengeId} month={data.month} year={data.year} title={data.challenge.title} short={data.challenge.short} text={data.challenge.text} />
        </div>
      </header>

      <div style={{ position: 'relative', maxWidth: 1000, margin: '0 auto', padding: 'clamp(30px,4vw,52px) clamp(16px,4vw,40px) 72px', display: 'flex', flexDirection: 'column', gap: 'clamp(48px,6vw,68px)' }}>
        <Section section={data.skill} />
        <Section section={data.seasonal} flip />

        <p style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--am-muted)', margin: 0 }}>
          Refreshed at the start of every month. Something new is always on the way.
        </p>
      </div>
    </main>
  );
}
