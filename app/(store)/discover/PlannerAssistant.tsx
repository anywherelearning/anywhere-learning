'use client';

/**
 * The "just tell me" front door to the planner.
 *
 * A chat box (type or talk) that drives the same engine as the manual planner
 * and the program shelf. The parent says what they want in plain language and
 * the AI calls tools to set goals, generate the week, add their curriculum,
 * block time, or start a program. On any change, the plan reloads.
 *
 * Voice uses the browser's built-in SpeechRecognition (no API cost). The mic
 * button is hidden when the browser doesn't support it.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ALIcons, ALTokens, Eyebrow, PrimaryButton } from './dashboard-shared';
import { askAgent } from './dashboard-api';
import { useToast } from './Toast';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

const EXAMPLES = [
  'Plan a gentle week, lots of outdoors',
  'We use Singapore Math 4x a week, add it',
  'We travel Friday, keep it clear',
  'Start the Young Entrepreneur program',
];

function timeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

// Minimal shape of the Web Speech API we use (not in the standard TS lib).
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export default function PlannerAssistant({
  weekStart,
  onChanged,
  onNeedsUpgrade,
}: {
  weekStart: string;
  onChanged: (weekStart?: string) => void | Promise<void>;
  onNeedsUpgrade?: () => void;
}) {
  const toast = useToast();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (Ctor) {
      setVoiceSupported(true);
      const rec = new Ctor();
      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.continuous = false;
      rec.onresult = (e) => {
        const text = Array.from({ length: e.results.length })
          .map((_, i) => e.results[i][0].transcript)
          .join(' ');
        setInput((prev) => (prev ? `${prev} ${text}` : text));
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      recognitionRef.current = rec;
    }
  }, []);

  useEffect(() => {
    // Keep the log scrolled to the latest message.
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const toggleMic = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      try {
        rec.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  }, [listening]);

  const send = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || sending) return;
      setInput('');
      const history = messages.slice(-6);
      setMessages((m) => [...m, { role: 'user', content: message }]);
      setSending(true);
      try {
        const res = await askAgent({ message, history, weekStart });
        setMessages((m) => [...m, { role: 'assistant', content: res.reply }]);
        if (res.needsUpgrade) {
          onNeedsUpgrade?.();
        } else if (res.changed) {
          await onChanged(res.weekStart);
          toast.success('Plan updated.');
        }
      } catch (err) {
        console.error(err);
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: 'Sorry, I could not reach the assistant. Try again?' },
        ]);
      } finally {
        setSending(false);
      }
    },
    [messages, sending, weekStart, onChanged, onNeedsUpgrade, toast],
  );

  const started = messages.length > 0;

  return (
    <section
      style={{
        position: 'relative',
        background: 'linear-gradient(166deg, #fffdf9 0%, #f6f1e7 100%)',
        border: `1px solid ${ALTokens.color.line}`,
        borderRadius: ALTokens.radius.xl,
        padding: 'clamp(22px, 4vw, 34px)',
        boxShadow: ALTokens.shadow.sm,
        overflow: 'hidden',
      }}
    >
      {/* 4px accent rule at top */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: ALTokens.color.forest,
          opacity: 0.85,
        }}
      />

      {/* Header with chat-bubble glyph + eyebrow */}
      <div
        className="flex items-center gap-3"
        style={{ marginBottom: 16 }}
      >
        <span
          className="inline-flex items-center justify-center"
          style={{
            width: 34,
            height: 34,
            borderRadius: ALTokens.radius.sm,
            background: 'rgba(88,129,87,0.13)',
          }}
        >
          <ALIcons.Chat size={18} color={ALTokens.color.forest} />
        </span>
        <Eyebrow>{started ? 'Planning together' : 'Plan by chat'}</Eyebrow>
      </div>

      {/* Editorial greeting (only before first message) */}
      {!started && (
        <>
          <h2
            style={{
              margin: 0,
              fontFamily: ALTokens.font,
              fontWeight: 700,
              fontSize: 28,
              lineHeight: 1.12,
              letterSpacing: '-0.02em',
              color: ALTokens.color.ink,
              maxWidth: '18em',
            }}
          >
            {timeOfDay()}. What are you hoping for this week?
          </h2>
          <p
            style={{
              margin: '12px 0 22px',
              fontSize: 15.5,
              color: ALTokens.color.body,
              lineHeight: 1.6,
              maxWidth: '34em',
            }}
          >
            Talk or type, the way you would to a friend who plans for a living. I will shape the week, fold in your own curriculum, keep travel days clear, or start a program.
          </p>

          <div className="flex flex-wrap gap-2 mb-5">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => send(ex)}
                disabled={sending}
                style={{
                  background: ALTokens.color.paper,
                  border: `1px solid ${ALTokens.color.line}`,
                  borderRadius: ALTokens.radius.pill,
                  padding: '9px 15px',
                  fontFamily: ALTokens.font,
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: ALTokens.color.forestInk,
                  cursor: sending ? 'not-allowed' : 'pointer',
                  opacity: sending ? 0.6 : 1,
                  transition: `all 160ms ${ALTokens.ease}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = ALTokens.color.forest;
                  e.currentTarget.style.background = 'rgba(88,129,87,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = ALTokens.color.line;
                  e.currentTarget.style.background = ALTokens.color.paper;
                }}
              >
                {ex}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Active conversation: bubble thread */}
      {started && (
        <div
          ref={logRef}
          className="overflow-y-auto"
          style={{
            margin: '4px -2px 16px',
            padding: '4px 2px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            maxHeight: 420,
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
                animation: `al-fade .3s ${ALTokens.ease}`,
              }}
            >
              <div
                style={{
                  background: m.role === 'user' ? ALTokens.color.forest : ALTokens.color.paper,
                  color: m.role === 'user' ? ALTokens.color.cream : ALTokens.color.ink,
                  border: m.role === 'user' ? 'none' : `1px solid ${ALTokens.color.line}`,
                  padding: m.role === 'user' ? '11px 16px' : '13px 16px',
                  borderRadius:
                    m.role === 'user'
                      ? '16px 16px 4px 16px'
                      : '16px 16px 16px 4px',
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  fontFamily: ALTokens.font,
                  fontWeight: m.role === 'user' ? 500 : 400,
                }}
              >
                {m.content}
              </div>
            </div>
          ))}
          {sending && (
            <div
              style={{
                alignSelf: 'flex-start',
                maxWidth: '88%',
                animation: `al-fade .3s ${ALTokens.ease}`,
              }}
            >
              <div
                className="inline-flex items-center gap-2"
                style={{
                  background: ALTokens.color.paper,
                  border: `1px solid ${ALTokens.color.line}`,
                  padding: '12px 16px',
                  borderRadius: '16px 16px 16px 4px',
                  fontSize: 14,
                  color: ALTokens.color.muted,
                  fontFamily: ALTokens.font,
                  fontWeight: 500,
                }}
              >
                <span
                  className="al-pulse"
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: ALTokens.color.gold,
                  }}
                />
                Shaping the week
              </div>
            </div>
          )}
        </div>
      )}

      {/* Composer — paper row, voice button left, send icon right */}
      <div
        className="flex items-center gap-2"
        style={{
          background: ALTokens.color.paper,
          border: `1px solid ${ALTokens.color.line}`,
          borderRadius: ALTokens.radius.lg,
          padding: '8px 8px 8px 12px',
          boxShadow: ALTokens.shadow.xs,
        }}
      >
        {voiceSupported && (
          <button
            type="button"
            onClick={toggleMic}
            aria-label={listening ? 'Stop listening' : 'Speak'}
            aria-pressed={listening}
            className="grid place-items-center"
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              flexShrink: 0,
              cursor: 'pointer',
              background: listening ? ALTokens.color.forest : 'rgba(88,129,87,0.08)',
              border: 'none',
              color: listening ? ALTokens.color.cream : ALTokens.color.forest,
              transition: `all 150ms ${ALTokens.ease}`,
            }}
            title={listening ? 'Listening, tap to stop' : 'Tap to talk'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
              <path
                d="M5 11a7 7 0 0 0 14 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path d="M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send(input);
          }}
          placeholder={
            sending
              ? 'Shaping the week...'
              : listening
              ? 'Listening...'
              : 'Message your planner'
          }
          disabled={sending}
          className="flex-1"
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: ALTokens.font,
            fontSize: 15,
            color: ALTokens.color.ink,
            minWidth: 0,
            padding: '4px 4px',
          }}
        />
        <PrimaryButton
          onClick={() => send(input)}
          disabled={sending || !input.trim()}
          small
          style={{ borderRadius: ALTokens.radius.md }}
        >
          <ALIcons.Arrow size={15} color={ALTokens.color.cream} />
        </PrimaryButton>
      </div>
    </section>
  );
}
