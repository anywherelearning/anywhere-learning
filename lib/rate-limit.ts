import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// ── Lazy-initialised Redis client ────────────────────────────────
// Returns null when env vars are missing (e.g. local dev without Upstash).
let _redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (_redis !== undefined) return _redis;
  // Support both Vercel KV naming (KV_REST_API_*) and standard Upstash naming
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    console.warn('Upstash Redis env vars not set — rate limiting disabled');
    _redis = null;
    return null;
  }
  _redis = new Redis({ url, token });
  return _redis;
}

// ── Pre-built limiters for different sensitivity levels ──────────

/** Strict: 5 requests per 60 seconds — for subscribe, contact forms */
export function strictLimiter() {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '60 s'),
    prefix: 'rl:strict',
  });
}

/** Standard: 10 requests per 60 seconds — for checkout, billing */
export function standardLimiter() {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '60 s'),
    prefix: 'rl:standard',
  });
}

/** Relaxed: 30 requests per 60 seconds — for reads like downloads, reviews */
export function relaxedLimiter() {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '60 s'),
    prefix: 'rl:relaxed',
  });
}

// ── Helper to extract a stable identifier ────────────────────────

function getIdentifier(req: NextRequest): string {
  // Use Clerk userId if available in header (set by middleware)
  // Otherwise fall back to IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  return ip;
}

// ── Reusable check function ──────────────────────────────────────

/**
 * Check rate limit for a request. Returns null if allowed,
 * or a 429 NextResponse if blocked.
 */
export async function checkRateLimit(
  req: NextRequest,
  limiter: Ratelimit | null,
): Promise<NextResponse | null> {
  if (!limiter) return null; // Rate limiting disabled (no Redis)

  const identifier = getIdentifier(req);
  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      },
    );
  }

  return null;
}
