import { createHash } from 'crypto';
import { META_PIXEL_ID } from '@/lib/tracking';

/**
 * Meta Conversions API (server-side events).
 *
 * The browser pixel in layout.tsx misses anyone with an ad blocker or strict
 * privacy settings, which is a big chunk of our audience. Sending the same
 * events from the server fills that gap and gives Meta the matching data
 * (hashed email, IP, user agent, _fbp/_fbc cookies) it needs to attribute
 * conversions to ads.
 *
 * Dedupe: when the browser and server both send the same event, they share
 * an `event_id`. Meta keeps one and drops the other, so counts never double.
 *
 * Every function here is best-effort. Missing token = silent no-op, network
 * failure = logged and swallowed. Tracking must never break a signup or a
 * webhook.
 *
 * Setup: Events Manager > Anywhere Learning data > Settings > Conversions API
 * > "Set up direct integration" > Generate access token. Paste the token into
 * META_CAPI_ACCESS_TOKEN (Vercel + .env.local). Optionally set
 * META_CAPI_TEST_EVENT_CODE (from the "Test events" tab) to see events land
 * in real time while testing; unset it in production.
 */

const GRAPH_API_VERSION = 'v21.0';

/** Meta standard event names we send from the server. */
export type MetaServerEventName =
  | 'Lead'
  | 'StartTrial'
  | 'Purchase'
  | 'Subscribe'
  | 'CompleteRegistration';

export type MetaUserData = {
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  /** Raw client IP, from x-forwarded-for. Not hashed (Meta requires plain). */
  clientIp?: string | null;
  /** Raw user agent. Not hashed. */
  userAgent?: string | null;
  /** Meta's first-party browser cookie `_fbp`, if present. */
  fbp?: string | null;
  /** Meta's click id cookie `_fbc`, if present. */
  fbc?: string | null;
  /** Stable customer id (Stripe customer id works well). Hashed. */
  externalId?: string | null;
};

export type MetaServerEvent = {
  eventName: MetaServerEventName;
  /**
   * Shared with the browser pixel event for dedupe. For leads the client
   * generates a UUID and posts it along with the email. For checkout the
   * Stripe session id works on both sides.
   */
  eventId: string;
  /** Page the action happened on. Improves match quality. */
  sourceUrl?: string | null;
  userData: MetaUserData;
  customData?: Record<string, string | number | boolean | undefined>;
  /** Unix seconds. Defaults to now. */
  eventTime?: number;
};

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** Normalize then hash, per Meta's customer information parameter rules. */
function hashNormalized(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const clean = value.trim().toLowerCase();
  if (!clean) return undefined;
  return sha256(clean);
}

/**
 * Sanitize a client-supplied event id. Anything outside a UUID-ish charset
 * or over 64 chars is dropped, so a tampered payload can't inject junk into
 * our Meta dataset.
 */
export function cleanEventId(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(trimmed)) return undefined;
  return trimmed;
}

/**
 * Pull the matching parameters Meta wants out of an incoming request:
 * IP, user agent, and the pixel's first-party cookies. Call this in an API
 * route and pass the result into the event's userData.
 */
export function userDataFromRequest(request: Request): Pick<
  MetaUserData,
  'clientIp' | 'userAgent' | 'fbp' | 'fbc'
> {
  const forwarded = request.headers.get('x-forwarded-for');
  const clientIp = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || null;
  const userAgent = request.headers.get('user-agent');

  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = new Map<string, string>();
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    cookies.set(part.slice(0, idx).trim(), part.slice(idx + 1).trim());
  }

  return {
    clientIp,
    userAgent,
    fbp: cookies.get('_fbp') || null,
    fbc: cookies.get('_fbc') || null,
  };
}

/** Build the exact payload Meta expects. Exported for tests. */
export function buildMetaPayload(event: MetaServerEvent) {
  const u = event.userData;
  const userData: Record<string, string | string[]> = {};

  const em = hashNormalized(u.email);
  if (em) userData.em = [em];
  const fn = hashNormalized(u.firstName);
  if (fn) userData.fn = [fn];
  const ln = hashNormalized(u.lastName);
  if (ln) userData.ln = [ln];
  const externalId = hashNormalized(u.externalId);
  if (externalId) userData.external_id = [externalId];
  if (u.clientIp) userData.client_ip_address = u.clientIp;
  if (u.userAgent) userData.client_user_agent = u.userAgent;
  if (u.fbp) userData.fbp = u.fbp;
  if (u.fbc) userData.fbc = u.fbc;

  const customData = event.customData
    ? Object.fromEntries(Object.entries(event.customData).filter(([, v]) => v !== undefined))
    : undefined;

  return {
    data: [
      {
        event_name: event.eventName,
        event_time: event.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        action_source: 'website' as const,
        ...(event.sourceUrl ? { event_source_url: event.sourceUrl } : {}),
        user_data: userData,
        ...(customData && Object.keys(customData).length > 0 ? { custom_data: customData } : {}),
      },
    ],
    ...(process.env.META_CAPI_TEST_EVENT_CODE
      ? { test_event_code: process.env.META_CAPI_TEST_EVENT_CODE }
      : {}),
  };
}

/**
 * Send one event to Meta. Resolves to true if Meta accepted it, false on any
 * failure or when the token isn't configured. Never throws.
 */
export async function sendMetaEvent(event: MetaServerEvent): Promise<boolean> {
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!token) return false;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${META_PIXEL_ID}/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...buildMetaPayload(event), access_token: token }),
        // Meta usually answers in well under a second. Don't let a slow
        // Graph API hold a webhook or signup open.
        signal: AbortSignal.timeout(5000),
      },
    );

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`[meta-capi] ${event.eventName} rejected (${res.status}):`, text.slice(0, 500));
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[meta-capi] ${event.eventName} failed:`, err);
    return false;
  }
}

/**
 * Server-side Lead. Mirrors the browser `metaLead()` call; pass the same
 * eventId the client generated so Meta dedupes the pair.
 */
export async function sendMetaLead(params: {
  eventId: string;
  email: string;
  source: string;
  request: Request;
}): Promise<boolean> {
  return sendMetaEvent({
    eventName: 'Lead',
    eventId: params.eventId,
    sourceUrl: params.request.headers.get('referer'),
    userData: { email: params.email, ...userDataFromRequest(params.request) },
    customData: { content_name: params.source },
  });
}
