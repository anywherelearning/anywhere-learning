import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const MAX_LEN = {
  name: 100,
  email: 200,
  topic: 50,
  message: 5000,
};

const TOPIC_LABELS: Record<string, string> = {
  membership: 'Question about the membership',
  activity: 'Question about a specific activity',
  account: 'Help with my account or download',
  refund: 'Refund request',
  hi: 'Just saying hi',
  other: 'Press, partnership, or something else',
};

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name || '').trim().slice(0, MAX_LEN.name);
    const email = String(body?.email || '').trim().slice(0, MAX_LEN.email);
    const topic = String(body?.topic || '').trim().slice(0, MAX_LEN.topic);
    const message = String(body?.message || '').trim().slice(0, MAX_LEN.message);
    const honeypot = String(body?.website || '').trim();

    // Honeypot: silently succeed for bots
    if (honeypot) {
      return NextResponse.json({ ok: true });
    }

    if (!name || !email || !topic || !message) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 },
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      // No-op success in dev so the form still works locally
      return NextResponse.json({ ok: true, dev: true });
    }

    const topicLabel = TOPIC_LABELS[topic] || topic;
    const subject = `[Contact] ${topicLabel} from ${name}`;
    const text = `From: ${name} <${email}>\nTopic: ${topicLabel}\n\n${message}`;
    const html = `
      <div style="font-family:system-ui,sans-serif;line-height:1.6;color:#2D3A2E">
        <h2 style="margin:0 0 12px;font-family:Georgia,serif">New contact message</h2>
        <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
        <p><strong>Topic:</strong> ${escapeHtml(topicLabel)}</p>
        <hr style="border:0;border-top:1px solid #D8D4C5;margin:16px 0" />
        <pre style="white-space:pre-wrap;font-family:system-ui,sans-serif;font-size:15px;line-height:1.65;color:#4F5A50">${escapeHtml(message)}</pre>
      </div>
    `;

    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: 'Anywhere Learning Contact <hello@anywherelearning.co>',
      to: ['info@anywherelearning.co'],
      replyTo: email,
      subject,
      text,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return NextResponse.json(
      { error: 'Something went wrong sending your message. Please try again.' },
      { status: 500 },
    );
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
