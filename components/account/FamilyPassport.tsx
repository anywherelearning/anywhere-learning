'use client';

/**
 * The "family passport" at the top of Account settings: the kids' explorers,
 * the family name, ages, trail format and progress, with a membership stamp.
 * Reads the same local stores as the rest of the member zone and re-reads
 * whenever they change (e.g. a kid is renamed further down the page).
 */

import { useEffect, useState } from 'react';
import { loadProfile, childAge, type Child } from '@/lib/member-profile';
import { avatarFor, walkMode, type KidAvatar } from '@/lib/kid-roadmap';
import { completionLog } from '@/lib/completions';
import { ExplorerHead } from '@/components/account/ExplorerAvatar';

function childLabel(c: Child, i: number) {
  return c.name?.trim() || `Child ${i + 1}`;
}

export default function FamilyPassport({
  lastName,
  stamp,
  stampSub,
}: {
  /** The parent's last name, for "The ___ family". */
  lastName?: string | null;
  /** Big stamp line, e.g. "Founding member" or "Free trial". */
  stamp: string;
  /** Small stamp line, e.g. "since Aug 2026". */
  stampSub?: string;
}) {
  const [kids, setKids] = useState<{ id: string; name: string; age: number | null; av: KidAvatar | null }[]>([]);
  const [mode, setMode] = useState<'family' | 'individual'>('family');
  const [finished, setFinished] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const read = () => {
      const children = loadProfile()?.children ?? [];
      setKids(children.map((c, i) => {
        const id = c.id ?? childLabel(c, i);
        return { id, name: childLabel(c, i), age: childAge(c), av: avatarFor(id) };
      }));
      setMode(walkMode() ?? 'family');
      setFinished(new Set(completionLog().map((l) => l.slug)).size);
      setReady(true);
    };
    read();
    window.addEventListener('al:local-changed', read);
    return () => window.removeEventListener('al:local-changed', read);
  }, []);

  const family = lastName?.trim() ? `The ${lastName.trim()} family` : 'Your family';
  const facts = [
    ...kids.map((k) => (k.age != null ? `${k.name}, ${k.age}` : k.name)),
    mode === 'family' ? 'One family trail' : 'A trail per kid',
    `${finished} ${finished === 1 ? 'activity' : 'activities'} finished`,
  ];

  return (
    <section className="fp" aria-label="Family passport">
      <style>{`
        .fp{position:relative;margin-top:-28px;background:linear-gradient(150deg,#34503f,#2a4233);color:#f4efe2;border-radius:20px;padding:clamp(18px,3vw,28px);box-shadow:0 30px 60px -30px rgba(30,40,30,.7);display:grid;gap:18px 24px;align-items:center;overflow:hidden}
        .fp::after{content:"";position:absolute;inset:8px;border:1px dashed rgba(214,194,143,.28);border-radius:14px;pointer-events:none}
        @media (min-width:720px){.fp{grid-template-columns:auto 1fr auto}}
        .fp-faces{display:flex}
        .fp-face{width:68px;height:68px;border-radius:50%;overflow:hidden;background:#eef1e9;border:3px solid #f4efe2;display:grid;place-items:center;box-shadow:0 8px 16px -8px rgba(0,0,0,.5)}
        .fp-face+.fp-face{margin-left:-14px}
        .fp-kick{font-family:var(--font-catalog),monospace;font-size:10.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#d6c28f}
        .fp-name{font-family:var(--font-plate),sans-serif;font-weight:800;font-size:clamp(24px,3.2vw,32px);letter-spacing:-.01em;line-height:1.1;margin:5px 0 6px}
        .fp-facts{font-size:13.5px;opacity:.88;line-height:1.5}
        .fp-stamp{justify-self:start;transform:rotate(-6deg);border:2px solid #d6c28f;color:#d6c28f;border-radius:10px;padding:7px 13px;font-family:var(--font-catalog),monospace;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;text-align:center;line-height:1.5}
        @media (min-width:720px){.fp-stamp{justify-self:end}}
      `}</style>
      <div className="fp-faces" aria-hidden="true">
        {ready && kids.length === 0 && <span className="fp-face" style={{ color: '#3d5c3b', fontFamily: 'var(--font-plate),sans-serif', fontWeight: 800, fontSize: 26 }}>?</span>}
        {kids.map((k) => (
          <span key={k.id} className="fp-face">
            {k.av ? (
              <ExplorerHead avatar={k.av} size={62} />
            ) : (
              <span style={{ color: '#3d5c3b', fontFamily: 'var(--font-plate),sans-serif', fontWeight: 800, fontSize: 26 }}>{k.name.charAt(0).toUpperCase()}</span>
            )}
          </span>
        ))}
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="fp-kick">Anywhere Learning · Family passport</div>
        <div className="fp-name">{family}</div>
        <div className="fp-facts">{ready ? (kids.length ? facts.join(' · ') : 'Add your kids below to start the trail.') : ' '}</div>
      </div>
      <div className="fp-stamp">
        {stamp}
        {stampSub && <><br />{stampSub}</>}
      </div>
    </section>
  );
}
