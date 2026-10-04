'use client';

import { useEffect, useState } from 'react';

/**
 * Live countdown to the Fall offer deadline. Renders dashes on the server and
 * fills in after mount, so there's no hydration mismatch on the seconds.
 */
export default function Countdown({ endsAt, tone = 'light' }: { endsAt: string; tone?: 'light' | 'dark' }) {
  const end = new Date(endsAt).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const left = now === null ? null : Math.max(0, end - now);
  const days = left === null ? null : Math.floor(left / 86_400_000);
  const hours = left === null ? null : Math.floor((left % 86_400_000) / 3_600_000);
  const mins = left === null ? null : Math.floor((left % 3_600_000) / 60_000);

  const cell =
    tone === 'dark'
      ? 'bg-forest-dark text-cream'
      : 'bg-white text-ink shadow-[0_6px_16px_-10px_rgba(45,58,46,0.5)] border border-forest-dark/10';

  const units: [number | null, string][] = [
    [days, days === 1 ? 'day' : 'days'],
    [hours, hours === 1 ? 'hour' : 'hours'],
    [mins, 'min'],
  ];

  return (
    <div className="flex justify-center gap-2.5" role="timer" aria-label="Time left in the Fall offer">
      {units.map(([n, label]) => (
        <div key={label} className={`w-[72px] rounded-xl py-2 text-center ${cell}`}>
          <span className="block text-[26px] font-bold leading-tight tabular-nums">
            {n === null ? '--' : String(n).padStart(2, '0')}
          </span>
          <span className="text-[11px] uppercase tracking-[0.12em] opacity-70">{label}</span>
        </div>
      ))}
    </div>
  );
}
