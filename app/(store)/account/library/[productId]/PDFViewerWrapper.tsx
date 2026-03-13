'use client';

import dynamic from 'next/dynamic';

const PDFViewer = dynamic(() => import('@/components/account/PDFViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <div className="w-8 h-8 border-2 border-forest/30 border-t-forest rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Loading viewer&hellip;</p>
    </div>
  ),
});

export default function PDFViewerWrapper({
  productId,
  productName,
  canDownload,
}: {
  productId: string;
  productName: string;
  canDownload: boolean;
}) {
  return (
    <PDFViewer
      productId={productId}
      productName={productName}
      canDownload={canDownload}
    />
  );
}
