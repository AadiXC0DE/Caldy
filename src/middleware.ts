import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Caldy's core app is intentionally available in free local mode.
// Billing, portal, and future cloud features protect themselves at the route level.
const isClerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_') &&
  process.env.CLERK_SECRET_KEY?.startsWith('sk_'),
);

const clerkHandler = clerkMiddleware();

export default isClerkConfigured
  ? clerkHandler
  : function middleware() {
      return NextResponse.next();
    };

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
