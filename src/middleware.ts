import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook/clerk',
  '/properties(.*)',
  '/rooms(.*)',
]);

export default clerkMiddleware((auth, req) => {
  const { userId } = auth;

  // If user is signed in and tries to access sign-in/up, redirect to dashboard
  if (
    userId &&
    (req.nextUrl.pathname.startsWith('/sign-in') ||
     req.nextUrl.pathname.startsWith('/sign-up'))
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Allow all public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // All other routes require authentication
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
