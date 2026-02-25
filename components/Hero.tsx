import EmailForm from "./EmailForm";

function PDFMockup() {
  return (
    <div className="animate-float mx-auto w-56 sm:w-64">
      <div className="relative rounded-lg border-2 border-forest bg-cream p-6 shadow-xl">
        {/* Gold badge */}
        <div className="absolute -top-3 -right-3 flex h-14 w-14 items-center justify-center rounded-full bg-gold shadow-md">
          <span className="text-center text-[10px] font-bold leading-tight text-white">
            FREE
            <br />
            DOWN
            <br />
            LOAD
          </span>
        </div>

        {/* Mini logo */}
        <div className="mb-4 flex items-center gap-1.5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="14" cy="14" r="14" fill="#588157" />
            <path
              d="M8 18c2-4 4-8 6-8s4 4 6 8"
              stroke="#faf9f6"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="font-[family-name:var(--font-display)] text-xs text-forest">
            Anywhere Learning
          </span>
        </div>

        {/* Title */}
        <h2 className="font-[family-name:var(--font-body)] text-sm font-bold leading-snug text-forest">
          10 Life Skills Your Kids Can Learn This Week
        </h2>

        {/* Decorative lines */}
        <div className="mt-4 space-y-2">
          <div className="h-1.5 w-full rounded bg-gold/20" />
          <div className="h-1.5 w-4/5 rounded bg-gold/20" />
          <div className="h-1.5 w-3/5 rounded bg-gold/20" />
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative pt-20 pb-16 sm:pt-24 sm:pb-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:gap-16">
          {/* Mobile: PDF mockup on top */}
          <div className="lg:hidden">
            <PDFMockup />
          </div>

          {/* Text + Form */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="font-[family-name:var(--font-display)] text-5xl leading-tight text-forest sm:text-6xl lg:text-7xl">
              10 life skills your kids can learn this week
            </h1>

            <p className="mx-auto mt-5 max-w-lg text-lg text-gray-600 lg:mx-0">
              A free, no-prep guide for homeschool and worldschool families.
              Real activities. Real life. No curriculum required.
            </p>

            <div id="hero-form" className="mt-8 scroll-mt-20">
              <EmailForm variant="light" />
            </div>
          </div>

          {/* Desktop: PDF mockup on right */}
          <div className="hidden flex-shrink-0 lg:block lg:pt-8">
            <PDFMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
