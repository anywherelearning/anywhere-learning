import type { Metadata } from 'next';
import WeekHome from '../WeekHome';
import { getPlanActivities } from '@/lib/plan-activities';

export const metadata: Metadata = {
  title: 'My Plan',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function MyPlanPage() {
  return <WeekHome activities={getPlanActivities()} />;
}
