'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { childAge, loadProfile, type Child } from '@/lib/member-profile';
import { loadWeek, removeItem, type WeekItem } from '@/lib/week';
import { markDone } from '@/lib/account-status';
import { recordCompletion, recentDoneByChild, completionLog } from '@/lib/completions';
import { packFor, GEAR, TIER_META, type GearTier, type EarnedGear } from '@/lib/gear';
import { gearIconSVG } from '@/lib/explorer-art';
import KidsSetup from '@/components/account/KidsSetup';
import PlannerModal from '@/components/account/PlannerModal';
import ExplorerBuilder from '@/components/account/ExplorerBuilder';
import { CategoryIcon, hexToRgba, kidColor, minsLabel } from '@/lib/activity-visuals';
import { avatarFor, saveAvatar, type KidAvatar } from '@/lib/kid-roadmap';
import { ExplorerFigure } from '@/components/account/ExplorerAvatar';
import HeroScene from '@/components/account/HeroScene';
import type { PlanActivity } from '@/lib/weekly-plan';
import type { Effort } from '@/lib/activity-effort';

function childLabel(c: Child, i: number) {
  return c.name.trim() || `Child ${i + 1}`;
}

export default function WeekHome({ activities }: { activities: PlanActivity[] }) {
  const [ready, setReady] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [items, setItems] = useState<WeekItem[]>([]);
  const [doneByKid, setDoneByKid] = useState<Record<string, number>>({});
  const [doneKeys, setDoneKeys] = useState<Set<string>>(new Set());
  const [planOpen, setPlanOpen] = useState(false);
  const [planFor, setPlanFor] = useState<number[] | undefined>(undefined);
  const [editOpen, setEditOpen] = useState(false);
  const [avatars, setAvatars] = useState<Record<string, KidAvatar | null>>({});
  const [gearByKid, setGearByKid] = useState<Record<string, string[]>>({});
  const [buildingFor, setBuildingFor] = useState<string | null>(null);
  const [packOpen, setPackOpen] = useState<string | null>(null);
  const [reveal, setReveal] = useState<{ name: string; gear: EarnedGear } | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const autoOpenedRef = useRef(false);

  const bySlug = useMemo(() => {
    const m = new Map<string, PlanActivity>();
    activities.forEach((a) => m.set(a.slug, a));
    return m;
  }, [activities]);

  function refresh() {
    setItems(loadWeek());
  }
  useEffect(() => {
    const p = loadProfile();
    const kids = p?.children ?? [];
    setChildren(kids);
    refresh();
    setDoneByKid(recentDoneByChild(30)); // persisted progress, survives refresh
    const av: Record<string, KidAvatar | null> = {};
    const gear: Record<string, string[]> = {};
    const effortBySlug: Record<string, Effort> = {};
    activities.forEach((a) => (effortBySlug[a.slug] = a.effort));
    const log = completionLog();
    kids.forEach((c, i) => {
      const cid = c.id ?? childLabel(c, i);
      av[cid] = avatarFor(cid);
      const comps = log.filter((l) => l.child === cid).map((l) => ({ slug: l.slug, at: l.at, effort: effortBySlug[l.slug] ?? ('Quick' as Effort) }));
      gear[cid] = packFor(cid, comps).map((g) => g.id);
    });
    setAvatars(av);
    setGearByKid(gear);
    setReady(true);
  }, []);

  // First-run activation: a brand-new member arrives here from onboarding with
  // ?start=1 (kids already set up). Auto-open the "Add activities" picker so
  // their first move is choosing activities, not staring at an empty plan.
  // Strip the param so a later refresh doesn't reopen it.
  useEffect(() => {
    if (autoOpenedRef.current) return;
    if (!ready || children.length === 0) return;
    if (searchParams.get('start') !== '1') return;
    autoOpenedRef.current = true;
    setPlanFor(undefined);
    setPlanOpen(true);
    router.replace('/account/plan');
  }, [ready, children, searchParams, router]);

  function openPlanner(forKids?: number[]) {
    setPlanFor(forKids);
    setPlanOpen(true);
  }
  function closePlanner() {
    setPlanOpen(false);
    refresh();
  }

  function cancel(slug: string, child: string) {
    // Changed their mind: take it off the plan but do NOT mark it done, so it
    // stays eligible to be suggested again another time.
    removeItem(slug, child);
    setItems(loadWeek());
  }

  function done(slug: string, child: string) {
    const key = `${slug}__${child}`;
    setDoneKeys((prev) => new Set(prev).add(key));
    setTimeout(() => {
      removeItem(slug, child);
      markDone(slug);
      recordCompletion(slug, child); // writes synchronously, so the log below includes it
      setDoneByKid((prev) => ({ ...prev, [child]: (prev[child] || 0) + 1 }));
      setItems(loadWeek());
      setDoneKeys((prev) => {
        const n = new Set(prev);
        n.delete(key);
        return n;
      });

      // Earn the gear: recompute this kid's pack (now including the completion)
      // and reveal the newest piece. The explorer in the lane updates too.
      const comps = completionLog()
        .filter((l) => l.child === child)
        .map((l) => ({ slug: l.slug, at: l.at, effort: bySlug.get(l.slug)?.effort ?? ('Quick' as Effort) }));
      const pack = packFor(child, comps);
      setGearByKid((prev) => ({ ...prev, [child]: pack.map((g) => g.id) }));
      const earned = pack[pack.length - 1];
      if (earned) {
        const idx = children.findIndex((c, i) => (c.id ?? childLabel(c, i)) === child);
        setReveal({ name: idx >= 0 ? childLabel(children[idx], idx) : 'Your explorer', gear: earned });
      }
    }, 760);
  }

  if (!ready) return null;

  if (children.length === 0) {
    return (
      <KidsSetupGate onDone={() => setChildren(loadProfile()?.children ?? [])} />
    );
  }

  const totalPlanned = items.length;
  const totalDone = Object.values(doneByKid).reduce((a, b) => a + b, 0);

  let summary: string;
  if (totalPlanned === 0 && totalDone === 0) {
    summary =
      children.length === 1
        ? 'Nothing planned yet. Tap Add activities to pick a few in under a minute.'
        : 'Nothing planned yet. Tap Add activities and we will suggest a few in under a minute.';
  } else {
    const aWord = totalPlanned === 1 ? 'activity' : 'activities';
    const kWord = children.length === 1 ? 'one kid' : `${children.length} kids`;
    summary =
      `${totalPlanned} ${aWord} planned across ${kWord}` +
      (totalDone ? ` · ${totalDone} already done. Lovely.` : '. One tap to start or check one off.');
  }

  const totalActivities = totalPlanned + totalDone;
  const momentumPct = totalActivities ? Math.round((totalDone / totalActivities) * 100) : 0;
  const momentumText =
    totalActivities === 0
      ? 'Add a few activities to get going.'
      : `${totalDone} done · ${totalPlanned} to go`;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,var(--am-bg1),var(--am-bg2))', color: 'var(--am-ink)', paddingBottom: 64 }}>
      {/* ═══ Forest header ═══ */}
      <header style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, var(--am-sky1), var(--am-sky2))', padding: 'clamp(20px,4vw,40px) clamp(16px,4vw,40px) 82px' }}>
        <HeroScene tone="light" hillHeight={130} />
        <svg aria-hidden="true" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1, width: '100%', height: 88 }}>
          <path d="M0 104 Q 200 60 430 96 T 820 92 T 1200 86 L 1200 120 L 0 120 Z" fill="#f4f0e7" />
        </svg>
        <div style={{ position: 'relative', maxWidth: 880, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 'clamp(16px,3vw,26px)' }}>
            <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(191,124,72,0.14)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--am-trail)' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-9 0 9-5 13-9 13zM4 20c2-5 5-8 9-9" />
              </svg>
            </span>
            <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--am-ink)' }}>Anywhere Learning</span>
            <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 18 }}>
              <a href="/account/record" style={topLink} className="hover:opacity-80">Record</a>
              <a href="/account" style={topLink} className="hover:opacity-80">Library</a>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-plate),sans-serif', fontWeight: 800, letterSpacing: '-0.02em', fontSize: 'clamp(38px,7.5vw,58px)', lineHeight: 1.0, color: 'var(--am-ink)', margin: 0 }}>Your plan</h1>
              <p style={{ fontSize: 14.5, color: 'var(--am-muted)', margin: '12px 0 0', maxWidth: '52ch', lineHeight: 1.5 }}>{summary}</p>
            </div>
            <button onClick={() => openPlanner()} style={planBtn} className="hover:brightness-95">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.5 2.5M15.2 15.2l2.5 2.5M17.7 6.3l-2.5 2.5M8.8 15.2l-2.5 2.5" />
              </svg>
              Add activities
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(14px,3vw,22px) clamp(16px,4vw,40px) 0' }}>

        {/* momentum strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
            background: 'var(--am-paper)',
            border: '1px solid rgba(88,129,87,0.14)',
            borderRadius: 16,
            padding: '13px 18px',
            marginBottom: 'clamp(18px,3vw,28px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(212,163,115,0.18)', color: 'var(--am-gold)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-9 0 9-5 13-9 13zM4 20c2-5 5-8 9-9" />
              </svg>
            </span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--am-gold)' }}>Your momentum</div>
              <div style={{ fontSize: 13, color: 'var(--am-muted)', marginTop: 2 }}>{momentumText}</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <div style={{ height: 10, borderRadius: 99, background: 'rgba(88,129,87,0.12)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${momentumPct}%`, borderRadius: 99, background: 'linear-gradient(90deg,#588157,#6b8e6b)', transition: 'width 450ms cubic-bezier(0.22,1,0.36,1)' }} />
            </div>
          </div>
          <span style={{ fontFamily: 'var(--font-plate),sans-serif', fontSize: 26, fontWeight: 800, color: '#3d5c3b', lineHeight: 1 }}>{momentumPct}%</span>
        </div>

        {/* lanes */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: '#a3a199', background: 'none', border: 'none', cursor: 'pointer' }}
            className="hover:opacity-70"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 20h4l10-10-4-4L4 16v4z" />
              <path d="M13.5 6.5l4 4" />
            </svg>
            Edit kids
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px,3vw,26px)' }}>
          {children.map((c, i) => {
            const label = childLabel(c, i);
            const color = kidColor(i);
            const cid = c.id ?? label;
            const laneItems = items.filter((it) => it.child === cid);
            const doneCount = doneByKid[cid] || 0;
            const age = childAge(c);
            const metaParts: string[] = [];
            if (age != null) metaParts.push(`Age ${age}`);
            metaParts.push(
              laneItems.length
                ? `${laneItems.length} ${laneItems.length === 1 ? 'activity' : 'activities'}`
                : 'nothing yet',
            );
            if (doneCount) metaParts.push(`${doneCount} done`);
            const meta = metaParts.join(' · ');

            return (
              <section
                key={i}
                className="al-rise"
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  gap: 'clamp(12px,2.5vw,20px)',
                  alignItems: 'stretch',
                  background: `linear-gradient(168deg, ${hexToRgba(color, 0.13)} 0%, var(--am-paper) 48%)`,
                  border: `1px solid ${hexToRgba(color, 0.22)}`,
                  borderRadius: 20,
                  padding: 'clamp(16px,3vw,22px)',
                  paddingLeft: 'clamp(18px,3vw,24px)',
                  boxShadow: '0 2px 10px -4px rgba(70,55,30,0.12)',
                  animationDelay: `${i * 70}ms`,
                }}
              >
                <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: color }} aria-hidden="true" />

                {/* LEFT: full-height avatar (tap to build/edit) + backpack button */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flexShrink: 0, width: 'clamp(92px,19vw,126px)' }}>
                  {(() => {
                    const av = avatars[cid];
                    if (!av) {
                      return (
                        <button
                          onClick={() => setBuildingFor(cid)}
                          className="hover:brightness-[0.98]"
                          aria-label={`Create ${label}'s explorer`}
                          style={{ flex: 1, minHeight: 128, borderRadius: 16, background: hexToRgba(color, 0.1), border: `1.5px dashed ${hexToRgba(color, 0.5)}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', padding: 8 }}
                        >
                          <span style={{ width: 40, height: 40, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color, background: hexToRgba(color, 0.16) }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                          </span>
                          <span style={{ fontSize: 11.5, fontWeight: 600, color: '#54524b', textAlign: 'center', lineHeight: 1.3 }}>Create {label}'s explorer</span>
                        </button>
                      );
                    }
                    return (
                      <button
                        onClick={() => setBuildingFor(cid)}
                        className="hover:brightness-[0.99]"
                        aria-label={`Edit ${label}'s explorer`}
                        title={`Edit ${label}'s explorer`}
                        style={{ flex: 1, minHeight: 132, borderRadius: 16, overflow: 'hidden', background: `linear-gradient(180deg, ${hexToRgba(av.color, 0.16)}, var(--am-paper))`, border: `1px solid ${hexToRgba(av.color, 0.22)}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '10px 4px 0', cursor: 'pointer' }}
                      >
                        <ExplorerFigure avatar={av} gear={gearByKid[cid] ?? []} fill />
                      </button>
                    );
                  })()}
                  <button
                    onClick={() => setPackOpen(cid)}
                    className="hover:brightness-95"
                    aria-label={`Open ${label}'s backpack`}
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 8px', borderRadius: 11, fontSize: 12.5, fontWeight: 600, color: '#588157', background: 'var(--am-paper)', border: '1px solid rgba(61,92,59,0.2)', cursor: 'pointer' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 9a6 6 0 0 1 12 0v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" />
                      <path d="M9 9V7a3 3 0 0 1 6 0v2M9 14h6" />
                    </svg>
                    Backpack
                  </button>
                </div>

                {/* RIGHT: name + Add + activities */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#2b2a26', letterSpacing: '-0.01em', lineHeight: 1.1 }}>{label}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--am-muted)', marginTop: 2 }}>{meta}</div>
                    </div>
                    <button onClick={() => openPlanner([i])} style={{ ...laneAddBtn, marginLeft: 'auto' }} className="hover:brightness-95">
                      Add
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                    </button>
                  </div>

                {laneItems.length === 0 ? (
                  <button onClick={() => openPlanner([i])} style={{ ...emptyLaneBtn, flex: 1 }} className="hover:brightness-95">
                    <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(88,129,87,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#588157', flexShrink: 0 }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                    </span>
                    <span style={{ fontSize: 13.5, color: '#54524b' }}>
                      <strong style={{ color: '#2f4a2e', fontWeight: 600 }}>Nothing yet for {label}.</strong> Pick a few in a tap.
                    </span>
                  </button>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                    {laneItems.map((it) => {
                      const a = bySlug.get(it.slug);
                      if (!a) return null;
                      const veil = doneKeys.has(`${it.slug}__${it.child}`);
                      return (
                        <article
                          key={it.slug}
                          className="al-card"
                          style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 11, background: 'var(--am-paper)', border: `1px solid ${hexToRgba(a.trackColor, 0.2)}`, borderRadius: 14, padding: '14px 15px 14px 18px', overflow: 'hidden', boxShadow: '0 2px 8px -5px rgba(70,55,30,0.16)' }}
                        >
                          <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: a.trackColor }} aria-hidden="true" />

                          {/* top: icon + category, X floats top-right */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingRight: 26 }}>
                            <span style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: hexToRgba(a.trackColor, 0.14) }}>
                              <CategoryIcon category={a.category} color={a.trackColor} size={19} />
                            </span>
                            <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: a.trackColor, lineHeight: 1.35 }}>{a.categoryLabel}</span>
                          </div>

                          {/* title */}
                          <div style={{ fontSize: 15, fontWeight: 600, color: '#2b2a26', lineHeight: 1.3 }}>{a.title}</div>

                          {/* footer: time pill + actions */}
                          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 'auto' }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--am-muted)', background: '#f3ede1', borderRadius: 999, padding: '4px 10px' }}>{minsLabel(a.effort)}</span>
                            <span style={{ flex: 1 }} />
                            <a href={`/api/download/activity/${a.slug}?view=1`} target="_blank" rel="noopener noreferrer" style={startBtn} className="hover:brightness-95">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                              Start
                            </a>
                            <button onClick={() => done(it.slug, it.child)} style={doneBtn} className="hover:brightness-95">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12l5 5L20 6" /></svg>
                              Done
                            </button>
                          </div>

                          <button
                            onClick={() => cancel(it.slug, it.child)}
                            style={cancelX}
                            className="hover:opacity-100"
                            aria-label={`Remove ${a.title} from your plan`}
                            title="Remove from your plan"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                          </button>
                          {veil && (
                            <div className="al-veil" style={{ position: 'absolute', inset: 0, background: 'rgba(88,129,87,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, color: '#faf9f6', fontSize: 14, fontWeight: 600 }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12l5 5L20 6" /></svg>
                              Nice work
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
                </div>
              </section>
            );
          })}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12.5, color: '#b6b2a6', margin: '36px 0 0' }}>
          A blank space is fine too. Follow the day where it leads.
        </p>
      </div>

      {planOpen && (
        <PlannerModal
          activities={activities}
          children={children}
          initialKids={planFor}
          onClose={closePlanner}
          onSeeWeek={closePlanner}
        />
      )}

      {editOpen && (
        <div
          onClick={() => setEditOpen(false)}
          className="al-veil"
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(45,55,40,0.42)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 'clamp(16px,4vw,44px)', overflowY: 'auto' }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(560px,100%)' }}>
            <KidsSetup
              embedded
              initialChildren={children}
              title="Manage your kids"
              submitLabel="Save"
              onDone={() => {
                setChildren(loadProfile()?.children ?? []);
                setEditOpen(false);
              }}
              onCancel={() => setEditOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Explorer builder (create/edit from a lane) */}
      {buildingFor && (
        <div onClick={() => setBuildingFor(null)} className="al-veil" style={overlay}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(460px,100%)' }}>
            <ExplorerBuilder
              kidName={children.map((c, i) => [c.id ?? childLabel(c, i), childLabel(c, i)] as const).find(([id]) => id === buildingFor)?.[1] ?? ''}
              initial={avatars[buildingFor]}
              onSave={(a) => {
                saveAvatar(buildingFor, a);
                setAvatars((prev) => ({ ...prev, [buildingFor]: a }));
                setBuildingFor(null);
              }}
              onCancel={() => setBuildingFor(null)}
            />
          </div>
        </div>
      )}

      {/* Gear reveal on Done */}
      {reveal && (
        <div onClick={() => setReveal(null)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="al-pop" style={{ width: 'min(400px,100%)', background: 'var(--am-paper)', borderRadius: 24, padding: '26px 24px 22px', textAlign: 'center', boxShadow: '0 30px 70px -20px rgba(45,55,40,0.5)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--am-gold)', marginBottom: 12 }}>New gear earned</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px', borderRadius: 16, background: hexToRgba(TIER_META[reveal.gear.tier].color, 0.1), border: `1.5px solid ${hexToRgba(TIER_META[reveal.gear.tier].color, 0.4)}` }}>
              <span style={{ width: 44, height: 44, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: gearIconSVG(reveal.gear.id, 'rv' + reveal.gear.id.replace(/[^a-z0-9]/gi, '')) }} />
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#2b2a26' }}>{reveal.gear.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--am-muted)' }}>{reveal.name}'s pack · {TIER_META[reveal.gear.tier].label}</div>
              </div>
            </div>
            <button onClick={() => setReveal(null)} className="hover:brightness-95" style={{ marginTop: 18, width: '100%', padding: 13, fontSize: 15, fontWeight: 600, color: '#faf9f6', background: '#588157', border: 'none', borderRadius: 13, cursor: 'pointer' }}>
              Into the pack it goes
            </button>
          </div>
        </div>
      )}

      {/* Backpack inventory */}
      {packOpen && (() => {
        const owned = new Set(gearByKid[packOpen] ?? []);
        const name = children.map((c, i) => [c.id ?? childLabel(c, i), childLabel(c, i)] as const).find(([id]) => id === packOpen)?.[1] ?? '';
        return (
          <div onClick={() => setPackOpen(null)} style={overlay}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(640px,100%)', maxHeight: '86vh', overflowY: 'auto', background: 'var(--am-paper)', borderRadius: 24, padding: 'clamp(18px,3vw,26px)', boxShadow: '0 30px 70px -20px rgba(45,55,40,0.5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <BackpackGlyph size={26} color="#588157" />
                <h2 style={{ fontFamily: 'var(--font-plate),sans-serif', fontSize: 'clamp(22px,4vw,28px)', fontWeight: 800, color: '#588157', margin: 0, flex: 1 }}>{name}'s backpack</h2>
                <button onClick={() => setPackOpen(null)} aria-label="Close" className="hover:brightness-95" style={{ width: 32, height: 32, borderRadius: '50%', background: '#f3ede1', border: 'none', cursor: 'pointer', color: 'var(--am-muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
              </div>
              <p style={{ fontSize: 13, color: 'var(--am-muted)', margin: '0 0 16px' }}>{owned.size} earned so far. Faded gear is still out there to find.</p>
              {(['big', 'everyday', 'find'] as GearTier[]).map((tier) => {
                const all = GEAR[tier];
                const gotCount = all.filter((g) => owned.has(g.id)).length;
                return (
                  <div key={tier} style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 9 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: TIER_META[tier].color }}>{TIER_META[tier].label}</span>
                      <span style={{ fontSize: 12, color: 'var(--am-muted)' }}>{gotCount} of {all.length}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 8 }}>
                      {all.map((g) => {
                        const has = owned.has(g.id);
                        return (
                          <div key={g.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 6px 9px', borderRadius: 13, background: has ? hexToRgba(TIER_META[tier].color, 0.09) : '#f7f5ef', border: `1px solid ${has ? hexToRgba(TIER_META[tier].color, 0.3) : 'rgba(61,92,59,0.08)'}`, opacity: has ? 1 : 0.5 }}>
                            <span style={{ width: 34, height: 34 }} dangerouslySetInnerHTML={{ __html: gearIconSVG(g.id, (packOpen || 'p') + g.id.replace(/[^a-z0-9]/gi, ''), !has) }} />
                            <span style={{ fontSize: 11, fontWeight: 600, color: has ? '#54524b' : '#a8a494', textAlign: 'center', lineHeight: 1.25 }}>{g.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <p style={{ fontSize: 12, color: '#a5a294', margin: 0, textAlign: 'center' }}>New trail finds arrive with the seasons. The pack keeps growing.</p>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function KidsSetupGate({ onDone }: { onDone: () => void }) {
  return <KidsSetup onDone={onDone} onSkip={onDone} />;
}

function BackpackGlyph({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }} aria-hidden="true">
      <path d="M6 9a6 6 0 0 1 12 0v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" />
      <path d="M9 9V7a3 3 0 0 1 6 0v2M9 14h6" />
    </svg>
  );
}

const topLink: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 13.5,
  fontWeight: 600,
  color: 'var(--am-trail)',
  textDecoration: 'none',
};
const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 100,
  background: 'rgba(34,40,29,0.5)',
  backdropFilter: 'blur(3px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'clamp(14px,4vw,32px)',
};

const planBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 9,
  padding: '14px 22px',
  fontSize: 15,
  fontWeight: 600,
  color: '#faf9f6',
  background: '#588157',
  border: 'none',
  borderRadius: 14,
  cursor: 'pointer',
  boxShadow: '0 8px 22px -10px rgba(70,55,30,0.4)',
  transition: 'all 200ms cubic-bezier(0.22,1,0.36,1)',
};
const laneAddBtn: React.CSSProperties = {
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  background: 'none',
  border: 'none',
  color: '#588157',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  padding: '6px 4px',
};
const emptyLaneBtn: React.CSSProperties = {
  width: '100%',
  textAlign: 'left',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '16px 18px',
  background: 'var(--pack-panel)',
  border: '1px dashed rgba(61,92,59,0.2)',
  borderRadius: 14,
  cursor: 'pointer',
};
const startBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '7px 13px',
  borderRadius: 9,
  textDecoration: 'none',
  background: '#588157',
  color: '#faf9f6',
  fontSize: 12.5,
  fontWeight: 600,
};
const doneBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  padding: '7px 12px',
  borderRadius: 9,
  cursor: 'pointer',
  background: 'transparent',
  border: '1px solid rgba(61,92,59,0.16)',
  color: '#588157',
  fontSize: 12.5,
  fontWeight: 600,
};
const cancelX: React.CSSProperties = {
  position: 'absolute',
  top: 8,
  right: 8,
  width: 24,
  height: 24,
  borderRadius: '50%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(45,55,40,0.05)',
  border: 'none',
  color: 'var(--am-muted)',
  cursor: 'pointer',
  opacity: 0.7,
  transition: 'opacity 150ms ease',
};
