import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { getPlanForVariantId } from '@/lib/lemonsqueezy';

type WebhookPayload = {
  data?: {
    id?: string;
    attributes?: Record<string, unknown>;
  };
  meta?: {
    custom_data?: {
      clerkUserId?: string;
      plan?: string;
    };
  };
};

function verifySignature(body: string, signature: string | null) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signature) {
    return false;
  }

  const digest = crypto.createHmac('sha256', secret).update(body).digest('hex');
  const expected = Buffer.from(digest);
  const received = Buffer.from(signature);

  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, received);
}

function getPlanFromPayload(payload: WebhookPayload): 'monthly' | 'lifetime' | null {
  const attributes = payload.data?.attributes || {};
  const variantId =
    attributes.variant_id ||
    (attributes.first_order_item as { variant_id?: string | number } | undefined)?.variant_id;

  return (
    getPlanForVariantId(variantId as string | number | null | undefined) ||
    (payload.meta?.custom_data?.plan === 'monthly' || payload.meta?.custom_data?.plan === 'lifetime'
      ? payload.meta.custom_data.plan
      : null)
  );
}

function hasActiveAccess(status: unknown, endsAt: unknown) {
  const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : '';
  const activeStatuses = new Set(['active', 'on_trial', 'paused']);

  if (activeStatuses.has(normalizedStatus)) {
    return true;
  }

  if (typeof endsAt === 'string' && endsAt) {
    return new Date(endsAt).getTime() > Date.now();
  }

  return false;
}

async function findUserByMetadata(
  clerkClient: ReturnType<typeof createClerkClient>,
  metadataKey: 'lemonCustomerId' | 'lemonSubscriptionId',
  value: string | null | undefined,
) {
  if (!value) {
    return null;
  }

  const users = await clerkClient.users.getUserList({ limit: 100 });
  return users.data.find((candidate) => candidate.publicMetadata?.[metadataKey] === value) || null;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-signature');
  const eventName = req.headers.get('x-event-name');

  if (!process.env.CLERK_SECRET_KEY) {
    return NextResponse.json({ error: 'Missing Clerk secret key' }, { status: 503 });
  }

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const payload = JSON.parse(body) as WebhookPayload;
  const attributes = payload.data?.attributes || {};
  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

  try {
    const plan = getPlanFromPayload(payload);
    const clerkUserId = payload.meta?.custom_data?.clerkUserId;
    const customerId = (attributes.customer_id as string | undefined) || null;
    const subscriptionId = (payload.data?.id as string | undefined) || null;
    const orderId = (payload.data?.id as string | undefined) || null;
    const receiptUrl =
      ((attributes.urls as { receipt?: string } | undefined)?.receipt as string | undefined) ||
      null;

    switch (eventName) {
      case 'order_created': {
        if (clerkUserId) {
          await clerkClient.users.updateUserMetadata(clerkUserId, {
            publicMetadata: {
              billingProvider: 'lemonsqueezy',
              hasAccess: true,
              plan: plan || 'lifetime',
              planStatus: 'active',
              lemonCustomerId: customerId,
              lemonOrderId: orderId,
              lemonOrderReceiptUrl: receiptUrl,
              subscribedAt: new Date().toISOString(),
            },
          });
        }
        break;
      }

      case 'subscription_created':
      case 'subscription_updated':
      case 'subscription_resumed':
      case 'subscription_unpaused':
      case 'subscription_paused':
      case 'subscription_cancelled':
      case 'subscription_expired': {
        const targetUser =
          (clerkUserId ? await clerkClient.users.getUser(clerkUserId) : null) ||
          (await findUserByMetadata(clerkClient, 'lemonSubscriptionId', subscriptionId)) ||
          (await findUserByMetadata(clerkClient, 'lemonCustomerId', customerId));

        if (targetUser) {
          const status = attributes.status;
          const endsAt = attributes.ends_at;
          await clerkClient.users.updateUserMetadata(targetUser.id, {
            publicMetadata: {
              billingProvider: 'lemonsqueezy',
              hasAccess: hasActiveAccess(status, endsAt),
              plan: plan || 'monthly',
              planStatus:
                typeof status === 'string' ? status : eventName.replace('subscription_', ''),
              lemonCustomerId: customerId,
              lemonSubscriptionId: subscriptionId,
              renewedAt: new Date().toISOString(),
            },
          });
        }
        break;
      }

      case 'order_refunded': {
        const targetUser =
          (clerkUserId ? await clerkClient.users.getUser(clerkUserId) : null) ||
          (await findUserByMetadata(clerkClient, 'lemonCustomerId', customerId));

        if (targetUser && plan === 'lifetime') {
          await clerkClient.users.updateUserMetadata(targetUser.id, {
            publicMetadata: {
              hasAccess: false,
              plan: 'refunded',
              planStatus: 'refunded',
              refundedAt: new Date().toISOString(),
            },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Lemon Squeezy webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
