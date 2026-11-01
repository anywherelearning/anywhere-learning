'use client';

/**
 * Chooses the reader for a guide. Phones get the step-by-step reader when the
 * guide has a content file; desktops and guides without one get the PDF pages.
 * Either way the other view is one tap away.
 */

import { useEffect, useState } from 'react';
import PdfViewer from '@/components/account/PdfViewer';
import StepReader from '@/components/account/StepReader';
import type { GuideContent } from '@/lib/guide-content';

type Props = React.ComponentProps<typeof PdfViewer> & { guide: GuideContent | null };

export default function GuideReader({ guide, ...pdfProps }: Props) {
  const [mode, setMode] = useState<'steps' | 'pdf' | null>(guide ? null : 'pdf');

  useEffect(() => {
    if (!guide) return;
    const params = new URLSearchParams(window.location.search);
    const asked = params.get('view');
    setMode(asked === 'pdf' || asked === 'steps' ? asked : window.matchMedia('(max-width: 959px)').matches ? 'steps' : 'pdf');
  }, [guide]);

  if (!mode) return <main style={{ minHeight: '100vh', background: 'linear-gradient(180deg,var(--am-bg1),var(--am-bg2))' }} />;

  if (mode === 'steps' && guide) {
    return (
      <StepReader
        guide={guide}
        title={pdfProps.title}
        tier={pdfProps.tier}
        imageUrl={pdfProps.imageUrl}
        trialEndsAt={pdfProps.trialEndsAt}
        priceLabel={pdfProps.priceLabel}
        isFounder={pdfProps.isFounder}
        onShowPdf={() => setMode('pdf')}
      />
    );
  }
  return <PdfViewer {...pdfProps} onShowSteps={guide ? () => setMode('steps') : undefined} />;
}
