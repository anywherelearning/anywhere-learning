import type { CSSProperties } from 'react';
import type { GiftCardData } from '@/lib/gift-card';
import { deliveryLabel } from '@/lib/gift';

/**
 * The gift card for a gift membership, used by /gift/card/[id] and
 * /gift/thanks. One flat page: on screen it's a paper card, in print it fills
 * a single letter sheet (no folding).
 *
 * Every size inside is in `em`, so one `fontSize` scales the whole card
 * between the screen preview and the printed page.
 */
export default function GiftCard({ card }: { card: GiftCardData }) {
  const opens = card.scheduled ? deliveryLabel(card.startsAt) : null;
  const forLine = card.recipientName ? `For ${card.recipientName}'s family` : 'For your family';

  return (
    <div className="gift-card mx-auto w-full max-w-[600px] shadow-[0_18px_30px_-20px_rgba(45,58,46,0.55)] print:max-w-none print:shadow-none">
      <div className="gift-card-page" style={page}>
        <div style={frame}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ ...script, fontSize: '2.6em', lineHeight: 1, color: FOREST }}>A gift for you</div>

          {/* a fan of real activities from the library */}
          <div style={{ position: 'relative', width: '86%', margin: '1.2em auto 0', aspectRatio: '2.25 / 1' }}>
            {FAN.map((c, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={c.slug}
                src={`/products/${c.slug}.jpg`}
                alt=""
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  bottom: c.lift,
                  left: `${i * 19}%`,
                  width: '24%',
                  height: 'auto',
                  transform: `rotate(${c.tilt}deg)`,
                  zIndex: c.z,
                  border: '0.25em solid #fff',
                  boxShadow: '0 0.5em 1em -0.5em rgba(45,58,46,0.45)',
                }}
              />
            ))}
          </div>

          <div style={{ ...caps, fontSize: '0.72em', color: GOLD, marginTop: '1.8em' }}>{forLine}</div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '2.1em', lineHeight: 1.15, marginTop: '0.35em' }}>
            A year of real-world adventures
          </div>
          <div style={{ fontSize: '0.95em', color: BODY, lineHeight: 1.55, margin: '0.8em auto 0', maxWidth: '30em' }}>
            Plan a party. Budget a road trip. Run a market stall. Invent a board game. Twelve months of
            real projects to do together, with the math, writing and life skills built in.
          </div>

          {card.giftMessage && (
            <div
              style={{
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                fontSize: '1.2em',
                lineHeight: 1.55,
                margin: '1.4em auto 0',
                maxWidth: '24em',
                whiteSpace: 'pre-line',
              }}
            >
              &ldquo;{card.giftMessage}&rdquo;
            </div>
          )}

          <div style={{ ...caps, fontSize: '0.7em', color: BODY, letterSpacing: '0.16em', marginTop: '1.5em' }}>with love from</div>
          <div style={{ ...script, fontSize: '2.4em', color: FOREST, marginTop: '0.1em' }}>{card.giftFrom}</div>

          <div style={{ width: '30%', margin: '1.3em auto 0', borderTop: '1px dashed #D8D4C5' }} />
          <div style={{ fontSize: '0.92em', lineHeight: 1.5, margin: '1em auto 0', maxWidth: '26em' }}>
            {opens ? (
              <>
                Your library opens on <strong>{opens}</strong>. Look for an email from Anywhere Learning that
                morning.
              </>
            ) : (
              <>It&apos;s already waiting in your inbox. Look for an email from Anywhere Learning.</>
            )}
          </div>
          </div>

          <div style={{ paddingTop: '1.6em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6em', color: BODY, fontSize: '0.78em' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/email-logo-mark.png" alt="" aria-hidden="true" style={{ width: '2.2em', height: '2.2em' }} />
            <span>
              <strong style={{ color: INK }}>Anywhere Learning</strong> · anywherelearning.co
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .gift-card-page { font-size: clamp(9px, 2.3vw, 13.5px); aspect-ratio: 8.5 / 11; }
        /* Phones: the page shape can't hold the text at a readable size, so let it grow. */
        @media screen and (max-width: 639px) { .gift-card-page { aspect-ratio: auto; } }
        @media print {
          @page { size: letter portrait; margin: 0; }
          .gift-card-page { width: 100vw; height: 100vh; aspect-ratio: auto !important; font-size: 15pt; }
        }
      `}</style>
    </div>
  );
}

/** Covers in the fan: real-world projects, not nature, so the card says what the library is. */
const FAN = [
  { slug: 'party-planner-math', tilt: -10, lift: '4%', z: 1 },
  { slug: 'road-trip-calculator', tilt: -4, lift: '10%', z: 2 },
  { slug: 'market-stall-pitch', tilt: 0, lift: '14%', z: 3 },
  { slug: 'kitchen-math-challenge', tilt: 5, lift: '10%', z: 2 },
  { slug: 'board-game-studio', tilt: 10, lift: '4%', z: 1 },
];

const INK = '#2F3A2E';
const BODY = '#5B6270';
const GOLD = '#B5803E';
const FOREST = '#3d5c3b';
const script: CSSProperties = { fontFamily: 'var(--font-display), cursive', fontWeight: 700 };
const caps: CSSProperties = { textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 600 };

const page: CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  background: '#FFFCF6',
  color: INK,
  padding: '7%',
  boxSizing: 'border-box',
  WebkitPrintColorAdjust: 'exact',
  printColorAdjust: 'exact',
};

const frame: CSSProperties = {
  position: 'relative',
  height: '100%',
  boxSizing: 'border-box',
  border: '1.5px dashed #D4A373',
  padding: '7% 8% 4%',
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'center',
};
