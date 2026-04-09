'use client';

import { useState } from 'react';

const activityCards = [
  {
    title: 'Kitchen Market Day',
    category: 'Real-World Skills',
    age: 'Ages 6–12',
    color: 'bg-[#c4836a]',
    borderColor: 'border-[#c4836a]',
    description: 'Set up a pretend market stall at home. Kids price items, make change, and learn real money maths through play.',
    skills: ['Maths', 'Social skills', 'Entrepreneurship'],
  },
  {
    title: 'Cloud Detective Walk',
    category: 'Nature',
    age: 'Ages 6–10',
    color: 'bg-forest',
    borderColor: 'border-forest',
    description: 'Head outside and identify cloud types. Sketch what you see, predict the weather, and learn why clouds form.',
    skills: ['Science', 'Observation', 'Art'],
  },
  {
    title: 'Story Dice Adventure',
    category: 'Creativity',
    age: 'Ages 6–14',
    color: 'bg-[#c47a8f]',
    borderColor: 'border-[#c47a8f]',
    description: 'Roll the story dice and build a wild story together. Each roll adds a character, setting, or plot twist.',
    skills: ['Writing', 'Imagination', 'Collaboration'],
  },
  {
    title: 'Bug Hotel Builder',
    category: 'Seasonal, Spring',
    age: 'Ages 6–12',
    color: 'bg-gold',
    borderColor: 'border-gold',
    description: 'Build a bug hotel from sticks, leaves, and pine cones. Watch who moves in and learn about habitats.',
    skills: ['Biology', 'Engineering', 'Patience'],
  },
];

export default function PeekInsidePack() {
  const [activeIdx, setActiveIdx] = useState(0);
  const card = activityCards[activeIdx];

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      {/* Card selector tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-2">
        {activityCards.map((c, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              i === activeIdx
                ? 'bg-forest text-cream shadow-md scale-105'
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {c.title}
          </button>
        ))}
      </div>

      {/* Active card — big, visual, exciting */}
      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Left: Visual mockup of the activity card */}
        <div className="relative">
          {/* Background stack effect */}
          <div className="absolute -top-3 -left-3 w-full h-full bg-gray-100 rounded-3xl rotate-[-2deg]" />
          <div className="absolute -top-1.5 -left-1.5 w-full h-full bg-gray-50 rounded-3xl rotate-[-1deg]" />

          <div className={`relative bg-white rounded-3xl shadow-2xl overflow-hidden border-t-4 ${card.borderColor}`}>
            {/* Card header */}
            <div className={`${card.color} px-8 py-5 flex items-center justify-between`}>
              <span className="text-white/80 text-sm font-medium uppercase tracking-wider">{card.category}</span>
              <span className="text-white/60 text-xs bg-white/15 px-3 py-1 rounded-full">{card.age}</span>
            </div>

            {/* Card body */}
            <div className="p-8">
              <h4 className="font-display text-3xl text-forest mb-4">{card.title}</h4>
              <p className="text-gray-500 leading-relaxed mb-6 text-lg">
                {card.description}
              </p>

              {/* Skills pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {card.skills.map((skill) => (
                  <span key={skill} className="text-xs font-semibold bg-forest/8 text-forest px-3 py-1.5 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Fake card content indicators */}
              <div className="border-t border-dashed border-gray-200 pt-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#d4a373" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  <span className="text-sm text-gray-400">Step-by-step instructions included</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#d4a373" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  <span className="text-sm text-gray-400">Age adaptation notes for younger + older kids</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#d4a373" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  <span className="text-sm text-gray-400">Discussion prompts to go deeper</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Excitement copy */}
        <div className="py-4">
          <p className="text-sm font-semibold text-gold uppercase tracking-[0.2em] mb-3">
            This is one of 220+ activities
          </p>
          <h3 className="font-display text-3xl md:text-4xl text-forest mb-5">
            Every card is a ready-made adventure.
          </h3>
          <div className="space-y-5 text-gray-500 text-lg leading-relaxed">
            <p>
              No googling. No planning. No &ldquo;what should we do today?&rdquo;
            </p>
            <p>
              Just grab a card, head outside (or stay in), and watch your
              kids come alive. Each activity is designed to feel like play
              while building real-world skills.
            </p>
          </div>

          {/* Urgency nudge */}
          <div className="mt-8 p-5 bg-gold/[0.08] rounded-2xl border border-gold/15">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 text-2xl">💡</span>
              <div>
                <p className="font-semibold text-forest text-sm mb-1">
                  Most families start with the Master Bundle
                </p>
                <p className="text-sm text-gray-500">
                  220+ activities across 7 categories. One purchase, a year of ideas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
