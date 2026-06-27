'use client';

import { useMemo, useState } from 'react';
import { buildPlan, type PlanActivity } from '@/lib/weekly-plan';
import { startedSlugs } from '@/lib/account-status';
import { recentlyDoneSlugs } from '@/lib/completions';
import { addToWeek, weekSlugs } from '@/lib/week';
import type { Effort } from '@/lib/activity-effort';
import { CategoryIcon, FOCI, TIMES, hexToRgba, minsLabel } from '@/lib/activity-visuals';
import { childAge, type Child } from '@/lib/member-profile';

function childLabel(c: Child, i: number) {
  return c.name.trim() || `Child ${i + 1}`;
}

export default function PlannerModal({
  activities,
  children,
  initialKids,
  onClose,
  onSeeWeek,
}: {
  activities: PlanActivity[];
  children: Child[];
  initialKids?: number[];
  onClose: () => void;
  onSeeWeek: () => void;
}) {
  const [phase, setPhase] = useState<'ask' | 'results'>('ask');
  const [answerKids, setAnswerKids] = useState<number[]>(
    initialKids && initialKids.length ? initialKids : children.map((_, i) => i),
  );
  const [time, setTime] = useState<Effort>('Quick');
  const [focus, setFocus] = useState<string>('screen');
  const [hero, setHero] = useState<PlanActivity | null>(null);
  const [extras, setExtras] = useState<PlanActivity[]>([]);
  const [broadened, setBroadened] = useState(false);
  const [added, setAdded] = useState<Set<string>>(new Set());

  const bySlug = useMemo(() => {
    const m = new Map<string, PlanActivity>();
    activities.forEach((a) => m.set(a.slug, a));
    return m;
  }, [activities]);

  const focusOpt = FOCI.find((f) => f.id === focus)!;
  const multi = children.length > 1;

  function toggleKid(i: number) {
    setAnswerKids((prev) => {
      const has = prev.includes(i);
      let next = has ? prev.filter((x) => x !== i) : [...prev, i];
      if (next.length === 0) next = [i];
      return next;
    });
  }

  function compute() {
    const ages = answerKids
      .map((i) => childAge(children[i]))
      .filter((a): a is number => a != null);
    // Exclude what's in progress, on the plan, or done within the last 9 months.
    // Done items past that window resurface so favourites can return year to year.
    const exclude = new Set([...startedSlugs(), ...recentlyDoneSlugs(9), ...weekSlugs()]);
    const res = buildPlan(activities, { ages, time, focus: focusOpt.categories }, exclude);
    setHero(res.hero);
    setExtras(res.extras.slice(0, 2));
    setBroadened(res.broadened);
  }

  function goResults() {
    compute();
    setAdded(new Set());
    setPhase('results');
  }

  function reshuffle() {
    compute();
    setAdded(new Set());
  }

  function add(a: PlanActivity) {
    const ids = answerKids.length
      ? answerKids.map((i) => children[i].id ?? childLabel(children[i], i))
      : ['unassigned'];
    addToWeek(a.slug, ids);
    setAdded((prev) => new Set(prev).add(a.slug));
  }

  const kidNames = answerKids.map((i) => childLabel(children[i], i));
  const forLabel =
    kidNames.length === 1
      ? kidNames[0]
      : kidNames.length === 2
        ? `${kidNames[0]} and ${kidNames[1]}`
        : `${kidNames.slice(0, -1).join(', ')} and ${kidNames.slice(-1)}`;
  const timeLabel = TIMES.find((t) => t.id === time)?.label ?? '';
  const anyAdded = added.size > 0;

  return (
    <div
      onClick={onClose}
      className="al-veil"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(45,55,40,0.42)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(12px,3vw,32px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="al-rise"
        style={{
          width: 'min(460px,100%)',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#fffdf9',
          borderRadius: 'clamp(20px,4vw,26px)',
          boxShadow: '0 30px 70px -20px rgba(45,55,40,0.5)',
        }}
      >
        <div style={{ padding: 'clamp(18px,4vw,24px)' }}>
          {/* header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, marginBottom: 14 }}>
            <div>
              <div style={eyebrow}>
                <span style={eyebrowDash} />
                Add to your plan
              </div>
              <h2 className="font-display" style={display(30)}>
                {phase === 'results' ? 'Here is where we would start' : "Let us find a good fit"}
              </h2>
            </div>
            <button onClick={onClose} aria-label="Close" style={closeBtn} className="hover:brightness-95">
              <Stroke d="M6 6l12 12M18 6L6 18" size={16} sw={2} />
            </button>
          </div>

          {phase === 'ask' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              {multi && (
                <div>
                  <div style={qLabel}>Who is it for?</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                    {children.map((c, i) => {
                      const sel = answerKids.includes(i);
                      return (
                        <button
                          key={i}
                          onClick={() => toggleKid(i)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '8px 14px 8px 8px',
                            borderRadius: 9999,
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: 600,
                            transition: 'all 160ms cubic-bezier(0.22,1,0.36,1)',
                            background: sel ? 'rgba(88,129,87,0.09)' : '#fffdf9',
                            color: sel ? '#2f4a2e' : '#54524b',
                            border: `1.5px solid ${sel ? '#588157' : 'rgba(61,92,59,0.16)'}`,
                          }}
                        >
                          <span style={avatar(i)}>{childLabel(c, i).charAt(0)}</span>
                          {childLabel(c, i)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <div style={qLabel}>How much time do you have?</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {TIMES.map((t) => {
                    const sel = time === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTime(t.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 13,
                          textAlign: 'left',
                          padding: '10px 14px',
                          borderRadius: 14,
                          cursor: 'pointer',
                          transition: 'all 160ms cubic-bezier(0.22,1,0.36,1)',
                          background: sel ? 'rgba(88,129,87,0.07)' : '#fffdf9',
                          border: `1.5px solid ${sel ? '#588157' : 'rgba(61,92,59,0.14)'}`,
                        }}
                      >
                        <span style={radio(sel)}>
                          <span style={radioInner(sel)} />
                        </span>
                        <span>
                          <span style={{ display: 'block', fontSize: 14.5, fontWeight: 600, color: '#2b2a26' }}>
                            {t.label}
                          </span>
                          <span style={{ display: 'block', fontSize: 12.5, color: '#8a877e', marginTop: 1 }}>
                            {t.desc}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div style={qLabel}>What are you hoping for?</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {FOCI.map((f) => {
                    const sel = focus === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setFocus(f.id)}
                        style={{
                          padding: '8px 13px',
                          borderRadius: 9999,
                          cursor: 'pointer',
                          fontSize: 13.5,
                          fontWeight: 600,
                          transition: 'all 160ms cubic-bezier(0.22,1,0.36,1)',
                          background: sel ? '#588157' : '#fffdf9',
                          color: sel ? '#faf9f6' : '#54524b',
                          border: `1.5px solid ${sel ? '#588157' : 'rgba(61,92,59,0.16)'}`,
                        }}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button onClick={goResults} style={primaryBtn} className="hover:brightness-95">
                Show me a few ideas
                <Stroke d="M5 12h14M13 6l6 6-6 6" size={17} sw={1.8} />
              </button>
            </div>
          ) : (
            <div className="al-fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <button onClick={() => setPhase('ask')} style={recapBtn} className="hover:brightness-95">
                <Stroke d="M15 18l-6-6 6-6" size={15} sw={2} />
                For {forLabel} &middot; {timeLabel}
              </button>

              {broadened && (
                <p style={{ fontSize: 12.5, color: '#a9762f', margin: 0 }}>
                  Nothing matched exactly, so we widened it a little.
                </p>
              )}

              {hero && (
                <article
                  className="al-pop"
                  style={{
                    border: '1.5px solid #d4a373',
                    borderRadius: 18,
                    overflow: 'hidden',
                    boxShadow: '0 14px 34px -16px rgba(70,55,30,0.28)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '9px 16px',
                      background: 'linear-gradient(110deg, rgba(88,129,87,0.13), rgba(212,163,115,0.18))',
                      color: '#a9762f',
                    }}
                  >
                    <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.9 6.7 19.4l1.2-6L3.4 9.3l6-.7z" />
                    </svg>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                      We would start here
                    </span>
                  </div>
                  <div style={{ padding: '18px 18px 20px' }}>
                    <div style={{ display: 'flex', gap: 13, marginBottom: 11 }}>
                      <span style={medTile(hero.trackColor, 48, 14)}>
                        <CategoryIcon category={hero.category} color={hero.trackColor} size={26} />
                      </span>
                      <div style={{ minWidth: 0, paddingTop: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: hero.trackColor }} />
                          <span style={subjectTag(hero.trackColor)}>{hero.categoryLabel}</span>
                        </div>
                        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#2b2a26', lineHeight: 1.2, margin: 0 }}>
                          {hero.title}
                        </h3>
                      </div>
                    </div>
                    <p style={{ fontSize: 14, color: '#54524b', lineHeight: 1.55, margin: '0 0 14px' }}>
                      {hero.excerpt}
                    </p>
                    <div style={whyBox}>
                      <Stroke d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.5 2.5M15.2 15.2l2.5 2.5M17.7 6.3l-2.5 2.5M8.8 15.2l-2.5 2.5" size={15} sw={1.8} color="#a9762f" />
                      <span style={{ fontSize: 13, color: '#6b5a36', lineHeight: 1.5 }}>
                        <strong style={{ color: '#8a6418' }}>Why this one.</strong> {focusOpt.reason}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
                      <span style={pill}>{minsLabel(hero.effort)}</span>
                      <span style={pill}>Low prep</span>
                      <span style={pill}>Ages {hero.ageMin}-{hero.ageMax}</span>
                    </div>
                    <AddButton activity={hero} added={added.has(hero.slug)} onAdd={() => add(hero)} hero />
                  </div>
                </article>
              )}

              {extras.length > 0 && (
                <>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#8a877e', marginTop: 2 }}>
                    A couple of lighter options
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {extras.map((a) => (
                      <article key={a.slug} style={extraCard}>
                        <span style={chipTile(a.trackColor, 36, 10)}>
                          <CategoryIcon category={a.category} color={a.trackColor} size={18} />
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                            <span style={subjectTag(a.trackColor)}>{a.categoryLabel}</span>
                            <span style={{ fontSize: 11, color: '#8a877e' }}>&middot; {minsLabel(a.effort)}</span>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#2b2a26', lineHeight: 1.25 }}>
                            {a.title}
                          </div>
                        </div>
                        <AddButton activity={a} added={added.has(a.slug)} onAdd={() => add(a)} />
                      </article>
                    ))}
                  </div>
                </>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                <button onClick={reshuffle} style={ghostBtn} className="hover:brightness-95">
                  <Stroke d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" size={15} sw={1.8} />
                  Different ideas
                </button>
                <button
                  onClick={anyAdded ? onSeeWeek : onClose}
                  style={{ ...primaryBtn, flex: 1, marginTop: 0 }}
                  className="hover:brightness-95"
                >
                  {anyAdded ? 'See my plan' : 'Maybe later'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function avatar(i: number): React.CSSProperties {
    const colors = ['#C97B5C', '#588157', '#B6748A', '#6b8e6b', '#8b7355', '#b5803e'];
    return {
      width: 28,
      height: 28,
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 13,
      fontWeight: 700,
      color: '#faf9f6',
      background: colors[i % colors.length],
    };
  }
}

function AddButton({
  activity,
  added,
  onAdd,
  hero,
}: {
  activity: PlanActivity;
  added: boolean;
  onAdd: () => void;
  hero?: boolean;
}) {
  if (hero) {
    return (
      <button
        onClick={onAdd}
        disabled={added}
        className="hover:brightness-95"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 9,
          width: '100%',
          padding: 14,
          fontSize: 15,
          fontWeight: 600,
          borderRadius: 13,
          cursor: added ? 'default' : 'pointer',
          transition: 'all 200ms cubic-bezier(0.22,1,0.36,1)',
          background: added ? 'rgba(88,129,87,0.1)' : '#588157',
          color: added ? '#2f4a2e' : '#faf9f6',
          border: `1.5px solid ${added ? 'rgba(88,129,87,0.3)' : '#588157'}`,
        }}
      >
        <Stroke d={added ? 'M4 12l5 5L20 6' : 'M12 5v14M5 12h14'} size={16} sw={added ? 2.4 : 2.2} />
        {added ? 'Added to your plan' : 'Add to my plan'}
      </button>
    );
  }
  return (
    <button
      onClick={onAdd}
      disabled={added}
      className="hover:brightness-95"
      style={{
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        borderRadius: 9999,
        cursor: added ? 'default' : 'pointer',
        fontSize: 13,
        fontWeight: 600,
        transition: 'all 180ms ease',
        background: added ? 'rgba(88,129,87,0.1)' : '#fffdf9',
        color: added ? '#2f4a2e' : '#588157',
        border: `1.5px solid ${added ? 'rgba(88,129,87,0.3)' : 'rgba(61,92,59,0.2)'}`,
      }}
    >
      <Stroke d={added ? 'M4 12l5 5L20 6' : 'M12 5v14M5 12h14'} size={14} sw={added ? 2.4 : 2.2} />
      {added ? 'Added' : 'Add'}
    </button>
  );
}

function Stroke({ d, size, sw, color }: { d: string; size: number; sw: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? 'currentColor'}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0 }}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

// ---- shared style objects ----
const eyebrow: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 9,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#a9762f',
};
const eyebrowDash: React.CSSProperties = {
  width: 16,
  height: 1.5,
  background: 'currentColor',
  opacity: 0.5,
  borderRadius: 2,
};
function display(size: number): React.CSSProperties {
  return {
    fontWeight: 700,
    fontSize: `clamp(24px,5vw,${size}px)`,
    lineHeight: 1.05,
    color: '#588157',
    margin: '7px 0 0',
  };
}
const closeBtn: React.CSSProperties = {
  flexShrink: 0,
  width: 34,
  height: 34,
  borderRadius: '50%',
  background: '#f3ede1',
  border: 'none',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8a877e',
};
const qLabel: React.CSSProperties = { fontSize: 14, fontWeight: 600, color: '#2b2a26', marginBottom: 7 };
function radio(sel: boolean): React.CSSProperties {
  return {
    width: 22,
    height: 22,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid ${sel ? '#588157' : 'rgba(61,92,59,0.3)'}`,
    background: sel ? 'rgba(88,129,87,0.12)' : 'transparent',
  };
}
function radioInner(sel: boolean): React.CSSProperties {
  return { width: 8, height: 8, borderRadius: '50%', background: sel ? '#588157' : 'transparent' };
}
const primaryBtn: React.CSSProperties = {
  marginTop: 2,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 9,
  width: '100%',
  padding: 13,
  fontSize: 15.5,
  fontWeight: 600,
  color: '#faf9f6',
  background: '#588157',
  border: 'none',
  borderRadius: 14,
  cursor: 'pointer',
  boxShadow: '0 8px 22px -10px rgba(70,55,30,0.4)',
  transition: 'all 200ms cubic-bezier(0.22,1,0.36,1)',
};
const recapBtn: React.CSSProperties = {
  alignSelf: 'flex-start',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  background: 'none',
  border: 'none',
  color: '#8a877e',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  padding: 0,
};
const whyBox: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 9,
  padding: '11px 13px',
  background: 'rgba(212,163,115,0.1)',
  borderRadius: 11,
  marginBottom: 16,
};
const pill: React.CSSProperties = {
  padding: '5px 11px',
  borderRadius: 9999,
  background: '#f3ede1',
  fontSize: 12,
  fontWeight: 600,
  color: '#54524b',
};
const extraCard: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 13,
  padding: '12px 14px',
  background: '#faf9f6',
  border: '1px solid rgba(61,92,59,0.12)',
  borderRadius: 14,
};
const ghostBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 7,
  padding: '13px 16px',
  fontSize: 14,
  fontWeight: 600,
  color: '#588157',
  background: 'transparent',
  border: '1px solid rgba(61,92,59,0.16)',
  borderRadius: 13,
  cursor: 'pointer',
};
function medTile(color: string, size: number, radius: number): React.CSSProperties {
  return {
    width: size,
    height: size,
    borderRadius: radius,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: hexToRgba(color, 0.13),
  };
}
function chipTile(color: string, size: number, radius: number): React.CSSProperties {
  return {
    width: size,
    height: size,
    borderRadius: radius,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: hexToRgba(color, 0.13),
  };
}
function subjectTag(color: string): React.CSSProperties {
  return {
    fontSize: 10.5,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    color,
  };
}
