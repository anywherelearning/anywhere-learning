'use client';

import { useMemo, useState } from 'react';
import WorksheetControls, { type WorksheetOptions } from './WorksheetControls';
import WorksheetPreview from './WorksheetPreview';
import DownloadModal from './DownloadModal';
import { useWorksheet, parseWords } from './useWorksheet';

const PLACEHOLDER = `because
friend
enough
thought
straight`;

/**
 * Spelling list generator: this week's words as tracing practice, trace-then-write
 * practice, or a numbered blank test. Powers /tools/spelling and /embed/spelling.
 */
export default function SpellingTool({
  defaultOptions,
  embed = false,
}: {
  defaultOptions?: Partial<WorksheetOptions>;
  embed?: boolean;
}) {
  const [text, setText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [options, setOptions] = useState<WorksheetOptions>({
    letterStyle: 'print',
    letterSize: 'medium',
    rowsPerLine: 2,
    showMidline: true,
    modelFirst: true,
    format: 'trace-and-write',
    ...defaultOptions,
  });

  const words = useMemo(() => parseWords(text, 30), [text]);
  const { pages, handleDownload } = useWorksheet({
    tool: 'spelling',
    lines: words,
    options,
    filename:
      options.format === 'blank-test' ? 'spelling-test' : 'spelling-practice',
  });

  const inner = (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <div className="space-y-6">
        <div>
          <label
            htmlFor="spelling-words"
            className="mb-1.5 block text-sm font-semibold text-forest-dark"
          >
            This week&apos;s spelling words
          </label>
          <textarea
            id="spelling-words"
            rows={6}
            maxLength={600}
            placeholder={PLACEHOLDER}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 bg-white px-5 py-3 text-base focus:border-forest focus:outline-2 focus:outline-forest/40"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            One word per line, or separate them with commas. Up to 30 words.
          </p>
        </div>

        <WorksheetControls
          options={options}
          onChange={setOptions}
          maxRows={4}
          formats={['trace', 'trace-and-write', 'blank-test']}
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
        source="tool-spelling"
        toolName="spelling worksheet"
      />
    </>
  );
}
