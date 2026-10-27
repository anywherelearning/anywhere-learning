import { describe, it, expect, vi, beforeEach } from 'vitest';
import type Stripe from 'stripe';

/**
 * Webhook route tests.
 *
 * The real handler depends on Stripe SDK, Clerk, DB, and Resend, so we
 * mock those and test that:
 *   1. Invalid/missing signatures are rejected
 *   2. Valid events dispatch to the correct handler
 *   3. Unhandled events are acknowledged (200) so Stripe stops retrying
 */

// ── Mocks ───────────────────────────────────────────────────────────

const mockConstructEvent = vi.fn();
const mockSubscriptionsRetrieve = vi.fn();
const mockSubscriptionsCancel = vi.fn();

vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: { constructEvent: (...args: unknown[]) => mockConstructEvent(...args) },
    subscriptions: {
      retrieve: (...args: unknown[]) => mockSubscriptionsRetrieve(...args),
      cancel: (...args: unknown[]) => mockSubscriptionsCancel(...args),
    },
  },
}));

// Each `db.select()...` chain resolves to the next array shifted off this queue
// (empty array when drained), letting a test stage what successive selects
// return — e.g. [] for the "already a member?" lookup, then [{…}] for the
// abandoned-email throttle lookup. Populated per-test; reset in beforeEach.
const selectResults = vi.hoisted(() => ({ queue: [] as unknown[][] }));

vi.mock('@/lib/db', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({ limit: () => selectResults.queue.shift() ?? [] }),
      }),
    }),
    // `.returning()` yields a row so callers that read `inserted[0].id`
    // (e.g. upsertUser) don't blow up on an empty result.
    insert: () => ({ values: () => ({ returning: () => [{ id: 'user_test' }], onConflictDoNothing: () => ({ returning: () => [{ id: 'evt_test' }] }) }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
    delete: () => ({ where: () => Promise.resolve() }),
  },
}));

vi.mock('@/lib/db/schema', () => ({
  users: {},
  subscriptions: {},
  stripeEvents: {},
  sentEmails: {},
  exitSurveys: {},
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
  ne: vi.fn(),
  gt: vi.fn(),
}));

vi.mock('@clerk/backend', () => ({
  createClerkClient: () => ({
    users: {
      getUserList: () => ({ data: [{ id: 'user_test', firstName: null, lastName: null }] }),
      updateUser: vi.fn(),
      updateUserMetadata: vi.fn(),
    },
    signInTokens: {
      createSignInToken: () => ({ token: 'test_token' }),
    },
  }),
}));

vi.mock('@/lib/convertkit', () => ({
  subscribeAndTag: vi.fn(),
  applyAndRemoveTags: vi.fn(),
}));

vi.mock('@/lib/resend', () => ({
  sendMembershipWelcomeEmail: vi.fn(),
  sendAbandonedCheckoutMembershipEmail: vi.fn(),
  sendTrialEndingEmail: vi.fn(),
  sendMembershipConvertedEmail: vi.fn(),
  sendTrialCanceledEmail: vi.fn(),
  sendPaymentFailedEmail: vi.fn(),
  sendMembershipCancellationScheduledEmail: vi.fn(),
}));

// ── Helpers ─────────────────────────────────────────────────────────

function makeRequest(body: string, signature = 'sig_valid') {
  return new Request('https://anywherelearning.co/api/webhooks/stripe', {
    method: 'POST',
    headers: {
      'stripe-signature': signature,
      'x-forwarded-for': '127.0.0.1',
    },
    body,
  }) as unknown as import('next/server').NextRequest;
}

function fakeEvent(type: string, data: Record<string, unknown> = {}): Stripe.Event {
  return {
    id: 'evt_test',
    type,
    data: { object: data },
    object: 'event',
    api_version: '2024-01-01',
    created: Date.now() / 1000,
    livemode: false,
    pending_webhooks: 0,
    request: null,
  } as unknown as Stripe.Event;
}

// ── Tests ───────────────────────────────────────────────────────────

let POST: (req: import('next/server').NextRequest) => Promise<Response>;

beforeEach(async () => {
  vi.clearAllMocks();
  selectResults.queue = [];
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
  process.env.CLERK_SECRET_KEY = 'sk_test_clerk';
  process.env.NEXT_PUBLIC_URL = 'https://anywherelearning.co';
  const mod = await import('./route');
  POST = mod.POST;
});

