import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignUp } from '@clerk/nextjs';
import { clerkAuthAppearance } from '@/lib/clerk-theme';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create your Anywhere Learning account to access your library.',
};

export default async function SignUpPage() {
  const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!hasClerk) return null;

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
              Create your account
            </p>
            <h1 className="mt-3 font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.06] tracking-tight text-balance">
              One quick step to{' '}
              <em className="not-italic italic text-forest">unlock the library.</em>
            </h1>
            <p className="mt-4 max-w-[440px] max-lg:mx-auto font-body text-[16.5px] leading-[1.6] text-gray-600">
              We use your account to remember which activities you&rsquo;ve started and to keep
              your library accessible from any device.
            </p>
            <ul className="mt-7 max-w-[420px] max-lg:mx-auto flex flex-col gap-2.5 text-left max-lg:text-center">
              {[
                'Continue right where you left off',
                'Bookmark favorites for later',
                'Get new activities as they drop, no extra steps',
              ].map((item) => (
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
                href="/sign-in"
                className="text-forest-dark font-semibold border-b border-forest/25 hover:text-forest hover:border-forest transition-colors"
              >
                Sign in
              </Link>
              .
            </p>
          </div>

          {/* Right: Clerk sign-up widget */}
          <div className="flex justify-center lg:justify-end max-lg:order-1">
            <SignUp appearance={clerkAuthAppearance} />
          </div>
        </div>
      </div>
    </main>
  );
}
