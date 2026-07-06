import { ImageResponse } from 'next/og';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Generated share image for the quiz page (og:image + twitter:image).
// Replaces the old free-guide graphic that Facebook was pulling.
export const alt =
  "What's Your Kid's Missing Life Skill? A free 2-minute quiz from Anywhere Learning.";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Brand palette
const CREAM = '#faf9f6';
const FOREST = '#588157';
const TERRACOTTA = '#c4836a';
const INK = '#2f3a2c';

const fontDir = join(process.cwd(), 'public/fonts');
const dmSans = readFileSync(join(fontDir, 'DMSans-400.ttf'));
const dmSansBold = readFileSync(join(fontDir, 'DMSans-700.ttf'));

const photo = readFileSync(
  join(process.cwd(), 'public/images/kitchen-learning-lab-pizza.jpeg'),
);
const photoSrc = `data:image/jpeg;base64,${photo.toString('base64')}`;

const logo = readFileSync(join(process.cwd(), 'public/logo-text-v2.png'));
const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

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
            justifyContent: 'space-between',
            width: 700,
            padding: '64px 56px',
          }}
        >
          {/* Top label */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 3.5,
              textTransform: 'uppercase',
              color: TERRACOTTA,
            }}
          >
            <div style={{ width: 40, height: 3, backgroundColor: TERRACOTTA, display: 'flex' }} />
            Free 2-minute quiz
          </div>

          {/* Headline in bold DM Sans */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                fontSize: 66,
                fontWeight: 700,
                color: INK,
                lineHeight: 1.05,
              }}
            >
              What&apos;s your kid&apos;s
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 66,
                fontWeight: 700,
                color: FOREST,
                lineHeight: 1.05,
              }}
            >
              missing life skill?
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: 26,
                fontSize: 27,
                fontWeight: 400,
                color: '#5b6357',
                lineHeight: 1.35,
                maxWidth: 520,
              }}
            >
              Find your kid&apos;s type and the one skill to focus on next.
            </div>
          </div>

          {/* Footer logo */}
          <img src={logoSrc} width={300} height={180} style={{ marginLeft: -10, marginBottom: -46, marginTop: -46 }} />
        </div>

        {/* Right: photo */}
        <div style={{ display: 'flex', flex: 1, height: '100%' }}>
          <img
            src={photoSrc}
            width={468}
            height={598}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'DM Sans', data: dmSans, weight: 400, style: 'normal' },
        { name: 'DM Sans', data: dmSansBold, weight: 700, style: 'normal' },
      ],
    },
  );
}
