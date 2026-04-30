import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/account(.*)']);
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
