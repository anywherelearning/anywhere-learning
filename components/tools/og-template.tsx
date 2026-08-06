import { ImageResponse } from 'next/og';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Shared share-image template for the /tools generators: text panel on the
 * left, a mini worksheet mock on the right. Each tool's opengraph-image.tsx
 * supplies its own title, subtitle, and sample rows.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

const CREAM = '#faf9f6';
const FOREST = '#588157';
const GOLD = '#d4a373';
const INK = '#2f3a2c';
const TRACE = '#c8c6c0';

const fontDir = join(process.cwd(), 'public/fonts');
const dmSans = readFileSync(join(fontDir, 'DMSans-400.ttf'));
const dmSansBold = readFileSync(join(fontDir, 'DMSans-700.ttf'));

/** Worksheet fonts, keyed by the LetterStyle they correspond to. */
const WORKSHEET_FONTS = {
  print: { name: 'Andika', file: 'tools/Andika-Regular.ttf' },
  'pre-cursive': { name: 'Edu AU VIC WA NT Pre', file: 'tools/EduAUVICWANTPre.ttf' },
  cursive: { name: 'Learning Curve', file: 'tools/LearningCurve.ttf' },
} as const;

export function toolOgImage({
  title,
  subtitle,
  sampleRows,
  style = 'pre-cursive',
  sampleFontSize = 64,
}: {
  title: string;
  subtitle: string;
  /** Up to 3 short lines shown in the worksheet mock. */
  sampleRows: string[];
  style?: keyof typeof WORKSHEET_FONTS;
  sampleFontSize?: number;
}) {
  const worksheetFont = WORKSHEET_FONTS[style];
  const fontData = readFileSync(join(fontDir, worksheetFont.file));

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: CREAM,
          border: `16px solid ${FOREST}`,
          fontFamily: 'DM Sans',
        }}
      >
        {/* Left: text panel */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: 640,
            padding: '64px 56px',
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: GOLD,
            }}
          >
            Free tool · No signup
          </div>
          <div
            style={{
              marginTop: 20,
              fontSize: 62,
              fontWeight: 700,
              lineHeight: 1.1,
              color: INK,
            }}
          >
            {title}
          </div>
          <div style={{ marginTop: 24, fontSize: 28, color: '#5b6357', lineHeight: 1.4 }}>
            {subtitle}
          </div>
          <div style={{ marginTop: 40, fontSize: 24, fontWeight: 700, color: FOREST }}>
            anywherelearning.co/tools
          </div>
        </div>

        {/* Right: mini worksheet mock */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            padding: '48px 56px 48px 0',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'white',
              borderRadius: 16,
              padding: '40px 36px',
              boxShadow: '0 8px 30px rgba(47,58,44,0.18)',
            }}
          >
            {sampleRows.map((word, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: i === sampleRows.length - 1 ? 0 : 30,
                  borderTop: '2px solid #9b9891',
                  borderBottom: '3px solid #9b9891',
                  padding: '4px 8px 0',
                  minHeight: 40,
                }}
              >
                <div
                  style={{
                    fontFamily: worksheetFont.name,
                    fontSize: sampleFontSize,
                    lineHeight: 1.15,
                    color: i === 0 ? INK : TRACE,
                  }}
                >
                  {word}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'DM Sans', data: dmSans, weight: 400, style: 'normal' },
        { name: 'DM Sans', data: dmSansBold, weight: 700, style: 'normal' },
        { name: worksheetFont.name, data: fontData, weight: 400, style: 'normal' },
      ],
    },
  );
}
