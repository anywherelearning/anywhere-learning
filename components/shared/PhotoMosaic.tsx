import Image from 'next/image';

/**
 * The homepage hero visual: a scrapbook-style mosaic of real families doing
 * real-world activities (cooking, backyard science, chores, making, deciding).
 * Photos, not illustrations, so it reads as "this is real life" the second a
 * first-time visitor lands, and stays distinct from /join (illustrated trail)
 * and /shop (activity covers). Uses existing photos in /public/images.
 */
const PHOTOS: [string, number][] = [
  ['before-18-cooking', -2.5],
  ['backyard-science-digging', 1.6],
  ['chores-making-sushi', -1.2],
  ['allowance-building', 2],
  ['decision-making-card-game', -1.8],
  ['creative-stop-motion', 1.3],
  ['bird-watching-lake', -2],
  ['chores-lawn-mower', 1.7],
  ['backyard-science-sundial', -1.4],
];

export default function PhotoMosaic() {
  return (
    <div className="relative mx-auto w-full max-w-[460px]" aria-hidden="true">
      <div className="grid grid-cols-3 gap-3">
        {PHOTOS.map(([name, rot], i) => (
          <div
            key={name}
            className="relative aspect-square overflow-hidden rounded-[12px] border border-[#D8D4C5] bg-[#f2efe4] shadow-[0_16px_28px_-20px_rgba(45,58,46,0.5)]"
            style={{ transform: `rotate(${rot}deg)` }}
          >
            <Image
              src={`/images/${name}.jpeg`}
              alt=""
              fill
              sizes="150px"
              className="object-cover"
              {...(i < 3 ? { priority: true } : { loading: 'eager' as const })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
