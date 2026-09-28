import HeroScene from '@/components/account/HeroScene';

/**
 * The Adventure Map page header: sky gradient, the shared hills scene, a
 * mono kicker, and a chunky Bricolage title. Same look as the Library, This
 * Month and Record headers, for member pages that don't hand-roll their own.
 */
export default function MemberHero({
  kicker,
  title,
  lede,
  maxWidth = 960,
  children,
}: {
  kicker: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  maxWidth?: number;
  children?: React.ReactNode;
}) {
  return (
    <header
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: 'clamp(140px,18vw,190px)',
        background: 'linear-gradient(180deg, var(--am-sky1), var(--am-sky2))',
        padding: 'clamp(18px,2.5vw,26px) clamp(16px,4vw,40px) clamp(26px,3vw,38px)',
      }}
    >
      <HeroScene tone="light" hillHeight={100} />
      <div style={{ position: 'relative', maxWidth, margin: '0 auto' }}>
        <div
          style={{
            fontFamily: 'var(--font-catalog),monospace',
            fontSize: 12,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--am-trail)',
            marginBottom: 8,
          }}
        >
          {kicker}
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-plate),sans-serif',
            fontSize: 'clamp(32px,6vw,52px)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--am-ink)',
            lineHeight: 1.02,
            margin: 0,
          }}
        >
          {title}
        </h1>
        {lede && (
          <p style={{ fontSize: 16, color: 'var(--am-muted)', margin: '12px 0 0', maxWidth: '52ch', lineHeight: 1.55 }}>
            {lede}
          </p>
        )}
        {children}
      </div>
    </header>
  );
}
