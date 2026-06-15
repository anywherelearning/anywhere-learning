'use client';

import { useState } from 'react';
import ScrollReveal from '@/components/shared/ScrollReveal';

// Founder-credibility testimonials. Real endorsements of Amelie as an educator
// from the people who know her work. No star ratings on purpose: stars read as
// product reviews and would undercut the "people vouching for a teacher" framing.
// French originals (Catherine, Fleur) were translated to English.
// Bento layout: Claudia (the coach) anchors big with the 3 short student quotes
// stacked beside her; the other four sit in an even 2x2 below. Vickie's
// free-guide review lives on /free-guide, not here.

type Voice = 'parents' | 'colleagues' | 'students' | 'coach';

interface Quote {
  name: string;
  role: string;
  quote: string;
  voice: Voice;
  badge?: string;
}

const VOICE: Record<Voice, { ink: string; tint: string }> = {
  parents: { ink: '#C97B5C', tint: 'rgba(201,123,92,0.14)' },
  colleagues: { ink: '#588157', tint: 'rgba(88,129,87,0.13)' },
  students: { ink: '#b5803e', tint: 'rgba(212,163,115,0.20)' },
  coach: { ink: '#588157', tint: 'rgba(88,129,87,0.12)' },
};

const CLAUDIA: Quote = {
  name: 'Claudia, M.Sc.',
  role: 'Certified Parenting Coach · Neurodivergent Family Support · Founder of Growing en Famille',
  voice: 'coach',
  badge: 'Certified Parenting Coach',
  quote:
    "What I appreciate most about Amelie's resources is how empowering they are for parents. She helps shift the mindset from 'I need educational experts and structured programs to teach my child' to 'I already have what it takes to support my child's learning.' By sharing her creativity and practical ideas, she shows parents how to turn everyday moments into meaningful learning opportunities and adapt them to their own family. What I love is that her approach goes far beyond academics. These moments become opportunities not only for learning, but also for connection. When we slow down, become present, and engage with our children, we strengthen our relationship with them, and their relationship with themselves.",
};

const MYRIAM: Quote = {
  name: 'Myriam',
  role: 'Parent',
  voice: 'parents',
  quote:
    "Ironically, Amelie became my daughter's teacher at a time when I was on the verge of pulling her out of the school system altogether. I can now say with complete confidence that I'm grateful we stayed, because it gave our daughter the chance to learn from Amelie. Her approach to education complemented the learning at home beautifully. She is practical, thoughtful, and forward-thinking, and found meaningful ways to bring the tools of the modern world into her teaching while showing students how to use them responsibly. It made a lasting positive impact on my daughter's education.",
};

const MARIE_CHRISTINE: Quote = {
  name: 'Marie-Christine',
  role: 'Colleague',
  voice: 'colleagues',
  quote:
    "I had the pleasure of teaching alongside Amelie for several years. From the moment she joined our school, she brought tremendous energy, creativity, and enthusiasm to both her classroom and our community. Her students were always engaged in meaningful, hands-on learning, and she had a special way of making learning feel relevant and exciting. One thing that stands out most is the student market she introduced to our school. It gave kids the chance to develop entrepreneurial skills, build confidence, and take ownership of their ideas.",
};

const WENDY: Quote = {
  name: 'Wendy',
  role: 'Parent',
  voice: 'parents',
  quote:
    "Amelie combines creativity and curriculum in ways that truly energized my children's education. She gave them real-world projects that had them thinking, building, presenting, and collaborating with enthusiasm. Learning with Amelie was so fun and rewarding that my kids always wanted to dive right in.",
};

const CATHERINE: Quote = {
  name: 'Catherine',
  role: 'Colleague',
  voice: 'colleagues',
  quote:
    'Amelie is a devoted teacher who genuinely cares about her students every day. Having watched her guide children through big challenges, she stands out for her patience, her personalized support, and her sense of humor. Years after leaving her classroom, students still talk about Amelie as the best teacher they ever had.',
};

const FLEUR: Quote = {
  name: 'Fleur',
  role: 'Age 13',
  voice: 'students',
  quote: 'Kind, respectful, caring. She listens. One of my favorite teachers.',
};

