'use client';

import { useMemo, useState } from 'react';
import WorksheetControls, { type WorksheetOptions } from './WorksheetControls';
import WorksheetPreview from './WorksheetPreview';
import DownloadModal from './DownloadModal';
import { useWorksheet, parseLines, toSlug } from './useWorksheet';

const PLACEHOLDER = `The quick brown fox
jumps over the lazy dog`;

/**
 * Handwriting practice generator: turns any typed text into practice sheets,
 * one group of ruled rows per line. Powers /tools/handwriting and
 * /embed/handwriting.
 */
export default function HandwritingTool({
  defaultOptions,
  defaultText,
  embed = false,
}: {
  defaultOptions?: Partial<WorksheetOptions>;
  defaultText?: string;
  embed?: boolean;
}) {
  const [text, setText] = useState(defaultText ?? '');
  const [modalOpen, setModalOpen] = useState(false);
  const [options, setOptions] = useState<WorksheetOptions>({
    letterStyle: 'print',
    letterSize: 'medium',
    rowsPerLine: 3,
    showMidline: true,
    modelFirst: true,
    format: 'trace',
    ...defaultOptions,
  });

  const lines = useMemo(() => parseLines(text), [text]);
  const { pages, handleDownload } = useWorksheet({
    tool: 'handwriting',
    lines,
    options,
    filename: `${toSlug(lines[0] ?? '', 'handwriting')}-handwriting-practice`,
  });

  const inner = (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <div className="space-y-6">
        <div>
          <label
            htmlFor="handwriting-text"
            className="mb-1.5 block text-sm font-semibold text-forest-dark"
          >
            What should they practice?
          </label>
          <textarea
            id="handwriting-text"
            rows={5}
            maxLength={600}
            placeholder={PLACEHOLDER}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 bg-white px-5 py-3 text-base focus:border-forest focus:outline-2 focus:outline-forest/40"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            One line per line of practice. Up to 20 lines.
          </p>
        </div>

        <WorksheetControls
          options={options}
          onChange={setOptions}
          formats={['trace', 'trace-and-write']}
        />

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
        source="tool-handwriting"
        toolName="handwriting practice sheet"
      />
    </>
  );
}
