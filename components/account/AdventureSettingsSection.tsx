'use client';

/**
 * The "Our Adventure" tab in Account settings — everything about how the family
 * travels the map, in one place:
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
import { loadProfile, type Child } from '@/lib/member-profile';
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

export default function AdventureSettingsSection() {
  const [ready, setReady] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [avatars, setAvatars] = useState<Record<string, KidAvatar | null>>({});
  const [mode, setMode] = useState<WalkMode>('family');
  const [areas, setAreas] = useState<string[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [savedAreas, setSavedAreas] = useState(false);
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

  return (
    <div className="flex flex-col gap-5 mt-6">
      {/* 1. Kids — KidsSetup renders its own titled block, so no extra card here */}
      <KidsSetup embedded initialChildren={children} title="Manage your kids" submitLabel="Save changes" onDone={() => load()} />

      {/* 2. Explorers */}
      <Card title="Explorers" desc="Each kid gets an explorer that travels the adventure map and earns gear.">
        {children.length === 0 ? (
          <p className="font-body text-[13.5px] text-gray-500 m-0">Add a kid above and their explorer shows up here.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {children.map((c, i) => {
              const id = c.id ?? childLabel(c, i);
              const av = avatars[id] ?? null;
              return (
                <div key={id} className="flex items-center gap-3.5 bg-cream border border-[#E4E0D2] rounded-[14px] p-3.5">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-[#EEF1E9] border border-[#D8D4C5] grid place-items-center flex-shrink-0">
                    {av ? (
                      <ExplorerHead avatar={av} size={56} />
                    ) : (
                      <span className="font-display italic text-[22px] text-forest-dark">{childLabel(c, i).charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 font-body font-semibold text-[14.5px] text-ink truncate">{childLabel(c, i)}</p>
                    <p className="m-0 font-body text-[12.5px] text-gray-500">{av ? `${baseWord(av)} explorer` : 'No explorer yet'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditing(id)}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 border-[1.5px] border-forest text-forest-dark font-body font-semibold py-2 px-3 rounded-[10px] text-[13px] bg-white cursor-pointer hover:bg-[#E6EBDF] transition-colors"
                  >
                    {av ? 'Edit' : 'Build'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* 3. Trail format */}
      <Card title="Trail format" desc="Travel the map together, or give each kid their own path.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ModeOption
            active={mode === 'family'}
            onClick={() => chooseMode('family')}
            title="One family trail"
            desc="Everyone shares a single journey and reaches each milestone together."
          />
          <ModeOption
            active={mode === 'individual'}
            onClick={() => chooseMode('individual')}
            title="A trail per kid"
            desc="Each explorer follows their own path at their own pace."
          />
        </div>
      </Card>

      {/* 4. Focus areas */}
      <Card title="Focus areas" desc="The skills you want to see more of. We still weave the rest in lightly.">
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
    </div>
  );
}

function baseWord(av: KidAvatar) {
  return av.base;
}

function Card({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-gold/20 rounded-2xl p-5 md:p-6">
      <h2 className="font-display text-[clamp(1.25rem,2.4vw,1.5rem)] leading-[1.15] tracking-[-0.008em] text-ink m-0">{title}</h2>
      <p className="m-0 mt-1 mb-4 font-body text-[13.5px] leading-[1.5] text-gray-500">{desc}</p>
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
