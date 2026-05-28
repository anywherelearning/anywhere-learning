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
import { Eyebrow, PrimaryButton } from './dashboard-shared';
import { askAgent } from './dashboard-api';
import { useToast } from './Toast';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

const EXAMPLES = [
  'Plan a light outdoor week for everyone',
  'We use Singapore Math 4x a week, add it',
  "We're traveling Friday, keep it clear",
  'Start the Young Entrepreneur program',
];

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

  return (
    <section
      className="rounded-2xl border border-forest/15 p-5"
      style={{ background: 'linear-gradient(180deg, #F1F4EC 0%, #FBFAF6 100%)' }}
    >
      <Eyebrow>Plan by chat</Eyebrow>
      <h2
        className="mt-2 text-lg text-forest"
        style={{ fontFamily: '"DM Sans"', fontWeight: 600 }}
      >
        Just tell me what you want
      </h2>
      <p className="mt-0.5 text-sm text-forest/65" style={{ fontFamily: '"DM Sans"' }}>
        Talk or type. I will set up the week, add your curriculum, block travel days, or start a program.
      </p>

      {/* Conversation log */}
      {messages.length > 0 && (
        <div
          ref={logRef}
          className="mt-4 space-y-2 overflow-y-auto rounded-xl border border-forest/10 bg-white/70 p-3"
          style={{ maxHeight: 220 }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
            >
              <span
                className="inline-block rounded-2xl px-3 py-1.5"
                style={{
                  maxWidth: '85%',
                  fontFamily: '"DM Sans"',
                  fontSize: 13,
                  lineHeight: 1.4,
                  background: m.role === 'user' ? '#588157' : '#EDEEE9',
                  color: m.role === 'user' ? '#FAF9F6' : '#2D3A2E',
                }}
              >
                {m.content}
              </span>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <span
                className="inline-block rounded-2xl px-3 py-1.5"
                style={{ background: '#EDEEE9', color: '#7B8378', fontFamily: '"DM Sans"', fontSize: 13 }}
              >
                Thinking...
              </span>
            </div>
          )}
        </div>
      )}

      {/* Examples (only before first message) */}
      {messages.length === 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => send(ex)}
              disabled={sending}
              className="rounded-full border border-forest/15 bg-white px-3 py-1.5 text-forest/75 hover:border-forest/30 hover:text-forest cursor-pointer"
              style={{ fontFamily: '"DM Sans"', fontSize: 12 }}
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <div className="mt-4 flex items-center gap-2">
        {voiceSupported && (
          <button
            type="button"
            onClick={toggleMic}
            aria-label={listening ? 'Stop listening' : 'Speak'}
            aria-pressed={listening}
            className="grid place-items-center rounded-full"
            style={{
              width: 40,
              height: 40,
              flexShrink: 0,
              cursor: 'pointer',
              background: listening ? '#588157' : '#FFFFFF',
              border: `1px solid ${listening ? '#588157' : '#E5E0D2'}`,
              color: listening ? '#FAF9F6' : '#3A5A40',
            }}
            title={listening ? 'Listening... tap to stop' : 'Tap to talk'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
              <path d="M5 11a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
          placeholder={listening ? 'Listening...' : 'e.g. plan a calm week, lots of reading'}
          disabled={sending}
          className="flex-1 rounded-full border border-forest/15 bg-white px-4 py-2.5"
          style={{ fontFamily: '"DM Sans"', fontSize: 14, color: '#2D3A2E', outline: 'none' }}
        />
        <PrimaryButton onClick={() => send(input)} disabled={sending || !input.trim()}>
          Send
        </PrimaryButton>
      </div>
    </section>
  );
}
