import type { CSSProperties } from 'react';
import type { GiftCardData } from '@/lib/gift-card';
import { deliveryLabel } from '@/lib/gift';

/**
 * The gift card for a gift membership, used by /gift/card/[id] and
 * /gift/thanks.
 *
 * On screen: the front cover beside the open inside spread.
 * In print: a quarter-fold card on one sheet. The top half (back cover +
 * front cover) is printed upside down, so after folding the sheet in half
 * across the middle and then again like a book, the wreath is on the front,
 * the chickadee on the back and the note + details inside.
 *
 * Every size inside a panel is in `em`, so one `fontSize` on the panel scales
 * the whole thing between the screen preview and the printed sheet.
 */
export default function GiftCard({ card }: { card: GiftCardData }) {
  return (
    <>
      {/* Screen preview */}
      <div className="gift-card-screen mx-auto flex max-w-[1000px] flex-col items-center gap-6 print:hidden lg:flex-row lg:items-start lg:justify-center">
        <Panel style={screenPanel}>
          <FrontCover card={card} />
        </Panel>
        {/* The open inside spread; stacked on phones, where two pages don't fit side by side. */}
        <div className="flex flex-col shadow-[0_18px_30px_-20px_rgba(45,58,46,0.55)] sm:flex-row [&>*:first-child]:border-b [&>*:first-child]:border-dashed [&>*:first-child]:border-[#E3DCCB] sm:[&>*:first-child]:border-b-0 sm:[&>*:first-child]:border-r">
          <Panel style={{ ...screenPanel, boxShadow: 'none' }}>
            <InsideLeft card={card} />
          </Panel>
          <Panel style={{ ...screenPanel, boxShadow: 'none' }}>
            <InsideRight card={card} />
          </Panel>
        </div>
      </div>

      {/* Printed sheet: quarter fold */}
      <div className="gift-card-sheet hidden print:grid">
        <div className="gift-card-top">
          <Panel style={printPanel}>
            <BackCover />
          </Panel>
          <Panel style={printPanel}>
            <FrontCover card={card} />
          </Panel>
        </div>
        <div className="gift-card-bottom">
          <Panel style={printPanel}>
            <InsideLeft card={card} />
          </Panel>
          <Panel style={printPanel}>
            <InsideRight card={card} />
          </Panel>
        </div>
        <style>{`
          @page { size: letter portrait; margin: 0; }
          .gift-card-sheet { width: 100vw; height: 100vh; grid-template-rows: 1fr 1fr; }
          .gift-card-top, .gift-card-bottom { display: grid; grid-template-columns: 1fr 1fr; min-height: 0; }
          .gift-card-top { transform: rotate(180deg); }
          /* faint fold guides */
          .gift-card-bottom { border-top: 0.5pt dashed #d8d4c5; }
          .gift-card-top > :first-child, .gift-card-bottom > :first-child { border-right: 0.5pt dashed #d8d4c5; }
        `}</style>
      </div>
    </>
  );
}

const screenPanel: CSSProperties = {
  width: 320,
  height: 414,
  fontSize: 12.5,
  boxShadow: '0 18px 30px -20px rgba(45,58,46,0.55)',
};
const printPanel: CSSProperties = { width: '100%', height: '100%', fontSize: '11pt' };

const INK = '#2F3A2E';
const BODY = '#5B6270';
const GOLD = '#B5803E';
const FOREST = '#3d5c3b';
const script: CSSProperties = { fontFamily: 'var(--font-display), cursive', fontWeight: 700 };
const caps: CSSProperties = { textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 600 };

