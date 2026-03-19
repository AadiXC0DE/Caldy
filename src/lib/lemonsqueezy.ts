const LEMON_SQUEEZY_API_BASE = 'https://api.lemonsqueezy.com/v1';

export type ProPlan = 'monthly' | 'lifetime';

type LemonResponse<T> = {
  data: {
    id: string;
    type: string;
    attributes: T;
  };
};

type CheckoutAttributes = {
  url: string;
};

type CustomerAttributes = {
  customer_portal?: string | null;
  urls?: {
    customer_portal?: string | null;
  };
};

type SubscriptionAttributes = {
  status?: string | null;
  ends_at?: string | null;
  urls?: {
    customer_portal?: string | null;
    update_payment_method?: string | null;
  };
};

type LemonConfig = {
  apiKey: string;
  storeId: string;
};

function getRequiredConfig(): LemonConfig {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;

  if (!apiKey || !storeId) {
    throw new Error(
      'Lemon Squeezy is not configured. Set LEMONSQUEEZY_API_KEY and LEMONSQUEEZY_STORE_ID.',
    );
  }

  return { apiKey, storeId };
}

export function isLemonSqueezyConfigured(): boolean {
  return Boolean(process.env.LEMONSQUEEZY_API_KEY && process.env.LEMONSQUEEZY_STORE_ID);
}

export function getLemonSqueezyVariantIds() {
  return {
    monthly: process.env.LEMONSQUEEZY_VARIANT_PRO_MONTHLY || null,
    lifetime: process.env.LEMONSQUEEZY_VARIANT_PRO_LIFETIME || null,
  };
}

export function getLemonSqueezyVariantId(plan: ProPlan): string | null {
  const ids = getLemonSqueezyVariantIds();
  return plan === 'monthly' ? ids.monthly : ids.lifetime;
}

export function getPlanForVariantId(variantId: string | number | null | undefined): ProPlan | null {
  if (!variantId) {
    return null;
  }

  const normalized = String(variantId);
  const { monthly, lifetime } = getLemonSqueezyVariantIds();

  if (monthly && normalized === monthly) {
    return 'monthly';
  }

  if (lifetime && normalized === lifetime) {
    return 'lifetime';
  }

  return null;
}

async function lemonRequest<T>(path: string, init?: RequestInit): Promise<LemonResponse<T>> {
  const { apiKey } = getRequiredConfig();
  const response = await fetch(`${LEMON_SQUEEZY_API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.api+json',
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/vnd.api+json',
      ...init?.headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Lemon Squeezy request failed (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<LemonResponse<T>>;
}

export async function createCheckout(params: {
  plan: ProPlan;
  userId: string;
  email?: string | null;
}): Promise<string> {
  const { storeId } = getRequiredConfig();
  const variantId = getLemonSqueezyVariantId(params.plan);

  if (!variantId) {
    throw new Error(`Lemon Squeezy variant for the "${params.plan}" plan is not configured.`);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const response = await lemonRequest<CheckoutAttributes>('/checkouts', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: params.email || undefined,
            custom: {
              clerkUserId: params.userId,
              plan: params.plan,
            },
          },
          checkout_options: {
            embed: false,
            media: true,
            logo: true,
          },
          product_options: {
            redirect_url: `${appUrl}/settings?checkout=success`,
          },
          test_mode: process.env.LEMONSQUEEZY_TEST_MODE === 'true',
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: storeId,
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: variantId,
            },
          },
        },
      },
    }),
  });

  return response.data.attributes.url;
}

export async function getBillingPortalUrl(params: {
  subscriptionId?: string | null;
  customerId?: string | null;
}): Promise<string | null> {
  if (params.subscriptionId) {
    const response = await lemonRequest<SubscriptionAttributes>(
      `/subscriptions/${params.subscriptionId}`,
    );
    return (
      response.data.attributes.urls?.customer_portal ||
      response.data.attributes.urls?.update_payment_method ||
      null
    );
  }

  if (params.customerId) {
    const response = await lemonRequest<CustomerAttributes>(`/customers/${params.customerId}`);
    return (
      response.data.attributes.urls?.customer_portal ||
      response.data.attributes.customer_portal ||
      null
    );
  }

  return null;
}
