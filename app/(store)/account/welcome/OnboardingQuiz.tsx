'use client';

import { useRouter } from 'next/navigation';
import KidsSetup from '@/components/account/KidsSetup';

export default function OnboardingQuiz() {
  const router = useRouter();
  return (
    <KidsSetup
      submitLabel="Pick our first activities"
      // Chain straight into the planner's "what are you looking for" quiz
      // (age + time + focus → a first set of picks), instead of dropping a
      // brand-new member on the full 120+ library. ?start=1 auto-opens it.
      onDone={() => router.push('/account/plan?start=1')}
      onSkip={() => router.push('/account')}
    />
  );
}
