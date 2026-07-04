'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { childAge, loadProfile, type Child } from '@/lib/member-profile';
import { loadWeek, removeItem, type WeekItem } from '@/lib/week';
import { markDone } from '@/lib/account-status';
import { recordCompletion, recentDoneByChild } from '@/lib/completions';
import KidsSetup from '@/components/account/KidsSetup';
import PlannerModal from '@/components/account/PlannerModal';
import { CategoryIcon, hexToRgba, kidColor, minsLabel } from '@/lib/activity-visuals';
import type { PlanActivity } from '@/lib/weekly-plan';

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
    setChildren(p?.children ?? []);
    refresh();
    setDoneByKid(recentDoneByChild(30)); // persisted progress, survives refresh
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
      recordCompletion(slug, child);
      setDoneByKid((prev) => ({ ...prev, [child]: (prev[child] || 0) + 1 }));
      setItems(loadWeek());
      setDoneKeys((prev) => {
        const n = new Set(prev);
        n.delete(key);
        return n;
      });
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
    <div style={{ minHeight: '100vh', background: '#faf9f6', color: '#2b2a26', padding: 'clamp(20px,4vw,44px) clamp(16px,4vw,40px) 64px' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        {/* header band */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 24,
            padding: 'clamp(20px,4vw,32px)',
            marginBottom: 16,
            background: 'linear-gradient(135deg, rgba(88,129,87,0.18) 0%, rgba(212,163,115,0.13) 44%, #fffdf9 84%)',
            border: '1px solid rgba(88,129,87,0.14)',
          }}
        >
          {/* brand row */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 9, marginBottom: 'clamp(16px,3vw,26px)' }}>
            <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(88,129,87,0.16)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#588157' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-9 0 9-5 13-9 13zM4 20c2-5 5-8 9-9" />
              </svg>
            </span>
            <span style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: '-0.01em', color: '#3d5c3b' }}>Anywhere Learning</span>
            <a
              href="/account"
              style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 600, color: '#588157', textDecoration: 'none' }}
              className="hover:opacity-80"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Library
            </a>
          </div>

          {/* header */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
            <div>
              <h1 className="font-display" style={{ fontWeight: 700, fontSize: 'clamp(40px,8vw,60px)', lineHeight: 1.02, color: '#588157', margin: 0 }}>Your plan</h1>
            </div>
            <button onClick={() => openPlanner()} style={planBtn} className="hover:brightness-95">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.5 2.5M15.2 15.2l2.5 2.5M17.7 6.3l-2.5 2.5M8.8 15.2l-2.5 2.5" />
              </svg>
              Add activities
            </button>
          </div>
          <p style={{ position: 'relative', fontSize: 15, color: '#6f6c63', margin: '12px 0 0', maxWidth: '52ch', lineHeight: 1.55 }}>
            {summary}
          </p>
        </div>

        {/* momentum strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
            background: '#fffdf9',
            border: '1px solid rgba(88,129,87,0.14)',
            borderRadius: 16,
            padding: '13px 18px',
            marginBottom: 'clamp(18px,3vw,28px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(212,163,115,0.18)', color: '#a9762f' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-9 0 9-5 13-9 13zM4 20c2-5 5-8 9-9" />
              </svg>
            </span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a9762f' }}>Your momentum</div>
              <div style={{ fontSize: 13, color: '#8a877e', marginTop: 2 }}>{momentumText}</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <div style={{ height: 10, borderRadius: 99, background: 'rgba(88,129,87,0.12)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${momentumPct}%`, borderRadius: 99, background: 'linear-gradient(90deg,#588157,#6b8e6b)', transition: 'width 450ms cubic-bezier(0.22,1,0.36,1)' }} />
            </div>
          </div>
          <span className="font-display" style={{ fontSize: 26, fontWeight: 700, color: '#3d5c3b', lineHeight: 1 }}>{momentumPct}%</span>
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
                  background: `linear-gradient(168deg, ${hexToRgba(color, 0.13)} 0%, #fffdf9 48%)`,
                  border: `1px solid ${hexToRgba(color, 0.22)}`,
                  borderRadius: 20,
                  padding: 'clamp(16px,3vw,24px)',
                  paddingLeft: 'clamp(18px,3vw,26px)',
                  boxShadow: '0 2px 10px -4px rgba(70,55,30,0.12)',
                  animationDelay: `${i * 70}ms`,
                }}
              >
                <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: color }} aria-hidden="true" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 16 }}>
                  <span style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, color: '#faf9f6', background: color, boxShadow: `0 0 0 4px ${hexToRgba(color, 0.18)}` }}>
                    {label.charAt(0)}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#2b2a26', letterSpacing: '-0.01em', lineHeight: 1.1 }}>{label}</div>
                    <div style={{ fontSize: 12.5, color: '#8a877e', marginTop: 2 }}>{meta}</div>
                  </div>
                  <button onClick={() => openPlanner([i])} style={laneAddBtn} className="hover:brightness-95">
                    Add
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                  </button>
                </div>

                {laneItems.length === 0 ? (
                  <button onClick={() => openPlanner([i])} style={emptyLaneBtn} className="hover:brightness-95">
                    <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(88,129,87,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#588157', flexShrink: 0 }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                    </span>
                    <span style={{ fontSize: 13.5, color: '#54524b' }}>
                      <strong style={{ color: '#2f4a2e', fontWeight: 600 }}>Nothing yet for {label}.</strong> Pick a few in a tap.
                    </span>
                  </button>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 12 }}>
                    {laneItems.map((it) => {
                      const a = bySlug.get(it.slug);
                      if (!a) return null;
                      const veil = doneKeys.has(`${it.slug}__${it.child}`);
                      return (
                        <article
                          key={it.slug}
                          className="al-card"
                          style={{ position: 'relative', display: 'flex', gap: 12, background: '#fffdf9', border: `1px solid ${hexToRgba(a.trackColor, 0.2)}`, borderRadius: 14, padding: '13px 14px 13px 17px', overflow: 'hidden', boxShadow: '0 2px 8px -5px rgba(70,55,30,0.16)' }}
                        >
                          <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: a.trackColor }} aria-hidden="true" />
                          <span style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: hexToRgba(a.trackColor, 0.14), boxShadow: `0 0 0 3px ${hexToRgba(a.trackColor, 0.07)}` }}>
                            <CategoryIcon category={a.category} color={a.trackColor} size={21} />
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7, paddingRight: 22 }}>
                              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: a.trackColor }}>{a.categoryLabel}</span>
                              <span style={{ fontSize: 11, color: '#8a877e' }}>&middot; {minsLabel(a.effort)}</span>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#2b2a26', lineHeight: 1.3, marginBottom: 12 }}>{a.title}</div>
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                              <a href={`/account/view/${a.slug}`} style={startBtn} className="hover:brightness-95">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                                Start
                              </a>
                              <button onClick={() => done(it.slug, it.child)} style={doneBtn} className="hover:brightness-95">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12l5 5L20 6" /></svg>
                                Done
                              </button>
                            </div>
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
    </div>
  );
}

function KidsSetupGate({ onDone }: { onDone: () => void }) {
  return <KidsSetup onDone={onDone} onSkip={onDone} />;
}

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
  marginLeft: 'auto',
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
  background: '#f3ede1',
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
  color: '#8a877e',
  cursor: 'pointer',
  opacity: 0.7,
  transition: 'opacity 150ms ease',
};
