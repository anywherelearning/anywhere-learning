import { NextRequest, NextResponse } from "next/server";
import { subscribeAndTag } from "@/lib/convertkit";
import { strictLimiter, checkRateLimit } from "@/lib/rate-limit";
import { RESULTS, isQuizResultId, isAgeBand } from "@/lib/quiz";

/**
 * Quiz lead capture. Receives the computed result + age band from the
 * "What's your kid's missing life skill?" quiz and tags the subscriber so
 * Kit can drop them into the quiz-specific sequence with the right segment.
 *
 * Tags applied (no generic `lead` tag, so they get the quiz funnel only):
 *   quiz-taker          - funnel marker / automation trigger
 *   quiz-result:{id}    - which of the 4 result types they got
 *   kid-age:{band}      - the child's age band
 *   gap:{gapTag}        - the primary skill gap their result maps to
 *   gap2:{gapTag}       - the secondary gap (only when the answers show one)
 *   from-{source}       - attribution (defaults to 'quiz')
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 requests per 60 seconds (mirrors /api/subscribe).
    const limited = await checkRateLimit(request, strictLimiter());
    if (limited) return limited;

    const body = await request.json();
    const { email, result, ageBand, secondaryGap, source } = body as {
      email: string;
      result: string;
      ageBand: string;
      secondaryGap?: string;
      source?: string;
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Validate against the quiz enums so we never create junk tags from a
    // tampered payload.
    if (!isQuizResultId(result)) {
      return NextResponse.json({ error: "Invalid result" }, { status: 400 });
    }
    if (!isAgeBand(ageBand)) {
      return NextResponse.json({ error: "Invalid age" }, { status: 400 });
    }

    // Sanitize source the same way /api/subscribe does: lowercase,
    // alphanumeric + dash, max 30 chars. Becomes a from-{source} tag.
    const cleanSource = source
      ? source.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30) || undefined
      : undefined;

    const tags = [
      "quiz-taker",
      `quiz-result:${result}`,
      `kid-age:${ageBand}`,
      `gap:${RESULTS[result].gapTag}`,
      `from-${cleanSource || "quiz"}`,
    ];

    // Secondary gap is optional and, like the primary, validated against the
    // enum so a tampered payload can never mint a junk tag.
    if (isQuizResultId(secondaryGap) && secondaryGap !== result) {
      tags.push(`gap2:${RESULTS[secondaryGap].gapTag}`);
    }

    await subscribeAndTag(email, tags);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Quiz subscribe error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
