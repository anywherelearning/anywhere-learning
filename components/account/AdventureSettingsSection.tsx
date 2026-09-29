'use client';

/**
 * The family's side of Account settings, as two "passport pages":
 *   part="explorers": your kids (names + birthdays) and their explorers
 *   part="route":     trail format + focus areas
 * Covers:
 *   1. Your kids       — names + birthdays (the canonical KidsSetup editor)
 *   2. Explorers       — each kid's avatar, editable with the ExplorerBuilder
 *   3. Trail format    — one shared family trail, or one trail per kid
 *   4. Focus areas     — which Skills Map areas to lean into (the onboarding
 *                        question, revisitable any time)
 *
 * Everything reads and writes the same stores the member surfaces use
 * (member-profile, kid-roadmap avatars + walkMode, plan-prefs territories), so
 * changes here ripple straight to the Adventure Map home and the planner.
 */

import { useEffect, useState } from 'react';
import { loadProfile, childAge, type Child } from '@/lib/member-profile';
import KidsSetup from '@/components/account/KidsSetup';
import ExplorerBuilder from '@/components/account/ExplorerBuilder';
import { ExplorerHead } from '@/components/account/ExplorerAvatar';
import { avatarFor, saveAvatar, walkMode, setWalkMode, type KidAvatar, type WalkMode } from '@/lib/kid-roadmap';
import { loadPrefs, savePrefs } from '@/lib/plan-prefs';
import { TERRITORIES } from '@/lib/roadmap';
import { useFocusTrap } from '@/hooks/useFocusTrap';

function childLabel(c: Child, i: number) {
  return c.name?.trim() || `Child ${i + 1}`;
}

