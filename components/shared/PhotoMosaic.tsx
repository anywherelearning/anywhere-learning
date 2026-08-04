import Image from 'next/image';

/**
 * The homepage hero visual: a scrapbook of real families doing real-world
 * activities, styled as tilted polaroid prints. Each print is captioned in the
 * Dancing Script hand with the Future-Ready Skills Map area it builds, so a
 * first-time visitor reads the whole framework at a glance (9 of the 12 areas).
 * Photos, not illustrations, so it says "this is real life" instantly, and
 * stays distinct from /join (illustrated trail) and /shop (activity covers).
 *
 * Motion (globals.css, .mosaic-*): the outer cell fades + rises on mount with a
 * per-tile stagger; the inner print holds its tilt and lifts on hover. Two
 * layers so the entrance translate never fights the hover transform. Both are
 * gated behind prefers-reduced-motion. Photos live in /public/images.
 */
// Six photos: a count that stays a clean grid on both breakpoints (3x2 on
// desktop, 2x3 on mobile) with no orphan tile. Each caption is an obvious
// match for its photo, so nothing needs a mental leap.
const PHOTOS: { name: string; caption: string; rot: number }[] = [
  { name: 'home-cooking', caption: 'Life Skills', rot: -3 },
  { name: 'home-hiking', caption: 'Physical & Outdoor', rot: 2 },
  { name: 'home-making', caption: 'Creativity & Making', rot: -1.5 },
  { name: 'home-business', caption: 'Communication', rot: 2.5 },
  { name: 'home-money', caption: 'Real-World Math', rot: -2 },
  { name: 'home-digital', caption: 'AI & Digital', rot: 1.5 },
];

// Tape strips sit on most prints, but the desktop middle column (indices 1, 4)
// is left bare so the board reads hand-made rather than templated.
const NO_TAPE = new Set([1, 4]);

export default function PhotoMosaic() {
  return (
    <div className="relative mx-auto w-full max-w-[500px]" aria-hidden="true">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {PHOTOS.map(({ name, caption, rot }, i) => (
          <div
            key={name}
            className="mosaic-cell"
            style={{ '--d': `${0.05 + i * 0.07}s` } as React.CSSProperties}
          >
            <div
              className="mosaic-pola relative rounded-[3px] bg-[#fffdf8] p-[7px] pb-1 shadow-[0_14px_26px_-14px_rgba(45,58,46,0.45)] hover:shadow-[0_26px_40px_-16px_rgba(45,58,46,0.5)]"
              style={{ '--r': `${rot}deg` } as React.CSSProperties}
            >
              {!NO_TAPE.has(i) && (
                <span
                  className="pointer-events-none absolute left-1/2 top-[-9px] h-[18px] w-[48px] border border-[#d4a373]/25 bg-[#d4a373]/[0.38] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                  style={{ transform: `translateX(-50%) rotate(${i % 2 ? 4 : -3}deg)` }}
                />
              )}
              <div className="relative aspect-square overflow-hidden rounded-[2px] bg-[#f2efe4]">
                <Image
                  src={`/images/${name}.jpeg`}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 45vw, 160px"
                  className="object-cover"
                  {...(i < 3 ? { priority: true } : { loading: 'eager' as const })}
                />
              </div>
              <div className="flex min-h-[2.5em] items-center justify-center px-1 pt-1.5 pb-1 text-center font-display text-[17px] font-bold leading-[1.05] text-forest">
                {caption}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
