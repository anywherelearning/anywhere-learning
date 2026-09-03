'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { INSIDE_TABS } from '@/lib/home-showcase';

/**
 * "A map, a month, a record": the product playing large on the left, three
 * tabs and the trial button in a column on the right. The clip is the point
 * of the section, so it takes the wider column and the copy stays to a line
 * or two per tab.
 *
 * The panel advances itself, so a visitor who never clicks still sees all
 * three. Clicking a tab takes over: the timer stops for good, because an
 * auto-advance that fights the person reading is worse than no motion at all.
 * Hovering the clip pauses without taking over, for anyone mid-sentence.
 *
 * A tab with a clip plays it silent and looping; a tab without one holds on
 * its still. Anyone who asked for reduced motion gets the poster instead of a
 * moving picture, and the tabs stop cycling. The tab buttons still work.
 *
 * Phones keep the stills, inside the open tab: at that width the side panel
 * sits hundreds of pixels below the picker, so tapping a tab would change a
 * picture you cannot see. Three looping videos stacked in an accordion is the
 * wrong place for motion, and it saves the work on a battery.
 */
export default function InsideMembership({ trialDays }: { trialDays: number }) {
  const [tab, setTab] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const takenOver = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setReduced(!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (paused || reduced || takenOver.current) return;
    const t = setTimeout(() => setTab((s) => (s + 1) % INSIDE_TABS.length), INSIDE_TABS[tab].holdMs);
    return () => clearTimeout(t);
  }, [tab, paused, reduced]);

  // Restart the clip from the top whenever its tab opens, so a picked tab
  // replays the whole pass rather than dropping the visitor mid-loop.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || reduced) return;
    v.currentTime = 0;
    const p = v.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }, [tab, reduced]);

  function pick(i: number) {
    takenOver.current = true;
    setTab(i);
  }

  const cur = INSIDE_TABS[tab];
  const showClip = !!cur.video && !reduced;

  const stillClass = (fit: 'contain' | 'cover') =>
    fit === 'cover' ? 'bg-cover bg-[top_center]' : 'bg-contain bg-center';

  return (
    <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-[minmax(0,1.9fr)_minmax(300px,1fr)] lg:gap-14">
      {/* Desktop: the clip, large, with a three-segment progress strip under
          it so the cycling reads as three scenes rather than a random swap. */}
      <div
        className="hidden lg:flex lg:flex-col lg:gap-3.5"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[26px] border border-gray-200/70 bg-[#f7f5f0] shadow-[0_36px_72px_-22px_rgba(88,129,87,0.28)]">
          {showClip ? (
            <video
              key={cur.video}
              ref={videoRef}
              src={cur.video}
              poster={cur.poster}
              muted
              loop
              autoPlay
              playsInline
              preload="metadata"
              aria-label={cur.alt}
              className="absolute inset-0 h-full w-full object-cover motion-safe:animate-[alFade_450ms_cubic-bezier(0.22,1,0.36,1)]"
            />
          ) : (
            <div
              key={cur.img}
              role="img"
              aria-label={cur.alt}
              className={`absolute inset-0 bg-no-repeat motion-safe:animate-[alFade_450ms_cubic-bezier(0.22,1,0.36,1)] ${stillClass(cur.fit)}`}
              style={{ backgroundImage: `url('${cur.poster ?? cur.img}')` }}
            />
          )}
        </div>
        <div className="flex items-center gap-2" aria-hidden="true">
          {INSIDE_TABS.map((t, i) => (
            <span
              key={t.n}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i === tab ? 'bg-forest' : 'bg-forest/[0.18]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Tabs, and the button the section exists for. */}
      <div className="flex flex-col justify-between gap-6">
        <div className="flex flex-col gap-2.5">
          {INSIDE_TABS.map((t, i) => {
            const on = tab === i;
            return (
              <div
                key={t.n}
                className={`rounded-[18px] border transition-all duration-300 ${
                  on
                    ? 'border-forest/35 bg-white shadow-[0_12px_28px_-8px_rgba(88,129,87,0.18)]'
                    : 'border-gray-200/70 bg-white/45'
                }`}
              >
                <button
                  type="button"
                  onClick={() => pick(i)}
                  aria-expanded={on}
                  aria-controls={`inside-tab-${i}`}
                  className="flex w-full items-center gap-3.5 px-5 py-[18px] text-left"
                >
                  <span
                    className={`inline-flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full text-[13.5px] font-semibold transition-all duration-300 ${
                      on ? 'bg-forest text-cream' : 'bg-forest/[0.14] text-forest-dark'
                    }`}
                  >
                    {t.n}
                  </span>
                  <span className="block text-lg font-semibold text-gray-900">{t.title}</span>
                </button>

                <div id={`inside-tab-${i}`} hidden={!on} className="px-5 pb-5 pl-[62px]">
                  <p className="text-[15px] leading-[1.55] text-gray-600">{t.body}</p>
                  {/* Phones only: the picture belongs with the tab it describes,
                      since the side panel is off-screen at this width. */}
                  <div
                    role="img"
                    aria-label={t.alt}
                    className={`-ml-[42px] mt-4 aspect-[3/2] w-[calc(100%+42px)] rounded-2xl border border-gray-200/70 bg-[#f7f5f0] bg-no-repeat lg:hidden ${stillClass(t.fit)}`}
                    style={{ backgroundImage: `url('${t.poster ?? t.img}')` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-start gap-3">
          <Link
            href="/start-trial"
            className="inline-flex items-center gap-2.5 rounded-2xl bg-forest px-9 py-[18px] text-lg font-semibold text-cream shadow-[0_12px_28px_-8px_rgba(88,129,87,0.4)] transition-all duration-200 hover:scale-[1.02] hover:bg-forest-dark active:scale-[0.97]"
          >
            Start free trial
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <span className="text-sm text-gray-500">{trialDays} days free. Cancel anytime.</span>
        </div>
      </div>
    </div>
  );
}
