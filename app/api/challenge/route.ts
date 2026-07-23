import { NextRequest, NextResponse } from "next/server";
import { subscribeAndTag } from "@/lib/convertkit";
import { strictLimiter, checkRateLimit } from "@/lib/rate-limit";
import { CHALLENGE } from "@/lib/challenge";

/**
 * 5-Day Real-World Skills Challenge signup.
 *
 * Tags applied (no generic `lead` tag, so signups get the challenge sequence,
 * not the default 7-Activities funnel):
 *   challenge-signup   - the funnel marker; its count is the #1 scoreboard metric
 *   from-{source}      - which FB group / invite variant drove the signup
 *
 * Source matters here: the playbook tracks signups per invite variant per group,
 * so FB links carry ?source=fb-<group>-<variant> and it lands as a from-* tag.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 requests per 60 seconds (mirrors /api/subscribe).
    const limited = await checkRateLimit(request, strictLimiter());
    if (limited) return limited;

    const body = await request.json();
    const { email, source } = body as { email: string; source?: string };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Sanitize source the same way /api/subscribe does: lowercase,
    // alphanumeric + dash, max 30 chars. Becomes a from-{source} tag.
    const cleanSource = source
      ? source.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30) || undefined
      : undefined;

    await subscribeAndTag(email, [
      CHALLENGE.signupTag,
      `from-${cleanSource || "challenge"}`,
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Challenge subscribe error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
