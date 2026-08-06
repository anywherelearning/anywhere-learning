'use client';

import { useMemo, useState } from 'react';
import { DOLCH_LISTS, FRY_LISTS, getWordList } from '@/lib/tools/word-lists';
import WorksheetControls, { type WorksheetOptions } from './WorksheetControls';
import WorksheetPreview from './WorksheetPreview';
import DownloadModal from './DownloadModal';
import { useWorksheet, parseWords, toSlug } from './useWorksheet';

const CUSTOM = 'custom';

/**
 * Sight words generator: pick a standard Dolch or Fry list (or type your own)
 * and print it as practice rows. Powers /tools/sight-words, its grade
 * variation pages, and /embed/sight-words.
 */
export default function SightWordsTool({
  defaultOptions,
  /** Word list preloaded by the grade variation pages. */
  defaultListId,
  embed = false,
}: {
  defaultOptions?: Partial<WorksheetOptions>;
  defaultListId?: string;
  embed?: boolean;
}) {
  const initialList = defaultListId ? getWordList(defaultListId) : undefined;

  const [listId, setListId] = useState(initialList?.id ?? DOLCH_LISTS[0].id);
  const [text, setText] = useState(
    (initialList ?? DOLCH_LISTS[0]).words.join('\n'),
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [options, setOptions] = useState<WorksheetOptions>({
    letterStyle: 'print',
    letterSize: 'medium',
    rowsPerLine: 2,
    showMidline: true,
    modelFirst: true,
    format: 'trace',
    ...defaultOptions,
  });

  function handleListChange(id: string) {
    setListId(id);
    const list = getWordList(id);
    if (list) setText(list.words.join('\n'));
    else setText('');
  }

  const words = useMemo(() => parseWords(text, 60), [text]);
  const { pages, handleDownload } = useWorksheet({
    tool: 'sight-words',
    lines: words,
    options,
    filename: `${toSlug(getWordList(listId)?.label ?? 'sight-words', 'sight-words')}-practice`,
  });

  const inner = (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <div className="space-y-6">
        <div>
          <label
            htmlFor="sight-words-list"
            className="mb-1.5 block text-sm font-semibold text-forest-dark"
          >
            Word list
          </label>
          <select
            id="sight-words-list"
            value={listId}
            onChange={(e) => handleListChange(e.target.value)}
            className="w-full rounded-full border border-gray-300 bg-white px-5 py-3 text-base focus:border-forest focus:outline-2 focus:outline-forest/40"
          >
            <optgroup label="Dolch">
              {DOLCH_LISTS.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.label} ({list.words.length} words)
                </option>
              ))}
            </optgroup>
            <optgroup label="Fry">
              {FRY_LISTS.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.label} ({list.words.length} words)
                </option>
              ))}
            </optgroup>
            <option value={CUSTOM}>My own words</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="sight-words-text"
            className="mb-1.5 block text-sm font-semibold text-forest-dark"
          >
            Words on the sheet
          </label>
          <textarea
            id="sight-words-text"
            rows={6}
            maxLength={1200}
            placeholder="the&#10;and&#10;said"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setListId(CUSTOM);
            }}
            className="w-full rounded-2xl border border-gray-300 bg-white px-5 py-3 text-base focus:border-forest focus:outline-2 focus:outline-forest/40"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            Edit freely. Delete the ones they already know. Up to 60 words.
          </p>
        </div>

        <WorksheetControls
          options={options}
          onChange={setOptions}
          maxRows={5}
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
        source="tool-sight-words"
        toolName="sight words worksheet"
      />
    </>
  );
}
