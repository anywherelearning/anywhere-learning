import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignUp } from '@clerk/nextjs';
import { clerkAuthAppearance } from '@/lib/clerk-theme';
import { IS_FOUNDER_PHASE, MEMBERSHIP_PRICE_YEAR, TRIAL_DAYS } from '@/lib/membership';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create your Anywhere Learning account to access your library.',
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams?: Promise<{ redirect_url?: string }>;
}) {
  const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!hasClerk) return null;

  // Preserve redirect_url on the "Sign in" link so an existing member who
  // landed here mid-flow (e.g. trial checkout) keeps their place. Only
  // relative paths are forwarded to keep this from becoming an open redirect.
  const sp = (await searchParams) || {};
  const redirectUrl =
    sp.redirect_url && sp.redirect_url.startsWith('/') ? sp.redirect_url : null;
  const signInHref = redirectUrl
    ? `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`
    : '/sign-in';

  // Arriving from a "Start free trial" CTA → this page is step 1 of the
  // trial funnel, so the left column explains the two steps instead of the
  // generic account pitch.
  const isTrialFlow = redirectUrl?.startsWith('/start-trial') ?? false;

  // Already signed in? Skip the sign-up flow and go straight to the library.
  let signedInUserId: string | null = null;
  try {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = await auth();
    signedInUserId = userId;
  } catch {
    /* Clerk not configured */
  }
  if (signedInUserId) redirect('/account');

  return (
    <main className="min-h-[calc(100vh-200px)] bg-cream py-12 md:py-16">
      <div className="mx-auto max-w-[1100px] px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">
          {/* Left: brand context */}
          <div className="max-lg:text-center max-lg:order-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-forest-dark inline-flex items-center gap-2.5">
              <span className="w-[22px] h-px bg-forest inline-block" />
              {isTrialFlow ? 'Start your free trial · Step 1 of 2' : 'Create your account'}
            </p>
            <h1 className="mt-3 font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.06] tracking-tight text-balance">
              {isTrialFlow ? (
                <>
                  First, a home for{' '}
                  <em className="not-italic italic text-forest">your library.</em>
                </>
              ) : (
                <>
                  One quick step to{' '}
                  <em className="not-italic italic text-forest">unlock the library.</em>
                </>
              )}
            </h1>
            <p className="mt-4 max-w-[440px] max-lg:mx-auto font-body text-[16.5px] leading-[1.6] text-gray-600">
              {isTrialFlow
                ? `Your account is where your activities live, on any device. Create it here, then confirm your ${TRIAL_DAYS}-day free trial on the next step. $0 today, then ${MEMBERSHIP_PRICE_YEAR}${IS_FOUNDER_PHASE ? ', your founder rate, locked in for life' : ''}.`
                : 'We use your account to remember which activities you’ve started and to keep your library accessible from any device.'}
            </p>
            <ul className="mt-7 max-w-[420px] max-lg:mx-auto flex flex-col gap-2.5 text-left max-lg:text-center">
              {(isTrialFlow
                ? [
                    'Step 1: create your account (you are here)',
                    'Step 2: confirm your free trial, $0 charged today',
                    `Then your library opens, 100+ activities, yours for ${TRIAL_DAYS} days`,
                  ]
                : [
                    'Continue right where you left off',
                    'Bookmark favorites for later',
                    'Get new activities as they drop, no extra steps',
                  ]
              ).map((item) => (
                <li key={item} className="flex max-lg:justify-center items-start gap-2.5 text-[14.5px] text-gray-600">
                  <span className="flex-none mt-0.5 w-4 h-4 rounded-full bg-[#E6EBDF] text-forest-dark grid place-items-center text-[10px] font-bold" aria-hidden="true">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-7 max-lg:text-center text-[13.5px] text-gray-500">
              Already have an account?{' '}
              <Link
                href={signInHref}
                className="text-forest-dark font-semibold border-b border-forest/25 hover:text-forest hover:border-forest transition-colors"
              >
                Sign in
              </Link>
              .
            </p>
          </div>

          {/* Right: Clerk sign-up widget. forceRedirectUrl guarantees the
              post-signup hop back to where the visitor came from (e.g.
              /join?continue=membership, which auto-resumes trial checkout). */}
          <div className="flex justify-center lg:justify-end max-lg:order-1">
            <SignUp
              appearance={clerkAuthAppearance}
              {...(redirectUrl ? { forceRedirectUrl: redirectUrl } : {})}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
