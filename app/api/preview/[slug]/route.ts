import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { getPreviewFileName } from '@/lib/preview-map';

/**
 * Serve preview PDF for a product.
 * Dev: reads from the local Activities/Previews folder.
 * Prod: will read from Vercel Blob (previewBlobUrl) once uploaded.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const fileName = getPreviewFileName(slug);

  if (!fileName) {
    return NextResponse.json({ error: 'Preview not found' }, { status: 404 });
  }

  // Dev: read from local filesystem
  const previewDir =
    process.env.PREVIEW_PDF_DIR ||
    '/Users/ameliedrouin/Desktop/Anywhere Learning/Previews';

  const filePath = path.join(previewDir, fileName);

  try {
    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800',
        'Content-Disposition': `inline; filename="${encodeURIComponent(fileName)}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Preview file not found' }, { status: 404 });
  }
}
