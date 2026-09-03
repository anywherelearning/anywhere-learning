'use client';

import { useEffect, useRef, useState } from 'react';
import { notifyLocalChanged } from '@/lib/account-sync';

const SEEN_KEY = 'al_tour_seen_v1';

/**
 * The "how it works" walkthrough video. Plays on a member's first sign-in;
 * the six cards below stay as the read-instead fallback and as the
 * "How it works" entry in the avatar menu. Hosted on Vercel Blob (compressed
 * 1280w H.264, ~2.5MB); re-upload to the same pathname to update it without
 * touching code. The Blob host is allowed under media-src in next.config.ts.
 */
const VIDEO_SRC = 'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com/member-tour/member-tour.mp4';
const VIDEO_POSTER = 'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com/member-tour/member-tour-poster.jpg';

/** Icons (no emoji, per brand). Simple line marks that echo each card. */
function MapIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  );
}
function FlagIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 21V4" />
      <path d="M5 4h12l-2.2 4L17 12H5" />
    </svg>
  );
}
function MountainsIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 20 9 8l4 7 2.4-4L21 20Z" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 6.5C10.4 5.5 7.8 5 4 5.6V19c3.8-.6 6.4-.1 8 .9M12 6.5C13.6 5.5 16.2 5 20 5.6V19c-3.8-.6-6.4-.1-8 .9M12 6.5V20" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </svg>
  );
}
function ClipboardIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4h6v3H9zM9 13l2 2 4-4" />
    </svg>
  );
}

const SLIDES = [
  {
    icon: <MapIcon />,
    title: "This is your family's trail.",
    body: 'Each child is an explorer who climbs the trail as you learn together. Every activity you finish earns a piece of gear and moves them to the next stop.',
  },
  {
    icon: <FlagIcon />,
    title: 'Your next stop, already picked.',
    body: 'We choose the next activity for you. Open the guide, do it together, then tap "We reached it." Not feeling it? Swap for another or skip the whole area.',
  },
  {
    icon: <MountainsIcon />,
    title: 'The trail keeps growing.',
    body: 'Fill every stop on a leg and the trail rolls on to a new region, from forest valleys to highland peaks, with more gear to collect the whole way.',
  },
  {
    icon: <BookIcon />,
    title: 'Every guide, in your Library.',
    body: 'The full library is sorted by the real-world skills each activity builds. Browse it anytime and add any one straight onto your trail.',
  },
  {
    icon: <CalendarIcon />,
    title: 'Fresh picks in This Month.',
    body: 'Each month we curate a skill to focus on, a handful of activities, book recommendations, and one simple family challenge to try together.',
  },
  {
    icon: <ClipboardIcon />,
    title: 'It all saves to your Record.',
    body: "Everything you finish gathers into a portfolio you can filter by child and print anytime, great for records or just seeing how far you've come.",
  },
];

/**
 * First-run welcome. Opens on the video for a real member (autoOpen) and can
 * be reopened any time from the avatar menu via the `al:open-tour` event.
 * "Prefer to read?" flips to the six cards, which stay the source of truth
 * for the written explanation and are cheap to keep accurate.
 */
export default function WelcomeTour({ autoOpen = false }: { autoOpen?: boolean }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'video' | 'cards'>('video');
  const [i, setI] = useState(0);
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
          setI(0);
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
      setI(0);
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
      if (mode !== 'cards') return;
      if (e.key === 'ArrowRight' && i < SLIDES.length - 1) setI((n) => n + 1);
      if (e.key === 'ArrowLeft' && i > 0) setI((n) => n - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, i, mode]);

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
            <button className="wt-back" onClick={() => { setI(0); setMode('cards'); }}>
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

  const last = i >= SLIDES.length - 1;
  const s = SLIDES[i];

  return (
    <div className="wt-scrim" role="dialog" aria-modal="true" aria-labelledby="wt-title" onClick={close}>
      <div className="wt-card" onClick={(e) => e.stopPropagation()}>
        <button className="wt-skip" onClick={close}>
          Skip
        </button>
        <div className="wt-icon">{s.icon}</div>
        <h2 id="wt-title" className="wt-title">
          {s.title}
        </h2>
        <p className="wt-body">{s.body}</p>
        <div className="wt-dots" aria-hidden="true">
          {SLIDES.map((_, k) => (
            <span key={k} className={`wt-dot${k === i ? ' on' : ''}`} />
          ))}
        </div>
        <div className="wt-actions">
          {i > 0 ? (
            <button className="wt-back" onClick={() => setI(i - 1)}>
              Back
            </button>
          ) : (
            <button className="wt-back" onClick={() => setMode('video')}>
              Watch instead
            </button>
          )}
          <button ref={nextRef} className="wt-next" onClick={() => (last ? close() : setI(i + 1))}>
            {last ? 'Start exploring' : 'Next'}
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
        .wt-icon{width:56px;height:56px;margin:0 auto 16px;border-radius:16px;
          display:grid;place-items:center;color:#3d5c3b;background:rgba(88,129,87,.13)}
        .wt-title{font-family:'Dancing Script','DM Sans',cursive;font-weight:700;
          font-size:clamp(26px,5.5vw,32px);line-height:1.08;color:#3d5c3b;margin:0 0 10px}
        .wt-sub{font-size:14.5px;color:#6f7468;margin:-4px 0 16px}
        .wt-frame{position:relative;width:100%;aspect-ratio:2142/950;min-height:160px;
          border-radius:14px;overflow:hidden;background:#1c2018;flex:0 0 auto}
        .wt-frame video{position:absolute;inset:0;width:100%;height:100%;display:block;background:#1c2018}
        .wt-body{font-size:15px;line-height:1.55;color:#57604f;margin:0 auto;max-width:342px;min-height:104px}
        .wt-dots{display:flex;gap:7px;justify-content:center;margin:18px 0 20px}
        .wt-dot{width:7px;height:7px;border-radius:50%;background:rgba(61,92,59,.22)}
        .wt-dot.on{background:#588157}
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
        }
    `}</style>
  );
}
