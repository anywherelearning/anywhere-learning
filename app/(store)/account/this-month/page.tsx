import type { Metadata } from 'next';
import ThisMonthView from '@/components/account/ThisMonthView';
import { THIS_MONTH, buildSection } from '@/lib/this-month';

export const metadata: Metadata = {
  title: 'This Month',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

// The month's content lives in lib/this-month.ts. Edit it there once a month.
export default function ThisMonthPage() {
  return (
    <ThisMonthView
      month={THIS_MONTH.month}
      year={THIS_MONTH.year}
      intro={THIS_MONTH.intro}
      challengeId={`${THIS_MONTH.month}:${THIS_MONTH.challenge.title}`}
      skill={buildSection(THIS_MONTH.skill)}
      seasonal={buildSection(THIS_MONTH.seasonal)}
      challenge={THIS_MONTH.challenge}
    />
  );
}