function Panel({ style, children }: { style: CSSProperties; children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#FFFCF6',
        color: INK,
        boxSizing: 'border-box',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Art({ src, style }: { src: string; style: CSSProperties }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" aria-hidden="true" style={{ position: 'absolute', height: 'auto', ...style }} />;
}

function FrontCover({ card }: { card: GiftCardData }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2em' }}>
      <div style={{ position: 'relative', width: '78%', aspectRatio: '340 / 351' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/gift/wreath.png" alt="" aria-hidden="true" style={{ width: '100%', height: 'auto', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...script, fontSize: '3em', lineHeight: 0.95, color: FOREST }}>
            A gift
            <br />
            for you
          </div>
        </div>
      </div>
      <div style={{ ...caps, fontSize: '0.72em', color: GOLD, marginTop: '1.8em' }}>
        {card.recipientName ? `For ${card.recipientName}'s family` : 'For your family'}
      </div>
      <div style={{ fontSize: '1.05em', color: BODY, marginTop: '0.5em' }}>A year of real-world adventures</div>
    </div>
  );
}

function BackCover() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2em' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/gift/chickadee.png" alt="" aria-hidden="true" style={{ width: '42%', height: 'auto' }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/email-logo-mark.png" alt="" aria-hidden="true" style={{ width: '2.6em', height: '2.6em', marginTop: '2.2em' }} />
      <div style={{ fontSize: '0.95em', fontWeight: 600, marginTop: '0.7em' }}>Anywhere Learning</div>
      <div style={{ fontSize: '0.8em', color: BODY, marginTop: '0.25em', fontStyle: 'italic' }}>Meaningful Learning, Wherever You Are</div>
      <div style={{ fontSize: '0.75em', color: BODY, marginTop: '0.9em' }}>anywherelearning.co</div>
    </div>
  );
}

function InsideLeft({ card }: { card: GiftCardData }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', padding: '3em 2.4em' }}>
      <Art src="/gift/ivy.png" style={{ width: '34%', top: '-2%', left: '-6%', transform: 'rotate(160deg)' }} />
      <Art src="/gift/berries.png" style={{ width: '28%', bottom: '3%', left: '4%', transform: 'rotate(-12deg)' }} />
      {card.giftMessage ? (
        <>
          <div style={{ ...caps, fontSize: '0.68em', color: GOLD }}>A note for you</div>
          <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1.2em', lineHeight: 1.55, marginTop: '1em', whiteSpace: 'pre-line' }}>
            &ldquo;{card.giftMessage}&rdquo;
          </div>
          <div style={{ fontSize: '0.72em', color: BODY, marginTop: '1.4em', ...caps, letterSpacing: '0.16em' }}>with love from</div>
          <div style={{ ...script, fontSize: '2em', color: FOREST, marginTop: '0.15em' }}>{card.giftFrom}</div>
        </>
      ) : (
        <>
          <div style={{ ...script, fontSize: '2.2em', lineHeight: 1.1, color: FOREST }}>Made for the days you&apos;ll remember</div>
          <div style={{ fontSize: '0.95em', color: BODY, marginTop: '0.9em', lineHeight: 1.5 }}>
            Cooking, building, growing and exploring, side by side.
          </div>
        </>
      )}
    </div>
  );
}

function InsideRight({ card }: { card: GiftCardData }) {
  const opens = card.scheduled ? deliveryLabel(card.startsAt) : null;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', padding: '2.6em 2.2em' }}>
      <Art src="/gift/maple.png" style={{ width: '22%', top: '3%', right: '4%', transform: 'rotate(18deg)' }} />
      <Art src="/gift/acorns.png" style={{ width: '24%', bottom: '3%', right: '4%', transform: 'rotate(-8deg)' }} />
      <div style={{ ...caps, fontSize: '0.68em', color: GOLD }}>
        {card.recipientName ? `For ${card.recipientName}'s family` : 'For your family'}
      </div>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.65em', lineHeight: 1.2, marginTop: '0.5em' }}>
        A year of real-world adventures
      </div>
      <div style={{ fontSize: '0.92em', color: BODY, lineHeight: 1.55, marginTop: '0.9em' }}>
        Twelve months of Anywhere Learning: hands-on activities to cook, build, grow, budget and
        invent, together.
      </div>
      <div style={{ width: '40%', margin: '1.2em auto 0', borderTop: '1px dashed #D8D4C5' }} />
      <div style={{ fontSize: '0.9em', color: INK, lineHeight: 1.5, marginTop: '1em' }}>
        {opens ? (
          <>
            Your library opens on <strong>{opens}</strong>. Look for an email from Anywhere Learning that morning.
          </>
        ) : (
          <>It&apos;s already waiting in your inbox. Look for an email from Anywhere Learning.</>
        )}
      </div>
      {/* With a note, the giver signs it on the left page; without one, sign here. */}
      {!card.giftMessage && (
        <>
          <div style={{ fontSize: '0.72em', color: BODY, marginTop: '1.3em', ...caps, letterSpacing: '0.16em' }}>with love from</div>
          <div style={{ ...script, fontSize: '2em', color: FOREST, marginTop: '0.15em' }}>{card.giftFrom}</div>
        </>
      )}
    </div>
  );
}
