import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createHash } from 'crypto';
import {
  buildMetaPayload,
  cleanEventId,
  userDataFromRequest,
  sendMetaEvent,
  sendMetaLead,
} from './meta-capi';

const sha = (s: string) => createHash('sha256').update(s).digest('hex');

describe('cleanEventId', () => {
  it('accepts UUIDs and our evt_ fallback ids', () => {
    expect(cleanEventId('3f1c2a9e-8b7d-4c6a-9e2f-1a2b3c4d5e6f')).toBe(
      '3f1c2a9e-8b7d-4c6a-9e2f-1a2b3c4d5e6f',
    );
    expect(cleanEventId('evt_1725000000000_abc123def')).toBe('evt_1725000000000_abc123def');
  });

  it('rejects junk so a tampered body cannot pollute the dataset', () => {
    expect(cleanEventId(undefined)).toBeUndefined();
    expect(cleanEventId(42)).toBeUndefined();
    expect(cleanEventId('short')).toBeUndefined();
    expect(cleanEventId('has spaces in it')).toBeUndefined();
    expect(cleanEventId('<script>alert(1)</script>')).toBeUndefined();
    expect(cleanEventId('x'.repeat(65))).toBeUndefined();
  });
});

describe('userDataFromRequest', () => {
  it('pulls ip, user agent, and the _fbp/_fbc cookies', () => {
    const req = new Request('https://anywherelearning.co/api/subscribe', {
      headers: {
        'x-forwarded-for': '203.0.113.9, 10.0.0.1',
        'user-agent': 'Mozilla/5.0 test',
        cookie: 'other=1; _fbp=fb.1.1700000000.123; _fbc=fb.1.1700000000.AbC',
      },
    });
    expect(userDataFromRequest(req)).toEqual({
      clientIp: '203.0.113.9',
      userAgent: 'Mozilla/5.0 test',
      fbp: 'fb.1.1700000000.123',
      fbc: 'fb.1.1700000000.AbC',
    });
  });

  it('returns nulls when nothing is present', () => {
    const req = new Request('https://anywherelearning.co/api/subscribe');
    expect(userDataFromRequest(req)).toEqual({
      clientIp: null,
      userAgent: null,
      fbp: null,
      fbc: null,
    });
  });
});

describe('buildMetaPayload', () => {
  it('hashes PII, passes ip/ua/cookies raw, and drops undefined custom fields', () => {
    const payload = buildMetaPayload({
      eventName: 'Lead',
      eventId: 'evt-1',
      eventTime: 1725000000,
      sourceUrl: 'https://anywherelearning.co/free-guide',
      userData: {
        email: '  Amelie@Example.COM ',
        firstName: 'Amelie',
        clientIp: '203.0.113.9',
        userAgent: 'UA',
        fbp: 'fb.1.1.1',
        externalId: 'cus_123',
      },
      customData: { content_name: 'free-guide', value: undefined },
    });

    expect(payload.data).toHaveLength(1);
    const ev = payload.data[0];
    expect(ev.event_name).toBe('Lead');
    expect(ev.event_id).toBe('evt-1');
    expect(ev.event_time).toBe(1725000000);
    expect(ev.action_source).toBe('website');
    expect(ev.event_source_url).toBe('https://anywherelearning.co/free-guide');
    expect(ev.user_data).toEqual({
      em: [sha('amelie@example.com')],
      fn: [sha('amelie')],
      external_id: [sha('cus_123')],
      client_ip_address: '203.0.113.9',
      client_user_agent: 'UA',
      fbp: 'fb.1.1.1',
    });
    expect(ev.custom_data).toEqual({ content_name: 'free-guide' });
    expect(payload).not.toHaveProperty('test_event_code');
  });

  it('includes the test event code when configured', () => {
    vi.stubEnv('META_CAPI_TEST_EVENT_CODE', 'TEST123');
    const payload = buildMetaPayload({
      eventName: 'Purchase',
      eventId: 'cs_test_1',
      userData: { email: 'a@b.co' },
    });
    expect(payload.test_event_code).toBe('TEST123');
    vi.unstubAllEnvs();
  });
});

describe('sendMetaEvent', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('no-ops without an access token', async () => {
    vi.stubEnv('META_CAPI_ACCESS_TOKEN', '');
    const ok = await sendMetaEvent({
      eventName: 'Lead',
      eventId: 'evt-1',
      userData: { email: 'a@b.co' },
    });
    expect(ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts to the pixel events endpoint with the token in the body', async () => {
    vi.stubEnv('META_CAPI_ACCESS_TOKEN', 'tok_abc');
    fetchMock.mockResolvedValue({ ok: true, status: 200 });

    const ok = await sendMetaEvent({
      eventName: 'StartTrial',
      eventId: 'cs_test_1',
      userData: { email: 'a@b.co' },
      customData: { value: 99, currency: 'USD' },
    });

    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/^https:\/\/graph\.facebook\.com\/v\d+\.\d+\/1048095041182252\/events$/);
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body as string);
    expect(body.access_token).toBe('tok_abc');
    expect(body.data[0].event_name).toBe('StartTrial');
    expect(body.data[0].event_id).toBe('cs_test_1');
    expect(body.data[0].custom_data).toEqual({ value: 99, currency: 'USD' });
  });

  it('swallows rejections and network errors', async () => {
    vi.stubEnv('META_CAPI_ACCESS_TOKEN', 'tok_abc');
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => '{"error":"bad"}',
    });
    await expect(
      sendMetaEvent({ eventName: 'Lead', eventId: 'evt-1', userData: {} }),
    ).resolves.toBe(false);

    fetchMock.mockRejectedValueOnce(new Error('network down'));
    await expect(
      sendMetaEvent({ eventName: 'Lead', eventId: 'evt-2', userData: {} }),
    ).resolves.toBe(false);

    errSpy.mockRestore();
  });

  it('sendMetaLead carries the request match data and the source', async () => {
    vi.stubEnv('META_CAPI_ACCESS_TOKEN', 'tok_abc');
    fetchMock.mockResolvedValue({ ok: true, status: 200 });
    const req = new Request('https://anywherelearning.co/api/subscribe', {
      headers: {
        referer: 'https://anywherelearning.co/free-guide',
        'x-forwarded-for': '203.0.113.9',
        'user-agent': 'UA',
        cookie: '_fbp=fb.1.2.3',
      },
    });

    await sendMetaLead({ eventId: 'evt-9', email: 'A@B.co', source: 'free-guide', request: req });

    const body = JSON.parse((fetchMock.mock.calls[0] as [string, RequestInit])[1].body as string);
    const ev = body.data[0];
    expect(ev.event_name).toBe('Lead');
    expect(ev.event_id).toBe('evt-9');
    expect(ev.event_source_url).toBe('https://anywherelearning.co/free-guide');
    expect(ev.user_data.em).toEqual([sha('a@b.co')]);
    expect(ev.user_data.client_ip_address).toBe('203.0.113.9');
    expect(ev.user_data.fbp).toBe('fb.1.2.3');
    expect(ev.custom_data).toEqual({ content_name: 'free-guide' });
  });
});
