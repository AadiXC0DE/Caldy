import { NextResponse } from 'next/server';
import { auth, createClerkClient } from '@clerk/nextjs/server';
import { getBillingPortalUrl, isLemonSqueezyConfigured } from '@/lib/lemonsqueezy';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.CLERK_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Accounts are not configured for this deployment.' },
        { status: 503 },
      );
    }

    if (!isLemonSqueezyConfigured()) {
      return NextResponse.json(
        { error: 'Billing is not configured for this deployment.' },
        { status: 503 },
      );
    }

    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const user = await clerkClient.users.getUser(userId);
    const url = await getBillingPortalUrl({
      subscriptionId: user.publicMetadata?.lemonSubscriptionId as string | undefined,
      customerId: user.publicMetadata?.lemonCustomerId as string | undefined,
    });

    if (!url) {
      return NextResponse.json(
        { error: 'No manage-billing portal is available for this account yet.' },
        { status: 404 },
      );
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Billing portal error:', error);
    return NextResponse.json({ error: 'Failed to create billing portal session' }, { status: 500 });
  }
}
