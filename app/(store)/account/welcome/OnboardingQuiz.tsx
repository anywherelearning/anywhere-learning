'use client';

import { useRouter } from 'next/navigation';
import KidsSetup from '@/components/account/KidsSetup';

export default function OnboardingQuiz() {
  const router = useRouter();
  return (
    <KidsSetup onDone={() => router.push('/account')} onSkip={() => router.push('/account')} />
  );
}
