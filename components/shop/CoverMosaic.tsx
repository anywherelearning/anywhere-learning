import Image from 'next/image';

/**
 * The /shop hero visual: a lively collage of real activity covers, so a visitor
 * sees the breadth of the library at a glance ("look at everything you get").
 * Uses the actual product cover images from /public/products, so it can't drift
 * from the catalog. Distinct from the homepage's fanned-card hero on purpose.
 */
const COVERS: [string, number][] = [
  ['budget-challenge', -2.5],
  ['brand-builder', 1.6],
  ['build-a-museum', -1.2],
  ['ai-basics', 2],
  ['family-recipe-book', -1.8],
  ['calm-down-toolkit', 1.3],
  ['backyard-campout-planner', -2],
  ['family-debate-night', 1.7],
  ['invent-a-sport', -1.4],
  ['garden-plot-planner', 2.2],
  ['mini-movie', -1.6],
  ['currency-market-math', 1.1],
];

export default function CoverMosaic() {
  return (
    <div className="relative py-6" aria-hidden="true">
      <div className="mx-auto grid max-w-[380px] grid-cols-3 gap-3">
        {COVERS.map(([slug, rot]) => (
          <div
            key={slug}
            className="relative aspect-[3/4] overflow-hidden rounded-[10px] border border-[#e3ddcd] bg-[#f2efe4] shadow-[0_14px_24px_-16px_rgba(45,58,46,0.5)]"
            style={{ transform: `rotate(${rot}deg)` }}
          >
            <Image
              src={`/products/${slug}.jpg`}
              alt=""
              fill
              sizes="120px"
              className="object-cover object-top"
            />
          </div>
        ))}
      </div>
      <p className="mt-7 text-center font-display italic text-[17px] text-[#C97B5C]">
        120+ activities. Nine topics. <span className="italic">One membership.</span>
      </p>
    </div>
  );
}
