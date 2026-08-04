import { redirect } from 'next/navigation';

// /account/plan was the old weekly-planner page (WeekHome), superseded by the
// Home trail, This Month, and Record. Redirect any stray links or bookmarks to
// the trail home rather than 404.
export const dynamic = 'force-dynamic';

export default function PlanRedirect() {
  redirect('/account/home');
}
