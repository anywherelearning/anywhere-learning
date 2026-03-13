import { NextRequest, NextResponse } from "next/server";
import { subscribeToConvertKit } from "@/lib/convertkit";
import { strictLimiter, checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 requests per 60 seconds (prevents spam abuse)
    const limited = await checkRateLimit(request, strictLimiter());
    if (limited) return limited;

    const body = await request.json();
    const { email } = body as { email: string };

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email" },
        { status: 400 }
      );
    }

    // Subscribe + apply 'lead' tag (triggers welcome sequence in Kit)
    await subscribeToConvertKit(email);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json(
      { error: "Subscription failed. Please try again." },
      { status: 500 }
    );
  }
}
