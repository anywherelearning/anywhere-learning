'use client';

import { useMemo, useState } from 'react';
import { layoutWorksheet, type WorksheetConfig } from '@/lib/tools/worksheet-engine';
import WorksheetControls, { type WorksheetOptions } from './WorksheetControls';
import WorksheetPreview from './WorksheetPreview';
import DownloadModal from './DownloadModal';

/**
 * Name tracing worksheet generator. The interactive heart of
 * /tools/name-tracing and /embed/name-tracing.
 */
export default function NameTracingTool({
  /** Pre-loaded settings for the long-tail variation pages. */
  defaultOptions,
  /** Compact mode for the embed route: tighter spacing, no outer card. */
  embed = false,
}: {
  defaultOptions?: Partial<WorksheetOptions>;
  embed?: boolean;
}) {
  const [name, setName] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [options, setOptions] = useState<WorksheetOptions>({
    letterStyle: 'pre-cursive',
    letterSize: 'large',
    rowsPerLine: 5,
    showMidline: true,
    modelFirst: true,
    ...defaultOptions,
  });

  const pages = useMemo(() => {
    const trimmed = name.trim();
    if (!trimmed) return [];
    const config: WorksheetConfig = {
      tool: 'name-tracing',
      lines: [trimmed],
      ...options,
    };
    return layoutWorksheet(config);
  }, [name, options]);

  async function handleDownload() {
    const { downloadWorksheetPdf } = await import('./pdf');
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'name';
    await downloadWorksheetPdf({
      pages,
      letterStyle: options.letterStyle,
      filename: `${slug}-name-tracing-worksheet.pdf`,
    });
  }

  const inner = (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <div className="space-y-6">
        <div>
          <label htmlFor="tracing-name" className="mb-1.5 block text-sm font-semibold text-forest-dark">
            Child&apos;s name
          </label>
          <input
            id="tracing-name"
            type="text"
            maxLength={40}
            placeholder="e.g. Maple"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-full border border-gray-300 bg-white px-5 py-3 text-lg focus:border-forest focus:outline-2 focus:outline-forest/40"
          />
        </div>

        <WorksheetControls options={options} onChange={setOptions} />

        <button
          type="button"
          disabled={pages.length === 0}
          onClick={() => setModalOpen(true)}
          className="w-full rounded-full bg-forest px-6 py-3.5 text-base font-semibold text-white transition hover:bg-forest-dark focus:outline-2 focus:outline-offset-2 focus:outline-forest disabled:cursor-not-allowed disabled:opacity-50"
        >
          Get the PDF
        </button>
      </div>

      <WorksheetPreview pages={pages} letterStyle={options.letterStyle} />
    </div>
  );

  return (
    <>
      {embed ? (
        inner
      ) : (
        <div className="rounded-2xl border border-forest/10 bg-warm-gray p-6 sm:p-8">{inner}</div>
      )}
      <DownloadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onDownload={handleDownload}
        source="tool-name-tracing"
        toolName="name tracing worksheet"
      />
    </>
  );
}
