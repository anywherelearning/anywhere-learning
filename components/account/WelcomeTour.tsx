'use client';

import { useEffect, useRef, useState } from 'react';
import { notifyLocalChanged } from '@/lib/account-sync';

const SEEN_KEY = 'al_tour_seen_v1';

/**
 * The "how it works" walkthrough video. Plays on a member's first sign-in;
 * the six cards below stay as the read-instead fallback and as the
 * "How it works" entry in the avatar menu. Hosted on Vercel Blob (compressed
 * 1600w H.264 with voiceover, ~5.5MB) under a versioned name: Blob URLs are
 * cached for a year, so a new recording gets a new -vN filename here. The Blob host is allowed under media-src in next.config.ts.
 */
const VIDEO_SRC = 'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com/member-tour/member-tour-v2.mp4';
const VIDEO_POSTER = 'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com/member-tour/member-tour-v2-poster.jpg';

/** The six stops of the written walkthrough. Stills come from the tour video
 * (public/images/tour); retake them when the member area changes. */
const STEPS = [
  { img: 'trail', kicker: 'Your trail', title: 'Each kid is an explorer.', body: "Your family's trail starts on Home. Every activity you finish together moves your explorers one stop along." },
  { img: 'next-stop', kicker: 'Next stop', title: 'The next activity is already picked.', body: 'Matched to your kids and your time. Open the guide, do it together, then tap We did it! Not feeling it? Tap Different one or Skip this area.' },
  { img: 'backpack', kicker: 'Gear', title: 'Every stop earns gear.', body: 'Tap an explorer to see their backpack. Each stop adds a new find, and a full leg rolls the trail on to a new region.' },
  { img: 'library', kicker: 'Library', title: 'Every guide, sorted by skill.', body: 'Browse all 120+ by skill area or age. Open any guide, or tap Add to trail to make it an upcoming stop.' },
  { img: 'this-month', kicker: 'This Month', title: 'Something fresh on the 1st.', body: 'A skill to focus on, a seasonal set, books to read together, and one family challenge.' },
  { img: 'record', kicker: 'Record', title: 'It all lands in your Record.', body: 'Saved per child: days, hours, skill areas and photos of the work. Print it as a portfolio anytime.' },
];

/**
 * First-run welcome. Opens on the video for a real member (autoOpen) and can
 * be reopened any time from the avatar menu via the `al:open-tour` event.
 * "Prefer to read?" flips to a one-page field guide: the six stops in one
 * scroll, each with a still from the video, so readers can skim it all.
 */