const FELIX: Quote = {
  name: 'Felix',
  role: 'Age 12',
  voice: 'students',
  quote: "She's the best teacher and she makes learning fun.",
};

const JACOB: Quote = {
  name: 'Jacob',
  role: 'Age 10',
  voice: 'students',
  quote: "She's a good teacher because it's fun learning with her.",
};

const CAROLINE: Quote = {
  name: 'Caroline',
  role: 'Colleague',
  voice: 'colleagues',
  quote:
    'I had the chance to work with Amelie for several years and I always admired her creativity and her passion for teaching. She constantly came up with original ideas to get students moving, thinking, and learning through play. Always generous with her time and resources, she loved sharing her ideas with colleagues so the whole team could benefit.',
};

const MELINA: Quote = {
  name: 'Melina',
  role: 'Colleague',
  voice: 'colleagues',
  quote:
    "Creative, dynamic, and passionate about child development, Amelie is always looking to innovate so she can offer meaningful learning experiences that meet children's real needs. Her love of nature and the outdoors inspires a living approach to learning, where discovery, play, and exploration take center stage.",
};

const SAMANTHA: Quote = {
  name: 'Samantha',
  role: 'Colleague and parent',
  voice: 'colleagues',
  quote:
    'I am fortunate to have had Amelie as a colleague and as a teacher for my child. I witnessed first hand her ideas come to fruition and watched how her students stayed engaged in her lessons. She is a gem of a human being, mother, and teacher.',
};

// Claudia + the adult quotes cycle through a single-card carousel (one shown at
// a time, arrows to change). Students are NOT in the carousel; they stay put.
const ADULTS: Quote[] = [CLAUDIA, MYRIAM, WENDY, MARIE_CHRISTINE, CATHERINE, CAROLINE, MELINA, SAMANTHA];

type Variant = 'feature' | 'std' | 'mini';

