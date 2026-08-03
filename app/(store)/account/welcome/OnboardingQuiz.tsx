'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import KidsSetup from '@/components/account/KidsSetup';
import ExplorerBuilder from '@/components/account/ExplorerBuilder';
import { loadProfile, type Child } from '@/lib/member-profile';
import { avatarFor, saveAvatar } from '@/lib/kid-roadmap';

/**
 * First-run onboarding for a new member. Two stages, then the home trail:
 *   1. Kids + family plan (KidsSetup)
 *   2. Build each child's explorer avatar (ExplorerBuilder), one at a time
 * so a new family lands on a populated, personalized map instead of an empty
 * "Build {kid}" prompt. The trail's engine picks the first activities, so
 * there's no separate planner step.
 */
export default function OnboardingQuiz() {
  const router = useRouter();
  const [stage, setStage] = useState<'kids' | 'avatars'>('kids');
  const [kids, setKids] = useState<Child[]>([]);
  const [idx, setIdx] = useState(0);

  const goHome = () => router.push('/account/home');

  function toAvatars() {
    const cs = loadProfile()?.children ?? [];
    if (!cs.length) {
      goHome();
      return;
    }
    setKids(cs);
    setIdx(0);
    setStage('avatars');
  }

  if (stage === 'kids') {
    return <KidsSetup submitLabel="Next: build explorers" onDone={toAvatars} onSkip={goHome} />;
  }

  const kid = kids[idx];
  const cid = kid.id ?? kid.name;
  const isLast = idx >= kids.length - 1;

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <p className="font-display italic text-[13px] text-gold-dark mb-4 text-center">
          Step 2 of 2 · Explorer {idx + 1} of {kids.length}
        </p>
        <ExplorerBuilder
          key={cid}
          kidName={kid.name}
          initial={avatarFor(cid)}
          saveLabel={isLast ? "Let's start" : 'Next explorer'}
          onSave={(a) => {
            saveAvatar(cid, a);
            if (isLast) goHome();
            else setIdx((n) => n + 1);
          }}
        />
        <div className="text-center mt-5">
          <button
            type="button"
            onClick={goHome}
            className="text-[13.5px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
