import Image from 'next/image';

// Eight real activity covers fanned around the Future-Ready Skills Map, with an
// "Open and go" sticker. Extracted from the old homepage hero so it can be the
// /shop hero. Self-contained (constants + markup); the parent supplies the slot.
const HERO_CARDS = [
  { slug: 'kitchen-math-challenge' },
  { slug: 'deepfake-spotter' },
  { slug: 'family-debate-night' },
  { slug: 'shark-tank-pitch' },
  { slug: 'rube-goldberg-machine' },
  { slug: 'currency-market-math' },
  { slug: 'nature-walk-task-cards' },
  { slug: 'travel-day' },
];

// Eight covers orbit the centered Skills Map at 45-degree intervals.
const CARD_POSITIONS: { style: React.CSSProperties; rotate: number; z: number }[] = [
  { style: { top: '10%', left: '8%' }, rotate: -9, z: 2 },
  { style: { top: '3%', left: '50%', transform: 'translateX(-50%)' }, rotate: -2, z: 1 },
  { style: { top: '10%', right: '8%' }, rotate: 9, z: 2 },
  { style: { top: '50%', right: '-2%', transform: 'translateY(-50%)' }, rotate: 7, z: 3 },
  { style: { bottom: '10%', right: '8%' }, rotate: 5, z: 4 },
  { style: { bottom: '3%', left: '50%', transform: 'translateX(-50%)' }, rotate: 2, z: 1 },
  { style: { bottom: '10%', left: '8%' }, rotate: -5, z: 4 },
  { style: { top: '50%', left: '-2%', transform: 'translateY(-50%)' }, rotate: -7, z: 3 },
];

export default function HeroCollage() {
  return (
    <div
      data-hero-collage
      className="relative mx-auto aspect-square w-full max-w-[440px]"
      aria-hidden="true"
    >
      {/* Skills Map — centerpiece */}
      <div
        className="absolute z-[5] w-[130px] sm:w-[220px] lg:w-[250px] aspect-[3/4] rounded-[12px] overflow-hidden border border-[#D8D4C5] shadow-[0_28px_48px_-22px_rgba(45,58,46,0.45)]"
        style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%) rotate(-2deg)' }}
      >
        <Image
          src="/skills-map-cover.jpg"
          alt=""
          width={800}
          height={1067}
          quality={95}
          unoptimized
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      </div>

      {HERO_CARDS.map((card, i) => {
        const pos = CARD_POSITIONS[i];
        const baseTransform = (pos.style.transform as string) || '';
        const rotation = `rotate(${pos.rotate}deg)`;
        const finalTransform = baseTransform ? `${baseTransform} ${rotation}` : rotation;
        return (
          <div
            key={card.slug}
            className="absolute w-[112px] sm:w-[140px] lg:w-[170px] aspect-[4/5] rounded-[10px] overflow-hidden border border-[#D8D4C5] bg-cream shadow-[0_16px_28px_-22px_rgba(45,58,46,0.42)] hover:shadow-[0_26px_42px_-22px_rgba(45,58,46,0.5)] hover:z-30 transition-all duration-250"
            style={{ ...pos.style, transform: finalTransform, zIndex: pos.z }}
          >
            <Image
              src={`/products/${card.slug}.jpg`}
              alt=""
              width={400}
              height={500}
              quality={95}
              unoptimized
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          </div>
        );
      })}

      {/* Open-and-go sticker */}
      <div className="absolute right-[-40px] bottom-[-30px] max-sm:right-2 max-sm:bottom-2 w-[120px] h-[120px] max-sm:w-[96px] max-sm:h-[96px] rounded-full bg-[#C97B5C] text-cream grid place-items-center font-display italic text-center leading-[1.06] text-[16px] max-sm:text-[13px] rotate-[8deg] shadow-[0_14px_26px_-10px_rgba(201,123,92,0.55)] z-[6] p-2.5">
        <span>
          <span className="block text-[28px] max-sm:text-2xl mb-1">Open</span>
          and go
          <span className="block text-[10px] max-sm:text-[8.5px] not-italic uppercase tracking-[0.15em] max-sm:tracking-[0.04em] opacity-95 mt-1 font-semibold font-body">
            Nothing to plan
          </span>
        </span>
      </div>
    </div>
  );
}