export default function WelcomeTour({ autoOpen = false }: { autoOpen?: boolean }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'video' | 'cards'>('video');
  const nextRef = useRef<HTMLButtonElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let opened = false;
    const maybeOpen = () => {
      if (opened) return;
      opened = true;
      try {
        if (autoOpen && !localStorage.getItem(SEEN_KEY)) {
          setMode('video');
          setOpen(true);
        }
      } catch {
        /* ignore */
      }
    };
    // Only decide to auto-open AFTER the cross-device sync has applied the
    // server state — otherwise a returning member (who saw the tour on another
    // device or session) gets it again while their fresh localStorage is still
    // empty. Fall back to a short timeout if the sync never signals (no Clerk).
    const w = window as { __alSyncReady?: boolean };
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onReady = () => maybeOpen();
    if (w.__alSyncReady) {
      maybeOpen();
    } else {
      window.addEventListener('al:sync-ready', onReady, { once: true });
      timer = setTimeout(maybeOpen, 2500);
    }

    const onOpen = () => {
      setMode('video');
      setOpen(true);
    };
    window.addEventListener('al:open-tour', onOpen);
    return () => {
      window.removeEventListener('al:open-tour', onOpen);
      window.removeEventListener('al:sync-ready', onReady);
      if (timer) clearTimeout(timer);
    };
  }, [autoOpen]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    nextRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode]);

  useEffect(() => {
    if (!open || mode !== 'video') return;
    const v = videoRef.current;
    if (!v) return;
    const p = v.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }, [open, mode]);

  function close() {
    try {
      videoRef.current?.pause();
    } catch {
      /* ignore */
    }
    try {
      localStorage.setItem(SEEN_KEY, '1');
      // Push to the server so the tour stays dismissed across devices and
      // fresh sessions, not just this browser's localStorage.
      notifyLocalChanged();
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  if (!open) return null;

  if (mode === 'video') {
    return (
      <div className="wt-scrim" role="dialog" aria-modal="true" aria-labelledby="wt-title" onClick={close}>
        <div className="wt-card wt-card-video" onClick={(e) => e.stopPropagation()}>
          <button className="wt-skip" onClick={close}>
            Skip
          </button>
          <h2 id="wt-title" className="wt-title">
            Here&apos;s how it works.
          </h2>
          <p className="wt-sub">A quick walk-through, then the trail is yours.</p>
          <div className="wt-frame">
            <video
              ref={videoRef}
              src={VIDEO_SRC}
              poster={VIDEO_POSTER}
              controls
              playsInline
              preload="metadata"
              aria-label="How the member zone works"
            />
          </div>
          <div className="wt-actions">
            <button className="wt-back" onClick={() => setMode('cards')}>
              Prefer to read?
            </button>
            <button ref={nextRef} className="wt-next" onClick={close}>
              Start exploring
            </button>
          </div>
        </div>
        <TourStyles />
      </div>
    );
  }

  return (
    <div className="wt-scrim" role="dialog" aria-modal="true" aria-labelledby="wt-title" onClick={close}>
      <div className="wt-card wt-card-guide" onClick={(e) => e.stopPropagation()}>
        <button className="wt-skip" onClick={close}>
          Skip
        </button>
        <div className="wt-kick">Field guide</div>
        <h2 id="wt-title" className="wt-title">
          How it works, in six stops.
        </h2>
        <ol className="wt-steps">
          {STEPS.map((t, k) => (
            <li key={t.img} className="wt-step">
              <span className="wt-num" aria-hidden="true">{k + 1}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="wt-shot" src={`/images/tour/${t.img}.webp`} alt="" loading="lazy" />
              <div className="wt-text">
                <div className="wt-kick wt-kick-sm">{t.kicker}</div>
                <h3 className="wt-step-title">{t.title}</h3>
                <p className="wt-body">{t.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="wt-actions">
          <button className="wt-back" onClick={() => setMode('video')}>
            Watch instead
          </button>
          <button ref={nextRef} className="wt-next" onClick={close}>
            Start exploring
          </button>
        </div>
      </div>
      <TourStyles />
    </div>
  );
}

function TourStyles() {
  return (
    <style>{`
        .wt-scrim{position:fixed;inset:0;z-index:120;display:flex;align-items:center;
          justify-content:center;padding:20px;background:rgba(28,32,24,.5);
          backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);
          font-family:'DM Sans',system-ui,sans-serif}
        .wt-card{position:relative;width:100%;max-width:404px;background:var(--am-bg1,#faf9f6);
          border:1px solid rgba(61,92,59,.14);border-radius:20px;padding:34px 28px 24px;
          text-align:center;box-shadow:0 30px 70px -24px rgba(28,40,24,.5)}
        .wt-card-video{max-width:760px;padding:30px 24px 20px;
          max-height:calc(100dvh - 40px);display:flex;flex-direction:column}
        .wt-skip{position:absolute;top:14px;right:16px;background:none;border:none;
          font-size:13px;font-weight:600;color:#9a978c;cursor:pointer;padding:4px}
        .wt-skip:hover{color:#6f7468}
        .wt-title{font-family:var(--font-plate),'DM Sans',sans-serif;font-weight:700;letter-spacing:-.01em;
          font-size:clamp(23px,4.5vw,28px);line-height:1.1;color:#32302a;margin:0 0 10px}
        .wt-kick{font-family:var(--font-catalog),monospace;font-size:11px;font-weight:500;
          letter-spacing:.14em;text-transform:uppercase;color:#bf7c48;margin-bottom:6px}
        .wt-kick-sm{font-size:10px;margin-bottom:3px}
        .wt-card-guide{max-width:640px;text-align:left;padding:30px 30px 20px;
          max-height:calc(100dvh - 40px);display:flex;flex-direction:column}
        .wt-steps{list-style:none;margin:8px 0 0;padding:0 4px 0 0;overflow-y:auto;flex:1 1 auto;min-height:0;position:relative;
          }
        .wt-step{display:grid;grid-template-columns:38px 150px 1fr;gap:14px;align-items:start;padding:12px 0;position:relative}
        .wt-step:not(:last-child)::before{content:'';position:absolute;left:17px;top:50px;bottom:-12px;border-left:3px dotted #d9b98f}
        .wt-num{width:36px;height:36px;border-radius:99px;background:#fdfaf3;border:2.5px solid #bf7c48;
          display:grid;place-items:center;font:700 15px var(--font-plate),sans-serif;color:#bf7c48;position:relative}
        .wt-shot{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;object-position:top left;
          border-radius:10px;border:1px solid rgba(50,48,42,.1);background:#ebe4d5}
        .wt-step-title{font:700 17px/1.2 var(--font-plate),sans-serif;color:#32302a;margin:0 0 4px}
        .wt-card-guide .wt-body{font-size:14px;max-width:none;min-height:0;margin:0;color:#6b6152}
        .wt-card-guide .wt-actions{margin-top:14px;padding-top:12px;border-top:1px solid rgba(50,48,42,.08)}
        .wt-sub{font-size:14.5px;color:#6f7468;margin:-4px 0 16px}
        .wt-frame{position:relative;width:100%;aspect-ratio:1600/692;min-height:160px;
          border-radius:14px;overflow:hidden;background:#1c2018;flex:0 0 auto}
        .wt-frame video{position:absolute;inset:0;width:100%;height:100%;display:block;background:#1c2018}
        .wt-body{font-size:15px;line-height:1.55;color:#57604f;margin:0 auto;max-width:342px;min-height:104px}
        .wt-actions{display:flex;align-items:center;justify-content:space-between;gap:12px}
        .wt-card-video .wt-actions{margin-top:18px}
        .wt-back{background:none;border:none;font-size:14.5px;font-weight:600;color:#6f7468;
          cursor:pointer;padding:8px 6px}
        .wt-back:hover{color:#3d5c3b}
        .wt-next{margin-left:auto;background:#588157;color:#faf9f6;font-weight:600;font-size:15px;
          border:none;padding:12px 26px;border-radius:12px;cursor:pointer;
          box-shadow:0 8px 20px -9px rgba(61,92,59,.55);transition:background .15s ease,transform .15s ease}
        .wt-next:hover{background:#3d5c3b;transform:translateY(-1px)}
        .wt-next:focus-visible{outline:3px solid #d4a373;outline-offset:3px}
        @media (max-width:520px){
          .wt-card-video{padding:26px 16px 16px}
          .wt-frame{border-radius:10px}
          .wt-card-guide{padding:26px 18px 16px}
          .wt-step{grid-template-columns:34px 1fr;gap:12px}
          .wt-step .wt-shot{grid-column:2;grid-row:2}
          .wt-step .wt-text{grid-column:2;grid-row:1}
          .wt-num{grid-row:1 / span 2;width:32px;height:32px;font-size:14px}
          .wt-step:not(:last-child)::before{left:15px;top:46px}
        }
    `}</style>
  );
}
