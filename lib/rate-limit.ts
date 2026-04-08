import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// ── In-memory fallback rate limiter ─────────────────────────────
// Used when Redis is unavailable. Per-instance only (won't share
// state across serverless workers), but far better than no protection.

class InMemoryRateLimiter {
  private requests = new Map<string, number[]>();
  private maxRequests: number;
  private windowMs: number;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    // Periodic cleanup of expired entries to prevent memory leaks
    this.cleanupTimer = setInterval(() => this.cleanup(), 60_000);
    // Allow the timer to not block Node from exiting
    if (this.cleanupTimer && typeof this.cleanupTimer === 'object' && 'unref' in this.cleanupTimer) {
      this.cleanupTimer.unref();
    }
  }

  async limit(identifier: string): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing timestamps and filter to current window
    const timestamps = (this.requests.get(identifier) || []).filter(
      (t) => t > windowStart,
    );

    const reset = now + this.windowMs;

    if (timestamps.length >= this.maxRequests) {
      this.requests.set(identifier, timestamps);
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset,
      };
    }

    timestamps.push(now);
    this.requests.set(identifier, timestamps);

    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - timestamps.length,
      reset,
    };
  }

  private cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    for (const [key, timestamps] of this.requests) {
      const valid = timestamps.filter((t) => t > windowStart);
      if (valid.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, valid);
      }
    }
  }
}

// ── Lazy-initialised Redis client ────────────────────────────────
// Returns null when env vars are missing (e.g. local dev without Upstash).
let _redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (_redis !== undefined) return _redis;
  // Support both Vercel KV naming (KV_REST_API_*) and standard Upstash naming
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    console.warn('Upstash Redis env vars not set - using in-memory rate limiting (per-instance only)');
    _redis = null;
    return null;
  }
  _redis = new Redis({ url, token });
  return _redis;
}

// ── In-memory fallback singletons ───────────────────────────────
const SIXTY_SECONDS = 60_000;
const _inMemoryStrict = new InMemoryRateLimiter(5, SIXTY_SECONDS);
const _inMemoryStandard = new InMemoryRateLimiter(10, SIXTY_SECONDS);
const _inMemoryRelaxed = new InMemoryRateLimiter(30, SIXTY_SECONDS);

// ── Limiter return type ─────────────────────────────────────────
type RateLimiterLike = Ratelimit | InMemoryRateLimiter;

// ── Pre-built limiters for different sensitivity levels ──────────

/** Strict: 5 requests per 60 seconds - for subscribe, contact forms */
export function strictLimiter(): RateLimiterLike {
  const redis = getRedis();
  if (!redis) return _inMemoryStrict;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '60 s'),
    prefix: 'rl:strict',
  });
}

/** Standard: 10 requests per 60 seconds - for checkout, billing */
export function standardLimiter(): RateLimiterLike {
  const redis = getRedis();
  if (!redis) return _inMemoryStandard;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '60 s'),
    prefix: 'rl:standard',
  });
}

/** Relaxed: 30 requests per 60 seconds - for reads like downloads, reviews */
export function relaxedLimiter(): RateLimiterLike {
  const redis = getRedis();
  if (!redis) return _inMemoryRelaxed;
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
  limiter: RateLimiterLike,
): Promise<NextResponse | null> {
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
