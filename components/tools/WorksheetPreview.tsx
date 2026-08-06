'use client';

import {
  PAGE,
  WORKSHEET_COLORS,
  WORKSHEET_FOOTER_TEXT,
  STYLE_FONTS,
  type WorksheetPage,
  type LetterStyle,
} from '@/lib/tools/worksheet-engine';

/**
 * Live worksheet preview. Renders the engine's page layout as SVG so the
 * geometry is identical to the PDF (same pt coordinates, scaled to fit).
 * Fonts load via the @font-face rules in app/globals.css (fonts/tools/*).
 */
export default function WorksheetPreview({
  pages,
  letterStyle,
}: {
  pages: WorksheetPage[];
  letterStyle: LetterStyle;
}) {
  const fontFamily = `'${STYLE_FONTS[letterStyle].family}', cursive`;

  if (pages.length === 0) {
    return (
      <div
        className="flex aspect-[612/792] w-full items-center justify-center rounded-lg border border-forest/15 bg-white shadow-sm"
        aria-label="Worksheet preview (empty)"
      >
        <p className="px-8 text-center text-sm text-gray-400">
          Type a name or word above and your worksheet will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" aria-label="Worksheet preview" role="img">
      {pages.map((page, pi) => (
        <svg
          key={pi}
          viewBox={`0 0 ${PAGE.width} ${PAGE.height}`}
          className="w-full rounded-lg border border-forest/15 bg-white shadow-sm"
          xmlns="http://www.w3.org/2000/svg"
        >
          {page.title && (
            <text
              x={PAGE.width / 2}
              y={PAGE.marginTop - 14}
              textAnchor="middle"
              fontSize={22}
              fontFamily={fontFamily}
              fill={WORKSHEET_COLORS.ink}
            >
              {page.title}
            </text>
          )}

          {page.rows.map((row, ri) => (
            <g key={ri}>
              {/* Numbered label (blank-test rows) */}
              {row.label && (
                <text
                  x={row.xStart - 26}
                  y={row.baseline}
                  fontSize={14}
                  fontFamily="'DM Sans', sans-serif"
                  fill={WORKSHEET_COLORS.ink}
                >
                  {row.label}
                </text>
              )}
              {/* Topline */}
              <line
                x1={row.xStart}
                x2={row.xEnd}
                y1={row.topline}
                y2={row.topline}
                stroke={WORKSHEET_COLORS.rule}
                strokeWidth={1}
              />
              {/* Dashed midline */}
              {row.midline !== null && (
                <line
                  x1={row.xStart}
                  x2={row.xEnd}
                  y1={row.midline}
                  y2={row.midline}
                  stroke={WORKSHEET_COLORS.midline}
                  strokeWidth={1}
                  strokeDasharray="6 5"
                />
              )}
              {/* Baseline */}
              <line
                x1={row.xStart}
                x2={row.xEnd}
                y1={row.baseline}
                y2={row.baseline}
                stroke={WORKSHEET_COLORS.rule}
                strokeWidth={1.4}
              />
              {row.words.map((word, wi) => (
                <text
                  key={wi}
                  x={word.x}
                  y={word.baseline}
                  fontSize={word.fontSize}
                  fontFamily={fontFamily}
                  fill={word.solid ? WORKSHEET_COLORS.ink : WORKSHEET_COLORS.trace}
                >
                  {word.text}
                </text>
              ))}
            </g>
          ))}

          {/* Branded footer */}
          <text
            x={PAGE.width / 2}
            y={PAGE.height - 24}
            textAnchor="middle"
            fontSize={9}
            fontFamily="'DM Sans', sans-serif"
            fill={WORKSHEET_COLORS.footer}
          >
            {WORKSHEET_FOOTER_TEXT}
          </text>
        </svg>
      ))}
    </div>
  );
}
