import { clerkMiddleware } from '@clerk/nextjs/server';

// Caldy's core app is intentionally available in free local mode.
// Billing, portal, and future cloud features protect themselves at the route level.
export default clerkMiddleware();

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
