'use client';

import { useMemo } from 'react';
import { layoutWorksheet, type ToolId } from '@/lib/tools/worksheet-engine';
import type { WorksheetOptions } from './WorksheetControls';

/**
 * Shared plumbing for the worksheet tools: lay out the pages from the current
 * lines + options, and expose a download handler that lazy-loads jsPDF only
 * when the parent actually asks for the PDF.
 */
export function useWorksheet({
  tool,
  lines,
  options,
  title,
  filename,
}: {
  tool: ToolId;
  lines: string[];
  options: WorksheetOptions;
  title?: string;
  /** Saved PDF filename, without the .pdf extension. */
  filename: string;
}) {
  const pages = useMemo(() => {
    const cleaned = lines.map((l) => l.trim()).filter(Boolean);
    if (cleaned.length === 0) return [];
    return layoutWorksheet({ tool, lines: cleaned, title, ...options });
  }, [tool, lines, title, options]);

  async function handleDownload() {
    const { downloadWorksheetPdf } = await import('./pdf');
    await downloadWorksheetPdf({
      pages,
      letterStyle: options.letterStyle,
      filename: `${filename}.pdf`,
    });
  }

  return { pages, handleDownload };
}

/** Turn a textarea value into worksheet lines, capped so one paste can't
 *  generate a hundred-page PDF. */
export function parseLines(value: string, max = 20): string[] {
  return value
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, max);
}

/** Turn a textarea value into single words, split on whitespace and commas. */
export function parseWords(value: string, max = 60): string[] {
  return value
    .split(/[\s,]+/)
    .map((w) => w.trim())
    .filter(Boolean)
    .slice(0, max);
}

/** URL-safe slug for PDF filenames. */
export function toSlug(value: string, fallback: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || fallback;
}
