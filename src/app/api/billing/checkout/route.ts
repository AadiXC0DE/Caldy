import { NextRequest, NextResponse } from 'next/server';
import { auth, createClerkClient } from '@clerk/nextjs/server';
import { createCheckout, isLemonSqueezyConfigured, ProPlan } from '@/lib/lemonsqueezy';

const allowedPlans = new Set<ProPlan>(['monthly', 'lifetime']);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isLemonSqueezyConfigured()) {
      return NextResponse.json(
        { error: 'Billing is not configured for this deployment yet.' },
        { status: 503 },
      );
    }

    if (!process.env.CLERK_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Accounts are not configured for this deployment yet.' },
        { status: 503 },
      );
    }

    const body = await req.json();
    const plan = body.plan as ProPlan | undefined;

    if (!plan || !allowedPlans.has(plan)) {
      return NextResponse.json({ error: 'A valid Pro plan is required.' }, { status: 400 });
    }

    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const user = await clerkClient.users.getUser(userId);
    const url = await createCheckout({
      plan,
      userId,
      email: user.primaryEmailAddress?.emailAddress || null,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Lemon Squeezy checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
