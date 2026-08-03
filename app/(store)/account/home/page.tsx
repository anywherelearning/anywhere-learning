import type { Metadata } from 'next';
import AdventureMapHome from '@/components/account/AdventureMapHome';
import { getPlanActivities } from '@/lib/plan-activities';

export const metadata: Metadata = {
  title: 'Home',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function MemberHomePage() {
  return <AdventureMapHome activities={getPlanActivities()} />;
}
