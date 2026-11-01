import type { Metadata } from 'next';
import ThisMonthView from '@/components/account/ThisMonthView';
import { auth } from '@clerk/nextjs/server';
import { getThisMonth, buildSection } from '@/lib/this-month';
import { getAccessTierForClerkId } from '@/lib/access';
import { BASECAMP_REPLAYS, basecampGoogleUrl, basecampZoomUrl, nextBasecamp } from '@/lib/basecamp';

export const metadata: Metadata = {
  title: 'This Month',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

// The month's content lives in lib/this-month.ts, one block per month. The
// page picks the current one on each request, so a new month goes live at
// midnight Eastern on the 1st without a deploy.
// Local dev only: ?preview=2026-11 shows that month before it goes live.
export default async function ThisMonthPage({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const { preview } = await searchParams;
  const previewDate =
    process.env.NODE_ENV !== 'production' && preview && /^\d{4}-\d{2}$/.test(preview)
      ? new Date(`${preview}-15T12:00:00Z`)
      : undefined;
  const THIS_MONTH = getThisMonth(previewDate);
  const skill = buildSection(THIS_MONTH.skill);

  // Basecamp's Zoom link only for members: guests see this page behind the
  // paywall teaser, and the HTML would still carry the link.
  let isMember = false;
  try {
    const { userId } = await auth();
    isMember = !!userId && (await getAccessTierForClerkId(userId)) !== 'guest';
  } catch {
    isMember = process.env.NODE_ENV !== 'production';
  }
  const session = nextBasecamp(previewDate);
  const zoom = isMember ? basecampZoomUrl() : null;
  const basecamp = session
    ? {
        dayLabel: session.dayLabel,
        timeLabel: session.timeLabel,
        // "The month of making it by hand" -> "Making it by hand"
        topic: skill.title.replace(/^The month of /i, '').replace(/^./, (c) => c.toUpperCase()),
        zoomUrl: zoom,
        googleUrl: zoom ? basecampGoogleUrl(session, zoom) : null,
        replays: BASECAMP_REPLAYS,
      }
    : null;

  return (
    <ThisMonthView
      month={THIS_MONTH.month}
      year={THIS_MONTH.year}
      intro={THIS_MONTH.intro}
      challengeId={`${THIS_MONTH.month}:${THIS_MONTH.challenge.title}`}
      skill={skill}
      seasonal={buildSection(THIS_MONTH.seasonal)}
      challenge={THIS_MONTH.challenge}
      basecamp={basecamp}
    />
  );
}
