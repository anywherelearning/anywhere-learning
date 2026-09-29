'use client';

/**
 * The reader's "We did it!" button. Logs the activity as finished for the
 * family (or one kid, when there are several and the parent picks), exactly
 * like reaching a stop on the Home trail: a completion per kid, the activity
 * cleared from any trail queue, and the Library's done mark.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { loadProfile, type Child } from '@/lib/member-profile';
import { recordCompletion } from '@/lib/completions';
import { removeItem, FAMILY_TARGET } from '@/lib/week';
import { markDone } from '@/lib/account-status';

function childLabel(c: Child, i: number) {
  return c.name?.trim() || `Child ${i + 1}`;
}

export default function WeDidIt({ slug }: { slug: string }) {
  const [kids, setKids] = useState<{ id: string; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setKids((loadProfile()?.children ?? []).map((c, i) => ({ id: c.id ?? childLabel(c, i), name: childLabel(c, i) })));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  function log(who: { id: string; name: string }[], label: string) {
    who.forEach((k) => { recordCompletion(slug, k.id); removeItem(slug, k.id); });
    removeItem(slug, FAMILY_TARGET);
    markDone(slug);
    setOpen(false);
    setDone(label);
  }

  if (done) {
    return (
      <div className="rd-done" role="status">
        <strong>✓ Done{done ? `, ${done}` : ''}!</strong>
        <Link href="/account/home">See it on the trail →</Link>
      </div>
    );
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className="rd-btn rd-btn-ghost"
        onClick={() => (kids.length > 1 ? setOpen((o) => !o) : log(kids, ''))}
        aria-expanded={kids.length > 1 ? open : undefined}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12l5 5L20 6" /></svg>
        We did it!
      </button>
      {open && (
        <div className="rd-menu" role="menu">
          <button type="button" role="menuitem" onClick={() => log(kids, 'everyone')}><strong>Everyone</strong></button>
          {kids.map((k) => (
            <button key={k.id} type="button" role="menuitem" onClick={() => log([k], k.name)}>Just {k.name}</button>
          ))}
        </div>
      )}
    </div>
  );
}
