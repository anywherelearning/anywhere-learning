/**
 * Serves the pictures the step reader shows: the watercolour card clipart
 * (guides/clipart/wc) and the guide photos (guides/assets). These live beside
 * the guide content files rather than in public/, so the PDF renderer and the
 * reader share one copy.
 */

import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';

const TYPES: Record<string, string> = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path;
  const [dir, name] = parts;
  const type = name ? TYPES[path.extname(name).toLowerCase()] : undefined;
  if (parts.length !== 2 || (dir !== 'wc' && dir !== 'assets') || !type || !/^[\w.-]+$/.test(name)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  try {
    // Literal folders so the build only bundles these two picture folders.
    const file = dir === 'wc'
      ? path.join(process.cwd(), 'guides', 'clipart', 'wc', name)
      : path.join(process.cwd(), 'guides', 'assets', name);
    const buf = await fs.readFile(file);
    return new NextResponse(new Uint8Array(buf), {
      headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
