/**
 * Vercel deploy webhook → IndexNow.
 *
 * Vercel POSTs here whenever a deployment completes. The endpoint
 * verifies the x-vercel-signature, ignores non-production or
 * non-success events, then submits a small curated URL list (core
 * landing pages + blog posts published in the last 14 days) to
 * IndexNow so Bing and ChatGPT's web index re-crawl them quickly.
 *
 * Why a curated list instead of the full sitemap: IndexNow
 * discourages submitting unchanged URLs, and we deploy for
 * non-content reasons too (design tweaks, config changes). The
 * curated list still catches the usual "new blog post" and "new
 * product" cases because those also freshen /blog and /shop indexes.
 *
 * Setup (one-time):
 * 1. In Vercel dashboard → Project → Settings → Webhooks, add:
 *      URL:   https://anywherelearning.co/api/indexnow
 *      Events: deployment.succeeded
 *      Scope: this project, production target
 * 2. Copy the signing secret Vercel generates.
 * 3. Add VERCEL_WEBHOOK_SECRET=<secret> to the project's Vercel env
 *    vars (Production scope).
 * 4. Redeploy so the secret is picked up.
 *
 * Manual bulk submission is still available via
 * `npm run indexnow -- --from-sitemap`.
 */

import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAllPosts } from "@/lib/blog";
import {
  INDEXNOW_HOST,
  submitToIndexNow,
  validateHostUrls,
} from "@/lib/indexnow";

export const runtime = "nodejs";

// Days to look back for "recently published" blog posts.
const RECENT_POSTS_WINDOW_DAYS = 14;

// Always re-submit these on every deploy — they update whenever any
// content changes (indexes, landing pages).
const CORE_URLS = [
  `https://${INDEXNOW_HOST}`,
  `https://${INDEXNOW_HOST}/shop`,
  `https://${INDEXNOW_HOST}/blog`,
  `https://${INDEXNOW_HOST}/guides`,
];

interface VercelWebhookPayload {
  type?: string;
  payload?: {
    target?: string;
    deployment?: { state?: string };
  };
}

/**
 * Verify the Vercel webhook signature. Vercel signs with HMAC-SHA1
 * of the raw request body using the secret stored in
 * VERCEL_WEBHOOK_SECRET. The x-vercel-signature header is the hex
 * digest (no "sha1=" prefix).
 */
function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = crypto.createHmac("sha1", secret).update(rawBody).digest("hex");
  // Constant-time compare to avoid timing attacks.
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

/**
 * Return the canonical URLs to submit on this deploy: core landing
 * pages + any blog post published within the last N days.
 */
function urlsForDeploy(): string[] {
  const cutoff = Date.now() - RECENT_POSTS_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const recentPosts = getAllPosts()
    .filter((p) => {
      const published = Date.parse(p.publishedAt);
      return Number.isFinite(published) && published >= cutoff;
    })
    .map((p) => `https://${INDEXNOW_HOST}/blog/${p.slug}`);

  // De-dupe while preserving order.
  return Array.from(new Set([...CORE_URLS, ...recentPosts]));
}

export async function POST(request: Request): Promise<NextResponse> {
  const secret = process.env.VERCEL_WEBHOOK_SECRET;
  if (!secret) {
    // Don't leak that the env var is missing to unauthed callers.
    console.error("[indexnow] VERCEL_WEBHOOK_SECRET not configured");
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  // Read raw body for signature verification. NextResponse/Request
  // re-read is fine on the Node runtime.
  const rawBody = await request.text();
  const signature = request.headers.get("x-vercel-signature");

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ ok: false, error: "invalid signature" }, { status: 401 });
  }

  let payload: VercelWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as VercelWebhookPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  // Only act on successful production deploys. Vercel sends a handful
  // of event types; ignore previews, failures, and canceled deploys.
  const isSuccess =
    payload.type === "deployment.succeeded" ||
    payload.payload?.deployment?.state === "READY";
  const isProd = payload.payload?.target === "production";

  if (!isSuccess || !isProd) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: !isSuccess ? "not-success" : "not-production",
    });
  }

  const urls = urlsForDeploy();
  try {
    validateHostUrls(urls);
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 400 },
    );
  }

  const result = await submitToIndexNow(urls);
  if (!result.ok) {
    console.error(`[indexnow] submit failed status=${result.status} msg=${result.message}`);
  }

  return NextResponse.json({
    ok: result.ok,
    status: result.status,
    submitted: result.submitted,
    urls,
  });
}