describe('Stripe webhook signature verification', () => {
  it('rejects requests without stripe-signature header', async () => {
    const req = new Request('https://anywherelearning.co/api/webhooks/stripe', {
      method: 'POST',
      body: '{}',
    }) as unknown as import('next/server').NextRequest;
    // Need to add the headers property
    Object.defineProperty(req, 'headers', {
      value: new Headers(),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Missing signature');
  });

  it('rejects requests with invalid signature', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const req = makeRequest('{"invalid": true}', 'sig_bad');
    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Invalid signature');
  });

  it('rejects when STRIPE_WEBHOOK_SECRET is not set', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;

    const req = makeRequest('{}');
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});

describe('Stripe webhook event routing', () => {
  it('acknowledges checkout.session.completed', async () => {
    mockConstructEvent.mockReturnValue(
      fakeEvent('checkout.session.completed', {
        id: 'cs_test',
        payment_status: 'paid',
        mode: 'subscription',
        customer_details: { email: 'test@example.com', name: 'Test User' },
        customer: 'cus_test',
        metadata: { kind: 'membership' },
        subscription: 'sub_test',
      }),
    );
    mockSubscriptionsRetrieve.mockResolvedValue({
      id: 'sub_test',
      status: 'active',
      customer: 'cus_test',
      items: { data: [{ price: { id: 'price_founder' } }] },
      current_period_end: Math.floor(Date.now() / 1000) + 365 * 86400,
      cancel_at_period_end: false,
    });

    const req = makeRequest('body');
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.received).toBe(true);
  });

  it('acknowledges unhandled events with 200', async () => {
    mockConstructEvent.mockReturnValue(fakeEvent('payment_intent.created'));

    const req = makeRequest('body');
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.received).toBe(true);
  });

  it('returns 200 even when handler throws (prevents Stripe retries)', async () => {
    mockConstructEvent.mockReturnValue(
      fakeEvent('charge.refunded', {
        id: 'ch_test',
        refunded: true,
        amount: 9900,
        amount_refunded: 9900,
        invoice: 'inv_test',
        billing_details: { email: 'test@example.com' },
      }),
    );
    // Force the handler to throw by making stripe.invoices.retrieve fail
    // (it'll try to retrieve the invoice for the refund)

    const req = makeRequest('body');
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it('routes subscription events to upsertSubscriptionFromStripe', async () => {
    mockConstructEvent.mockReturnValue(
      fakeEvent('customer.subscription.deleted', {
        id: 'sub_test',
        status: 'canceled',
        customer: 'cus_test',
        items: { data: [{ price: { id: 'price_test' } }] },
        current_period_end: Math.floor(Date.now() / 1000) - 86400,
        cancel_at_period_end: false,
      }),
    );

    const req = makeRequest('body');
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.received).toBe(true);
  });

  it('routes invoice.paid to subscription retrieval', async () => {
    const subId = 'sub_renewal';
    mockConstructEvent.mockReturnValue(
      fakeEvent('invoice.paid', { subscription: subId }),
    );
    mockSubscriptionsRetrieve.mockResolvedValue({
      id: subId,
      status: 'active',
      customer: 'cus_test',
      items: { data: [{ price: { id: 'price_test' } }] },
      current_period_end: Math.floor(Date.now() / 1000) + 365 * 86400,
      cancel_at_period_end: false,
    });

    const req = makeRequest('body');
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockSubscriptionsRetrieve).toHaveBeenCalledWith(subId);
  });
});

describe('Stripe webhook checkout.session.expired', () => {
  function expiredEvent(email: string) {
    return fakeEvent('checkout.session.expired', {
      id: 'cs_expired',
      mode: 'subscription',
      customer_details: { email, name: 'Test' },
      metadata: { kind: 'membership' },
    });
  }

  it('sends the abandoned-checkout email when none was sent recently', async () => {
    const { sendAbandonedCheckoutMembershipEmail } = await import('@/lib/resend');
    // selects drain to []: no existing member, and no recent send in the log.
    mockConstructEvent.mockReturnValue(expiredEvent('abandoned@example.com'));

    const res = await POST(makeRequest('body'));

    expect(res.status).toBe(200);
    expect(sendAbandonedCheckoutMembershipEmail).toHaveBeenCalledTimes(1);
    expect(vi.mocked(sendAbandonedCheckoutMembershipEmail).mock.calls[0][0]).toMatchObject({
      to: 'abandoned@example.com',
    });
  });

  it('skips the email when one was already sent within the throttle window', async () => {
    const { sendAbandonedCheckoutMembershipEmail } = await import('@/lib/resend');
    // 1st select (member lookup) → none; 2nd select (throttle) → a recent send.
    selectResults.queue = [[], [{ id: 'sent_row' }]];
    mockConstructEvent.mockReturnValue(expiredEvent('abandoned@example.com'));

    const res = await POST(makeRequest('body'));

    // Still ack'd (200) so Stripe stops retrying, but no email goes out.
    expect(res.status).toBe(200);
    expect(sendAbandonedCheckoutMembershipEmail).not.toHaveBeenCalled();
  });
});

