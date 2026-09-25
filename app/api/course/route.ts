import { NextRequest, NextResponse, after } from "next/server";
import { subscribeAndTag } from "@/lib/convertkit";
import { cleanEventId, sendMetaLead } from "@/lib/meta-capi";
import { strictLimiter, checkRateLimit } from "@/lib/rate-limit";
import { COURSE } from "@/lib/course";

/**
 * Free 5-day email course signup ("Real-World Learning in 5 Days").
 *
 * Tags applied (no generic `lead` tag, so signups get the course sequence,
 * not the 7-day free guide funnel):
 *   course-rwl     - starts the Kit course sequence
 *   from-{source}  - where the signup came from (meta-ads, ig-*, homepage...)
 */
export async function POST(request: NextRequest) {
  try {
    // Signups are closed until the Kit sequence exists. Mirrors the 404 on
    // /course so a direct POST cannot slip someone into an empty course.
    if (!COURSE.isLive) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Rate limit: 5 requests per 60 seconds (mirrors /api/subscribe).
    const limited = await checkRateLimit(request, strictLimiter());
    if (limited) return limited;

    const body = await request.json();
    const { email, source, metaEventId } = body as {
      email: string;
      source?: string;
      /** Browser pixel event id, so the server-side Lead dedupes against it. */
      metaEventId?: string;
    };

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
      COURSE.signupTag,
      `from-${cleanSource || "course"}`,
    ]);

    // Server-side Meta Lead (Conversions API), same id as the browser pixel so
    // Meta counts it once. After the response, best-effort.
    const leadEventId = cleanEventId(metaEventId);
    if (leadEventId) {
      after(() =>
        sendMetaLead({
          eventId: leadEventId,
          email,
          source: cleanSource ? `course:${cleanSource}` : "course",
          request,
        }),
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Course subscribe error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
