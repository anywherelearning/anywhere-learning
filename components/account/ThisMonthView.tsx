'use client';

/**
 * This Month — the member zone's monthly editorial page. A warm, colorful,
 * image-forward layout: a seasonal hero, two themed sections of activity cards
 * built from real cover images (not icons), and one interactive family
 * challenge the parent can accept and check off (persisted to localStorage).
 *
 * All data is resolved server-side in ../(store)/account/this-month/page.tsx and
 * passed in as plain props; this component only owns hover states + the
 * challenge toggle, so it stays a thin client layer.
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
import { readChallenges, writeChallenge, clearChallenge } from '@/lib/month-challenge';
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
  intro: string;
  challengeId: string;
  skill: MonthSection;
  seasonal: MonthSection;
  challenge: { title: string; text: string };
};

type ChallengeState = 'idle' | 'accepted' | 'done';

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

/* ── cover carousel: one activity cover at a time; tap opens a detail modal ─ */
function CoverCarousel({ activities, accent, accentDeep }: { activities: MonthActivity[]; accent: string; accentDeep: string }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  if (activities.length === 0) return null;
  const i = Math.min(index, activities.length - 1);
  const a = activities[i];
  const prev = () => setIndex((n) => (n - 1 + activities.length) % activities.length);
  const next = () => setIndex((n) => (n + 1) % activities.length);
  const arrow = (dir: 'left' | 'right'): React.CSSProperties => ({
    position: 'absolute', top: 'calc(50% - 19px)', [dir === 'left' ? 'left' : 'right']: -13,
    width: 36, height: 36, borderRadius: '50%', border: `1px solid ${hexToRgba(accent, 0.3)}`, cursor: 'pointer',
    background: 'var(--am-paper)', color: accentDeep, display: 'grid', placeItems: 'center', zIndex: 3,
    boxShadow: '0 8px 18px -10px rgba(40,30,10,0.5)',
  } as React.CSSProperties);

  return (
    <div style={{ width: '100%', maxWidth: 230, margin: '0 auto' }} className="tm-cover-wrap">
      <div style={{ position: 'relative' }} className="tm-cover-rel">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Open ${a.title}`}
          style={{ display: 'block', width: '100%', padding: 0, cursor: 'pointer', position: 'relative', borderRadius: 14, overflow: 'hidden', border: `1px solid ${hexToRgba(accent, 0.3)}`, boxShadow: `0 22px 44px -26px ${hexToRgba(accentDeep, 0.6)}`, transform: 'rotate(-1.5deg)', background: 'var(--am-paper)' }}
          className="tm-cover tm-cover-btn"
        >
          {activities.map((act, n) => (
            <span key={act.slug} style={{ position: 'absolute', inset: 0, opacity: n === i ? 1 : 0, transition: 'opacity .3s ease' }}>
              <Cover a={act} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
            </span>
          ))}
          <span aria-hidden="true" style={{ position: 'absolute', top: 10, left: 10, zIndex: 2, width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', boxShadow: '0 4px 12px -6px rgba(40,30,10,0.5)' }}>
            <span style={{ width: 11, height: 11, borderRadius: '50%', background: areaMetaForSlug(a.slug)[0]?.color ?? accentDeep }} />
          </span>
          <EffortPill effort={a.effort} />
        </button>

        {activities.length > 1 && (
          <>
            <button type="button" onClick={prev} aria-label="Previous cover" style={arrow('left')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button type="button" onClick={next} aria-label="Next cover" style={arrow('right')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
            {/* counter sits ON the cover so it doesn't add column height (keeps the
                mindset note beside it bottom-aligned to the image) */}
            <span style={{ position: 'absolute', bottom: 9, left: '50%', transform: 'translateX(-50%)', zIndex: 3, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', color: accentDeep, fontSize: 11, fontWeight: 600, padding: '3px 11px', borderRadius: 999, boxShadow: '0 4px 12px -6px rgba(40,30,10,0.5)' }}>
              {i + 1} <span style={{ opacity: 0.5 }}>/</span> {activities.length}
            </span>
          </>
        )}
      </div>

      {open && <ActivityModal a={a} accent={accent} accentDeep={accentDeep} onClose={() => setOpen(false)} />}
    </div>
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
        {added ? 'On a trail — add again?' : 'Add to a trail'}
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
function BookCover({ book, accent, accentDeep }: { book: BookRec; accent: string; accentDeep: string }) {
  const box: React.CSSProperties = { flexShrink: 0, width: 48, aspectRatio: '2 / 3', borderRadius: 6, overflow: 'hidden', boxShadow: '0 6px 14px -8px rgba(40,30,10,0.55)' };
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

/* ── the three enrichment cards: Read this · Read together · Extra ──────── */
function cardLabel(text: string, accentDeep: string, icon: React.ReactNode) {
  return (
    <div style={{ fontFamily: 'var(--font-catalog),monospace', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: accentDeep, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
      <span style={{ display: 'grid', placeItems: 'center' }}>{icon}</span>{text}
    </div>
  );
}

function EnrichRow({ extras, accent, accentDeep }: { extras?: SectionExtras; accent: string; accentDeep: string }) {
  if (!extras || (!extras.read && !extras.books?.length && !extras.extra)) return null;
  // three graduated shades of the section accent so the row reads as a set
  const shade = (n: 0 | 1 | 2): React.CSSProperties => ({
    background: hexToRgba(accent, [0.06, 0.11, 0.16][n]),
    border: `1px solid ${hexToRgba(accent, [0.18, 0.22, 0.26][n])}`,
    borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%',
  });
  const body: React.CSSProperties = { padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 };

  return (
    <div className="tm-cards">
      {/* 1 · Read this — a blog post, with its hero image */}
      {extras.read && (
        <Link href={`/blog/${extras.read.slug}`} target="_blank" rel="noopener noreferrer" style={{ ...shade(0), textDecoration: 'none', color: 'inherit' }} className="tm-card">
          <span style={{ position: 'relative', display: 'block', aspectRatio: '16 / 9', overflow: 'hidden', background: hexToRgba(accent, 0.14) }}>
            {extras.read.heroImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={extras.read.heroImage} alt="" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: accentDeep }}><BookIcon /></span>
            )}
          </span>
          <span style={body}>
            {cardLabel('Read this', accentDeep, <BookIcon />)}
            <span style={{ fontFamily: 'var(--font-plate),sans-serif', fontSize: 15.5, fontWeight: 700, color: 'var(--am-ink)', lineHeight: 1.25 }}>{extras.read.title}</span>
            <span style={{ marginTop: 'auto', fontSize: 12.5, fontWeight: 600, color: accentDeep }}>Read on the blog →</span>
          </span>
        </Link>
      )}

      {/* 2 · Read together — a younger and an older book pick */}
      {extras.books && extras.books.length > 0 && (
        <div style={shade(1)} className="tm-card">
          <span style={body}>
            {cardLabel('Read together', accentDeep, <OpenBookIcon />)}
            <span style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {extras.books.map((b) => {
                const inner = (
                  <>
                    <BookCover book={b} accent={accent} accentDeep={accentDeep} />
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'inline-block', fontFamily: 'var(--font-catalog),monospace', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: accentDeep, background: hexToRgba(accent, 0.16), padding: '2px 7px', borderRadius: 999, marginBottom: 4 }}>{b.ages}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13.5, fontWeight: 600, color: 'var(--am-ink)', lineHeight: 1.25 }}>
                        {b.title}{b.link && <ExtIcon />}
                      </span>
                      <span style={{ display: 'block', fontSize: 11.5, color: 'var(--am-muted)' }}>by {b.author}</span>
                    </span>
                  </>
                );
                return b.link ? (
                  <a key={b.title} href={b.link} target="_blank" rel="noopener noreferrer" className="tm-linkrow" style={{ display: 'flex', gap: 11, alignItems: 'flex-start', textDecoration: 'none', color: 'inherit' }}>{inner}</a>
                ) : (
                  <span key={b.title} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>{inner}</span>
                );
              })}
            </span>
          </span>
        </div>
      )}

      {/* 3 · Extra — flexible, changes every month */}
      {extras.extra && (
        <div style={shade(2)} className="tm-card">
          <span style={body}>
            {cardLabel(extras.extra.title, accentDeep, <SparkIcon />)}
            {extras.extra.note && <span style={{ fontSize: 12.5, color: 'var(--am-muted)', lineHeight: 1.5, marginTop: -2 }}>{extras.extra.note}</span>}
            <span style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {extras.extra.items.map((it) => it.url ? (
                <a key={it.label} href={it.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', color: 'var(--am-ink)', fontSize: 13, fontWeight: 500 }} className="tm-linkrow">
                  <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 7, display: 'grid', placeItems: 'center', background: hexToRgba(accent, 0.18), color: accentDeep }}><PlayIcon /></span>
                  <span style={{ minWidth: 0, flex: 1 }}>{it.label}</span>
                  <ExtIcon />
                </a>
              ) : (
                <span key={it.label} style={{ display: 'flex', gap: 9, fontSize: 13, color: 'var(--am-ink)', lineHeight: 1.45 }}>
                  <span style={{ flexShrink: 0, marginTop: 6, width: 5, height: 5, borderRadius: '50%', background: accent }} />
                  <span>{it.label}</span>
                </span>
              ))}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

/* ── a themed section (colored header + carousel + enrichment) ─────────── */
function Section({ section }: { section: MonthSection }) {
  const { accent, accentDeep } = section;
  return (
    <section
      style={{
        position: 'relative', borderRadius: 26,
        padding: 'clamp(18px,3vw,30px)',
        background: `linear-gradient(160deg, ${hexToRgba(accent, 0.12)}, ${hexToRgba(accent, 0.03)} 55%, var(--am-paper))`,
        border: `1px solid ${hexToRgba(accent, 0.22)}`,
      }}
    >
      <div className="tm-block">
        {section.activities.length > 0 && <CoverCarousel activities={section.activities} accent={accent} accentDeep={accentDeep} />}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 8, background: hexToRgba(accent, 0.16), color: accentDeep, fontFamily: 'var(--font-catalog),monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '6px 12px', borderRadius: 999, marginBottom: 12 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: accent }} />
            {section.eyebrow}
          </div>
          <h2 style={{ fontFamily: 'var(--font-plate),sans-serif', fontSize: 'clamp(25px,4.2vw,36px)', fontWeight: 800, color: 'var(--am-ink)', margin: '0 0 8px', lineHeight: 1.06 }}>{section.title}</h2>
          <p style={{ fontSize: 15, color: 'var(--am-muted)', lineHeight: 1.6, margin: 0, maxWidth: '54ch' }}>{section.blurb}</p>
          {section.extras?.mindset && (
            <div style={{ marginTop: 'auto', paddingTop: 18, maxWidth: '54ch' }}>
              {/* Rich, dark accent card so the reflective note stands apart from
                  the light enrichment cards below. */}
              <div style={{ padding: '12px 15px', borderRadius: 16, background: `linear-gradient(150deg, ${accentDeep}, ${accent})`, color: '#fbf6ec', boxShadow: `0 16px 30px -22px ${hexToRgba(accentDeep, 0.9)}` }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-catalog),monospace', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.82)', marginBottom: 6 }}>
                  <HeartIcon /> Keep in mind
                </div>
                <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: '#fbf6ec', fontStyle: 'italic' }}>{section.extras.mindset}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <EnrichRow extras={section.extras} accent={accent} accentDeep={accentDeep} />
    </section>
  );
}

/* ── interactive family challenge ──────────────────────────────────────── */
function Challenge({ id, month, title, text }: { id: string; month: string; title: string; text: string }) {
  const [state, setState] = useState<ChallengeState>('idle');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = readChallenges()[id]?.status;
    if (s === 'accepted' || s === 'done') setState(s);
    setReady(true);
  }, [id]);

  // Accepting sets the family's active quest; finishing plants a keepsake medal.
  // Both ripple to the Adventure Map home via the shared month-challenge store.
  const save = (s: ChallengeState) => {
    setState(s);
    if (s === 'idle') clearChallenge(id);
    else writeChallenge(id, { status: s, month, title, at: new Date().toISOString() });
  };

  const flag = '#d0684a';
  return (
    <section
      style={{
        position: 'relative', overflow: 'hidden', borderRadius: 26,
        padding: 'clamp(22px,3.5vw,34px)', color: '#fff',
        background: 'linear-gradient(145deg, #d0684a 0%, #b8492f 60%, #9c3a24 100%)',
        boxShadow: '0 30px 60px -30px rgba(156,58,36,0.7)',
      }}
    >
      {/* soft glow motif */}
      <span aria-hidden="true" style={{ position: 'absolute', top: -70, right: -50, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.22), transparent 70%)' }} />
      <ChallengeMotif />
      {state === 'done' && <Confetti />}

      <div style={{ position: 'relative', maxWidth: 620 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-catalog),monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '6px 12px', borderRadius: 999, marginBottom: 14 }}>
          <FlagIcon />
          This month&apos;s family challenge
        </div>
        <h2 style={{ fontFamily: 'var(--font-plate),sans-serif', fontSize: 'clamp(26px,4.4vw,38px)', fontWeight: 800, margin: '0 0 10px', lineHeight: 1.05 }}>{title}</h2>
        <p style={{ fontSize: 15.5, lineHeight: 1.6, margin: '0 0 20px', color: 'rgba(255,255,255,0.92)' }}>{text}</p>

        {!ready ? null : state === 'idle' ? (
          <button onClick={() => save('accepted')} style={btnLight(flag)}>
            Accept this challenge
            <span aria-hidden="true">→</span>
          </button>
        ) : state === 'accepted' ? (
          <button onClick={() => save('idle')} style={{ ...badgeSolid, border: 'none', cursor: 'pointer' }} title="Tap to undo">
            <CheckIcon /> You&apos;re in
          </button>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-plate),sans-serif', fontSize: 20, fontWeight: 800 }}>
              <MedalIcon /> You did it!
            </span>
            <button onClick={() => save('accepted')} style={btnText}>Undo</button>
          </div>
        )}
      </div>
    </section>
  );
}

/* Decorative animated motif for the challenge card — a flag planted on a summit
   with a drifting dashed trail (an echo of the Adventure Map) and a few
   twinkles. Translucent line-art on the terracotta; sits in the empty space to
   the right of the copy on wider cards, hidden on small ones so it never
   crowds the text. Respects reduced-motion. */
function ChallengeMotif() {
  return (
    <span aria-hidden="true" className="tm-chal-motif">
      <svg viewBox="0 0 220 200" xmlns="http://www.w3.org/2000/svg">
        <path d="M-10 182 Q70 122 132 152 Q192 182 240 142 L240 210 L-10 210 Z" fill="rgba(255,255,255,0.06)" />
        <path d="M-10 192 Q80 154 152 174 Q210 190 240 170 L240 210 L-10 210 Z" fill="rgba(255,255,255,0.05)" />
        <path className="tm-chal-trail" d="M34 196 Q82 182 112 152 Q136 128 150 100" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1 13" />
        <line x1="150" y1="54" x2="150" y2="100" stroke="rgba(255,255,255,0.75)" strokeWidth="3.5" strokeLinecap="round" />
        <path className="tm-chal-flag" d="M150 58 L185 66 L150 80 Z" fill="rgba(255,255,255,0.9)" />
        <circle cx="150" cy="100" r="4" fill="rgba(255,255,255,0.85)" />
        <circle className="tm-chal-spark" style={{ animationDelay: '0s' }} cx="196" cy="48" r="3" fill="rgba(255,255,255,0.75)" />
        <circle className="tm-chal-spark" style={{ animationDelay: '1.1s' }} cx="66" cy="72" r="2.5" fill="rgba(255,255,255,0.6)" />
        <circle className="tm-chal-spark" style={{ animationDelay: '2s' }} cx="120" cy="44" r="2" fill="rgba(255,255,255,0.55)" />
      </svg>
      <style>{`
        .tm-chal-motif{position:absolute;right:0;bottom:0;width:min(240px,30%);pointer-events:none;display:none}
        .tm-chal-motif svg{display:block;width:100%;height:auto}
        .tm-chal-flag{transform-box:fill-box;transform-origin:left center;animation:tmFlag 2.6s ease-in-out infinite}
        .tm-chal-trail{animation:tmTrail 1.4s linear infinite}
        .tm-chal-spark{transform-box:fill-box;transform-origin:center;animation:tmSpark 2.4s ease-in-out infinite}
        @keyframes tmFlag{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.72)}}
        @keyframes tmTrail{to{stroke-dashoffset:-28}}
        @keyframes tmSpark{0%,100%{opacity:.15;transform:scale(.5)}50%{opacity:.9;transform:scale(1)}}
        @media (min-width:640px){.tm-chal-motif{display:block}}
        @media (prefers-reduced-motion:reduce){.tm-chal-flag,.tm-chal-trail,.tm-chal-spark{animation:none}}
      `}</style>
    </span>
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
function HeartIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-8-4.6-10-10c-1-3 1-6 4-6 2 0 3.5 1.5 4 2.5C11 6 12.5 4 15 4c3 0 5 3 4 6-2 5.4-10 11-10 11z" opacity="0.9" /></svg>;
}
function CheckIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>;
}
function MedalIcon() {
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="15" r="6" /><path d="M12 12v0M8.5 9 6 2h4l1.5 4M15.5 9 18 2h-4l-1.5 4" /><path d="m12 13.5 1 2 2 .2-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L9 15.7l2-.2z" /></svg>;
}

const btnLight = (color: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color,
  fontWeight: 800, fontSize: 15, padding: '13px 24px', borderRadius: 999, border: 'none', cursor: 'pointer',
  boxShadow: '0 14px 30px -14px rgba(0,0,0,0.5)',
});
const btnText: React.CSSProperties = {
  background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3,
};
const badgeSolid: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#b8492f',
  fontWeight: 800, fontSize: 14, padding: '11px 18px', borderRadius: 999,
};

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
  return (
    <main style={{ position: 'relative', background: 'linear-gradient(180deg,var(--am-bg1),var(--am-bg2))', minHeight: '100vh', color: 'var(--am-ink)', overflow: 'hidden' }}>
      <style>{`
        @keyframes tmFall{0%{transform:translateY(0) rotate(0)}100%{transform:translateY(320px) rotate(360deg)}}
        @keyframes tmPop{0%{opacity:0;transform:translateY(10px) scale(.98)}100%{opacity:1;transform:none}}
        .tm-block{display:grid;grid-template-columns:1fr;gap:22px;align-items:start}
        @media (min-width:680px){.tm-block{grid-template-columns:230px 1fr;gap:30px;align-items:stretch}}
        .tm-cover{transition:transform .3s ease}
        .tm-cover:hover{transform:rotate(-0.5deg) scale(1.02)}
        .tm-cover-btn{aspect-ratio:4 / 5}
        /* On desktop the cover stretches to the text column's height so its
           bottom always lines up with the mindset card beside it. */
        @media (min-width:680px){
          .tm-block .tm-cover-wrap{height:100%;display:flex;flex-direction:column}
          .tm-block .tm-cover-rel{flex:1;min-height:270px}
          .tm-block .tm-cover-btn{aspect-ratio:auto;height:100%}
        }
        .tm-linkrow{transition:transform .15s ease}
        .tm-linkrow:hover{transform:translateX(2px)}
        .tm-card{transition:transform .2s ease,box-shadow .2s ease}
        a.tm-card:hover{transform:translateY(-3px);box-shadow:0 20px 40px -26px rgba(50,40,20,.5)}
        .tm-modal{animation:tmPop .22s ease}
        .tm-cards{display:grid;grid-template-columns:1fr;gap:14px;margin-top:18px}
        @media (min-width:720px){.tm-cards{grid-template-columns:repeat(3,1fr);align-items:stretch}}
      `}</style>
      {/* warm color washes so the page never reads as flat beige */}
      <span aria-hidden="true" style={{ position: 'absolute', top: -120, right: -120, width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,123,92,0.20), transparent 68%)', pointerEvents: 'none' }} />
      <span aria-hidden="true" style={{ position: 'absolute', top: 520, left: -160, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(58,90,64,0.16), transparent 68%)', pointerEvents: 'none' }} />

      {/* hero */}
      <header style={{ position: 'relative', overflow: 'hidden', minHeight: 'clamp(150px,20vw,206px)', background: 'linear-gradient(180deg, var(--am-sky1), var(--am-sky2))', padding: 'clamp(18px,2.5vw,26px) clamp(16px,4vw,40px) clamp(26px,3vw,38px)' }}>
        <HeroScene tone="light" hillHeight={100} />
        {/* summer sun glow */}
        <span aria-hidden="true" style={{ position: 'absolute', top: 24, right: '10%', width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,214,107,0.6), rgba(255,214,107,0) 70%)' }} />
        <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(214,162,78,0.16)', color: '#9a6b1f', fontFamily: 'var(--font-catalog),monospace', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '6px 13px', borderRadius: 999, marginBottom: 14 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#d6a24e' }} />
            This month at Anywhere Learning
          </div>
          <h1 style={{ fontFamily: 'var(--font-plate),sans-serif', fontSize: 'clamp(32px,6vw,52px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--am-ink)', margin: 0, lineHeight: 1.02 }}>
            {data.month}
          </h1>
          <p style={{ fontSize: 17, color: 'var(--am-muted)', margin: '14px 0 0', lineHeight: 1.55 }}>{data.intro}</p>
        </div>
      </header>

      <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto', padding: 'clamp(22px,4vw,40px) clamp(16px,4vw,40px) 72px', display: 'flex', flexDirection: 'column', gap: 'clamp(20px,3vw,30px)' }}>
        <Section section={data.skill} />
        <Section section={data.seasonal} />
        <Challenge id={data.challengeId} month={data.month} title={data.challenge.title} text={data.challenge.text} />

        <p style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--am-muted)', margin: '6px 0 0' }}>
          Refreshed at the start of every month. Something new is always on the way.
        </p>
      </div>
    </main>
  );
}
