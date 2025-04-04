import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook/clerk',
  '/properties(.*)',
  '/rooms(.*)',
];

// Define routes that need to be ignored completely
const ignoredRoutes = [
  '/api/webhook/clerk',
  '/_next(.*)',
  '/favicon.ico',
  '/static(.*)',
];

export default authMiddleware({
  publicRoutes,
  ignoredRoutes,
  afterAuth(auth, req) {
    // If the user is signed in and trying to access auth pages, redirect them
    if (auth.userId && (req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up'))) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // For everything else, just continue
    return NextResponse.next();
  },
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};