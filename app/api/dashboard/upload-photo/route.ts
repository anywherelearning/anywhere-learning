import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getDashboardUserId } from '@/lib/dashboard-session';

export const runtime = 'nodejs';

// 8 MB per photo cap (post-image is usually well under this from phones)
const MAX_BYTES = 8 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

export async function POST(req: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Photo storage is not configured' },
      { status: 500 }
    );
  }

  const userId = await getDashboardUserId();
  const form = await req.formData();
  const file = form.get('file');

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const type = file.type || 'image/jpeg';
  if (!ALLOWED_TYPES.has(type)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${type}` },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large. Max ${MAX_BYTES / 1024 / 1024} MB.` },
      { status: 413 }
    );
  }

  const ext = type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
  const safeUser = userId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'anon';
  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `dashboard/${safeUser}/${stamp}-${rand}.${ext}`;

  try {
    // addRandomSuffix MUST stay true. These are photos of children's work.
    // A random suffix makes the URL cryptographically unguessable so it
    // cannot be enumerated from the user id + timestamp. (A full private +
    // signed-URL rebuild is the planned V2 hardening; until then, an
    // unguessable public URL plus the "photograph the work, not faces"
    // guidance in PhotoUploader is the launch posture.)
    const blob = await put(path, file, {
      access: 'public',
      contentType: type,
      addRandomSuffix: true,
    });
    return NextResponse.json({ url: blob.url, size: file.size, type });
  } catch (err) {
    console.error('[upload-photo] failed:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
