/**
 * Shared storybook scene for the member zone — soft layered hills, a few far
 * pines, and drifting fireflies. Drop it into any `position:relative;
 * overflow:hidden` header/hero as an absolutely-positioned backdrop.
 *
 * tone: 'light' sits on the cream pages (Home, This Month, Library, Record);
 * 'dark' sits on the deep-green forest headers (My Plan).
 *
 * Uses the alDrift keyframe from globals.css (reduced-motion respected there).
 */

const FLIES: [number, number, number, number][] = [
  [10, 24, 6, 0], [26, 15, 5, 1.2], [43, 30, 7, 0.4], [62, 18, 5, 2],
  [78, 11, 6, 0.8], [88, 33, 7, 1.6], [70, 45, 5, 2.4], [18, 47, 6, 0.6],
];

const PINES: [number, number][] = [[70, 108], [130, 104], [190, 112], [1030, 90], [1095, 86], [1150, 94]];

// A light echo of Home's dashed trail: a few footprints stepping across the
// lower band of the scene. [xPercent, yPercent, rotationDeg].
const FOOTPRINTS: [number, number, number][] = [
  [9, 86, -20], [20, 80, 14], [32, 85, -16], [44, 79, 12],
  [56, 84, -14], [68, 78, 10], [80, 83, -18], [91, 79, 12],
];

export default function HeroScene({
  tone = 'light',
  hillHeight = 150,
  trail = true,
}: { tone?: 'light' | 'dark'; hillHeight?: number; trail?: boolean }) {
  const dark = tone === 'dark';
  const far = dark ? 'rgba(15,26,12,0.38)' : 'rgba(88,129,87,0.06)';
  const near = dark ? 'rgba(10,20,8,0.45)' : 'rgba(88,129,87,0.11)';
  const pine = dark ? 'rgba(10,20,8,0.40)' : 'rgba(88,129,87,0.10)';
  const flyA = dark ? 'rgba(232,201,154,0.75)' : 'rgba(212,163,115,0.5)';
  const flyB = dark ? 'rgba(232,201,154,0.4)' : 'rgba(88,129,87,0.28)';
  const foot = dark ? 'rgba(232,201,154,0.28)' : 'rgba(180,128,62,0.20)';
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {trail && FOOTPRINTS.map(([x, y, rot], i) => (
        <span
          key={`foot${i}`}
          style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            width: 7,
            height: 11,
            borderRadius: '50%',
            background: foot,
            transform: `rotate(${rot}deg)`,
          }}
        />
      ))}
      <svg viewBox="0 0 1200 220" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: hillHeight }}>
        <path d="M0,124 Q180,74 380,100 Q620,132 820,88 Q1010,50 1200,94 L1200,220 L0,220 Z" fill={far} />
        {PINES.map(([x, y], pi) => (
          <g key={pi} fill={pine}>
            <path d={`M${x},${y - 22} L${x - 8},${y - 4} L${x + 8},${y - 4} Z`} />
            <path d={`M${x},${y - 14} L${x - 10},${y + 6} L${x + 10},${y + 6} Z`} />
          </g>
        ))}
        <path d="M0,158 Q220,120 460,144 Q700,166 900,136 Q1060,112 1200,142 L1200,220 L0,220 Z" fill={near} />
      </svg>
      {FLIES.map(([x, y, r, d], fi) => (
        <span key={fi} className="al-fly" style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: r, height: r, borderRadius: '50%', background: fi % 2 ? flyA : flyB, animation: `alDrift ${5 + (fi % 4)}s ease-in-out ${d}s infinite` }} />
      ))}
    </div>
  );
}
