import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { streamBlobToResponse } from '@/lib/blob';
import { getPreviewFileName } from '@/lib/preview-map';
import { relaxedLimiter, checkRateLimit } from '@/lib/rate-limit';

/**
 * Serve preview PDF for a product.
 *
 * Prod: reads from Vercel Blob via products.previewBlobUrl, streamed through
 *       this route so the raw Blob URL is never exposed to clients.
 * Dev:  falls back to the local Previews folder when PREVIEW_PDF_DIR is set
 *       and the DB has no previewBlobUrl yet.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  // Rate limit: 30 req / 60s. Public endpoint with file I/O
  const limited = await checkRateLimit(req, relaxedLimiter());
  if (limited) return limited;

  const { slug } = await params;

  // ── 1. Try Blob first (production path) ──
  let previewBlobUrl: string | null = null;
  try {
    const row = await db
      .select({ previewBlobUrl: products.previewBlobUrl })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);
    previewBlobUrl = row[0]?.previewBlobUrl ?? null;
  } catch {
    // DB unavailable. Fall through to local fallback
  }

  if (previewBlobUrl && previewBlobUrl.startsWith('https://')) {
    try {
      const blobResponse = await streamBlobToResponse(previewBlobUrl);
      const contentLength = blobResponse.headers.get('content-length');
      const headers: Record<string, string> = {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800',
        'Content-Disposition': `inline; filename="${slug}-preview.pdf"`,
      };
      if (contentLength) headers['Content-Length'] = contentLength;
      return new NextResponse(blobResponse.body, { headers });
    } catch (err) {
      console.error('Failed to stream preview from Blob:', slug, err);
      // fall through to local fallback
    }
  }

  // ── 2. Local fallback (dev only) ──
  const fileName = getPreviewFileName(slug);
  if (!fileName) {
    return NextResponse.json({ error: 'Preview not found' }, { status: 404 });
  }

  const previewDir = process.env.PREVIEW_PDF_DIR;
  if (!previewDir) {
    return NextResponse.json({ error: 'Preview not available' }, { status: 404 });
  }

  // SECURITY: sanitize filename and validate resolved path
  const sanitized = path.basename(fileName);
  const resolvedDir = path.resolve(previewDir);
  const filePath = path.resolve(resolvedDir, sanitized);
  if (!filePath.startsWith(resolvedDir + path.sep) && filePath !== resolvedDir) {
    console.error('Path traversal attempt blocked:', { slug, fileName, filePath });
    return NextResponse.json({ error: 'Preview not found' }, { status: 404 });
  }

  try {
    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800',
        'Content-Disposition': `inline; filename="${encodeURIComponent(sanitized)}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Preview file not found' }, { status: 404 });
  }
}
