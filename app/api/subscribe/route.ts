import { NextRequest, NextResponse } from "next/server";
import { subscribeToConvertKit } from "@/lib/convertkit";
import { strictLimiter, checkRateLimit } from "@/lib/rate-limit";
import { claimGuide } from "@/lib/guide-claims";
import { getFreeActivityBySlug } from "@/lib/ideas-free-activity";

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 requests per 60 seconds (prevents spam abuse)
    const limited = await checkRateLimit(request, strictLimiter());
    if (limited) return limited;

    const body = await request.json();
    const { email, source, guide, oncePerEmail } = body as {
      email: string;
      source?: string;
      guide?: string;
      /** Set by the idea-list capture: enforce one free activity per address. */
      oncePerEmail?: boolean;
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

    // The idea lists each give away a different complete activity, so without a
    // ledger one person could walk all eight category pages and collect the lot.
    // First claim wins; a later one is told what it already has. Fails open, so
    // a database problem costs a guide rather than a subscriber.
    let priorClaim: { slug: string; name: string; downloadUrl: string } | null =
      null;

    if (oncePerEmail && cleanGuide) {
      const claim = await claimGuide(email, cleanGuide, cleanSource);
      if (claim.status === 'already-claimed') {
        const prior = getFreeActivityBySlug(claim.activitySlug);
        if (prior) {
          priorClaim = {
            slug: prior.slug,
            name: prior.name,
            downloadUrl: prior.downloadUrl,
          };
        }
      }
    }

    // Subscribe + apply 'lead' tag (triggers welcome sequence in Kit)
    // plus a 'from-{source}' tag for attribution and, when set, a
    // 'guide:{guide}' tag that delivers that specific free guide.
    //
    // When they've already claimed, the guide tag is withheld: it would trigger
    // that guide's Kit delivery automation and hand over a second one by email.
    // They still get subscribed and re-tagged with the source for attribution.
    await subscribeToConvertKit(
      email,
      cleanSource,
      priorClaim ? undefined : cleanGuide,
    );

    return NextResponse.json({ success: true, alreadyClaimed: priorClaim });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json(
      { error: "Subscription failed. Please try again." },
      { status: 500 }
    );
  }
}
