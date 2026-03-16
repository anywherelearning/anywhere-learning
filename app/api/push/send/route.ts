import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { deviceTokens } from '@/lib/db/schema';

/**
 * Send push notification to all registered devices.
 * Protected by PUSH_API_KEY — for admin/script use only.
 *
 * Usage:
 *   curl -X POST https://anywherelearning.co/api/push/send \
 *     -H "Authorization: Bearer YOUR_PUSH_API_KEY" \
 *     -H "Content-Type: application/json" \
 *     -d '{"title": "New Activity Pack!", "body": "Check out our latest...", "url": "/shop"}'
 *
 * For v1, this is a placeholder that returns the list of tokens.
 * Actual push delivery will be added when Firebase/APNS is configured.
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate with API key
    const authHeader = req.headers.get('authorization');
    const apiKey = process.env.PUSH_API_KEY;

    if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, body: messageBody, url } = body;

    if (!title || !messageBody) {
      return NextResponse.json({ error: 'Missing title or body' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    // Get all registered tokens (only fetch needed columns)
    const tokens = await db.select({ token: deviceTokens.token, platform: deviceTokens.platform }).from(deviceTokens);

    if (tokens.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No registered devices' });
    }

    // TODO: Integrate with Firebase Cloud Messaging (FCM) to actually deliver push notifications.
    // For now, return the count of tokens that would receive the push.
    //
    // When ready, install `firebase-admin` and use:
    //   const message = { notification: { title, body: messageBody }, data: { url }, tokens: [...] };
    //   await admin.messaging().sendEachForMulticast(message);

    return NextResponse.json({
      sent: tokens.length,
      message: `Push would be sent to ${tokens.length} device(s)`,
      payload: { title, body: messageBody, url: url || '/shop' },
    });
  } catch (error) {
    console.error('Push send error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
