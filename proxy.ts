import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/account(.*)', '/admin(.*)']);
const isPublicAppRoute = createRouteMatcher(['/app-login', '/app-account']);

export default clerkMiddleware(async (auth, req) => {
  // Lowercase any uppercase pathname (excluding /api, which may be case-sensitive).
  // Pinterest, Reddit, and email clients sometimes mangle URL case; without this
  // those inbound links would 404 instead of capturing the visit.
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith('/api') && pathname !== pathname.toLowerCase()) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.toLowerCase();
    return NextResponse.redirect(url, 301);
  }

  // Cold Meta ad traffic gets the full trial page (/try) instead of the bare
  // /choose-plan price table, which GA4 showed Facebook visitors leaving in
  // seconds (Nov 2026). Done here, not in the page, so it's a real redirect
  // before the store layout starts streaming. Ads already pointing at
  // /choose-plan?source=meta-* follow without an edit; ?source is kept.
  if (pathname === '/choose-plan' && req.nextUrl.searchParams.get('source')?.startsWith('meta-')) {
    const url = req.nextUrl.clone();
    url.pathname = '/try';
    return NextResponse.redirect(url, 307);
  }

  if (isProtectedRoute(req) && !isPublicAppRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
