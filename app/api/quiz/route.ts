import { NextRequest, NextResponse, after } from "next/server";
import { subscribeAndTag } from "@/lib/convertkit";
import { strictLimiter, checkRateLimit } from "@/lib/rate-limit";
import { RESULTS, isQuizResultId, isAgeBand } from "@/lib/quiz";
import { FLAGSHIP_GUIDE, FLAGSHIP_DOWNLOAD_URL } from "@/lib/flagship-guide";
import { sendQuizPlanEmail } from "@/lib/resend";

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
 *   guide:{flagship}    - triggers free delivery of the flagship bonus guide
 *   from-{source}       - attribution (defaults to 'quiz')
 *
 * It also fires an instant Resend email (the plan + a one-click download of the
 * flagship guide) after the response, independent of Kit.
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
      // Flagship free bonus guide (playbook Move 1). Kit delivers it off this tag.
      `guide:${FLAGSHIP_GUIDE.guideTag}`,
      `from-${cleanSource || "quiz"}`,
    ];

    // Secondary gap is optional and, like the primary, validated against the
    // enum so a tampered payload can never mint a junk tag.
    const validSecondary =
      isQuizResultId(secondaryGap) && secondaryGap !== result ? secondaryGap : null;
    if (validSecondary) {
      tags.push(`gap2:${RESULTS[validSecondary].gapTag}`);
    }

    await subscribeAndTag(email, tags);

    // Fire the instant plan + free-guide email AFTER the response, so it never
    // delays the result reveal. Best-effort: a mail failure must not fail the
    // quiz (and in dev without RESEND_API_KEY it simply no-ops via the catch).
    after(async () => {
      try {
        const r = RESULTS[result];
        const gaps = [
          r.gapLabel,
          ...(validSecondary ? [RESULTS[validSecondary].gapLabel] : []),
        ];
        await sendQuizPlanEmail({
          to: email,
          archetypeTitle: r.title,
          tagline: r.tagline,
          gaps,
          saturday: r.saturday,
          activities: r.activities.map((a) => ({ name: a.name, note: a.note })),
          guideName: FLAGSHIP_GUIDE.name,
          priceLabel: FLAGSHIP_GUIDE.priceLabel,
          downloadUrl: FLAGSHIP_DOWNLOAD_URL,
        });
      } catch (e) {
        console.error("Quiz plan email failed:", e);
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Quiz subscribe error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
