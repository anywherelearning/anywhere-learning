import { NextRequest, NextResponse } from "next/server";
import { subscribeToConvertKit, subscribeAndTag } from "@/lib/convertkit";
import { strictLimiter, checkRateLimit } from "@/lib/rate-limit";
import { QUIZ_BANDS, QUIZ_DIMENSIONS, QUIZ_AGE_RANGES } from "@/lib/quiz-data";

// Whitelists for quiz result tags, derived from the quiz definition so the
// open endpoint can never be used to create arbitrary Kit tags.
const VALID_QUIZ_BANDS = new Set(QUIZ_BANDS.map((b) => b.slug));
const VALID_QUIZ_FOCUS = new Set(QUIZ_DIMENSIONS.map((d) => d.slug));
const VALID_QUIZ_AGES = new Set(QUIZ_AGE_RANGES.map((a) => a.value));

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 requests per 60 seconds (prevents spam abuse)
    const limited = await checkRateLimit(request, strictLimiter());
    if (limited) return limited;

    const body = await request.json();
    const { email, source, quiz } = body as {
      email: string;
      source?: string;
      quiz?: { band?: string; focus?: string; age?: string };
    };

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email" },
        { status: 400 }
      );
    }

    // Sanitize source: lowercase, alphanumeric + dash only, max 30 chars.
    // Becomes a Kit tag (from-{source}), so we need to keep it tag-safe and
    // prevent random URL params from creating junk tags.
    const cleanSource = source
      ? source.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30) || undefined
      : undefined;

    // Optional quiz result tags (band / focus area / age range) for
    // segmentation, validated against the quiz definition.
    const quizTags: string[] = [];
    if (quiz && typeof quiz === "object") {
      if (quiz.band && VALID_QUIZ_BANDS.has(quiz.band)) {
        quizTags.push(`quiz-band-${quiz.band}`);
      }
      if (quiz.focus && VALID_QUIZ_FOCUS.has(quiz.focus)) {
        quizTags.push(`quiz-focus-${quiz.focus}`);
      }
      if (quiz.age && VALID_QUIZ_AGES.has(quiz.age)) {
        quizTags.push(`quiz-age-${quiz.age}`);
      }
    }

    // Subscribe + apply 'lead' tag (triggers welcome sequence in Kit)
    // plus a 'from-{source}' tag for attribution, plus any quiz tags.
    if (quizTags.length > 0) {
      await subscribeAndTag(email, [
        "lead",
        `from-${cleanSource || "organic"}`,
        ...quizTags,
      ]);
    } else {
      await subscribeToConvertKit(email, cleanSource);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json(
      { error: "Subscription failed. Please try again." },
      { status: 500 }
    );
  }
}
