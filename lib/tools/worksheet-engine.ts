/**
 * Shared worksheet layout engine for the free /tools generators.
 *
 * Pure geometry: takes a WorksheetConfig and returns positioned pages in
 * points (1pt = 1/72in) on US Letter. Both the live HTML preview and the
 * jsPDF download consume the same output, so the preview is exactly what
 * prints. No DOM, no side effects — unit-testable.
 */

// ─── Page geometry (US Letter, points) ──────────────────────────────

export const PAGE = {
  width: 612, // 8.5in
  height: 792, // 11in
  marginX: 54, // 0.75in
  marginTop: 64,
  marginBottom: 56, // leaves room for the branded footer line
} as const;

// ─── Config ──────────────────────────────────────────────────────────

export type ToolId = 'name-tracing' | 'handwriting' | 'sight-words' | 'spelling';

export type LetterStyle = 'print' | 'pre-cursive';
export type LetterSize = 'large' | 'medium' | 'small';

export interface WorksheetConfig {
  tool: ToolId;
  /** Words or short sentences; one entry = one group of practice rows. */
  lines: string[];
  letterStyle: LetterStyle;
  letterSize: LetterSize;
  /** Practice rows per line entry (model + tracing copies live inside a row). */
  rowsPerLine: number;
  /** Dashed midline between baseline and topline (standard school rule). */
  showMidline: boolean;
  /** First word in each row is solid; the rest are pale tracing copies. */
  modelFirst: boolean;
  /** Optional page title, e.g. the child's name on name-tracing sheets. */
  title?: string;
}

// ─── Layout output ────────────────────────────────────────────────────

export interface WorksheetWord {
  text: string;
  x: number;
  /** Baseline y-position in page coordinates. */
  baseline: number;
  /** True = solid model word; false = pale tracing copy. */
  solid: boolean;
  fontSize: number;
}

export interface WorksheetRow {
  /** Top rule (ascender line). */
  topline: number;
  /** Dashed middle rule (x-height line); null when hidden. */
  midline: number | null;
  /** Bottom rule (baseline). */
  baseline: number;
  xStart: number;
  xEnd: number;
  words: WorksheetWord[];
}

export interface WorksheetPage {
  title?: string;
  rows: WorksheetRow[];
}

// ─── Size presets ────────────────────────────────────────────────────
//
// rowHeight = topline→baseline distance. fontSize is tuned so the font's
// x-height sits close to the midline for each of the two tool fonts.
// gap = space between rows within a group; groupGap separates line entries.

const SIZE_PRESETS: Record<LetterSize, { rowHeight: number; fontSize: number; gap: number; groupGap: number }> = {
  large: { rowHeight: 72, fontSize: 58, gap: 26, groupGap: 34 },
  medium: { rowHeight: 54, fontSize: 44, gap: 22, groupGap: 28 },
  small: { rowHeight: 40, fontSize: 32, gap: 18, groupGap: 24 },
};

/**
 * Approximate advance-width factor (em-relative) for the two worksheet
 * fonts. Used to estimate how many copies of a word fit on a row; the
 * renderer measures precisely, but layout only needs a safe estimate.
 */
const AVG_CHAR_WIDTH_EM: Record<LetterStyle, number> = {
  print: 0.52, // Andika
  'pre-cursive': 0.5, // Edu QLD Beginner
};

/** Gap between repeated copies of a word on the same row, in pt. */
const WORD_GAP = 30;

export function estimateWordWidth(text: string, fontSize: number, style: LetterStyle): number {
  return text.length * fontSize * AVG_CHAR_WIDTH_EM[style];
}

// ─── Layout ──────────────────────────────────────────────────────────

export function layoutWorksheet(config: WorksheetConfig): WorksheetPage[] {
  const preset = SIZE_PRESETS[config.letterSize];
  const lines = config.lines.map((l) => l.trim()).filter(Boolean);
  const xStart = PAGE.marginX;
  const xEnd = PAGE.width - PAGE.marginX;
  const usableWidth = xEnd - xStart;

  const pages: WorksheetPage[] = [];
  let rows: WorksheetRow[] = [];
  // Title consumes vertical space on the first page only.
  let y = config.title ? PAGE.marginTop + 44 : PAGE.marginTop;

  const pushPage = () => {
    if (rows.length === 0) return;
    pages.push({ title: pages.length === 0 ? config.title : undefined, rows });
    rows = [];
    y = PAGE.marginTop;
  };

  for (const line of lines) {
    for (let r = 0; r < config.rowsPerLine; r++) {
      // Page break when the next row's baseline would cross the bottom margin.
      if (y + preset.rowHeight > PAGE.height - PAGE.marginBottom) pushPage();

      const topline = y;
      const baseline = y + preset.rowHeight;
      const midline = config.showMidline ? y + preset.rowHeight * 0.5 : null;

      const wordWidth = estimateWordWidth(line, preset.fontSize, config.letterStyle);
      // Always render at least one copy, even if the word overflows the row.
      const copies = Math.max(1, Math.floor((usableWidth + WORD_GAP) / (wordWidth + WORD_GAP)));

      const words: WorksheetWord[] = [];
      for (let c = 0; c < copies; c++) {
        words.push({
          text: line,
          x: xStart + c * (wordWidth + WORD_GAP),
          baseline,
          solid: config.modelFirst && c === 0,
          fontSize: preset.fontSize,
        });
      }

      rows.push({ topline, midline, baseline, xStart, xEnd, words });
      y = baseline + preset.gap;
    }
    // Extra breathing room between word groups.
    y += preset.groupGap - preset.gap;
  }

  pushPage();
  return pages;
}

// ─── Shared rendering constants (preview + PDF must match) ───────────

export const WORKSHEET_COLORS = {
  /** Solid rules and model words. */
  ink: '#3a3a3a',
  /** Pale tracing copies. */
  trace: '#c8c6c0',
  /** Rule lines. */
  rule: '#9b9891',
  /** Dashed midline. */
  midline: '#c0bdb5',
  footer: '#8a8a8a',
} as const;

export const WORKSHEET_FOOTER_TEXT = 'Meaningful Learning, Wherever You Are · anywherelearning.co';

/** Font family names as registered in both the preview @font-face and jsPDF. */
export const STYLE_FONTS: Record<LetterStyle, { family: string; file: string }> = {
  print: { family: 'Andika', file: '/fonts/tools/Andika-Regular.ttf' },
  'pre-cursive': { family: 'Edu QLD Beginner', file: '/fonts/tools/EduQLDBeginner.ttf' },
};