function TCard({ t, variant }: { t: Quote; variant: Variant }) {
  const { ink, tint } = VOICE[t.voice];
  const isMini = variant === 'mini';
  const pad = variant === 'feature' ? 'p-9 md:p-12' : isMini ? 'px-5 py-3.5' : 'p-7 md:p-8';
  const cardGap = isMini ? 'gap-1.5' : 'gap-3.5';
  const quoteCls =
    variant === 'feature'
      ? 'text-[20px] leading-[1.65]'
      : isMini
      ? 'text-[14px] leading-[1.45] font-medium'
      : 'text-[16px] leading-[1.6]';
  return (
    <blockquote
      className={`tl-card h-full m-0 relative overflow-hidden bg-cream flex flex-col ${isMini || variant === 'feature' ? 'justify-center' : ''} ${cardGap} ${pad}`}
      style={{
        border: `3px solid ${ink}80`,
        borderRadius: 14,
        boxShadow: '0 1px 0 rgba(255,255,255,0.5) inset, 0 14px 26px -22px rgba(45,58,46,0.2)',
      }}
    >
      {variant === 'feature' && (
        <span
          aria-hidden="true"
          className="font-display absolute -top-[24px] right-[14px] leading-none pointer-events-none select-none"
          style={{ fontWeight: 700, fontSize: 150, color: '#e8c99a', opacity: 0.4 }}
        >
          &#8221;
        </span>
      )}
      {t.badge && (
        <span
          className="self-start inline-flex items-center gap-[7px] text-[11.5px] font-semibold uppercase tracking-[0.06em] px-3 py-[6px] rounded-full whitespace-nowrap relative"
          style={{ background: 'rgba(88,129,87,0.10)', color: '#3d5c3b' }}
        >
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: ink }} />
          {t.badge}
        </span>
      )}
      <span
        aria-hidden="true"
        className="font-display block select-none relative"
        style={{ fontWeight: 700, fontSize: variant === 'feature' ? 56 : isMini ? 36 : 50, lineHeight: 0.7, color: ink, height: isMini ? 14 : 20, marginBottom: isMini ? -2 : -4 }}
      >
        &#8220;
      </span>
      <p className={`m-0 text-gray-700 relative ${quoteCls}`}>{t.quote}</p>
      <footer className={`flex items-center border-t border-dashed border-[#C9C5B7] ${isMini ? 'pt-3 gap-2.5' : variant === 'feature' ? 'mt-4 pt-5 gap-3' : 'mt-auto pt-5 gap-3'}`}>
        <span
          aria-hidden="true"
          className={`shrink-0 rounded-full inline-flex items-center justify-center font-bold ${isMini ? 'w-8 h-8 text-[13px]' : 'w-10 h-10 text-[15px]'}`}
          style={{ background: tint, color: ink }}
        >
          {t.name.trim().charAt(0).toUpperCase()}
        </span>
        <span className="flex flex-col gap-px flex-1 min-w-0">
          <cite className={`not-italic font-semibold text-forest-dark ${isMini ? 'text-[14px]' : 'text-[15px]'}`}>{t.name}</cite>
          <span className={`text-gray-500 leading-[1.4] ${isMini ? 'text-[12px]' : 'text-[13px]'}`}>{t.role}</span>
        </span>
      </footer>
    </blockquote>
  );
}

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const prev = () => setIndex((i) => (i - 1 + ADULTS.length) % ADULTS.length);
  const next = () => setIndex((i) => (i + 1) % ADULTS.length);
  return (
    <section className="bg-[#F2EFE4] border-b border-[#D8D4C5] pt-14 md:pt-16 pb-20 md:pb-24">
      <style>{`
        .tl-card { transition: box-shadow 200ms cubic-bezier(0.22,1,0.36,1); }
        @media (prefers-reduced-motion: reduce) { .tl-card { transition: none; } }
      `}</style>
      <div className="mx-auto max-w-[1180px] px-6">
        {/* HEADER */}
        <ScrollReveal>
          <div className="max-w-[760px] mx-auto text-center mb-14">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-dark flex items-center justify-center gap-2.5 mb-4">
              <span className="w-[22px] h-px bg-forest inline-block" />
              In their words
            </p>
            <h2 className="font-display text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.06] tracking-tight mt-3.5">
              The people who <span className="italic text-forest">know my work.</span>
            </h2>
            <p className="mt-4 text-lg text-gray-500 text-balance">
              Teachers, parents, and students who spent years in my classroom.
            </p>
          </div>
        </ScrollReveal>

        {/* Left: single-card carousel (Claudia + adults). Right: fixed student tiles.
            Card area and student stack share row 1 so their bottoms align; the
            counter lives in row 2 under the carousel only. */}
        <ScrollReveal delay={80}>
          <div className="grid grid-cols-1 lg:grid-cols-[2.5fr_1fr] gap-x-6 gap-y-3 items-stretch">
            {/* Carousel card area */}
            <div className="relative">
              <div className="grid h-full">
                {ADULTS.map((t, i) => (
                  <div
                    key={t.name}
                    style={{ gridArea: '1 / 1' }}
                    aria-hidden={i !== index}
                    className={`h-full w-full transition-opacity duration-300 ${
                      i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    <TCard t={t} variant="feature" />
                  </div>
                ))}
              </div>
              {/* Arrows (library style) */}
              <button
                type="button"
                onClick={prev}
                aria-label="Previous testimonial"
                className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-cream border border-[#D8D4C5] grid place-items-center text-ink shadow-[0_8px_16px_-10px_rgba(45,58,46,0.35)] hover:bg-white hover:-translate-y-[calc(50%+1px)] transition-all z-10"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next testimonial"
                className="absolute right-[-12px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-cream border border-[#D8D4C5] grid place-items-center text-ink shadow-[0_8px_16px_-10px_rgba(45,58,46,0.35)] hover:bg-white hover:-translate-y-[calc(50%+1px)] transition-all z-10"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            {/* Students stay put, not part of the carousel (row 1, right column) */}
            <div className="grid grid-rows-3 gap-4 lg:row-start-1 lg:col-start-2">
              <TCard t={FLEUR} variant="mini" />
              <TCard t={FELIX} variant="mini" />
              <TCard t={JACOB} variant="mini" />
            </div>

            {/* Counter, row 2 under the carousel only */}
            <p className="text-center text-[12px] font-medium text-gray-500 lg:col-start-1 lg:row-start-2">
              {index + 1} <span className="text-gray-400">/</span> {ADULTS.length}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