/** Which passport page to render: the kids + explorers, or the trail setup. */
export default function AdventureSettingsSection({ part }: { part: 'explorers' | 'route' }) {
  const [ready, setReady] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [avatars, setAvatars] = useState<Record<string, KidAvatar | null>>({});
  const [mode, setMode] = useState<WalkMode>('family');
  const [areas, setAreas] = useState<string[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [savedAreas, setSavedAreas] = useState(false);
  const [kidsOpen, setKidsOpen] = useState(false); // the names + birthdays editor
  const editTrapRef = useFocusTrap(!!editing);

  function load() {
    const kids = loadProfile()?.children ?? [];
    setChildren(kids);
    const av: Record<string, KidAvatar | null> = {};
    kids.forEach((c, i) => {
      const id = c.id ?? childLabel(c, i);
      av[id] = avatarFor(id);
    });
    setAvatars(av);
    setMode(walkMode() ?? 'family');
    setAreas(loadPrefs().territories);
    setReady(true);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return null;

  function chooseMode(m: WalkMode) {
    setMode(m);
    setWalkMode(m);
  }

  function toggleArea(slug: string) {
    setAreas((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      const final = next.length ? next : prev; // never let it hit zero
      savePrefs({ ...loadPrefs(), territories: final });
      return final;
    });
    setSavedAreas(true);
    window.setTimeout(() => setSavedAreas(false), 1500);
  }

  const editingChild = editing
    ? children.map((c, i) => [c.id ?? childLabel(c, i), childLabel(c, i)] as const).find(([id]) => id === editing)
    : null;

  if (part === 'route') {
    return (
      <Card id="route">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ModeOption
            active={mode === 'family'}
            onClick={() => chooseMode('family')}
            title="One family trail"
            desc="Everyone travels together."
          />
          <ModeOption
            active={mode === 'individual'}
            onClick={() => chooseMode('individual')}
            title="A trail per kid"
            desc="Each kid gets their own path."
          />
        </div>

        <h3 className="m-0 mt-6 font-[family-name:var(--font-catalog)] text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--am-trail)]">Focus areas</h3>
        <div className="mb-3" />
        <div className="flex flex-wrap gap-2">
          {TERRITORIES.map((t) => {
            const on = areas.includes(t.slug);
            return (
              <button
                key={t.slug}
                type="button"
                onClick={() => toggleArea(t.slug)}
                aria-pressed={on}
                className={`inline-flex items-center gap-1.5 font-body font-semibold text-[13px] py-2 px-3.5 rounded-full border transition-colors cursor-pointer ${
                  on
                    ? 'bg-[#E6EBDF] border-forest text-forest-dark'
                    : 'bg-cream border-[#D8D4C5] text-gray-500 hover:border-forest/50 hover:text-forest-dark'
                }`}
              >
                {on && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12l5 5L20 6" /></svg>
                )}
                {t.name}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2 min-h-[18px]">
          <p className="m-0 font-body text-[12.5px] text-gray-500">{areas.length} of {TERRITORIES.length} areas on</p>
          {savedAreas && <span className="font-body text-[12.5px] text-forest-dark font-medium" role="status">✓ Saved</span>}
        </div>
      </Card>
    );
  }

  return (
    <Card id="explorers">
      {children.length > 0 && (
        <div className="grid grid-cols-1 gap-2.5">
          {children.map((c, i) => {
            const id = c.id ?? childLabel(c, i);
            const av = avatars[id] ?? null;
            const age = childAge(c);
            return (
              <div key={id} className="flex items-center gap-3.5 bg-[rgba(58,44,23,0.035)] rounded-[14px] p-3">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-[#EEF1E9] border-2 border-white shadow-[0_6px_14px_-8px_rgba(58,44,23,0.5)] grid place-items-center flex-shrink-0">
                  {av ? (
                    <ExplorerHead avatar={av} size={56} />
                  ) : (
                    <span className="text-[22px] text-forest-dark" style={{ fontFamily: 'var(--font-plate),sans-serif', fontWeight: 800 }}>{childLabel(c, i).charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="m-0 font-body font-semibold text-[15px] text-ink truncate">{childLabel(c, i)}</p>
                  <p className="m-0 font-body text-[12.5px] text-gray-500">{age != null ? `Age ${age}` : 'Age not set'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(id)}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 border-[1.5px] border-forest text-forest-dark font-body font-semibold py-2 px-3 rounded-[10px] text-[13px] bg-white cursor-pointer hover:bg-[#E6EBDF] transition-colors"
                >
                  {av ? 'Edit' : 'Build explorer'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {children.length > 0 && !kidsOpen ? (
        <button
          type="button"
          onClick={() => setKidsOpen(true)}
          className="mt-4 bg-transparent border-0 p-0 cursor-pointer font-body font-semibold text-[13.5px] text-forest hover:text-forest-dark"
        >
          + Add a child or change a name
        </button>
      ) : (
        <div className="mt-4 pt-4 border-t border-dashed border-[rgba(58,44,23,0.16)]">
          <h3 className="m-0 mb-3 font-[family-name:var(--font-catalog)] text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--am-trail)]">Names &amp; birthdays</h3>
          <KidsSetup embedded bare initialChildren={children} submitLabel="Save changes" onDone={() => { load(); setKidsOpen(false); }} />
        </div>
      )}

      {/* Explorer builder modal */}
      {editing && editingChild && (
        <div
          onClick={() => setEditing(null)}
          onKeyDown={(e) => { if (e.key === 'Escape') setEditing(null); }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(34,40,29,0.5)', backdropFilter: 'blur(3px)' }}
        >
          <div ref={editTrapRef} role="dialog" aria-modal="true" aria-label={`Edit ${editingChild[1]}'s explorer`} onClick={(e) => e.stopPropagation()} style={{ width: 'min(460px,100%)' }}>
            <ExplorerBuilder
              kidName={editingChild[1]}
              initial={avatars[editing] ?? null}
              onSave={(a) => {
                saveAvatar(editing, a);
                setAvatars((prev) => ({ ...prev, [editing]: a }));
                setEditing(null);
              }}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      )}
    </Card>
  );
}

function baseWord(av: KidAvatar) {
  return av.base;
}

function Card({ id, kicker, title, desc, children }: { id?: string; kicker?: string; title?: string; desc?: string; children: React.ReactNode }) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-[20px] p-5 md:p-7"
      style={{ background: 'var(--am-paper)', border: '1px solid rgba(58,44,23,0.12)', boxShadow: '0 16px 40px -24px rgba(45,55,40,0.45)' }}
    >
      {kicker && <div className="font-[family-name:var(--font-catalog)] text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--am-trail)] mb-1">{kicker}</div>}
      {title && (
      <h2
        className="m-0 text-[clamp(1.25rem,2.4vw,1.5rem)] leading-[1.15]"
        style={{ fontFamily: 'var(--font-plate),sans-serif', fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--am-ink)' }}
      >
        {title}
      </h2>
      )}
      {desc && <p className="m-0 mt-1 mb-4 font-body text-[13.5px] leading-[1.5] text-gray-500">{desc}</p>}
      {children}
    </section>
  );
}

function ModeOption({ active, onClick, title, desc }: { active: boolean; onClick: () => void; title: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-left rounded-[14px] p-4 border-[1.5px] cursor-pointer transition-all ${
        active ? 'border-forest bg-[#E6EBDF]' : 'border-[#D8D4C5] bg-cream hover:border-forest/50'
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`w-4 h-4 rounded-full border-2 grid place-items-center flex-shrink-0 ${active ? 'border-forest' : 'border-gray-300'}`}
        >
          {active && <span className="w-2 h-2 rounded-full bg-forest" />}
        </span>
        <span className="font-body font-semibold text-[14.5px] text-ink">{title}</span>
      </div>
      <p className="m-0 mt-1.5 font-body text-[13px] leading-[1.5] text-gray-500">{desc}</p>
    </button>
  );
}
