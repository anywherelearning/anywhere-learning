/**
 * The site's shared "real paper" pieces: tape, magnets and a polaroid frame.
 *
 * Every redesigned page (course, quiz, free guide, Capable Kid, ideas, about)
 * dresses its content as real things on a table or a fridge: white paper with
 * a soft warm shadow, a slight tilt, held by tape or a magnet, with real
 * family photos in white borders. Use these instead of hand-rolling new
 * fasteners, so the pages stay different in layout but read as one site.
 */

/** Soft shadow under any piece of paper. */
export const PAPER_SHADOW = 'shadow-[0_18px_30px_-20px_rgba(45,58,46,0.55)]';

/** A strip of washi tape across the top edge of its (relative) parent. */
export function Tape({
  className = 'left-1/2 -translate-x-1/2 -rotate-3',
  color = 'rgba(232,201,154,0.8)',
}: {
  className?: string;
  color?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`absolute -top-3 z-10 h-6 w-20 ${className}`}
      style={{ background: color }}
    />
  );
}

/** A round fridge magnet on the top edge of its (relative) parent. */
export function Magnet({ color = '#C97B5C', size = 24 }: { color?: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="absolute left-1/2 z-10 -translate-x-1/2 rounded-full shadow-[0_4px_8px_rgba(0,0,0,0.25),inset_0_-3px_0_rgba(0,0,0,0.15)]"
      style={{ background: color, width: size, height: size, top: -size / 2 }}
    />
  );
}
