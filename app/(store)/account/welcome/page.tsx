import type { Metadata } from 'next';
import OnboardingQuiz from './OnboardingQuiz';

export const metadata: Metadata = {
  title: 'Welcome',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function WelcomePage() {
  return <OnboardingQuiz />;
}
