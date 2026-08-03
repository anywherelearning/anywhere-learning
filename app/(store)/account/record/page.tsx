import type { Metadata } from 'next';
import LearningRecord from '@/components/account/LearningRecord';
import { getPlanActivities } from '@/lib/plan-activities';

export const metadata: Metadata = {
  title: 'Learning Record',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function RecordPage() {
  return <LearningRecord activities={getPlanActivities()} />;
}
