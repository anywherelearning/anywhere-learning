'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import EmailForm from '@/components/EmailForm';

const GUIDE_SUBMITTED_KEY = 'free-guide-submitted';

export default function FreeGuideCTA() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      if (!localStorage.getItem(GUIDE_SUBMITTED_KEY)) {
        setHidden(false);
      }
    } catch {
      setHidden(false);
    }
  }, []);

  if (hidden) return null;

  return (
    <section className="mx-auto max-w-6xl px-5 sm:px-8 pb-12">
      <div className="bg-forest-section rounded-3xl p-6 sm:p-10 shadow-xl">
        <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-6">
          {/* Guide cover */}
          <div className="relative w-24 sm:w-32 flex-shrink-0 aspect-[707/1000] rounded-lg overflow-hidden shadow-md">
            <Image
              src="/images/free-guide-cover.jpg"
              alt="10 Life Skills Your Kids Can Learn This Week, free guide cover"
              fill
              sizes="(max-width: 640px) 96px, 128px"
              className="object-cover"
              loading="lazy"
            />
          </div>

          {/* Copy + form */}
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-display text-xl sm:text-2xl text-cream mb-1.5">
              Not ready to buy? Start here.
            </h3>
            <p className="text-cream/60 text-sm mb-4">
              Grab our free guide - 10 real-world activities you can try this week. No prep, no planning.
            </p>
            <EmailForm variant="dark" />
          </div>
        </div>
      </div>
    </section>
  );
}
