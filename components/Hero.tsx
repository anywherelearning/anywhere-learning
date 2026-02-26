import { LogoIcon } from "./Logo";
import EmailForm from "./EmailForm";

function PDFMockup() {
  return (
    <div className="animate-gentle-float mx-auto w-56 sm:w-64">
      <div className="relative rounded-2xl border-2 border-forest bg-cream p-6 shadow-xl">
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
          <LogoIcon size={18} />
          <span className="font-display text-xs text-forest">
            Anywhere Learning
          </span>
        </div>

        {/* Title */}
        <h2 className="font-body text-sm font-bold leading-snug text-forest">
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
    <section className="relative bg-cream py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:gap-16">
          {/* Mobile: PDF mockup on top */}
          <div className="lg:hidden">
            <PDFMockup />
          </div>

          {/* Text + Form */}
          <div className="flex-1 text-center lg:text-left">
            <p className="text-sm font-medium text-gold uppercase tracking-widest mb-4">
              Free Download
            </p>
            <h1 className="font-display text-5xl leading-tight text-forest sm:text-6xl lg:text-7xl mb-5">
              <span className="heading-accent">10 life skills</span> your kids
              can learn this week
            </h1>

            <p className="mx-auto max-w-lg text-lg md:text-xl text-gray-600 lg:mx-0 leading-relaxed">
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
