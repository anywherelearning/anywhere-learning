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

export type LetterStyle = 'print' | 'pre-cursive' | 'cursive';
export type LetterSize = 'large' | 'medium' | 'small';

/**
 * Row layout per line entry:
 * - 'trace': rowsPerLine tracing rows
 * - 'trace-and-write': tracing rows followed by one empty freehand row
 * - 'blank-test': one numbered empty row per word (parent reads the word
 *   aloud, child writes it, the classic Friday spelling test)
 */
export type WorksheetFormat = 'trace' | 'trace-and-write' | 'blank-test';

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
  /** Row layout per line entry. Defaults to 'trace'. */
  format?: WorksheetFormat;
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
  /** Small label left of the row, e.g. "1." on blank-test rows. */
  label?: string;
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
  'pre-cursive': 0.5, // Edu AU VIC WA NT Pre (Victorian pre-cursive)
  cursive: 0.44, // Learning Curve (joined script runs narrow)
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

  const format = config.format ?? 'trace';

  const nextRowGeometry = () => {
    // Page break when the next row's baseline would cross the bottom margin.
    if (y + preset.rowHeight > PAGE.height - PAGE.marginBottom) pushPage();
    const topline = y;
    const baseline = y + preset.rowHeight;
    const midline = config.showMidline ? y + preset.rowHeight * 0.5 : null;
    y = baseline + preset.gap;
    return { topline, midline, baseline };
  };

  lines.forEach((line, li) => {
    if (format === 'blank-test') {
      // One numbered empty row per word; the word itself never prints.
      rows.push({ ...nextRowGeometry(), xStart, xEnd, words: [], label: `${li + 1}.` });
    } else {
      // Shrink long words so at least one copy always fits the row.
      const rawWidth = estimateWordWidth(line, preset.fontSize, config.letterStyle);
      const fontSize =
        rawWidth > usableWidth
          ? Math.max(14, preset.fontSize * (usableWidth / rawWidth))
          : preset.fontSize;
      const wordWidth = Math.min(rawWidth, usableWidth);
      const copies = Math.max(1, Math.floor((usableWidth + WORD_GAP) / (wordWidth + WORD_GAP)));

      for (let r = 0; r < config.rowsPerLine; r++) {
        const geometry = nextRowGeometry();

        const words: WorksheetWord[] = [];
        for (let c = 0; c < copies; c++) {
          words.push({
            text: line,
            x: xStart + c * (wordWidth + WORD_GAP),
            baseline: geometry.baseline,
            // When only one copy fits per row, the solid model takes the whole
            // first row and every later row stays pale and traceable.
            solid: config.modelFirst && c === 0 && (copies > 1 || r === 0),
            fontSize,
          });
        }

        rows.push({ ...geometry, xStart, xEnd, words });
      }
      if (format === 'trace-and-write') {
        // Freehand row: same guides, no words.
        rows.push({ ...nextRowGeometry(), xStart, xEnd, words: [] });
      }
    }
    // Extra breathing room between word groups.
    y += preset.groupGap - preset.gap;
  });

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
  'pre-cursive': { family: 'Edu AU VIC WA NT Pre', file: '/fonts/tools/EduAUVICWANTPre.ttf' },
  cursive: { family: 'Learning Curve', file: '/fonts/tools/LearningCurve.ttf' },
};
