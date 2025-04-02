import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes
const isPublicRoute = createRouteMatcher([
  '/', 
  '/sign-in(.*)', 
  '/sign-up(.*)', 
  '/api/webhook/clerk',
  '/properties(.*)', // Public property listings
  '/rooms(.*)', // Public room listings
]);

// Define routes that need to be ignored completely
const isIgnoredRoute = createRouteMatcher([
  '/api/webhook/clerk',
]);

export default clerkMiddleware(async (auth, req) => {
  // Skip processing for ignored routes
  if (isIgnoredRoute(req)) {
    return;
  }
  
  // Protect all routes except public ones
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};