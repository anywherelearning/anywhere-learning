import type { Metadata } from 'next';
import ThisMonthView from '@/components/account/ThisMonthView';
import { getThisMonth, buildSection } from '@/lib/this-month';

export const metadata: Metadata = {
  title: 'This Month',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

// The month's content lives in lib/this-month.ts, one block per month. The
// page picks the current one on each request, so a new month goes live at
// midnight Pacific on the 1st without a deploy.
export default function ThisMonthPage() {
  const THIS_MONTH = getThisMonth();
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
