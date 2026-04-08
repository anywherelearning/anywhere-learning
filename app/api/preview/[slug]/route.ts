import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { getPreviewFileName } from '@/lib/preview-map';
import { relaxedLimiter, checkRateLimit } from '@/lib/rate-limit';

/**
 * Serve preview PDF for a product.
 * Dev: reads from the local Activities/Previews folder (set PREVIEW_PDF_DIR).
 * Prod: will read from Vercel Blob (previewBlobUrl) once uploaded.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  // Rate limit: 30 req / 60s - public endpoint with file I/O
  const limited = await checkRateLimit(req, relaxedLimiter());
  if (limited) return limited;

  const { slug } = await params;
  const fileName = getPreviewFileName(slug);

  if (!fileName) {
    return NextResponse.json({ error: 'Preview not found' }, { status: 404 });
  }

  // ── SECURITY: Require explicit env var - never leak a dev home path ──
  const previewDir = process.env.PREVIEW_PDF_DIR;
  if (!previewDir) {
    console.error('PREVIEW_PDF_DIR is not set - cannot serve local previews');
    return NextResponse.json({ error: 'Preview not available' }, { status: 404 });
  }

  // ── SECURITY: Sanitize filename and validate resolved path ──
  // Strip any directory components to prevent path traversal
  const sanitized = path.basename(fileName);
  const resolvedDir = path.resolve(previewDir);
  const filePath = path.resolve(resolvedDir, sanitized);

  // Ensure the resolved path is still inside the preview directory
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