describe('Stripe webhook trial-canceled email', () => {
  const user = { id: 'u1', email: 'trial@example.com', clerkId: 'user_test', stripeCustomerId: 'cus_trial' };
  const trialEnd = Math.floor(Date.now() / 1000) + 5 * 86400;

  function trialSub(overrides: Record<string, unknown> = {}) {
    return {
      id: 'sub_trial',
      status: 'trialing',
      customer: 'cus_trial',
      items: { data: [{ price: { id: 'price_test' } }] },
      current_period_end: trialEnd,
      trial_end: trialEnd,
      cancel_at_period_end: true,
      ...overrides,
    };
  }

  it('sends when the first event seen already has the cancel scheduled', async () => {
    const { sendTrialCanceledEmail } = await import('@/lib/resend');
    // user lookup → user; no subscription row yet; nothing in sent_emails.
    selectResults.queue = [[user], [], []];
    mockConstructEvent.mockReturnValue(fakeEvent('customer.subscription.updated', trialSub()));

    const res = await POST(makeRequest('body'));

    expect(res.status).toBe(200);
    expect(sendTrialCanceledEmail).toHaveBeenCalledTimes(1);
    expect(vi.mocked(sendTrialCanceledEmail).mock.calls[0][0]).toMatchObject({ to: user.email });
  });

  it('skips when the confirmation already went out for this subscription', async () => {
    const { sendTrialCanceledEmail } = await import('@/lib/resend');
    selectResults.queue = [[user], [{ status: 'trialing', cancelAtPeriodEnd: true }], [{ id: 'sent_row' }]];
    mockConstructEvent.mockReturnValue(fakeEvent('customer.subscription.updated', trialSub()));

    await POST(makeRequest('body'));

    expect(sendTrialCanceledEmail).not.toHaveBeenCalled();
  });

  it('sends at trial end when the scheduled-cancel email never went out', async () => {
    const { sendTrialCanceledEmail } = await import('@/lib/resend');
    // Our row already says cancelAtPeriodEnd = true, but sent_emails is empty.
    selectResults.queue = [[user], [{ status: 'trialing', cancelAtPeriodEnd: true, stripePriceId: 'price_test' }], []];
    mockConstructEvent.mockReturnValue(
      fakeEvent('customer.subscription.deleted', trialSub({
        status: 'canceled',
        current_period_end: Math.floor(Date.now() / 1000) - 60,
        trial_end: Math.floor(Date.now() / 1000) - 60,
      })),
    );

    await POST(makeRequest('body'));

    expect(sendTrialCanceledEmail).toHaveBeenCalledTimes(1);
  });
});

describe('Stripe webhook invoice.payment_failed', () => {
  const user = { id: 'u2', email: 'pastdue@example.com', clerkId: 'user_test', stripeCustomerId: 'cus_pd' };
  const failedInvoice = {
    id: 'in_failed',
    customer: 'cus_pd',
    amount_due: 7900,
    currency: 'usd',
    hosted_invoice_url: 'https://invoice.stripe.com/i/test',
  };

  it('sends the update-your-payment email with the hosted invoice link', async () => {
    const { sendPaymentFailedEmail } = await import('@/lib/resend');
    // user lookup → user; nothing in sent_emails for this invoice.
    selectResults.queue = [[user], []];
    mockConstructEvent.mockReturnValue(fakeEvent('invoice.payment_failed', failedInvoice));

    const res = await POST(makeRequest('body'));

    expect(res.status).toBe(200);
    expect(sendPaymentFailedEmail).toHaveBeenCalledTimes(1);
    expect(vi.mocked(sendPaymentFailedEmail).mock.calls[0][0]).toMatchObject({
      to: user.email,
      amount: '$79',
      payUrl: failedInvoice.hosted_invoice_url,
    });
  });

  it('sends only once per invoice when Stripe retries fail again', async () => {
    const { sendPaymentFailedEmail } = await import('@/lib/resend');
    selectResults.queue = [[user], [{ id: 'sent_row' }]];
    mockConstructEvent.mockReturnValue(fakeEvent('invoice.payment_failed', failedInvoice));

    await POST(makeRequest('body'));

    expect(sendPaymentFailedEmail).not.toHaveBeenCalled();
  });
});
