import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
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

    // Send subscriber to Kit (ConvertKit)
    const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY;
    const CONVERTKIT_FORM_ID = process.env.CONVERTKIT_FORM_ID;

    if (!CONVERTKIT_API_KEY || !CONVERTKIT_FORM_ID) {
      console.error("Missing CONVERTKIT_API_KEY or CONVERTKIT_FORM_ID env variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const res = await fetch(
      `https://api.convertkit.com/v3/forms/${CONVERTKIT_FORM_ID}/subscribe`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: CONVERTKIT_API_KEY,
          email,
        }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error("ConvertKit API error:", res.status, errorData);
      return NextResponse.json(
        { error: "Subscription failed. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
