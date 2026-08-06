import { ImageResponse } from 'next/og';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Share image for /tools/name-tracing (og:image + twitter:image).
export const alt = 'Free Name Tracing Worksheet Generator by Anywhere Learning.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const CREAM = '#faf9f6';
const FOREST = '#588157';
const GOLD = '#d4a373';
const INK = '#2f3a2c';
const TRACE = '#c8c6c0';

const fontDir = join(process.cwd(), 'public/fonts');
const dmSans = readFileSync(join(fontDir, 'DMSans-400.ttf'));
const dmSansBold = readFileSync(join(fontDir, 'DMSans-700.ttf'));
const eduFont = readFileSync(join(process.cwd(), 'public/fonts/tools/EduQLDBeginner.ttf'));

export default function Image() {
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
            Name Tracing Worksheet Generator
          </div>
          <div style={{ marginTop: 24, fontSize: 28, color: '#5b6357', lineHeight: 1.4 }}>
            Type any name. Print in seconds.
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
            {['Maple', 'Maple', 'Maple'].map((word, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: i === 2 ? 0 : 30,
                  borderTop: '2px solid #9b9891',
                  borderBottom: '3px solid #9b9891',
                  padding: '4px 8px 0',
                }}
              >
                <div
                  style={{
                    fontFamily: 'Edu QLD Beginner',
                    fontSize: 64,
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
      ...size,
      fonts: [
        { name: 'DM Sans', data: dmSans, weight: 400, style: 'normal' },
        { name: 'DM Sans', data: dmSansBold, weight: 700, style: 'normal' },
        { name: 'Edu QLD Beginner', data: eduFont, weight: 400, style: 'normal' },
      ],
    },
  );
}
