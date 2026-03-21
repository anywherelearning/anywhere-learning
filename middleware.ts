import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/account(.*)']);
const isPublicAppRoute = createRouteMatcher(['/library', '/app-login', '/app-account']);

// Only run Clerk middleware when keys are configured
const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function fallbackMiddleware(req: NextRequest) {
  // Without Clerk, redirect /account routes to sign-in
  if (isProtectedRoute(req)) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
  return NextResponse.next();
}

export default hasClerk
  ? clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req) && !isPublicAppRoute(req)) {
        await auth.protect();
      }
    })
  : fallbackMiddleware;

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
