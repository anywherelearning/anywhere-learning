'use client';

import { useState } from 'react';

export type BasecampCardData = {
  /** 'Thursday, December 3' */
  dayLabel: string;
  /** '8:00 PM ET' */
  timeLabel: string;
  /** This month's skill, the session's 10-minute topic. */
  topic: string;
  /** Null for guests: the member zone also renders behind the paywall teaser. */
  zoomUrl: string | null;
  googleUrl: string | null;
  replays: { date: string; title: string; url: string }[];
};

const mono: React.CSSProperties = { fontFamily: 'var(--font-catalog),monospace', textTransform: 'uppercase', letterSpacing: '0.14em' };
const plate: React.CSSProperties = { fontFamily: 'var(--font-plate),sans-serif', fontWeight: 800 };
const PINE = '#2F5D4A';
const PINE_DEEP = '#1C3B2E';

/**
 * Basecamp on the This Month page: the next live session with Amelie, the
 * Zoom link, add-to-calendar, a box to send a question ahead of time, and
 * the replays.
 */
export default function BasecampCard({ data }: { data: BasecampCardData }) {
  const [question, setQuestion] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (question.trim().length < 3) return;
    setState('sending');
    try {
      const res = await fetch('/api/basecamp/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      setState(res.ok ? 'sent' : 'error');
      if (res.ok) setQuestion('');
    } catch {
      setState('error');
    }
  }

  const pill: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14,
    padding: '11px 18px', borderRadius: 999, textDecoration: 'none',
  };

  return (
    <section id="basecamp" style={{ scrollMarginTop: 90 }}>
      <div
        className="bc-card"
        style={{
          position: 'relative', overflow: 'hidden', borderRadius: 18,
          background: `linear-gradient(160deg, ${PINE}, ${PINE_DEEP})`, color: '#F6F1E4',
          padding: 'clamp(22px,3.5vw,34px)', boxShadow: '0 30px 60px -34px rgba(28,59,46,0.8)',
        }}
      >
        {/* a little campfire glow in the corner */}
        <span aria-hidden="true" style={{ position: 'absolute', right: -60, bottom: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,160,90,0.35), rgba(232,160,90,0) 70%)' }} />

        <div className="bc-grid" style={{ position: 'relative' }}>
          <div>
            <div style={{ ...mono, fontSize: 11.5, fontWeight: 700, color: '#E8C99A' }}>Live with Amelie · Members only</div>
            <h2 style={{ ...plate, fontSize: 'clamp(30px,4.6vw,44px)', letterSpacing: '-0.02em', margin: '8px 0 0', lineHeight: 1 }}>Basecamp</h2>
            <p style={{ fontSize: 16, lineHeight: 1.55, margin: '12px 0 0', maxWidth: '46ch', color: 'rgba(246,241,228,0.88)' }}>
              Once a month, explorers come back to Basecamp. Share what your family did, show what the kids made, get ready for this
              month&apos;s trail, and ask me anything. 40 minutes on Zoom.
            </p>

            <div style={{ marginTop: 18, display: 'grid', gap: 6 }}>
              <div style={{ ...plate, fontSize: 21 }}>{data.dayLabel} · {data.timeLabel}</div>
              <div style={{ fontSize: 14, color: 'rgba(246,241,228,0.8)' }}>This month&apos;s trail: {data.topic}</div>
            </div>

            {data.zoomUrl ? (
              <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <a href={data.zoomUrl} target="_blank" rel="noopener noreferrer" style={{ ...pill, background: '#E8C99A', color: PINE_DEEP }}>
                  Join on Zoom <span aria-hidden="true">&rarr;</span>
                </a>
                {data.googleUrl && (
                  <a href={data.googleUrl} target="_blank" rel="noopener noreferrer" style={{ ...pill, background: 'rgba(246,241,228,0.12)', color: '#F6F1E4', border: '1px solid rgba(246,241,228,0.3)' }}>
                    Add to Google Calendar
                  </a>
                )}
                <a href="/api/basecamp/calendar" style={{ ...pill, background: 'rgba(246,241,228,0.12)', color: '#F6F1E4', border: '1px solid rgba(246,241,228,0.3)' }}>
                  Apple or Outlook
                </a>
              </div>
            ) : (
              <p style={{ marginTop: 18, fontSize: 14, color: '#E8C99A' }}>Members get the Zoom link here.</p>
            )}
          </div>

          <div>
            <form onSubmit={send} style={{ background: 'rgba(246,241,228,0.08)', border: '1px solid rgba(246,241,228,0.18)', borderRadius: 14, padding: 16 }}>
              <label htmlFor="bc-q" style={{ ...mono, display: 'block', fontSize: 10.5, fontWeight: 700, color: '#E8C99A', marginBottom: 8 }}>
                Send me a question ahead of time
              </label>
              <textarea
                id="bc-q"
                value={question}
                onChange={(e) => { setQuestion(e.target.value); if (state !== 'sending') setState('idle'); }}
                maxLength={1000}
                rows={4}
                placeholder="How do I get my 11-year-old to want to do this? What if my kids are 6 and 12?"
                disabled={!data.zoomUrl}
                style={{ width: '100%', resize: 'vertical', borderRadius: 10, border: 'none', padding: '10px 12px', fontSize: 14.5, lineHeight: 1.5, color: '#2F3A2E', background: '#FFFDF8', font: 'inherit' }}
              />
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  disabled={!data.zoomUrl || state === 'sending' || question.trim().length < 3}
                  style={{ ...pill, border: 'none', cursor: 'pointer', background: '#F6F1E4', color: PINE_DEEP, opacity: question.trim().length < 3 ? 0.6 : 1 }}
                >
                  {state === 'sending' ? 'Sending…' : 'Send my question'}
                </button>
                <span role="status" style={{ fontSize: 13.5, color: 'rgba(246,241,228,0.85)' }}>
                  {state === 'sent' && 'Got it. I’ll answer it at Basecamp.'}
                  {state === 'error' && 'That didn’t go through. Try again, or email info@anywherelearning.co.'}
                </span>
              </div>
            </form>

            {data.replays.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ ...mono, fontSize: 10.5, fontWeight: 700, color: '#E8C99A', marginBottom: 8 }}>Missed one? Watch the replays</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
                  {data.replays.map((r) => (
                    <li key={r.url}>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: '#F6F1E4', fontSize: 14.5, textUnderlineOffset: 3 }}>
                        {r.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .bc-grid{display:grid;gap:22px;align-items:start}
        @media (min-width:820px){.bc-grid{grid-template-columns:1.15fr 1fr;gap:34px}}
      `}</style>
    </section>
  );
}
