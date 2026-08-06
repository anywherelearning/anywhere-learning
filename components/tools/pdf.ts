/**
 * Client-side PDF generation for the worksheet tools.
 *
 * Import this module dynamically (`await import('./pdf')`) so jsPDF and the
 * embedded fonts never land in the initial page bundle. Produces a real PDF
 * file download, which works cleanly on iOS Safari (unlike window.print).
 */

import {
  PAGE,
  WORKSHEET_COLORS,
  WORKSHEET_FOOTER_TEXT,
  STYLE_FONTS,
  type WorksheetPage,
  type LetterStyle,
} from '@/lib/tools/worksheet-engine';

// Font binaries are fetched once per session and cached here as base64.
const fontCache = new Map<string, string>();

async function fetchFontBase64(url: string): Promise<string> {
  const cached = fontCache.get(url);
  if (cached) return cached;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font fetch failed: ${url}`);
  const buffer = await res.arrayBuffer();

  // Convert in chunks — String.fromCharCode(...hugeArray) blows the stack.
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  const base64 = btoa(binary);
  fontCache.set(url, base64);
  return base64;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export async function downloadWorksheetPdf({
  pages,
  letterStyle,
  filename,
}: {
  pages: WorksheetPage[];
  letterStyle: LetterStyle;
  filename: string;
}): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const font = STYLE_FONTS[letterStyle];
  const fontBase64 = await fetchFontBase64(font.file);

  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const vfsName = `${font.family.replace(/\s/g, '')}.ttf`;
  doc.addFileToVFS(vfsName, fontBase64);
  doc.addFont(vfsName, font.family, 'normal');

  const ink = hexToRgb(WORKSHEET_COLORS.ink);
  const trace = hexToRgb(WORKSHEET_COLORS.trace);
  const rule = hexToRgb(WORKSHEET_COLORS.rule);
  const midline = hexToRgb(WORKSHEET_COLORS.midline);
  const footer = hexToRgb(WORKSHEET_COLORS.footer);

  pages.forEach((page, pi) => {
    if (pi > 0) doc.addPage('letter');

    if (page.title) {
      doc.setFont(font.family, 'normal');
      doc.setFontSize(22);
      doc.setTextColor(...ink);
      doc.text(page.title, PAGE.width / 2, PAGE.marginTop - 14, { align: 'center' });
    }

    for (const row of page.rows) {
      // Topline
      doc.setDrawColor(...rule);
      doc.setLineWidth(1);
      doc.setLineDashPattern([], 0);
      doc.line(row.xStart, row.topline, row.xEnd, row.topline);

      // Dashed midline
      if (row.midline !== null) {
        doc.setDrawColor(...midline);
        doc.setLineDashPattern([6, 5], 0);
        doc.line(row.xStart, row.midline, row.xEnd, row.midline);
        doc.setLineDashPattern([], 0);
      }

      // Baseline
      doc.setDrawColor(...rule);
      doc.setLineWidth(1.4);
      doc.line(row.xStart, row.baseline, row.xEnd, row.baseline);

      doc.setFont(font.family, 'normal');
      for (const word of row.words) {
        doc.setFontSize(word.fontSize);
        doc.setTextColor(...(word.solid ? ink : trace));
        doc.text(word.text, word.x, word.baseline);
      }
    }

    // Branded footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...footer);
    doc.text(WORKSHEET_FOOTER_TEXT, PAGE.width / 2, PAGE.height - 24, { align: 'center' });
  });

  doc.save(filename);
}
