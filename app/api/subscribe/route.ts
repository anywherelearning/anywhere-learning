import { NextRequest, NextResponse } from "next/server";
import { subscribeToConvertKit } from "@/lib/convertkit";
import { strictLimiter, checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 requests per 60 seconds (prevents spam abuse)
    const limited = await checkRateLimit(request, strictLimiter());
    if (limited) return limited;

    const body = await request.json();
    const { email, source, guide } = body as {
      email: string;
      source?: string;
      guide?: string;
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

    // Sanitize guide the same way: becomes a `guide:{guide}` tag that triggers
    // the matching per-guide delivery automation in Kit.
    const cleanGuide = guide
      ? guide.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40) || undefined
      : undefined;

    // Subscribe + apply 'lead' tag (triggers welcome sequence in Kit)
    // plus a 'from-{source}' tag for attribution and, when set, a
    // 'guide:{guide}' tag that delivers that specific free guide.
    await subscribeToConvertKit(email, cleanSource, cleanGuide);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json(
      { error: "Subscription failed. Please try again." },
      { status: 500 }
    );
  }
}
